"use client"

import { useEffect, useState } from "react"

// In static export, dynamic route params (e.g. /projects/[id]) can't be provided by the
// router — the exported placeholder page is served for every id via .htaccess rewrite,
// so we parse the real segments from window.location.pathname.
export function useProjectPathParams(): { id: string | null; domain: string | null; ready: boolean } {
  const [params, setParams] = useState<{ id: string | null; domain: string | null; ready: boolean }>({
    id: null,
    domain: null,
    ready: false,
  })

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "/id-staging/app"
    let path = window.location.pathname
    if (path.startsWith(base)) path = path.slice(base.length)
    const m = path.match(/^\/projects\/([^/]+)(?:\/([^/?#]+))?/)
    setParams({ id: m ? m[1] : null, domain: m && m[2] ? m[2] : null, ready: true })
  }, [])

  return params
}
