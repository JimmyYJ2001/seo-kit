// Shared SEO kit: the rules every site follows, as plain functions with no framework or dependencies.
// Spec: "SEO System: Research and Build Spec", sections 1, 2 and 11.
const reviewed = (c) => c.locales.filter((l) => c.reviewedLocales.includes(l));
/** Whether pages in this locale may be indexed. */
export const isIndexable = (c, lang) => c.indexable && c.reviewedLocales.includes(lang);
/** Locales that get a sitemap: reviewed ones, and none before launch. */
export const sitemapLocales = (c) => (c.indexable ? reviewed(c) : []);
/** hreflang map for a path that exists in every locale ("" is the home page). Undefined until two locales are reviewed. */
function languages(c, path, origin = "") {
    const live = reviewed(c);
    if (live.length < 2)
        return undefined;
    const map = Object.fromEntries(live.map((l) => [l, `${origin}/${l}${path}`]));
    if (live.includes(c.defaultLocale))
        map["x-default"] = `${origin}/${c.defaultLocale}${path}`;
    return map;
}
/** Self-referencing canonical plus hreflang, as root-relative URLs. */
export const alternates = (c, lang, path) => ({
    canonical: `/${lang}${path}`,
    languages: languages(c, path),
});
/** Robots meta for a page: noindex unless the site is live and this locale is reviewed. */
export const robotsMeta = (c, lang) => (isIndexable(c, lang) ? undefined : { index: false, follow: false });
/**
 * robots.txt rules. A single "*" group: it already admits Googlebot, Bingbot, OAI-SearchBot,
 * PerplexityBot and Claude-SearchBot, and a named group would silently drop the shared disallows for that bot.
 */
export function robotsTxt(c, disallow) {
    if (!c.indexable)
        return { rules: { userAgent: "*", disallow: "/" } };
    return {
        rules: { userAgent: "*", allow: "/", disallow },
        sitemap: sitemapLocales(c).map((l) => `${c.url}/sitemap/${l}.xml`),
    };
}
/** Sitemap entries for one locale. `paths` exist in every reviewed locale; `ownPaths` only in this one (e.g. English-only articles). */
export function sitemapEntries(c, lang, paths, ownPaths = []) {
    if (!isIndexable(c, lang))
        return [];
    const entry = (p, shared) => {
        const langs = shared ? languages(c, p.path, c.url) : undefined;
        return {
            url: `${c.url}/${lang}${p.path}`,
            ...(p.lastModified && { lastModified: p.lastModified }),
            ...(langs && { alternates: { languages: langs } }),
        };
    };
    return [...paths.map((p) => entry(p, true)), ...ownPaths.map((p) => entry(p, false))];
}
/** The site's one business entity. Other nodes point at it with { "@id": brandId(c) }. */
export const brandId = (c) => `${c.url}/#brand`;
export const organization = (c, o) => ({
    "@type": "Organization",
    "@id": brandId(c),
    name: o.name,
    url: c.url,
    ...(o.logo && { logo: o.logo }),
    ...(o.sameAs?.length && { sameAs: o.sameAs }),
});
/** The last item is the current page and carries no URL. */
export const breadcrumbs = (items) => ({
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, ...(it.url && { item: it.url }) })),
});
/** Serialise nodes for a <script type="application/ld+json">. "<" is escaped so content can never close the script tag. */
export const jsonLd = (...nodes) => JSON.stringify(nodes.length === 1 ? { "@context": "https://schema.org", ...nodes[0] } : { "@context": "https://schema.org", "@graph": nodes }).replace(/</g, "\\u003c");
