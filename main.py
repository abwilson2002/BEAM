from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

# Define the expected JSON structure from the frontend
class SeekerCreate(BaseModel):
    name: str
    email: str
    zip_code: str
    interest: str
    # Omit the resume upload for now to keep the initial merge simple

app = FastAPI()

@app.post("/api/seekers")
def create_seeker(seeker: SeekerCreate):
    """
    Person 1 will POST to this endpoint when a user fills out the registration form.
    """
    # For the 7-hour sprint demo, just print it to the terminal to verify it works
    print(f"🔥 NEW SEEKER REGISTERED: {seeker.name} in {seeker.zip_code}")
    
    # Later, you will swap this print statement with a Supabase insert
    return {"message": "Seeker successfully created", "data": seeker}



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
SUPABASE_URL = "https://your-project-id.supabase.co" # Get from teammate
SUPABASE_KEY = "ey-your-long-anon-key-string"        # Get from teammate
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 2. Define expected POST data
class SeekerCreate(BaseModel):
    name: str
    email: str
    zip_code: str
    interest: str

# 3. Endpoints
@app.get("/")
def health_check():
    return {"status": "Backend is alive!"}

@app.get("/api/heatmap")
def get_heatmap_data(interest: str = None):
    """
    Fetches real seeker data from the Supabase 'seekers' table.
    """
    # Ask your teammate what they named the table. Assuming "seekers" here.
    query = supabase.table("seekers").select("*")
    
    # Apply database-level filtering if an interest is passed
    if interest:
        query = query.eq("interest", interest)
        
    response = query.execute()
    
    return {
        "count": len(response.data),
        "data": response.data
    }

@app.post("/api/seekers")
def create_seeker(seeker: SeekerCreate):
    """
    Inserts a new seeker into the Supabase database.
    """
    # Convert Pydantic model to dictionary
    seeker_data = seeker.model_dump()
    
    # Insert into Supabase
    response = supabase.table("seekers").insert(seeker_data).execute()
    
    return {"message": "Seeker successfully created", "data": response.data}