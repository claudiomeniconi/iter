#!/usr/bin/env python3
"""Confronta la stessa procedura tra i comuni che la adottano.

Per ogni base in data/basi scrive docs/analisi/<modello>.md con:
- la tabella dei comuni (sportello, canale, pagamento, diritti, passaggi, verifica);
- le differenze rispetto alla base dichiarate da ogni comune;
- indicatori utili alla semplificazione (enti coinvolti, passaggi in sequenza,
  documenti chiesti più volte, passaggi senza tempi di legge).

Uso: python3 scripts/confronta.py
"""
import collections
from pathlib import Path
from iter_dati import R, RUOLI_LOCALI, basi, comuni, componi, load

enti = {}
for f in sorted((R / "data/enti").glob("*.json")):
    for e in load(f):
        enti[e["id"]] = e
nome_ente = lambda i: enti.get(i, {}).get("nome", i)


def euro(c):
    if not c.get("min_euro") and not c.get("max_euro") and c.get("min_euro") != 0:
        return "da trovare"
    a, b = c.get("min_euro"), c.get("max_euro")
    return f"{a:g} €" if a == b else f"{a:g}-{b:g} €"


def profondita(p):
    """Numero massimo di passaggi in fila (dipendenze), escluse condizioni."""
    by = {s["id"]: s for s in p["passaggi"]}
    memo = {}
    def d(i, stack=()):
        if i in memo: return memo[i]
        if i in stack: return 0
        deps = [x for x in by[i].get("dipende_da", []) if x in by]
        memo[i] = 1 + max((d(x, stack + (i,)) for x in deps), default=0)
        return memo[i]
    return max((d(i) for i in by), default=0)


def analizza(modello, base, adottanti):
    righe = []
    out = [f"# Confronto tra comuni: {base['titolo'].replace('{comune}', '…')}", "",
           f"Modello `{modello}`. Generato da `scripts/confronta.py` a partire dalla base "
           f"`data/basi/` e dai file in `data/comuni/`. Tutti i dati sono in **bozza** finché "
           "non sono confermati dall'ente.", ""]
    out += ["## I comuni a confronto", "",
            "| Comune | Sportello | Pagamento diritti | Diritti SUAP | Passaggi | Verificati | Differenze dichiarate |",
            "|---|---|---|---|---|---|---|"]
    for c in adottanti:
        p = componi(base, c)
        sp = c.get("sportello", {})
        suap_step = next((s for s in p["passaggi"] if s["ente"] == c["ruoli"].get("@suap") and s.get("costi")), None)
        dir_ = "da trovare"
        if suap_step:
            d = [x for x in suap_step["costi"] if x["voce"].startswith("Diritti SUAP")]
            if d:
                dir_ = euro(d[0])
                v = d[0]["voce"]
                if dir_ != "da trovare" and "(" in v:
                    dir_ += " (" + v.split("(", 1)[1]
                elif dir_ != "da trovare" and "per ogni endoprocedimento" in v:
                    dir_ += " per endoprocedimento"
        ver = sum(1 for s in p["passaggi"] if s.get("stato_verifica", "bozza") != "bozza")
        diff = c["procedure"][modello]
        n_diff = len(diff.get("passaggi", {})) + len(diff.get("aggiungi", [])) + len(diff.get("rimuovi", []))
        out.append(f"| {c['nome']} | {nome_ente(sp.get('ente', c['ruoli'].get('@suap')))} | {sp.get('pagamento', 'da trovare')} | {dir_} | "
                   f"{len(p['passaggi'])} | {ver} di {len(p['passaggi'])} | {n_diff} |")

    out += ["", "## Enti che cambiano da comune a comune", "",
            "| Comune | " + " | ".join(r for r in sorted({s['ente'] for s in base['passaggi'] if s['ente'].startswith('@')})) + " |",
            "|---|" + "---|" * len({s['ente'] for s in base['passaggi'] if s['ente'].startswith('@')})]
    ruoli = sorted({s['ente'] for s in base['passaggi'] if s['ente'].startswith('@')})
    for c in adottanti:
        out.append(f"| {c['nome']} | " + " | ".join(nome_ente(c['ruoli'].get(r, '?')) for r in ruoli) + " |")

    # Indicatori sulla base (uguali per tutti i comuni: la semplificazione vale per la regione)
    docs = collections.defaultdict(list)
    for s in base["passaggi"]:
        for d in s.get("documenti_richiesti", []):
            docs[d["nome"]].append(s["titolo"])
    ripetuti = {k: v for k, v in docs.items() if len(v) > 1}
    senza_tempi = [s["titolo"] for s in base["passaggi"] if s["tipo"] in ("presentazione", "autorizzazione", "controllo")
                   and not (s.get("tempi") or {}).get("previsto_giorni") and (s.get("tempi") or {}).get("previsto_giorni") != 0]
    enti_base = {s["ente"] for s in base["passaggi"] if s["ente"] != "richiedente"}
    locali = [s["titolo"] for s in base["passaggi"] if s["ente"] in RUOLI_LOCALI]
    out += ["", "## Indicatori per la semplificazione", "",
            f"- **Passaggi in tutto:** {len(base['passaggi'])}, di cui {len(locali)} gestiti da uffici comunali (dove i comuni possono differire).",
            f"- **Enti diversi coinvolti:** {len(enti_base)}.",
            f"- **Passaggi in fila nel caso peggiore:** {profondita(base)} (dipendenze una dopo l'altra).",
            f"- **Documenti chiesti più volte:** " + ("nessuno tra quelli mappati." if not ripetuti else ""),
            ]
    for k, v in ripetuti.items():
        out.append(f"  - {k}: {', '.join(v)}")
    out.append(f"- **Passaggi con un ente senza tempo di legge mappato:** " + (", ".join(senza_tempi) if senza_tempi else "nessuno."))
    out += ["", "_Nota: i documenti sono mappati solo in parte, quindi il conteggio dei documenti ripetuti è per difetto._", ""]
    return "\n".join(out)


def main():
    b = basi()
    cs = [c for _, c in comuni()]
    dest = R / "docs/analisi"
    dest.mkdir(parents=True, exist_ok=True)
    for modello, (_, base) in sorted(b.items()):
        adottanti = [c for c in cs if modello in c.get("procedure", {})]
        if len(adottanti) < 2: continue
        (dest / f"{modello}.md").write_text(analizza(modello, base, adottanti), encoding="utf-8")
        print(f"docs/analisi/{modello}.md: {len(adottanti)} comuni")


if __name__ == "__main__":
    main()
