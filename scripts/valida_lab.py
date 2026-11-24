#!/usr/bin/env python3
"""Valida i dati di Iter Lab: corpus normativo e schede di semplificazione.

Regole oltre allo schema JSON:
- ogni anello della catena normativa cita una norma presente in data/norme/indice.json;
- ogni citazione presente deve comparire davvero in un testo archiviato
  in data/norme/testi/<norma>/ (confronto senza spazi né a capo, perché il testo
  estratto dai PDF regionali spezza le parole); da 'in_revisione' in poi la citazione
  è obbligatoria per ogni anello;
- i passaggi toccati dal diff esistono nella procedura di riferimento, se è nel repository;
- 'pubblicata' e 'adottata' richiedono almeno due revisioni umane approvate,
  di cui una di un giurista.
"""
import glob, json, re, sys
from pathlib import Path
import jsonschema
from referencing import Registry, Resource

R = Path(__file__).resolve().parent.parent
load = lambda p: json.load(open(p, encoding="utf-8"))
norm = lambda s: re.sub(r"\s+", "", s.replace("\u2019", "'")).lower()
errori = []

indice = load(R / "data/norme/indice.json")
jsonschema.validate(indice, load(R / "schema/norma.schema.json"))
norme = {n["id"] for n in indice}
testi = {n: "".join(norm(open(f, encoding="utf-8").read())
                     for f in sorted(glob.glob(str(R / "data/norme/testi" / n / "*.txt"))))
         for n in norme}

schema = load(R / "schema/semplificazione.schema.json")
# i $ref tra schemi si risolvono in locale, senza scaricare nulla
registry = Registry().with_resources(
    (load(f)["$id"], Resource.from_contents(load(f))) for f in sorted(glob.glob(str(R / "schema/*.schema.json"))))
validatore = jsonschema.Draft202012Validator(schema, registry=registry)
AVANZATI = {"in_revisione", "anteprima_ente", "pubblicata", "adottata"}

# passaggi delle procedure note (data/procedure e, se presenti, data/basi), per controllare i diff
passaggi = {}
for f in glob.glob(str(R / "data/procedure/**/*.json"), recursive=True) + glob.glob(str(R / "data/basi/**/*.json"), recursive=True):
    if f.endswith("_template.json"): continue
    p = load(f)
    for chiave in (p.get("id"), p.get("modello")):
        if chiave: passaggi.setdefault(chiave, set()).update(x["id"] for x in p.get("passaggi", []))

ids = set()
schede = sorted(glob.glob(str(R / "data/semplificazioni/**/*.json"), recursive=True))
for f in schede:
    d = load(f)
    problemi = list(validatore.iter_errors(d))
    if problemi:
        errori += [f"{f}: {e.message} ({'/'.join(map(str, e.path))})" for e in problemi]; continue
    if d["id"] in ids: errori.append(f"{f}: id duplicato")
    ids.add(d["id"])
    noti = set().union(*(passaggi.get(k, set()) for k in d["procedura"].get("procedure_id", []) + [d["procedura"]["modello"]]))
    for x in d["diff"]:
        if noti and x["passaggio"] not in noti:
            errori.append(f"{f}: il diff tocca il passaggio {x['passaggio']}, che non esiste nella procedura")
    for i, a in enumerate(d["catena_normativa"]):
        dove = f"{f}: anello {i} ({a['norma']} {a.get('articolo', '')})"
        if a["norma"] not in norme:
            errori.append(f"{dove}: norma non presente in data/norme/indice.json"); continue
        if not a.get("citazione"):
            if d["stato"] in AVANZATI: errori.append(f"{dove}: manca la citazione testuale")
            continue
        trovata = norm(a["citazione"]) in testi[a["norma"]]
        if not trovata:
            errori.append(f"{dove}: citazione non trovata nei testi archiviati")
        elif a.get("citazione_controllata") is False:
            errori.append(f"{dove}: citazione trovata ma marcata come non controllata")
    if d["stato"] in {"pubblicata", "adottata"}:
        ok = [r for r in d.get("revisioni", []) if r["esito"] == "approvata" and r["ruolo"] in {"professionista", "giurista"}]
        if len(ok) < 2 or not any(r["ruolo"] == "giurista" for r in ok):
            errori.append(f"{f}: servono due revisioni umane approvate, di cui una di un giurista")

if errori:
    print("\n".join(errori)); sys.exit(1)
print(f"OK: {len(norme)} norme nel corpus, {len(ids)} schede")
