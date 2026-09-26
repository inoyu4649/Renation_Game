import openpyxl
import json

print("Loading WPP2024_GEN_F01_DEMOGRAPHIC_INDICATORS_FULL.xlsx (read_only=True)...")
wb = openpyxl.load_workbook('WPP2024_GEN_F01_DEMOGRAPHIC_INDICATORS_FULL.xlsx', read_only=True)
sheet = wb['Medium variant']

TARGET_YEAR = 2024

wpp_data = {
    "year": TARGET_YEAR,
    "world": {},
    "by_iso2": {},
    "by_iso3": {},
    "by_name": {}
}

print(f"Parsing rows for Year {TARGET_YEAR}...")
row_count = 0
for i, row in enumerate(sheet.iter_rows(values_only=True)):
    if i < 17:
        continue
    
    year = row[10]
    if year != TARGET_YEAR:
        continue
    
    row_type = row[8]
    name = row[2]
    iso3 = (row[5] or "").strip().upper()
    iso2 = (row[6] or "").strip().upper()
    
    pop_k = row[12]
    births_k = row[23]
    
    if pop_k is None or births_k is None:
        continue
        
    pop = int(round(float(pop_k) * 1000))
    births = int(round(float(births_k) * 1000))
    life_exp = float(row[34]) if row[34] is not None else None
    infant_mort = float(row[47]) if row[47] is not None else None
    
    entry = {
        "name": name,
        "iso2": iso2,
        "iso3": iso3,
        "type": row_type,
        "pop": pop,
        "births": births,
        "life_expectancy": life_exp,
        "infant_mortality": infant_mort
    }
    
    if row_type == 'World':
        wpp_data["world"] = entry
    elif row_type == 'Country/Area':
        if iso2:
            wpp_data["by_iso2"][iso2] = entry
        if iso3:
            wpp_data["by_iso3"][iso3] = entry
        wpp_data["by_name"][name.lower()] = entry
        row_count += 1

print(f"Parsed {row_count} countries/areas for year {TARGET_YEAR}.")
print(f"World: Pop = {wpp_data['world'].get('pop'):,} ({wpp_data['world'].get('pop')/100000000:.2f}억명), Births = {wpp_data['world'].get('births'):,} ({wpp_data['world'].get('births')/100000000:.2f}억명)")

with open('scripts/wpp2024_parsed.json', 'w', encoding='utf-8') as f:
    json.dump(wpp_data, f, ensure_ascii=False, indent=2)

print("Saved to scripts/wpp2024_parsed.json successfully!")
