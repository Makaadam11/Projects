import sys
import pathlib
# allow: `python app/mini_sentiment_api/api.py`
if __package__ in (None, "",):
    ROOT = pathlib.Path(__file__).resolve().parents[2]
    if str(ROOT) not in sys.path:
        sys.path.insert(0, str(ROOT))
        
from flask import Flask, request, jsonify
import re
from app.utils.translator_service import TranslatorService
from afinn import Afinn
afinn = Afinn()

app = Flask(__name__)

translator = TranslatorService()

LABELS = ['negative','neutral','positive']

def to_en(text: str) -> str:
    try:
        t = translator.text_for_bert(text)
        return t or text
    except Exception:
        return text

@app.get('/health')
def health():
    return jsonify({"ok": True})

@app.post('/api/sentiment/score_words')
def score_words():
    payload = request.get_json(silent=True) or {}
    words = payload.get('words') or []
    norm = []
    for w in words:
        if not isinstance(w, str):
            continue
        m = re.findall(r'[A-Za-z]{2,}', w)
        if not m:
            continue
        norm.append(m[0].lower())
    uniq = sorted(set(norm))
    out = {}
    for uword in uniq:
        if isinstance(uword, str) and len(uword) > 1:
            score = afinn.score(uword)
            neg_score = max(0, min(1, -score / 5))
            out[uword.lower()] = round(neg_score, 3)
    return jsonify({'scores': out})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5003, debug=False)