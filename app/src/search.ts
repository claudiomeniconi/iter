import type { Procedura } from './types'
import { ente, nomeCategoria, nomeTerritorio, procedure } from './data'

/* ---------- Normalizzazione ---------- */
const STOP = new Set(
  'a ad al alla alle allo ai agli il lo la i gli le un uno una di da del della delle dei degli dello in nel nella nei per con su sul sulla tra fra e ed o od che come mi ti si ci vi non piu più cosa quale quali voglio vorrei devo posso come fare fai serve servono mio mia miei mie nuovo nuova nuovi nuove un\' l\''.split(' '),
)
export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9& ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Radice italiana molto semplice: abbastanza per far combaciare singolare/plurale e forme verbali comuni. */
export const radice = (t: string) => {
  if (t.length <= 4) return t
  return t.replace(/(azioni|azione|zioni|zione|mente|ando|endo|are|ere|ire|ari|ali|ale|i|e|a|o)$/, '')
}
const token = (s: string) =>
  norm(s)
    .split(' ')
    .filter((t) => t && !STOP.has(t))

/* ---------- Sinonimi: come la gente chiama le cose ---------- */
const SINONIMI: [string, string][] = [
  ['bar', 'somministrazione'],
  ['ristorante', 'somministrazione'],
  ['pizzeria', 'somministrazione'],
  ['pub', 'somministrazione'],
  ['locale', 'somministrazione'],
  ['gelateria', 'somministrazione'],
  ['negozio', 'vicinato'],
  ['bottega', 'vicinato'],
  ['b&b', 'bed breakfast affittacamere'],
  ['bnb', 'bed breakfast affittacamere'],
  ['casa vacanze', 'extra alberghiera'],
  ['airbnb', 'locazione turistica'],
  ['affitto breve', 'locazione turistica'],
  ['affitti brevi', 'locazione turistica'],
  ['affittare casa', 'locazione turistica'],
  ['parrucchiere', 'acconciatore'],
  ['barbiere', 'acconciatore'],
  ['estetica', 'estetista'],
  ['meccanico', 'autoriparazione officina'],
  ['carrozzeria', 'autoriparazione'],
  ['gommista', 'autoriparazione'],
  ['elettrauto', 'autoriparazione'],
  ['piva', 'partita iva'],
  ['p iva', 'partita iva'],
  ['freelance', 'partita iva professionista'],
  ['dipendente', 'assumere'],
  ['assunzione', 'assumere'],
  ['assumo', 'assumere'],
  ['badante', 'domestico colf'],
  ['trasloco', 'residenza'],
  ['cie', 'carta identita'],
  ['documento', 'carta identita'],
  ['sagra', 'temporanea evento'],
  ['festa', 'evento temporanea'],
  ['concerto', 'spettacolo evento'],
  ['ristrutturare', 'ristrutturazioni lavori interni'],
  ['ristrutturazione', 'ristrutturazioni lavori interni'],
  ['lavori casa', 'manutenzione straordinaria cila'],
  ['bagno', 'manutenzione straordinaria cila'],
  ['costruire', 'permesso costruire'],
  ['abitabilita', 'agibilita'],
  ['chiudere', 'cessare cessazione chiusura'],
  ['ambulante', 'aree pubbliche mercati'],
  ['mercato', 'aree pubbliche'],
  ['online', 'commercio online'],
  ['ecommerce', 'commercio online'],
  ['e commerce', 'commercio online'],
  ['sito', 'commercio online'],
  ['srls', 'srl semplificata'],
  ['societa', 'srl snc sas'],
  ['ditta', 'ditta individuale'],
  ['tavolini', 'dehors suolo pubblico'],
  ['tavoli fuori', 'dehors'],
  ['cartello', 'insegna'],
  ['musica', 'spettacolo rumore'],
  ['rumore', 'deroga rumore'],
  ['benzinaio', 'carburanti'],
  ['distributore', 'carburanti distributori'],
  ['palestra', 'sportivo'],
  ['nido', 'asilo nido'],
  ['scuolabus', 'trasporto scolastico'],
  ['multa', 'polizia municipale'],
  ['parcheggio', 'sosta ztl'],
  ['subentrare', 'subingresso'],
  ['rilevare', 'subingresso'],
  ['comprare bar', 'subingresso somministrazione'],
  ['taxi', 'taxi ncc'],
  ['sposarsi', 'matrimonio'],
  ['matrimonio', 'sposarsi'],
]

/* ---------- Indice ---------- */
type Campo = { peso: number; parole: string[] }
type Voce = { p: Procedura; campi: Campo[]; titoloNorm: string }

const voci: Voce[] = procedure.map((p) => {
  const passi = p.passaggi.map((s) => s.titolo).join(' ')
  const enti = [...new Set(p.passaggi.map((s) => ente(s.ente).nome))].join(' ')
  const doc = p.passaggi.flatMap((s) => [...(s.documenti_richiesti ?? []), ...(s.documenti_prodotti ?? [])].map((d) => d.nome)).join(' ')
  return {
    p,
    titoloNorm: norm(p.titolo),
    campi: [
      { peso: 10, parole: token(p.titolo) },
      { peso: 4, parole: token(`${p.descrizione ?? ''} ${p.modello.replace(/[.-]/g, ' ')}`) },
      { peso: 2, parole: token(passi) },
      { peso: 1.5, parole: token(`${enti} ${doc}`) },
      { peso: 1, parole: token(`${nomeCategoria(p.categoria)} ${nomeTerritorio(p.territorio.percorso)}`) },
    ],
  }
})

function levenshtein(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let minRiga = i
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      minRiga = Math.min(minRiga, cur[j])
    }
    if (minRiga > max) return max + 1
    prev = cur
  }
  return prev[b.length]
}

/** Quanto una parola della query somiglia a una parola dell'indice (0-1). */
function somiglianza(q: string, w: string, ultima: boolean) {
  if (q === w) return 1
  const rq = radice(q)
  const rw = radice(w)
  if (rq === rw) return 0.95
  if (w.startsWith(q) && q.length >= 2) return ultima ? 0.9 : 0.75 // completamento mentre si scrive
  if (q.length >= 4 && rw.startsWith(rq)) return 0.7
  if (q.length >= 5) {
    const max = q.length >= 8 ? 2 : 1
    if (levenshtein(q, w, max) <= max) return 0.6 // errore di battitura
  }
  return 0
}

export type Risultato = { p: Procedura; punteggio: number; parole: string[] }

export function cerca(query: string, limite = 50): Risultato[] {
  const qn = norm(query)
  if (!qn) return []
  const originali = token(query)
  const ultimaParola = qn.endsWith(' ') ? '' : (originali[originali.length - 1] ?? '')
  const extra: string[] = []
  for (const [chiave, valore] of SINONIMI) {
    const k = norm(chiave)
    const simile = (o: string) =>
      radice(o) === radice(k) || (k.length >= 5 && !k.includes(' ') && levenshtein(o, k, k.length >= 8 ? 2 : 1) <= (k.length >= 8 ? 2 : 1))
    if ((' ' + qn + ' ').includes(' ' + k + ' ') || (k.length >= 4 && originali.some(simile))) extra.push(...token(valore))
  }
  if (!originali.length && !extra.length) return []

  const risultati: Risultato[] = []
  for (const v of voci) {
    let punteggio = 0
    let trovate = 0
    const parole: string[] = []
    const valuta = (q: string, pesoQuery: number, ultima: boolean) => {
      let migliore = 0
      for (const c of v.campi)
        for (const w of c.parole) {
          const s = somiglianza(q, w, ultima)
          if (s) {
            migliore = Math.max(migliore, s * c.peso)
            if (c.peso === 10 && s >= 0.6) parole.push(w)
          }
        }
      return migliore * pesoQuery
    }
    let daSinonimi = 0
    for (const q of extra) daSinonimi = Math.max(daSinonimi, valuta(q, 0.9, false))
    for (const q of originali) {
      const s = valuta(q, 1, q === ultimaParola)
      if (s > 0) trovate++
      punteggio += s
    }
    punteggio += daSinonimi * 1.5
    const copertura = originali.length ? trovate / originali.length : 1
    if (punteggio <= 0 || (copertura < 0.5 && !daSinonimi)) continue
    // Bonus se la frase intera compare nel titolo
    if (qn.length > 3 && v.titoloNorm.includes(qn)) punteggio += 15
    risultati.push({ p: v.p, punteggio: punteggio * (0.5 + copertura / 2), parole })
  }
  risultati.sort((a, b) => b.punteggio - a.punteggio)
  const soglia = (risultati[0]?.punteggio ?? 0) * 0.3
  return risultati.filter((r) => r.punteggio >= soglia).slice(0, limite)
}

/** Evidenzia nel titolo le parole che hanno fatto trovare il risultato. */
export function evidenzia(titolo: string, parole: string[]) {
  if (!parole.length) return [{ t: titolo, on: false }]
  const set = new Set(parole)
  return titolo.split(/(\s+)/).map((pezzo) => ({ t: pezzo, on: set.has(norm(pezzo)) }))
}

/** Procedure suggerite in home: le più richieste. */
export const SUGGERITE = [
  'montevarchi.somministrazione.apertura',
  'montevarchi.commercio.vicinato',
  'it.impresa.ditta-individuale',
  'it.lavoro.partita-iva-professionista',
  'montevarchi.turismo.locazione-privata',
  'montevarchi.edilizia.cila',
  'montevarchi.cittadino.cambio-residenza',
  'montevarchi.servizi.acconciatore-estetista',
]
  .map((id) => procedure.find((p) => p.id === id))
  .filter(Boolean) as Procedura[]

export const ESEMPI = ['aprire un bar', 'affitti brevi', 'parrucchiere', 'assumere un dipendente', 'ristrutturare casa', 'sagra']
