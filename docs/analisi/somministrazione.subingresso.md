# Confronto tra comuni: Rilevare un bar, ristorante o pizzeria già aperto a …

Modello `somministrazione.subingresso`. Generato da `scripts/confronta.py` a partire dalla base `data/basi/` e dai file in `data/comuni/`. Tutti i dati sono in **bozza** finché non sono confermati dall'ente.

## I comuni a confronto

| Comune | Sportello | Pagamento diritti | Diritti SUAP | Passaggi | Verificati | Differenze dichiarate |
|---|---|---|---|---|---|---|
| Castelfranco Piandiscò | SUAP associato - Unione dei Comuni del Pratomagno | Bonifico all'Unione dei Comuni del Pratomagno | 10 € | 15 | 1 di 15 | 1 |
| Cavriglia | SUAP - Comune di Cavriglia | PagoPA | da trovare | 15 | 1 di 15 | 1 |
| Loro Ciuffenna | SUAP associato - Unione dei Comuni del Pratomagno | Bonifico all'Unione dei Comuni del Pratomagno | 10 € | 15 | 1 di 15 | 1 |
| Montevarchi | SUAP - Comune di Montevarchi | da trovare | da trovare | 15 | 2 di 15 | 2 |
| San Giovanni Valdarno | SUAP e Commercio - Comune di San Giovanni Valdarno | PagoPA | 25 € | 15 | 1 di 15 | 1 |
| Terranuova Bracciolini | SUAP - Comune di Terranuova Bracciolini | PagoPA | 25 € | 15 | 1 di 15 | 1 |
| Figline e Incisa Valdarno | Sportello ai cittadini e alle imprese (SUAP) - Comune di Figline e Incisa Valdarno | PagoPA (IRIS) | 30 € | 15 | 1 di 15 | 1 |

## Enti che cambiano da comune a comune

| Comune | @asl | @cciaa | @suap |
|---|---|---|---|
| Castelfranco Piandiscò | Azienda USL Toscana sud est | Camera di Commercio Arezzo-Siena | SUAP associato - Unione dei Comuni del Pratomagno |
| Cavriglia | Azienda USL Toscana sud est | Camera di Commercio Arezzo-Siena | SUAP - Comune di Cavriglia |
| Loro Ciuffenna | Azienda USL Toscana sud est | Camera di Commercio Arezzo-Siena | SUAP associato - Unione dei Comuni del Pratomagno |
| Montevarchi | Azienda USL Toscana sud est | Camera di Commercio Arezzo-Siena | SUAP - Comune di Montevarchi |
| San Giovanni Valdarno | Azienda USL Toscana sud est | Camera di Commercio Arezzo-Siena | SUAP e Commercio - Comune di San Giovanni Valdarno |
| Terranuova Bracciolini | Azienda USL Toscana sud est | Camera di Commercio Arezzo-Siena | SUAP - Comune di Terranuova Bracciolini |
| Figline e Incisa Valdarno | Azienda USL Toscana centro | Camera di Commercio di Firenze | Sportello ai cittadini e alle imprese (SUAP) - Comune di Figline e Incisa Valdarno |

## Indicatori per la semplificazione

- **Passaggi in tutto:** 15, di cui 4 gestiti da uffici comunali (dove i comuni possono differire).
- **Enti diversi coinvolti:** 5.
- **Passaggi in fila nel caso peggiore:** 4 (dipendenze una dopo l'altra).
- **Documenti chiesti più volte:** nessuno tra quelli mappati.
- **Passaggi con un ente senza tempo di legge mappato:** Firmare l'atto di cessione o di affitto d'azienda dal notaio, Pratiche per le modifiche al locale, Verifiche del Comune sulla comunicazione

_Nota: i documenti sono mappati solo in parte, quindi il conteggio dei documenti ripetuti è per difetto._
