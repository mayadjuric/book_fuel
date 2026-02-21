from services.user_services import get_user_by_id
from config import supabase
year_weight_dict = {
    1: 1.5,
    2: 1.2,
    3: 1.0,
    4: 1.2
}

def calculate_burnout_points(user_id):
    user = get_user_by_id(user_id)
    if not user:
        return None

    # Extract user attributes
    study_year = user[0].get("year_of_study", 0)
    number_of_courses = user[0].get("number_of_courses", 0)
    work_hours_per_week = user[0].get("work_hours_per_week", 0)
    commute_time_per_day = user[0].get("commute_time_per_day", 0)
    student_athlete_flag = user[0].get("student_athlete_flag", False)

    # Calculate burnout points based on the attributes
    baseline_points = number_of_courses * 10 # Each course contributes 10 points
    year_weight = year_weight_dict.get(study_year, 1.0) # 1.0 for unknown years
    athlete_penalty = 0.15 if student_athlete_flag else 0.0 # Athletes
    work_pct = (work_hours_per_week / 40) / 2 # Max of 50%
    commute_pct = (commute_time_per_day / 120) * 0.07 # Max of 7%

    burnout_points = baseline_points * year_weight - ((baseline_points * year_weight) * (athlete_penalty + work_pct + commute_pct))
    return burnout_points