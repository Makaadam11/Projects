from app.app import app, socketio
import os

if __name__ == "__main__":
    host = "0.0.0.0"
    port = int(os.environ.get("PORT", 5001))
    # eventlet/gevent automatically used if installed
    socketio.run(app, host=host, port=port, debug=False)