# Modello dati

Una **procedura** è un grafo orientato di **passaggi**. Lo schema formale è in [`../schema/procedura.schema.json`](../schema/procedura.schema.json).

## Organizzazione

- **Territori** (`data/territori/it.json`): albero Italia > regioni > province > comuni. Ogni nodo ha un percorso, es. `it/toscana/ar/montevarchi`.
- **Enti** (`data/enti/*.json`): registro unico, con tipo, territorio, contatti e fonte. Identificativi stabili, es. `suap.051026` (codice ISTAT del comune).
- **Procedure** (`data/procedure/<percorso>/*.json`): richiamano gli enti per identificativo. Una procedura vale nel suo territorio e in tutti quelli sotto.

## Procedura

| Campo | Tipo | Descrizione |
|---|---|---|
| `id` | stringa | Identificativo unico, es. `montevarchi.somministrazione.apertura` |
| `modello` | stringa | Famiglia della procedura, uguale in ogni territorio, es. `somministrazione.apertura`. Serve a confrontare i comuni |
| `stato` | enum | `bozza`, `pubblicata`, `archiviata` |
| `titolo` | stringa | Nome leggibile |
| `descrizione` | stringa | A cosa serve la procedura |
| `territorio` | oggetto | Livello, nome, codice ISTAT e `percorso` nell'albero dei territori |
| `categoria` | stringa | Es. `impresa`, `cittadino`, `edilizia` |
| `versione` | stringa | Versione dei dati (semver) |
| `ultima_verifica` | data | Ultima volta che l'intera procedura è stata verificata |
| `domande` | lista | Domande del percorso guidato che attivano o escludono passaggi |
| `enti` | lista | Identificativi degli enti coinvolti, dal registro `data/enti` |
| `passaggi` | lista | I nodi del grafo |

## Passaggio

| Campo | Tipo | Descrizione |
|---|---|---|
| `id` | stringa | Identificativo unico dentro la procedura |
| `titolo` | stringa | Azione da compiere, es. "Presentare la SCIA al SUAP" |
| `tipo` | enum | `presentazione`, `autorizzazione`, `pagamento`, `requisito`, `iscrizione`, `comunicazione`, `controllo`, `attesa` |
| `ente` | riferimento | Chi gestisce il passaggio (identificativo del registro enti) |
| `stato_verifica` | enum | `bozza`, `verificato_fonti`, `verificato_ente` |
| `attore` | enum | Chi agisce: `richiedente`, `professionista`, `ente` |
| `documenti_richiesti` | lista | Cosa va presentato |
| `documenti_prodotti` | lista | Cosa si ottiene |
| `costi` | lista | Voci di costo con importo minimo e massimo |
| `tempi` | oggetto | `previsto_giorni` (da norma), `reale_giorni` (osservato), `silenzio_assenso` |
| `dipende_da` | lista | Passaggi che devono essere completati prima |
| `condizioni` | lista | Quando il passaggio si applica, collegato alle `domande` |
| `canale` | enum | `online`, `sportello`, `pec`, `misto` |
| `fonti` | lista | Norme e pagine ufficiali, con URL e data di verifica |
| `note` | stringa | Osservazioni, intoppi frequenti |

## Regole

- Un passaggio senza almeno una fonte non è valido.
- Il tempo **previsto** viene dalla norma; il tempo **reale** viene da osservazioni e va sempre indicato con il numero di segnalazioni su cui si basa.
- I documenti hanno un identificativo stabile, così l'analisi può accorgersi quando lo stesso documento è richiesto da più enti.

## Base regionale e differenze comunali

Molte procedure comunali seguono la legge regionale e sono uguali in ogni comune della regione. Per non copiare la stessa procedura in ogni comune, la si scrive una volta come **base** e ogni comune dichiara solo le sue **differenze**.

- **Basi** (`data/basi/it/<regione>/*.json`): stesso formato di una procedura. Gli enti che cambiano da comune a comune sono **ruoli** che iniziano con `@` (`@suap`, `@edilizia`, `@polizia-municipale`, `@asl`, `@cciaa`, `@vvf`, `@questura`, `@soprintendenza`). Nei testi `{comune}` diventa il nome del comune.
- **Comuni** (`data/comuni/<percorso>.json`): chi ricopre ogni ruolo (`ruoli`), come si presentano le pratiche e si pagano i diritti (`sportello`), la tabella dei diritti (`diritti`) e, in `procedure`, le procedure che il comune adotta con le sole differenze:

| Campo | Significato |
|---|---|
| `passaggi.<id>` | Campi del passaggio che cambiano (es. `costi`, `note`, `stato_verifica`). `fonti_aggiunte` aggiunge fonti locali a quelle della base |
| `aggiungi` | Passaggi che esistono solo in quel comune |
| `rimuovi` | Passaggi della base che in quel comune non ci sono |
| `stato`, `versione`, `ultima_verifica` | Stato della procedura in quel comune |

La procedura completa si ottiene con `componi()` in `scripts/iter_dati.py` (la stessa logica è in `app/src/data.ts`). Ha id `<comune>.<modello>`, come una procedura scritta a mano.

Regola di verifica: un passaggio gestito da un ufficio comunale (`@suap`, `@edilizia`, `@polizia-municipale`) torna in `bozza` in ogni comune che non lo ha verificato esplicitamente, anche se nella base è verificato.

`python3 scripts/confronta.py` scrive in `docs/analisi/` una scheda per ogni procedura adottata da almeno due comuni: sportello, diritti, enti, passaggi verificati e indicatori per la semplificazione.
