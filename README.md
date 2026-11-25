# Iter

**Make Italy Great Again**

Iter è l'atlante aperto della burocrazia italiana: ogni procedura descritta passo per passo, con enti, documenti, costi e tempi, visibile su un canvas e analizzata con l'AI per capire dove si può semplificare.

Si parte in piccolo, dalle procedure per le imprese nel **Comune di Montevarchi (AR)** e nei comuni vicini del Valdarno, per poi estendere il metodo ad altri comuni, alle regioni e a qualsiasi procedura a livello nazionale.

## Perché

In Italia aprire, ampliare o gestire un'attività richiede troppi passaggi, troppi enti e troppo tempo. Spesso nessuno ha una visione completa del percorso: né il cittadino, né l'impresa, né a volte la stessa amministrazione.

Iter vuole:

1. **Rendere chiaro** cosa serve fare, in che ordine, con chi, quanto costa e quanto ci vuole.
2. **Misurare** i tempi reali rispetto a quelli previsti dalla legge, e confrontarli tra comuni.
3. **Proporre semplificazioni** concrete, basate su dati e sulla norma di riferimento.

È un progetto civico, non nasce a scopo di lucro.

## Come funziona

Ogni procedura è un **grafo**: i nodi sono i passaggi, gli archi sono le dipendenze (cosa deve venire prima di cosa, cosa si può fare in parallelo).

Ogni passaggio descrive:

| Campo | Significato |
|---|---|
| Ente | Chi gestisce il passaggio (SUAP, ASL, VVF, CCIAA, Agenzia Entrate, INPS…) |
| Documenti | Cosa va presentato e cosa si ottiene |
| Costi | Bolli, diritti, oneri, professionisti |
| Tempi | Tempo previsto dalla norma e tempo reale osservato |
| Condizioni | Quando il passaggio si applica (es. "solo con dehors") |
| Fonte | Norma, regolamento o pagina ufficiale da cui deriva, con data di verifica |

Il modello dati completo è in [`docs/modello-dati.md`](docs/modello-dati.md) e lo schema formale in [`schema/procedura.schema.json`](schema/procedura.schema.json).

## Roadmap

| Fase | Obiettivo | Stato |
|---|---|---|
| 0. Metodo | Mappare a mano l'apertura di un'attività di somministrazione (bar, ristorante, pizzeria) a Montevarchi e validare il modello dati | In corso |
| 1. MVP pubblico | Canvas consultabile e percorso guidato che genera la checklist personalizzata | Da fare |
| 2. Dati reali | Segnalazioni dei tempi reali da chi ha fatto la pratica, revisione da professionisti | Da fare |
| 3. Analisi AI | Individuare duplicazioni, passaggi parallelizzabili, colli di bottiglia e passaggi senza base normativa | Da fare |
| 4. Scala | Report per l'amministrazione comunale, poi estensione ad altri comuni e procedure | Da fare |

Il piano dettagliato è in [`docs/piano.md`](docs/piano.md).

## Struttura del repository

```
iter/
├── app/                            # interfaccia web (Vite + React + React Flow)
├── data/
│   ├── basi/it/toscana/            # procedure uguali in tutta la Toscana, con enti come ruoli (@suap, @asl…)
│   ├── comuni/it/toscana/          # per ogni comune: chi ricopre i ruoli, diritti e sole differenze
│   ├── enti/                       # registro unico degli enti, un file per territorio
│   ├── territori/it.json           # albero Italia > regioni > province > comuni
│   ├── procedure/
│   │   ├── _template.json          # modello vuoto di una procedura
│   │   └── it/toscana/ar/montevarchi/
│   │       └── somministrazione-apertura.json
│   └── procedure-in-programma.json # procedure che vogliamo mappare
├── docs/
│   ├── analisi/                    # confronto di ogni procedura tra i comuni (generato)
│   ├── montevarchi/                # note di lavoro, fonti e domande aperte
│   ├── piano.md
│   └── modello-dati.md
├── schema/                         # JSON Schema di procedure, enti e territori
├── scripts/valida.py               # controlla schemi e riferimenti incrociati
├── scripts/confronta.py            # genera le schede di confronto in docs/analisi
├── avvia-iter.command              # avvio con doppio clic su macOS
└── README.md
```

Le procedure sono organizzate per territorio: `it/<regione>/<provincia>/<comune>/`. Una procedura definita a un livello vale anche per tutti i territori sotto: una procedura nazionale compare in ogni comune.

Gli enti stanno in un registro unico (`data/enti`) e le procedure li richiamano per identificativo, così lo stesso ufficio ha gli stessi contatti in ogni procedura. Il campo `modello` lega la stessa procedura in territori diversi, per poterli confrontare.

### Aggiungere un comune o una procedura

Se la procedura esiste già come base toscana (`data/basi/it/toscana/`), basta il file del comune in `data/comuni/` con i ruoli e le differenze: vedi [`docs/modello-dati.md`](docs/modello-dati.md#base-regionale-e-differenze-comunali). Altrimenti:

1. Aggiungi il comune in `data/territori/it.json`.
2. Aggiungi i suoi enti in `data/enti/` (es. `suap.<codice ISTAT>`).
3. Copia `data/procedure/_template.json` nella cartella del comune e compilalo.
4. Controlla con `python3 scripts/valida.py`.

## Avviare l'app

Su macOS: doppio clic su `avvia-iter.command`. Altrimenti:

```bash
cd app && npm install && npm run dev
```

## Stack previsto

- **Backend:** Laravel + PostgreSQL (grafi in JSONB, con versioni)
- **Canvas:** React Flow + ELK.js per il layout automatico
- **AI:** Claude via API, per estrarre passaggi da normative e moduli e per analizzare i flussi

Nella Fase 0 i dati vivono come file JSON in questo repository, così il modello si può correggere facilmente prima di costruire l'applicazione.

## Principi

- **Ogni informazione ha una fonte.** Nessun passaggio senza riferimento verificabile e data di ultima verifica.
- **Dati neutri.** L'obiettivo è aiutare a semplificare, non accusare.
- **Aperto.** Codice e dati sono pubblici.

> Iter è uno strumento informativo e non sostituisce la consulenza di un professionista o le indicazioni ufficiali degli enti competenti.

## Contribuire

Se hai aperto un'attività a Montevarchi, o sei un professionista che segue queste pratiche, la tua esperienza è preziosa: tempi reali, intoppi, documenti richiesti in più. Apri una issue o contatta il maintainer.

## Licenza

Distribuito con licenza [Apache 2.0](LICENSE).
