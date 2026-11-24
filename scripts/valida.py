#!/usr/bin/env python3
"""Valida dati di Iter: schemi JSON e riferimenti incrociati (enti, territori, dipendenze)."""
import glob, json, sys
from pathlib import Path
import jsonschema

R = Path(__file__).resolve().parent.parent
load = lambda p: json.load(open(p, encoding="utf-8"))
errori = []

def schema(nome):
    return load(R / "schema" / nome)

enti = {}
for f in sorted(glob.glob(str(R / "data/enti/*.json"))):
    dati = load(f)
    try: jsonschema.validate(dati, schema("enti.schema.json"))
    except jsonschema.ValidationError as e: errori.append(f"{f}: {e.message}")
    for e in dati:
        if e["id"] in enti: errori.append(f"{f}: ente duplicato {e['id']}")
        enti[e["id"]] = e

territori = set()
def visita(n, base=""):
    p = f"{base}/{n['id']}" if base else n["id"]
    territori.add(p)
    for c in n.get("figli", []): visita(c, p)
t = load(R / "data/territori/it.json")
jsonschema.validate(t, schema("territorio.schema.json"))
visita(t)
for e in enti.values():
    if e.get("territorio") and e["territorio"] not in territori:
        errori.append(f"ente {e['id']}: territorio sconosciuto {e['territorio']}")

ids = set()
for f in sorted(glob.glob(str(R / "data/procedure/**/*.json"), recursive=True)):
    if f.endswith("_template.json"): continue
    d = load(f)
    try: jsonschema.validate(d, schema("procedura.schema.json"))
    except jsonschema.ValidationError as e: errori.append(f"{f}: {e.message}"); continue
    if d["id"] in ids: errori.append(f"{f}: id procedura duplicato")
    ids.add(d["id"])
    if d["territorio"]["percorso"] not in territori: errori.append(f"{f}: territorio sconosciuto {d['territorio']['percorso']}")
    dichiarati = {e["id"] for e in d["enti"]}
    passi = {p["id"] for p in d["passaggi"]}
    domande = {q["id"] for q in d.get("domande", [])}
    for e in dichiarati:
        if e not in enti: errori.append(f"{f}: ente {e} non nel registro data/enti")
    for p in d["passaggi"]:
        if p["ente"] not in dichiarati: errori.append(f"{f}: {p['id']} usa l'ente {p['ente']} non dichiarato")
        for x in p.get("dipende_da", []):
            if x not in passi: errori.append(f"{f}: {p['id']} dipende da {x} inesistente")
        for c in p.get("condizioni", []):
            if c["domanda"] not in domande: errori.append(f"{f}: {p['id']} usa la domanda {c['domanda']} inesistente")

if errori:
    print("\n".join(errori)); sys.exit(1)
print(f"OK: {len(ids)} procedure, {len(enti)} enti, {len(territori)} territori")
