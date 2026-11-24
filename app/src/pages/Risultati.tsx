import { useMemo, useState } from 'react'
import { cerca, evidenzia } from '../search'
import { CATEGORIE, conteggioVerifica, nomeCategoria, nomeTerritorio, procedure } from '../data'
import { link } from '../router'
import { BarraVerifica } from '../components/Timbro'

export default function Risultati({ q, categoria }: { q: string; categoria?: string }) {
  const [filtro, setFiltro] = useState<string | null>(categoria ?? null)
  const tutti = useMemo(
    () => (q ? cerca(q, 200) : procedure.map((p) => ({ p, punteggio: 0, parole: [] as string[] }))),
    [q],
  )
  const conteggi = new Map<string, number>()
  tutti.forEach((r) => conteggi.set(r.p.categoria ?? 'altro', (conteggi.get(r.p.categoria ?? 'altro') ?? 0) + 1))
  const lista = tutti.filter((r) => !filtro || r.p.categoria === filtro)

  return (
    <div className="pagina risultati">
      <h1>{q ? `Risultati per «${q}»` : nomeCategoria(categoria)}</h1>
      <p className="catalogo__sotto">
        {lista.length === 1 ? '1 procedura' : `${lista.length} procedure`}
        {q && ', ordinate per pertinenza'}
      </p>
      {conteggi.size > 1 && (
        <div className="chips" role="group" aria-label="Categoria">
          <button className={!filtro ? 'on' : ''} onClick={() => setFiltro(null)}>
            Tutte ({tutti.length})
          </button>
          {Object.keys(CATEGORIE)
            .filter((c) => conteggi.has(c))
            .map((c) => (
              <button key={c} className={filtro === c ? 'on' : ''} onClick={() => setFiltro(c)}>
                {nomeCategoria(c)} ({conteggi.get(c)})
              </button>
            ))}
        </div>
      )}
      {lista.length === 0 ? (
        <p className="vuoto">
          Nessuna procedura trovata per «{q}». Prova con parole più semplici o con un sinonimo, oppure{' '}
          <a href={link.territorio('it/toscana/ar/montevarchi')}>sfoglia l'elenco completo</a>.
        </p>
      ) : (
        <ul className="lista-proc">
          {lista.map((r) => (
            <li key={r.p.id}>
              <a className="scheda-proc" href={link.procedura(r.p.id)}>
                <div className="scheda-proc__testa">
                  <h3>{evidenzia(r.p.titolo, r.parole).map((x, k) => (x.on ? <mark key={k}>{x.t}</mark> : <span key={k}>{x.t}</span>))}</h3>
                </div>
                <p className="scheda-proc__meta">
                  <span>{nomeTerritorio(r.p.territorio.percorso)}</span>
                  <span>{nomeCategoria(r.p.categoria)}</span>
                  <span>{r.p.passaggi.length} passaggi</span>
                </p>
                {r.p.descrizione && <p className="scheda-proc__desc">{r.p.descrizione.split(' Bozza della Fase 0')[0]}</p>}
                <BarraVerifica c={conteggioVerifica(r.p)} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
