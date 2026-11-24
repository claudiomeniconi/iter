import { Ricerca } from '../components/Ricerca'
import { ESEMPI, SUGGERITE } from '../search'
import { procedure, nomeTerritorio } from '../data'
import { link } from '../router'

const ESIGENZE = [
  { titolo: 'Aprire o gestire un\'attività', q: 'impresa', href: link.cercaCategoria('impresa') },
  { titolo: 'Lavori in casa e immobili', q: 'edilizia', href: link.cercaCategoria('edilizia') },
  { titolo: 'Lavoro, partita IVA e società', q: 'lavoro', href: link.cercaCategoria('lavoro') },
  { titolo: 'Servizi per cittadini e famiglie', q: 'cittadino', href: link.cercaCategoria('cittadino') },
]

export default function Home() {
  const n = (c: string) => procedure.filter((p) => p.categoria === c).length
  return (
    <main className="home">
      <div className="home__centro">
        <h1 className="home__logo">
          <span className="home__segno" aria-hidden />
          Iter
        </h1>
        <p className="home__motto">Le procedure della pubblica amministrazione, passo per passo.</p>
        <Ricerca grande autoFocus />
        <p className="home__esempi">
          Prova:{' '}
          {ESEMPI.map((e, i) => (
            <span key={e}>
              <a href={link.cerca(e)}>{e}</a>
              {i < ESEMPI.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      </div>

      <section className="home__sezione">
        <h2>Le più cercate</h2>
        <ul className="home__suggerite">
          {SUGGERITE.map((p) => (
            <li key={p.id}>
              <a href={link.procedura(p.id)}>
                <strong>{p.titolo}</strong>
                <span>
                  {p.passaggi.length} passaggi, {nomeTerritorio(p.territorio.percorso)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="home__sezione">
        <h2>Per esigenza</h2>
        <ul className="home__esigenze">
          {ESIGENZE.map((e) => (
            <li key={e.q}>
              <a href={e.href}>
                <strong>{e.titolo}</strong>
                <span>{n(e.q)} procedure</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="home__tutte">
          <a href={link.territorio('it/toscana/ar/montevarchi')}>Sfoglia tutte le procedure per territorio</a>
        </p>
      </section>
    </main>
  )
}
