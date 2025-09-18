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
from pydantic import BaseModel
from typing import Optional, Dict, List, Any

# --- 1. SETUP: Security, Database, and Firebase ---
SECRET_KEY = "YOUR_SUPER_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Pydantic Models ---
class CropPlanRequest(BaseModel):
    land_size: float
    crop_type: str
    soil_type: str = "loamy"
    climate: str = "temperate"
    location: Optional[str] = None

class CropPlanResponse(BaseModel):
    crop_type: str
    land_size: float
    water_requirements: Dict[str, Any]
    fertilizer_requirements: Dict[str, Any]
    chemical_requirements: List[str]
    expected_yield: str
    investment_estimate: str
    profit_estimate: str
    recommendations: List[str]
    timeline: Dict[str, str]

def get_db_connection():
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    return conn

conn = get_db_connection()
conn.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, hashed_password TEXT NOT NULL)')
conn.commit()
conn.close()

# Initialize Firebase
try:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized successfully")
except Exception as e:
    print(f"Firebase initialization failed: {e}")
    db = None

# --- 2. CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. CROP PLANNING DATA ---
CROP_REQUIREMENTS = {
    "tomato": {
        "water_per_acre_per_day": {"min": 2000, "max": 2500},
        "fertilizer": {
            "nitrogen": {"min": 120, "max": 150, "unit": "kg/acre"},
            "phosphorus": {"min": 60, "max": 80, "unit": "kg/acre"},
            "potassium": {"min": 80, "max": 100, "unit": "kg/acre"}
        },
        "chemicals": [
            "Copper Oxychloride for blight prevention",
            "Neem oil for organic pest control",
            "Mancozeb for fungal diseases",
            "Imidacloprid for insect control"
        ],
        "yield_per_acre": {"min": 15, "max": 20, "unit": "tons"},
        "investment": {"min": 80000, "max": 120000, "currency": "INR"},
        "profit": {"min": 150000, "max": 250000, "currency": "INR"},
        "growing_season": "Kharif/Rabi",
        "maturity_days": 120,
        "recommendations": [
            "Start with certified disease-resistant varieties",
            "Install drip irrigation for water efficiency",
            "Maintain 3-4 feet spacing between plants",
            "Use mulching to retain soil moisture",
            "Regular pruning for better yield"
        ],
        "timeline": {
            "soil_preparation": "15-20 days before planting",
            "sowing": "Best in February-March or June-July",
            "first_harvest": "80-90 days after transplanting",
            "final_harvest": "120-150 days after transplanting"
        }
    },
    "potato": {
        "water_per_acre_per_day": {"min": 1800, "max": 2200},
        "fertilizer": {
            "nitrogen": {"min": 100, "max": 120, "unit": "kg/acre"},
            "phosphorus": {"min": 50, "max": 70, "unit": "kg/acre"},
            "potassium": {"min": 60, "max": 80, "unit": "kg/acre"}
        },
        "chemicals": [
            "Mancozeb for late blight prevention",
            "Copper Oxychloride for early blight",
            "Imidacloprid for Colorado potato beetle",
            "Chlorothalonil for disease prevention"
        ],
        "yield_per_acre": {"min": 12, "max": 18, "unit": "tons"},
        "investment": {"min": 60000, "max": 90000, "currency": "INR"},
        "profit": {"min": 120000, "max": 200000, "currency": "INR"},
        "growing_season": "Rabi",
        "maturity_days": 90,
        "recommendations": [
            "Use certified seed potatoes",
            "Ensure proper drainage to prevent waterlogging",
            "Hill up soil around plants as they grow",
            "Store harvested potatoes in cool, dark places",
            "Rotate crops to prevent soil-borne diseases"
        ],
        "timeline": {
            "soil_preparation": "20-25 days before planting",
            "sowing": "October-November in plains, March-April in hills",
            "earthing_up": "30-45 days after planting",
            "harvest": "90-120 days after planting"
        }
    },
    "wheat": {
        "water_per_acre_per_day": {"min": 1500, "max": 2000},
        "fertilizer": {
            "nitrogen": {"min": 80, "max": 100, "unit": "kg/acre"},
            "phosphorus": {"min": 40, "max": 60, "unit": "kg/acre"},
            "potassium": {"min": 20, "max": 40, "unit": "kg/acre"}
        },
        "chemicals": [
            "2,4-D for broad-leaf weed control",
            "Propiconazole for rust diseases",
            "Sulfosulfuron for grass weed control",
            "Tebuconazole for fungal diseases"
        ],
        "yield_per_acre": {"min": 25, "max": 35, "unit": "quintals"},
        "investment": {"min": 40000, "max": 60000, "currency": "INR"},
        "profit": {"min": 80000, "max": 120000, "currency": "INR"},
        "growing_season": "Rabi",
        "maturity_days": 120,
        "recommendations": [
            "Use high-yielding varieties suited to your region",
            "Follow recommended seed rate of 40-50 kg/acre",
            "Apply pre-emergence herbicide for weed control",
            "Monitor for rust diseases during grain filling",
            "Harvest when moisture content is 12-14%"
        ],
        "timeline": {
            "soil_preparation": "15-20 days before sowing",
            "sowing": "November-December",
            "first_irrigation": "20-25 days after sowing",
            "harvest": "April-May"
        }
    },
    "rice": {
        "water_per_acre_per_day": {"min": 3000, "max": 4000},
        "fertilizer": {
            "nitrogen": {"min": 100, "max": 120, "unit": "kg/acre"},
            "phosphorus": {"min": 50, "max": 60, "unit": "kg/acre"},
            "potassium": {"min": 40, "max": 60, "unit": "kg/acre"}
        },
        "chemicals": [
            "Butachlor for pre-emergence weed control",
            "Carbendazim for blast disease",
            "Tricyclazole for rice blast",
            "Pretilachlor for weed management"
        ],
        "yield_per_acre": {"min": 20, "max": 30, "unit": "quintals"},
        "investment": {"min": 50000, "max": 70000, "currency": "INR"},
        "profit": {"min": 90000, "max": 140000, "currency": "INR"},
        "growing_season": "Kharif",
        "maturity_days": 110,
        "recommendations": [
            "Maintain 2-3 cm water level in fields",
            "Use system of rice intensification (SRI) for better yield",
            "Apply zinc sulfate if soil is deficient",
            "Monitor for brown plant hopper and stem borer",
            "Ensure proper field leveling for uniform water distribution"
        ],
        "timeline": {
            "nursery_preparation": "May-June",
            "transplanting": "July-August",
            "panicle_initiation": "45-55 days after transplanting",
            "harvest": "October-November"
        }
    },
    "corn": {
        "water_per_acre_per_day": {"min": 2200, "max": 2800},
        "fertilizer": {
            "nitrogen": {"min": 120, "max": 150, "unit": "kg/acre"},
            "phosphorus": {"min": 60, "max": 80, "unit": "kg/acre"},
            "potassium": {"min": 50, "max": 70, "unit": "kg/acre"}
        },
        "chemicals": [
            "Atrazine for pre-emergence weed control",
            "Chlorpyrifos for stem borer control",
            "Carbofuran for root borer",
            "Propiconazole for leaf blight"
        ],
        "yield_per_acre": {"min": 30, "max": 45, "unit": "quintals"},
        "investment": {"min": 55000, "max": 75000, "currency": "INR"},
        "profit": {"min": 100000, "max": 160000, "currency": "INR"},
        "growing_season": "Kharif",
        "maturity_days": 100,
        "recommendations": [
            "Plant hybrid varieties for higher yield",
            "Maintain 60cm x 20cm spacing",
            "Apply nitrogen in split doses",
            "Ensure adequate drainage during monsoon",
            "Harvest when moisture content is 15-18%"
        ],
        "timeline": {
            "soil_preparation": "May-June",
            "sowing": "June-July",
            "tasseling": "45-55 days after sowing",
            "harvest": "September-October"
        }
    },
    "cotton": {
        "water_per_acre_per_day": {"min": 2500, "max": 3200},
        "fertilizer": {
            "nitrogen": {"min": 100, "max": 130, "unit": "kg/acre"},
            "phosphorus": {"min": 50, "max": 70, "unit": "kg/acre"},
            "potassium": {"min": 60, "max": 80, "unit": "kg/acre"}
        },
        "chemicals": [
            "Imidacloprid for aphid and whitefly control",
            "Profenofos for bollworm control",
            "Acetamiprid for sucking pests",
            "Tebuconazole for fungal diseases"
        ],
        "yield_per_acre": {"min": 15, "max": 25, "unit": "quintals"},
        "investment": {"min": 70000, "max": 100000, "currency": "INR"},
        "profit": {"min": 120000, "max": 200000, "currency": "INR"},
        "growing_season": "Kharif",
        "maturity_days": 160,
        "recommendations": [
            "Use Bt cotton varieties for better pest resistance",
            "Maintain proper plant population of 4000-5000 plants/acre",
            "Regular monitoring for pink bollworm",
            "Practice integrated pest management",
            "Ensure timely picking of cotton"
        ],
        "timeline": {
            "soil_preparation": "April-May",
            "sowing": "May-June",
            "flowering": "60-70 days after sowing",
            "harvest": "October-January (multiple picks)"
        }
    },
    "sugarcane": {
        "water_per_acre_per_day": {"min": 4000, "max": 5000},
        "fertilizer": {
            "nitrogen": {"min": 200, "max": 250, "unit": "kg/acre"},
            "phosphorus": {"min": 80, "max": 100, "unit": "kg/acre"},
            "potassium": {"min": 100, "max": 130, "unit": "kg/acre"}
        },
        "chemicals": [
            "2,4-D for weed control",
            "Metribuzin for pre-emergence weed control",
            "Chlorpyrifos for termite and root borer",
            "Carbendazim for fungal diseases"
        ],
        "yield_per_acre": {"min": 400, "max": 600, "unit": "quintals"},
        "investment": {"min": 80000, "max": 120000, "currency": "INR"},
        "profit": {"min": 150000, "max": 300000, "currency": "INR"},
        "growing_season": "Year-round",
        "maturity_days": 365,
        "recommendations": [
            "Use disease-free setts from healthy canes",
            "Plant setts in furrows 4-5 feet apart",
            "Apply organic matter for better soil health",
            "Regular earthing up and gap filling",
            "Harvest at proper maturity for maximum sugar content"
        ],
        "timeline": {
            "soil_preparation": "15-20 days before planting",
            "planting": "February-March or October-November",
            "germination": "15-30 days after planting",
            "harvest": "12-15 months after planting"
        }
    },
    "onion": {
        "water_per_acre_per_day": {"min": 1800, "max": 2300},
        "fertilizer": {
            "nitrogen": {"min": 80, "max": 100, "unit": "kg/acre"},
            "phosphorus": {"min": 50, "max": 70, "unit": "kg/acre"},
            "potassium": {"min": 60, "max": 80, "unit": "kg/acre"}
        },
        "chemicals": [
            "Mancozeb for purple blotch",
            "Copper oxychloride for downy mildew",
            "Dimethoate for thrips control",
            "Carbendazim for neck rot"
        ],
        "yield_per_acre": {"min": 200, "max": 300, "unit": "quintals"},
        "investment": {"min": 60000, "max": 90000, "currency": "INR"},
        "profit": {"min": 120000, "max": 250000, "currency": "INR"},
        "growing_season": "Rabi",
        "maturity_days": 130,
        "recommendations": [
            "Use well-decomposed farmyard manure",
            "Maintain proper spacing of 15cm x 10cm",
            "Avoid over-irrigation during bulb development",
            "Cure bulbs properly after harvest",
            "Store in well-ventilated areas"
        ],
        "timeline": {
            "nursery_sowing": "September-October",
            "transplanting": "November-December",
            "bulb_formation": "60-80 days after transplanting",
            "harvest": "March-April"
        }
    }
}

# Climate and soil adjustment factors
CLIMATE_FACTORS = {
    "tropical": {"water_multiplier": 1.2, "fertilizer_multiplier": 1.1},
    "temperate": {"water_multiplier": 1.0, "fertilizer_multiplier": 1.0},
    "arid": {"water_multiplier": 1.5, "fertilizer_multiplier": 0.9},
    "semi-arid": {"water_multiplier": 1.3, "fertilizer_multiplier": 0.95}
}

SOIL_FACTORS = {
    "loamy": {"drainage": "good", "fertility": "high", "water_retention": "medium"},
    "clay": {"drainage": "poor", "fertility": "medium", "water_retention": "high"},
    "sandy": {"drainage": "excellent", "fertility": "low", "water_retention": "low"},
    "black": {"drainage": "medium", "fertility": "high", "water_retention": "high"}
}

# --- 4. HELPER FUNCTIONS ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def calculate_crop_plan(request: CropPlanRequest) -> CropPlanResponse:
    """Calculate detailed crop planning based on user inputs"""
    crop_data = CROP_REQUIREMENTS.get(request.crop_type.lower())
    if not crop_data:
        raise ValueError(f"Crop type '{request.crop_type}' not supported")
    
    climate_factor = CLIMATE_FACTORS.get(request.climate, CLIMATE_FACTORS["temperate"])
    soil_info = SOIL_FACTORS.get(request.soil_type, SOIL_FACTORS["loamy"])
    
    # Calculate water requirements
    base_water_min = crop_data["water_per_acre_per_day"]["min"]
    base_water_max = crop_data["water_per_acre_per_day"]["max"]
    
    adjusted_water_min = int(base_water_min * climate_factor["water_multiplier"] * request.land_size)
    adjusted_water_max = int(base_water_max * climate_factor["water_multiplier"] * request.land_size)
    
    # Calculate fertilizer requirements
    fertilizer_reqs = {}
    for nutrient, data in crop_data["fertilizer"].items():
        min_req = data["min"] * request.land_size * climate_factor["fertilizer_multiplier"]
        max_req = data["max"] * request.land_size * climate_factor["fertilizer_multiplier"]
        fertilizer_reqs[nutrient] = {
            "min": round(min_req, 1),
            "max": round(max_req, 1),
            "unit": data["unit"].replace("acre", f"{request.land_size} acres")
        }
    
    # Calculate investment and profit
    investment_min = crop_data["investment"]["min"] * request.land_size
    investment_max = crop_data["investment"]["max"] * request.land_size
    profit_min = crop_data["profit"]["min"] * request.land_size
    profit_max = crop_data["profit"]["max"] * request.land_size
    
    # Generate soil-specific recommendations
    soil_recommendations = []
    if soil_info["drainage"] == "poor":
        soil_recommendations.append("Install drainage systems to prevent waterlogging")
    if soil_info["fertility"] == "low":
        soil_recommendations.append("Add organic matter and compost to improve soil fertility")
    if soil_info["water_retention"] == "low":
        soil_recommendations.append("Use mulching to improve water retention")
    
    # Combine recommendations
    all_recommendations = crop_data["recommendations"] + soil_recommendations
    
    return CropPlanResponse(
        crop_type=request.crop_type.title(),
        land_size=request.land_size,
        water_requirements={
            "daily_total": f"{adjusted_water_min:,} - {adjusted_water_max:,} liters",
            "per_acre_per_day": f"{base_water_min} - {base_water_max} liters",
            "climate_adjusted": True,
            "irrigation_method": "Drip irrigation recommended for water efficiency"
        },
        fertilizer_requirements=fertilizer_reqs,
        chemical_requirements=crop_data["chemicals"],
        expected_yield=f"{crop_data['yield_per_acre']['min'] * request.land_size} - {crop_data['yield_per_acre']['max'] * request.land_size} {crop_data['yield_per_acre']['unit']}",
        investment_estimate=f"₹{investment_min:,} - ₹{investment_max:,}",
        profit_estimate=f"₹{profit_min:,} - ₹{profit_max:,}",
        recommendations=all_recommendations,
        timeline=crop_data["timeline"]
    )

# --- 5. USER AUTHENTICATION ENDPOINTS ---
@app.post("/register")
def register_user(email: str, password: str):
    conn = get_db_connection()
    try:
        user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
        if user: 
            raise HTTPException(status_code=400, detail="Email already registered")
        hashed_password = pwd_context.hash(password)
        conn.execute('INSERT INTO users (email, hashed_password) VALUES (?, ?)', (email, hashed_password))
        conn.commit()
    finally: 
        conn.close()
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

# --- 6. CROP PLANNING ENDPOINT ---
@app.post("/crop-plan", response_model=CropPlanResponse)
async def create_crop_plan(request: CropPlanRequest):
    """Generate comprehensive crop planning based on land size, crop type, and conditions"""
    try:
        plan = calculate_crop_plan(request)
        
        # Store the plan in Firebase for analytics (optional)
        if db:
            try:
                doc_ref = db.collection('crop_plans').document()
                doc_ref.set({
                    'crop_type': request.crop_type,
                    'land_size': request.land_size,
                    'soil_type': request.soil_type,
                    'climate': request.climate,
                    'location': request.location,
                    'timestamp': firestore.SERVER_TIMESTAMP,
                    'investment_range': plan.investment_estimate,
                    'expected_yield': plan.expected_yield
                })
            except Exception as e:
                print(f"Failed to store crop plan in Firebase: {e}")
        
        return plan
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/supported-crops")
async def get_supported_crops():
    """Get list of supported crops with basic information"""
    crops = []
    for crop_name, crop_data in CROP_REQUIREMENTS.items():
        crops.append({
            "name": crop_name.title(),
            "value": crop_name,
            "season": crop_data["growing_season"],
            "maturity_days": crop_data["maturity_days"],
            "yield_range": f"{crop_data['yield_per_acre']['min']}-{crop_data['yield_per_acre']['max']} {crop_data['yield_per_acre']['unit']}/acre"
        })
    return {"supported_crops": crops}

# --- 7. DISEASE DETECTION (Original Code) ---
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
    print("Disease detection model loaded successfully")
except FileNotFoundError:
    print("MODEL FILES NOT FOUND. Disease detection will not work.")
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
    if not model: 
        raise HTTPException(status_code=500, detail="Disease detection model is not loaded.")
    
    try:
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

        # Store prediction in Firebase
        if db:
            try:
                doc_ref = db.collection('reports').document()
                doc_ref.set({
                    'disease': predicted_class,
                    'confidence': prediction_confidence,
                    'location': firestore.GeoPoint(lat, long),
                    'timestamp': firestore.SERVER_TIMESTAMP
                })
            except Exception as e:
                print(f"Failed to store report in Firebase: {e}")

        advice = disease_info.get(predicted_class, {
            "title": "Unknown Disease", 
            "overview": "Disease information not available", 
            "prevention": {"title": "General Prevention", "steps": ["Maintain good plant hygiene", "Ensure proper spacing", "Water at soil level"]}, 
            "cure": {"title": "General Treatment", "steps": ["Consult local agricultural expert", "Remove affected parts", "Apply appropriate fungicide"]}
        })
        
        return {
            "disease": predicted_class, 
            "confidence": round(prediction_confidence, 4), 
            "details": advice
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/reports")
def get_all_reports():
    """Get all disease reports for mapping"""
    if not db:
        return {"error": "Firebase not available"}
    
    try:
        reports = []
        docs = db.collection('reports').limit(1000).stream()  # Limit for performance
        for doc in docs:
            report = doc.to_dict()
            if "location" in report and report["location"]:
                reports.append({
                    "id": doc.id,
                    "disease": report.get("disease"),
                    "confidence": report.get("confidence", 0),
                    "lat": report.get("location").latitude,
                    "long": report.get("location").longitude,
                    "timestamp": report.get("timestamp")
                })
        return {"reports": reports, "total": len(reports)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching reports: {str(e)}")

@app.get("/analytics")
async def get_analytics():
    """Get analytics data for dashboard"""
    if not db:
        return {"error": "Firebase not available"}
    
    try:
        # Get disease reports count
        reports_count = len(list(db.collection('reports').stream()))
        
        # Get crop plans count
        plans_count = len(list(db.collection('crop_plans').stream()))
        
        # Get most common diseases
        disease_docs = db.collection('reports').stream()
        disease_counter = {}
        for doc in disease_docs:
            disease = doc.to_dict().get('disease', 'Unknown')
            disease_counter[disease] = disease_counter.get(disease, 0) + 1
        
        most_common_diseases = sorted(disease_counter.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Get most planned crops
        crop_docs = db.collection('crop_plans').stream()
        crop_counter = {}
        for doc in crop_docs:
            crop = doc.to_dict().get('crop_type', 'Unknown')
            crop_counter[crop] = crop_counter.get(crop, 0) + 1
            
        most_planned_crops = sorted(crop_counter.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "total_reports": reports_count,
            "total_crop_plans": plans_count,
            "most_common_diseases": most_common_diseases,
            "most_planned_crops": most_planned_crops
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "firebase_connected": db is not None,
        "supported_crops": len(CROP_REQUIREMENTS),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/")
def root(): 
    return {
        "message": "Welcome to the CDEWS API!",
        "version": "2.0",
        "features": [
            "Disease Detection",
            "Crop Planning",
            "Analytics",
            "User Authentication"
        ],
        "endpoints": {
            "disease_detection": "/predict",
            "crop_planning": "/crop-plan",
            "supported_crops": "/supported-crops",
            "reports": "/reports",
            "analytics": "/analytics",
            "health": "/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting CDEWS API Server...")
    print("Features available:")
    print("- Disease Detection ✓")
    print("- Crop Planning ✓")
    print("- User Authentication ✓")
    print("- Analytics ✓")
    uvicorn.run(app, host="0.0.0.0", port=8000)