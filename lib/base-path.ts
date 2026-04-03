export function getBasePath() {
  const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

  if (configuredBasePath) {
    return configuredBasePath
  }

  if (typeof window !== "undefined" && window.location.pathname.startsWith("/foomatic-lookup-site")) {
    return "/foomatic-lookup-site"
  }

  return ""
}

export function withBasePath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${getBasePath()}${normalizedPath}`
}
