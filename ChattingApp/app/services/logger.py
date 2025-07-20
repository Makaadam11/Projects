from datetime import datetime

class Logger:
    def __init__(self):
        self.frames = []
        self.status = ""
        self.username = ""
        self.chat_partner = ""
        self.user_id = ""
    
        self.columns = [
            'timestamp', 'user_id', 'username', 'status', 'message', 'complete_message',
            'start_sending_time', 'end_sending_time', 'sender_total_sending_time',
            'start_viewing_time', 'end_viewing_time', 'receiver_total_viewing_time',
            'event_type', 'action_by',
            
            'angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral',
            
            'sentiment_neg', 'sentiment_pos', 'sentiment_neu',
            
            'partner_name', 'partner_status', 'partner_message', 'partner_complete_message',
            'partner_start_sending_time', 'partner_end_sending_time', 'partner_sender_total_sending_time',
            'partner_start_viewing_time', 'partner_end_viewing_time', 'partner_receiver_total_viewing_time',
            'partner_event_type', 'partner_action_by',
            
            'partner_angry', 'partner_disgust', 'partner_fear', 'partner_happy', 
            'partner_sad', 'partner_surprise', 'partner_neutral',
            
            'partner_sentiment_neg', 'partner_sentiment_pos', 'partner_sentiment_neu'
        ]

    def log_event(self, emotion_dict=None, partner_data=None, **kwargs):
        """
        Loguje event z danymi własnymi i partnera
        """
        emotion_dict = emotion_dict or {}
        partner_data = partner_data or {}
        current_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
        
        # Przygotuj dane własne
        row_data = {
            
            # Wypełnij wszystkie kolumny None
            **{col: None for col in self.columns},
            
            # Nadpisz własnymi danymi
            **kwargs,
            
            'timestamp': current_timestamp,  # Wymuś aktualny timestamp
            'username': self.username,
            
            # Emocje własne
            'angry': emotion_dict.get('angry', 0),
            'disgust': emotion_dict.get('disgust', 0),
            'fear': emotion_dict.get('fear', 0),
            'happy': emotion_dict.get('happy', 0),
            'sad': emotion_dict.get('sad', 0),
            'surprise': emotion_dict.get('surprise', 0),
            'neutral': emotion_dict.get('neutral', 0),
            
            # Dane partnera (dodaj prefix "partner_")
            'partner_name': self.chat_partner,  # Użyj chat_partner zamiast partner_name
            **{f'partner_{k}': v for k, v in partner_data.items()},
        }
    
        self.frames.append(row_data)
        print(f"Logged: {kwargs.get('event_type', 'event')} for {self.username}. Total entries: {len(self.frames)}")
    
    def save_to_excel(self):
        if not self.username:
            print("No username set")
            return None
            

        if not self.frames:
            print(f"No data to save for {self.username}")
            return None
            
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        
        # Użyj chat_partner w nazwie pliku
        if self.chat_partner:
            filename = f"data/{self.username}_{self.chat_partner}_{timestamp}.xlsx"
        else:
            filename = f"data/{self.username}_{timestamp}.xlsx"
            
        try:
            import pandas as pd
            df = pd.DataFrame(self.frames)
            df.to_excel(filename, index=False)
            print(f"Saved {len(self.frames)} entries to {filename}")
            return filename
        except Exception as e:
            print(f"Error saving to Excel: {e}")
            return None

    def set_chat_partner(self, partner_name):
        """Ustawia nazwę partnera czatu"""
        self.chat_partner = partner_name
        print(f"Logger: Set partner {partner_name} for user {self.username}")