from datetime import datetime

class ChatManager:
    def __init__(self):
        self.active_sessions = {}  # {session_id: ChatSession}
        self.user_sessions = {}    # {user_id: session_id}
    
    def create_session(self, user1_id, user1_name, user2_id, user2_name):
        """Tworzy nową sesję czatu między dwoma użytkownikami"""
        # Użyj posortowanych ID dla konsystentnego session_id
        session_id = f"{min(user1_id, user2_id)}_{max(user1_id, user2_id)}"
        
        if session_id not in self.active_sessions:
            session = ChatSession(
                session_id=session_id,
                user1_id=user1_id,
                user1_name=user1_name,
                user2_id=user2_id,
                user2_name=user2_name
            )
            
            self.active_sessions[session_id] = session
            self.user_sessions[user1_id] = session_id
            self.user_sessions[user2_id] = session_id
            
            print(f"Created session: {user1_name} ↔ {user2_name} (ID: {session_id})")
        
        return self.active_sessions[session_id]
    
    def get_session_by_user(self, user_id):
        """Pobiera sesję dla użytkownika"""
        session_id = self.user_sessions.get(user_id)
        return self.active_sessions.get(session_id)
    
    def get_partner_id(self, user_id):
        """Pobiera ID partnera dla użytkownika"""
        session = self.get_session_by_user(user_id)
        if session:
            return session.get_partner_id(user_id)
        return None

class ChatSession:
    def __init__(self, session_id, user1_id, user1_name, user2_id, user2_name):
        self.session_id = session_id
        self.user1_id = user1_id
        self.user1_name = user1_name
        self.user2_id = user2_id
        self.user2_name = user2_name
        self.messages = []
        self.created_at = datetime.now()
    
    def get_partner_id(self, user_id):
        """Zwraca ID partnera dla danego użytkownika"""
        if user_id == self.user1_id:
            return self.user2_id
        elif user_id == self.user2_id:
            return self.user1_id
        return None
    
    def get_partner_name(self, user_id):
        """Zwraca nazwę partnera dla danego użytkownika"""
        if user_id == self.user1_id:
            return self.user2_name
        elif user_id == self.user2_id:
            return self.user1_name
        return None
    
    def add_message(self, sender_id, message, timestamp):
        """Dodaje wiadomość do sesji"""
        self.messages.append({
            'sender_id': sender_id,
            'message': message,
            'timestamp': timestamp
        })