from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Leader, Chat
from .serializers import LeaderSerializer, ChatSerializer
from rest_framework.permissions import IsAuthenticated
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
            with open(pkl_path, 'rb') as f:
                db = pickle.load(f)

            # Initialize Ollama LLM
            llm = Ollama(model="llama2", base_url="http://localhost:11434")

            # Create prompt template
            prompt = ChatPromptTemplate.from_template("""
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
                "input": user_input
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
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def chat_history(self, request, pk=None):
        leader = self.get_object()
        session_id = request.query_params.get('session_id')
        
        if not session_id:
            return Response({'error': 'Session ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        chats = Chat.objects.filter(leader=leader, session_id=session_id)
        serializer = ChatSerializer(chats, many=True)
        return Response(serializer.data)

class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer

    def get_queryset(self):
        session_id = self.request.query_params.get('session_id')
        if session_id:
            return Chat.objects.filter(session_id=session_id)
        return Chat.objects.none()