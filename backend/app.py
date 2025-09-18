import torch
import json
from fastapi import FastAPI, File, UploadFile, Body, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from torchvision import models, transforms
import torch.nn as nn
from PIL import Image
import io
import sqlite3
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import firebase_admin
from firebase_admin import credentials, firestore

# --- 1. SETUP: Security, Database, and Firebase ---
SECRET_KEY = "YOUR_SUPER_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db_connection():
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    return conn

conn = get_db_connection()
conn.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, hashed_password TEXT NOT NULL)')
conn.commit()
conn.close()

# Initialize Firebase
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# --- 2. CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. HELPER and User Auth Endpoints ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/register")
def register_user(email: str, password: str):
    conn = get_db_connection()
    try:
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        if user: raise HTTPException(status_code=400, detail="Email already registered")
        hashed_password = pwd_context.hash(password)
        conn.execute('INSERT INTO users (email, hashed_password) VALUES (?, ?)', (email, hashed_password))
        conn.commit()
    finally: conn.close()
    return {"message": "User registered successfully"}

@app.post("/login")
def login_for_access_token(email: str, password: str):
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()
    if not user or not pwd_context.verify(password, user['hashed_password']):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user['email']})
    return {"access_token": access_token, "token_type": "bearer"}

# --- 4. Disease Detection and Map Endpoints ---
disease_info = {
    "Potato___Early_blight": {
        "title": "Potato Early Blight (Aalu ka Ageti Angamari)",
        "overview": "This is a common fungal disease that affects potato leaves and tubers, especially in warm and humid weather. It starts as small, dark spots on lower leaves.",
        "prevention": {"title": "How to Prevent (Roktham)", "steps": ["**Use Healthy Seeds:** Start with certified, disease-free potato seeds from a trusted source.", "**Give Space to Plants:** Plant potatoes with enough space between them so air can move freely and dry the leaves.", "**Water Carefully:** Water the soil at the base of the plant, not the leaves. Water in the morning so any wet leaves can dry quickly.", "**Crop Rotation (Fasal Chakra):** Do not plant potatoes or tomatoes in the same soil for at least 2-3 years. This helps to reduce the fungus in the soil."]},
        "cure": {"title": "How to Cure (Upchar)", "steps": ["**Remove Infected Leaves:** As soon as you see spotted leaves, carefully remove them and burn or bury them far away from your field.", "**Organic Spray (Jaivik Upchar):** A spray made from Neem oil (Neem ka Tel) can help control the spread. Mix as per instructions.", "**Chemical Spray (Rasayanik Upchar):** If the infection is high, use a copper-based fungicide like Copper Oxychloride. Always follow the instructions on the packet carefully and spray in the evening."]}
    },
    "Tomato___Late_blight": {
        "title": "Tomato Late Blight (Tamatar ka Pachet Angamari)",
        "overview": "This is a very serious fungal disease that can destroy an entire tomato crop quickly, especially in cool and moist weather. It appears as large, dark, water-soaked spots on leaves and stems.",
        "prevention": {"title": "How to Prevent (Roktham)", "steps": ["**Proper Spacing:** Ensure good airflow by not planting tomatoes too close to each other.", "**Use Stakes (Sahara Dena):** Use bamboo stakes or cages to lift the plants and fruit off the wet ground.", "**Check Plants Regularly:** Inspect your plants every 2-3 days, especially the lower leaves, for any signs of disease.", "**Avoid Overhead Watering:** Water the soil directly to keep the plant leaves as dry as possible."]},
        "cure": {"title": "How to Cure (Upchar)", "steps": ["**Act Fast:** This disease spreads very quickly. Immediately remove and destroy any infected parts of the plant. Do not put them in your compost pile.", "**Chemical Spray (Rasayanik Upchar):** Fungicides containing Mancozeb or Copper are effective. Spray the entire plant, especially under the leaves.", "**Organic Spray (Jaivik Upchar):** A Bordeaux mixture (copper sulfate and lime) is a traditional and effective organic option. Use it as a preventive spray before the rain."]}
    },
    "Tomato___healthy": {
        "title": "Healthy Plant (Swasth Paudha)",
        "overview": "Your plant appears to be healthy and free from common diseases.",
        "prevention": {"title": "How to Keep it Healthy", "steps": ["Continue to provide regular water and sunlight.", "Ensure the soil has good nutrients. You can add cow dung manure (gobar khad) for better growth.", "Keep checking your plants every few days to catch any problems early."]},
        "cure": {"title": "Action Needed", "steps": ["No cure needed. Your plant is healthy."]}
    }
}
try:
    with open('class_names.json', 'r') as f:
        class_names = json.load(f)
    model = models.mobilenet_v2(weights=None) 
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, len(class_names))
    model.load_state_dict(torch.load('cnews_model_final.pth', map_location=torch.device('cpu')))
    model.eval()
except FileNotFoundError:
    print("MODEL FILES NOT FOUND.")
    model = None
    class_names = []
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.post("/predict")
async def predict(file: UploadFile, lat: float = Body(), long: float = Body()):
    if not model: return {"error": "Model is not loaded."}
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img_t = transform(image)
    batch_t = torch.unsqueeze(img_t, 0)
    with torch.no_grad():
        outputs = model(batch_t)
        softmax_outputs = torch.nn.functional.softmax(outputs, dim=1)
        confidence, predicted_idx_tensor = torch.max(softmax_outputs, 1)
        predicted_idx = predicted_idx_tensor.item()
        predicted_class = class_names[predicted_idx]
        prediction_confidence = confidence.item()

    doc_ref = db.collection('reports').document()
    doc_ref.set({
        'disease': predicted_class,
        'confidence': prediction_confidence,
        'location': firestore.GeoPoint(lat, long),
        'timestamp': firestore.SERVER_TIMESTAMP
    })

    advice = disease_info.get(predicted_class, {"title": "Info", "overview": "N/A", "prevention": {"title":"N/A", "steps":[]}, "cure": {"title":"N/A", "steps":[]}})
    return {"disease": predicted_class, "confidence": round(prediction_confidence, 4), "details": advice}

@app.get("/reports")
def get_all_reports():
    reports = []
    docs = db.collection('reports').stream()
    for doc in docs:
        report = doc.to_dict()
        if "location" in report and report["location"]:
            reports.append({
                "id": doc.id,
                "disease": report.get("disease"),
                "lat": report.get("location").latitude,
                "long": report.get("location").longitude
            })
    return reports

@app.get("/")
def root(): return {"message": "Welcome to the CDEWS API!"}