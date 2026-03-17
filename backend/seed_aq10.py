import requests
import datetime
import random
import time

base_url = "http://127.0.0.1:8000/api/aq10"
username = "john_pork"

# Need to wait to ensure backend has reloaded if it was just changed
time.sleep(2)

today = datetime.date.today()
for i in range(30, 0, -1):
    date = today - datetime.timedelta(days=i)
    # Simulate scores creeping up towards the end
    base_score = 4 if i > 10 else 6
    score = base_score + random.randint(0, 3)
    score = min(10, score)
    
    data = {
        "patient_username": username,
        "date": date.isoformat(),
        "score": score
    }
    
    try:
        response = requests.post(base_url, json=data)
        print(f"Inserted for {date.isoformat()}: {score} - Status: {response.status_code}")
    except Exception as e:
        print(f"Error on {date.isoformat()}: {e}")

# Test the GET endpoint to verify LSTM
print("Testing GET endpoint for prediction...")
try:
    response = requests.get(f"{base_url}/{username}")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Prediction: {data.get('prediction')}")
        print(f"Needs Attention: {data.get('needs_attention')}")
except Exception as e:
    print(f"Error testing GET: {e}")
