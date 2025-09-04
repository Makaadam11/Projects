import sys
import pathlib
# allow: `python app/mini_sentiment_api/api.py`
if __package__ in (None, "",):
    ROOT = pathlib.Path(__file__).resolve().parents[2]
    if str(ROOT) not in sys.path:
        sys.path.insert(0, str(ROOT))
        
from flask import Flask, request, jsonify
import re
from app.config.config import Config
from app.models.bert_model import BertModel
from app.utils.translator_service import TranslatorService

app = Flask(__name__)

cfg = Config()
bert = BertModel(cfg.MODEL_PATH, cfg.TOKENIZER_PATH, max_len=50)
translator = TranslatorService()

LABELS = ['negative','neutral','positive']

def analyze(text: str):
    probs, idx = bert.predict(text)
    neg, neu, pos = float(probs[0]), float(probs[1]), float(probs[2])
    return {'neg': neg, 'neu': neu, 'pos': pos, 'predicted': LABELS[int(idx)]}

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
    for w in uniq:
        try:
            en = to_en(w)
            pred = analyze(en)
            out[w] = float(pred['neg'])
        except Exception:
            out[w] = 0.0
    return jsonify({'scores': out})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5003, debug=False)