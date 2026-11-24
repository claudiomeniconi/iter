export type Fonte = { titolo: string; riferimento?: string; url?: string; verificata_il: string }
export type Documento = { id: string; nome: string; note?: string }
export type Costo = { voce: string; min_euro?: number; max_euro?: number }
export type Condizione = { domanda: string; valore: unknown }
export type StatoVerifica = 'bozza' | 'verificato_fonti' | 'verificato_ente'

export type Passaggio = {
  id: string
  titolo: string
  tipo: string
  ente: string
  attore?: 'richiedente' | 'professionista' | 'ente'
  documenti_richiesti?: Documento[]
  documenti_prodotti?: Documento[]
  costi?: Costo[]
  tempi?: { previsto_giorni?: number; reale_giorni?: number; reale_segnalazioni?: number; silenzio_assenso?: boolean }
  dipende_da?: string[]
  condizioni?: Condizione[]
  canale?: string
  fonti: Fonte[]
  stato_verifica?: StatoVerifica
  note?: string
}

export type Domanda = { id: string; testo: string; tipo: 'si_no' | 'scelta' | 'numero'; opzioni?: string[] }

export type TipoEnte = 'richiedente' | 'comunale' | 'regionale' | 'sanitario' | 'sicurezza' | 'camerale' | 'statale' | 'altro'
export type Ente = {
  id: string
  nome: string
  tipo: TipoEnte
  descrizione?: string
  territorio?: string
  sito?: string
  contatti?: { indirizzo?: string; telefono?: string; email?: string; pec?: string; orari?: string }
  fonte?: Fonte
}

export type Procedura = {
  id: string
  modello: string
  titolo: string
  descrizione?: string
  territorio: { livello: string; nome: string; codice_istat?: string; percorso: string }
  categoria?: string
  stato?: 'bozza' | 'pubblicata' | 'archiviata'
  versione: string
  ultima_verifica: string
  domande?: Domanda[]
  enti: { id: string }[]
  passaggi: Passaggio[]
}

export type NodoTerritorio = {
  id: string
  nome: string
  livello: 'nazionale' | 'regionale' | 'provinciale' | 'comunale'
  codice_istat?: string
  figli?: NodoTerritorio[]
}
export type Territorio = NodoTerritorio & { percorso: string; padri: Territorio[] }

export type InProgramma = { titolo: string; categoria?: string; territorio: string }

export type Risposte = Record<string, unknown>
/** attivo: si applica; possibile: dipende da una risposta non data; escluso: non si applica */
export type Applicabilita = 'attivo' | 'possibile' | 'escluso'
