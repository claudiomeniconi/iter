# Piano del progetto

## Visione

Pensare in grande, partire dal piccolo. Iter deve poter descrivere qualsiasi procedura burocratica italiana, ma il metodo si costruisce e si valida su un caso solo: **aprire un'attività di somministrazione di alimenti e bevande nel Comune di Montevarchi**.

Il caso è stato scelto perché è frequente, coinvolge molti enti (SUAP, ASL, Vigili del Fuoco, Camera di Commercio, Agenzia delle Entrate, INPS, urbanistica) e cambia da comune a comune. Se il metodo regge qui, regge anche altrove.

## Fase 0 — Metodo

Obiettivo: una procedura mappata a mano, completa e con fonti, che metta alla prova il modello dati.

- [ ] Raccogliere le fonti ufficiali: pagine SUAP del Comune di Montevarchi, modulistica regionale toscana per la SCIA di somministrazione, regolamenti comunali (dehors, insegne, orari), requisiti ASL Toscana sud est
- [ ] Elencare tutti i passaggi con ente, documenti, costi, tempi, condizioni e fonte
- [ ] Intervistare 2-3 persone che hanno aperto un locale a Montevarchi negli ultimi anni
- [ ] Intervistare almeno un professionista (commercialista o geometra) che segue queste pratiche
- [ ] Scrivere la procedura in `data/procedure/it/toscana/ar/montevarchi/`
- [ ] Rivedere il modello dati in base a cosa non si riusciva a descrivere

Le interviste restano fuori dal repository (cartella `interviste/`, ignorata da git): nel repository entrano solo i dati aggregati e anonimi.

## Fase 1 — MVP pubblico

- Canvas web consultabile con il flusso completo (React Flow + ELK.js)
- Percorso guidato: poche domande ("hai un dehors?", "fai cucina?") e checklist personalizzata con enti, documenti, costi e tempi
- Ogni passaggio mostra fonte e data di ultima verifica

## Fase 2 — Dati reali

- Chi ha fatto la pratica segnala tempi reali e intoppi
- Revisione dei contenuti da parte di professionisti
- Controllo periodico delle fonti, perché norme e moduli cambiano

## Fase 3 — Analisi con l'AI

L'AI analizza i grafi e cerca:

- documenti chiesti più volte da enti diversi (contro il principio "once only")
- passaggi in sequenza che potrebbero andare in parallelo
- colli di bottiglia, dove il tempo reale supera di molto quello previsto
- passaggi senza una base normativa chiara

Per ogni problema produce una proposta di semplificazione con la norma di riferimento. Le proposte sono sempre riviste da una persona.

## Fase 4 — Scala

- Report per l'amministrazione di Montevarchi: quanti giorni, enti e documenti servono oggi, e come si potrebbero ridurre
- Stessa procedura in altri comuni del Valdarno, per confrontarli
- Altre procedure nello stesso comune: seconda sede, prima assunzione, apertura partita IVA
- Poi province, regioni e procedure nazionali

## Rischi

| Rischio | Contromisura |
|---|---|
| Informazioni sbagliate | Fonte obbligatoria e data di verifica su ogni passaggio, avviso che lo strumento è informativo |
| Norme che cambiano | Versioni delle procedure e controllo periodico delle fonti |
| Rapporto con l'amministrazione | Presentarsi con dati neutri e proposte, non con accuse |
