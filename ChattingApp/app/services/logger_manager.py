from app.services.logger import Logger
import secrets

class LoggerManager:
    def __init__(self, recording_service):
        self.recording_service = recording_service
        self.loggers = {}
        self.user_names = {}
        self.partners = {}
        self.saved_pairs = set()
        self.pair_session_id = {}
        self._sending_active = set()
        self._viewing_active = set()

    def get_logger(self, user_id, username=None):
        lg = self.loggers.get(user_id)
        if not lg:
            lg = Logger()
            self.loggers[user_id] = lg
        if username:
            lg.username = username
            self.user_names[user_id] = username
        return lg

    def set_partner(self, user_id, partner_id, user_name=None, partner_name=None):
        self.partners[user_id] = partner_id
        self.partners[partner_id] = user_id
        if user_name:
            self.get_logger(user_id, user_name)
        if partner_name:
            self.get_logger(partner_id, partner_name)
        if user_name and partner_name:
            self.loggers[user_id].set_chat_partner(partner_name)
            self.loggers[partner_id].set_chat_partner(user_name)
            print(f"Set partners: {user_name} ↔ {partner_name}")

    def begin_pair_session(self, user1_id: int, user2_id: int, token: str | None = None):
        token = token or secrets.token_hex(8)
        self.pair_session_id[user1_id] = token
        self.pair_session_id[user2_id] = token
        self._sending_active.discard(int(user1_id))
        self._sending_active.discard(int(user2_id))
        self._viewing_active.discard(int(user1_id))
        self._viewing_active.discard(int(user2_id))
        return token

    def _pair_key(self, user_id):
        sid = self.pair_session_id.get(user_id)
        if sid:
            return sid
        partner_id = self.partners.get(user_id)
        return f"{min(user_id, partner_id)}-{max(user_id, partner_id)}" if partner_id else f"{user_id}-solo"

    def _invert_status(self, status: str | None):
        if status == "sender":
            return "receiver"
        if status == "receiver":
            return "sender"
        return status or ""

    def _apply_start_end_locks(self, user_id: int, user_row: dict):
        if "start_sending_time" in user_row and user_row.get("start_sending_time"):
            if user_id in self._sending_active:
                user_row.pop("start_sending_time", None)
            else:
                self._sending_active.add(user_id)
        if "end_sending_time" in user_row and user_row.get("end_sending_time"):
            self._sending_active.discard(user_id)
        if "start_viewing_time" in user_row and user_row.get("start_viewing_time"):
            if user_id in self._viewing_active:
                user_row.pop("start_viewing_time", None)
            else:
                self._viewing_active.add(user_id)
        if "end_viewing_time" in user_row and user_row.get("end_viewing_time"):
            self._viewing_active.discard(user_id)

    def log_chat_event(self, user_id, individual_emotions=None, **shared_data):
        try:
            user_id = int(user_id)
        except Exception:
            return
        partner_id = self.partners.get(user_id)
        status = shared_data.get("status", "")
        user_logger = self.get_logger(user_id, self.user_names.get(user_id))
        get_sent = getattr(self.recording_service, "get_sentiment", None)
        user_sent = get_sent(user_id) if get_sent else None
        partner_sent = get_sent(partner_id) if (get_sent and partner_id) else None
        user_row = {k: v for k, v in shared_data.items() if not k.startswith("partner_")}
        user_row.setdefault("user_id", user_id)
        user_row.setdefault("status", status)
        if status == "receiver":
            user_row.pop("message", None)
            user_row.pop("complete_message", None)
        self._apply_start_end_locks(user_id, user_row)
        if user_sent:
            user_row.update({
                "sentiment_neg": user_sent.get("neg", 0),
                "sentiment_pos": user_sent.get("pos", 0),
                "sentiment_neu": user_sent.get("neu", 0),
            })
        partner_data_for_user = {}
        if partner_id:
            partner_data_for_user = {
                "name": self.user_names.get(partner_id, ""),
                "status": self._invert_status(status),
                "message": shared_data.get("partner_message", shared_data.get("message", "") if status == "receiver" else ""),
                "complete_message": shared_data.get("partner_complete_message", shared_data.get("complete_message", "") if status == "receiver" else ""),
                "warnings_count": shared_data.get("partner_warnings_count", None),
                "corrections_count": shared_data.get("partner_corrections_count", None),
            }
            partner_data_for_user = {k: v for k, v in partner_data_for_user.items() if v not in (None, "")}
            if partner_sent:
                partner_data_for_user.update({
                    "sentiment_neg": partner_sent.get("neg", 0),
                    "sentiment_pos": partner_sent.get("pos", 0),
                    "sentiment_neu": partner_sent.get("neu", 0),
                })
        user_logger.log_event(
            emotion_dict=individual_emotions or {},
            partner_data=partner_data_for_user,
            **user_row
        )
        if partner_id:
            partner_logger = self.get_logger(partner_id, self.user_names.get(partner_id))
            partner_row = {
                "user_id": partner_id,
                "status": self._invert_status(status),
            }
            user_data_for_partner = {
                "name": self.user_names.get(user_id, ""),
                "status": status,
                "message": shared_data.get("message", ""),
                "complete_message": shared_data.get("complete_message", ""),
                "warnings_count": shared_data.get("warnings_count", None),
                "corrections_count": shared_data.get("corrections_count", None),
                "start_sending_time": shared_data.get("start_sending_time", None),
                "end_sending_time": shared_data.get("end_sending_time", None),
                "total_sending_time": shared_data.get("total_sending_time", None),
                "start_viewing_time": shared_data.get("start_viewing_time", None),
                "end_viewing_time": shared_data.get("end_viewing_time", None),
                "total_viewing_time": shared_data.get("total_viewing_time", None),
                "angry": (individual_emotions or {}).get("angry", 0),
                "disgust": (individual_emotions or {}).get("disgust", 0),
                "fear": (individual_emotions or {}).get("fear", 0),
                "happy": (individual_emotions or {}).get("happy", 0),
                "sad": (individual_emotions or {}).get("sad", 0),
                "surprise": (individual_emotions or {}).get("surprise", 0),
                "neutral": (individual_emotions or {}).get("neutral", 0),
            }
            user_data_for_partner = {k: v for k, v in user_data_for_partner.items() if v not in (None, "")}
            if user_sent:
                user_data_for_partner.update({
                    "sentiment_neg": user_sent.get("neg", 0),
                    "sentiment_pos": user_sent.get("pos", 0),
                    "sentiment_neu": user_sent.get("neu", 0),
                })
            partner_logger.log_event(
                emotion_dict={},
                partner_data=user_data_for_partner,
                **partner_row
            )

    def save_session_first_stop(self, user_id):
        print(f"Saving session for user {user_id}")
        key = self._pair_key(user_id)
        if key in self.saved_pairs:
            print(f"Pair already saved for session key {key}")
            return []
        self.saved_pairs.add(key)
        return self.save_log_for_user(user_id)

    def save_log_for_user(self, user_id):
        logger = self.loggers.get(user_id)
        if not logger:
            print(f"No logger for user {user_id}")
            return []
        if not logger.username:
            logger.username = self.user_names.get(user_id, "") or logger.username
        if not getattr(logger, "frames", None):
            print(f"No data to save for {logger.username or user_id}")
            return []
        filename = logger.save_to_excel()
        return [filename] if filename else []
