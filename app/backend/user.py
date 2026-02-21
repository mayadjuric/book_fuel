from dataclass import dataclass

@dataclass
class User:
    user_id: int
    username: str
    study_year: str
    total_burnout: int | None

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




        

    

