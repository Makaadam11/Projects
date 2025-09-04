import base64
import secrets
import time
import cv2
import numpy as np
from deepface import DeepFace
from app.services.logger_manager import LoggerManager
from app.services.chat_manager import ChatManager
import threading

class RecordingService:
    def __init__(self):
        self.logger_manager = LoggerManager(self)
        self.chat_manager = ChatManager()

        self.sessions = {}

        self._deepface_lock = threading.Lock()

        self.current_messages = {}
        self.message_sentiment = {}

        self._init_deepface()

    def _init_deepface(self):
        try:
            dummy = np.zeros((48, 48, 3), dtype=np.uint8)
            DeepFace.analyze(dummy, actions=['emotion'], enforce_detection=False, silent=True)
            print("DeepFace model initialized successfully")
        except Exception as e:
            print(f"Warning: Could not initialize DeepFace: {e}")

    def pair_users(self, user1_id: int, user1_name: str, user2_id: int, user2_name: str):
        if hasattr(self.chat_manager, "create_session"):
            self.chat_manager.create_session(user1_id, user1_name, user2_id, user2_name)
        self.logger_manager.set_partner(user1_id, user2_id, user1_name, user2_name)
        self.logger_manager.begin_pair_session(user1_id, user2_id, secrets.token_hex(8))
        if not hasattr(self.logger_manager, "user_names"):
            self.logger_manager.user_names = {}
        self.logger_manager.user_names[user1_id] = user1_name
        self.logger_manager.user_names[user2_id] = user2_name
        if not hasattr(self.logger_manager, "partners"):
            self.logger_manager.partners = {}
        self.logger_manager.partners[user1_id] = user2_id
        self.logger_manager.partners[user2_id] = user1_id

    def start_session(self, user_id: int, sid: str):
        self.sessions[user_id] = {"sid": sid, "last_frame_ts": 0.0}

    def stop_session(self, user_id: int):
        saved_files = []
        print(f"Stopping session for user {user_id}")
        saved_files = self.logger_manager.save_session_first_stop(user_id)
        self.sessions.pop(user_id, None)
        return saved_files

    def update_current_message(self, user_id, message):
        self.current_messages[user_id] = message

    def ingest_frame_b64(self, user_id: int, sid: str, frame_b64: str, min_interval_s: float = 0.4):
        sess = self.sessions.get(user_id)
        if not sess or sess.get("sid") != sid:
            return
        now = time.time()
        if now - sess.get("last_frame_ts", 0.0) < min_interval_s:
            return
        sess["last_frame_ts"] = now

        if "," in frame_b64:
            frame_b64 = frame_b64.split(",", 1)[1]
        try:
            img_bytes = base64.b64decode(frame_b64)
            arr = np.frombuffer(img_bytes, dtype=np.uint8)
            frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if frame is None:
                return
            self.process_frame(frame, user_id=user_id, username=self.logger_manager.user_names.get(user_id, ""), status="sender")
        except Exception as e:
            print(f"ingest_frame_b64 error: {e}")

    def process_frame(self, frame, user_id, username, status="sender"):
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        try:
            with self._deepface_lock:
                res = DeepFace.analyze(frame_rgb, actions=['emotion'], enforce_detection=False, silent=True)
            emo = res[0]['emotion'] if isinstance(res, list) else res['emotion']

            current_message = self.current_messages.get(user_id, "")
            partner_id = self.chat_manager.get_partner_id(user_id)

            if partner_id:
                self.logger_manager.log_chat_event(
                    user_id=user_id,
                    individual_emotions=emo,
                    status=status,
                    message=current_message
                )
            else:
                logger = self.logger_manager.get_logger(user_id, username)
                logger.log_event(emotion_dict=emo, status=status, message=current_message)

        except Exception as e:
            print(f"Error processing frame: {e}")
            current_message = self.current_messages.get(user_id, "")
            logger = self.logger_manager.get_logger(user_id, username)
            logger.log_event(emotion_dict={}, status=status, message=current_message)

    def update_sentiment(self, user_id, sentiment_data):
        self.message_sentiment[user_id] = sentiment_data
        print(f"Sentiment updated for user {user_id}: {sentiment_data}")

    def get_sentiment(self, user_id):
        return self.message_sentiment.get(user_id, None)
