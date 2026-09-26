import json

with open('public/data/countries.json', encoding='utf-8') as f:
    d = json.load(f)

with open('scripts/countries_dump.txt', 'w', encoding='utf-8') as out:
    for c in d['countries']:
        out.write(f"{c['iso2']}\t{c['country']}\t{c['country_ko']}\t{c['population']}\t{c['births']}\n")

print(f"Dumped {len(d['countries'])} countries.")
