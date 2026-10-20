// Production build: dist/ = index.html + css/ + js/ + only the assets the page uses.
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const rel = (p) => path.relative(root, p).replace(/\\/g, "/");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

// 1. CSS (Tailwind v4, minified)
execSync("npx tailwindcss -i ./src/input.css -o ./dist/css/styles.css --minify", { cwd: root, stdio: "inherit" });

// 2. HTML
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
fs.writeFileSync(path.join(dist, "index.html"), html);

// 3. Files referenced by the page (images, video, fonts, scripts) + licences
const refs = new Set(
  [...html.matchAll(/(?:src|href|poster)="((?:assets|js)\/[^"#?]+)"/g)].map((m) => m[1])
);
for (const f of fs.readdirSync(path.join(root, "assets/fonts"))) refs.add(`assets/fonts/${f}`);
refs.add("js/vendor/lenis-LICENSE.txt");

let bytes = 0;
for (const ref of refs) {
  const from = path.join(root, ref);
  if (!fs.existsSync(from)) throw new Error(`Missing file referenced by index.html: ${ref}`);
  const to = path.join(dist, ref);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  bytes += fs.statSync(to).size;
}

const cssSize = fs.statSync(path.join(dist, "css/styles.css")).size;
console.log(`dist/ ready: index.html, css/styles.css (${(cssSize / 1024).toFixed(1)} KB), ${refs.size} files (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
console.log(`Output: ${rel(dist)}/`);
