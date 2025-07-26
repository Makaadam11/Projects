import time
import cv2
import tensorflow as tf
from deepface import DeepFace
from chat.services.logger_manager import LoggerManager
from chat.services.chat_manager import ChatManager

class RecordingService:
    def __init__(self):
        self.logger_manager = LoggerManager(self)
        self.chat_manager = ChatManager()
        self.recording = False
        self.current_messages = {}  # {user_id: current_message}
        self.message_sentiment = {}  # {user_id: sentiment}
        self.waiting_users = []
        self._init_deepface()

    def _init_deepface(self):
        try:
            import numpy as np
            dummy_img = np.zeros((48, 48, 3), dtype=np.uint8)
            DeepFace.analyze(dummy_img, actions=['emotion'], enforce_detection=False)
            print("DeepFace model initialized successfully")
        except Exception as e:
            print(f"Warning: Could not initialize DeepFace: {e}")

    def update_current_message(self, user_id, message):
        self.current_messages[user_id] = message

    def register_user_session(self, user1_id, user1_name, user2_id, user2_name):
        session = self.chat_manager.create_session(user1_id, user1_name, user2_id, user2_name)
        self.logger_manager.set_partner(user1_id, user2_id, user1_name, user2_name)
        return session
    
    def process_frame(self, frame, user_id, username, status="sender"):
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        try:
            emotion_predictions = DeepFace.analyze(
                frame, 
                actions=['emotion'], 
                enforce_detection=False,
                silent=True
            )
                
            if isinstance(emotion_predictions, list):
                emotion = emotion_predictions[0]['emotion']
            else:
                emotion = emotion_predictions['emotion']
                
            current_message = self.current_messages.get(user_id, "")
            
            partner_id = self.chat_manager.get_partner_id(user_id)
            
            if partner_id:
                self.logger_manager.log_chat_event(
                    user_id=user_id,
                    event_type="emotion_detected",
                    individual_emotions=emotion,
                    status=status,
                    message=current_message
                )
            else:
                # Fallback - tylko ten użytkownik (czeka na partnera)
                logger = self.logger_manager.get_logger(user_id, username)
                logger.log_event(emotion_dict=emotion, status=status, message=current_message)
                
        except Exception as e:
            print(f"Error processing frame: {e}")
            # Fallback bez emocji
            current_message = self.current_messages.get(user_id, "")
            logger = self.logger_manager.get_logger(user_id, username)
            logger.log_event(emotion_dict={}, status=status, message=current_message)

    def record_screen(self, user_id, username, status="sender"):
        interval = 0.5  # Zwiększ interval żeby zmniejszyć obciążenie
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Camera could not be opened.")
            return

        self.recording = True
        print("Recording started...")

        while self.recording:
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame.")
                break
            self.process_frame(frame, user_id=user_id, username=username, status=status)
            time.sleep(interval)

        cap.release()
        print("Recording stopped.")

    def stop_screen_recording(self, user_id):
        self.recording = False
        saved_files = self.logger_manager.save_all_logs()
        print(f"Saved logs: {saved_files}")

    def update_sentiment(self, user_id, sentiment_data):
        self.message_sentiment[user_id] = sentiment_data
        print(f"Sentiment updated for user {user_id}: {sentiment_data}")
    
    def get_sentiment(self, user_id):
        return self.message_sentiment.get(user_id, None)