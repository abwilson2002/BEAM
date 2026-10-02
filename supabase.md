CURRENT SUPABASE DATABASE STRUCTURE

IMPORTANT:
There are NOT separate "seekers" and "givers" tables.
Both seekers and givers are stored in the "profiles" table.
The "role" variable determines whether the user is a seeker or giver.


==================================================
TABLE: profiles
==================================================

Stores all user accounts (both seekers and givers).

id
- Type: uuid
- Unique user ID
- Connected to Supabase Auth

role
- Type: text
- Either "seeker" or "giver"

name
- Type: text
- User's name

email
- Type: text
- User's email

website
- Type: text
- Seeker portfolio or giver/company website

zip
- Type: text
- User's ZIP code

lat
- Type: float8
- User's latitude
- Used by Mapbox and location calculations

lng
- Type: float8
- User's longitude
- Used by Mapbox and location calculations

radius_miles
- Type: integer
- Default: 25
- Determines the seeker's event/search/notification radius

notifications_opt_in
- Type: boolean
- Whether the seeker wants event notifications

resume_path
- Type: text
- Location of the seeker's resume in Supabase Storage

created_at
- Type: timestamptz
- When the profile was created


==================================================
TABLE: seeker_interests
==================================================

Stores the job interests of seekers.
One seeker can have multiple interests.

seeker_id
- Type: uuid
- References profiles.id

interest
- Type: text
- Example: "Software Engineering"
- Example: "Cybersecurity"
- Example: "Data Analytics"


==================================================
TABLE: events
==================================================

Stores events created by givers.

id
- Type: uuid
- Unique event ID

giver_id
- Type: uuid
- References profiles.id
- Identifies which giver created the event

title
- Type: text
- Name of the event

description
- Type: text
- Description of the event

location_name
- Type: text
- Human-readable location
- Example: "Provo, UT"

lat
- Type: float8
- Event latitude
- Used by Mapbox

lng
- Type: float8
- Event longitude
- Used by Mapbox

starts_at
- Type: timestamptz
- Date/time the event begins

created_at
- Type: timestamptz
- Date/time the event was created


==================================================
TABLE: event_registrations
==================================================

Connects seekers to events they register for.

event_id
- Type: uuid
- References events.id

seeker_id
- Type: uuid
- References profiles.id

created_at
- Type: timestamptz
- When the seeker registered


==================================================
DATABASE RELATIONSHIPS
==================================================

Supabase Auth
      |
      | user ID
      v
   profiles
   /      \
  /        \
seeker     giver
  |          |
  v          v
seeker_    events
interests    |
     \       /
      \     /
       v   v
event_registrations


==================================================
MAPBOX / HEATMAP
==================================================

Seekers have:
- lat
- lng
- job interests

Givers can use the seeker_heatmap() Supabase function to get
seeker locations for the Mapbox heatmap.

The function can filter seekers by their job interests.

Example flow:

Giver selects:
"Software Engineering"

        ↓

seeker_heatmap(["Software Engineering"])

        ↓

Supabase finds matching seekers

        ↓

Returns their lat/lng

        ↓

Mapbox displays heatmap


==================================================
NEARBY EVENTS
==================================================

Seekers have:
- lat
- lng
- radius_miles

Events have:
- lat
- lng

The events_near_location() Supabase function finds upcoming
events within the seeker's selected radius.


==================================================
EVENT NOTIFICATIONS
==================================================

If:

notifications_opt_in = true

Supabase can determine whether a giver's new event is within
that seeker's radius.

The invite_recipients() function handles this lookup.

This can later connect to an email service to automatically
send event invitations.


==================================================
IMPORTANT FOR BACKEND CODE
==================================================

DO NOT USE:

supabase.table("seekers")

There is no "seekers" table.

Seekers and givers both use:

supabase.table("profiles")

and are distinguished using:

role = "seeker"

or:

role = "giver"