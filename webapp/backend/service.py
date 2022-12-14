from flask import Flask

app = Flask(__name__)

@app.route('/api/inference')
def hello():
    return 'Hello, World!'