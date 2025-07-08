from app.services.logger import Logger

class LoggerManager:
    def __init__(self):
        self.loggers = {}      # {user_id: Logger}
        self.user_names = {}   # {user_id: username}
        self.partners = {}     # {user_id: partner_id}

    def log_chat_event(self, user_id, event_type, individual_emotions=None, **shared_data):
        """Loguje do użytkownika i automatycznie do partnera"""
        partner_id = self.partners.get(user_id)
        
        # Log dla aktywnego użytkownika (z emocjami)
        user_logger = self.loggers.get(user_id)
        if user_logger:
            user_logger.log_event(
                emotion_dict=individual_emotions or {},
                **shared_data
            )
            print(f"Logged event '{event_type}' for user {user_id}")
        
        # Log dla partnera (bez emocji, odwrotny status)
        if partner_id:
            partner_logger = self.loggers.get(partner_id)
            if partner_logger:
                # Kopiuj dane, ale zmień status
                partner_data = shared_data.copy()
                if shared_data.get("status") == "sender":
                    partner_data["status"] = "receiver"
                elif shared_data.get("status") == "receiver":
                    partner_data["status"] = "sender"
                    
                partner_logger.log_event(
                    emotion_dict={},  # Brak emocji dla partnera
                    **partner_data
                )
                print(f"Logged event '{event_type}' for partner {partner_id}")
    
    def set_partner(self, user_id, partner_id, user_name=None, partner_name=None):
        """Ustaw partnerów w obu kierunkach"""
        self.partners[user_id] = partner_id
        self.partners[partner_id] = user_id
        
        if user_name and partner_name:
            # Ustaw nazwy partnerów w loggerach
            user_logger = self.get_logger(user_id, user_name)
            user_logger.set_chat_partner(partner_name)
            
            partner_logger = self.get_logger(partner_id, partner_name)
            partner_logger.set_chat_partner(user_name)
            
            print(f"Set partners: {user_name} ↔ {partner_name}")

    def get_logger(self, user_id, username=None):
        """Uproszczona wersja bez partner_id"""
        if user_id not in self.loggers:
            self.loggers[user_id] = Logger()
            if username:
                self.loggers[user_id].username = username
                self.user_names[user_id] = username
        return self.loggers[user_id]

    def save_all_logs(self):
        """Zapisuje logi wszystkich użytkowników"""
        print(f"Attempting to save logs for {len(self.loggers)} users")
        saved_files = []
        
        for user_id, logger in self.loggers.items():
            print(f"Saving log for user_id: {user_id}")
            filename = logger.save_to_excel()
            if filename:
                saved_files.append(filename)
                
        print(f"Total saved files: {len(saved_files)}")
        return saved_files