export type SeoConfig = {
    /** Absolute origin, no trailing slash: "https://example.com". */
    url: string;
    locales: readonly string[];
    defaultLocale: string;
    /** Locales a fluent speaker has reviewed. Only these are indexed, listed in hreflang and in sitemaps. */
    reviewedLocales: readonly string[];
    /** Site-wide launch switch. False keeps every page out of search. */
    indexable: boolean;
};
export type SitemapEntry = {
    url: string;
    lastModified?: string | Date;
    alternates?: {
        languages: Record<string, string>;
    };
};
/** Whether pages in this locale may be indexed. */
export declare const isIndexable: (c: SeoConfig, lang: string) => boolean;
/** Locales that get a sitemap: reviewed ones, and none before launch. */
export declare const sitemapLocales: (c: SeoConfig) => string[];
/** Self-referencing canonical plus hreflang, as root-relative URLs. */
export declare const alternates: (c: SeoConfig, lang: string, path: string) => {
    canonical: string;
    languages: Record<string, string> | undefined;
};
/** Robots meta for a page: noindex unless the site is live and this locale is reviewed. */
export declare const robotsMeta: (c: SeoConfig, lang: string) => {
    index: boolean;
    follow: boolean;
} | undefined;
/**
 * robots.txt rules. A single "*" group: it already admits Googlebot, Bingbot, OAI-SearchBot,
 * PerplexityBot and Claude-SearchBot, and a named group would silently drop the shared disallows for that bot.
 */
export declare function robotsTxt(c: SeoConfig, disallow: string[]): {
    rules: {
        userAgent: string;
        disallow: string;
        allow?: undefined;
    };
    sitemap?: undefined;
} | {
    rules: {
        userAgent: string;
        allow: string;
        disallow: string[];
    };
    sitemap: string[];
};
/** Sitemap entries for one locale. `paths` exist in every reviewed locale; `ownPaths` only in this one (e.g. English-only articles). */
export declare function sitemapEntries(c: SeoConfig, lang: string, paths: {
    path: string;
    lastModified?: string | Date;
}[], ownPaths?: {
    path: string;
    lastModified?: string | Date;
}[]): SitemapEntry[];
type Node = Record<string, unknown>;
/** The site's one business entity. Other nodes point at it with { "@id": brandId(c) }. */
export declare const brandId: (c: SeoConfig) => string;
export declare const organization: (c: SeoConfig, o: {
    name: string;
    sameAs?: string[];
    logo?: string;
}) => Node;
/** The last item is the current page and carries no URL. */
export declare const breadcrumbs: (items: {
    name: string;
    url?: string;
}[]) => Node;
/** Serialise nodes for a <script type="application/ld+json">. "<" is escaped so content can never close the script tag. */
export declare const jsonLd: (...nodes: Node[]) => string;
export {};
