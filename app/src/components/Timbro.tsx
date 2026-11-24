import type { StatoVerifica } from '../types'

export const STATO: Record<StatoVerifica, { label: string; breve: string }> = {
  bozza: { label: 'Bozza da confermare', breve: 'Bozza' },
  verificato_fonti: { label: 'Controllato sulle fonti ufficiali', breve: 'Su fonti' },
  verificato_ente: { label: "Confermato dall'ente o da un professionista", breve: 'Confermato' },
}

export function Timbro({ stato = 'bozza', esteso = false }: { stato?: StatoVerifica; esteso?: boolean }) {
  return (
    <span className={`timbro timbro--${stato} ${esteso ? 'timbro--grande' : ''}`} title={STATO[stato].label}>
      {esteso ? STATO[stato].label : STATO[stato].breve}
    </span>
  )
}

/** Barra che mostra quanta parte di una procedura è verificata. */
export function BarraVerifica({ c }: { c: Record<StatoVerifica, number> }) {
  const tot = c.bozza + c.verificato_fonti + c.verificato_ente || 1
  const pct = (n: number) => `${(n / tot) * 100}%`
  const verificati = c.verificato_fonti + c.verificato_ente
  return (
    <div className="barra" title={`${c.verificato_ente} confermati, ${c.verificato_fonti} su fonti, ${c.bozza} in bozza`}>
      <div className="barra__traccia">
        <span className="barra--ente" style={{ width: pct(c.verificato_ente) }} />
        <span className="barra--fonti" style={{ width: pct(c.verificato_fonti) }} />
      </div>
      <span className="barra__testo">
        {verificati} su {tot} passaggi verificati
      </span>
    </div>
  )
}
