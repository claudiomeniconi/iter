#!/usr/bin/env python3
"""Valida dati di Iter: schemi JSON e riferimenti incrociati (enti, territori, dipendenze)."""
import glob, json, sys
from pathlib import Path
import jsonschema
from iter_dati import RUOLI_LOCALI, basi, comuni, procedure_composte

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

# Basi regionali: possono usare ruoli ("@suap") e lasciare a un comune le fonti locali
tutte_basi = basi()
for modello, (f, b) in tutte_basi.items():
    for x in b["passaggi"]:
        if not x.get("fonti") and x["ente"] not in RUOLI_LOCALI:
            errori.append(f"{f}: {x['id']} senza fonti e non gestito da un ufficio comunale")

# Comuni: ogni ruolo usato dalle basi adottate deve avere un ente, ogni differenza un passaggio
for f, c in comuni():
    if c["percorso"] not in territori: errori.append(f"{f}: territorio sconosciuto {c['percorso']}")
    for r, e in c["ruoli"].items():
        if e not in enti: errori.append(f"{f}: il ruolo {r} punta all'ente {e} non nel registro")
    for modello, d in c.get("procedure", {}).items():
        if modello not in tutte_basi: errori.append(f"{f}: nessuna base per {modello}"); continue
        b = tutte_basi[modello][1]
        passi_base = {x["id"] for x in b["passaggi"]}
        for pid in list(d.get("passaggi", {})) + d.get("rimuovi", []):
            if pid not in passi_base: errori.append(f"{f}: {modello} modifica il passaggio {pid} che non esiste nella base")
        for x in b["passaggi"]:
            if x["ente"].startswith("@") and x["id"] not in d.get("rimuovi", []) and x["ente"] not in c["ruoli"]:
                errori.append(f"{f}: {modello} usa il ruolo {x['ente']} che il comune non assegna")

def procedure_da_validare():
    for f in sorted(glob.glob(str(R / "data/procedure/**/*.json"), recursive=True)):
        if f.endswith("_template.json"): continue
        yield f, load(f)
    yield from procedure_composte()

ids = set()
for f, d in procedure_da_validare():
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
