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
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
import uuid

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

            # Get chat history for context
            chat_history = Chat.objects.filter(
                leader=leader,
                session_id=session_id
            ).order_by('timestamp')[:5]  # Get last 5 exchanges for context

            # Create context from chat history
            context = "\n".join([
                f"User: {chat.user_input}\nAssistant: {chat.ai_response}"
                for chat in chat_history
            ])

            # Create prompt template with chat history
            prompt = ChatPromptTemplate.from_template("""
            Previous conversation:
            {chat_history}

            Answer the following question based **only** on the provided context.  
            If the context **does not contain relevant information**, respond with **"I don't have enough information to answer this."**  

            Provide a **concise and factual** response, avoiding unnecessary details.

            <context>  
            {context}  
            </context>  

            Question: {input}  
            """)

            # Create document chain
            document_chain = create_stuff_documents_chain(llm, prompt)

            # Initialize retriever
            retriever = db.as_retriever()

            # Create retrieval chain
            retrieval_chain = create_retrieval_chain(retriever, document_chain)

            # Get response
            response = retrieval_chain.invoke({
                "input": user_input,
                "chat_history": context
            })

            ai_response = response['answer']

            # Save chat to database
            chat = Chat.objects.create(
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
        leader = self.get_object()
        session_id = request.query_params.get('session_id')
        
        if not session_id:
            return Response({'error': 'Session ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        chats = Chat.objects.filter(leader=leader, session_id=session_id).order_by('timestamp')
        serializer = ChatSerializer(chats, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def clear_chat(self, request, pk=None):
        leader = self.get_object()
        session_id = request.query_params.get('session_id')
        
        if not session_id:
            return Response({'error': 'Session ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Delete all chats for this session
            Chat.objects.filter(leader=leader, session_id=session_id).delete()
            return Response({'message': 'Chat history cleared successfully'})
        except Exception as e:
            return Response(
                {'error': f'Failed to clear chat history: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        session_id = self.request.query_params.get('session_id')
        if session_id:
            return Chat.objects.filter(session_id=session_id)
        return Chat.objects.none()