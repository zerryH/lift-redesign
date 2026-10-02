import fs from 'node:fs';
import assert from 'node:assert/strict';

const css = fs.readFileSync('styles.css','utf8');
const htmls = [fs.readFileSync('index.html','utf8'), fs.readFileSync('lift-local.html','utf8')];

assert.match(
  css,
  /body\{[^}]*display:grid[^}]*grid-template-rows:minmax\(0,1fr\) auto/,
  'mobile shell must keep the main scroller and bottom nav in normal layout flow'
);
assert.match(
  css,
  /#v\{[^}]*min-height:0[^}]*overflow-y:auto/,
  'main content must scroll inside its own area instead of underneath the nav'
);
assert.doesNotMatch(
  css,
  /nav\{position:fixed;bottom:0;/,
  'bottom navigation must not be viewport-fixed/floating'
);
assert.match(
  css,
  /nav\{[^}]*position:static[^}]*padding-bottom:env\(safe-area-inset-bottom\)/,
  'bottom navigation must remain in flow while consuming the iOS safe area'
);
for (const html of htmls) {
  assert.match(html, /body\{[^}]*display:grid[^}]*grid-template-rows:minmax\(0,1fr\) auto/);
  assert.match(html, /#v\{[^}]*min-height:0[^}]*overflow-y:auto/);
  assert.doesNotMatch(html, /nav\{position:fixed;bottom:0;/);
}
assert.equal(htmls[0], htmls[1], 'generated HTML variants must stay byte-identical');
console.log('ui-layout ok · nav stays in flow and content never scrolls underneath it');
