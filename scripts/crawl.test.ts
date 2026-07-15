import assert from "node:assert";
import { parseCards } from "./crawl";

// A synthetic card-grid page shaped like the Codrops hub / motionsites listings:
// anchors wrapping an <img>, with lazy-load + srcset variations and some noise.
const html = `
<html><body>
  <nav><a href="/codrops/hub/">Hub</a><a href="#top">Top</a></nav>
  <main>
    <article><a href="/codrops/demos/scroll-magic/" title="Scroll Magic">
      <img data-src="/wp/scroll.jpg" alt="Scroll Magic thumb"/></a></article>
    <article><a href="https://tympanus.net/codrops/demos/liquid/">
      <img srcset="/wp/liquid-480.jpg 480w, /wp/liquid-960.jpg 960w" alt="Liquid Distortion"/></a></article>
    <article><a href="/codrops/demos/particles/"><img src="/wp/particles.jpg" alt="Particle Field"/></a></article>
    <a href="mailto:hi@example.com">email</a>
    <a href="/about">About (no image)</a>
    <article><a href="/codrops/demos/scroll-magic/" title="Scroll Magic (dupe)">
      <img data-src="/wp/scroll.jpg" alt="dupe"/></a></article>
  </main>
</body></html>`;

const cards = parseCards(html, "https://tympanus.net");

assert.strictEqual(cards.length, 3, `expected 3 unique cards, got ${cards.length}`);

const magic = cards.find((c) => c.href.includes("scroll-magic"));
assert.ok(magic, "scroll-magic card missing");
assert.strictEqual(magic!.title, "Scroll Magic", "title should prefer anchor title attr");
assert.strictEqual(magic!.thumbnail, "https://tympanus.net/wp/scroll.jpg", "data-src should resolve absolute");

const liquid = cards.find((c) => c.href.includes("liquid"));
assert.ok(liquid, "liquid card missing");
assert.strictEqual(liquid!.title, "Liquid Distortion", "title should fall back to img alt");
assert.strictEqual(
  liquid!.thumbnail,
  "https://tympanus.net/wp/liquid-480.jpg",
  "srcset first url should be picked"
);

assert.ok(!cards.some((c) => c.href.includes("mailto")), "mailto link must be skipped");
assert.ok(!cards.some((c) => c.href.endsWith("/about")), "image-less link must be skipped");

console.log("✓ parseCards: 3 unique cards, attribution + lazy/srcset/dedup all correct");
