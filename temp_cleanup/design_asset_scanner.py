import os
import shutil
import json

source_base = r"C:\Users\Admin\Documents\BerntoutGlobal XXL\Tmi PDF's"
target_base = r"C:\Users\Admin\Documents\BerntoutGlobal XXL\tmi-platform\apps\web\public\design-reference"

categories = [
    "homepages", "fan-dashboard", "artist-dashboard", "booking-dashboard",
    "promotional-hub", "season-pass", "avatar-system", "avatar-store",
    "artist-settings", "profile-pages", "hosts", "rooms", "cypher-arena",
    "venue-skins", "ads", "ui-elements"
]

for cat in categories:
    os.makedirs(os.path.join(target_base, cat), exist_ok=True)

design_map = {cat: [] for cat in categories}

# Mapping rules
def map_file(filename, relative_path):
    fn_lower = filename.lower()
    if fn_lower.endswith('.zip') or fn_lower.endswith('.pdf') or fn_lower.endswith('.htm'):
        return None
        
    if "homepage" in fn_lower:
        return "homepages"
    elif "fan" in fn_lower:
        return "fan-dashboard"
    elif "performer" in fn_lower or "artist" in fn_lower:
        return "artist-dashboard"
    elif "advertiser" in fn_lower or "sponsor" in fn_lower or "booking" in fn_lower:
        return "booking-dashboard"
    elif "season pass" in fn_lower:
        return "season-pass"
    elif "avatar" in fn_lower:
        return "avatar-system"
    elif "admin" in fn_lower or "profile" in fn_lower:
        return "profile-pages"
    elif "bebo" in fn_lower or "host" in fn_lower or "julius" in fn_lower or "ralph" in fn_lower or "tiana" in fn_lower:
        return "hosts"
    elif "venue" in fn_lower.replace("game show and venue skins", "venue") and "seating" in relative_path.lower():
        return "venue-skins"
    elif "venue" in fn_lower or "download" in fn_lower or "images" in fn_lower:
        return "rooms"
    else:
        return "ui-elements" # default

# 1. Base files
for f in os.listdir(source_base):
    f_path = os.path.join(source_base, f)
    if os.path.isfile(f_path):
        cat = map_file(f, f)
        if cat:
            shutil.copy(f_path, os.path.join(target_base, cat, f))
            design_map[cat].append(f)

# 2. Profiles
profiles_dir = os.path.join(source_base, "Profiles")
if os.path.exists(profiles_dir):
    for f in os.listdir(profiles_dir):
        f_path = os.path.join(profiles_dir, f)
        if os.path.isfile(f_path):
            cat = map_file(f, f)
            if cat:
                shutil.copy(f_path, os.path.join(target_base, cat, f))
                design_map[cat].append(f)

# 3. Host, Julius, and extra
hosts_dir = os.path.join(source_base, "Host , Julius , and extra")
if os.path.exists(hosts_dir):
    for f in os.listdir(hosts_dir):
        f_path = os.path.join(hosts_dir, f)
        if os.path.isfile(f_path):
            cat = map_file(f, f)
            if cat:
                shutil.copy(f_path, os.path.join(target_base, cat, f))
                design_map[cat].append(f)

# 4. game show and venue skins
game_dir = os.path.join(source_base, "game show and venue skins")
if os.path.exists(game_dir):
    for f in os.listdir(game_dir):
        f_path = os.path.join(game_dir, f)
        if os.path.isfile(f_path):
            cat = map_file(f, "game show and venue skins")
            if cat:
                # avoid collision by adding prefix if needed
                target_f = f
                if target_f in design_map[cat]: target_f = "game_" + f
                shutil.copy(f_path, os.path.join(target_base, cat, target_f))
                design_map[cat].append(target_f)

# 5. Venue Skins Plus Seating
venue_dir = os.path.join(source_base, "Venue Skins Plus Seating")
if os.path.exists(venue_dir):
    for f in os.listdir(venue_dir):
        f_path = os.path.join(venue_dir, f)
        if os.path.isfile(f_path):
            cat = map_file(f, "venue skins plus seating")
            if cat:
                target_f = f
                if target_f in design_map[cat]: target_f = "venue_" + f
                shutil.copy(f_path, os.path.join(target_base, cat, target_f))
                design_map[cat].append(target_f)

with open(os.path.join(target_base, "designMap.json"), "w") as f:
    json.dump(design_map, f, indent=2)

component_map = {
    "fan-dashboard": {
        "component": "FanDashboard",
        "route": "/fan"
    },
    "artist-dashboard": {
        "component": "ArtistDashboard",
        "route": "/artist"
    },
    "rooms": {
        "component": "WatchPartyRoom",
        "route": "/rooms"
    },
    "homepages": {
        "component": "HomepageLayout",
        "route": "/home"
    },
    "booking-dashboard": {
        "component": "BookingDashboard",
        "route": "/booking"
    },
    "season-pass": {
        "component": "SeasonPassGuitar",
        "route": "/artist/season-pass"
    },
    "avatar-system": {
        "component": "AvatarBuilder",
        "route": "/avatar"
    },
    "profile-pages": {
        "component": "ArtistBioPage",
        "route": "/profile"
    }
}

with open(os.path.join(target_base, "componentMap.json"), "w") as f:
    json.dump(component_map, f, indent=2)

print("Done scanning and copying.")
