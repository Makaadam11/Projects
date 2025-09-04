from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]  # C:\Projects\ChattingApp
sys.path.insert(0, str(ROOT))

from app.mini_sentiment_api.api import app  # noqa: E402

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5003, debug=False)