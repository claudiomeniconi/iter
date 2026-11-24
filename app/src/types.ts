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
export type Ente = { id: string; nome: string; sito?: string }

export type Procedura = {
  id: string
  titolo: string
  descrizione?: string
  territorio: { livello: string; nome: string; codice_istat?: string }
  categoria?: string
  versione: string
  ultima_verifica: string
  domande?: Domanda[]
  enti: Ente[]
  passaggi: Passaggio[]
}

export type Risposte = Record<string, unknown>
/** attivo: si applica; possibile: dipende da una risposta non data; escluso: non si applica */
export type Applicabilita = 'attivo' | 'possibile' | 'escluso'
