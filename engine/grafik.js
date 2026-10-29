// Hafif, bağımlılıksız canlı grafik çizici (konum-zaman, hız-zaman vb.)

const RENK = {
  zemin: "rgba(0,0,0,0)",
  eksen: "#8193ad",
  izgara: "rgba(129,147,173,.16)",
  metin: "#c9d4e4",
  soluk: "#8193ad",
};

function guzelAdim(aralik, hedefSayi) {
  const kaba = aralik / Math.max(1, hedefSayi);
  const us = Math.pow(10, Math.floor(Math.log10(kaba)));
  const oran = kaba / us;
  const adim = oran < 1.5 ? 1 : oran < 3 ? 2 : oran < 7 ? 5 : 10;
  return adim * us;
}

function sayiYaz(v) {
  if (Math.abs(v) < 1e-9) return "0";
  const r = Math.round(v * 100) / 100;
  return String(r).replace(".", ",");
}

export class Grafik {
  /**
   * @param {HTMLElement} kap
   * @param {{baslik?:string, x:{etiket:string,min:number,max:number}, y:{etiket:string,min?:number,max?:number,otomatik?:boolean}}} ayar
   */
  constructor(kap, ayar) {
    this.kap = kap;
    this.ayar = ayar;
    this.tuval = document.createElement("canvas");
    kap.appendChild(this.tuval);
    this.cx = this.tuval.getContext("2d");
    this.seriler = [];
    this.golgeler = [];
    this.ucgenler = [];
    this.dikeyler = [];
    this.notlar = [];
    this._bekliyor = false;
    this._gozlemci = new ResizeObserver(() => this.ciz());
    this._gozlemci.observe(kap);
    this._surukleFn = null;
    this._isaretciKur();
  }

  seri(ad, { renk = "#4fc3f7", kalinlik = 2.5, kesikli = false, nokta = false } = {}) {
    const s = {
      ad, renk, kalinlik, kesikli, nokta, noktalar: [],
      ekle: (x, y) => { s.noktalar.push([x, y]); this.ciz(); },
      ayarla: (dizi) => { s.noktalar = dizi.slice(); this.ciz(); },
      temizle: () => { s.noktalar = []; this.ciz(); },
    };
    this.seriler.push(s);
    return s;
  }

  /** Bir serinin altında kalan alanı x0..x1 arasında boyar */
  golge(seri, x0, x1, renk = "rgba(255,181,71,.28)") {
    this.golgeler = [{ seri, x0, x1, renk }];
    this.ciz();
  }
  golgeTemizle() { this.golgeler = []; this.ciz(); }

  /** Eğim üçgeni: (x0,y0) → (x1,y1) */
  egimUcgeni(x0, y0, x1, y1, { renk = "#ffb547", xEtiket = "Δt", yEtiket = "Δy" } = {}) {
    this.ucgenler = [{ x0, y0, x1, y1, renk, xEtiket, yEtiket }];
    this.ciz();
  }
  ucgenTemizle() { this.ucgenler = []; this.ciz(); }

  dikey(x, renk = "rgba(255,255,255,.5)") { this.dikeyler = x == null ? [] : [{ x, renk }]; this.ciz(); }

  not(dizi) { this.notlar = dizi || []; this.ciz(); }

  eksenAyarla({ x, y }) {
    if (x) Object.assign(this.ayar.x, x);
    if (y) Object.assign(this.ayar.y, y);
    this.ciz();
  }

  hepsiniTemizle() {
    this.seriler.forEach((s) => (s.noktalar = []));
    this.golgeler = []; this.ucgenler = []; this.dikeyler = []; this.notlar = [];
    this.ciz();
  }

  /** Grafik üzerinde sürükleyince x değerini bildirir */
  surukle(fn) { this._surukleFn = fn; this.tuval.style.cursor = fn ? "ew-resize" : ""; }

  yokEt() { this._gozlemci.disconnect(); this.tuval.remove(); }

  _isaretciKur() {
    let basili = false;
    const bildir = (e) => {
      if (!this._surukleFn || !this._alan) return;
      const r = this.tuval.getBoundingClientRect();
      const px = e.clientX - r.left;
      const { sol, gen } = this._alan;
      const { min, max } = this.ayar.x;
      const x = min + ((px - sol) / gen) * (max - min);
      this._surukleFn(Math.min(max, Math.max(min, x)));
    };
    this.tuval.addEventListener("pointerdown", (e) => { basili = true; this.tuval.setPointerCapture(e.pointerId); bildir(e); });
    this.tuval.addEventListener("pointermove", (e) => { if (basili) bildir(e); });
    this.tuval.addEventListener("pointerup", () => (basili = false));
    this.tuval.addEventListener("pointercancel", () => (basili = false));
  }

  _yAraligi() {
    const y = this.ayar.y;
    if (!y.otomatik) return [y.min, y.max];
    let lo = y.min ?? 0, hi = y.max ?? 1;
    for (const s of this.seriler) for (const [, v] of s.noktalar) { if (v < lo) lo = v; if (v > hi) hi = v; }
    const pay = (hi - lo) * 0.08 || 1;
    if (lo < (y.min ?? 0)) lo -= pay;
    if (hi > (y.max ?? 1)) hi += pay;
    return [lo, hi];
  }

  ciz() {
    if (this._bekliyor) return;
    this._bekliyor = true;
    requestAnimationFrame(() => { this._bekliyor = false; this._ciz(); });
  }

  _ciz() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = this.kap.clientWidth, H = this.kap.clientHeight;
    if (!W || !H) return;
    if (this.tuval.width !== Math.round(W * dpr) || this.tuval.height !== Math.round(H * dpr)) {
      this.tuval.width = Math.round(W * dpr);
      this.tuval.height = Math.round(H * dpr);
    }
    const c = this.cx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);

    const kucuk = W < 260;
    const sol = kucuk ? 34 : 44, sag = 12, ust = this.ayar.baslik ? 26 : 12, alt = 30;
    const gen = W - sol - sag, yuk = H - ust - alt;
    this._alan = { sol, gen };
    const { min: x0, max: x1 } = this.ayar.x;
    const [y0, y1] = this._yAraligi();
    const X = (x) => sol + ((x - x0) / (x1 - x0)) * gen;
    const Y = (y) => ust + yuk - ((y - y0) / (y1 - y0 || 1)) * yuk;

    c.font = `${kucuk ? 10 : 11}px Segoe UI, system-ui, sans-serif`;
    c.textBaseline = "middle";

    // Başlık
    if (this.ayar.baslik) {
      c.fillStyle = RENK.metin;
      c.font = `600 ${kucuk ? 11 : 12.5}px Segoe UI, system-ui, sans-serif`;
      c.textAlign = "left";
      c.fillText(this.ayar.baslik, sol, 13);
      c.font = `${kucuk ? 10 : 11}px Segoe UI, system-ui, sans-serif`;
    }

    // Izgara + değerler
    const xAdim = guzelAdim(x1 - x0, kucuk ? 4 : 8);
    const yAdim = guzelAdim(y1 - y0, kucuk ? 3 : 5);
    c.lineWidth = 1;
    c.fillStyle = RENK.soluk;
    c.textAlign = "center";
    for (let x = Math.ceil(x0 / xAdim) * xAdim; x <= x1 + 1e-9; x += xAdim) {
      c.strokeStyle = RENK.izgara;
      c.beginPath(); c.moveTo(X(x), ust); c.lineTo(X(x), ust + yuk); c.stroke();
      c.fillText(sayiYaz(x), X(x), ust + yuk + 10);
    }
    c.textAlign = "right";
    for (let y = Math.ceil(y0 / yAdim) * yAdim; y <= y1 + 1e-9; y += yAdim) {
      c.strokeStyle = RENK.izgara;
      c.beginPath(); c.moveTo(sol, Y(y)); c.lineTo(sol + gen, Y(y)); c.stroke();
      c.fillText(sayiYaz(y), sol - 5, Y(y));
    }

    // Eksenler (y=0 çizgisi vurgulu)
    c.strokeStyle = RENK.eksen;
    c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(sol, ust); c.lineTo(sol, ust + yuk); c.stroke();
    const sifirY = y0 <= 0 && y1 >= 0 ? Y(0) : ust + yuk;
    c.beginPath(); c.moveTo(sol, sifirY); c.lineTo(sol + gen, sifirY); c.stroke();

    // Eksen adları
    c.fillStyle = RENK.metin;
    c.textAlign = "right";
    c.fillText(this.ayar.x.etiket, sol + gen, ust + yuk + 22);
    c.textAlign = "left";
    if (!this.ayar.baslik) c.fillText(this.ayar.y.etiket, sol + 4, ust + 6);
    else { c.textAlign = "right"; c.fillText(this.ayar.y.etiket, W - sag, 13); }

    c.save();
    c.beginPath(); c.rect(sol, ust - 2, gen, yuk + 4); c.clip();

    // Gölgeler (alan)
    for (const g of this.golgeler) {
      const n = g.seri.noktalar.filter(([x]) => x >= g.x0 - 1e-9 && x <= g.x1 + 1e-9);
      if (n.length < 2) continue;
      c.fillStyle = g.renk;
      c.beginPath();
      c.moveTo(X(n[0][0]), Y(0));
      for (const [x, y] of n) c.lineTo(X(x), Y(y));
      c.lineTo(X(n[n.length - 1][0]), Y(0));
      c.closePath();
      c.fill();
    }

    // Seriler
    for (const s of this.seriler) {
      if (!s.noktalar.length) continue;
      c.strokeStyle = s.renk;
      c.lineWidth = s.kalinlik;
      c.lineJoin = "round";
      c.setLineDash(s.kesikli ? [6, 5] : []);
      c.beginPath();
      s.noktalar.forEach(([x, y], i) => (i ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y))));
      c.stroke();
      c.setLineDash([]);
      if (s.nokta) {
        c.fillStyle = s.renk;
        for (const [x, y] of s.noktalar) { c.beginPath(); c.arc(X(x), Y(y), 3, 0, Math.PI * 2); c.fill(); }
      } else {
        const [lx, ly] = s.noktalar[s.noktalar.length - 1];
        c.fillStyle = s.renk;
        c.beginPath(); c.arc(X(lx), Y(ly), 4, 0, Math.PI * 2); c.fill();
      }
    }

    // Eğim üçgenleri
    for (const u of this.ucgenler) {
      c.strokeStyle = u.renk; c.lineWidth = 1.5; c.setLineDash([4, 4]);
      c.beginPath(); c.moveTo(X(u.x0), Y(u.y0)); c.lineTo(X(u.x1), Y(u.y0)); c.lineTo(X(u.x1), Y(u.y1)); c.stroke();
      c.setLineDash([]);
      c.fillStyle = u.renk; c.textAlign = "center";
      c.fillText(`${u.xEtiket} = ${sayiYaz(u.x1 - u.x0)}`, (X(u.x0) + X(u.x1)) / 2, Y(u.y0) + (u.y1 >= u.y0 ? 10 : -10));
      c.textAlign = "left";
      c.fillText(`${u.yEtiket} = ${sayiYaz(u.y1 - u.y0)}`, X(u.x1) + 4, (Y(u.y0) + Y(u.y1)) / 2);
    }

    // Dikey imleç
    for (const d of this.dikeyler) {
      c.strokeStyle = d.renk; c.lineWidth = 1; c.setLineDash([3, 3]);
      c.beginPath(); c.moveTo(X(d.x), ust); c.lineTo(X(d.x), ust + yuk); c.stroke(); c.setLineDash([]);
    }
    c.restore();

    // Notlar
    for (const n of this.notlar) {
      c.fillStyle = n.renk || RENK.metin;
      c.textAlign = n.hiza || "left";
      c.fillText(n.metin, X(n.x) + (n.dx || 6), Y(n.y) + (n.dy || -8));
    }
  }
}
