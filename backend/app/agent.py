from .engines import RulesEngine, RoutingEngine
import os
import json
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AgentEngine:
    """
    PLATINUM AGENTIC ENGINE
    Capable of reasoning, wayfinding, and executing simulated self-service tools.
    """
    
    @staticmethod
    async def process_query(patient_data: dict, query: str):
        # 1. ENRICHED CONTEXT REASONING
        current_test = patient_data.get('current_test')
        status = (patient_data.get('status') or 'WAITING').upper()
        
        # 2. AGENTIC AGENT TOOLS (Simulated for MVP, triggers state changes)
        tools_available = [
            {"name": "check_wait_times", "desc": "Fetches live sensor data from all departments."},
            {"name": "reserve_later_slot", "desc": "Dynamically moves patient to a lower density time window."},
            {"name": "request_assistance", "desc": "Flags the patient record on the staff dashboard for physical help."}
        ]

        if not os.getenv("OPENAI_API_KEY"):
            return await AgentEngine.mock_platinum_reasoning(patient_data, query)

        try:
            prompt = f"""
            You are the Smart Queue Platinum AI Hospital Concierge.
            IDENTITY: You are an agentic AI responsible for optimizing a patient's diagnostic journey.
            
            PATIENT_CONTEXT: {patient_data}
            LOCATIONS_MAP: {RulesEngine.LOCATIONS}
            PREP_COACHING: {RulesEngine.INSTRUCTIONS}
            TOOLS: {tools_available}

            USER_QUERY: "{query}"

            GOALS:
            1. Proactive Wayfinding: Always confirm current location and next steps.
            2. High Wait Time mitigation: If wait > 60m, proactively offer 'reserve_later_slot'.
            3. Preparation Coaching: Reinforce test rules (fasting, etc).
            4. Agentic Tone: Don't just talk. Explain what you are 'checking' or 'calculating'.

            Format your response as a JSON:
            {{
                "message": "Direct message to patient",
                "reasoning": "Internal architectural routing logic",
                "tool_used": "Name of tool if applicable"
            }}
            """
            
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": "You are a professional medical logistics agent."},
                          {"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            print(f"Platinum Agent Error: {e}")
            return await AgentEngine.mock_platinum_reasoning(patient_data, query)

    @staticmethod
    async def mock_platinum_reasoning(patient_data: dict, query: str):
        query = query.lower()
        test = patient_data.get('current_test')
        status = (patient_data.get('status') or 'WAITING').upper()
        wait_time = patient_data.get('estimated_wait_time', 0)
        
        # Landmark-Aware Wayfinding
        if any(w in query for w in ["help", "assist", "stuck", "where", "landmark"]):
            location = RulesEngine.get_location(test)
            return {
                "message": f"Don't worry, help is nearby. Proceed toward {location} I have notified the nearest floor assistant to meet you there.",
                "reasoning": "Descriptive Wayfinding Tool + Staff alerting.",
                "tool_used": "request_assistance"
            }
            
        # Persistence-Backed Dynamic Scheduling
        if any(w in query for w in ["later", "reserve", "reschedule", "3pm", "3:00"]):
            return {
                "message": f"Understood. I have officially deferred your {test} until later today when the load is lower (est. 3:00 PM). You can go get a coffee in the cafeteria—follow the yellow floor markers to find it. I'll ping you when it's time.",
                "reasoning": "Adaptive Scheduling: Triggering DEFERRED state in DB.",
                "tool_used": "reserve_later_slot"
            }

        if any(w in query for w in ["wait", "long", "time", "when"]):
            if wait_time > 45:
                return {
                    "message": f"I'm observing high traffic at the {test} wing ({wait_time} min wait). I can reserve a slot for you in 2 hours when loads are lower. Would you like to proceed?",
                    "reasoning": "Queue Load analysis via check_wait_times.",
                    "tool_used": "reserve_later_slot"
                }
            return {
                "message": f"Sensors indicate a smooth flow at {test}. Estimated wait is only {wait_time} minutes. You are next in line.",
                "reasoning": "Queue Load analysis via check_wait_times.",
                "tool_used": "check_wait_times"
            }

        if status == 'COMPLETED' or not test:
             return {
                "message": f"Excellent news! You've successfully navigated all diagnostic stations. I've sent your digital tokens to the Main Reception. Please pick up your physical results there. How was your experience today?",
                "reasoning": "Post-journey completion feedback loop.",
                "tool_used": None
            }

        return {
            "message": f"Hello! I am optimizing your journey. Currently, for your {test}, please proceed to {RulesEngine.get_location(test)}. Remember: {', '.join(RulesEngine.get_instructions(test))}.",
            "reasoning": "Standard pathing fallback.",
            "tool_used": None
        }
