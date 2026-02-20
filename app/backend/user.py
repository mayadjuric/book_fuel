
class User:
    user_id_counter = 1
    def __init__(self, username, study_year, total_burnout):
        self.u_id = User.user_id_counter
        User.user_id_counter += 1
        self.username = username
        self.study_year = study_year
        self.total_burnout = total_burnout


    def get_user_id(self):
        return self.u_id

    def get_username(self):
        return self.username
    
    def get_study_year(self):
        return self.study_year
    
    def get_total_burnout(self):
        return self.total_burnout
    
    def get_user_info(self):
        return {
            "username": self.username,
            "study_year": self.study_year,
            "total_burnout": self.total_burnout
        }




        

    

