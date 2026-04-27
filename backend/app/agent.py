from .engines import RulesEngine
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class AgentEngine:
    @staticmethod
    async def process_query(patient_data: dict, query: str):
        # If no API key, fallback to local reasoning
        if not os.getenv("OPENAI_API_KEY"):
            return await AgentEngine.mock_reasoning(patient_data, query)

        try:
            prompt = f"""
            You are a senior hospital concierge assistant.
            Patient Data: {patient_data}
            Current Query: {query}
            
            Rules: {RulesEngine.INSTRUCTIONS}
            Locations: {RulesEngine.LOCATIONS}
            
            Based on the patient's current test, provide a helpful response.
            1. Proactive Wayfinding: Tell them exactly where to go using the Locations map.
            2. Adaptive Scheduling: If patient_data['adaptive_scheduling_needed'] is true, ask if they'd like to reserve a time for later instead of waiting.
            3. Feedback: If patient_data['current_test'] is None or 'COMPLETED', ALWAYS ask "You're all done! Mind sharing how it went today?".
            4. Preparation Coaching: Remind them of the specific Rules for their test.
            
            Format your response as a JSON with two fields:
            "message": The text to the patient.
            "reasoning": Your internal architectural logic for this decision.
            """
            
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "system", "content": "You are a professional medical workflow assistant."},
                          {"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            
            import json
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            print(f"Agent Error: {e}")
            return await AgentEngine.mock_reasoning(patient_data, query)

    @staticmethod
    async def mock_reasoning(patient_data: dict, query: str):
        query = query.lower()
        test = patient_data.get('current_test')
        wait_time = patient_data.get('estimated_wait_time', 0)
        status = patient_data.get('status')
        
        if status == 'COMPLETED' or not test:
            return {"message": "You're all done! Quick question — how was the experience today? (Reply with rating 1-5)", "reasoning": "Journey completed. Triggering feedback."}
            
        location = RulesEngine.LOCATIONS.get(test, 'the waiting room')
        instructions = " ".join(RulesEngine.get_instructions(test))
        
        if patient_data.get('adaptive_scheduling_needed'):
             return {
                 "message": f"Your next station {test} at {location} has a {wait_time} min wait. It's heavily loaded. Would you like to reserve a time for later?", 
                 "reasoning": "Adaptive scheduling threshold reached."
             }

        if any(w in query for w in ["status", "when", "next", "where"]):
            msg = f"Your next test is {test} located at {location}. Estimated wait: {wait_time} mins. Remember to: {instructions}."
            reasoning = "Fetched from local QueueManager with Wayfinding and Prep Coaching."
            return {"message": msg, "reasoning": reasoning}
            
        return {"message": f"I'm your AI Hospital Assistant. Go to {location} for your {test}.", "reasoning": "Fallback reasoning active with Proactive Wayfinding."}
