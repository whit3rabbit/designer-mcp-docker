# Async Options

Load search results, cancel stale requests, and fetch the next page.

`createAsyncOptions` loads items as someone types. It waits for typing to pause, cancels requests that are replaced, and keeps the previous results visible while loading.

```ts title="async.ts"
import { createAsyncOptions } from "@ui-sdk/core/async-options"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"

const movieTitles = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "Pulp Fiction",
  "Schindler's List",
  "The Lord of the Rings",
  "Fight Club",
  "Forrest Gump",
  "Inception",
  "The Matrix",
  "Goodfellas",
  "Interstellar",
  "Parasite",
  "Spirited Away",
  "Whiplash",
  "The Prestige",
  "The Departed",
  "Gladiator",
  "Alien",
  "Casablanca",
  "Amélie",
  "Arrival",
]

function searchMovies(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<{ value: string; label: string }[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      resolve(
        movieTitles
          .filter((title) => title.toLowerCase().includes(needle))
          .map((title) => ({
            value: title.toLowerCase().replace(/\W+/g, "-"),
            label: title,
          }))
      )
    }, 500)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox filter="false" default-query="the">
      <div data-slot="stack">
        <ui-combobox-label>Movie</ui-combobox-label>
        <div data-slot="row">
          <ui-combobox-input>
            <input placeholder="Search movies…" />
          </ui-combobox-input>
          <ui-combobox-trigger>
            <button aria-label="Show movies">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-status></ui-combobox-status>
        <ui-combobox-empty>No movies match “<span>the</span>”.</ui-combobox-empty>
        <ui-combobox-list></ui-combobox-list>
      </ui-combobox-content>
      <template>
        <ui-combobox-item>
          <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
        </ui-combobox-item>
      </template>
    </ui-combobox>
  `
  const combobox = root.querySelector("ui-combobox")!
  const status = root.querySelector("ui-combobox-status")!
  const query = root.querySelector("ui-combobox-empty span")!
  const movies = createAsyncOptions(searchMovies, {
    debounce: 300,
    query: "the",
    immediate: true,
  })
  const update = () => {
    const { items, status: loading } = movies.getState()
    combobox.items = items
    combobox.setAttribute("status", loading)
    status.textContent =
      loading === "error"
        ? "Couldn't load movies."
        : loading === "loading"
          ? "Searching…"
          : `${items.length} ${items.length === 1 ? "movie" : "movies"}`
  }
  movies.subscribe(update)
  update()
  combobox.addEventListener("querychange", (event) => {
    query.textContent = event.detail.value
    movies.setQuery(event.detail.value)
  })
}

export { mount }
```

Change the movie search and wait for the results. Use the arrow keys to choose a movie, then press Enter.

## Load Results

Write the combobox, then connect its query events to a loader. This example expects `/api/movies` to return an array of movie titles:

```html
<ui-combobox filter="false">
  <ui-combobox-input
    ><input aria-label="Movie" placeholder="Search movies…"
  /></ui-combobox-input>
  <ui-combobox-content>
    <ui-combobox-list></ui-combobox-list>
  </ui-combobox-content>
</ui-combobox>
```

```ts
import "@ui-sdk/web/combobox"
import { createAsyncOptions } from "@ui-sdk/core/async-options"
import type { UiComboboxElement } from "@ui-sdk/web"

function connectMovies(combobox: UiComboboxElement) {
  const movies = createAsyncOptions<string>(async (query, { signal }) => {
    const response = await fetch(`/api/movies?q=${encodeURIComponent(query)}`, {
      signal,
    })
    if (!response.ok) throw new Error("Couldn't load movies")
    return response.json()
  })
  function update() {
    const { items, status } = movies.getState()
    combobox.items = items
    combobox.status = status
  }
  const unsubscribe = movies.subscribe(update)
  update()
  const events = new AbortController()
  combobox.addEventListener(
    "querychange",
    (event) => movies.setQuery(event.detail.value),
    {
      signal: events.signal,
    }
  )
  combobox.addEventListener("loadmore", () => movies.loadMore(), {
    signal: events.signal,
  })

  return () => {
    events.abort()
    unsubscribe()
    movies.cancel()
  }
}

const disconnect = connectMovies(document.querySelector("ui-combobox")!)
```

Keep `disconnect` and call it when removing this view. It removes listeners, unsubscribes from state, and cancels pending work.

Pass `signal` to `fetch` so a newer search can cancel the request. `filter="false"` leaves matching and result order to the server. Set `items` and `status` as properties, as shown above.

Use the component's status and empty parts to show loading, error, and empty messages, as in the demo. The same pattern works with [Select](../components/select.md#async-search), [Autocomplete](../components/autocomplete.md#async-suggestions), and [Command](../components/command.md#async-results).

## Choose When to Load

The helper's second argument sets its starting behavior:

| Option      | What It Does                                            | Default |
| ----------- | ------------------------------------------------------- | ------- |
| `debounce`  | Milliseconds typing must pause before a request starts. | `200`   |
| `query`     | The starting search text.                               | `""`    |
| `immediate` | Loads that text before anyone types.                    | `false` |

Add `{ immediate: true, debounce: 300 }` after the loader to load initial choices. If you set `query`, use the same text for the component's `default-query`.

## Load More

For paged results, return `{ items, hasMore }`. The page number starts at `0`:

```ts
import type { AsyncOptionsContext } from "@ui-sdk/core/async-options"

async function loadMoviePages(
  query: string,
  { signal, page }: AsyncOptionsContext
) {
  const response = await fetch(
    `/api/movies?q=${encodeURIComponent(query)}&page=${page}`,
    { signal }
  )
  if (!response.ok) throw new Error("Couldn't load movies")
  const data: { titles: string[]; next: number | null } = await response.json()
  return { items: data.titles, hasMore: data.next !== null }
}

export { loadMoviePages }
```

Pass `loadMoviePages` to `createAsyncOptions` in place of the inline loader above.

The `loadmore` listener above asks for another page when scrolling or keyboard navigation reaches the last item. The helper appends the new items.

```ts title="infinite.ts"
import { createAsyncOptions } from "@ui-sdk/core/async-options"
import "@ui-sdk/web/combobox"
import { Check, ChevronDown, createElement } from "lucide"

const movieTitles = [
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "Pulp Fiction",
  "Schindler's List",
  "The Lord of the Rings",
  "Fight Club",
  "Forrest Gump",
  "Inception",
  "The Matrix",
  "Goodfellas",
  "Interstellar",
  "Parasite",
  "Spirited Away",
  "Whiplash",
  "The Prestige",
  "The Departed",
  "Gladiator",
  "Alien",
  "Casablanca",
  "Amélie",
  "Arrival",
]

function searchMoviePages(
  query: string,
  { signal, page }: { signal: AbortSignal; page: number }
) {
  return new Promise<{
    items: { value: string; label: string }[]
    hasMore: boolean
  }>((resolve, reject) => {
    const timer = setTimeout(() => {
      const needle = query.trim().toLowerCase()
      const found = movieTitles
        .filter((title) => title.toLowerCase().includes(needle))
        .map((title) => ({
          value: title.toLowerCase().replace(/\W+/g, "-"),
          label: title,
        }))
      resolve({
        items: found.slice(page * 5, page * 5 + 5),
        hasMore: found.length > page * 5 + 5,
      })
    }, 500)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

function mount(root: HTMLElement) {
  root.innerHTML = `
    <ui-combobox filter="false">
      <div data-slot="stack">
        <ui-combobox-label>Movie</ui-combobox-label>
        <div data-slot="row">
          <ui-combobox-input>
            <input placeholder="Search movies…" />
          </ui-combobox-input>
          <ui-combobox-trigger>
            <button aria-label="Show movies">${createElement(ChevronDown, { "aria-hidden": "true" }).outerHTML}</button>
          </ui-combobox-trigger>
        </div>
      </div>
      <ui-combobox-content hidden>
        <ui-combobox-empty>No movies found.</ui-combobox-empty>
        <ui-combobox-list></ui-combobox-list>
        <ui-combobox-status></ui-combobox-status>
      </ui-combobox-content>
      <template>
        <ui-combobox-item>
          <ui-combobox-item-indicator>${createElement(Check, { "aria-hidden": "true" }).outerHTML}</ui-combobox-item-indicator>
        </ui-combobox-item>
      </template>
    </ui-combobox>
  `
  const combobox = root.querySelector("ui-combobox")!
  const status = root.querySelector("ui-combobox-status")!
  const movies = createAsyncOptions(searchMoviePages, { immediate: true })
  const update = () => {
    const { items, status: loading, hasMore } = movies.getState()
    combobox.items = items
    combobox.setAttribute("status", loading)
    status.textContent =
      loading === "loading"
        ? "Loading more…"
        : hasMore
          ? `${items.length} loaded`
          : `All ${items.length}`
  }
  movies.subscribe(update)
  update()
  combobox.addEventListener("querychange", (event) =>
    movies.setQuery(event.detail.value)
  )
  combobox.addEventListener("loadmore", () => movies.loadMore())
}

export { mount }
```

Open the movie list and scroll down, or use Arrow Down to reach the last result. The next page is added to the list.

## Retry a Search

`movies.getState()` holds `items`, `status`, `error`, and `hasMore`. Status is `"loading"` during a request, `"error"` after a failure, and `"idle"` otherwise.

Call `movies.reload()` from a retry button to load the current query again, starting at page `0`. Previous results stay available while it loads.
