from translate import Translator
import threading
from functools import lru_cache
from typing import Dict, Set

class TranslatorService:
    def __init__(self, supported: Set[str] | None = None):
        self.supported = supported or {"en","ar", "es", "fr"}
        self._user_lang: Dict[int, str] = {}
        self._lang_translators: Dict[str, Translator] = {}
        self._lock = threading.Lock()

    def set_language(self, user_id: int, lang: str | None):
        lang = (lang or "").lower()
        with self._lock:
            prev = self._user_lang.get(user_id, "")
            if lang in self.supported:
                self._user_lang[user_id] = lang
                if lang not in self._lang_translators:
                    self._lang_translators[lang] = Translator(to_lang=lang, from_lang="autodetect")
            else:
                self._user_lang[user_id] = ""
            if prev != self._user_lang[user_id]:
                self._translate_cached.cache_clear()

    def get_language(self, user_id: int) -> str:
        return self._user_lang.get(user_id, "")
    
    def _ensure_translator(self, lang: str):
      with self._lock:
        if lang in self.supported and lang not in self._lang_translators:
          self._lang_translators[lang] = Translator(to_lang=lang, from_lang="autodetect")

    def translate_to(self, lang: str, text: str) -> str:
      if not text:
          return text
      lang = (lang or "").lower()
      # en traktuj jako zawsze dostępny dla BERT
      if lang == "en":
          self.supported.add("en")
          self._ensure_translator("en")
      return self._translate_cached(lang, text)

    def text_for_bert(self, text: str) -> str:
      # zawsze spróbuj angielskiego, fallback na oryginał
      t = self.translate_to("en", text or "")
      return t or (text or "")

    def build_translations_map(self, text: str) -> Dict[str, str]:
      langs = self._active_languages_snapshot() | {"en"}  # dodaj en zawsze
      return {lang: self._translate_cached(lang, text) for lang in langs}

    def _active_languages_snapshot(self) -> Set[str]:
        with self._lock:
            return {l for l in self._user_lang.values() if l}

    @lru_cache(maxsize=4096)
    def _translate_cached(self, lang: str, text: str) -> str:
        with self._lock:
            tr = self._lang_translators.get(lang)
        if not tr:
            return text
        try:
            return tr.translate(text) or text
        except Exception:
            return text

    def build_translations_map(self, text: str) -> Dict[str, str]:
        langs = self._active_languages_snapshot()
        return {lang: self._translate_cached(lang, text) for lang in langs}