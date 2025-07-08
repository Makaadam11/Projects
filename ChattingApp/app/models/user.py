class User:
    def __init__(self, user_id, username):
        self.user_id = user_id
        self.username = username
        self.partner_id = None
        self.partner_name = None
        self.is_recording = False
        self.current_message = ""
    
    def set_partner(self, partner_id, partner_name):
        self.partner_id = partner_id
        self.partner_name = partner_name
    
    def start_recording(self):
        self.is_recording = True
    
    def stop_recording(self):
        self.is_recording = False