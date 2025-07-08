from flask_socketio import Namespace, emit
import threading

class RecordingNamespace(Namespace):
    def __init__(self, namespace, recording_service):
        super().__init__(namespace)
        self.recording_service = recording_service

    def on_start_recording(self, data):
        username = data.get('username')
        user_id = data.get('userID')
        
        # Dodaj użytkownika do listy oczekujących
        user_info = {'user_id': user_id, 'username': username}
        self.recording_service.waiting_users.append(user_info)
        
        print(f"User {username} ({user_id}) added to waiting list. Total waiting: {len(self.recording_service.waiting_users)}")
        
        # Sprawdź czy można sparować (2 użytkowników)
        if len(self.recording_service.waiting_users) >= 2:
            user1 = self.recording_service.waiting_users.pop(0)
            user2 = self.recording_service.waiting_users.pop(0)
            
            # Sparuj użytkowników
            self.recording_service.register_user_session(
                user1['user_id'], user1['username'],
                user2['user_id'], user2['username']
            )
            
            # Uruchom nagrywanie dla obu
            thread1 = threading.Thread(
                target=self.recording_service.record_screen,
                args=(user1['user_id'], user1['username'], "sender")
            )
            thread2 = threading.Thread(
                target=self.recording_service.record_screen,
                args=(user2['user_id'], user2['username'], "sender")
            )
            
            thread1.daemon = True
            thread2.daemon = True
            thread1.start()
            thread2.start()
            
            # Powiadom obu o sparowaniu
            emit('recording_started', {'partnered_with': user2['username']}, room=user1['user_id'])
            emit('recording_started', {'partnered_with': user1['username']}, room=user2['user_id'])
            
            print(f"Paired: {user1['username']} ↔ {user2['username']}")
        else:
            emit('waiting_for_partner', {'message': 'Waiting for another user...'})

    def on_current_message(self, data):
        user_id = data.get('userID')
        message = data.get('message', '')
        self.recording_service.update_current_message(user_id, message)

    def on_stop_recording(self, data):
        user_id = data.get('userID')
        self.recording_service.stop_screen_recording(user_id)
        emit('recording_stopped', {'message': 'Recording stopped and logs saved'})