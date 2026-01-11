"""
AI Chat Backend Endpoint
Real Gemini API integration for multi-turn conversation
IMPROVEMENT: Backend AI Integration
"""

from fastapi import HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import google.generativeai as genai

# Chat request/response models
class ChatMessage(BaseModel):
    role: str  # 'user' or 'model'
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: List[Dict] = []
    context: Optional[Dict] = None

class ChatResponse(BaseModel):
    response: str
    ambiguities: List[Dict] = []
    clarification_needed: bool = False
    suggested_prompts: List[str] = []

# Ambiguity detection
def detect_prompt_ambiguities(prompt: str, context: Dict = None) -> List[Dict]:
    """
    Detect ambiguities in user prompts that need clarification
    """
    ambiguities = []
    prompt_lower = prompt.lower()
    
    # Check for assembly without orientation
    if any(word in prompt_lower for word in ['shaft', 'rod', 'pole']) and \
       any(word in prompt_lower for word in ['gear', 'wheel', 'disk']) and \
       not any(word in prompt_lower for word in ['vertical', 'horizontal', 'upright']):
        ambiguities.append({
            'type': 'orientation',
            'question': 'How should the shaft be oriented relative to the gear?',
            'options': [
                'Vertical (shaft stands upright through gear center)',
                'Horizontal (shaft lies flat through gear)',
                'At an angle (specify degrees)'
            ],
            'importance': 'high'
        })
    
    # Check for missing dimensions
    if any(word in prompt_lower for word in ['box', 'cube', 'block']) and \
       not any(char in prompt for char in ['x', '×']) and \
       not all(word in prompt_lower for word in ['length', 'width', 'height']):
        ambiguities.append({
            'type': 'dimensions',
            'question': 'What dimensions would you like for the box?',
            'options': [
                'Standard cube (50x50x50mm)',
                'Thin plate (100x100x10mm)',
                'Custom dimensions (please specify)'
            ],
            'importance': 'critical'
        })
    
    # Check for hole placement
    if 'hole' in prompt_lower and \
       not any(word in prompt_lower for word in ['center', 'corner', 'edge', 'position']):
        ambiguities.append({
            'type': 'feature_placement',
            'question': 'Where should the hole be placed?',
            'options': [
                'Center of the part',
                'Corners (4 holes)',
                'Custom position (I will specify coordinates)'
            ],
            'importance': 'medium'
        })
    
    # Check for material specification
    if any(word in prompt_lower for word in ['strong', 'lightweight', 'durable']) and \
       context and not context.get('material'):
        ambiguities.append({
            'type': 'material',
            'question': 'What material are you planning to use?',
            'options': [
                'PLA (3D printing)',
                'ABS (stronger 3D printing)',
                'Aluminum (CNC machining)',
                'Steel (heavy duty)'
            ],
            'importance': 'low'
        })
    
    return ambiguities

# AI chat endpoint
@app.post("/ai/chat", response_model=ChatResponse)
async def ai_chat(request: ChatRequest):
    """
    Multi-turn AI conversation endpoint with ambiguity detection
    """
    try:
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Build conversation history for Gemini
        history = []
        for msg in request.conversation_history:
            history.append({
                'role': 'user' if msg['role'] == 'user' else 'model',
                'parts': [msg['content']]
            })
        
        # Start chat with history
        chat = model.start_chat(history=history)
        
        # Send user message
        response = await chat.send_message_async(request.message)
        response_text = response.text
        
        # Detect ambiguities in the user's latest message
        ambiguities = detect_prompt_ambiguities(request.message, request.context)
        
        # Generate suggested follow-up prompts
        suggested_prompts = []
        if 'gear' in request.message.lower():
            suggested_prompts = [
                "Add teeth count: e.g., '20 teeth'",
                "Specify thickness: e.g., '15mm thick'",
                "Add shaft diameter: e.g., '30mm shaft'"
            ]
        elif 'box' in request.message.lower():
            suggested_prompts = [
                "Add features: 'with center hole'",
                "Add fillets: 'with 2mm rounded corners'",
                "Specify material: 'for 3D printing in PLA'"
            ]
        
        return ChatResponse(
            response=response_text,
            ambiguities=ambiguities,
            clarification_needed=len(ambiguities) > 0,
            suggested_prompts=suggested_prompts
        )
        
    except Exception as e:
        print(f"AI Chat Error: {str(e)}")
        raise HTTPException(500, f"AI chat failed: {str(e)}")

# Enhanced generate endpoint with AI fallback
@app.post("/generate_with_ai")
async def generate_with_ai_assist(request: PromptRequest, response: Response):
    """
    Enhanced generation with AI assistance for ambiguous prompts
    """
    current_id = str(uuid.uuid4())[:8]
    
    try:
        # Step 1: Try standard parsing
        shape = EnhancedParser.detect_shape(request.text)
        dims = EnhancedParser.extract_dimensions_with_tolerance(request.text)
        
        # Step 2: Validate
        validation = EnhancedParser.validate_parsed_dimensions(dims, request.text)
        
        # Step 3: If validation fails or confidence is low, use AI
        if not validation['valid'] or len(validation['warnings']) > 2:
            print(f"[{current_id}] Low confidence, using AI assist...")
            
            # Call Gemini for better parsing
            model = genai.GenerativeModel('gemini-1.5-flash')
            ai_prompt = f"""
            Parse this CAD modeling request and extract exact dimensions:
            "{request.text}"
            
            Return JSON format:
            {{
                "shape": "box|cylinder|sphere|gear",
                "dimensions": {{
                    "length": number_in_mm,
                    "width": number_in_mm,
                    "height": number_in_mm
                }},
                "features": ["center_hole", "fillet_2mm", etc]
            }}
            """
            
            ai_response = await model.generate_content_async(ai_prompt)
            ai_text = ai_response.text
            
            # Parse AI response (extract JSON)
            import json
            import re
            json_match = re.search(r'\{.*\}', ai_text, re.DOTALL)
            if json_match:
                ai_data = json.loads(json_match.group())
                shape = ai_data.get('shape', shape)
                dims.update(ai_data.get('dimensions', {}))
        
        # Step 4: Continue with normal generation
        # ... (rest of generation logic from main.py)
        
    except Exception as e:
        raise HTTPException(500, str(e))
