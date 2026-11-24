import { useEffect, useMemo, useState } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import type { Applicabilita, Ente, Passaggio, Procedura, Risposte, StatoVerifica } from './types'
import { applicabilita, ordina } from './logic'
import { layout } from './layout'

const moduli = import.meta.glob<Procedura>('../../data/procedure/**/*.json', { eager: true, import: 'default' })
const procedure = Object.entries(moduli)
  .filter(([path]) => !path.endsWith('_template.json'))
  .map(([, p]) => p)

const COLORI_ENTE = ['#2F5D9E', '#5E7330', '#21806F', '#B2452F', '#7550A3', '#9A7316', '#2D7AA8', '#5B6475']

const STATO: Record<StatoVerifica, { label: string; breve: string }> = {
  bozza: { label: 'Bozza da confermare', breve: 'Bozza' },
  verificato_fonti: { label: 'Controllato sulle fonti ufficiali', breve: 'Su fonti' },
  verificato_ente: { label: "Confermato dall'ente o da un professionista", breve: 'Confermato' },
}

const ATTORE: Record<string, string> = {
  richiedente: 'Lo fai tu',
  professionista: 'Con un professionista',
  ente: "Lo fa l'ente",
}

type DatiNodo = { p: Passaggio; ente: Ente; colore: string; stato: Applicabilita; selezionato: boolean }

function NodoPassaggio({ data }: NodeProps<Node<DatiNodo>>) {
  const { p, ente, colore, stato, selezionato } = data
  const sv = p.stato_verifica ?? 'bozza'
  return (
    <div
      className={`nodo nodo--${stato} ${selezionato ? 'nodo--sel' : ''}`}
      style={{ ['--ente' as string]: colore }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="nodo__ente">{ente.nome}</div>
      <div className="nodo__titolo">{p.titolo}</div>
      <div className="nodo__piede">
        <span>{stato === 'possibile' ? 'Dipende dalle risposte' : ATTORE[p.attore ?? 'richiedente']}</span>
        <span className={`timbro timbro--${sv}`} title={STATO[sv].label}>
          {STATO[sv].breve}
        </span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
const nodeTypes = { passaggio: NodoPassaggio }

function Mappa({
  proc,
  risposte,
  colori,
  selezionato,
  onSeleziona,
}: {
  proc: Procedura
  risposte: Risposte
  colori: Map<string, string>
  selezionato: string | null
  onSeleziona: (id: string | null) => void
}) {
  const [nodes, setNodes] = useState<Node<DatiNodo>[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const { fitView } = useReactFlow()
  const enti = useMemo(() => new Map(proc.enti.map((e) => [e.id, e])), [proc])

  const visibili = useMemo(
    () => proc.passaggi.map((p) => ({ p, stato: applicabilita(p, risposte) })).filter((x) => x.stato !== 'escluso'),
    [proc, risposte],
  )

  useEffect(() => {
    const ids = new Set(visibili.map((x) => x.p.id))
    const n: Node<DatiNodo>[] = visibili.map(({ p, stato }) => ({
      id: p.id,
      type: 'passaggio',
      position: { x: 0, y: 0 },
      data: { p, ente: enti.get(p.ente)!, colore: colori.get(p.ente)!, stato, selezionato: false },
    }))
    const e: Edge[] = visibili.flatMap(({ p }) =>
      (p.dipende_da ?? [])
        .filter((d) => ids.has(d))
        .map((d) => ({
          id: `${d}->${p.id}`,
          source: d,
          target: p.id,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
        })),
    )
    let vivo = true
    layout(n, e).then((pos) => {
      if (!vivo) return
      setNodes(pos as Node<DatiNodo>[])
      setEdges(e)
      requestAnimationFrame(() => fitView({ padding: 0.12, duration: 300 }))
    })
    return () => {
      vivo = false
    }
  }, [visibili, enti, colori, fitView])

  const conSelezione = useMemo(
    () => nodes.map((n) => ({ ...n, data: { ...n.data, selezionato: n.id === selezionato } })),
    [nodes, selezionato],
  )
  const archi = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        className: selezionato && (e.source === selezionato || e.target === selezionato) ? 'arco--evidenza' : '',
      })),
    [edges, selezionato],
  )

  return (
    <ReactFlow
      nodes={conSelezione}
      edges={archi}
      nodeTypes={nodeTypes}
      onNodeClick={(_, n) => onSeleziona(n.id)}
      onPaneClick={() => onSeleziona(null)}
      nodesDraggable={false}
      nodesConnectable={false}
      minZoom={0.2}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="#B9C2CF" />
      <Controls showInteractive={false} position="bottom-right" />
    </ReactFlow>
  )
}

function Elenco({
  proc,
  risposte,
  colori,
  onSeleziona,
}: {
  proc: Procedura
  risposte: Risposte
  colori: Map<string, string>
  onSeleziona: (id: string) => void
}) {
  const { ordinati, livello } = ordina(proc, risposte)
  const enti = new Map(proc.enti.map((e) => [e.id, e]))
  const fasi = new Map<number, Passaggio[]>()
  ordinati.forEach((p) => fasi.set(livello.get(p.id)!, [...(fasi.get(livello.get(p.id)!) ?? []), p]))
  return (
    <div className="elenco">
      {[...fasi.entries()].map(([f, ps]) => (
        <section key={f} className="fase">
          <h3 className="fase__titolo">
            <span className="fase__num">{f + 1}</span>
            {f === 0 ? 'Puoi cominciare subito' : 'Quando hai completato i passaggi precedenti'}
          </h3>
          <ul>
            {ps.map((p) => {
              const st = applicabilita(p, risposte)
              const sv = p.stato_verifica ?? 'bozza'
              return (
                <li key={p.id}>
                  <button className={`riga riga--${st}`} onClick={() => onSeleziona(p.id)}>
                    <span className="riga__bollo" style={{ background: colori.get(p.ente) }} />
                    <span className="riga__testo">
                      <strong>{p.titolo}</strong>
                      <span>
                        {enti.get(p.ente)?.nome}
                        {st === 'possibile' && ', dipende dalle tue risposte'}
                      </span>
                    </span>
                    <span className={`timbro timbro--${sv}`}>{STATO[sv].breve}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Dettaglio({ p, proc, colore, onChiudi }: { p: Passaggio; proc: Procedura; colore: string; onChiudi: () => void }) {
  const ente = proc.enti.find((e) => e.id === p.ente)
  const nomi = new Map(proc.passaggi.map((x) => [x.id, x.titolo]))
  const domande = new Map((proc.domande ?? []).map((d) => [d.id, d.testo]))
  const sv = p.stato_verifica ?? 'bozza'
  const euro = (n?: number) => (n === undefined ? null : n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' }))
  return (
    <aside className="dettaglio" style={{ ['--ente' as string]: colore }} aria-label="Dettaglio del passaggio">
      <button className="dettaglio__chiudi" onClick={onChiudi} aria-label="Chiudi">
        ×
      </button>
      <div className="dettaglio__ente">
        {ente?.sito ? (
          <a href={ente.sito} target="_blank" rel="noreferrer">
            {ente.nome}
          </a>
        ) : (
          ente?.nome
        )}
      </div>
      <h2>{p.titolo}</h2>
      <p className={`timbro timbro--${sv} timbro--grande`}>{STATO[sv].label}</p>

      <dl className="scheda">
        <dt>Chi agisce</dt>
        <dd>{ATTORE[p.attore ?? 'richiedente']}</dd>
        {p.canale && (
          <>
            <dt>Canale</dt>
            <dd>{p.canale}</dd>
          </>
        )}
        <dt>Tempi previsti</dt>
        <dd>
          {p.tempi?.previsto_giorni !== undefined
            ? p.tempi.previsto_giorni === 0
              ? 'Effetto immediato'
              : `${p.tempi.previsto_giorni} giorni`
            : 'Non ancora noti'}
        </dd>
        <dt>Tempi reali</dt>
        <dd>
          {p.tempi?.reale_giorni !== undefined
            ? `${p.tempi.reale_giorni} giorni (${p.tempi.reale_segnalazioni ?? 0} segnalazioni)`
            : 'Nessuna segnalazione ancora'}
        </dd>
      </dl>

      {p.condizioni && p.condizioni.length > 0 && (
        <section>
          <h4>Si applica se</h4>
          <ul>
            {p.condizioni.map((c) => (
              <li key={c.domanda}>
                {domande.get(c.domanda)} <strong>{c.valore === true ? 'Sì' : c.valore === false ? 'No' : String(c.valore)}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}
      {p.dipende_da && p.dipende_da.length > 0 && (
        <section>
          <h4>Prima devi</h4>
          <ul>
            {p.dipende_da.map((d) => (
              <li key={d}>{nomi.get(d)}</li>
            ))}
          </ul>
        </section>
      )}
      {p.documenti_richiesti && p.documenti_richiesti.length > 0 && (
        <section>
          <h4>Documenti da presentare</h4>
          <ul>
            {p.documenti_richiesti.map((d) => (
              <li key={d.id}>{d.nome}</li>
            ))}
          </ul>
        </section>
      )}
      {p.documenti_prodotti && p.documenti_prodotti.length > 0 && (
        <section>
          <h4>Cosa ottieni</h4>
          <ul>
            {p.documenti_prodotti.map((d) => (
              <li key={d.id}>{d.nome}</li>
            ))}
          </ul>
        </section>
      )}
      {p.costi && p.costi.length > 0 && (
        <section>
          <h4>Costi</h4>
          <ul>
            {p.costi.map((c) => (
              <li key={c.voce}>
                {c.voce}
                {c.min_euro !== undefined ? `: ${euro(c.min_euro)}${c.max_euro !== undefined && c.max_euro !== c.min_euro ? ` – ${euro(c.max_euro)}` : ''}` : ' (importo da verificare)'}
              </li>
            ))}
          </ul>
        </section>
      )}
      {p.note && (
        <section>
          <h4>Note</h4>
          <p>{p.note}</p>
        </section>
      )}
      <section>
        <h4>Fonti</h4>
        <ul className="fonti">
          {p.fonti.map((f, i) => (
            <li key={i}>
              {f.url ? (
                <a href={f.url} target="_blank" rel="noreferrer">
                  {f.titolo}
                </a>
              ) : (
                f.titolo
              )}
              {f.riferimento && <span>, {f.riferimento}</span>}
              <small>Verificata il {new Date(f.verificata_il).toLocaleDateString('it-IT')}</small>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}

function Scelta({ valore, onChange }: { valore: unknown; onChange: (v: unknown) => void }) {
  const opzioni: [string, unknown][] = [
    ['Sì', true],
    ['No', false],
    ['Non so', undefined],
  ]
  return (
    <div className="scelta" role="radiogroup">
      {opzioni.map(([l, v]) => (
        <button key={l} role="radio" aria-checked={valore === v} className={valore === v ? 'on' : ''} onClick={() => onChange(v)}>
          {l}
        </button>
      ))}
    </div>
  )
}

export default function App() {
  const [procId, setProcId] = useState(procedure[0]?.id)
  const proc = procedure.find((p) => p.id === procId)!
  const [risposte, setRisposte] = useState<Risposte>({})
  const [vista, setVista] = useState<'mappa' | 'elenco'>('mappa')
  const [selezionato, setSelezionato] = useState<string | null>(null)

  const colori = useMemo(() => new Map(proc.enti.map((e, i) => [e.id, COLORI_ENTE[i % COLORI_ENTE.length]])), [proc])
  const stati = proc.passaggi.map((p) => applicabilita(p, risposte))
  const attivi = proc.passaggi.filter((_, i) => stati[i] === 'attivo')
  const possibili = stati.filter((s) => s === 'possibile').length
  const entiCoinvolti = new Set(proc.passaggi.filter((_, i) => stati[i] !== 'escluso').map((p) => p.ente))
  const daVerificare = proc.passaggi.filter((p, i) => stati[i] !== 'escluso' && (p.stato_verifica ?? 'bozza') === 'bozza').length
  const conProfessionista = proc.passaggi.filter((p, i) => stati[i] !== 'escluso' && p.attore === 'professionista').length
  const passaggio = proc.passaggi.find((p) => p.id === selezionato)

  if (!proc) return <p className="vuoto">Nessuna procedura trovata in data/procedure.</p>

  return (
    <div className="app">
      <header className="testata">
        <div className="marchio">
          <span className="marchio__segno" aria-hidden />
          Iter
        </div>
        {procedure.length > 1 ? (
          <select value={procId} onChange={(e) => (setProcId(e.target.value), setRisposte({}), setSelezionato(null))}>
            {procedure.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titolo}
              </option>
            ))}
          </select>
        ) : null}
        <div className="testata__territorio">
          <span>{proc.territorio.nome}</span>
          <span>Versione {proc.versione}</span>
          <span>Verificata il {new Date(proc.ultima_verifica).toLocaleDateString('it-IT')}</span>
        </div>
      </header>

      <aside className="pannello">
        <h1>{proc.titolo}</h1>
        {proc.descrizione && <p className="pannello__desc">{proc.descrizione}</p>}

        <h2>Il tuo caso</h2>
        <p className="pannello__aiuto">Rispondi e la mappa mostra solo i passaggi che ti riguardano.</p>
        <ol className="domande">
          {(proc.domande ?? []).map((d) => (
            <li key={d.id}>
              <p>{d.testo}</p>
              <Scelta valore={risposte[d.id]} onChange={(v) => setRisposte((r) => ({ ...r, [d.id]: v }))} />
            </li>
          ))}
        </ol>

        <div className="riepilogo">
          <div>
            <b>{attivi.length}</b>
            <span>passaggi certi{possibili > 0 && `, più ${possibili} da chiarire`}</span>
          </div>
          <div>
            <b>{entiCoinvolti.size}</b>
            <span>soggetti coinvolti</span>
          </div>
          <div>
            <b>{conProfessionista}</b>
            <span>passaggi in cui serve un professionista</span>
          </div>
          <div>
            <b>{daVerificare}</b>
            <span>passaggi ancora in bozza</span>
          </div>
        </div>
        <p className="avviso">Strumento informativo: non sostituisce il SUAP né un professionista.</p>
      </aside>

      <main className="area">
        <div className="schede" role="tablist">
          <button role="tab" aria-selected={vista === 'mappa'} onClick={() => setVista('mappa')}>
            Mappa
          </button>
          <button role="tab" aria-selected={vista === 'elenco'} onClick={() => setVista('elenco')}>
            Elenco in ordine
          </button>
        </div>
        {vista === 'mappa' ? (
          <ReactFlowProvider>
            <Mappa proc={proc} risposte={risposte} colori={colori} selezionato={selezionato} onSeleziona={setSelezionato} />
          </ReactFlowProvider>
        ) : (
          <Elenco proc={proc} risposte={risposte} colori={colori} onSeleziona={setSelezionato} />
        )}
        {vista === 'mappa' && <ul className="legenda" aria-label="Enti">
          {proc.enti
            .filter((e) => entiCoinvolti.has(e.id))
            .map((e) => (
              <li key={e.id}>
                <span style={{ background: colori.get(e.id) }} />
                {e.nome}
              </li>
            ))}
        </ul>}
        {passaggio && (
          <Dettaglio p={passaggio} proc={proc} colore={colori.get(passaggio.ente)!} onChiudi={() => setSelezionato(null)} />
        )}
      </main>
    </div>
  )
}
