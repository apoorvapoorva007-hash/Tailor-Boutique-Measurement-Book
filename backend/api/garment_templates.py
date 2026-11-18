"""
Garment measurement templates and standard schema definitions
for Tailor & Boutique Measurement Book.
"""

GARMENT_TEMPLATES = {
    "Saree Blouse": {
        "title": "Saree Blouse",
        "description": "Traditional & Designer Saree Blouse measurement profile",
        "category": "Blouse",
        "default_fields": [
            {"key": "bust", "label": "Bust", "unit": "inches", "default": 34.0, "step": 0.25, "placeholder": "e.g. 34.0"},
            {"key": "waist", "label": "Waist / Underbust", "unit": "inches", "default": 28.0, "step": 0.25, "placeholder": "e.g. 28.0"},
            {"key": "shoulder", "label": "Shoulder", "unit": "inches", "default": 14.0, "step": 0.25, "placeholder": "e.g. 14.0"},
            {"key": "blouse_length", "label": "Blouse Length", "unit": "inches", "default": 14.5, "step": 0.25, "placeholder": "e.g. 14.5"},
            {"key": "sleeve_length", "label": "Sleeve Length", "unit": "inches", "default": 10.0, "step": 0.25, "placeholder": "e.g. 10.0 (Elbow/Short)"},
            {"key": "armhole", "label": "Armhole", "unit": "inches", "default": 16.0, "step": 0.25, "placeholder": "e.g. 16.0"},
            {"key": "front_neck_depth", "label": "Front Neck Depth", "unit": "inches", "default": 6.5, "step": 0.25, "placeholder": "e.g. 6.5"},
            {"key": "back_neck_depth", "label": "Back Neck Depth", "unit": "inches", "default": 8.5, "step": 0.25, "placeholder": "e.g. 8.5 (Deep/Regular)"},
        ],
        "style_options": ["Princess Cut", "Katori / 2-Piece Cut", "Single Dart", "Four Dart", "Boat Neck", "Backless / Dori", "Collar Blouse"]
    },
    "Chudidar": {
        "title": "Chudidar",
        "description": "Classic Chudidar & Top suit measurements",
        "category": "Ethnic Suit",
        "default_fields": [
            {"key": "chest", "label": "Chest", "unit": "inches", "default": 36.0, "step": 0.25, "placeholder": "e.g. 36.0"},
            {"key": "waist", "label": "Waist", "unit": "inches", "default": 30.0, "step": 0.25, "placeholder": "e.g. 30.0"},
            {"key": "hip", "label": "Hip", "unit": "inches", "default": 38.0, "step": 0.25, "placeholder": "e.g. 38.0"},
            {"key": "shoulder", "label": "Shoulder", "unit": "inches", "default": 14.5, "step": 0.25, "placeholder": "e.g. 14.5"},
            {"key": "top_length", "label": "Top Length", "unit": "inches", "default": 40.0, "step": 0.5, "placeholder": "e.g. 40.0"},
            {"key": "sleeve_length", "label": "Sleeve Length", "unit": "inches", "default": 16.0, "step": 0.25, "placeholder": "e.g. 16.0 (3/4th)"},
            {"key": "pant_length", "label": "Pant / Chudidar Length", "unit": "inches", "default": 42.0, "step": 0.5, "placeholder": "e.g. 42.0 (with gathers)"},
            {"key": "ankle", "label": "Ankle", "unit": "inches", "default": 9.5, "step": 0.25, "placeholder": "e.g. 9.5"},
            {"key": "neck_depth", "label": "Neck Depth", "unit": "inches", "default": 6.5, "step": 0.25, "placeholder": "e.g. 6.5"},
        ],
        "style_options": ["A-Line", "Straight Cut", "Gathered Chudidar", "Pencil Fit Bottom"]
    },
    "Kurti": {
        "title": "Kurti",
        "description": "Casual, Designer & Office wear Kurti measurements",
        "category": "Tops & Tunics",
        "default_fields": [
            {"key": "bust", "label": "Bust", "unit": "inches", "default": 36.0, "step": 0.25, "placeholder": "e.g. 36.0"},
            {"key": "waist", "label": "Waist", "unit": "inches", "default": 31.0, "step": 0.25, "placeholder": "e.g. 31.0"},
            {"key": "hip", "label": "Hip", "unit": "inches", "default": 39.0, "step": 0.25, "placeholder": "e.g. 39.0"},
            {"key": "shoulder", "label": "Shoulder", "unit": "inches", "default": 14.0, "step": 0.25, "placeholder": "e.g. 14.0"},
            {"key": "kurti_length", "label": "Kurti Length", "unit": "inches", "default": 42.0, "step": 0.5, "placeholder": "e.g. 42.0 (Calf/Ankle)"},
            {"key": "sleeve_length", "label": "Sleeve Length", "unit": "inches", "default": 17.0, "step": 0.25, "placeholder": "e.g. 17.0"},
            {"key": "armhole", "label": "Armhole", "unit": "inches", "default": 16.5, "step": 0.25, "placeholder": "e.g. 16.5"},
            {"key": "neck_depth", "label": "Neck Depth", "unit": "inches", "default": 6.0, "step": 0.25, "placeholder": "e.g. 6.0"},
        ],
        "style_options": ["Straight Fit", "Anarkali / Flared", "Angrakha", "High-Low Hem", "Shirt Collar"]
    },
    "Gown": {
        "title": "Gown",
        "description": "Evening, Cocktail & Bridal Party Gown measurements",
        "category": "Dresses",
        "default_fields": [
            {"key": "bust", "label": "Bust", "unit": "inches", "default": 35.0, "step": 0.25, "placeholder": "e.g. 35.0"},
            {"key": "waist", "label": "Waist", "unit": "inches", "default": 29.0, "step": 0.25, "placeholder": "e.g. 29.0"},
            {"key": "hip", "label": "Hip", "unit": "inches", "default": 38.0, "step": 0.25, "placeholder": "e.g. 38.0"},
            {"key": "shoulder", "label": "Shoulder", "unit": "inches", "default": 14.0, "step": 0.25, "placeholder": "e.g. 14.0"},
            {"key": "gown_length", "label": "Gown Length", "unit": "inches", "default": 56.0, "step": 0.5, "placeholder": "e.g. 56.0 (Floor Length)"},
            {"key": "sleeve_length", "label": "Sleeve Length", "unit": "inches", "default": 20.0, "step": 0.25, "placeholder": "e.g. 20.0 (Full/Sleeveless)"},
            {"key": "neck_depth", "label": "Neck Depth", "unit": "inches", "default": 7.0, "step": 0.25, "placeholder": "e.g. 7.0 (V-Neck/Sweetheart)"},
        ],
        "style_options": ["Ball Gown", "Mermaid / Fishtail", "Empire Waist", "A-Line Flare", "Cape Gown"]
    },
    "Lehenga": {
        "title": "Lehenga",
        "description": "Bridal, Festive & Sangeet Lehenga Choli set measurements",
        "category": "Bridal & Festive",
        "default_fields": [
            {"key": "waist", "label": "Waist", "unit": "inches", "default": 30.0, "step": 0.25, "placeholder": "e.g. 30.0 (Skirt Waist)"},
            {"key": "hip", "label": "Hip", "unit": "inches", "default": 40.0, "step": 0.25, "placeholder": "e.g. 40.0"},
            {"key": "lehenga_length", "label": "Lehenga Length", "unit": "inches", "default": 42.0, "step": 0.5, "placeholder": "e.g. 42.0"},
            {"key": "waistband", "label": "Waistband", "unit": "inches", "default": 2.0, "step": 0.25, "placeholder": "e.g. 2.0 (Patti Width)"},
            {"key": "blouse_bust", "label": "Blouse Bust", "unit": "inches", "default": 35.0, "step": 0.25, "placeholder": "e.g. 35.0"},
            {"key": "blouse_length", "label": "Blouse Length", "unit": "inches", "default": 15.0, "step": 0.25, "placeholder": "e.g. 15.0"},
            {"key": "shoulder", "label": "Blouse Shoulder", "unit": "inches", "default": 14.0, "step": 0.25, "placeholder": "e.g. 14.0"},
            {"key": "sleeve_length", "label": "Blouse Sleeve Length", "unit": "inches", "default": 11.0, "step": 0.25, "placeholder": "e.g. 11.0"},
        ],
        "style_options": ["Circular Kalidar", "Pleated Umbrella", "Panelled / Kali", "Fish Cut"]
    },
    "Salwar Suit": {
        "title": "Salwar Suit",
        "description": "Punjabi, Patiala & Regular Salwar Suit measurements",
        "category": "Ethnic Suit",
        "default_fields": [
            {"key": "chest", "label": "Chest", "unit": "inches", "default": 36.0, "step": 0.25, "placeholder": "e.g. 36.0"},
            {"key": "waist", "label": "Waist", "unit": "inches", "default": 31.0, "step": 0.25, "placeholder": "e.g. 31.0"},
            {"key": "hip", "label": "Hip", "unit": "inches", "default": 39.0, "step": 0.25, "placeholder": "e.g. 39.0"},
            {"key": "shoulder", "label": "Shoulder", "unit": "inches", "default": 14.0, "step": 0.25, "placeholder": "e.g. 14.0"},
            {"key": "top_length", "label": "Top Length", "unit": "inches", "default": 38.0, "step": 0.5, "placeholder": "e.g. 38.0"},
            {"key": "sleeve_length", "label": "Sleeve Length", "unit": "inches", "default": 16.0, "step": 0.25, "placeholder": "e.g. 16.0"},
            {"key": "salwar_length", "label": "Salwar Length", "unit": "inches", "default": 39.0, "step": 0.5, "placeholder": "e.g. 39.0"},
        ],
        "style_options": ["Full Patiala", "Semi Patiala", "Straight Salwar", "Afghani / Balloon"]
    },
    "Custom Garment": {
        "title": "Custom Garment",
        "description": "Bespoke & Tailor-made garment with custom measurement fields",
        "category": "Custom",
        "default_fields": [
            {"key": "length", "label": "Total Length", "unit": "inches", "default": 30.0, "step": 0.25, "placeholder": "e.g. 30.0"},
            {"key": "chest_bust", "label": "Chest / Bust", "unit": "inches", "default": 36.0, "step": 0.25, "placeholder": "e.g. 36.0"},
            {"key": "waist", "label": "Waist", "unit": "inches", "default": 30.0, "step": 0.25, "placeholder": "e.g. 30.0"},
            {"key": "shoulder", "label": "Shoulder", "unit": "inches", "default": 14.5, "step": 0.25, "placeholder": "e.g. 14.5"},
        ],
        "style_options": ["Custom Cut", "Designer Drape", "Western Form", "Indo-Western Fusion"]
    }
}
