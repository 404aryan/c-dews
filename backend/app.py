import torch
import json
from fastapi import FastAPI, File, UploadFile, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from torchvision import models, transforms
import torch.nn as nn
from PIL import Image
import io
import sqlite3
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from typing import Optional, Dict, Any
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import os

# --- 1. SETUP: Security and App Initialization ---
SECRET_KEY = "a_very_secret_and_long_random_string_for_jwt" # CHANGE THIS!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

app = FastAPI(title="CDEWS API", version="2.0")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. DATABASE SETUP ---
def init_database():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()
    print("Database initialized and 'users' table is ready.")

init_database()

# --- Database & Security Helper Functions ---
def get_user(username: str):
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    return user

def create_user(username: str, email: str, password: str):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    hashed_password = pwd_context.hash(password)
    try:
        cursor.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                       (username, email, hashed_password))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return None
    conn.close()
    return {"username": username, "email": email}

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- Pydantic Models for API Data Validation ---
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class PredictionDetails(BaseModel):
    title: str
    overview: str
    prevention: Dict[str, Any]
    cure: Dict[str, Any]

class PredictionResponse(BaseModel):
    class_name: str
    confidence: float
    details: PredictionDetails

# --- 3. AUTHENTICATION ENDPOINTS ---
@app.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup_new_user(user: UserCreate):
    db_user = get_user(user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    new_user = create_user(username=user.username, email=user.email, password=user.password)
    if not new_user:
        raise HTTPException(status_code=400, detail="An account with this email or username already exists.")
        
    return {"message": "Account created successfully!"}

@app.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user(form_data.username)
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- 4. AI MODEL AND PREDICTION ---
MODEL_PATH = 'cnews_model_final.pth'
CLASS_NAMES_PATH = 'class_names.json'

model = None
class_names = None

def load_model():
    """Loads the AI model into memory, using the correct MobileNetV2 architecture."""
    global model, class_names
    if model is None:
        print("Loading AI model for the first time...")
        if not os.path.exists(MODEL_PATH) or not os.path.exists(CLASS_NAMES_PATH):
            raise RuntimeError("Model or class names file not found on the server.")
        
        with open(CLASS_NAMES_PATH) as f:
            class_names = json.load(f)

        # UPDATED: Changed ResNet-18 to MobileNetV2 to match the saved model file
        model = models.mobilenet_v2(weights=None)
        
        # UPDATED: Adapted the classifier layer for MobileNetV2
        # MobileNetV2 has a 'classifier' attribute which is a sequence of layers
        num_ftrs = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_ftrs, len(class_names))
        
        model.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device('cpu')))
        model.eval()
        print("AI Model (MobileNetV2) loaded successfully.")

@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    load_model() # Ensure model is loaded
    
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert('RGB')
    
    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    input_tensor = preprocess(image)
    input_batch = input_tensor.unsqueeze(0)

    with torch.no_grad():
        output = model(input_batch)
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        confidence, predicted_class = torch.max(probabilities, 0)

    class_name = class_names[predicted_class.item()]
    
    details = {
        "title": class_name.replace("___", " - ").replace("_", " "),
        "overview": "This is a placeholder overview for the detected disease. Detailed information would be fetched from a database based on the class name.",
        "prevention": {"title": "General Prevention", "steps": ["Use certified disease-free seeds.", "Ensure good field sanitation."]},
        "cure": {"title": "General Treatment", "steps": ["Apply appropriate fungicides as recommended.", "Remove and destroy infected plants."]}
    }
    return {"class_name": class_name, "confidence": confidence.item(), "details": details}

@app.get("/")
def root():
    return {"message": "Welcome to the CDEWS API! Server is running."}