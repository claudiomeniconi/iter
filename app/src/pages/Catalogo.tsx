import { useMemo, useState } from 'react'
import type { Procedura, Territorio } from '../types'
import {
  LIVELLO,
  conteggioVerifica,
  ente,
  inProgramma,
  italia,
  nomeCategoria,
  nomeTerritorio,
  procedure,
  staSotto,
  territori,
  valeIn,
} from '../data'
import { link } from '../router'
import { BarraVerifica } from '../components/Timbro'
import { Briciole } from '../components/Briciole'

function Albero({ nodo, attivo }: { nodo: Territorio; attivo: string }) {
  const n = procedure.filter((p) => staSotto(p.territorio.percorso, nodo.percorso)).length
  const figli = (nodo.figli ?? []) as Territorio[]
  return (
    <li>
      <a
        href={link.territorio(nodo.percorso)}
        className={`albero__voce ${attivo === nodo.percorso ? 'on' : ''}`}
        aria-current={attivo === nodo.percorso ? 'page' : undefined}
      >
        <span>{nodo.nome}</span>
        <small>{n}</small>
      </a>
      {figli.length > 0 && (
        <ul>
          {figli.map((f) => (
            <Albero key={f.percorso} nodo={f} attivo={attivo} />
          ))}
        </ul>
      )}
    </li>
  )
}

function Scheda({ p, mostraTerritorio }: { p: Procedura; mostraTerritorio: boolean }) {
  const entiPubblici = new Set(p.passaggi.map((s) => s.ente).filter((e) => ente(e).tipo !== 'richiedente'))
  return (
    <li>
      <a className="scheda-proc" href={link.procedura(p.id)}>
        <div className="scheda-proc__testa">
          <h3>{p.titolo}</h3>
          {p.stato === 'bozza' && <span className="etichetta">Bozza</span>}
        </div>
        <p className="scheda-proc__meta">
          {mostraTerritorio && <span>{nomeTerritorio(p.territorio.percorso)}</span>}
          <span>{nomeCategoria(p.categoria)}</span>
          <span>{p.passaggi.length} passaggi</span>
          <span>{entiPubblici.size} enti</span>
          <span>Verificata il {new Date(p.ultima_verifica).toLocaleDateString('it-IT')}</span>
        </p>
        <BarraVerifica c={conteggioVerifica(p)} />
      </a>
    </li>
  )
}

export default function Catalogo({ percorso }: { percorso: string }) {
  const t = territori.get(percorso) ?? italia
  const [q, setQ] = useState('')
  const [categoria, setCategoria] = useState<string | null>(null)

  const filtra = useMemo(() => {
    const s = q.trim().toLowerCase()
    return (p: { titolo: string; descrizione?: string; categoria?: string }) =>
      (!s || p.titolo.toLowerCase().includes(s) || (p.descrizione ?? '').toLowerCase().includes(s)) &&
      (!categoria || p.categoria === categoria)
  }, [q, categoria])

  const qui = procedure.filter((p) => staSotto(p.territorio.percorso, t.percorso) && filtra(p))
  const ereditate = procedure.filter(
    (p) => valeIn(p.territorio.percorso, t.percorso) && p.territorio.percorso !== t.percorso && filtra(p),
  )
  const programma = inProgramma.filter(
    (x) => (staSotto(x.territorio, t.percorso) || valeIn(x.territorio, t.percorso)) && filtra(x),
  )
  const categorie = [...new Set([...procedure.map((p) => p.categoria), ...inProgramma.map((x) => x.categoria)])].filter(
    Boolean,
  ) as string[]

  const regione = t.padri.find((p) => p.livello === 'regionale')
  const provincia = t.padri.find((p) => p.livello === 'provinciale')
  const sottotitolo =
    t.livello === 'nazionale'
      ? 'Tutte le procedure mappate finora, in ogni territorio.'
      : t.livello === 'comunale'
        ? `Comune${provincia ? ` in provincia di ${provincia.nome}` : ''}${regione ? `, ${regione.nome}` : ''}`
        : `${LIVELLO[t.livello]}${regione ? `, ${regione.nome}` : ''}`

  return (
    <div className="catalogo">
      <aside className="catalogo__lato">
        <h2>Territori</h2>
        <ul className="albero">
          <Albero nodo={italia} attivo={t.percorso} />
        </ul>
        <p className="catalogo__nota">Il numero indica le procedure mappate in quel territorio.</p>
      </aside>

      <main className="catalogo__corpo">
        {t.padri.length > 0 && <Briciole percorso={t.percorso} />}
        <h1>{t.livello === 'nazionale' ? 'Procedure' : t.nome}</h1>
        <p className="catalogo__sotto">{sottotitolo}</p>

        <div className="filtri">
          <input
            type="search"
            placeholder="Cerca una procedura, es. aprire un bar"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Cerca una procedura"
          />
          {categorie.length > 1 && (
            <div className="chips" role="group" aria-label="Categoria">
              <button className={!categoria ? 'on' : ''} onClick={() => setCategoria(null)}>
                Tutte
              </button>
              {categorie.map((c) => (
                <button key={c} className={categoria === c ? 'on' : ''} onClick={() => setCategoria(c)}>
                  {nomeCategoria(c)}
                </button>
              ))}
            </div>
          )}
        </div>

        <section>
          <h2>{t.livello === 'nazionale' ? 'Mappate' : `Mappate per ${t.nome}`}</h2>
          {qui.length ? (
            <ul className="lista-proc">
              {qui.map((p) => (
                <Scheda key={p.id} p={p} mostraTerritorio={p.territorio.percorso !== t.percorso} />
              ))}
            </ul>
          ) : (
            <p className="vuoto">
              {q || categoria
                ? 'Nessuna procedura corrisponde alla ricerca. Prova con altre parole o togli il filtro.'
                : `Per ${t.nome} non ci sono ancora procedure mappate. Puoi partire dal modello in data/procedure/_template.json.`}
            </p>
          )}
        </section>

        {ereditate.length > 0 && (
          <section>
            <h2>Valide anche qui</h2>
            <p className="sezione__aiuto">Procedure regionali o nazionali che si applicano anche a {t.nome}.</p>
            <ul className="lista-proc">
              {ereditate.map((p) => (
                <Scheda key={p.id} p={p} mostraTerritorio />
              ))}
            </ul>
          </section>
        )}

        {programma.length > 0 && (
          <section>
            <h2>In programma</h2>
            <p className="sezione__aiuto">Procedure che vogliamo mappare. Se ci sei passato, la tua esperienza aiuta.</p>
            <ul className="lista-programma">
              {programma.map((x) => (
                <li key={x.titolo + x.territorio}>
                  <strong>{x.titolo}</strong>
                  <span>{nomeTerritorio(x.territorio)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
