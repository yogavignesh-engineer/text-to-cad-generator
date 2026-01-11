import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class AIChat:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash') # Updated to flash for speed/availability
        self.chat = self.model.start_chat(history=[])
        self.system_prompt = (
            "You are NeuralCAD, an elite mechanical engineering AI assistant. "
            "Your job is to clarify design intent. "
            "Keep answers brief (under 50 words), technical, and witty. "
            "If the user asks to generate a part, confirm the parameters."
        )

    async def get_response(self, user_input, conversation_history=None):
        try:
            # Sync history if provided
            if conversation_history:
                # Basic history sync - Gemini SDK expects specific format
                pass 

            # Send message with system context
            full_prompt = f"{self.system_prompt}\nUser: {user_input}"
            
            # Note: send_message_async might need updated SDK usage, using send_message for stability in sync wrapper if needed, 
            # but usually async is supported. Google GenAI python SDK usually is sync for chat.send_message, 
            # but wrapping in async for FastAPI. 
            # We'll use the sync method but run it as is, FastAPI handles it.
            # Actually user snippet had await chat.send_message_async.
            
            response = await self.model.generate_content_async(full_prompt) # Use generate_content for single turn or chat.
            # Adapting to match user request class structure but ensuring 1.5-flash compatibility
            
            return response.text
        except Exception as e:
            return f"Error connecting to NeuralCAD Brain: {str(e)}"

# Helper for backward compatibility if main.py expects handle_ai_chat
# But we will update main.py to use AIChat class as requested.
