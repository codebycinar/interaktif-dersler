// Film şeridi kareleri ve masal kapakları için kodla üretilen SVG çizimleri (telifli görsel yok)

export const ARKALAR = {
  koy: "Köy (dağ eteği)", cesme: "Yol ve çeşme başı", dag: "Kara Dağ'daki mağara", saray: "Saray", gece: "Gece",
};
export const KISILER = {
  kel: "Keloğlan", ana: "Anası", bulbul: "Bülbül", dev: "Dev", padisah: "Padişah", sultan: "Gülsüm Sultan", tellal: "Tellal",
};
export const CEKIMLER = { genis: "Geniş çekim", orta: "Orta çekim", yakin: "Yakın çekim" };

function arka(tur) {
  switch (tur) {
    case "cesme": return `
      <rect width="320" height="180" fill="url(#gok)"/>
      <path d="M0 120 Q80 105 160 118 T320 112 V180 H0Z" fill="#7cb46b"/>
      <path d="M0 150 Q120 132 320 150 V180 H0Z" fill="#c9a66b"/>
      <rect x="226" y="88" width="52" height="46" rx="4" fill="#cfc6b8"/><path d="M234 134 V108 a18 18 0 0 1 36 0 V134Z" fill="#8f8577"/>
      <path d="M252 112 v14" stroke="#7fd3ff" stroke-width="3"/><ellipse cx="252" cy="134" rx="16" ry="4" fill="#7fd3ff"/>
      <rect x="40" y="70" width="8" height="54" fill="#6b4a2b"/><circle cx="44" cy="62" r="24" fill="#4f8f4a"/>`;
    case "dag": return `
      <rect width="320" height="180" fill="#3b2f55"/><circle cx="270" cy="34" r="14" fill="#e8e2c8" opacity=".8"/>
      <path d="M0 150 L70 50 L130 120 L200 30 L320 150 V180 H0Z" fill="#2a2238"/>
      <path d="M120 180 V128 a46 46 0 0 1 92 0 V180Z" fill="#0d0a14"/>
      <path d="M0 160 H320 V180 H0Z" fill="#1f1a29"/>`;
    case "saray": return `
      <rect width="320" height="180" fill="url(#gok)"/>
      <rect x="70" y="70" width="180" height="80" fill="#efe3c8"/><path d="M110 70 a50 40 0 0 1 100 0Z" fill="#d9b45a"/>
      <rect x="52" y="52" width="20" height="98" fill="#e6d7b5"/><path d="M52 52 L62 30 L72 52Z" fill="#c9433a"/>
      <rect x="248" y="52" width="20" height="98" fill="#e6d7b5"/><path d="M248 52 L258 30 L268 52Z" fill="#c9433a"/>
      <path d="M145 150 V118 a15 15 0 0 1 30 0 V150Z" fill="#7a5a3a"/>
      <rect x="92" y="96" width="18" height="24" rx="9" fill="#5d8fb8"/><rect x="210" y="96" width="18" height="24" rx="9" fill="#5d8fb8"/>
      <path d="M0 150 H320 V180 H0Z" fill="#b9a27c"/>`;
    case "gece": return `
      <rect width="320" height="180" fill="#101a38"/>
      <path d="M262 28 a16 16 0 1 0 14 22 a12 12 0 1 1 -14 -22Z" fill="#f4e7a1"/>
      ${[[30, 20], [80, 40], [140, 16], [200, 36], [110, 60], [300, 70], [240, 14]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#fff"/>`).join("")}
      <path d="M0 140 Q160 120 320 140 V180 H0Z" fill="#1c2a4a"/>
      <rect x="40" y="108" width="40" height="34" fill="#22304f"/><path d="M36 108 L60 90 L84 108Z" fill="#2d3c60"/><rect x="54" y="118" width="10" height="10" fill="#f4d27a"/>`;
    default: return `
      <rect width="320" height="180" fill="url(#gok)"/>
      <path d="M0 110 L60 60 L120 104 L190 50 L260 100 L320 70 V180 H0Z" fill="#8fb4c9"/>
      <path d="M0 128 Q90 108 180 126 T320 120 V180 H0Z" fill="#79b16a"/>
      <rect x="40" y="96" width="44" height="34" fill="#e9d9bd"/><path d="M34 96 L62 76 L90 96Z" fill="#b5523b"/><rect x="56" y="110" width="12" height="20" fill="#7a5a3a"/>
      <rect x="236" y="100" width="36" height="28" fill="#e9d9bd"/><path d="M230 100 L254 84 L278 100Z" fill="#b5523b"/>`;
  }
}

/** Kişi çizimi; (x, y) ayak noktası, o ölçek */
function kisi(tur, x, y, o) {
  const g = (ic) => `<g transform="translate(${x} ${y}) scale(${o})">${ic}</g>`;
  const ten = "#f1c39b";
  switch (tur) {
    case "bulbul": return g(`<g transform="translate(0 -70)"><ellipse cx="0" cy="0" rx="13" ry="9" fill="#8a6a4a"/><circle cx="11" cy="-6" r="6" fill="#9b7a58"/>
      <path d="M16 -6 L23 -4 L16 -2Z" fill="#e0a030"/><path d="M-12 0 L-24 -6 L-22 4Z" fill="#6f533a"/><circle cx="12" cy="-7" r="1.3" fill="#111"/>
      <path d="M-4 -4 q6 -10 12 -2" fill="none" stroke="#6f533a" stroke-width="2"/></g>`);
    case "dev": return g(`<rect x="-26" y="-118" width="52" height="78" rx="18" fill="#56705a"/><rect x="-22" y="-40" width="16" height="40" rx="6" fill="#3f5342"/><rect x="6" y="-40" width="16" height="40" rx="6" fill="#3f5342"/>
      <circle cx="0" cy="-136" r="22" fill="#8aa37f"/><path d="M-20 -150 q20 -22 40 0" fill="#2c2c2c"/><path d="M-16 -152 l-6 -14 l10 8Z M16 -152 l6 -14 l-10 8Z" fill="#e7dcc4"/>
      <circle cx="-8" cy="-138" r="3" fill="#111"/><circle cx="8" cy="-138" r="3" fill="#111"/><path d="M-12 -146 l8 3 M12 -146 l-8 3" stroke="#111" stroke-width="2.5"/><path d="M-8 -126 q8 5 16 0" stroke="#3a2a1a" stroke-width="2.5" fill="none"/>`);
    case "ana": return g(`<path d="M-16 0 L-12 -52 L12 -52 L16 0Z" fill="#7d4f8f"/><circle cx="0" cy="-62" r="11" fill="${ten}"/>
      <path d="M-13 -60 a13 14 0 0 1 26 0 L14 -46 L-14 -46Z" fill="#e7e1d1"/><circle cx="-4" cy="-62" r="1.3" fill="#111"/><circle cx="4" cy="-62" r="1.3" fill="#111"/>`);
    case "padisah": return g(`<path d="M-18 0 L-14 -56 L14 -56 L18 0Z" fill="#a8322d"/><path d="M-4 -56 V0" stroke="#d9b45a" stroke-width="3"/><circle cx="0" cy="-67" r="12" fill="${ten}"/>
      <path d="M-9 -62 q9 14 18 0" fill="#4a3a2a"/><path d="M-11 -76 L-11 -88 L-5 -81 L0 -90 L5 -81 L11 -88 L11 -76Z" fill="#f2c94c"/><circle cx="-4" cy="-69" r="1.4" fill="#111"/><circle cx="4" cy="-69" r="1.4" fill="#111"/>`);
    case "sultan": return g(`<path d="M-17 0 L-10 -52 L10 -52 L17 0Z" fill="#e58fb3"/><path d="M-12 -70 q12 -14 24 0 L13 -40 L-13 -40Z" fill="#5a3826"/><circle cx="0" cy="-62" r="11" fill="${ten}"/>
      <path d="M-7 -73 l3 -6 l4 4 l4 -4 l3 6Z" fill="#f2c94c"/><circle cx="-4" cy="-62" r="1.3" fill="#111"/><circle cx="4" cy="-62" r="1.3" fill="#111"/><path d="M-3 -56 q3 2 6 0" stroke="#a33" stroke-width="1.2" fill="none"/>`);
    case "tellal": return g(`<rect x="-12" y="-52" width="24" height="40" rx="6" fill="#3f6fa8"/><rect x="-11" y="-14" width="9" height="14" fill="#2b3e5c"/><rect x="2" y="-14" width="9" height="14" fill="#2b3e5c"/>
      <circle cx="0" cy="-62" r="11" fill="${ten}"/><rect x="-11" y="-80" width="22" height="10" rx="3" fill="#b5523b"/><circle cx="18" cy="-34" r="10" fill="#d9b45a" stroke="#7a5a3a" stroke-width="2"/>
      <circle cx="-4" cy="-62" r="1.3" fill="#111"/><circle cx="4" cy="-62" r="1.3" fill="#111"/><path d="M-4 -56 h8" stroke="#111" stroke-width="1.5"/>`);
    default: return g(`<rect x="-12" y="-52" width="24" height="40" rx="6" fill="#8a5a2b"/><rect x="-6" y="-52" width="12" height="40" fill="#e9d9bd"/>
      <rect x="-11" y="-14" width="9" height="14" fill="#4a3a2a"/><rect x="2" y="-14" width="9" height="14" fill="#4a3a2a"/>
      <circle cx="0" cy="-64" r="12" fill="${ten}"/><ellipse cx="-4" cy="-71" rx="4" ry="2" fill="#fff" opacity=".7"/>
      <circle cx="-4" cy="-64" r="1.4" fill="#111"/><circle cx="4" cy="-64" r="1.4" fill="#111"/><path d="M-4 -58 q4 3 8 0" stroke="#7a3a2a" stroke-width="1.4" fill="none"/>
      <path d="M12 -38 L30 -48" stroke="#c9a06b" stroke-width="3.5" stroke-linecap="round"/>`);
  }
}

/**
 * Bir film şeridi karesini çizer.
 * @param {{arka?:string, kisiler?:string[], cekim?:string}} kare
 */
export function kareSvg(kare = {}) {
  const k = (kare.kisiler || []).filter((x) => KISILER[x]);
  const cekim = kare.cekim || "orta";
  const olcek = cekim === "genis" ? 0.62 : cekim === "yakin" ? 1.9 : 1;
  const zemin = cekim === "genis" ? 158 : cekim === "yakin" ? 270 : 172;
  let kisilerSvg = "";
  if (k.length) {
    const goster = cekim === "yakin" ? k.slice(0, 1) : k;
    const aralik = 320 / (goster.length + 1);
    goster.forEach((t, i) => {
      const ol = olcek * (t === "dev" ? (cekim === "yakin" ? 0.9 : 1) : 1);
      kisilerSvg += kisi(t, cekim === "yakin" ? 160 : aralik * (i + 1), zemin, ol);
    });
  }
  const bulanik = cekim === "yakin" ? `<rect width="320" height="180" fill="rgba(10,14,22,.35)"/>` : "";
  return `<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${ARKALAR[kare.arka] || "Boş kare"}">
    <defs><linearGradient id="gok" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0f5"/><stop offset="1" stop-color="#e8f6ff"/></linearGradient></defs>
    ${kare.arka ? arka(kare.arka) : `<rect width="320" height="180" fill="#1a2436"/><text x="160" y="96" fill="#6b7a92" font-size="16" text-anchor="middle" font-family="Segoe UI, sans-serif">Boş kare</text>`}
    ${bulanik}${kisilerSvg}</svg>`;
}

/** Masal kapağı: arka plan + kişiler + başlık bandı olmadan (başlık eşleştirmede tahmin edilir) */
export const KAPAKLAR = {
  kaval: { arka: "koy", kisiler: ["kel", "bulbul"], cekim: "orta" },
  dev: { arka: "dag", kisiler: ["dev"], cekim: "orta" },
  ay: { arka: "gece", kisiler: ["sultan"], cekim: "genis" },
};
