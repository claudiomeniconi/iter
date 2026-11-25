"""Caricamento dei dati di Iter e composizione "base toscana + differenze comunali".

Una *base* (data/basi/<percorso regione>/*.json) è una procedura scritta una volta per
tutta la regione. Gli enti che cambiano da comune a comune sono *ruoli* che iniziano con
"@" (es. "@suap"), e nei testi il segnaposto "{comune}" indica il nome del comune.

Un *comune* (data/comuni/<percorso>.json) dice chi ricopre ogni ruolo e, per ogni
procedura che adotta, solo le differenze rispetto alla base.

`componi(base, comune)` restituisce una procedura completa, nello stesso formato delle
procedure scritte a mano, che l'app e gli script trattano come tutte le altre.
"""
import copy
import glob
import json
from pathlib import Path

R = Path(__file__).resolve().parent.parent

# Ruoli di ente usati nelle basi. Il comune deve indicare chi li ricopre.
RUOLI_LOCALI = {"@suap", "@edilizia", "@polizia-municipale"}
"""Passaggi gestiti da questi ruoli dipendono dal comune: se il comune non dice nulla,
il loro stato di verifica torna a "bozza"."""


def load(p):
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def basi():
    out = {}
    for f in sorted(glob.glob(str(R / "data/basi/**/*.json"), recursive=True)):
        b = load(f)
        out[b["modello"]] = (f, b)
    return out


def comuni():
    return [(f, load(f)) for f in sorted(glob.glob(str(R / "data/comuni/**/*.json"), recursive=True))]


def _testo(s, nome):
    return s.replace("{comune}", nome) if isinstance(s, str) else s


def _sostituisci(o, nome):
    if isinstance(o, str):
        return _testo(o, nome)
    if isinstance(o, list):
        return [_sostituisci(x, nome) for x in o]
    if isinstance(o, dict):
        return {k: _sostituisci(v, nome) for k, v in o.items()}
    return o


def componi(base, comune):
    """Procedura completa per un comune, a partire dalla base e dalle differenze."""
    modello = base["modello"]
    diff = comune["procedure"][modello]
    nome = comune["nome"]
    ruoli = comune["ruoli"]
    ente = lambda e: ruoli.get(e, e)

    p = copy.deepcopy(base)
    p = _sostituisci(p, nome)
    p["id"] = f"{comune['id']}.{modello}"
    p["territorio"] = {
        "livello": "comunale",
        "nome": comune["nome_esteso"],
        "codice_istat": comune["codice_istat"],
        "percorso": comune["percorso"],
    }
    for k in ("stato", "versione", "ultima_verifica", "titolo", "descrizione"):
        if k in diff:
            p[k] = diff[k]
    p["base"] = {"modello": modello, "versione": base["versione"]}

    rimossi = set(diff.get("rimuovi", []))
    passaggi = []
    for s in p["passaggi"]:
        if s["id"] in rimossi:
            continue
        locale = s["ente"] in RUOLI_LOCALI
        s["ente"] = ente(s["ente"])
        d = diff.get("passaggi", {}).get(s["id"], {})
        if locale and "stato_verifica" not in d:
            s["stato_verifica"] = "bozza"
        for k, v in d.items():
            if k == "fonti_aggiunte":
                s["fonti"] = s.get("fonti", []) + v
            else:
                s[k] = v
        s["dipende_da"] = [x for x in s.get("dipende_da", []) if x not in rimossi]
        passaggi.append(s)
    for s in diff.get("aggiungi", []):
        s = copy.deepcopy(s)
        s["ente"] = ente(s["ente"])
        passaggi.append(s)
    p["passaggi"] = passaggi

    usati = list(dict.fromkeys(s["ente"] for s in passaggi))
    p["enti"] = [{"id": e} for e in usati]
    return p


def procedure_composte():
    """[(origine, procedura)] per ogni coppia base + comune."""
    b = basi()
    out = []
    for f, c in comuni():
        for modello in c.get("procedure", {}):
            if modello in b:
                out.append((f"{f} + {b[modello][0]}", componi(b[modello][1], c)))
    return out
