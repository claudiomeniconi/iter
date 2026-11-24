import { useState } from 'react'
import type { TipoEnte } from '../types'
import { TIPO_ENTE, enti, nomeTerritorio, procedurePerEnte } from '../data'
import { link } from '../router'

export function ElencoEnti() {
  const [q, setQ] = useState('')
  const s = q.trim().toLowerCase()
  const lista = [...enti.values()].filter((e) => e.tipo !== 'richiedente' && (!s || e.nome.toLowerCase().includes(s)))
  const tipi = (Object.keys(TIPO_ENTE) as TipoEnte[]).filter((t) => lista.some((e) => e.tipo === t))
  return (
    <div className="pagina">
      <h1>Enti</h1>
      <p className="catalogo__sotto">Gli uffici che compaiono nelle procedure, con contatti e pratiche in cui sono coinvolti.</p>
      <div className="filtri">
        <input type="search" placeholder="Cerca un ente" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Cerca un ente" />
      </div>
      {tipi.length === 0 && <p className="vuoto">Nessun ente corrisponde alla ricerca.</p>}
      {tipi.map((t) => (
        <section key={t}>
          <h2 className="titolo-tipo">
            <span className="bollo" style={{ background: TIPO_ENTE[t].colore }} />
            {TIPO_ENTE[t].nome}
          </h2>
          <ul className="lista-enti">
            {lista
              .filter((e) => e.tipo === t)
              .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
              .map((e) => {
                const n = procedurePerEnte(e.id).length
                return (
                  <li key={e.id}>
                    <a href={link.ente(e.id)}>
                      <strong>{e.nome}</strong>
                      <span>{e.territorio ? nomeTerritorio(e.territorio) : ''}</span>
                      <span>{n === 1 ? '1 procedura' : `${n} procedure`}</span>
                    </a>
                  </li>
                )
              })}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function SchedaEnte({ id }: { id: string }) {
  const e = enti.get(id)
  if (!e)
    return (
      <div className="pagina">
        <h1>Ente non trovato</h1>
        <p>
          Nessun ente ha l'identificativo «{id}». <a href={link.enti()}>Torna agli enti</a>.
        </p>
      </div>
    )
  const proc = procedurePerEnte(id)
  const c = e.contatti ?? {}
  const voci: [string, string | undefined][] = [
    ['Indirizzo', c.indirizzo],
    ['Telefono', c.telefono],
    ['Email', c.email],
    ['PEC', c.pec],
    ['Orari', c.orari],
  ]
  return (
    <div className="pagina" style={{ ['--ente' as string]: TIPO_ENTE[e.tipo].colore }}>
      <nav className="briciole" aria-label="Percorso">
        <ol>
          <li>
            <a href={link.enti()}>Enti</a>
          </li>
          <li aria-current="page">{TIPO_ENTE[e.tipo].nome}</li>
        </ol>
      </nav>
      <h1 className="ente__titolo">{e.nome}</h1>
      <p className="catalogo__sotto">{e.territorio ? nomeTerritorio(e.territorio) : ''}</p>
      {e.descrizione && <p>{e.descrizione}</p>}

      <div className="ente__griglia">
        <section>
          <h2>Contatti</h2>
          {voci.some(([, v]) => v) || e.sito ? (
            <dl className="scheda">
              {voci
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="scheda__riga">
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              {e.sito && (
                <div className="scheda__riga">
                  <dt>Sito</dt>
                  <dd>
                    <a href={e.sito} target="_blank" rel="noreferrer">
                      {new URL(e.sito).hostname}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="vuoto">Contatti non ancora raccolti.</p>
          )}
          {e.fonte && (
            <p className="fonte-ente">
              Fonte:{' '}
              {e.fonte.url ? (
                <a href={e.fonte.url} target="_blank" rel="noreferrer">
                  {e.fonte.titolo}
                </a>
              ) : (
                e.fonte.titolo
              )}
              , verificata il {new Date(e.fonte.verificata_il).toLocaleDateString('it-IT')}
            </p>
          )}
        </section>

        <section>
          <h2>Dove compare</h2>
          {proc.length === 0 && <p className="vuoto">Non compare ancora in nessuna procedura.</p>}
          {proc.map((p) => (
            <div key={p.id} className="ente__proc">
              <a href={link.procedura(p.id)}>
                <strong>{p.titolo}</strong>
              </a>
              <span>{nomeTerritorio(p.territorio.percorso)}</span>
              <ul>
                {p.passaggi
                  .filter((s) => s.ente === id)
                  .map((s) => (
                    <li key={s.id}>{s.titolo}</li>
                  ))}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
