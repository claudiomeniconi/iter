import { useRotta } from './router'
import Catalogo from './pages/Catalogo'
import PaginaProcedura from './pages/Procedura'
import { ElencoEnti, SchedaEnte } from './pages/Enti'

export default function App() {
  const r = useRotta()
  const sezione = r.pagina === 'enti' || r.pagina === 'ente' ? 'enti' : 'procedure'
  return (
    <div className={`app app--${r.pagina}`}>
      <header className="testata">
        <a className="marchio" href="#/">
          <span className="marchio__segno" aria-hidden />
          Iter
        </a>
        <nav className="testata__nav" aria-label="Sezioni">
          <a href="#/" aria-current={sezione === 'procedure' ? 'page' : undefined}>
            Procedure
          </a>
          <a href="#/enti" aria-current={sezione === 'enti' ? 'page' : undefined}>
            Enti
          </a>
        </nav>
      </header>
      {r.pagina === 'procedure' && <Catalogo percorso={r.territorio} />}
      {r.pagina === 'procedura' && <PaginaProcedura id={r.id} />}
      {r.pagina === 'enti' && <ElencoEnti />}
      {r.pagina === 'ente' && <SchedaEnte id={r.id} />}
    </div>
  )
}
