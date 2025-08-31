from datetime import datetime
import os

class Logger:
    def __init__(self):
        self.frames = []
        self.status = ""
        self.username = ""
        self.partnername = ""
        self.user_id = ""
    
        self.columns = [
            'timestamp', 'user_id', 'username', 'status', 'message', 'complete_message',
            'start_sending_time', 'end_sending_time', 'total_sending_time',
            'start_viewing_time', 'end_viewing_time', 'total_viewing_time',
            
            'angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral',
            
            'sentiment_neg', 'sentiment_pos', 'sentiment_neu',

            'warnings_count', 'corrections_count',

            'partner_name', 'partner_status', 'partner_message', 'partner_complete_message',
            'partner_start_sending_time', 'partner_end_sending_time', 'partner_total_sending_time',
            'partner_start_viewing_time', 'partner_end_viewing_time', 'partner_total_viewing_time',
            
            'partner_angry', 'partner_disgust', 'partner_fear', 'partner_happy', 
            'partner_sad', 'partner_surprise', 'partner_neutral',
            'partner_sentiment_neg', 'partner_sentiment_pos', 'partner_sentiment_neu',

            'partner_warnings_count', 'partner_corrections_count'
        ]

    def log_event(self, emotion_dict=None, partner_data=None, **kwargs):
        emotion_dict = emotion_dict or {}
        partner_data = partner_data or {}
        current_timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
        row_data = {
            **{col: None for col in self.columns},
            **kwargs,
            'timestamp': current_timestamp,
            'username': self.username,
            'angry': emotion_dict.get('angry', 0),
            'disgust': emotion_dict.get('disgust', 0),
            'fear': emotion_dict.get('fear', 0),
            'happy': emotion_dict.get('happy', 0),
            'sad': emotion_dict.get('sad', 0),
            'surprise': emotion_dict.get('surprise', 0),
            'neutral': emotion_dict.get('neutral', 0),
            'partner_name': self.partnername,
            **{f'partner_{k}': v for k, v in partner_data.items()},
        }

        self.frames.append(row_data)

    def save_to_excel(self):
        if not self.username:
            print("No username set")
            return None
        if not self.frames:
            print(f"No data to save for {self.username}")
            return None

        base_dir = os.path.join(os.getcwd(), "data")
        os.makedirs(base_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        filename = f"{self.username}_{self.partnername}_{timestamp}.xlsx" if self.partnername \
                   else f"{self.username}_{timestamp}.xlsx"
        path = os.path.join(base_dir, filename)

        try:
            import pandas as pd
            df = pd.DataFrame(self.frames)
            df.to_excel(path, index=False)
            print(f"Saved {len(self.frames)} entries to {path}")
            return path
        except Exception as e:
            print(f"Error saving to Excel: {e}")
            return None

    def set_chat_partner(self, partner_name):
        self.partnername = partner_name
        print(f"Logger: Set partner {partner_name} for user {self.username}")