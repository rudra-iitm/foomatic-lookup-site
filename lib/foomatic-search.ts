import MiniSearch from "minisearch"


export interface SearchResult {
  id: string
  type: "printer" | "driver"
  name: string
  manufacturer?: string | null
  driverType?: string | null
  status?: string | null
  description?: string | null
  score: number
  url?: string | null
}

export interface FoomaticSearchDocument {
  id: string
  type: "printer" | "driver"
  name: string
  manufacturer?: string | null
  driverType?: string | null
  status?: string | null
  description?: string | null
  url?: string | null
  recommendedDriver?: string | null
  functionality?: string | null
  printerCount?: number
}


export interface FoomaticSearchIndex {
  version: string
  generatedAt: string
  documents: FoomaticSearchDocument[]
  metadata: {
    documentCount: number
    contentTypes: string[]
  }
}

const INDEX_URL = "/search/foomatic-index.json"
const SEARCH_FIELDS = ["name", "manufacturer", "driverType", "description"] as const
const STORE_FIELDS = [
  "id",
  "type",
  "name",
  "manufacturer",
  "driverType",
  "status",
  "description",
  "url",
  "recommendedDriver",
  "functionality",
  "printerCount",
] as const

let searchInstance: MiniSearch<FoomaticSearchDocument> | null = null


export async function initSearch(): Promise<MiniSearch<FoomaticSearchDocument>> {
  const res = await fetch(INDEX_URL)
  if (!res.ok) {
    throw new Error(`Failed to load search index: ${res.status} ${res.statusText}`)
  }
  const data = (await res.json()) as FoomaticSearchIndex
  const documents = data?.documents ?? []
  if (!Array.isArray(documents)) {
    throw new Error("Invalid search index: documents is not an array")
  }

  const miniSearch = new MiniSearch<FoomaticSearchDocument>({
    fields: [...SEARCH_FIELDS],
    storeFields: [...STORE_FIELDS],
    searchOptions: {
      boost: { name: 3, manufacturer: 2 },
    },
  })
  miniSearch.addAll(documents)
  return miniSearch
}

export function search(
  instance: MiniSearch<FoomaticSearchDocument>,
  query: string,
  limit = 20
): SearchResult[] {
  const trimmed = query.trim()
  if (trimmed.length < 2) {
    return []
  }

  const raw = instance.search(trimmed, {
    fuzzy: 0.2,
    prefix: true,
  })
  const slice = raw.slice(0, limit)
  return slice.map((hit) => mapHitToSearchResult(hit))
}

function mapHitToSearchResult(
  hit: { id: string; score: number; [key: string]: unknown }
): SearchResult {
  return {
    id: String(hit.id ?? ""),
    type: hit.type === "driver" ? "driver" : "printer",
    name: String(hit.name ?? ""),
    manufacturer: hit.manufacturer != null ? String(hit.manufacturer) : null,
    driverType: hit.driverType != null ? String(hit.driverType) : null,
    status: hit.status != null ? String(hit.status) : null,
    description: hit.description != null ? String(hit.description) : null,
    score: Number(hit.score) || 0,
    url: hit.url != null ? String(hit.url) : null,
  }
}

export async function getSearchInstance(): Promise<MiniSearch<FoomaticSearchDocument>> {
  if (searchInstance !== null) {
    return searchInstance
  }
  searchInstance = await initSearch()
  return searchInstance
}
