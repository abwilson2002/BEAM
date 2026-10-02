from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import requests
import random
import uuid
from lamp.router import router as lamp_router

# Define the expected JSON structure from the frontend
class SeekerCreate(BaseModel):
    name: str
    email: str
    zip: str
    lat: float
    lng: float
    interest: str
    # Omit the resume upload for now to keep the initial merge simple

app = FastAPI()
app.include_router(lamp_router)





# CRITICAL for the hackathon: Allows the Next.js frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    # Replace the Vercel URL with your actual deployed URL
    allow_origins=[
        "http://localhost:3000", 
        "https://beam-beta-one.vercel.app/" 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
SUPABASE_URL = "https://bneqayyaghpcuzpwnqrm.supabase.co" # Get from teammate
SUPABASE_KEY = "sb_publishable_uyZrw7xruDn0ieZjTXMaiw_fppY4o_Q"        # Get from teammate
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. Define expected POST data
class SeekerCreate(BaseModel):
    name: str
    email: str
    zip_code: str
    interest: str

class EventCreate(BaseModel):
    giver_id: str
    title: str
    description: str
    zip: str
    starts_at: str # Format: "2026-10-15T18:00:00Z"

# 3. Endpoints
@app.get("/")
def health_check():
    return {"status": "Backend is alive!"}

@app.post("/api/seekers")
def create_seeker(seeker: SeekerCreate):
    """
    Two-step insert: creates the profile, then links the interest.
    """
    # 1. Geocode the zip
    lat, lng = 39.8283, -98.5795 # Default center US
    geo_url = f"https://api.zippopotam.us/us/{seeker.zip}"
    geo_response = requests.get(geo_url)
    if geo_response.status_code == 200:
        geo_json = geo_response.json()
        lat = float(geo_json["places"][0]["latitude"])
        lng = float(geo_json["places"][0]["longitude"])

    # 2. Insert into profiles table
    profile_data = {
        "role": "seeker",
        "name": seeker.name,
        "email": seeker.email,
        "zip": seeker.zip,
        "lat": lat,
        "lng": lng
        # id is omitted so Supabase auto-generates the UUID
    }
    profile_response = supabase.table("profiles").insert(profile_data).execute()
    
    # Extract the auto-generated UUID from the new profile
    new_profile_id = profile_response.data[0]["id"]

    # 3. Insert into the relational interests table
    interest_data = {
        "seeker_id": new_profile_id,
        "interest": seeker.interest
    }
    supabase.table("seeker_interests").insert(interest_data).execute()

    return {"message": "Seeker profile and interests successfully created!"}


@app.get("/api/heatmap")
def get_heatmap_data(interest: str = None):
    """
    Fetches seeker coordinates from the profiles table.
    Filters using the relational seeker_interests table if needed.
    """
    if interest:
        # The !inner join forces it to only return profiles that have this exact interest
        query = supabase.table("profiles").select("lat, lng, seeker_interests!inner(interest)").eq("role", "seeker").eq("seeker_interests.interest", interest)
    else:
        query = supabase.table("profiles").select("lat, lng").eq("role", "seeker")
        
    response = query.execute()
    return {"count": len(response.data), "data": response.data}

@app.post("/api/seed-test-data")
def seed_test_data(count: int = 500):
    """
    Generates UUIDs in Python so we can batch-insert into both tables instantly.
    """
    profiles_to_insert = []
    interests_to_insert = []
    job_interests = ["Software Engineering", "Cybersecurity", "Data Analytics"]

    for i in range(count):
        # Generate the UUID upfront so we can link the interest immediately
        profile_id = str(uuid.uuid4())

        profiles_to_insert.append({
            "id": profile_id,
            "role": "seeker",
            "name": f"Fake Seeker {i}",
            "email": f"fake{i}@example.com",
            "zip": "00000",
            "lat": round(random.uniform(25.0, 49.0), 4),
            "lng": round(random.uniform(-125.0, -66.0), 4)
        })

        interests_to_insert.append({
            "seeker_id": profile_id,
            "interest": random.choice(job_interests)
        })

    # Execute batch inserts
    supabase.table("profiles").insert(profiles_to_insert).execute()
    supabase.table("seeker_interests").insert(interests_to_insert).execute()

    return {"message": f"Successfully injected {count} fake profiles and interests!"}

@app.delete("/api/clear-test-data")
def clear_test_data():
    """
    Wipes the fake data. If your teammate set up Foreign Keys correctly,
    deleting the profile will automatically delete their linked interests.
    """
    response = supabase.table("profiles").delete().eq("zip", "00000").execute()
    return {"message": "Fake test data wiped!", "deleted_count": len(response.data)}

@app.post("/api/events")
def create_event(event: EventCreate):
    """
    Creates an event, automatically converts the zip into Mapbox coordinates, 
    and generates a readable city/state location name.
    """
    lat, lng = 39.8283, -98.5795 # Default fallback
    location_name = f"Zip Code: {event.zip}"
    
    # Ping Zippopotam to get the exact location data
    geo_url = f"https://api.zippopotam.us/us/{event.zip}"
    geo_response = requests.get(geo_url)
    
    if geo_response.status_code == 200:
        geo_json = geo_response.json()
        lat = float(geo_json["places"][0]["latitude"])
        lng = float(geo_json["places"][0]["longitude"])
        city = geo_json["places"][0]["place name"]
        state = geo_json["places"][0]["state abbreviation"]
        location_name = f"{city}, {state}"

    # Build the database insert payload
    event_data = {
        "id": str(uuid.uuid4()),
        "giver_id": event.giver_id,
        "title": event.title,
        "description": event.description,
        "location_name": location_name,
        "lat": lat,
        "lng": lng,
        "starts_at": event.starts_at,
        "zip": event.zip 
    }
    
    response = supabase.table("events").insert(event_data).execute()
    return {"message": "Event successfully created!", "data": response.data}


@app.get("/api/events")
def get_local_events(zip: str):
    """
    Allows a Seeker to fetch all events happening in a specific zip code.
    Example frontend request: fetch('/api/events?zip=84604')
    """
    # .eq("zip", zip) ensures we only return events matching the exact zip code
    response = supabase.table("events").select("*").eq("zip", zip).execute()
    
    return {
        "count": len(response.data),
        "data": response.data
    }



