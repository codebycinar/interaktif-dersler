// Matematik dersleri için ortak stil (tahta + panel bileşenleri). Paketleyici yalnızca dersin kendi ders.css'ini
// eklediği için ortak bileşenlerin stili buradan bir kez sayfaya enjekte edilir. Sınıf öneki: mt-
const STIL = `
.mt-tahta { position: absolute; inset: 0; width: 100%; height: 100%; display: block; touch-action: none; user-select: none; -webkit-user-select: none; }
.mt-tahta text { font-family: var(--font, system-ui, sans-serif); paint-order: stroke; stroke: #0d1522; stroke-width: 4px; stroke-linejoin: round; }
.mt-tahta .mt-tut { cursor: grab; outline: none; }
.mt-tahta .mt-tut.mt-basili { cursor: grabbing; }
.mt-tahta .mt-tut:focus-visible .mt-halka, .mt-tahta .mt-tut.mt-basili .mt-halka { stroke: #fff; opacity: 1; stroke-width: 3; }
.mt-tahta .mt-tut:hover .mt-halka { opacity: .9; }

.d-etiket-hud.mt-hud { right: 12px; pointer-events: none; }
.d-etiket-hud.mt-hud .d-gostergeler { display: flex; flex-wrap: wrap; gap: 6px; }
.d-etiket-hud.mt-hud .d-gosterge { min-width: 86px; padding: 4px 10px; }
.d-etiket-hud.mt-hud .d-gosterge b { font-size: 16px; }
@media (max-width: 760px) {
  .d-etiket-hud.mt-hud { top: 6px; left: 6px; right: 6px; }
  .d-etiket-hud.mt-hud .d-gosterge { min-width: 0; padding: 2px 7px; }
  .d-etiket-hud.mt-hud .d-gosterge span { font-size: 11px; }
  .d-etiket-hud.mt-hud .d-gosterge b { font-size: 14px; }
}

.mt-dunya { position: absolute; inset: 0; z-index: 0; }
.mt-yuzen { position: absolute; left: 12px; bottom: 12px; width: min(360px, 48%); background: rgba(16, 24, 38, .86); border: 1px solid rgba(255, 255, 255, .12); border-radius: 14px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 8px 26px rgba(0, 0, 0, .3); overflow: hidden; }
.mt-yuzen.sag-ust { left: auto; bottom: auto; right: 12px; top: 44px; }
.mt-yuzen.sag-alt { left: auto; right: 12px; }
.mt-yuzen-baslik { font-size: 12.5px; font-weight: 700; color: var(--metin-2); padding: 6px 12px 0; }
.mt-yuzen-govde { position: relative; height: 200px; }
@media (max-width: 760px) {
  .mt-yuzen { left: 6px; bottom: 6px; width: 52%; }
  .mt-yuzen.sag-ust { left: auto; right: 6px; bottom: auto; top: 70px; }
  .mt-yuzen.sag-alt { left: auto; right: 6px; }
  .mt-yuzen-govde { height: 118px; }
  .mt-yuzen-baslik { font-size: 11px; padding: 4px 8px 0; }
}

.d-satir .d-btn[aria-pressed="true"] { border-color: var(--vurgu); color: var(--vurgu); background: rgba(255, 181, 71, .1); }

.mt-liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: 14.5px; }
.mt-liste li { display: flex; gap: 8px; align-items: flex-start; color: var(--metin-2); }
.mt-liste li::before { content: ""; flex: none; width: 16px; height: 16px; margin-top: 3px; border-radius: 5px; border: 2px solid var(--cizgi); }
.mt-liste li.tamam { color: var(--metin); }
.mt-liste li.tamam::before { background: var(--yesil); border-color: var(--yesil); box-shadow: inset 0 0 0 2px var(--panel); }

.mt-formuller { display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; background: var(--zemin); border: 1px solid var(--cizgi); border-radius: 10px; padding: 8px 12px; font-size: 14.5px; }
.mt-formuller > .mt-deger { font-family: var(--mono); text-align: right; color: var(--vurgu-2); }
.mt-formuller > .mt-ayrac { grid-column: 1 / -1; height: 1px; background: var(--cizgi); margin: 2px 0; }

.mt-tablo .d-tablo th, .mt-tablo .d-tablo td { padding: 3px 5px; }
.mt-tablo .d-tablo th { white-space: normal; font-size: 12px; line-height: 1.2; vertical-align: bottom; }

.mt-onerme { border: 1px solid var(--cizgi); border-radius: 10px; padding: 8px 10px; background: var(--zemin); display: grid; gap: 6px; }
.mt-onerme > div:first-child { font-size: 15px; }
.mt-onerme.dogru { border-color: var(--yesil); }
.mt-onerme.yanlis { border-color: var(--kirmizi); }
.mt-onerme .d-geri-bildirim:empty { display: none; }
.mt-onerme .d-satir .d-btn { padding: 5px 12px; font-size: 14px; }
.mt-onerme .d-btn[aria-pressed="true"] { border-color: var(--vurgu); color: var(--vurgu); }

.mt-sirala { display: grid; gap: 6px; }
.mt-sirala .mt-kart { text-align: left; justify-content: flex-start; font-weight: 500; font-size: 14px; line-height: 1.35; padding: 8px 10px; }
.mt-sirala .mt-kart.yanlis { border-color: var(--kirmizi); animation: mt-salla .3s; }
.mt-sirala ol { margin: 0; padding-left: 22px; display: grid; gap: 4px; font-size: 14px; }
.mt-sirala ol li { color: var(--yesil); }
.mt-sirala ol li span { color: var(--metin); }
@keyframes mt-salla { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

.mt-secim-tablo { border-collapse: separate; border-spacing: 4px; font-size: 14px; }
.mt-secim-tablo th { color: var(--metin-2); font-weight: 600; padding: 2px 4px; }
.mt-secim-tablo td:first-child { font-family: var(--mono); color: var(--metin-2); padding-right: 4px; }
.mt-secim-tablo select { background: var(--zemin); border: 1px solid var(--cizgi); border-radius: 8px; padding: 5px 4px; min-width: 72px; font-family: var(--mono); }
.mt-secim-tablo select.dogru { border-color: var(--yesil); color: var(--yesil); }
.mt-secim-tablo select.yanlis { border-color: var(--kirmizi); color: var(--kirmizi); }

.mt-hesap { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; background: var(--zemin); border: 1px solid var(--cizgi); border-radius: 10px; padding: 8px 10px; font-size: 14px; }
.mt-hesap input { width: 80px; background: var(--panel-2); border: 1px solid var(--cizgi); border-radius: 8px; padding: 5px 8px; font-family: var(--mono); }
.mt-hesap output { font-family: var(--mono); color: var(--vurgu-2); }
`;

let eklendi = false;
export function stilEkle() {
  if (eklendi || typeof document === "undefined") return;
  eklendi = true;
  const st = document.createElement("style");
  st.dataset.kaynak = "matematik-ortak";
  st.textContent = STIL;
  document.head.append(st);
}
