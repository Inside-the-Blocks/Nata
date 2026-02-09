# CoinDesk RSS Feed Schema (Arc Outbound Feeds)

This README documents the **observable XML schema** used by CoinDesk’s RSS feed, which is served via **Arc XP Outbound Feeds**.

> CoinDesk publicly points to this RSS endpoint as their feed entry point. :contentReference[oaicite:0]{index=0}  
> The feed is produced by Arc Publishing / Arc XP “Outbound Feeds” standard RSS templates. :contentReference[oaicite:1]{index=1}  
> Field examples below are taken from a captured parse of CoinDesk’s RSS XML (feedparser output + headers). :contentReference[oaicite:2]{index=2}

---

## Feed URLs

CoinDesk’s RSS “base” link (as advertised):

- `https://www.coindesk.com/arc/outboundfeeds/rss/` :contentReference[oaicite:3]{index=3}

Commonly used “explicit XML output” form:

- `https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml` :contentReference[oaicite:4]{index=4}

Notes:
- The `outputType=xml` query parameter is part of Arc Outbound Feeds conventions. :contentReference[oaicite:5]{index=5}

---

## Document shape

Top-level structure is standard RSS 2.0:

- Root: `/rss`
- Channel: `/rss/channel`
- Items: `/rss/channel/item` (0..N)

Arc’s standard RSS template supports typical channel fields such as title, description, language, ttl, and syndication hints. :contentReference[oaicite:6]{index=6}

---

## Namespaces you should expect

CoinDesk’s feed is RSS 2.0, but may include extra modules via XML namespaces (exact set can vary by publisher config). Most common in Arc/News feeds:

- `atom` → `http://www.w3.org/2005/Atom` (self link)
- `sy` → `http://purl.org/rss/1.0/modules/syndication/` (update period/frequency)
- `content` → `http://purl.org/rss/1.0/modules/content/` (full HTML content)
- `dc` → `http://purl.org/dc/elements/1.1/` (creator/author)
- `media` → `http://search.yahoo.com/mrss/` (images/video)

The captured CoinDesk parse shows `sy:*` fields and an image block, and reports “Arc Publishing” as generator. :contentReference[oaicite:7]{index=7}

---

## Channel fields

All fields below are under: `/rss/channel/*`

### Required / always present (observed)
| XML element | Type | Meaning | Example (observed) |
|---|---:|---|---|
| `title` | string | Feed title | `CoinDesk` :contentReference[oaicite:8]{index=8} |
| `link` | URL | Homepage link | `https://www.coindesk.com` :contentReference[oaicite:9]{index=9} |
| `description` | string/HTML | Feed description | `Latest headlines from Coindesk.` :contentReference[oaicite:10]{index=10} |
| `language` | string | Locale/language code | `en-US` :contentReference[oaicite:11]{index=11} |
| `lastBuildDate` | RFC-822 date | Last time the feed was generated | present as `updated` in parse output (maps from RSS build date) :contentReference[oaicite:12]{index=12} |
| `ttl` | integer (minutes) | Suggested cache/poll interval | `5` :contentReference[oaicite:13]{index=13} |

### Common Arc/Publisher extras (observed)
| XML element | Type | Meaning | Example (observed) |
|---|---:|---|---|
| `generator` | string | Generator name | `Arc Publishing` :contentReference[oaicite:14]{index=14} |
| `sy:updatePeriod` | string | Syndication period | `hourly` :contentReference[oaicite:15]{index=15} |
| `sy:updateFrequency` | integer | Frequency within the period | `12` :contentReference[oaicite:16]{index=16} |
| `image/url` | URL | Feed logo | `.../coindesk-feed-logo.png` :contentReference[oaicite:17]{index=17} |
| `image/title` | string | Logo title | `CoinDesk: Bitcoin, Ethereum, Crypto News and Price Data` :contentReference[oaicite:18]{index=18} |
| `image/link` | URL | Link associated with logo | `https://www.coindesk.com` :contentReference[oaicite:19]{index=19} |
| `atom:link[@rel="self"]` | URL | Canonical feed URL | `https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml` :contentReference[oaicite:20]{index=20} |

### Optional / may appear
These depend on publisher configuration:
- `managingEditor`, `webMaster`
- `category` (channel categories)
- `copyright` / `rights`

A rights/copyright value is shown in the captured parse output. :contentReference[oaicite:21]{index=21}

---

## Item fields

All fields below are under: `/rss/channel/item[*]/*`

### Required / always present (expected + typical)
| XML element | Type | Meaning |
|---|---:|---|
| `title` | string | Headline/title |
| `link` | URL | Canonical article URL |
| `description` | string/HTML | Teaser/summary (often HTML) |
| `pubDate` | RFC-822 date | Publication time |

Arc’s standard RSS template typically uses a publication/display date for `pubDate`. :contentReference[oaicite:22]{index=22}

### Strongly common (often present)
| XML element | Type | Meaning |
|---|---:|---|
| `guid` | string/URL | Stable unique ID (sometimes the URL; sometimes internal ID) |
| `category` | string | Tag/section/category label (0..N) |

### Content + author (often present in news feeds)
| XML element | Type | Meaning |
|---|---:|---|
| `content:encoded` | string/HTML | Full article body as HTML (if enabled) |
| `dc:creator` | string | Author/byline (if enabled) |

### Media (images)
| XML element | Type | Meaning |
|---|---:|---|
| `media:content[@url]` | URL | Primary image URL |
| `media:content[@type]` | MIME | Image MIME type, e.g. `image/jpeg` |
| `media:thumbnail[@url]` | URL | Thumbnail image URL |

It’s common for RSS parsers to expose these media fields via a `media_content` structure when present. :contentReference[oaicite:23]{index=23}

---

## Date formats

RSS 2.0 dates are typically RFC-822 / RFC-1123 style, e.g.:

- `Tue, 12 Apr 2022 05:45:46 +0000` :contentReference[oaicite:24]{index=24}

Treat all date parsing as “best effort” and normalize to UTC in your pipeline.

---

## HTTP behavior you should build for

CoinDesk’s endpoint is rate-limited in practice (you’ve seen 429). Implement:

- Conditional requests: `IfSS/ETag` + `If-None-Match`, `Last-Modified` + `If-Modified-Since`
- Backoff on 429 and respect `Retry-After` if present
- Cache the last good XML and avoid frequent polling

A captured response shows `ETag` and `Last-Modified` headers are provided, which makes conditional fetching practical. :contentReference[oaicite:25]{index=25}

---

## Minimal “must parse” contract

For each item, store at least:

- `title`
- `link`
- `pubDate`
- `description` (or fallback to `content:encoded` if description is empty)

Optionally enrich with:

- `dc:creator`
- `category[]`
- `media:content/@url`

---

## Practical XPath cheatsheet

- Channel title: `/rss/channel/title`
- Channel description: `/rss/channel/description`
- Channel ttl: `/rss/channel/ttl`
- Channel self link: `/rss/channel/atom:link[@rel="self"]/@href`

For each item:
- Title: `/rss/channel/item/title`
- Link: `/rss/channel/item/link`
- Pub date: `/rss/channel/item/pubDate`
- Guid: `/rss/channel/item/guid`
- Teaser: `/rss/channel/item/description`
- Full HTML: `/rss/channel/item/content:encoded`
- Author: `/rss/channel/item/dc:creator`
- Image: `/rss/channel/item/media:content/@url`

---

## Source references

- CoinDesk’s RSS announcement (base URL): https://www.coindesk.com/coindesk-news/2021/09/17/coindesk-rss/ :contentReference[oaicite:26]{index=26}
- Arc XP Outbound Feeds standard RSS documentation: https://dev.arcxp.com/arc-io/developer-docs/setting-up-standard-rss-with-outbound-feeds/ :contentReference[oaicite:27]{index=27}
- Captured parse output showing channel fields, headers, and generator: (feedparser capture) :contentReference[oaicite:28]{index=28}
