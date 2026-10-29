// Code-drawn SVG scenes (no copyrighted images)

const svg = (ic, etiket, vb = "0 0 320 180") => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${etiket}">${ic}</svg>`;

/** Locker room at 4 p.m.: Defne's bag, empty shoe shelf, gym door with light */
export const SOYUNMA_ODASI = svg(`
  <rect width="320" height="180" fill="#cfd8e0"/><rect y="150" width="320" height="30" fill="#8f9aa6"/>
  ${["A", "D", "E", "M"].map((h, i) => {
    const x = 14 + i * 38;
    return `<rect x="${x}" y="40" width="34" height="110" fill="${h === "D" ? "#4f7fb0" : "#6c8fb3"}" stroke="#3d5f82"/>
      <rect x="${x + 5}" y="50" width="24" height="4" fill="#3d5f82"/><rect x="${x + 5}" y="58" width="24" height="4" fill="#3d5f82"/><circle cx="${x + 28}" cy="96" r="2.5" fill="#e8edf5"/>
      <text x="${x + 17}" y="82" font-size="11" fill="#e8edf5" text-anchor="middle" font-family="Segoe UI, sans-serif" font-weight="700">${h}</text>`;
  }).join("")}
  <path d="M48 162 v-28 h30 v28z" fill="#c9433a"/><path d="M54 134 a9 9 0 0 1 18 0" fill="none" stroke="#7a2a24" stroke-width="3"/>
  <text x="63" y="152" font-size="8.5" fill="#fff" text-anchor="middle" font-family="Segoe UI, sans-serif">Defne</text>
  <rect x="172" y="128" width="40" height="6" fill="#6a6a6a"/><rect x="172" y="146" width="40" height="6" fill="#6a6a6a"/><rect x="172" y="128" width="4" height="24" fill="#6a6a6a"/><rect x="208" y="128" width="4" height="24" fill="#6a6a6a"/>
  <text x="192" y="116" font-size="8.5" fill="#2a2a2a" text-anchor="middle" font-family="Segoe UI, sans-serif">shoe shelf:</text>
  <text x="192" y="125" font-size="8.5" fill="#2a2a2a" text-anchor="middle" font-family="Segoe UI, sans-serif">empty</text>
  <rect x="228" y="60" width="70" height="90" fill="#5a4a3a"/><rect x="234" y="66" width="58" height="34" fill="#ffe7a0"/>
  <path d="M234 66 L292 100" stroke="#fff3c8" stroke-width="2" opacity=".6"/><circle cx="272" cy="88" r="7" fill="#f4f4f4" stroke="#333"/>
  <text x="263" y="54" font-size="11" fill="#2a2a2a" text-anchor="middle" font-family="Segoe UI, sans-serif" font-weight="700">GYM</text>
  <text x="306" y="26" font-size="12" fill="#2a2a2a" text-anchor="end" font-family="Consolas, monospace">16:00</text>`, "A locker room with a red school bag, an empty shoe shelf and a lit gym door");

/** Bunting for the national days step */
export const BAYRAKLAR = svg(`
  <path d="M0 8 Q400 52 800 8" fill="none" stroke="#c9d4e4" stroke-width="1.5"/>
  ${Array.from({ length: 30 }, (_, i) => {
    const x = 8 + i * 26.4, t = (x + 9) / 800, y = 8 + 2 * t * (1 - t) * 44;
    return `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l18 0 l-9 18z" fill="${i % 2 ? "#ffffff" : "#e30a17"}"/>`;
  }).join("")}`, "Red and white bunting", "0 0 800 52");
