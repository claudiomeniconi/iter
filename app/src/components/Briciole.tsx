import { territori } from '../data'
import { link } from '../router'

/** Percorso territoriale cliccabile: Italia, Toscana, Arezzo, Montevarchi */
export function Briciole({ percorso, finale }: { percorso: string; finale?: string }) {
  const t = territori.get(percorso)
  const catena = t ? [...t.padri, t] : []
  return (
    <nav className="briciole" aria-label="Territorio">
      <ol>
        {catena.map((n) => (
          <li key={n.percorso}>
            <a href={link.territorio(n.percorso)}>{n.nome}</a>
          </li>
        ))}
        {finale && <li aria-current="page">{finale}</li>}
      </ol>
    </nav>
  )
}
