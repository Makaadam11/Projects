from app.services.logger import Logger

class LoggerManager:
    def __init__(self, recording_service):
        self.recording_service = recording_service
        self.loggers = {}      # {user_id: Logger}
        self.user_names = {}   # {user_id: username}
        self.partners = {}     # {user_id: partner_id}

    def log_chat_event(self, user_id, event_type, individual_emotions=None, **shared_data):
        partner_id = self.partners.get(user_id)
        user_logger = self.loggers.get(user_id)
        
        if user_logger:
            partner_data = {}
            user_sentiment = self.recording_service.get_sentiment(user_id) if hasattr(self.recording_service, 'get_sentiment') else None
            partner_sentiment = self.recording_service.get_sentiment(partner_id) if partner_id and hasattr(self.recording_service, 'get_sentiment') else None
            
            if partner_id:
                partner_data = {
                    'name': self.user_names.get(partner_id, ''),
                    'status': 'receiver' if shared_data.get('status') == 'sender' else 'sender',
                    'message': shared_data.get('message', ''),
                    'complete_message': shared_data.get('complete_message', ''),
                    'action_by': partner_id,
                    **{k: v for k, v in shared_data.items() if 'time' in k.lower()}
                }
                
                # Dodaj sentiment partnera do partner_data
                if partner_sentiment:
                    partner_data.update({
                        'sentiment_neg': partner_sentiment.get('neg', 0),
                        'sentiment_pos': partner_sentiment.get('pos', 0),
                        'sentiment_neu': partner_sentiment.get('neu', 0)
                    })
            
            log_data = {
                **shared_data
            }
            
            # Dodaj sentiment użytkownika do jego własnych danych
            if user_sentiment:
                log_data.update({
                    'sentiment_neg': user_sentiment.get('neg', 0),
                    'sentiment_pos': user_sentiment.get('pos', 0),
                    'sentiment_neu': user_sentiment.get('neu', 0)
                })
            
            user_logger.log_event(
                emotion_dict=individual_emotions or {},
                partner_data=partner_data,
                **log_data
            )
            print(f"Logged event '{event_type}' for user {user_id}")
        
        if partner_id:
            partner_logger = self.loggers.get(partner_id)
            if partner_logger:
                partner_shared_data = shared_data.copy()
                if shared_data.get("status") == "sender":
                    partner_shared_data["status"] = "receiver"
                elif shared_data.get("status") == "receiver":
                    partner_shared_data["status"] = "sender"
                
                # Pobierz sentiment partnera dla jego własnych danych
                partner_sentiment = self.recording_service.get_sentiment(partner_id)
                # Pobierz sentiment użytkownika dla danych partnera
                user_sentiment = self.recording_service.get_sentiment(user_id)
                
                # Dodaj sentiment partnera do jego własnych danych
                if partner_sentiment:
                    partner_shared_data.update({
                        'sentiment_neg': partner_sentiment.get('neg', 0),
                        'sentiment_pos': partner_sentiment.get('pos', 0),
                        'sentiment_neu': partner_sentiment.get('neu', 0)
                    })
                
                user_data = {
                    'name': self.user_names.get(user_id, ''),
                    'status': shared_data.get('status', ''),
                    'message': shared_data.get('message', ''),
                    'complete_message': shared_data.get('complete_message', ''),
                    'action_by': user_id,
                    'angry': (individual_emotions or {}).get('angry', 0),
                    'disgust': (individual_emotions or {}).get('disgust', 0),
                    'fear': (individual_emotions or {}).get('fear', 0),
                    'happy': (individual_emotions or {}).get('happy', 0),
                    'sad': (individual_emotions or {}).get('sad', 0),
                    'surprise': (individual_emotions or {}).get('surprise', 0),
                    'neutral': (individual_emotions or {}).get('neutral', 0),
                    **{k: v for k, v in shared_data.items() if 'time' in k.lower()}
                }
                
                # Dodaj sentiment użytkownika jako partner sentiment
                if user_sentiment:
                    user_data.update({
                        'sentiment_neg': user_sentiment.get('neg', 0),
                        'sentiment_pos': user_sentiment.get('pos', 0),
                        'sentiment_neu': user_sentiment.get('neu', 0)
                    })
                    
                partner_logger.log_event(
                    emotion_dict={},
                    partner_data=user_data,
                    **partner_shared_data
                )
                print(f"Logged event '{event_type}' for partner {partner_id}")
    
    def set_partner(self, user_id, partner_id, user_name=None, partner_name=None):
        self.partners[user_id] = partner_id
        self.partners[partner_id] = user_id
        
        if user_name and partner_name:
            user_logger = self.get_logger(user_id, user_name)
            user_logger.set_chat_partner(partner_name)
            
            partner_logger = self.get_logger(partner_id, partner_name)
            partner_logger.set_chat_partner(user_name)
            
            print(f"Set partners: {user_name} ↔ {partner_name}")

    def get_logger(self, user_id, username=None):
        if user_id not in self.loggers:
            self.loggers[user_id] = Logger()
            if username:
                self.loggers[user_id].username = username
                self.user_names[user_id] = username
        return self.loggers[user_id]

    def save_all_logs(self):
        print(f"Attempting to save logs for {len(self.loggers)} users")
        
        for user_id, logger in self.loggers.items():
            print(f"User {user_id} ({logger.username}) has {len(logger.frames)} entries")
            
        saved_files = []
        for user_id, logger in self.loggers.items():
            filename = logger.save_to_excel()
            if filename:
                saved_files.append(filename)
                
        print(f"Total saved files: {len(saved_files)}")
        return saved_files