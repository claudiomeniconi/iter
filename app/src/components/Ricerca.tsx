import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cerca, evidenzia } from '../search'
import { coloreEnte, ente, nomeTerritorio } from '../data'
import { link } from '../router'

export function Ricerca({ grande = false, iniziale = '', autoFocus = false }: { grande?: boolean; iniziale?: string; autoFocus?: boolean }) {
  const [q, setQ] = useState(iniziale)
  const [aperto, setAperto] = useState(false)
  const [attivo, setAttivo] = useState(-1)
  const id = useId()
  const box = useRef<HTMLDivElement>(null)
  const risultati = useMemo(() => cerca(q, 7), [q])

  useEffect(() => setQ(iniziale), [iniziale])
  useEffect(() => {
    const fuori = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setAperto(false)
    document.addEventListener('mousedown', fuori)
    return () => document.removeEventListener('mousedown', fuori)
  }, [])

  const vai = (hash: string) => {
    setAperto(false)
    location.hash = hash
  }
  const invia = () => {
    if (attivo >= 0 && risultati[attivo]) return vai(link.procedura(risultati[attivo].p.id))
    if (q.trim()) vai(link.cerca(q.trim()))
  }
  const tasto = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAperto(true)
      setAttivo((a) => Math.min(a + 1, risultati.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAttivo((a) => Math.max(a - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      invia()
    } else if (e.key === 'Escape') setAperto(false)
  }
  const mostra = aperto && q.trim().length > 0

  return (
    <div className={`ricerca ${grande ? 'ricerca--grande' : ''} ${mostra ? 'ricerca--aperta' : ''}`} ref={box}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          invia()
        }}
      >
        <svg className="ricerca__lente" viewBox="0 0 24 24" aria-hidden>
          <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={q}
          autoFocus={autoFocus}
          placeholder={grande ? 'Cosa devi fare? Es. aprire un bar, affittare casa ai turisti…' : 'Cerca una procedura'}
          aria-label="Cerca una procedura"
          role="combobox"
          aria-expanded={mostra}
          aria-controls={id}
          aria-activedescendant={attivo >= 0 ? `${id}-${attivo}` : undefined}
          autoComplete="off"
          onChange={(e) => {
            setQ(e.target.value)
            setAperto(true)
            setAttivo(-1)
          }}
          onFocus={() => setAperto(true)}
          onKeyDown={tasto}
        />
        {q && (
          <button type="button" className="ricerca__pulisci" aria-label="Cancella" onClick={() => (setQ(''), setAttivo(-1))}>
            ×
          </button>
        )}
      </form>
      {mostra && (
        <ul className="ricerca__menu" role="listbox" id={id}>
          {risultati.length === 0 && <li className="ricerca__vuoto">Nessuna procedura trovata. Prova con parole diverse, per esempio «negozio» o «lavori in casa».</li>}
          {risultati.map((r, i) => (
            <li
              key={r.p.id}
              id={`${id}-${i}`}
              role="option"
              aria-selected={i === attivo}
              className={i === attivo ? 'on' : ''}
              onMouseEnter={() => setAttivo(i)}
              onMouseDown={(e) => (e.preventDefault(), vai(link.procedura(r.p.id)))}
            >
              <span className="bollo" style={{ background: coloreEnte(r.p.passaggi.find((x) => ente(x.ente).tipo !== 'richiedente')?.ente ?? '') }} />
              <span className="ricerca__titolo">
                {evidenzia(r.p.titolo, r.parole).map((x, k) => (x.on ? <mark key={k}>{x.t}</mark> : <span key={k}>{x.t}</span>))}
              </span>
              <small>{nomeTerritorio(r.p.territorio.percorso)}</small>
            </li>
          ))}
          {risultati.length > 0 && (
            <li className="ricerca__tutti" onMouseDown={(e) => (e.preventDefault(), vai(link.cerca(q.trim())))}>
              Vedi tutti i risultati per «{q.trim()}»
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
