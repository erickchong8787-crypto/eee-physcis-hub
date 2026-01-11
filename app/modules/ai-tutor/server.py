from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import sys

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from the Next.js frontend

@app.route('/', methods=['GET'])
def home():
    return "Python AI Server is running on Port 5000! (Connected to Llama 3.3 via Next.js)"

@app.route('/api/chat', methods=['POST'])
def chat_handler():
    data = request.json
    
    print("Forwarding request to Next.js Route (Llama 3.3)...", file=sys.stdout)
    
    try:
        # Forward the request to the Next.js API Route (which handles Groq/Llama 3.3)
        # This assumes your Next.js app is running on port 3000
        response = requests.post('http://localhost:3000/api/chat', json=data)
        
        # Return the exact response from Next.js back to the frontend
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"content": f"Error from Llama 3.3: {response.text}"})
        
    except Exception as e:
        print(f"Bridge Error: {e}", file=sys.stdout)
        return jsonify({"content": "Error: Could not connect to Llama 3.3 via route.ts. Ensure 'npm run dev' is running on Port 3000."})

if __name__ == '__main__':
    print("Python Server running on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)