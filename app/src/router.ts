import { useEffect, useState } from 'react'

export type Rotta =
  | { pagina: 'procedure'; territorio: string }
  | { pagina: 'procedura'; id: string }
  | { pagina: 'enti' }
  | { pagina: 'ente'; id: string }

function leggi(): Rotta {
  const parti = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('/').filter(Boolean)
  switch (parti[0]) {
    case 'procedura':
      return { pagina: 'procedura', id: parti.slice(1).join('/') }
    case 'enti':
      return parti[1] ? { pagina: 'ente', id: parti.slice(1).join('/') } : { pagina: 'enti' }
    case 'territorio':
      return { pagina: 'procedure', territorio: parti.slice(1).join('/') || 'it' }
    default:
      return { pagina: 'procedure', territorio: 'it' }
  }
}

export const link = {
  territorio: (p: string) => `#/territorio/${p}`,
  procedura: (id: string) => `#/procedura/${id}`,
  enti: () => '#/enti',
  ente: (id: string) => `#/enti/${id}`,
}

export function useRotta() {
  const [r, setR] = useState(leggi)
  useEffect(() => {
    const on = () => {
      setR(leggi())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return r
}
