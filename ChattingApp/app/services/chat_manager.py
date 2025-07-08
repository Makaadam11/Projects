class ChatManager:
    def __init__(self):
        self.active_sessions = {}  # {session_id: ChatSession}
        self.user_sessions = {}    # {user_id: session_id}
    
    def create_session(self, user1_id, user1_name, user2_id, user2_name):
        session_id = f"{user1_id}_{user2_id}"
        
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
        
        return session
    
    def get_session_by_user(self, user_id):
        session_id = self.user_sessions.get(user_id)
        return self.active_sessions.get(session_id)
    
    def get_partner_id(self, user_id):
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
        self.messages = []  # Historia wiadomości
    
    def get_partner_id(self, user_id):
        if user_id == self.user1_id:
            return self.user2_id
        elif user_id == self.user2_id:
            return self.user1_id
        return None
    
    def get_partner_name(self, user_id):
        if user_id == self.user1_id:
            return self.user2_name
        elif user_id == self.user2_id:
            return self.user1_name
        return None
    
    def add_message(self, sender_id, message, timestamp):
        self.messages.append({
            'sender_id': sender_id,
            'message': message,
            'timestamp': timestamp
        })