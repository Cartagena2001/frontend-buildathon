# frontend-buildathon

The Next.js app for Findy. Renders place discovery UI; reads place detail from findy-core and search from Upstash Vector (per findy-core ADR 0001).

## Language

**Place**:
The atomic unit of the product — same meaning as in findy-core. In this app, detail views load the full Place (aggregate + mentions) from findy-core; list/search cards may show a lighter subset until opened.
_Avoid_: Spot, venue, POI

**Place Detail**:
The full Place record for a single id, fetched from findy-core via `GET /places/:id` where `:id` is the Postgres `places.id` UUID. Loaded server-side by a findy-core client (`src/lib/findy-core/`); the core base URL is never exposed to the browser. The page serves two jobs: **validate** (see why the Place is trending via its Place Mentions) and **orient** (understand where it is and how to get there). The header shows evidence-focused aggregates: mention count, aggregate sentiment, total likes, and last mention date — not rank or duplicate engagement metrics. Rendered from a dedicated `PlaceDetailData` view model, not the Explore card shape.
_Avoid_: place info, place page

**PlaceDetailData**:
The frontend view model for Place Detail — carries mention-level evidence (featured + list), orient fields (location, coordinates), and evidence aggregates. Mapped from `CorePlace` via `mapCorePlaceToDetailData()`. Explore list cards continue to use `PlaceCardData`.
_Avoid_: place detail type, detail DTO

**Place Mention**:
A single social-video occurrence attached to a Place — same as findy-core. Rendered on Place Detail as evidence: one **featured** mention expanded (summary, sentiment, stats, link to source video) and the rest in a compact list below. The featured mention is the one with a non-null `summary` and highest engagement (`likes + comments + shares + bookmarks`); if none have summaries, fall back to most engaged. Not shown as raw Apify records.
_Avoid_: video, post, clip (when meaning the domain entity)

**Search**:
Text-query lookup via Upstash Vector on the client/server; returns place ids for navigation. Does not go through findy-core.
_Avoid_: query, filter, list

**Explore**:
The discovery list + map view. Shows only Places that exist in Postgres (currently the two seeded beaches). Loads each Place from findy-core on the server (parallel `GET /places/:id` calls) and links to Place Detail by `places.id` UUID.
_Avoid_: feed, directory

**canonical_name**:
The unique human name that dedupes a Place (`canonicalName` in the API). Shown as the place title on detail.
_Avoid_: name (when meaning the dedupe key), title

**location**:
Geographic info on a Place (`location.text`, `lat`, `lng`). Never a synonym for Place itself.
_Avoid_: address (when meaning the whole Place)
