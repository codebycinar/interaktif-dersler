// 10th grade English · Theme 1: School Life & Education (A) — listening (podcast) and reading (article)
// ENG.10.1.L1–L4 listening · P1 pronunciation · R1–R4 reading · V1 vocabulary
import { dersBaslat, el } from "../../../../engine/ders.js";
import { sahneAc, kart, siniflandir, eslestir, sirala, okuyucu, kalici, tik, kaydedici, EN, kodlariKisalt, kelimeSay, diyalogCal, soyle, metinKutusu, kontrolListesi } from "../ortak/ingilizce.js";
import {
  SESLER, PODCAST, TAHMINLER, ANA_KONU, KONU_SIRASI, AYRINTILAR, CIKARIMLAR, TONLAMA,
  MAKALE_BASLIK, MAKALE_GIRIS, MAKALE, MAKALE_SON, GOZ_GEZDIR, TARAMA, FOTO_TAHMIN, OKUMA_TAHMIN, KISILER, KELIMELER, KARSILASTIR, OKUMA_CIKARIM,
} from "./icerik.js";
import { parcala, cumleBul, yansimaDenetle } from "./okuma.js";
import { RESIMLER, KAPAK } from "./cizim.js";

const veri = kalici("edu:ing10-u1a-schools-around-the-world:veri", {
  tahminler: [], dinlendi: false, okumaFoto: {}, okumaIfade: {}, taranan: [], gozGezdirdi: false, gorus: {}, mesaj: "", sabah: "",
});
const RESIM = (svg, sinif = "") => el("div", { class: `eng-resim ${sinif}`.trim(), html: svg });
const KISI_RENK = { Maya: "#ffb547", Elif: "#4fc3f7", Jack: "#5ad38b" };

/** Multiple-choice question in the panel with instant feedback */
function soruKutusu(ctx, s, sonuc) {
  const geri = el("div", { class: "ort-geri" });
  ctx.secenekler({
    etiket: s.soru, liste: s.liste, deger: null,
    degisti: (v) => {
      const d = v === "dogru";
      geri.className = `ort-geri ${d ? "dogru" : "yanlis"}`;
      geri.textContent = d ? `Correct! ${s.aciklama || ""}` : "Not quite. Look for the key words again.";
      tik(d ? 880 : 220);
      sonuc(d);
    },
  });
  ctx.kontroller.append(geri);
}

/** Podcast player: speakers, hidden transcript, play/stop */
function podcastOynatici(ctx, { bitti, satirCal = false } = {}) {
  const oku = okuyucu(ctx);
  const kisiler = el("div", { class: "eng-kisiler" }, Object.keys(SESLER).map((k) =>
    el("div", { class: "eng-kisi", "data-kisi": k, style: `--renk:${KISI_RENK[k]}` }, el("i", {}, k[0]), el("span", {}, k))));
  const metin = el("div", { class: "eng-dokum gizli" }, PODCAST.map((s, i) => el("p", { "data-satir": String(i) },
    satirCal ? el("button", { class: "eng-mini", type: "button", "aria-label": `Play line ${i + 1}`, onclick: () => tek(i) }, "▶") : "",
    el("b", { style: `color:${KISI_RENK[s.kim]}` }, `${s.kim}: `), s.metin)));
  const durum = el("div", { class: "ort-alt" }, "Press play and listen to the whole episode.");
  const vurgula = (i) => {
    metin.querySelectorAll("p").forEach((p, j) => p.classList.toggle("okunuyor", i === j));
    kisiler.querySelectorAll(".eng-kisi").forEach((k) => k.classList.toggle("konusuyor", i >= 0 && PODCAST[i].kim === k.dataset.kisi));
    if (i >= 0) durum.textContent = `Line ${i + 1} of ${PODCAST.length}`;
  };
  async function cal() {
    const tamam = await diyalogCal(oku, PODCAST, SESLER, vurgula);
    if (tamam) { durum.textContent = "Episode finished."; bitti?.(); }
  }
  async function tek(i) {
    oku.durdur();
    vurgula(i);
    await diyalogCal(oku, [PODCAST[i]], SESLER, () => {});
    vurgula(-1);
  }
  const govde = el("div", { class: "eng-oynatici" },
    RESIM(KAPAK, "kapak"),
    el("div", { class: "eng-oynatici-sag" }, kisiler,
      el("div", { class: "d-satir" },
        el("button", { class: "d-btn ana", type: "button", "data-oynat": "1", onclick: cal }, "▶ Play the episode"),
        el("button", { class: "d-btn", type: "button", onclick: () => { oku.durdur(); vurgula(-1); durum.textContent = "Stopped."; } }, "■ Stop"),
        el("button", { class: "d-btn", type: "button", "data-dokum": "1", onclick: () => metin.classList.toggle("gizli") }, "Show / hide transcript")),
      durum));
  return { govde, metin, oku };
}

/** Pitch contour drawing for the intonation step */
function kontur(ton) {
  const son = ton === "yukselen" ? "C 150 34, 170 16, 196 10" : "C 150 30, 170 50, 196 56";
  return `<svg viewBox="0 0 200 64" aria-hidden="true"><path d="M4 34 C 30 26, 50 26, 70 32 S 110 38, 130 32 ${son}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    <path d="${ton === "yukselen" ? "M186 6 L198 9 L190 18" : "M188 50 L197 57 L185 60"}" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** Article view with clickable words */
function makaleGorunumu({ kelimeTik, sozcukTik, gizliKelime = true } = {}) {
  const kok = el("article", { class: "eng-makale" },
    el("h2", {}, MAKALE_BASLIK), el("p", { class: "eng-giris" }, MAKALE_GIRIS));
  for (const p of MAKALE) {
    const govde = el("p");
    for (const t of parcala(p.metin)) {
      if (t.bosluk) { govde.append(t.metin); continue; }
      if (t.kelime) {
        govde.append(el("button", { class: `eng-hedef${gizliKelime ? "" : " acik"}`, type: "button", "data-kelime": t.kelime, onclick: () => kelimeTik?.(t.kelime, p) }, t.metin));
        continue;
      }
      const s = el("span", { class: "eng-sozcuk", ...(t.anahtar ? { "data-anahtar": t.anahtar } : {}) }, t.metin);
      if (sozcukTik) s.addEventListener("click", () => sozcukTik(t, s));
      govde.append(s);
    }
    kok.append(el("section", { class: "eng-profil", "data-kim": p.kim }, el("h3", {}, p.ad, el("span", {}, ` · ${p.yer}`)), govde));
  }
  kok.append(el("p", { class: "eng-giris" }, MAKALE_SON));
  return kok;
}

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Warm-up: look, think, predict",
    cikti: "ENG.10.1.L1",
    anlatim: `
      <p>Today you will listen to an episode of <b>School Swap</b>, a podcast where students compare their schools.</p>
      <p>First, wake up what you already know: match the school words with their meanings. Then look at the two pictures from the podcast page and make your <b>predictions</b>. You will check them after listening.</p>`,
    gorev: "Match the four words, answer the picture question and tick at least <b>two</b> predictions.",
    ogretmen: "Program L1 için önce temaya ilişkin ön bilgilerin harekete geçirilmesini, ardından görsel ipuçlarıyla ayrıntılı tahmin yapılmasını öneriyor (L1 a–d). Tahminleri Türkçe kullanmadan, tahtaya “I think… because…” kalıbıyla yazdırın. Tahminler 2. adımda kontrol edilir.",
    kur(ctx) {
      const S = sahneAc(ctx);
      let eslesti = false, resim = null;
      const kontrol = () => { if (eslesti && resim === "yatili" && veri.tahminler.length >= 2) ctx.gorevTamam(); };
      S.append(kart("The podcast page", el("div", { class: "eng-resimler" },
        el("figure", {}, RESIM(KAPAK), el("figcaption", {}, "School Swap · Episode 12")),
        el("figure", {}, RESIM(RESIMLER.yatili), el("figcaption", {}, "Picture A")),
        el("figure", {}, RESIM(RESIMLER.anadolu), el("figcaption", {}, "Picture B")))));
      const k = kart("What do you already know?");
      S.append(k);
      eslestir(k, {
        solBaslik: "Word", sagBaslik: "Meaning", metinler: EN.eslestir,
        ciftler: [
          { id: "yatili", sol: "a boarding school", sag: "students live and sleep there during the week" },
          { id: "devlet", sol: "a state school", sag: "the government pays for it, so it's free" },
          { id: "etkinlik", sol: "an extracurricular activity", sag: "something you do outside normal lessons, like a club" },
          { id: "rehber", sol: "a counsellor", sag: "a person at school who helps students with problems and stress" },
        ],
        bitti: () => { eslesti = true; kontrol(); },
      });
      const t = kart("My predictions about the episode");
      S.append(t);
      t.append(el("div", { class: "eng-onay" }, TAHMINLER.map((o) => {
        const c = el("input", { type: "checkbox", "data-tahmin": o.id, checked: veri.tahminler.includes(o.id) });
        c.addEventListener("change", () => {
          veri.tahminler = c.checked ? [...new Set([...veri.tahminler, o.id])] : veri.tahminler.filter((x) => x !== o.id);
          veri.kaydet(); kontrol();
        });
        return el("label", {}, c, " ", o.metin);
      })));
      const geri = el("div", { class: "ort-geri" });
      ctx.secenekler({
        etiket: "Picture A probably shows…", deger: null,
        liste: [{ deger: "yatili", metin: "a boarding school" }, { deger: "ilk", metin: "a primary school" }, { deger: "uni", metin: "a university library" }],
        degisti: (v) => {
          resim = v;
          geri.className = `ort-geri ${v === "yatili" ? "dogru" : "yanlis"}`;
          geri.textContent = v === "yatili" ? "Good guess! Lit windows in the evening and rugby posts: students may live there." : "Look again: it's evening, the windows are lit and there are rugby posts next to the building.";
          kontrol();
        },
      });
      ctx.kontroller.append(geri);
      kontrol();
    },
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "Listen for the main idea",
    cikti: "ENG.10.1.L2",
    anlatim: `
      <p>Listen to the <b>whole</b> episode once. Don't try to understand every word: listen for the <b>main topic</b> and the order of the topics.</p>
      <p>The transcript is hidden because this is a listening task. After listening, check your predictions from the warm-up.</p>`,
    gorev: "Listen to the whole episode, choose the main idea and put the five topics in order.",
    ogretmen: "L2 a–b: içerik bir bütün olarak dinlenir, ana konu ve temel bileşenler fark edilir. Ses sentezi yoksa diyaloğu iki öğrenciyle ve sizinle canlandırın; döküm düğmesi yalnızca ikinci dinlemeden sonra açılmalı.",
    kur(ctx) {
      const S = sahneAc(ctx);
      let anaKonu = false, sira = false;
      const tahminKart = el("div");
      const kontrol = () => {
        if (veri.dinlendi) {
          tahminKart.replaceChildren(kart("Check your predictions", el("div", { class: "eng-onay" }, TAHMINLER.map((t) => {
            const secti = veri.tahminler.includes(t.id);
            const isaret = secti ? (t.dogru ? "✓ You were right" : "✗ This didn't happen") : t.dogru ? "• You didn't predict this, but it happened" : "";
            return el("div", { class: `eng-tahmin${secti ? " secti" : ""}` }, t.metin, isaret ? el("em", {}, ` — ${isaret}`) : "");
          }))));
        }
        if (veri.dinlendi && anaKonu && sira) ctx.gorevTamam();
      };
      const o = podcastOynatici(ctx, { bitti: () => { veri.dinlendi = true; veri.kaydet(); kontrol(); } });
      S.append(kart("School Swap · Episode 12", o.govde, o.metin), tahminKart);
      soruKutusu(ctx, { soru: "What is the episode mainly about?", liste: ANA_KONU, aciklama: "The host says it: students compare their school lives." }, (d) => { anaKonu = d; kontrol(); });
      ctx.not("<p><b>Put the topics in the order you hear them.</b></p>");
      const k = el("div");
      ctx.kontroller.append(k);
      sirala(k, { ogeler: KONU_SIRASI, metinler: EN.sirala, bitti: () => { sira = true; kontrol(); } });
      kontrol();
    },
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "Listen for details and meaning",
    cikti: "ENG.10.1.L3",
    anlatim: `
      <p>Now listen for <b>details</b>. Who does what: Elif, Jack or both of them? You can play the whole episode again or open the transcript and replay single lines.</p>
      <p>Then answer three questions. The answers are not always said directly: you need to make an <b>inference</b> from the speakers' words.</p>`,
    gorev: "Sort all nine details correctly and answer the three inference questions.",
    ogretmen: "L3: sınıflandırma (b), karşılaştırma (c) ve çıkarım (e) basamakları. “so” ile kurulan sonuç ilişkisini ve “can't” ile yapılan çıkarımı (G1 hazırlığı) vurgulayın. Ayrıntı kartlarını tahtada bir Venn şemasına da dönüştürebilirsiniz.",
    kur(ctx) {
      const S = sahneAc(ctx);
      let siniflar = false;
      const cevaplar = new Set();
      const kontrol = () => { if (siniflar && cevaplar.size === CIKARIMLAR.length) ctx.gorevTamam(); };
      const o = podcastOynatici(ctx, { satirCal: true });
      S.append(kart("Listen again", o.govde, o.metin));
      const k = kart("Elif, Jack or both?");
      S.append(k);
      siniflandir(k, {
        ogeler: AYRINTILAR, metinler: EN.siniflandir, sutun: 3,
        kovalar: [{ id: "elif", baslik: "Elif (Kayseri)" }, { id: "jack", baslik: "Jack (Edinburgh)" }, { id: "ikisi", baslik: "Both" }],
        bitti: () => { siniflar = true; kontrol(); },
      });
      CIKARIMLAR.forEach((s, i) => soruKutusu(ctx, s, (d) => { if (d) cevaplar.add(i); else cevaplar.delete(i); kontrol(); }));
    },
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "After listening: would you swap?",
    cikti: "ENG.10.1.L4",
    anlatim: `
      <p>Think about what you heard. Which parts of Elif's and Jack's school lives would you like to try? Which wouldn't you like?</p>
      <p>Then send Maya a short <b>voice or text message</b> for the next episode: Would you like to swap schools with Jack or Elif for a week? Why or why not?</p>`,
    gorev: "Give your opinion on at least <b>four</b> things and write a message of at least 25 words.",
    ogretmen: "L4 a–c: dinleme sürecine ilişkin düşünce ve duyguların bireysel olarak ifade edilmesi ve paylaşılması. Mesajları ikili gruplarda sesli okutup birbirlerine “Why?” sorusu sordurun. Kayıt cihazda kalır, hiçbir yere gönderilmez.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const KONULAR = [
        ["yatili", "living at school from Monday to Friday (Jack)"], ["kodlama", "a coding club on Wednesdays (Elif)"],
        ["rugby", "playing rugby twice a week (Jack)"], ["yemek", "cooking in a food technology room (Jack)"],
        ["basket", "playing basketball in the courtyard at lunchtime (Elif)"], ["plan", "making a weekly study plan (Elif)"],
      ];
      const ozet = el("p", { class: "eng-ozet" });
      const liste = el("div", { class: "eng-gorusler" });
      const kontrol = () => {
        const evet = KONULAR.filter(([k]) => veri.gorus[k] === "evet").map(([, m]) => m.replace(/ \((Jack|Elif)\)$/, ""));
        const hayir = KONULAR.filter(([k]) => veri.gorus[k] === "hayir").map(([, m]) => m.replace(/ \((Jack|Elif)\)$/, ""));
        const birlestir = (a) => a.length > 1 ? `${a.slice(0, -1).join(", ")} and ${a.at(-1)}` : a[0];
        ozet.textContent = [evet.length ? `I'd like to try ${birlestir(evet)}.` : "", hayir.length ? `I wouldn't like ${birlestir(hayir)}.` : ""].join(" ").trim() || "Your summary will appear here.";
        if (Object.keys(veri.gorus).length >= 4 && kelimeSay(veri.mesaj) >= 25) ctx.gorevTamam();
      };
      for (const [k, m] of KONULAR) {
        const satir = el("div", { class: "eng-gorus" }, el("span", {}, m));
        const dugme = (deger, metin) => el("button", {
          class: "d-btn kucuk", type: "button", "data-gorus": `${k}|${deger}`, "aria-pressed": String(veri.gorus[k] === deger),
          onclick: (e) => { veri.gorus[k] = deger; veri.kaydet(); satir.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget))); kontrol(); },
        }, metin);
        satir.append(el("div", { class: "d-satir" }, dugme("evet", "👍 I'd like this"), dugme("hayir", "👎 Not for me")));
        liste.append(satir);
      }
      S.append(kart("Would you swap?", liste), kart("My summary", ozet));
      const sayac = el("div", { class: "ort-alt" });
      const m = metinKutusu({
        etiket: "My message to Maya", deger: veri.mesaj, satir: 6, yerTutucu: "Hi Maya! I'd like to swap schools with… because…",
        degisti: (v) => { veri.mesaj = v; veri.kaydet(); sayac.textContent = `${kelimeSay(v)}/25 words`; kontrol(); },
      });
      ctx.kontroller.append(m.el, sayac);
      sayac.textContent = `${kelimeSay(veri.mesaj)}/25 words`;
      ctx.not("<p>Or record it as a voice message and listen to yourself:</p>");
      kaydedici(ctx.kontroller, ctx, EN.kaydedici);
      kontrol();
    },
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Intonation: up or down?",
    cikti: "ENG.10.1.P1",
    anlatim: `
      <p>Our voice goes <b>up ↗</b> or <b>down ↘</b> at the end of a sentence. Statements and wh- questions usually go down. Yes/no questions usually go up.</p>
      <p><b>Question tags</b> are special: if you are sure and expect agreement, the tag goes <b>down</b>. If you are not sure and really ask, it goes <b>up</b>.</p>
      <p>Choose the arrow for each sentence, then listen and repeat. Record yourself and compare.</p>`,
    gorev: "Choose the correct intonation for all <b>seven</b> sentences.",
    ogretmen: "P1 a–d: hedef tonlamanın fark edilmesi, tekrar edilmesi ve kayıt alınıp öz değerlendirme yapılması. Tema hedefi: olumlu/olumsuz cümle, soru ve soru eklerinde tonlama. Ses sentezi tonlamayı her zaman doğal vermez; cümleleri kendi sesinizle model olarak okuyun.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const dogru = new Set();
      const kontrol = () => { if (dogru.size === TONLAMA.length) ctx.gorevTamam(); };
      const liste = el("div", { class: "eng-tonlar" });
      for (const t of TONLAMA) {
        const cizim = el("div", { class: "eng-kontur" });
        const geri = el("div", { class: "ort-geri" });
        const sec = (ton) => {
          const d = ton === t.ton;
          cizim.innerHTML = kontur(ton);
          cizim.className = `eng-kontur ${d ? "dogru" : "yanlis"}`;
          geri.className = `ort-geri ${d ? "dogru" : "yanlis"}`;
          geri.textContent = d ? t.tur : `Listen again. ${t.ton === "yukselen" ? "Is the speaker really asking?" : "Is the speaker sure, or is it a statement?"}`;
          if (d) dogru.add(t.id); else dogru.delete(t.id);
          tik(d ? 880 : 220);
          kontrol();
        };
        liste.append(el("div", { class: "eng-ton", "data-ton": t.id },
          el("div", { class: "eng-ton-metin" }, el("b", {}, t.metin), t.baglam ? el("span", { class: "ort-alt" }, ` ${t.baglam}`) : ""),
          el("div", { class: "d-satir" },
            el("button", { class: "d-btn kucuk", type: "button", "data-sec": "yukselen", onclick: () => sec("yukselen") }, "↗ up"),
            el("button", { class: "d-btn kucuk", type: "button", "data-sec": "dusen", onclick: () => sec("dusen") }, "↘ down"),
            el("button", { class: "d-btn kucuk", type: "button", onclick: () => soyle(ctx, t.metin) }, "🔊 Listen")),
          cizim, geri));
      }
      S.append(kart("Up ↗ or down ↘ at the end?", liste));
      ctx.not("<p><b>Listen, repeat, record.</b> Choose a sentence, say it three times, then record yourself. Does your voice go up or down at the end?</p>");
      kaydedici(ctx.kontroller, ctx, EN.kaydedici);
      ctx.kontroller.append(el("div", { class: "eng-ipucu" },
        el("b", {}, "Social English from the theme"), el("br"),
        "“Rise and shine for school, dear!” ↘ · “Let's catch up during lunchtime!” ↘ · “Don't miss the school bus!” ↘"));
    },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "Before reading: picture clues",
    cikti: "ENG.10.1.R1",
    anlatim: `
      <p>Maya's next episode visits Japan. Before that, read a short magazine article: <b>“${MAKALE_BASLIK}”</b>. Three students describe their mornings: Haruto (Japan), Aino (Finland) and Deniz (Türkiye).</p>
      <p>Look at the three photos. Whose school do you think each photo shows? Then decide if each sentence will be true or false. Use what you know about these countries.</p>`,
    gorev: "Choose a student for every photo and predict <b>true</b> or <b>false</b> for all four sentences.",
    ogretmen: "R1 a–d: okuma öncesi ön bilgi ve görsel ipuçlarıyla tahmin. Japonya'daki iç mekân ayakkabısı (uwabaki) ve sınıf temizliği geleneği, Türkiye'deki bayrak töreni gibi kültürel unsurları sorularla hatırlatın; tahminler 7. adımda kontrol edilir.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const kontrol = () => {
        if (FOTO_TAHMIN.every((f) => veri.okumaFoto[f.id]) && OKUMA_TAHMIN.every((t) => veri.okumaIfade[t.id] !== undefined)) ctx.gorevTamam();
      };
      S.append(kart(`${MAKALE_BASLIK}`, el("p", { class: "eng-giris" }, MAKALE_GIRIS),
        el("div", { class: "eng-resimler" }, FOTO_TAHMIN.map((f, i) => {
          const satir = el("div", { class: "d-satir eng-kisi-sec" });
          for (const [k, ad] of Object.entries(KISILER)) {
            satir.append(el("button", {
              class: "d-btn kucuk", type: "button", "data-foto": `${f.id}|${k}`, "aria-pressed": String(veri.okumaFoto[f.id] === k),
              onclick: (e) => { veri.okumaFoto[f.id] = k; veri.kaydet(); satir.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget))); kontrol(); },
            }, ad.split(" ")[0]));
          }
          return el("figure", {}, RESIM(RESIMLER[["dolap", "muzik", "toren"][i]]), el("figcaption", {}, f.metin), satir);
        }))));
      const ifadeler = el("div", { class: "eng-dy" });
      for (const t of OKUMA_TAHMIN) {
        const satir = el("div", { class: "eng-gorus" }, el("span", {}, t.metin));
        const dugme = (deger, metin) => el("button", {
          class: "d-btn kucuk", type: "button", "data-ifade": `${t.id}|${deger}`, "aria-pressed": String(veri.okumaIfade[t.id] === deger),
          onclick: (e) => { veri.okumaIfade[t.id] = deger; veri.kaydet(); satir.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget))); kontrol(); },
        }, metin);
        satir.append(el("div", { class: "d-satir" }, dugme(true, "True"), dugme(false, "False")));
        ifadeler.append(satir);
      }
      S.append(kart("I think these sentences will be…", ifadeler));
      kontrol();
    },
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Skim and scan",
    cikti: "ENG.10.1.R2",
    anlatim: `
      <p><b>Skimming</b> means reading very quickly for the general idea. Press “Start skimming”: you have <b>20 seconds</b>. Then choose the main idea.</p>
      <p><b>Scanning</b> means looking for one piece of information. Read each question in the panel and <b>tap the answer in the text</b>. Finally, check your predictions.</p>`,
    gorev: "Choose the main idea and find all <b>six</b> answers in the text.",
    ogretmen: "R2 a–d: göz gezdirme (skimming) ile genel odak, tarama (scanning) ile anahtar bilgiler bulunur; ardından tahminler kontrol edilir. Süreyi sınıfın düzeyine göre uzatabilirsiniz; tarama sorularını takım yarışmasına çevirebilirsiniz.",
    kur(ctx) {
      const S = sahneAc(ctx);
      let anaFikir = false, sure = null;
      const geri = el("div", { class: "ort-geri" });
      const soruEl = el("div", { class: "eng-tarama-soru" });
      const sayac = el("div", { class: "eng-sayac" });
      const tahminKart = el("div");
      const makale = makaleGorunumu({ gizliKelime: false, sozcukTik: (t, s) => tara(t, s) });
      const kap = el("div", { class: "eng-okuma gizli" }, makale);
      S.append(kart("Read the article", el("div", { class: "d-satir" },
        el("button", { class: "d-btn ana", type: "button", "data-goz": "1", onclick: basla }, "▶ Start skimming (20 s)"),
        el("button", { class: "d-btn", type: "button", "data-goz-bitti": "1", onclick: bitir }, "I'm done skimming"), sayac), kap), tahminKart);
      function basla() {
        clearInterval(sure);
        kap.className = "eng-okuma";
        let kalan = 20;
        sayac.textContent = `${kalan} s`;
        sure = setInterval(() => { kalan--; sayac.textContent = `${kalan} s`; if (kalan <= 0) bitir(); }, 1000);
      }
      function bitir() {
        clearInterval(sure);
        sayac.textContent = "";
        veri.gozGezdirdi = true; veri.kaydet();
        kap.className = anaFikir ? "eng-okuma" : "eng-okuma bulanik";
        ciz();
      }
      ctx.temizlik(() => clearInterval(sure));
      const siradaki = () => TARAMA.find((q) => !veri.taranan.includes(q.anahtar));
      function tara(t, s) {
        const q = siradaki();
        if (!anaFikir || !q) return;
        if (t.anahtar === q.anahtar) {
          veri.taranan.push(q.anahtar); veri.kaydet();
          makale.querySelectorAll(`[data-anahtar="${q.anahtar}"]`).forEach((x) => x.classList.add("bulundu"));
          geri.className = "ort-geri dogru"; geri.textContent = "Found it!";
          tik(880);
        } else {
          s.classList.add("yanlis"); setTimeout(() => s.classList.remove("yanlis"), 500);
          geri.className = "ort-geri yanlis"; geri.textContent = "Not there. Which paragraph is about this person?";
          tik(220);
        }
        ciz();
      }
      function ciz() {
        veri.taranan.forEach((a) => makale.querySelectorAll(`[data-anahtar="${a}"]`).forEach((x) => x.classList.add("bulundu")));
        const q = siradaki();
        if (!anaFikir) soruEl.textContent = veri.gozGezdirdi ? "Now choose the main idea above." : "Skim the article first.";
        else soruEl.replaceChildren(q ? el("span", {}, el("b", {}, `Scan ${veri.taranan.length + 1}/${TARAMA.length}: `), q.soru) : el("b", {}, "All six answers found!"));
        if (!q && anaFikir) {
          tahminKart.replaceChildren(kart("Check your predictions",
            el("div", { class: "eng-onay" },
              FOTO_TAHMIN.map((f) => {
                const secim = veri.okumaFoto[f.id];
                return el("div", { class: "eng-tahmin secti" }, f.metin, el("em", {}, secim === f.dogru ? " — ✓ You were right" : ` — ✗ It's ${KISILER[f.dogru]}`));
              }),
              OKUMA_TAHMIN.map((t) => {
                const s = veri.okumaIfade[t.id];
                return el("div", { class: "eng-tahmin secti" }, t.metin, el("em", {}, s === undefined ? ` — It's ${t.dogru ? "true" : "false"}` : s === t.dogru ? " — ✓ You were right" : ` — ✗ It's ${t.dogru ? "true" : "false"}`));
              }))));
          ctx.gorevTamam();
        }
      }
      soruKutusu(ctx, { soru: "What is the article mainly about?", liste: GOZ_GEZDIR, aciklama: "Now scan for details." }, (d) => {
        anaFikir = d;
        if (d) kap.className = "eng-okuma";
        ciz();
      });
      ctx.kontroller.append(soruEl, geri);
      ciz();
    },
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Words in context",
    cikti: "ENG.10.1.V1",
    anlatim: `
      <p>The <span class="eng-ornek">underlined words</span> are target words of the theme. Tap a word to see its sentence. Use <b>context clues</b>: the words around it, the topic of the paragraph and the photos.</p>
      <p>Then match each word with its meaning in the cards <b>below the article</b>.</p>`,
    gorev: "Open at least <b>four</b> words in context and match all eight words with their meanings.",
    ogretmen: "V1 d–j: bilinmeyen hedef sözcüklerin bağlamdan (paragraf konusu, cümle ipuçları) anlamlandırılması ve eşleştirme ile doğrulanması. İkili gruplarda önce tahmini anlam yazdırıp sonra eşleştirme yaptırabilirsiniz.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const acilan = new Set();
      let eslesti = false;
      const baglam = el("div", { class: "eng-baglam" }, el("span", { class: "ort-alt" }, "Tap an underlined word in the article."));
      const sayac = el("div", { class: "ort-alt" });
      const kontrol = () => { sayac.textContent = `Words opened in context: ${acilan.size}/8`; if (acilan.size >= 4 && eslesti) ctx.gorevTamam(); };
      const makale = makaleGorunumu({
        kelimeTik: (kelime, p) => {
          acilan.add(kelime);
          makale.querySelectorAll(`[data-kelime="${kelime}"]`).forEach((b) => b.classList.add("acildi"));
          const cumle = cumleBul(p.metin, kelime);
          baglam.replaceChildren(el("b", {}, kelime), el("span", { class: "ort-alt" }, ` · ${p.ad}, ${p.yer}`),
            el("p", { html: cumle.replace(new RegExp(`\\b(${kelime})\\b`, "i"), "<mark>$1</mark>") }));
          kontrol();
        },
      });
      const k = kart("Match the words with their meanings");
      S.append(kart("Read the article", makale), k);
      ctx.kontroller.append(kart("In context", baglam), sayac);
      eslestir(k, {
        metinler: EN.eslestir,
        ciftler: KELIMELER.map((w) => ({ id: w.id, sol: w.kelime, sag: w.tanim })),
        bitti: () => { eslesti = true; kontrol(); },
      });
      kontrol();
    },
  },

  /* 9 ------------------------------------------------------------------ */
  {
    baslik: "Compare the three schools",
    cikti: "ENG.10.1.R3",
    anlatim: `
      <p>Read the article again carefully. Which student does each sentence describe? Some details are said directly, others you need to <b>infer</b>.</p>
      <p>Then answer two “why” questions: look for words like <b>so</b> and <b>because</b>, which show cause and result.</p>`,
    gorev: "Sort all nine sentences and answer both questions correctly.",
    ogretmen: "R3 a–d: sınıflandırma, karşılaştırma, neden-sonuç ilişkisi ve çıkarım. Sınıfça üç okul için bir karşılaştırma tablosu (start time, lunch, clubs, exams) oluşturup tahtaya asın; bu tablo 2. dersin yazma etkinliğinde kullanılacak.",
    kur(ctx) {
      const S = sahneAc(ctx);
      let siniflar = false;
      const cevaplar = new Set();
      const kontrol = () => { if (siniflar && cevaplar.size === OKUMA_CIKARIM.length) ctx.gorevTamam(); };
      const k = kart("Haruto, Aino or Deniz?");
      S.append(k);
      siniflandir(k, {
        ogeler: KARSILASTIR, metinler: EN.siniflandir, sutun: 3,
        kovalar: Object.entries(KISILER).map(([id, baslik]) => ({ id, baslik })),
        bitti: () => { siniflar = true; kontrol(); },
      });
      S.append(kart("The article", makaleGorunumu({ gizliKelime: false })));
      OKUMA_CIKARIM.forEach((s, i) => soruKutusu(ctx, s, (d) => { if (d) cevaplar.add(i); else cevaplar.delete(i); kontrol(); }));
    },
  },

  /* 10 ----------------------------------------------------------------- */
  {
    baslik: "Your school morning",
    cikti: "ENG.10.1.R4",
    anlatim: `
      <p>The magazine wants a <b>fourth</b> school for the article: yours! Write a short paragraph about your school morning.</p>
      <p>Compare your morning with one student from the podcast or the article. The checklist shows what your paragraph needs. You can listen to your paragraph when it's ready.</p>`,
    gorev: "Write at least 40 words and complete every item on the checklist.",
    ogretmen: "R4 a–c ve L4: okuma ve dinleme içeriğinin kişiselleştirilmesi, yeni bir yazılı ürün oluşturulması. Paragrafları sınıf panosunda “Four Schools, Four Mornings” başlığıyla sergileyin. Denetim kural tabanlıdır; dil bilgisi doğruluğunu siz değerlendirin.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const onizleme = el("p");
      const liste = el("div");
      const ciz = () => {
        const d = yansimaDenetle(veri.sabah);
        onizleme.textContent = veri.sabah.trim() || "Your paragraph will appear here, in the magazine.";
        liste.replaceChildren(kontrolListesi(d.maddeler));
        if (d.tamam) ctx.gorevTamam();
      };
      const makale = makaleGorunumu({ gizliKelime: false });
      makale.querySelector("h2").textContent = "Four Schools, Four Mornings";
      makale.querySelector(".eng-profil").before(el("section", { class: "eng-profil yeni" }, el("h3", {}, "You", el("span", {}, " · your town, Türkiye")), onizleme));
      S.append(kart("The magazine page", makale));
      const m = metinKutusu({
        etiket: "My school morning", deger: veri.sabah, satir: 8,
        yerTutucu: "My lessons start at… Every Monday we… Unlike Haruto, I…",
        degisti: (v) => { veri.sabah = v; veri.kaydet(); ciz(); },
      });
      ctx.kontroller.append(m.el, liste,
        el("div", { class: "d-satir" }, el("button", { class: "d-btn", type: "button", onclick: () => veri.sabah.trim() && soyle(ctx, veri.sabah) }, "🔊 Listen to my paragraph")));
      ciz();
    },
  },

  /* 11 ----------------------------------------------------------------- */
  {
    baslik: "Check what you learned",
    anlatim: `
      <p>Eight quick questions about the podcast, the article, the words and the intonation. Read the explanation after each question.</p>
      <p>Get at least <b>6</b> right to complete the lesson.</p>`,
    gorev: "Get at least <b>6/8</b> correct.",
    ogretmen: "Sorular L, R, V ve P çıktılarını yoklar. Tema sonu performans görevi (School Life and Education projesi) için öğrencilerin 10. adımdaki paragraflarını başlangıç noktası olarak kullanabilirsiniz.",
    kur(ctx) {
      sahneAc(ctx);
      ctx.sinav([
        { tur: "coktan", metin: "In the podcast, why does Jack go home only at weekends?", siklar: ["He goes to a boarding school.", "His school is closed on weekdays.", "He works in the dining hall.", "He lives in Kayseri."], dogru: 0, aciklama: "At a boarding school students live at school during the week." },
        { tur: "coktan", metin: "What does Elif do to manage exam stress?", siklar: ["She plays rugby.", "She makes a weekly plan.", "She studies late every night.", "She skips the coding club."], dogru: 1, aciklama: "The counsellor taught her time management: “Now I make a weekly plan.”" },
        { tur: "coktan", metin: "“That's different, isn't it?” Maya is sure and expects Jack to agree. How does the tag sound?", siklar: ["It goes up ↗", "It goes down ↘", "It stays flat", "It is whispered"], dogru: 1, aciklama: "A falling tag checks information the speaker is already sure about." },
        { tur: "coktan", metin: "Which word completes the sentence? “I keep my outdoor shoes in a small ___ by the entrance.”", siklar: ["courtyard", "ceremony", "locker", "canteen"], dogru: 2, aciklama: "A locker is a small cupboard with a door for your things." },
        { tur: "coktan", metin: "At Aino's school, students eat lunch in the canteen because…", siklar: ["lunch is free for everyone.", "the music room is closed.", "they have a quiz.", "they clean the classroom."], dogru: 0, aciklama: "“Lunch is free for all students, so we eat together in the canteen.”" },
        { tur: "coktan", metin: "You read a text very quickly only to find a time or a date. This is called…", siklar: ["skimming", "scanning", "summarising", "translating"], dogru: 1, aciklama: "Scanning = looking for specific information. Skimming = reading quickly for the general idea." },
        { tur: "coktan", metin: "Which student is preparing for a national celebration?", siklar: ["Haruto", "Aino", "Deniz", "Jack"], dogru: 2, aciklama: "Deniz's literature club is preparing a poetry evening for Republic Day on 29 October." },
        { tur: "coktan", metin: "“Today we're having a chemistry quiz, so everyone is revising.” What does revising mean?", siklar: ["cleaning the classroom", "studying again before a test", "singing together", "playing in a band"], dogru: 1, aciklama: "To revise = to study something again before an exam (British English)." },
      ], { baslik: "Schools around the world", gecmeOrani: 0.75 });
    },
  },
];

dersBaslat({ adimlar, sahneKur: (kap) => kap.classList.add("eng-zemin") });
kodlariKisalt();
