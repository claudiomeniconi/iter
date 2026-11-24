import type { Ente, InProgramma, NodoTerritorio, Procedura, StatoVerifica, Territorio, TipoEnte } from './types'
import alberoItalia from '../../data/territori/it.json'
import inProgrammaJson from '../../data/procedure-in-programma.json'

const fileProcedure = import.meta.glob<Procedura>('../../data/procedure/**/*.json', { eager: true, import: 'default' })
const fileEnti = import.meta.glob<Ente[]>('../../data/enti/*.json', { eager: true, import: 'default' })

export const procedure: Procedura[] = Object.entries(fileProcedure)
  .filter(([path]) => !path.endsWith('_template.json'))
  .map(([, p]) => p)
  .sort((a, b) => a.titolo.localeCompare(b.titolo, 'it'))

export const enti = new Map<string, Ente>(Object.values(fileEnti).flat().map((e) => [e.id, e]))
export const inProgramma = inProgrammaJson as InProgramma[]

/* Territori */
export const territori = new Map<string, Territorio>()
function indicizza(n: NodoTerritorio, padri: Territorio[], base: string): Territorio {
  const percorso = base ? `${base}/${n.id}` : n.id
  const t: Territorio = { ...n, percorso, padri }
  territori.set(percorso, t)
  t.figli = (n.figli ?? []).map((f) => indicizza(f, [...padri, t], percorso))
  return t
}
export const italia = indicizza(alberoItalia as NodoTerritorio, [], '')

/** Una procedura vale nel suo territorio e in tutti quelli sotto (una procedura nazionale vale ovunque). */
export const valeIn = (procPercorso: string, territorio: string) =>
  territorio === procPercorso || territorio.startsWith(procPercorso + '/')
/** La procedura è definita in quel territorio o in uno dei suoi figli. */
export const staSotto = (procPercorso: string, territorio: string) =>
  procPercorso === territorio || procPercorso.startsWith(territorio + '/')

export function nomeTerritorio(percorso: string) {
  const t = territori.get(percorso)
  if (!t) return percorso
  if (t.livello === 'comunale') {
    const prov = t.padri.find((p) => p.livello === 'provinciale')
    return prov ? `${t.nome} (${prov.id.toUpperCase()})` : t.nome
  }
  return t.livello === 'nazionale' ? 'Tutta Italia' : t.nome
}

export const LIVELLO: Record<string, string> = {
  nazionale: 'Nazionale',
  regionale: 'Regione',
  provinciale: 'Provincia',
  comunale: 'Comune',
}

/* Enti */
export const TIPO_ENTE: Record<TipoEnte, { nome: string; colore: string }> = {
  richiedente: { nome: 'Chi fa la pratica', colore: '#5B6475' },
  comunale: { nome: 'Comune', colore: '#2F5D9E' },
  regionale: { nome: 'Regione', colore: '#5E7330' },
  sanitario: { nome: 'Sanità', colore: '#21806F' },
  sicurezza: { nome: 'Sicurezza e soccorso', colore: '#B2452F' },
  camerale: { nome: 'Camera di Commercio', colore: '#9A7316' },
  statale: { nome: 'Stato', colore: '#7550A3' },
  altro: { nome: 'Altro', colore: '#8792A6' },
}
export const ente = (id: string): Ente => enti.get(id) ?? { id, nome: id, tipo: 'altro' }
export const coloreEnte = (id: string) => TIPO_ENTE[ente(id).tipo].colore

export const procedurePerEnte = (id: string) => procedure.filter((p) => p.passaggi.some((s) => s.ente === id))

/* Verifica */
export function conteggioVerifica(p: Procedura) {
  const c: Record<StatoVerifica, number> = { bozza: 0, verificato_fonti: 0, verificato_ente: 0 }
  p.passaggi.forEach((s) => c[s.stato_verifica ?? 'bozza']++)
  return c
}

export const CATEGORIE: Record<string, string> = {
  impresa: 'Impresa',
  cittadino: 'Cittadino',
  edilizia: 'Edilizia',
}
export const nomeCategoria = (c?: string) => (c ? (CATEGORIE[c] ?? c) : 'Altro')
