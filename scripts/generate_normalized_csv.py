import openpyxl
import csv
import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[\(\)\/\,\&\.\+]', ' ', text)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'\s+', '-', text).strip('-')
    return text

excel_path = r'client info and reqvierments\Products_website.xlsx'
wb = openpyxl.load_workbook(excel_path)
sheet = wb.active

existing_products = [
    {"name": "Castor oil and its derivatives", "slug": "castor-oil-and-derivatives", "category": "Personal Care Raw Materials"},
    {"name": "Herbal / botanical extracts", "slug": "herbal-botanical-extracts", "category": "Personal Care Raw Materials"},
    {"name": "Sodium lauryl ether sulfate (SLES)", "slug": "sodium-lauryl-ether-sulfate-sles", "category": "Personal Care Raw Materials"},
    {"name": "Salicylic acid", "slug": "salicylic-acid", "category": "Personal Care Raw Materials"},
    {"name": "Glycolic acid", "slug": "glycolic-acid", "category": "Personal Care Raw Materials"},
    {"name": "Vitamin E acetate", "slug": "vitamin-e-acetate", "category": "Personal Care Raw Materials"},
    {"name": "Kaolin clay powder", "slug": "kaolin-clay-powder", "category": "Personal Care Raw Materials"},
    {"name": "Ashwagandha extract", "slug": "ashwagandha-extract", "category": "Nutraceutical Raw Materials"},
    {"name": "Turmeric / curcumin extract", "slug": "turmeric-curcumin-extract", "category": "Nutraceutical Raw Materials"},
    {"name": "Boswellia serrata extract", "slug": "boswellia-serrata-extract", "category": "Nutraceutical Raw Materials"},
    {"name": "Bacopa monnieri extract", "slug": "bacopa-monnieri-extract", "category": "Nutraceutical Raw Materials"},
    {"name": "Moringa oleifera extract", "slug": "moringa-oleifera-extract", "category": "Nutraceutical Raw Materials"},
    {"name": "Amla extract", "slug": "amla-extract", "category": "Nutraceutical Raw Materials"},
    {"name": "Green tea and Garcinia cambogia extracts", "slug": "green-tea-and-garcinia-cambogia-extracts", "category": "Nutraceutical Raw Materials"},
    {"name": "Pea protein isolate", "slug": "pea-protein-isolate", "category": "Nutraceutical Raw Materials"},
    {"name": "Xanthan gum", "slug": "xanthan-gum", "category": "Nutraceutical Raw Materials"},
    {"name": "Soybean meal", "slug": "soybean-meal", "category": "Animal Feed"},
    {"name": "Rapeseed / mustard meal", "slug": "rapeseed-mustard-meal", "category": "Animal Feed"},
    {"name": "Cottonseed meal", "slug": "cottonseed-meal", "category": "Animal Feed"},
    {"name": "Feed-grade vitamins and minerals", "slug": "feed-grade-vitamins-and-minerals", "category": "Animal Feed"},
]

# Forms extracted from Types rows
forms_map = {
    1: "Whole, Cut/sifted (C/S), Powdered, Tea-bag Cut (TBC)",
    2: "Whole, ground, blends, seeds",
    9: "Minced, Chopped, flakes, kibbled, granules, powdered"
}

normalized_records = []

# Map columns to categories and subcategories
for c in range(1, sheet.max_column + 1):
    col_header = sheet.cell(1, c).value.strip() if sheet.cell(1, c).value else ""
    col_forms = forms_map.get(c, "")
    
    for r in range(2, sheet.max_row + 1):
        cell_val = sheet.cell(r, c).value
        if cell_val is None or str(cell_val).strip() == "":
            continue
        orig_name = str(cell_val).strip()
        
        # Check if it's a Types row
        if orig_name.lower().startswith("types:"):
            print(f"Skipping Types row in Col {c}: {orig_name}")
            continue
            
        clean_name = orig_name
        slug = ""
        prop_cat = ""
        prop_sub = ""
        seasonal = "No"
        duplicate_of = ""
        existing_match = ""
        notes = ""
        forms = col_forms
        
        # Category-specific logic
        if c == 1: # Harbal Powder
            prop_cat = "Nutraceutical Raw Materials"
            prop_sub = "Herbal & Botanical Powders"
            
            if orig_name == "Aloevera":
                clean_name = "Aloe Vera Powder"
                notes = "Typo fixed: Aloevera -> Aloe Vera Powder"
            elif orig_name == "Wheatgress":
                clean_name = "Wheatgrass Powder"
                notes = "Typo fixed: Wheatgress -> Wheatgrass Powder"
            elif orig_name == "Tulsi (Holy Basil)":
                clean_name = "Tulsi (Holy Basil) Powder"
            elif orig_name == "Rose petal":
                clean_name = "Rose Petal Powder"
            elif orig_name == "Indigo/ henna powder":
                clean_name = "Indigo / Henna Powder"
                notes = "Dual herbal powder item kept as single catalogue entry"
            else:
                clean_name = f"{orig_name} Powder"
                
            slug = slugify(clean_name)
            
            if orig_name == "Ashwagandha":
                existing_match = "ashwagandha-extract"
                notes = "Distinct from existing Ashwagandha extract (whole herb/powder vs standardized extract)"
            elif orig_name == "Moringa":
                existing_match = "moringa-oleifera-extract"
                notes = "Distinct from existing Moringa extract"
            elif orig_name == "Amla":
                existing_match = "amla-extract"
                notes = "Distinct from existing Amla extract"

        elif c == 2: # Spices and seasoning
            prop_cat = "Food & Food Ingredients"
            prop_sub = "Spices & Seasoning"
            
            if orig_name == "Chilli":
                clean_name = "Red Chilli"
            elif orig_name == "Chilli flakes":
                clean_name = "Chilli Flakes"
            elif orig_name == "Oragano":
                clean_name = "Oregano"
                notes = "Typo fixed: Oragano -> Oregano"
            elif orig_name == "Mustrad":
                clean_name = "Mustard Seeds"
                notes = "Typo fixed: Mustrad -> Mustard Seeds"
            elif orig_name == "Cinnamon/ Cassia":
                clean_name = "Cinnamon / Cassia"
                notes = "Single entry for Cinnamon/Cassia export bark"
            elif orig_name == "Turmeric":
                clean_name = "Turmeric (Whole / Ground)"
                existing_match = "turmeric-curcumin-extract"
                notes = "Distinct from existing Turmeric / Curcumin extract"
            elif orig_name == "Cumin":
                clean_name = "Cumin Seeds"
            elif orig_name == "Coriander":
                clean_name = "Coriander Seeds"
            elif orig_name == "Fennel":
                clean_name = "Fennel Seeds"
            elif orig_name == "Fenugreek":
                clean_name = "Fenugreek Seeds"
            elif orig_name == "Celery seed":
                clean_name = "Celery Seeds"
            elif orig_name == "Ajwain":
                clean_name = "Ajwain (Carom Seeds)"
            elif orig_name == "Sesame seeds":
                clean_name = "Sesame Seeds"
            elif orig_name == "Star anise":
                clean_name = "Star Anise"
            elif orig_name == "Bay leaf":
                clean_name = "Bay Leaf"
            elif orig_name == "Curry powder":
                clean_name = "Curry Powder"
            elif orig_name == "Himalayan pink Salt":
                clean_name = "Himalayan Pink Salt"
                forms = "Granules, fine powder, coarse rocks"
            else:
                clean_name = orig_name
                
            slug = slugify(clean_name)

        elif c == 3: # Superfoods
            prop_cat = "Food & Food Ingredients"
            prop_sub = "Superfoods"
            forms = "Whole seeds, kernels, flakes, powder"
            
            if orig_name == "Pysillum husk":
                clean_name = "Psyllium Husk & Powder"
                slug = "psyllium-husk-powder"
                notes = "Typo fixed: Pysillum -> Psyllium Husk & Powder"
            elif orig_name == "Flax seeds":
                clean_name = "Flax Seeds"
                slug = "flax-seeds"
            elif orig_name == "Chia seeds":
                clean_name = "Chia Seeds"
                slug = "chia-seeds"
            elif orig_name == "Watermelon seeds":
                clean_name = "Watermelon Seeds"
                slug = "watermelon-seeds"
            elif orig_name == "Makhana (Fox nuts)":
                clean_name = "Makhana (Fox Nuts)"
                slug = "makhana-fox-nuts"
            elif orig_name == "Dill seeds":
                clean_name = "Dill Seeds"
                slug = "dill-seeds"
            elif orig_name == "Sunflower seeds":
                clean_name = "Sunflower Seeds"
                slug = "sunflower-seeds"
            elif orig_name == "Black seed ( Nigella seeds)":
                clean_name = "Black Seed (Nigella Seeds)"
                slug = "black-seed-nigella"
                notes = "Cleaned spacing in Nigella seeds"
            elif orig_name == "Basil seeds":
                clean_name = "Basil Seeds"
                slug = "basil-seeds"
            else:
                clean_name = orig_name
                slug = slugify(clean_name)

        elif c == 4: # Personal care raw materials
            prop_cat = "Personal Care Raw Materials"
            
            if orig_name == "Isopropyle alcohol":
                clean_name = "Isopropyl Alcohol (IPA)"
                slug = "isopropyl-alcohol"
                notes = "Typo fixed: Isopropyle -> Isopropyl Alcohol"
                prop_sub = "Surfactants & Cleansing Agents"
            elif orig_name == "Guargum":
                clean_name = "Guar Gum (Cosmetic / Technical Grade)"
                slug = "guar-gum"
                notes = "Typo fixed: Guargum -> Guar Gum"
                prop_sub = "Carrier Oils & Specialty Lipids"
            elif orig_name == "Herbal Extracts":
                clean_name = "Herbal / Botanical Extracts"
                slug = "herbal-botanical-extracts"
                duplicate_of = "herbal-botanical-extracts"
                existing_match = "herbal-botanical-extracts"
                notes = "OVERLAP: Merged with existing catalogue entry (herbal-botanical-extracts); do not duplicate"
                prop_sub = "Cosmetic Active Extracts"
            elif orig_name == "Vegetable oils":
                clean_name = "Vegetable Oils (Cosmetic Grade)"
                slug = "vegetable-oils-cosmetic"
                prop_sub = "Carrier Oils & Specialty Lipids"
            elif orig_name == "Essential oils":
                clean_name = "Essential Oils (Cosmetic Grade)"
                slug = "essential-oils-cosmetic"
                prop_sub = "Cosmetic Active Extracts"
            elif orig_name == "Chemical raw material":
                clean_name = "Chemical Raw Materials (Cosmetic Grade)"
                slug = "chemical-raw-materials-cosmetic"
                prop_sub = "Surfactants & Cleansing Agents"
            else:
                clean_name = orig_name
                slug = slugify(clean_name)
                prop_sub = "Specialty Cosmetic Actives & Inorganics"

        elif c == 5: # Pulses, Rice & Agriculture commodities
            prop_cat = "Food & Food Ingredients"
            prop_sub = "Pulses, Grains & Agri Commodities"
            
            if orig_name == "peanut":
                clean_name = "Peanuts (Groundnuts)"
                slug = "peanuts-groundnuts"
            elif orig_name == "Chickpeas/ Split chickpeas":
                clean_name = "Chickpeas / Split Chickpeas (Chana Dal)"
                slug = "chickpeas-split-chickpeas"
                notes = "Single entry for whole chickpeas and split chickpeas (Chana Dal)"
            elif orig_name == "Husked Coconut/ Desiccated coconut":
                clean_name = "Husked Coconut / Desiccated Coconut"
                slug = "coconut-husked-desiccated"
                notes = "Single entry for fresh husked coconut and desiccated coconut"
            elif orig_name == "Wheat flour":
                clean_name = "Wheat Flour (Atta)"
                slug = "wheat-flour-atta"
            elif orig_name == "gram flour":
                clean_name = "Gram Flour (Besan)"
                slug = "gram-flour-besan"
            elif orig_name == "Rice flour":
                clean_name = "Rice Flour"
                slug = "rice-flour"
            elif orig_name == "Mung bean":
                clean_name = "Mung Bean (Green Gram)"
                slug = "mung-bean"
            elif orig_name == "Jaggery":
                clean_name = "Jaggery (Cane Sugar / Blocks / Powder)"
                slug = "jaggery"
            elif orig_name == "Kidney beans":
                clean_name = "Kidney Beans (Rajma)"
                slug = "kidney-beans"
            elif orig_name == "Red lentil":
                clean_name = "Red Lentils (Masoor Dal)"
                slug = "red-lentils"
            elif orig_name == "Millets (Sorghum, Ragi, Pearl millet)":
                clean_name = "Millets (Sorghum, Ragi, Pearl Millet)"
                slug = "millets-sorghum-ragi-pearl"
                notes = "Single composite entry for export millets"
            elif orig_name == "Pigeon pea":
                clean_name = "Pigeon Pea (Toor Dal)"
                slug = "pigeon-pea-toor-dal"
            elif orig_name == "Black lentil":
                clean_name = "Black Lentils (Urad Dal)"
                slug = "black-lentils-urad"
            elif orig_name == "1121 Golden sella/ Raw Basmati Rice":
                clean_name = "1121 Golden Sella / Raw Basmati Rice"
                slug = "1121-golden-sella-raw-basmati-rice"
            elif orig_name == "1509 Basmati rice":
                clean_name = "1509 Basmati Rice"
                slug = "1509-basmati-rice"
            elif orig_name == "Pusa Basmati Rice":
                clean_name = "Pusa Basmati Rice"
                slug = "pusa-basmati-rice"
            elif orig_name == "Non-Basmati rice":
                clean_name = "Non-Basmati Rice"
                slug = "non-basmati-rice"
            elif orig_name == "IR64 Non-basmati rice":
                clean_name = "IR64 Non-Basmati Rice"
                slug = "ir64-non-basmati-rice"
            elif orig_name == "Refined wheat flour (maida)":
                clean_name = "Refined Wheat Flour (Maida)"
                slug = "refined-wheat-flour-maida"
            else:
                clean_name = orig_name
                slug = slugify(clean_name)

        elif c == 6: # Fresh Fruit & Vegetables
            prop_cat = "Food & Food Ingredients"
            prop_sub = "Fresh Fruits & Vegetables"
            forms = "Fresh whole, sorted, graded"
            
            if orig_name == "Onion":
                clean_name = "Fresh Onion"
                slug = "onion-fresh"
                notes = "Distinct slug from Dehydrated Onion"
            elif orig_name == "Ginger":
                clean_name = "Fresh Ginger"
                slug = "ginger-fresh"
                notes = "Distinct slug from Dehydrated Ginger"
            elif orig_name == "Mango (Seasonal)":
                clean_name = "Fresh Mango"
                slug = "mango-fresh"
                seasonal = "Seasonal"
                notes = "Marked seasonal; distinct slug from Dehydrated Mango"
            elif orig_name == "Banana":
                clean_name = "Fresh Banana"
                slug = "banana-fresh"
                notes = "Distinct slug from Dehydrated Banana"
            elif orig_name == "Pomegranete":
                clean_name = "Fresh Pomegranate"
                slug = "pomegranate-fresh"
                seasonal = "Seasonal"
                notes = "Typo fixed: Pomegranete -> Pomegranate"
            elif orig_name == "Drumstick":
                clean_name = "Fresh Drumstick (Moringa Pods)"
                slug = "drumstick-fresh"
            elif orig_name == "Green chilli":
                clean_name = "Fresh Green Chilli"
                slug = "green-chilli-fresh"
            else:
                clean_name = orig_name
                slug = slugify(clean_name)

        elif c == 7: # Animal Feed
            prop_cat = "Animal Feed"
            prop_sub = "Feed Grains & Raw Materials"
            
            if orig_name == "Yellow corn":
                clean_name = "Yellow Corn (Feed Maize)"
                slug = "yellow-corn-feed"
            elif orig_name == "Corn grits":
                clean_name = "Corn Grits (Animal Feed)"
                slug = "corn-grits-feed"
            elif orig_name == "Green millet":
                clean_name = "Green Millet (Feed Bajra)"
                slug = "green-millet-feed"
            elif orig_name == "Animal millet":
                clean_name = "Animal Feed Millet"
                slug = "animal-feed-millet"
            elif orig_name == "Soya":
                clean_name = "Soya (Feed Grain / Meal)"
                slug = "soya-feed-grain"
                existing_match = "soybean-meal"
                notes = "Complementary feed commodity to existing Soybean meal"
            elif orig_name == "Safflower":
                clean_name = "Safflower Meal / Seeds"
                slug = "safflower-feed"
            else:
                clean_name = orig_name
                slug = slugify(clean_name)

        elif c == 8: # Nutraceutical raw materials
            pass # 0 products

        elif c == 9: # Dehydrated Vegetables & fruit
            prop_cat = "Food & Food Ingredients"
            prop_sub = "Dehydrated Fruits & Vegetables"
            
            if orig_name == "Fried onion":
                clean_name = "Fried Crispy Onion"
                slug = "fried-crispy-onion"
                forms = "Flakes, crispy kibbled"
            elif orig_name in ["Onion", "Ginger", "Mango", "Banana"]:
                clean_name = f"Dehydrated {orig_name}"
                slug = f"dehydrated-{slugify(orig_name)}"
                notes = f"Distinct slug from Fresh {orig_name}"
            else:
                clean_name = f"Dehydrated {orig_name}"
                slug = f"dehydrated-{slugify(orig_name)}"

        elif c == 10: # Others
            prop_cat = "Food & Food Ingredients"
            prop_sub = "Specialty Food Ingredients"
            
            if orig_name == "Honey":
                clean_name = "Pure Natural Honey"
                slug = "pure-natural-honey"
                forms = "Liquid, creamed, bulk drums"
            elif orig_name == "Fruit pulp":
                clean_name = "Aseptic Fruit Pulp"
                slug = "aseptic-fruit-pulp"
                forms = "Aseptic bag in drum (215 kg)"
                notes = "Tropical fruit pulp (Mango, Guava, Papaya)"
            else:
                clean_name = orig_name
                slug = slugify(clean_name)

        normalized_records.append({
            "original_column": col_header,
            "original_name": orig_name,
            "clean_name": clean_name,
            "slug": slug,
            "proposed_category": prop_cat,
            "proposed_subcategory": prop_sub,
            "forms": forms,
            "seasonal": seasonal,
            "duplicate_of": duplicate_of,
            "existing_site_match": existing_match,
            "notes": notes.strip()
        })

# Write to products.normalized.csv
fieldnames = [
    "original_column", "original_name", "clean_name", "slug", 
    "proposed_category", "proposed_subcategory", "forms", 
    "seasonal", "duplicate_of", "existing_site_match", "notes"
]

out_csv_path = 'products.normalized.csv'
with open(out_csv_path, mode='w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for row in normalized_records:
        writer.writerow(row)

print(f"Generated {out_csv_path} with {len(normalized_records)} rows.")

# Group count breakdown
counts = {}
for r in normalized_records:
    col = r["original_column"]
    counts[col] = counts.get(col, 0) + 1

print("\n--- Summary Breakdown by Column ---")
grand_total = 0
for col, cnt in counts.items():
    print(f"  {col}: {cnt}")
    grand_total += cnt

print(f"\nGrand Total from Excel: {grand_total}")
print(f"Existing site products: {len(existing_products)}")
duplicates_count = sum(1 for r in normalized_records if r["duplicate_of"])
new_unique = grand_total - duplicates_count
print(f"Duplicate/Merged entries: {duplicates_count} ({[r['clean_name'] for r in normalized_records if r['duplicate_of']]})")
print(f"Net new products to add: {new_unique}")
print(f"Total active products after merge: {new_unique + len(existing_products)}")
