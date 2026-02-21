from config import supabase

def get_user_by_id(user_id: str):
    response = supabase.table("User").select("*").eq("id", user_id).execute()
    return response.data