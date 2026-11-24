# Montevarchi: aprire un bar, ristorante o pizzeria

Note di lavoro della Fase 0 per la procedura in [`data/procedure/it/toscana/ar/montevarchi/somministrazione-apertura.json`](../../data/procedure/it/toscana/ar/montevarchi/somministrazione-apertura.json).

Stato: **bozza 0.1.0**, fonti consultate il 24/11/2026.

## Quadro in breve

- In Toscana la somministrazione è regolata dalla **L.R. 62/2018 (Codice del Commercio), Capo VI, artt. 47-54**.
- Fuori dalle zone tutelate l'apertura richiede una **SCIA** al SUAP (art. 50). Nelle zone tutelate, se il Comune le ha individuate, serve un'**autorizzazione**.
- A Montevarchi tutte le pratiche SUAP passano da **STAR**, il portale regionale, con accesso SPID, CIE o CNS. Il SUAP coordina gli altri enti (ASL, Vigili del Fuoco), quindi non serve contattarli direttamente.
- Con la SCIA si può iniziare subito. Il Comune ha **60 giorni** per i controlli (art. 19 L. 241/1990).

## Fonti

| Fonte | Uso |
|---|---|
| [SUAP Comune di Montevarchi](https://www.comune.montevarchi.ar.it/unit%C3%A0-organizzative/2365133/ufficio-servizio-sviluppo-economico-suap) | Contatti, orari, competenze |
| [Accesso allo sportello SUAP (STAR)](https://www.comune.montevarchi.ar.it/servizi/servizio-dettaglio/2246471) | Canale di presentazione, link a STAR e modulistica |
| [Tariffe diritti SUAP Montevarchi](https://www.comune.montevarchi.ar.it/documenti/2246544/tariffe-diritti-suap) | Diritti di istruttoria (file .doc allegato, da leggere) |
| [L.R. Toscana 62/2018](https://raccoltanormativa.consiglio.regione.toscana.it/class/download_doc.php?file_path=legge/2018/legge_2018_62_s1/legge_2018_62_s1_v1.pdf) | Titolo abilitativo, requisiti, zone tutelate |
| [Elenco modulistica unica regionale (7/10/2026)](https://www.regione.toscana.it/documents/d/guest/elenco-della-modulistica-unica-in-uso-al-7-ottobre-2026-pdf) | Moduli in vigore e atti di approvazione |
| [SIT Montevarchi](https://www.sitmontevarchi.it/suap) | Regolamenti comunali: edilizio, pubblicità, orari, suolo pubblico |
| [Brochure attività alimentari, SUAP Firenze](https://suapfo.comune.firenze.it/documents/d/citta-di-firenze/4888387-brochure_attivit__alimentari_-_aggiornato_a_unesco_20_e_lr_62_rev_maggio_2023_versione_vide_3832774743342763) | Riferimento sui requisiti professionali in Toscana (non specifico per Montevarchi) |

Nota sul metodo: una scheda regionale ancora online ([Somministrazione alimenti bevande](https://www.regione.toscana.it/documents/10180/720291/Somministrazione+alimenti+bevande/caaf6fa8-4173-47ca-8fc7-c2a567396acd)) descrive ancora la DIA e la vecchia L.R. 28/2005, sostituita nel 2018. È un buon esempio del perché ogni passaggio di Iter deve avere una data di verifica.

## Domande aperte per il SUAP

Da portare all'incontro o allo sportello telefonico:

1. Montevarchi ha individuato **zone tutelate** per la somministrazione (art. 50 L.R. 62/2018)? Con quale delibera?
2. Esiste un **regolamento comunale** sui requisiti degli esercizi di somministrazione (art. 49)?
3. Su STAR la **notifica sanitaria** è contestuale alla SCIA o va presentata a parte?
4. Per l'**impatto acustico**, quando basta la dichiarazione sostitutiva e quando serve la valutazione di un tecnico?
5. Quali **destinazioni d'uso** ammettono la somministrazione nel piano urbanistico?
6. Esiste un regolamento specifico per i **dehors** e come si calcola il canone?
7. Quali sono i **tempi reali** medi per le pratiche collegate (insegna, dehors, eventuale parere ASL)?

## Domande per le interviste

Per chi ha aperto un locale a Montevarchi negli ultimi anni:

1. Quanto tempo è passato dalla decisione all'apertura? Quale passaggio ha richiesto più tempo?
2. Quali professionisti hai dovuto pagare e quanto hai speso in totale per le pratiche?
3. Qualche documento ti è stato chiesto più volte da enti diversi?
4. Ci sono stati passaggi che non ti aspettavi?
5. Cosa avresti voluto sapere prima di cominciare?

## Prossimi passi

- [ ] Leggere il file delle tariffe SUAP e inserire gli importi
- [ ] Aprire su STAR la scheda del procedimento di somministrazione per Montevarchi e confrontarla con la bozza
- [ ] Chiarire le domande aperte con il SUAP
- [ ] Fare 2-3 interviste e 1 intervista a un professionista
- [ ] Portare i passaggi da `bozza` a `verificato_ente`

---

# Altre procedure (bozza 0.1.0, 24/11/2026)

## Rilevare un locale già aperto (subingresso)

File: [`somministrazione-subingresso.json`](../../data/procedure/it/toscana/ar/montevarchi/somministrazione-subingresso.json)

- Base: **art. 90 L.R. 62/2018**. Chi subentra presenta una **comunicazione** al SUAP entro 60 giorni dall'atto e comunque **prima di iniziare** a lavorare. Deve avere i requisiti degli artt. 11-12.
- L'atto di cessione o affitto d'azienda va fatto per atto pubblico o scrittura privata autenticata. Il notaio lo deposita al Registro Imprese entro 30 giorni (art. 2556 c.c.).
- La registrazione sanitaria va aggiornata con il nuovo titolare ([FAQ SUAP Lucca](https://comune.lucca.it/app/uploads/2023/05/FAQ.pdf) come riferimento di prassi toscana).

Domande aperte per il SUAP:
1. Su STAR, l'aggiornamento della notifica sanitaria è contestuale alla comunicazione di subingresso?
2. Insegna e dehors del cedente: basta una voltura o serve una nuova domanda?

## Aprire un secondo locale

File: [`somministrazione-seconda-sede.json`](../../data/procedure/it/toscana/ar/montevarchi/somministrazione-seconda-sede.json)

Ricalca l'apertura, senza la partita IVA e con la comunicazione dell'unità locale al Registro Imprese.

Domande aperte:
1. La stessa persona può fare da preposto in due locali contemporaneamente?
2. Termine per la comunicazione dell'unità locale al REA.

## Procedure nazionali collegate

- [Assumere il primo dipendente](../../data/procedure/it/lavoro-primo-dipendente.json): comunicazione obbligatoria entro il giorno prima (L. 296/2006, art. 1, c. 1180), INPS, INAIL, sicurezza (D.Lgs. 81/2008), Libro unico.
- [Aprire la partita IVA come professionista](../../data/procedure/it/lavoro-partita-iva-professionista.json): modello AA9/12 entro 30 giorni (art. 35 D.P.R. 633/1972), Gestione Separata INPS o cassa, albo, PEC, RC professionale, fattura elettronica.

Queste due valgono in tutta Italia e compaiono anche nella pagina di Montevarchi. Vanno riviste con un consulente del lavoro e un commercialista.
