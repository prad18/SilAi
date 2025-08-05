from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import StreamingHttpResponse
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
from langchain.chains import LLMChain
import json
import time

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
        is_streaming = request.data.get('streaming', False)  # Add streaming parameter
        chat_history = []

        if not user_input:
            if is_streaming:
                def error_stream():
                    yield f"data: {json.dumps({'error': 'Message is required'})}\n\n"
                return StreamingHttpResponse(error_stream(), content_type='text/plain')
            else:
                return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)

        if user_input.strip().lower() in ["thanks", "thank you", "ok", "okay", "cool", "hmm"]:
            response_text = "You're welcome!"
            if is_streaming:
                def quick_response_stream():
                    yield f"data: {json.dumps({'content': response_text, 'done': True, 'session_id': session_id})}\n\n"
                return StreamingHttpResponse(quick_response_stream(), content_type='text/plain')
            else:
                return Response({
                    'response': response_text,
                    'session_id': session_id
                })

        if len(user_input.strip()) < 4:
            response_text = "Could you please rephrase your question?"
            if is_streaming:
                def rephrase_stream():
                    yield f"data: {json.dumps({'content': response_text, 'done': True, 'session_id': session_id})}\n\n"
                return StreamingHttpResponse(rephrase_stream(), content_type='text/plain')
            else:
                return Response({
                    'response': response_text,
                    'session_id': session_id
                })

        if is_streaming:
            return self._handle_streaming_chat(request, leader, user_input, session_id)
        else:
            return self._handle_regular_chat(request, leader, user_input, session_id)

    def _handle_regular_chat(self, request, leader, user_input, session_id):
        """Handle regular non-streaming chat"""
        try:
            # Load the FAISS index
            pkl_path = os.path.join(settings.MEDIA_ROOT, leader.pkl_file_path)
            if not os.path.exists(pkl_path):
                return Response(
                    {'error': 'Leader knowledge base not found. Please ensure the PDF has been processed.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            with open(pkl_path, 'rb') as f:
                db = pickle.load(f)

            # Initialize LLM (no streaming for regular chat)
            try:
                llm = Ollama(model="qwen2.5", base_url="http://localhost:11434")
            except Exception as e:
                return Response(
                    {'error': 'Failed to connect to Ollama. Please ensure Ollama is running with qwen2.5 model.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            # Prompt template
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

            # Chain setup
            document_chain = create_stuff_documents_chain(llm, prompt)
            retriever = db.as_retriever(search_kwargs={"k": 3})
            retrieval_chain = create_retrieval_chain(retriever, document_chain)

            # Run chain
            response = retrieval_chain.invoke({"input": user_input})
            ai_response = response.get("answer") or response.get("output") or str(response)
            sources = response.get("context", [])

            # Format citations
            citations = []
            for doc in sources:
                meta = doc.metadata
                page = meta.get('page', 'Unknown')
                full_path = meta.get('source')
                source_filename = os.path.basename(full_path) if full_path else 'PDF'
                citations.append(f"{source_filename}, page {page}")

            citations_text = "\nCitations:\n" + "\n".join(set(citations)) if citations else ""
            full_response = f"{ai_response}{citations_text}"

            # Save to DB
            chat = Chat.objects.create(
                user=request.user,
                leader=leader,
                user_input=user_input,
                ai_response=full_response,
                session_id=session_id
            )

            return Response({
                'response': full_response,
                'session_id': session_id,
                'chat_id': chat.id
            })

        except Exception as e:
            print(f"Error in chat endpoint: {str(e)}")
            return Response(
                {'error': f'An error occurred while processing your message: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _handle_streaming_chat(self, request, leader, user_input, session_id):
        """Handle streaming chat"""
        def generate_streaming_response():
            try:
                # Load the FAISS index
                pkl_path = os.path.join(settings.MEDIA_ROOT, leader.pkl_file_path)
                if not os.path.exists(pkl_path):
                    yield f"data: {json.dumps({'error': 'Leader knowledge base not found. Please ensure the PDF has been processed.'})}\n\n"
                    return

                with open(pkl_path, 'rb') as f:
                    db = pickle.load(f)

                # Initialize LLM with streaming enabled
                try:
                    llm = Ollama(
                        model="qwen2.5", 
                        base_url="http://localhost:11434"
                    )
                except Exception as e:
                    yield f"data: {json.dumps({'error': 'Failed to connect to Ollama. Please ensure Ollama is running with qwen2.5 model.'})}\n\n"
                    return

                # Prompt template
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

                # Chain setup
                document_chain = create_stuff_documents_chain(llm, prompt)
                retriever = db.as_retriever(search_kwargs={"k": 3})
                retrieval_chain = create_retrieval_chain(retriever, document_chain)

                # Stream the response using native Ollama streaming
                full_response = ""
                sources = []
                
                # Use streaming invoke for real-time token generation
                for chunk in retrieval_chain.stream({"input": user_input}):
                    if 'answer' in chunk and chunk['answer']:
                        token = chunk['answer']
                        full_response += token
                        
                        # Send each token as it arrives from Ollama
                        chunk_data = {
                            'content': full_response,
                            'done': False,
                            'session_id': session_id
                        }
                        yield f"data: {json.dumps(chunk_data)}\n\n"
                    
                    # Collect context/sources for citations
                    if 'context' in chunk:
                        sources = chunk['context']

                # Format citations after streaming is complete
                citations = []
                for doc in sources:
                    meta = doc.metadata
                    page = meta.get('page', 'Unknown')
                    full_path = meta.get('source')
                    source_filename = os.path.basename(full_path) if full_path else 'PDF'
                    citations.append(f"{source_filename}, page {page}")

                citations_text = "\nCitations:\n" + "\n".join(set(citations)) if citations else ""
                final_response = f"{full_response}{citations_text}"

                # Send final response with citations
                final_data = {
                    'content': final_response,
                    'done': True,
                    'session_id': session_id
                }
                yield f"data: {json.dumps(final_data)}\n\n"

                # Save to DB
                try:
                    Chat.objects.create(
                        user=request.user,
                        leader=leader,
                        user_input=user_input,
                        ai_response=final_response,
                        session_id=session_id
                    )
                except Exception as db_error:
                    print(f"Error saving chat to DB: {str(db_error)}")

            except Exception as e:
                print(f"Error in streaming chat endpoint: {str(e)}")
                yield f"data: {json.dumps({'error': f'An error occurred while processing your message: {str(e)}'})}\n\n"

        return StreamingHttpResponse(generate_streaming_response(), content_type='text/plain')

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

    @action(detail=True, methods=['post'])
    def suggestions(self, request, pk=None):
        """Generate AI-powered suggested questions based on the current chat context"""
        leader = self.get_object()
        latest_user_message = request.data.get('latest_user_message', '')
        
        if not latest_user_message:
            return Response({'error': 'latest_user_message is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Load the FAISS index
            pkl_path = os.path.join(settings.MEDIA_ROOT, leader.pkl_file_path)
            if not os.path.exists(pkl_path):
                return Response(
                    {'error': 'Leader knowledge base not found. Please ensure the PDF has been processed.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            with open(pkl_path, 'rb') as f:
                db = pickle.load(f)

            # Initialize LLM
            try:
                llm = Ollama(model="qwen2.5", base_url="http://localhost:11434")
            except Exception as e:
                return Response(
                    {'error': 'Failed to connect to Ollama. Please ensure Ollama is running with qwen2.5 model.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            # Retrieve relevant documents for the latest message
            retriever = db.as_retriever(search_kwargs={"k": 3})
            relevant_docs = retriever.get_relevant_documents(latest_user_message)
            
            # Extract context from relevant documents
            context = "\n".join([doc.page_content for doc in relevant_docs[:3]])

            # Prompt template for generating suggestions
            suggestion_prompt = ChatPromptTemplate.from_template("""Based on the user's latest message and the provided context about the historical figure, generate 2-3 helpful follow-up questions that would naturally continue the conversation.

The questions should:
- Be directly related to the historical figure and context
- Build upon the user's current inquiry
- Be specific and engaging
- Help users explore different aspects of the figure's life, work, or impact

Context about the historical figure:
{context}

User's latest message: {latest_user_message}

Generate exactly 2-3 follow-up questions, one per line, without numbering or bullet points:""")

            # Create LLM chain for suggestions
            suggestion_chain = LLMChain(llm=llm, prompt=suggestion_prompt)
            
            # Generate suggestions
            result = suggestion_chain.run(
                context=context,
                latest_user_message=latest_user_message
            )
            
            # Parse the suggestions (split by newlines and clean up)
            suggestions = [
                line.strip() 
                for line in result.strip().split('\n') 
                if line.strip() and not line.strip().startswith(('-', '*', '•'))
            ]
            
            # Ensure we have 2-3 suggestions
            suggestions = suggestions[:3]  # Limit to max 3
            
            # Fallback suggestions if AI didn't generate proper ones
            if len(suggestions) < 2:
                suggestions = [
                    f"What were {leader.name}'s major achievements?",
                    f"How did {leader.name} influence their era?",
                    f"What challenges did {leader.name} face?"
                ]

            return Response({
                'suggestions': suggestions
            })

        except Exception as e:
            print(f"Error in suggestions endpoint: {str(e)}")
            return Response(
                {'error': f'An error occurred while generating suggestions: {str(e)}'},
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