import { test } from "node:test";
import assert from "node:assert/strict";
import { alternates, breadcrumbs, isIndexable, jsonLd, organization, robotsMeta, robotsTxt, sitemapEntries, sitemapLocales, type SeoConfig } from "../src/index.ts";

const c: SeoConfig = { url: "https://ex.com", locales: ["en", "de", "ar"], defaultLocale: "en", reviewedLocales: ["en"], indexable: true };
const two: SeoConfig = { ...c, reviewedLocales: ["en", "de"] };

test("only reviewed locales are indexable, and nothing before launch", () => {
  assert.equal(isIndexable(c, "en"), true);
  assert.equal(isIndexable(c, "de"), false);
  assert.equal(isIndexable({ ...c, indexable: false }, "en"), false);
  assert.deepEqual(robotsMeta(c, "de"), { index: false, follow: false });
  assert.equal(robotsMeta(c, "en"), undefined);
});

test("hreflang lists reviewed locales only, from the second one on", () => {
  assert.deepEqual(alternates(c, "de", "/tours/x"), { canonical: "/de/tours/x", languages: undefined });
  assert.deepEqual(alternates(two, "de", "/tours/x"), {
    canonical: "/de/tours/x",
    languages: { en: "/en/tours/x", de: "/de/tours/x", "x-default": "/en/tours/x" },
  });
});

test("sitemaps: one per reviewed locale, none before launch, unreviewed locale empty", () => {
  assert.deepEqual(sitemapLocales(two), ["en", "de"]);
  assert.deepEqual(sitemapLocales({ ...two, indexable: false }), []);
  assert.deepEqual(sitemapEntries(c, "ar", [{ path: "" }]), []);
  const [home, post] = sitemapEntries(two, "de", [{ path: "" }], [{ path: "/journal/a", lastModified: "2026-11-01" }]);
  assert.equal(home.url, "https://ex.com/de");
  assert.equal(home.alternates?.languages["x-default"], "https://ex.com/en");
  assert.deepEqual(post, { url: "https://ex.com/de/journal/a", lastModified: "2026-11-01" });
});

test("robots.txt blocks everything before launch and lists sitemaps after", () => {
  assert.deepEqual(robotsTxt({ ...c, indexable: false }, ["/admin"]), { rules: { userAgent: "*", disallow: "/" } });
  assert.deepEqual(robotsTxt(two, ["/admin"]).sitemap, ["https://ex.com/sitemap/en.xml", "https://ex.com/sitemap/de.xml"]);
});

test("JSON-LD cannot break out of its script tag", () => {
  const out = jsonLd(breadcrumbs([{ name: "</script><script>alert(1)</script>" }]));
  assert.ok(!out.includes("<"));
  assert.equal(JSON.parse(out).itemListElement[0].name, "</script><script>alert(1)</script>");
});

test("graph output and the brand entity", () => {
  const g = JSON.parse(jsonLd(organization(c, { name: "Ex" }), breadcrumbs([{ name: "Home", url: "https://ex.com/en" }, { name: "Here" }])));
  assert.equal(g["@graph"][0]["@id"], "https://ex.com/#brand");
  assert.equal(g["@graph"][0].sameAs, undefined);
  assert.equal(g["@graph"][1].itemListElement[1].item, undefined);
});
