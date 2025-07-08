from datetime import datetime

class Logger:
    def __init__(self):
        self.frames = []
        self.username = ""
        self.status = ""
        self.current_message = ""
        self.complete_message = ""
        self.start_viewing_time = ""
        self.end_viewing_time = ""
        self.receiver_total_viewing_time = ""
        self.start_sending_time = ""
        self.end_sending = ""
        self.sender_total_sending_time = ""
        self.chat_partner = ""  # DODAJ to pole


    def log_event(self, emotion_dict=None, name="", status="", start_viewing_time="", 
                  end_viewing_time="", receiver_total_viewing_time="", message="", 
                  start_sending_time="", end_sending="", sender_total_sending_time="", 
                  complete_message=""):
        if emotion_dict is None:
            emotion_dict = {}
        
        entry = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f"),
            "angry": emotion_dict.get("angry", ""),
            "disgust": emotion_dict.get("disgust", ""),
            "fear": emotion_dict.get("fear", ""),
            "happy": emotion_dict.get("happy", ""),
            "sad": emotion_dict.get("sad", ""),
            "surprise": emotion_dict.get("surprise", ""),
            "neutral": emotion_dict.get("neutral", ""),
            "name": name or self.username,
            "status": status,
            "start viewing time": start_viewing_time,
            "end viewing time": end_viewing_time,
            "receiver total viewing time": receiver_total_viewing_time,
            "message": message,
            "start sending time": start_sending_time,
            "end sending": end_sending,
            "sender total sending time": sender_total_sending_time,
            "complete message": complete_message
        }
        
        self.frames.append(entry)
        print(f"Logged: {self.username} - {status} - {message[:20]}...")

    def set_chat_partner(self, partner_name):
        """Ustaw partnera dla nazwy pliku"""
        self.chat_partner = partner_name
        
    def save_to_excel(self):
        if not self.username:
            return None
            
        if not self.frames:
            return None
            
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        
        # Użyj chat_partner w nazwie pliku
        if self.chat_partner:
            filename = f"{self.username}_{self.chat_partner}_{timestamp}.xlsx"
        else:
            filename = f"{self.username}_{timestamp}.xlsx"
            
        import pandas as pd
        df = pd.DataFrame(self.frames)
        df.to_excel(filename, index=False)
        print(f"Saved log to {filename}")
        return filename