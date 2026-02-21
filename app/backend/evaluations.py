from dataclass import dataclass

@dataclass
class Evaluations:
    user_id: int
    assignment_id: int
    start_date: str
    due_date: str
    name: str
    type_: str
    burnout_weight: float

    def get_assigment_name(self):
        return self.name
    
    def get_assignment_id(self):
        return self.a_id
    
    def get_burnout_weight(self):
        return self.burnout_weight

    def serialize(self):
        return {
            "user_id": self.user_id,
            "assignment_id": self.assignment_id,
            "start_date": self.start_date,
            "due_date": self.due_date,
            "name": self.name,
            "type_": self.type_,
            "burnout_weight": self.burnout_weight
        }