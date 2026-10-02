from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleWare
import random

app = FastAPI()

# CRITICAL for the hackathon: Allows the Next.js frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Swap with Vercel frontend URL later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Fake In-Memory Database (No time for PostGIS right now)
def generate_fake_seekers(count=500):
    # Generates random coordinates loosely bounded to the US
    return [
        {
            "id": i,
            "lat": random.uniform(25.0, 49.0),
            "lng": random.uniform(-125.0, -66.0),
            "interest": random.choice(["Frontend", "Backend", "Data", "Design"])
        }
        for i in range(count)
    ]

fake_seekers = generate_fake_seekers()

# 2. Endpoints
@app.get("/")
def health_check():
    return {"status": "Backend is alive!"}

@app.get("/api/heatmap")
def get_heatmap_data(interest: str = None):
    """
    Person 2 will call this endpoint to populate the Mapbox heatmap.
    They can pass ?interest=Backend to filter the results.
    """
    if interest:
        filtered = [s for s in fake_seekers if s["interest"].lower() == interest.lower()]
        return {"count": len(filtered), "data": filtered}
    
    return {"count": len(fake_seekers), "data": fake_seekers}