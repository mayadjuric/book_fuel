from services.evaluation_services import get_evaluation_by_id

assignment_type_weight_dict = {
    "assignment": 1.0,
    "exam": 2.0,
    "project": 1.5,
    "reading": 0.5
}

def calculate_evaluation_burnout(evaluation_id):
    evaluation = get_evaluation_by_id(evaluation_id)
    if not evaluation:
        return None

    # Extract evaluation attributes
    type_ = evaluation[0].get("type_", "assignment")
    type_ = type_.lower()
    type_weight = assignment_type_weight_dict.get(type_, 1.0) # Default to 1.0 for unknown types
    difficulty = evaluation[0].get("difficulty", 0) * 2


    # Calculate burnout points based on the attributes
    burnout_weight = int(difficulty * type_weight)
    return burnout_weight