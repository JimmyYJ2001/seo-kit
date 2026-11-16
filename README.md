# seo-kit

The SEO rules every site in the SEO Hub follows, written as plain TypeScript functions with no dependencies. Each site keeps its own code and design and calls these functions. The spec is [SEO System: Research and Build Spec](https://claude.ai/artifact/Da4mm2Utg4E7U3NWEj1XyN).

## Install

```bash
npm install github:JimmyYJ2001/seo-kit#v0.1.0
```

The package ships TypeScript source. Next.js sites add `transpilePackages: ["seo-kit"]` to `next.config.ts`. A server that builds the site needs read access to this private repo, through a deploy key or a token.

## What it enforces

| Rule (spec) | Function |
|---|---|
| A language is indexed only after a fluent review | `isIndexable`, `robotsMeta` |
| Self-referencing canonical, hreflang listing reviewed languages plus x-default | `alternates` |
| One XML sitemap per language | `sitemapLocales`, `sitemapEntries` |
| robots.txt lets search and AI search bots in, and blocks everything before launch | `robotsTxt` |
| One business entity, plus breadcrumbs | `organization`, `brandId`, `breadcrumbs` |
| JSON-LD that content cannot break out of | `jsonLd` |

## Publishing contract (for the Hub, phase 3)

The Hub publishes an article by committing a Markdown file to the site's own content folder, which for The Jimmy Experience is `content/journal/<slug>.md`. The site then rebuilds. The front matter fields are whatever that site already reads, and the site does not need a new endpoint.

## Test

```bash
npm test   # Node 24, type stripping, no install needed
```
