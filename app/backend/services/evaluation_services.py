from config import supabase

def get_evaluation_by_id(evaluation_id: str):
    response = supabase.table("Evaluations").select("*").eq("assignment_id", evaluation_id).execute()
    return response.data