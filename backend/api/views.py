from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Leader, Chat
from .serializers import LeaderSerializer, ChatSerializer
import pickle
import os
from django.conf import settings
from langchain_community.llms import Ollama
import uuid
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain

class LeaderList(generics.ListAPIView):
    queryset = Leader.objects.all()
    serializer_class = LeaderSerializer
    permission_classes = [IsAuthenticated]

class LeaderViewSet(viewsets.ModelViewSet):
    queryset = Leader.objects.all()
    serializer_class = LeaderSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def chat(self, request, pk=None):
        leader = self.get_object()
        user_input = request.data.get('message')
        session_id = request.data.get('session_id', str(uuid.uuid4()))

        if not user_input:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        if user_input.strip().lower() in ["thanks", "thank you", "ok", "okay", "cool", "hmm"]:
            return Response({
                'response': "You're welcome!",
                'session_id': session_id
            })

        if len(user_input.strip()) < 4:
            return Response({
                'response': "Could you please rephrase your question?",
                'session_id': session_id
            })

        try:
            # Load the FAISS index from pickle file
            pkl_path = os.path.join(settings.MEDIA_ROOT, leader.pkl_file_path)
            if not os.path.exists(pkl_path):
                return Response(
                    {'error': 'Leader knowledge base not found. Please ensure the PDF has been processed.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            with open(pkl_path, 'rb') as f:
                db = pickle.load(f)

            # Initialize Ollama LLM
            try:
                llm = Ollama(model="llama2", base_url="http://localhost:11434")
            except Exception as e:
                return Response(
                    {'error': 'Failed to connect to Ollama. Please ensure Ollama is running with llama2 model.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            # Create prompt template - enhanced with guard clauses
            prompt = ChatPromptTemplate.from_template("""You are a helpful assistant. Answer based ONLY on the context provided.

RULES:
- If the input is a polite message like 'thank you', respond politely and briefly.
- If the question is unclear or too short, ask the user to rephrase.
- Do NOT answer unrelated or hallucinated questions.
- Only answer what's directly asked.
- Do NOT list multiple Q&As unless explicitly asked.

CONTEXT:
{context}

Question: {input}
Answer:
""")

            # Create document chain
            document_chain = create_stuff_documents_chain(llm, prompt)

            # Initialize retriever with limit to avoid irrelevant chunks
            retriever = db.as_retriever(search_kwargs={"k": 3})

            # Create retrieval chain
            retrieval_chain = create_retrieval_chain(retriever, document_chain)

            # Get response
            response = retrieval_chain.invoke({"input": user_input})
            ai_response = response.get("answer") or response.get("output") or str(response)

            # Save chat to database
            chat = Chat.objects.create(
                user=request.user,
                leader=leader,
                user_input=user_input,
                ai_response=ai_response,
                session_id=session_id
            )

            return Response({
                'response': ai_response,
                'session_id': session_id,
                'chat_id': chat.id
            })

        except Exception as e:
            print(f"Error in chat endpoint: {str(e)}")
            return Response(
                {'error': f'An error occurred while processing your message: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def chat_history(self, request, pk=None):
        try:
            leader = self.get_object()
            session_id = request.query_params.get('session_id')

            if not session_id:
                return Response({'error': 'session_id is required'}, status=status.HTTP_400_BAD_REQUEST)

            chats = Chat.objects.filter(
                leader=leader,
                session_id=session_id,
                user=request.user
            ).order_by('timestamp') 

            serializer = ChatSerializer(chats, many=True)
            return Response(serializer.data)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def clear_chat(self, request, pk=None):
        try:
            leader = self.get_object()
            session_id = request.data.get('session_id')

            if not session_id:
                return Response(
                    {'error': 'session_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Delete chats for this user, leader, and session
            deleted_count = Chat.objects.filter(
                leader=leader,
                user=request.user,
                session_id=session_id
            ).delete()[0]

            return Response({
                'message': f'Successfully cleared {deleted_count} chat messages',
                'deleted_count': deleted_count
            })

        except Exception as e:
            print(f"Error in clear_chat: {str(e)}")
            return Response(
                {'error': f'Failed to clear chat history: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.none()
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        session_id = self.request.query_params.get('session_id')
        if session_id:
            return Chat.objects.filter(session_id=session_id, user=self.request.user)
        return Chat.objects.none()