import type { Applicabilita, Passaggio, Procedura, Risposte } from './types'

export function applicabilita(p: Passaggio, r: Risposte): Applicabilita {
  let esito: Applicabilita = 'attivo'
  for (const c of p.condizioni ?? []) {
    const v = r[c.domanda]
    if (v === undefined) esito = 'possibile'
    else if (v !== c.valore) return 'escluso'
  }
  return esito
}

/** Passaggi visibili in ordine topologico, con il livello (fase) di ciascuno. */
export function ordina(proc: Procedura, r: Risposte) {
  const visibili = proc.passaggi.filter((p) => applicabilita(p, r) !== 'escluso')
  const ids = new Set(visibili.map((p) => p.id))
  const livello = new Map<string, number>()
  const byId = new Map(visibili.map((p) => [p.id, p]))
  const calcola = (id: string, stack = new Set<string>()): number => {
    if (livello.has(id)) return livello.get(id)!
    if (stack.has(id)) return 0
    stack.add(id)
    const deps = (byId.get(id)?.dipende_da ?? []).filter((d) => ids.has(d))
    const l = deps.length ? Math.max(...deps.map((d) => calcola(d, stack))) + 1 : 0
    livello.set(id, l)
    return l
  }
  visibili.forEach((p) => calcola(p.id))
  const ordinati = [...visibili].sort((a, b) => livello.get(a.id)! - livello.get(b.id)!)
  return { ordinati, livello }
}

/** Giorni minimi previsti dalla norma lungo il percorso più lungo (solo passaggi con tempi noti). */
export function giorniCritici(proc: Procedura, r: Risposte) {
  const { ordinati } = ordina(proc, r)
  const fine = new Map<string, number>()
  for (const p of ordinati) {
    const start = Math.max(0, ...(p.dipende_da ?? []).map((d) => fine.get(d) ?? 0))
    fine.set(p.id, start + (p.tempi?.previsto_giorni ?? 0))
  }
  return Math.max(0, ...fine.values())
}
