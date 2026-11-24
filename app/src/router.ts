import { useEffect, useState } from 'react'

export type Rotta =
  | { pagina: 'home' }
  | { pagina: 'cerca'; q: string; categoria?: string }
  | { pagina: 'procedure'; territorio: string }
  | { pagina: 'procedura'; id: string }
  | { pagina: 'enti' }
  | { pagina: 'ente'; id: string }

function leggi(): Rotta {
  const [percorso, query = ''] = location.hash.replace(/^#\/?/, '').split('?')
  const parti = decodeURIComponent(percorso).split('/').filter(Boolean)
  const params = new URLSearchParams(query)
  switch (parti[0]) {
    case 'cerca':
      return { pagina: 'cerca', q: params.get('q') ?? '', categoria: params.get('categoria') ?? undefined }
    case 'procedure':
      return { pagina: 'procedure', territorio: 'it' }
    case 'procedura':
      return { pagina: 'procedura', id: parti.slice(1).join('/') }
    case 'enti':
      return parti[1] ? { pagina: 'ente', id: parti.slice(1).join('/') } : { pagina: 'enti' }
    case 'territorio':
      return { pagina: 'procedure', territorio: parti.slice(1).join('/') || 'it' }
    default:
      return { pagina: 'home' }
  }
}

export const link = {
  home: () => '#/',
  cerca: (q: string) => `#/cerca?q=${encodeURIComponent(q)}`,
  cercaCategoria: (c: string) => `#/cerca?categoria=${encodeURIComponent(c)}`,
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
