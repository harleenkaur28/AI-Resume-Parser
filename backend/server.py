from app import *
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to AI Resune Parser!"})

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "API is working"})

if __name__ == '__main__':
    app.run(debug=True)
