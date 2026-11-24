import { useRotta } from './router'
import Catalogo from './pages/Catalogo'
import PaginaProcedura from './pages/Procedura'
import { ElencoEnti, SchedaEnte } from './pages/Enti'
import Home from './pages/Home'
import Risultati from './pages/Risultati'
import { Ricerca } from './components/Ricerca'

export default function App() {
  const r = useRotta()
  const sezione = r.pagina === 'enti' || r.pagina === 'ente' ? 'enti' : r.pagina === 'home' ? 'home' : 'procedure'
  return (
    <div className={`app app--${r.pagina}`}>
      <header className="testata">
        <a className="marchio" href="#/" aria-label="Iter, pagina iniziale">
          <span className="marchio__segno" aria-hidden />
          Iter
        </a>
        {r.pagina !== 'home' && (
          <div className="testata__ricerca">
            <Ricerca iniziale={r.pagina === 'cerca' ? r.q : ''} />
          </div>
        )}
        <nav className="testata__nav" aria-label="Sezioni">
          <a href="#/procedure" aria-current={sezione === 'procedure' ? 'page' : undefined}>
            Procedure
          </a>
          <a href="#/enti" aria-current={sezione === 'enti' ? 'page' : undefined}>
            Enti
          </a>
        </nav>
      </header>
      {r.pagina === 'home' && <Home />}
      {r.pagina === 'cerca' && <Risultati key={r.q + (r.categoria ?? '')} q={r.q} categoria={r.categoria} />}
      {r.pagina === 'procedure' && <Catalogo percorso={r.territorio} />}
      {r.pagina === 'procedura' && <PaginaProcedura id={r.id} />}
      {r.pagina === 'enti' && <ElencoEnti />}
      {r.pagina === 'ente' && <SchedaEnte id={r.id} />}
    </div>
  )
}
