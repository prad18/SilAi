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
from langchain.llms import Ollama
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS

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
        try:
            leader = self.get_object()
            user_message = request.data.get('message', '')
            session_id = request.data.get('session_id')

            if not session_id:
                session_id = str(uuid.uuid4())

            # Get chat history (last 5 exchanges)
            chat_history = Chat.objects.filter(
                leader=leader,
                session_id=session_id
            ).order_by('-timestamp')[:10]

            # Create context from chat history
            context = ""
            if chat_history.exists():
                for chat in reversed(chat_history):
                    if chat.user_input:
                        context += f"User: {chat.user_input}\n"
                    if chat.ai_response:
                        context += f"Assistant: {chat.ai_response}\n"

            # Load the knowledge base if it exists
            if leader.pkl_file_path and os.path.exists(leader.pkl_file_path):
                with open(leader.pkl_file_path, 'rb') as f:
                    vectorstore = pickle.load(f)
                
                # Create prompt with context and knowledge base
                prompt = f"""You are {leader.name}. Use the following context from previous conversation and knowledge base to answer the question.

Previous conversation:
{context}

Knowledge base:
{vectorstore.similarity_search(user_message, k=3)}

User: {user_message}
Assistant:"""
            else:
                # If no knowledge base, just use the context
                prompt = f"""You are {leader.name}. Use the following context from previous conversation to answer the question.

Previous conversation:
{context}

User: {user_message}
Assistant:"""

            # Initialize Ollama
            llm = Ollama(model="llama2", base_url="http://localhost:11434")
            
            # Generate response
            response = llm(prompt)

            # Save the chat
            chat = Chat.objects.create(
                leader=leader,
                session_id=session_id,
                user_input=user_message,
                ai_response=response
            )

            return Response({
                'response': response,
                'session_id': session_id
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def chat_history(self, request, pk=None):
        try:
            leader = self.get_object()
            session_id = request.query_params.get('session_id')

            if not session_id:
                return Response(
                    {'error': 'session_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            chats = Chat.objects.filter(
                leader=leader,
                session_id=session_id
            ).order_by('timestamp')

            serializer = ChatSerializer(chats, many=True)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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

            Chat.objects.filter(
                leader=leader,
                session_id=session_id
            ).delete()

            return Response({'message': 'Chat history cleared successfully'})

        except Exception as e:
            return Response(
                {'error': str(e)},
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