class Evaluations:
    def __init__(self, u_id, a_id, start_date, due_date, name, type, burnout_weight):
        self.u_id = u_id
        self.a_id = a_id
        self.start_date = start_date
        self.due_date = due_date
        self.name = name
        self.type = type
        self.burnout_weight = burnout_weight

    def get_assigment_name(self):
        return self.name
    
    def get_assignment_id(self):
        return self.a_id
    
    def get_burnout_weight(self):
        return self.burnout_weight