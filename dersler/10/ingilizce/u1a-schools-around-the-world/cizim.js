// Code-drawn SVG pictures (no copyrighted images)

const kap = (ic, etiket) => `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${etiket}">
  <defs><linearGradient id="g-gok" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0f5"/><stop offset="1" stop-color="#e8f6ff"/></linearGradient>
  <linearGradient id="g-aksam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3d6b"/><stop offset="1" stop-color="#7d6fa8"/></linearGradient></defs>${ic}</svg>`;

const ogrenci = (x, y, renk = "#3f6fa8", o = 1) => `<g transform="translate(${x} ${y}) scale(${o})">
  <rect x="-7" y="-30" width="14" height="22" rx="4" fill="${renk}"/><rect x="-6" y="-9" width="5" height="9" fill="#2b3e5c"/><rect x="1" y="-9" width="5" height="9" fill="#2b3e5c"/>
  <circle cx="0" cy="-36" r="7" fill="#f1c39b"/><path d="M-7 -38 a7 7 0 0 1 14 0" fill="#4a3426"/></g>`;

/** Turkish flag (simplified proportions) */
export const bayrak = (x, y, w) => {
  const h = w * 2 / 3, cx = x + h * 0.5, cy = y + h / 2, r = h * 0.25, sx = x + h * 0.97;
  const yildiz = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? h * 0.05 : h * 0.125;
    return `${(sx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ");
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e30a17"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/><circle cx="${cx + r * 0.25}" cy="${cy}" r="${r * 0.8}" fill="#e30a17"/>
    <polygon points="${yildiz}" fill="#fff" transform="rotate(-90 ${sx} ${cy})"/>`;
};

export const RESIMLER = {
  /* podcast: boarding school in Scotland */
  yatili: kap(`<rect width="320" height="180" fill="url(#g-aksam)"/>
    <path d="M0 140 Q160 120 320 140 V180 H0Z" fill="#4f7a4a"/>
    <rect x="70" y="56" width="160" height="88" fill="#8c8378"/><rect x="52" y="34" width="34" height="110" fill="#9a9085"/><rect x="214" y="34" width="34" height="110" fill="#9a9085"/>
    ${[52, 61, 70, 79].map((x) => `<rect x="${x}" y="28" width="6" height="8" fill="#9a9085"/>`).join("")}${[214, 223, 232, 241].map((x) => `<rect x="${x}" y="28" width="6" height="8" fill="#9a9085"/>`).join("")}
    ${[90, 120, 150, 180].flatMap((x) => [70, 100].map((y) => `<rect x="${x}" y="${y}" width="16" height="20" rx="8" fill="#ffd77a"/>`)).join("")}
    <path d="M140 144 V122 a10 10 0 0 1 20 0 V144Z" fill="#4a3a2a"/>
    <path d="M274 90 V150 M300 90 V150 M274 120 H300" stroke="#f2f2f2" stroke-width="3"/>
    ${ogrenci(262, 160, "#2f5d3a", 0.9)}`, "A stone boarding school building with lit windows and rugby posts"),

  /* podcast: Anatolian high school in Kayseri */
  anadolu: kap(`<rect width="320" height="180" fill="url(#g-gok)"/>
    <path d="M0 70 L50 40 L95 66 L150 30 L210 64 L260 36 L320 60 V180 H0Z" fill="#b8c7d4"/>
    <rect x="30" y="70" width="170" height="74" fill="#efe6d6"/><rect x="30" y="64" width="170" height="8" fill="#c9433a"/>
    ${[44, 74, 104, 134, 164].flatMap((x) => [82, 110].map((y) => `<rect x="${x}" y="${y}" width="18" height="16" fill="#6f9cc2"/>`)).join("")}
    <rect x="104" y="124" width="22" height="20" fill="#7a5a3a"/>
    <path d="M226 52 V150" stroke="#cfd6de" stroke-width="3"/>${bayrak(228, 52, 42)}
    <rect x="0" y="144" width="320" height="36" fill="#cbb994"/>
    <path d="M286 104 V150" stroke="#555" stroke-width="3"/><rect x="274" y="96" width="24" height="16" fill="#fff" stroke="#555"/><path d="M280 112 h12 l-2 8 h-8z" fill="none" stroke="#e87a2a" stroke-width="2"/>
    ${ogrenci(150, 166, "#2a4a7a")}${ogrenci(172, 166, "#7a2a4a")}${ogrenci(250, 168, "#2a6a5a")}`, "A Turkish high school with a flag, a courtyard and a basketball hoop"),

  /* reading: shoe lockers (Japan) */
  dolap: kap(`<rect width="320" height="180" fill="#e9e2d4"/><rect x="0" y="150" width="320" height="30" fill="#b9a27c"/>
    <rect x="40" y="26" width="240" height="124" fill="#a5793f"/>
    ${[0, 1, 2, 3, 4, 5].flatMap((c) => [0, 1, 2, 3].map((r) => {
      const x = 48 + c * 38, y = 32 + r * 29;
      return `<rect x="${x}" y="${y}" width="34" height="25" fill="#7c5a2e"/><path d="M${x + 5} ${y + 20} q6 -8 12 -2 q6 4 12 2 v3 h-24z" fill="${(c + r) % 3 ? "#f4f4f4" : "#2e3b55"}"/>`;
    })).join("")}`, "Small lockers full of shoes at a school entrance"),

  /* reading: guitar in a music room (Finland) */
  muzik: kap(`<rect width="320" height="180" fill="#d8e4ec"/><rect x="0" y="140" width="320" height="40" fill="#9a7b5a"/>
    <rect x="30" y="30" width="110" height="70" fill="#f8f8f4" stroke="#556"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M38 ${44 + i * 10} H132" stroke="#889" stroke-width="1"/>`).join("")}
    <circle cx="60" cy="54" r="4" fill="#223"/><circle cx="84" cy="64" r="4" fill="#223"/><circle cx="108" cy="48" r="4" fill="#223"/>
    <g transform="translate(262 152) rotate(-14)"><ellipse cx="0" cy="-20" rx="26" ry="22" fill="#c47a2c"/><ellipse cx="0" cy="-52" rx="19" ry="17" fill="#c47a2c"/>
      <circle cx="0" cy="-36" r="7" fill="#3a2410"/><rect x="-4" y="-130" width="8" height="80" fill="#5a3a1a"/><rect x="-7" y="-142" width="14" height="14" rx="3" fill="#3a2410"/></g>
    <rect x="160" y="40" width="40" height="70" fill="#3a3a44"/><circle cx="180" cy="62" r="12" fill="#222"/><circle cx="180" cy="94" r="7" fill="#222"/>`, "A guitar and a whiteboard with notes in a music room"),

  /* reading: flag ceremony (Türkiye) */
  toren: kap(`<rect width="320" height="180" fill="url(#g-gok)"/><rect x="0" y="120" width="320" height="60" fill="#cbb994"/>
    <rect x="0" y="60" width="320" height="62" fill="#efe6d6"/>${[20, 70, 120, 170, 220, 270].map((x) => `<rect x="${x}" y="72" width="26" height="22" fill="#6f9cc2"/>`).join("")}
    <path d="M160 18 V128" stroke="#cfd6de" stroke-width="3"/>${bayrak(162, 18, 48)}
    ${[60, 84, 108, 212, 236, 260].flatMap((x) => [150, 172].map((y) => ogrenci(x, y, y === 150 ? "#2a4a7a" : "#334e7e", 0.8))).join("")}`, "Students standing in lines in a courtyard for a flag ceremony"),
};

/** Podcast cover art */
export const KAPAK = kap(`<rect width="320" height="180" fill="#1b2a44"/>
  <circle cx="250" cy="90" r="70" fill="#2a3f63"/><circle cx="250" cy="90" r="48" fill="#ffb547" opacity=".18"/>
  <rect x="236" y="54" width="28" height="48" rx="14" fill="#e8edf5"/><path d="M226 86 a24 24 0 0 0 48 0" fill="none" stroke="#e8edf5" stroke-width="4"/><path d="M250 110 v16 M238 128 h24" stroke="#e8edf5" stroke-width="4"/>
  <text x="26" y="78" fill="#ffb547" font-family="Georgia, serif" font-size="34" font-weight="700">School</text>
  <text x="26" y="114" fill="#e8edf5" font-family="Georgia, serif" font-size="34" font-weight="700">Swap</text>
  <text x="28" y="142" fill="#9fb0c8" font-family="Segoe UI, sans-serif" font-size="13">Episode 12 · Two schools, two lives</text>`, "Podcast cover: School Swap, episode 12");
