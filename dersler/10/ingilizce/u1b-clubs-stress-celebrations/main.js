// 10th grade English · Theme 1: School Life & Education (B) — grammar in use, speaking and writing
// ENG.10.1.G1 grammar · S1–S6 speaking · W1–W7 writing
import { dersBaslat, el } from "../../../../engine/ders.js";
import {
  sahneAc, kart, siniflandir, eslestir, okuyucu, rubrik, radar, kalici, tik, kaydedici,
  EN, kodlariKisalt, kelimeSay, diyalogCal, soyle, metinKutusu, kontrolListesi,
} from "../ortak/ingilizce.js";
import {
  ZAMAN_KARTLARI, ZAMAN_BOSLUK, ETIKET_CUMLELERI, YARDIMCILAR, ZAMIR_LISTESI, IPUCLARI, CIKARIM_BOSLUK, BELIRSIZ_BOSLUK,
  SESLER, DIYALOG, ISLEVLER, ISLEV_KARTLARI, DIYALOG_SORULARI, SORUNLAR, ROL_TURLARI, GUNLER, DUYURU,
  MODEL_YAZI, MODEL_PARAGRAF, MODEL_BOLUMLER, BEYIN_FIRTINASI, YANSIMA_OLCUTLERI,
} from "./icerik.js";
import { soruEki, belirsizAciklama, taslakDenetle, hedefBul, degisenKelime, ONERILER } from "./dilbilgisi.js";
import { SOYUNMA_ODASI, BAYRAKLAR } from "./cizim.js";

const veri = kalici("edu:ing10-u1b-clubs-stress-celebrations:veri", {
  sorun: "sinav", rol: {}, plan: {}, taslak: "", oneriler: [], duzeltilmis: "", yayinlandi: false, rubrik: {}, hedef: null, cikis: "",
});
const RESIM = (svg, sinif = "") => el("div", { class: `eng-resim ${sinif}`.trim(), html: svg });
const ROL_SES = { A: { dil: "en-US", hiz: 0.95 }, B: { dil: "en-GB", hiz: 0.92 } };
const SIKLIK = /\b(always|usually|often|sometimes|never|rarely|every (day|night|week|morning))\b/i;

/** Gap sentence with choice buttons and instant feedback */
function boslukSatiri(o, sonuc) {
  const bosluk = el("span", { class: "eng-bosluk" }, "_____");
  const [once, sonra] = o.cumle.split("___");
  const geri = el("div", { class: "ort-geri" });
  const satir = el("div", { class: "eng-bosluk-satir", "data-bosluk": o.id },
    el("div", { class: "eng-bosluk-cumle" }, once, bosluk, sonra),
    el("div", { class: "d-satir" }, o.secenekler.map((s) => el("button", {
      class: "d-btn kucuk", type: "button", "data-secim": s,
      onclick: () => {
        const d = s === o.dogru;
        bosluk.textContent = s;
        bosluk.className = `eng-bosluk ${d ? "dogru" : "yanlis"}`;
        geri.className = `ort-geri ${d ? "dogru" : "yanlis"}`;
        geri.textContent = d ? (o.neden || "Correct!") : (o.aciklama?.(s) || "Not quite. Read the sentence and the clues again.");
        tik(d ? 880 : 220);
        sonuc(d);
      },
    }, s))),
    geri);
  return satir;
}

/** Multiple-choice question in the panel */
function soruKutusu(ctx, s, sonuc) {
  const geri = el("div", { class: "ort-geri" });
  ctx.secenekler({
    etiket: s.soru, liste: s.liste, deger: null,
    degisti: (v) => {
      const d = v === "dogru";
      geri.className = `ort-geri ${d ? "dogru" : "yanlis"}`;
      geri.textContent = d ? `Correct! ${s.aciklama || ""}` : s.yanlis || "Not quite. Look at the text again.";
      tik(d ? 880 : 220);
      sonuc(d);
    },
  });
  ctx.kontroller.append(geri);
}

/** Highlights frequency adverbs, -ing forms and theme words in a preview */
function vurgulu(metin) {
  const kacir = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let h = kacir(metin);
  const hedefler = hedefBul(metin).sort((a, b) => b.length - a.length);
  for (const w of hedefler) h = h.replace(new RegExp(`\\b(${w.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}s?)\\b`, "gi"), "\u0001$1\u0002");
  h = h.replace(/\u0001/g, '<b class="eng-v-hedef">').replace(/\u0002/g, "</b>");
  h = h.replace(/\b(always|usually|often|sometimes|never|rarely|normally)\b/gi, '<u class="eng-v-siklik">$1</u>');
  h = h.replace(/\b((?:am|is|are|'m|'re|'s) (?:\w+ )?\w+ing)\b/gi, '<i class="eng-v-surekli">$1</i>');
  return h.split(/\n+/).filter((p) => p.trim()).map((p) => `<p>${p}</p>`).join("") || '<p class="ort-alt">Your blog post will appear here.</p>';
}

/* ======================================================================== */
const adimlar = [
  /* 1 ------------------------------------------------------------------ */
  {
    baslik: "Every day or right now?",
    cikti: "ENG.10.1.G1",
    anlatim: `
      <p>Read the sentences from school life. Some describe <b>routines</b> (what usually happens). Others describe something happening <b>now</b> or only <b>these days</b>.</p>
      <p>Sort them, then find the rule. Look at the signal words: <i>every morning, usually, right now, look!, this term…</i></p>
      <p>Finally, choose the correct verb form in five sentences.</p>`,
    gorev: "Sort the eight sentences, choose the rule and complete all five gaps.",
    ogretmen: "G1 a–h: tümevarım. Program önce bağlam içinde örnek cümlelerin incelenmesini, ortak özelliklerin bulunmasını ve kuralın öğrencilerce formüle edilmesini öneriyor. Kural seçildikten sonra boşluk doldurmaya geçin; sıklık zarflarının yerine (always arrive) dikkat çekin.",
    kur(ctx) {
      const S = sahneAc(ctx);
      let siniflar = false, kural = false;
      const dogru = new Set();
      const kontrol = () => { if (siniflar && kural && dogru.size === ZAMAN_BOSLUK.length) ctx.gorevTamam(); };
      const k = kart("Usually or now?");
      S.append(k);
      siniflandir(k, {
        ogeler: ZAMAN_KARTLARI, metinler: EN.siniflandir, sutun: 2,
        kovalar: [{ id: "rutin", baslik: "Routines and facts" }, { id: "simdi", baslik: "Now or these days (temporary)" }],
        bitti: () => { siniflar = true; kontrol(); },
      });
      const g = kart("Choose the verb form");
      g.append(el("div", { class: "eng-bosluklar" }, ZAMAN_BOSLUK.map((o) => boslukSatiri(o, (d) => { if (d) dogru.add(o.id); else dogru.delete(o.id); kontrol(); }))));
      S.append(g);
      soruKutusu(ctx, {
        soru: "We use the present progressive (am / is / are + -ing) for…",
        liste: [
          { deger: "dogru", metin: "actions happening now or for a limited time" },
          { deger: "rutin", metin: "habits and routines" },
          { deger: "gercek", metin: "timetables and facts" },
        ],
        aciklama: "And the present simple is for routines, habits, timetables and facts.",
      }, (d) => { kural = d; kontrol(); });
    },
  },

  /* 2 ------------------------------------------------------------------ */
  {
    baslik: "The question tag machine",
    cikti: "ENG.10.1.G1",
    anlatim: `
      <p>We add a <b>question tag</b> to check information or to keep a conversation going: <i>“The canteen opens at twelve, doesn't it?”</i></p>
      <p>Build each tag: choose the <b>auxiliary</b> (do, does, is, are, can…) and the <b>pronoun</b>. A positive sentence takes a negative tag; a negative sentence takes a positive tag.</p>`,
    gorev: "Build the correct tag for all <b>seven</b> sentences.",
    ogretmen: "Tema hedefi: geniş zaman ve şimdiki zaman için soru ekleri. Etiket kural tabanlı olarak hesaplanır (yardımcı fiil + özne zamiri; olumlu → olumsuz). “I am …, aren't I?” istisnasını ve “My friends and I → we” dönüşümünü sınıfla tartışın. Ardından 1. dersteki tonlama adımına dönerek etiketleri ↘/↗ okuyun.",
    kur(ctx) {
      const S = sahneAc(ctx);
      let simdi = 0, yard = null, zamir = null;
      const tamamlanan = [];
      const cumleEl = el("div", { class: "eng-makine-cumle" });
      const slot1 = el("span", { class: "eng-slot" }, "___"), slot2 = el("span", { class: "eng-slot" }, "___");
      const geri = el("div", { class: "ort-geri" });
      const ilerleme = el("div", { class: "eng-noktalar" });
      const liste = el("ol", { class: "eng-etiket-listesi" });
      const yardDugme = el("div", { class: "eng-cipler" }, YARDIMCILAR.map((y) => el("button", { class: "ort-cip", type: "button", "data-yard": y, onclick: () => { yard = y; ciz(); } }, y)));
      const zamirDugme = el("div", { class: "eng-cipler" }, ZAMIR_LISTESI.map((z) => el("button", { class: "ort-cip", type: "button", "data-zamir": z, onclick: () => { zamir = z; ciz(); } }, z)));
      S.append(kart("Question tag machine", ilerleme, el("div", { class: "eng-makine" }, cumleEl, el("div", { class: "eng-makine-etiket" }, slot1, " ", slot2, "?")),
        el("div", { class: "ort-alt" }, "1. Auxiliary"), yardDugme, el("div", { class: "ort-alt" }, "2. Pronoun"), zamirDugme,
        el("div", { class: "d-satir" }, el("button", { class: "d-btn ana", type: "button", "data-etiket-kontrol": "1", onclick: kontrolEt }, "Check the tag"), geri)),
      kart("My tags", liste));
      function ciz() {
        const c = ETIKET_CUMLELERI[simdi];
        cumleEl.textContent = c ? c.cumle : "All seven tags are correct!";
        slot1.parentElement.hidden = !c;
        slot1.textContent = yard || "___"; slot2.textContent = zamir || "___";
        yardDugme.querySelectorAll("button").forEach((b) => b.classList.toggle("secili", b.dataset.yard === yard));
        zamirDugme.querySelectorAll("button").forEach((b) => b.classList.toggle("secili", b.dataset.zamir === zamir));
        ilerleme.replaceChildren(...ETIKET_CUMLELERI.map((_, i) => el("i", { class: i < tamamlanan.length ? "dogru" : i === simdi ? "simdi" : "" })));
        liste.replaceChildren(...tamamlanan.map((t) => el("li", {}, t.cumle, " ", el("b", {}, t.etiket))));
      }
      function kontrolEt() {
        const c = ETIKET_CUMLELERI[simdi];
        if (!c) return;
        const beklenen = soruEki(c.cumle, c.ozne);
        if (!yard || !zamir) { geri.className = "ort-geri yanlis"; geri.textContent = "Choose an auxiliary and a pronoun."; return; }
        if (yard === beklenen.yardimci && zamir === beklenen.zamir) {
          tamamlanan.push({ cumle: c.cumle, etiket: beklenen.etiket });
          geri.className = "ort-geri dogru"; geri.textContent = `Yes: ${c.cumle} ${beklenen.etiket}`;
          tik(880);
          simdi++; yard = zamir = null;
          if (simdi === ETIKET_CUMLELERI.length) ctx.gorevTamam();
        } else {
          const ipucu = yard !== beklenen.yardimci
            ? (/n't/.test(c.cumle) ? "The sentence is negative, so the tag is positive." : "The sentence is positive, so the tag is negative. Which auxiliary does the verb use?")
            : "Check the pronoun: who or what is the subject?";
          geri.className = "ort-geri yanlis"; geri.textContent = ipucu;
          tik(220);
        }
        ciz();
      }
      ciz();
      ctx.not("<p><b>Remember</b></p><p>practise → <i>don't they?</i> · arrives → <i>doesn't he?</i><br>isn't serving → <i>is it?</i> · can't attend → <i>can she?</i><br>I am → <i>aren't I?</i></p>");
    },
  },

  /* 3 ------------------------------------------------------------------ */
  {
    baslik: "School detective: must, can't, something, anything",
    cikti: "ENG.10.1.G1",
    anlatim: `
      <p>It's 4 p.m. and you are looking for your friends. Read the clues and make <b>deductions</b>: <i>must</i> = I'm almost sure it's true; <i>can't</i> = I'm sure it's impossible.</p>
      <p>Then complete the school notices with <b>something</b>, <b>anything</b> or <b>nothing</b>.</p>`,
    gorev: "Complete all four deductions and all five sentences correctly.",
    ogretmen: "Tema hedefleri: çıkarım için must/can't ve something/anything/nothing. Yanlış seçimde verilen açıklama kural tabanlıdır (olumsuz yan cümlede anything; soruda anything; olumlu cümlede something/nothing anlama göre). Öğrencilerden kendi okulları için yeni bir ipucu kartı yazmalarını isteyebilirsiniz.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const dogru = new Set();
      const kontrol = () => { if (dogru.size === CIKARIM_BOSLUK.length + BELIRSIZ_BOSLUK.length) ctx.gorevTamam(); };
      const sonuc = (id) => (d) => { if (d) dogru.add(id); else dogru.delete(id); kontrol(); };
      S.append(kart("The clues", el("div", { class: "eng-dedektif" }, RESIM(SOYUNMA_ODASI),
        el("ul", { class: "eng-ipuclari" }, IPUCLARI.map((i) => el("li", {}, i))))));
      S.append(kart("Deductions: must or can't?", el("div", { class: "eng-bosluklar" },
        CIKARIM_BOSLUK.map((o) => boslukSatiri({ ...o, secenekler: ["must", "can't"] }, sonuc(o.id))))));
      S.append(kart("School notices: something, anything or nothing?", el("div", { class: "eng-bosluklar" },
        BELIRSIZ_BOSLUK.map((o) => boslukSatiri({
          ...o, secenekler: ["something", "anything", "nothing"],
          aciklama: (s) => belirsizAciklama(o.cumle, s) || "Grammatically possible, but think about the meaning.",
        }, sonuc(o.id))))));
      ctx.not(`<p><b>Rule check</b></p><p>Negative sentence → <i>anything</i><br>Question → <i>anything</i><br>Positive sentence → <i>something</i> (or <i>nothing</i> = not anything)</p>`);
    },
  },

  /* 4 ------------------------------------------------------------------ */
  {
    baslik: "Model talk: at the counsellor's office",
    cikti: "ENG.10.1.S1–S2",
    anlatim: `
      <p>Mert is a perfectionist and he has a chemistry exam on Friday. Listen to his conversation with Ms Aksoy, the school counsellor.</p>
      <p>This is a <b>model</b> for your own role-play. Notice how they talk about feelings, describe routines, give advice and check information with question tags. Sort the sentences by their function.</p>`,
    gorev: "Listen to the conversation, answer both questions and sort the eight sentences.",
    ogretmen: "S1–S2: konuşma öncesi hazırlık ve model konuşmanın çözümlenmesi. Diyaloğu ikili gruplarla rollere ayrılarak okutun; okul rehber öğretmeninizi derse davet ederek sınav kaygısı ve zaman yönetimi üzerine kısa bir sohbet yapılabilir (disiplinler arası: Rehberlik).",
    kur(ctx) {
      const S = sahneAc(ctx);
      const oku = okuyucu(ctx);
      let dinlendi = false, siniflar = false;
      const cevap = new Set();
      const kontrol = () => { if (dinlendi && siniflar && cevap.size === DIYALOG_SORULARI.length) ctx.gorevTamam(); };
      const satirlar = el("div", { class: "eng-dokum acik" }, DIYALOG.map((s) => el("p", {}, el("b", { class: s.kim === "Mert" ? "eng-a" : "eng-b" }, `${s.kim}: `), s.metin)));
      const durum = el("span", { class: "ort-alt" });
      S.append(kart("Mert and Ms Aksoy", el("div", { class: "d-satir" },
        el("button", { class: "d-btn ana", type: "button", "data-oynat": "1", onclick: async () => {
          const bitti = await diyalogCal(oku, DIYALOG, SESLER, (i) => satirlar.querySelectorAll("p").forEach((p, j) => p.classList.toggle("okunuyor", i === j)));
          if (bitti) { dinlendi = true; durum.textContent = "Finished."; kontrol(); }
        } }, "▶ Play the conversation"),
        el("button", { class: "d-btn", type: "button", onclick: () => oku.durdur() }, "■ Stop"), durum), satirlar));
      const k = kart("What is each sentence doing?");
      S.append(k);
      siniflandir(k, { ogeler: ISLEV_KARTLARI, kovalar: ISLEVLER, metinler: EN.siniflandir, sutun: 2, bitti: () => { siniflar = true; kontrol(); } });
      DIYALOG_SORULARI.forEach((s, i) => soruKutusu(ctx, s, (d) => { if (d) cevap.add(i); else cevap.delete(i); kontrol(); }));
      ctx.not("<p><b>Useful language</b></p><p>You look worried. Is anything wrong?<br>Why don't you…? · You should… · Try to…<br>I feel… when… · Let's catch up again next week.</p>");
    },
  },

  /* 5 ------------------------------------------------------------------ */
  {
    baslik: "Role-play builder",
    cikti: "ENG.10.1.S3–S4",
    anlatim: `
      <p>Now it's your turn. Choose a <b>problem</b>, then build a six-turn conversation between you (A) and a friend (B). Choose the line that fits best in each turn.</p>
      <p>Then <b>perform</b> it: listen to the computer version, practise with a partner and record yourselves.</p>`,
    gorev: "Choose all six lines (with advice that fits and at least one frequency word) and perform the conversation once.",
    ogretmen: "S3–S4: modele uygun, anlamlı ve doğru sözlü ürün oluşturma. Satır bankası iskele görevi görür; güçlü öğrencilerden satırları kendi cümleleriyle değiştirmelerini isteyin. Uygunsuz tavsiye (uyumayı bırakmak) bilerek konmuş bir çeldiricidir.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const oku = okuyucu(ctx);
      let oynandi = false;
      const turlar = el("div", { class: "eng-turlar" });
      const senaryo = el("div", { class: "eng-dokum acik" });
      const liste = el("div");
      const secenek = (i) => {
        const t = ROL_TURLARI[i];
        if (t.ortak) return t.ortak;
        if (t.sorun) return t.sorun[veri.sorun];
        return t.tavsiye.map((x) => x.metin);
      };
      const durumlar = () => {
        const secili = ROL_TURLARI.map((_, i) => veri.rol[i]);
        const tavsiye = ROL_TURLARI[4].tavsiye.find((x) => x.metin === veri.rol[4]);
        return [
          { metin: "All six turns are chosen", tamam: secili.every(Boolean) },
          { metin: "The advice fits the problem", tamam: !!tavsiye && tavsiye.uygun.includes(veri.sorun) },
          { metin: "At least one frequency word (always, usually, every…)", tamam: secili.some((s) => s && SIKLIK.test(s)) },
          { metin: "Performed once (▶ Perform)", tamam: oynandi },
        ];
      };
      function ciz() {
        veri.kaydet();
        turlar.replaceChildren(...ROL_TURLARI.map((t, i) => el("div", { class: "eng-tur", "data-tur": String(i) },
          el("div", { class: "eng-tur-baslik" }, el("b", { class: t.kim === "A" ? "eng-a" : "eng-b" }, t.kim), ` ${t.etiket}`),
          el("div", { class: "eng-cipler" }, secenek(i).map((m, j) => el("button", {
            class: `ort-cip${veri.rol[i] === m ? " secili" : ""}`, type: "button", "data-satir": `${i}|${j}`,
            onclick: () => { veri.rol[i] = m; oynandi = false; ciz(); },
          }, m))))));
        senaryo.replaceChildren(...ROL_TURLARI.map((t, i) => el("p", {}, el("b", { class: t.kim === "A" ? "eng-a" : "eng-b" }, `${t.kim}: `), veri.rol[i] || "…")));
        const d = durumlar();
        liste.replaceChildren(kontrolListesi(d));
        const tavsiye = ROL_TURLARI[4].tavsiye.find((x) => x.metin === veri.rol[4]);
        if (tavsiye && !tavsiye.uygun.includes(veri.sorun)) liste.append(el("div", { class: "ort-geri yanlis" }, "Does this advice really help with your problem? Choose again."));
        if (d.every((x) => x.tamam)) ctx.gorevTamam();
      }
      S.append(kart(`Problem: “${SORUNLAR[veri.sorun]}”`, turlar));
      S.append(kart("Our role-play", senaryo, el("div", { class: "d-satir" },
        el("button", { class: "d-btn ana", type: "button", "data-perform": "1", onclick: async () => {
          const satirlar = ROL_TURLARI.map((t, i) => ({ kim: t.kim, metin: veri.rol[i] })).filter((s) => s.metin);
          if (satirlar.length < ROL_TURLARI.length) return;
          const bitti = await diyalogCal(oku, satirlar, ROL_SES, (i) => senaryo.querySelectorAll("p").forEach((p, j) => p.classList.toggle("okunuyor", i === j)));
          if (bitti) { oynandi = true; ciz(); }
        } }, "▶ Perform"),
        el("button", { class: "d-btn", type: "button", onclick: () => oku.durdur() }, "■ Stop"))));
      ctx.secenekler({
        etiket: "Choose a problem", deger: veri.sorun,
        liste: Object.entries(SORUNLAR).map(([deger, metin]) => ({ deger, metin })),
        degisti: (v) => {
          veri.sorun = v; delete veri.rol[1]; delete veri.rol[2]; oynandi = false;
          S.querySelector(".ort-baslik").textContent = `Problem: “${SORUNLAR[v]}”`;
          ciz();
        },
      });
      ctx.kontroller.append(liste);
      ctx.not("<p>Practise with a partner, then record your performance:</p>");
      kaydedici(ctx.kontroller, ctx, EN.kaydedici);
      ciz();
    },
  },

  /* 6 ------------------------------------------------------------------ */
  {
    baslik: "National days: school radio",
    cikti: "ENG.10.1.S5",
    anlatim: `
      <p>Our school celebrates national and religious days together. Match each day with what we remember or celebrate.</p>
      <p>Then prepare an <b>announcement</b> for the school radio: choose a day, an event, a place, a time and the organiser. Read it aloud as if you were on the radio!</p>`,
    gorev: "Match all seven days, complete the announcement and read it on the radio.",
    ogretmen: "S5: içeriğin farklı bağlamda yeniden yapılandırılması. Program bu temada 29 Ekim, 23 Nisan, 19 Mayıs, 30 Ağustos, 15 Temmuz ile Ramazan ve Kurban bayramlarının işlenmesini öngörüyor. Duyurularda planlanmış gelecek için şimdiki zaman (is organising) kullanıldığına dikkat çekin; duyuruları okul radyosunda/anons sisteminde gerçekten okutabilirsiniz.",
    kur(ctx) {
      const S = sahneAc(ctx);
      let eslesti = false, okundu = false;
      const secim = { gun: null, etkinlik: null, yer: null, saat: null, duzenleyen: null };
      const metin = el("p", { class: "eng-radyo-metin" });
      const kontrol = () => { if (eslesti && okundu && Object.values(secim).every(Boolean)) ctx.gorevTamam(); };
      const duyuru = () => {
        if (!Object.values(secim).every(Boolean)) return "";
        const g = GUNLER.find((x) => x.id === secim.gun);
        const ad = g.sol.includes(" · ") ? g.sol.split(" · ")[1] : g.sol;
        return g.tarih
          ? `Good morning, everyone! This is your school radio. On ${g.tarih}, we celebrate ${ad}. This year, the ${secim.duzenleyen} is organising ${secim.etkinlik} in the ${secim.yer} at ${secim.saat}. Everyone is welcome, so don't miss it!`
          : `Good morning, everyone! This is your school radio. ${ad} is coming soon, and the ${secim.duzenleyen} is organising ${secim.etkinlik} in the ${secim.yer} at ${secim.saat} before the holiday. Everyone is welcome, so don't miss it!`;
      };
      const ciz = () => { metin.textContent = duyuru() || "Choose all five parts in the panel to write your announcement."; kontrol(); };
      S.append(el("div", { class: "eng-bant", html: BAYRAKLAR }));
      const k = kart("What do we celebrate?");
      S.append(k);
      eslestir(k, { ciftler: GUNLER.map(({ id, sol, sag }) => ({ id, sol, sag })), metinler: EN.eslestir, solBaslik: "Day", sagBaslik: "What we remember or celebrate", bitti: () => { eslesti = true; kontrol(); } });
      S.append(kart("📻 School radio", metin, el("div", { class: "d-satir" },
        el("button", { class: "d-btn ana", type: "button", "data-radyo": "1", onclick: async () => { const t = duyuru(); if (!t) return; await soyle(ctx, t); okundu = true; kontrol(); } }, "🔊 Read it on the radio"))));
      ctx.secenekler({ etiket: "Day", deger: null, liste: GUNLER.map((g) => ({ deger: g.id, metin: g.sol.split(" · ")[1] ? `${g.sol.split(" · ")[0]}` : g.sol.split(" (")[0] })), degisti: (v) => { secim.gun = v; okundu = false; ciz(); } });
      for (const [anahtar, etiket] of [["etkinlik", "Event"], ["yer", "Place"], ["saat", "Time"], ["duzenleyen", "Organiser"]]) {
        ctx.secenekler({ etiket, deger: null, liste: DUYURU[anahtar].map((m) => ({ deger: m, metin: m })), degisti: (v) => { secim[anahtar] = v; okundu = false; ciz(); } });
      }
      ciz();
    },
  },

  /* 7 ------------------------------------------------------------------ */
  {
    baslik: "Read the model blog post",
    cikti: "ENG.10.1.W1–W2",
    anlatim: `
      <p>Our school has a <b>partner school</b> in Portugal. Students write blog posts to each other. Read Zeynep's post: it is a model for your own post.</p>
      <p>First decide the <b>purpose</b> and the <b>reader</b> of the post. Then sort the sentences into the parts of the post and count the frequency adverbs.</p>`,
    gorev: "Choose the purpose and the reader, sort the eight sentences and count the frequency adverbs.",
    ogretmen: "W1: yazma görevinin amacını ve okurunu anlama. W2: modeldeki temel bileşenlerin (sözcük seçimi, yapı, düzen) kavranması. Model yazıyı paragraf paragraf renklendirerek tahtaya yansıtın; öğrencilerin kendi yazılarında aynı iskeleti kullanacaklarını belirtin.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const durum = { amac: false, okur: false, siniflar: false, sayi: false };
      const kontrol = () => { if (Object.values(durum).every(Boolean)) ctx.gorevTamam(); };
      S.append(kart("Zeynep's blog post", el("div", { class: "eng-blog" },
        MODEL_PARAGRAF.map((p) => el("p", {}, p.map((id) => MODEL_YAZI.find((m) => m.id === id).metin).join(" "))))));
      const k = kart("Which part of the post is it?");
      S.append(k);
      siniflandir(k, { ogeler: MODEL_YAZI, kovalar: MODEL_BOLUMLER, metinler: EN.siniflandir, sutun: 3, bitti: () => { durum.siniflar = true; kontrol(); } });
      soruKutusu(ctx, {
        soru: "Why is Zeynep writing?",
        liste: [
          { deger: "dogru", metin: "To tell students abroad about her school life" },
          { deger: "sikayet", metin: "To complain about exams" },
          { deger: "haber", metin: "To report news for a newspaper" },
        ],
      }, (d) => { durum.amac = d; kontrol(); });
      soruKutusu(ctx, {
        soru: "Who will read it?",
        liste: [
          { deger: "mudur", metin: "Her headmaster" },
          { deger: "dogru", metin: "Students at a partner school in another country" },
          { deger: "aile", metin: "Her family" },
        ],
        aciklama: "So the style is friendly, with questions to the reader.",
      }, (d) => { durum.okur = d; kontrol(); });
      ctx.sayiSorusu({
        etiket: "How many <b>frequency adverbs</b> (always, usually, often…) does Zeynep use?",
        kontrol: (v) => { const d = v === 4; durum.sayi = d; kontrol(); return d || "Count again: usually, always, often…"; },
        dogruMesaj: "Yes: usually, always, often, sometimes.",
      });
    },
  },

  /* 8 ------------------------------------------------------------------ */
  {
    baslik: "Plan and draft your post",
    cikti: "ENG.10.1.W3–W4",
    anlatim: `
      <p>Now write your own blog post for the partner school. First <b>brainstorm</b>: choose ideas from each group.</p>
      <p>Then write your <b>draft</b> in the panel. The live checklist and the colours in the preview help you: <u class="eng-v-siklik">frequency adverbs</u>, <i class="eng-v-surekli">is/are + -ing</i> and <b class="eng-v-hedef">theme words</b>.</p>`,
    gorev: "Choose ideas from all five groups and write a draft that completes the whole checklist.",
    ogretmen: "W3: beyin fırtınası, planlama, taslak oluşturma. W4: hedef sözcük ve yapıların kullanılması, iletinin okura açık aktarılması. Denetim listesi kural tabanlıdır; dil bilgisi doğruluğunu ve içeriğin özgünlüğünü siz değerlendirin. Taslaklar cihazda saklanır.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const onizleme = el("div", { class: "eng-blog" });
      const planEl = el("div", { class: "eng-plan" });
      const liste = el("div");
      const planTamam = () => BEYIN_FIRTINASI.every((g) => (veri.plan[g.id] || []).length > 0);
      const ciz = () => {
        veri.kaydet();
        const d = taslakDenetle(veri.taslak);
        onizleme.innerHTML = vurgulu(veri.taslak);
        liste.replaceChildren(kontrolListesi([{ metin: "Ideas chosen from all five groups", tamam: planTamam() }, ...d.maddeler]));
        planEl.replaceChildren(...BEYIN_FIRTINASI.map((g) => el("div", { class: "eng-plan-grup" }, el("div", { class: "ort-alt" }, g.etiket),
          el("div", { class: "eng-cipler" }, g.secenekler.map((s) => el("button", {
            class: `ort-cip${(veri.plan[g.id] || []).includes(s) ? " secili" : ""}`, type: "button", "data-fikir": `${g.id}|${s}`,
            onclick: () => {
              const l = veri.plan[g.id] || [];
              veri.plan[g.id] = g.tek ? [s] : l.includes(s) ? l.filter((x) => x !== s) : [...l, s];
              ciz();
            },
          }, s))))));
        if (planTamam() && d.tamam) ctx.gorevTamam();
      };
      S.append(kart("Brainstorm", planEl), kart("Preview", onizleme));
      const m = metinKutusu({
        etiket: "My blog post", deger: veri.taslak, satir: 12, yerTutucu: "Hi everyone at our partner school!\n\nMy name is…",
        degisti: (v) => { veri.taslak = v; ciz(); },
      });
      ctx.kontroller.append(m.el, el("div", { class: "d-satir" }, el("button", {
        class: "d-btn", type: "button", "data-iskelet": "1",
        onclick: () => {
          if (m.t.value.trim()) return;
          const p = (id, i = 0) => (veri.plan[id] || [])[i] || "…";
          m.t.value = `Hi everyone at our partner school!\n\nMy name is … and I go to ${p("tur")} in …. Our school has a ${p("olanak")}${veri.plan.olanak?.[1] ? ` and a ${p("olanak", 1)}` : ""}.\n\nEvery day… I usually… On …s I go to the ${p("kulup")}.\n\nThese days we are ${p("simdi")}.\n\nBefore exams I… My tip: ${p("ipucu")}.\n\nWhat is your school like? Write soon!`;
          veri.taslak = m.t.value; ciz();
        },
      }, "Insert a starter outline")), liste);
      ciz();
    },
  },

  /* 9 ------------------------------------------------------------------ */
  {
    baslik: "Feedback, revise and publish",
    cikti: "ENG.10.1.W5–W6",
    anlatim: `
      <p>Your partner read your draft and left some <b>suggestions</b>. Choose at least two suggestions you agree with and <b>revise</b> your post in the panel.</p>
      <p>When your revised post still meets the checklist, <b>publish</b> it on the class blog for the partner school.</p>`,
    gorev: "Choose two suggestions, use them in your revised post and publish it.",
    ogretmen: "W5: geri bildirimin eleştirel incelenmesi ve metnin yeniden düzenlenmesi. W6: yeniden yapılandırılmış metnin paylaşılması. Öneriler kural tabanlıdır (because, nesne zamiri, millî gün, soru eki, ek tema sözcükleri). Gerçek akran geri bildirimi için yazıları sıra arkadaşlarıyla değiştirtin.",
    kur(ctx) {
      const S = sahneAc(ctx);
      if (!veri.duzeltilmis.trim()) veri.duzeltilmis = veri.taslak;
      const ilk = veri.taslak;
      const acik = ONERILER.filter((o) => !o.kontrol(ilk, ilk));
      const gerekli = Math.max(1, Math.min(2, acik.length));
      veri.oneriler = veri.oneriler.filter((id) => acik.some((o) => o.id === id));
      const oneriEl = el("div", { class: "eng-oneriler" });
      const liste = el("div");
      const yayin = el("div");
      const yayinBtn = el("button", { class: "d-btn ana", type: "button", "data-yayinla": "1", onclick: () => { veri.yayinlandi = true; ciz(); } }, "📢 Publish to the class blog");
      const durumlar = () => {
        const d = taslakDenetle(veri.duzeltilmis);
        const secilen = acik.filter((o) => veri.oneriler.includes(o.id));
        return [
          { metin: `At least ${gerekli} suggestion${gerekli > 1 ? "s" : ""} chosen`, tamam: secilen.length >= gerekli },
          { metin: "Your chosen suggestions are used in the revised post", tamam: secilen.length > 0 && secilen.every((o) => o.kontrol(veri.duzeltilmis, ilk)) },
          { metin: `At least 5 words changed (${degisenKelime(ilk, veri.duzeltilmis)} now)`, tamam: degisenKelime(ilk, veri.duzeltilmis) >= 5 },
          { metin: "The revised post still meets the writing checklist", tamam: d.tamam },
        ];
      };
      function ciz() {
        veri.kaydet();
        oneriEl.replaceChildren(...acik.map((o) => {
          const c = el("input", { type: "checkbox", "data-oneri": o.id, checked: veri.oneriler.includes(o.id) });
          c.addEventListener("change", () => { veri.oneriler = c.checked ? [...veri.oneriler, o.id] : veri.oneriler.filter((x) => x !== o.id); ciz(); });
          const kullanildi = o.kontrol(veri.duzeltilmis, ilk);
          return el("label", { class: `eng-oneri${kullanildi ? " kullanildi" : ""}` }, c, el("span", {}, "💬 ", o.metin), el("em", {}, kullanildi ? "✓ used" : ""));
        }), ...(acik.length ? [] : [el("div", { class: "ort-alt" }, "Your draft already does everything your partner wanted to suggest. Great!")]));
        const d = durumlar();
        liste.replaceChildren(kontrolListesi(d));
        const hazir = d.every((x) => x.tamam);
        yayinBtn.disabled = !hazir;
        if (veri.yayinlandi && !hazir) veri.yayinlandi = false;
        yayin.replaceChildren(veri.yayinlandi
          ? kart("Class blog · Partner school exchange", el("div", { class: "eng-blog yayin", html: vurgulu(veri.duzeltilmis) }), el("div", { class: "ort-alt" }, `Published · ${kelimeSay(veri.duzeltilmis)} words`))
          : "");
        if (veri.yayinlandi) ctx.gorevTamam();
      }
      if (!ilk.trim()) S.append(kart("No draft yet", el("p", { class: "ort-alt" }, "Write your draft in step 8 first. It will appear in the panel here, ready to revise.")));
      S.append(kart("Your partner's suggestions", oneriEl), yayin);
      const m = metinKutusu({ etiket: "My revised post", deger: veri.duzeltilmis, satir: 12, degisti: (v) => { veri.duzeltilmis = v; ciz(); } });
      ctx.kontroller.append(m.el, liste, el("div", { class: "d-satir" }, yayinBtn));
      ciz();
    },
  },

  /* 10 ----------------------------------------------------------------- */
  {
    baslik: "Reflect on speaking and writing",
    cikti: "ENG.10.1.W7 · S6",
    anlatim: `
      <p>Look back at your role-play (step 5), your radio announcement (step 6) and your blog post (step 9). How did you do?</p>
      <p>Rate yourself from 1 to 4, choose a goal for the next theme and write a short exit ticket.</p>`,
    gorev: "Rate all six skills, choose a goal and write an exit ticket of at least 15 words.",
    ogretmen: "W7 ve S6: yazma ve konuşma süreçlerine ilişkin düşünce ve duyguların gözden geçirilip paylaşılması. Radar grafiğini öğrenci portfolyosuna ekletin; tema sonu performans görevinin (School Life and Education projesi) dereceli puanlama anahtarıyla karşılaştırın.",
    kur(ctx) {
      const S = sahneAc(ctx);
      const radarKap = el("div", { class: "eng-radar" });
      const kontrol = () => {
        radarKap.replaceChildren(radar(YANSIMA_OLCUTLERI, [{ degerler: veri.rubrik, renk: "#ffb547" }]));
        veri.kaydet();
        if (YANSIMA_OLCUTLERI.every((o) => veri.rubrik[o.ad]) && veri.hedef && kelimeSay(veri.cikis) >= 15) ctx.gorevTamam();
      };
      S.append(kart("My speaking and writing profile", radarKap));
      const k = el("div");
      ctx.kontroller.append(k);
      rubrik(k, { olcutler: YANSIMA_OLCUTLERI, seviyeler: ["Not yet", "Getting there", "Good", "Very good"], degerler: veri.rubrik, degisti: kontrol });
      ctx.secenekler({
        etiket: "My goal for the next theme", deger: veri.hedef,
        liste: ["Use more question tags when I speak", "Plan my writing before I start", "Learn five new theme words every week", "Record myself and check my intonation"].map((m) => ({ deger: m, metin: m })),
        degisti: (v) => { veri.hedef = v; kontrol(); },
      });
      const sayac = el("div", { class: "ort-alt" });
      const m = metinKutusu({
        etiket: "Exit ticket: What was easy? What was difficult? How do you feel about speaking English now?", deger: veri.cikis, satir: 4,
        degisti: (v) => { veri.cikis = v; sayac.textContent = `${kelimeSay(v)}/15 words`; kontrol(); },
      });
      ctx.kontroller.append(m.el, sayac);
      sayac.textContent = `${kelimeSay(veri.cikis)}/15 words`;
      kontrol();
    },
  },

  /* 11 ----------------------------------------------------------------- */
  {
    baslik: "Check what you learned",
    anlatim: `
      <p>Eight quick questions about grammar, speaking, writing and national days. Read the explanation after each question.</p>
      <p>Get at least <b>6</b> right to complete the lesson.</p>`,
    gorev: "Get at least <b>6/8</b> correct.",
    ogretmen: "Sorular G1, S ve W çıktılarını yoklar. Yanlış yapılan konular için ilgili adıma dönülebilir (1–3: dil bilgisi, 5–6: konuşma, 7–9: yazma).",
    kur(ctx) {
      sahneAc(ctx);
      ctx.sinav([
        { tur: "coktan", metin: "Look! The students ___ a project in the seminar room.", siklar: ["discuss", "are discussing", "discusses", "is discussing"], dogru: 1, aciklama: "Look! = now → present progressive; the students = they → are discussing." },
        { tur: "coktan", metin: "The canteen isn't serving lunch now, ___?", siklar: ["isn't it", "is it", "does it", "doesn't it"], dogru: 1, aciklama: "Negative sentence → positive tag; auxiliary is → is it?" },
        { tur: "coktan", metin: "Mert always arrives on time, ___?", siklar: ["doesn't he", "isn't he", "does he", "don't they"], dogru: 0, aciklama: "arrives = present simple, he → doesn't he?" },
        { tur: "coktan", metin: "Her bag is still here. She ___ be in the locker room.", siklar: ["can't", "must", "doesn't", "isn't"], dogru: 1, aciklama: "The bag is a strong clue: must = almost sure." },
        { tur: "coktan", metin: "Is there ___ you need help with before the exam?", siklar: ["nothing", "something", "anything", "everything"], dogru: 2, aciklama: "In questions we usually use anything." },
        { tur: "coktan", metin: "On which day do we celebrate the opening of the Grand National Assembly with children?", siklar: ["29 October", "23 April", "19 May", "30 August"], dogru: 1, aciklama: "23 April: National Sovereignty and Children's Day (1920)." },
        { tur: "coktan", metin: "Which is the best closing for a blog post to a partner school?", siklar: ["Yours faithfully, The Headmaster", "Write soon and tell me about your school!", "That's all. Bye.", "Please reply within five working days."], dogru: 1, aciklama: "A friendly closing with a question fits a blog post to other students." },
        { tur: "coktan", metin: "Your friend is a perfectionist and studies until 2 a.m. every night. Which advice is the most helpful?", siklar: ["You should study until 3 a.m.", "Why don't you make a weekly plan and take short breaks?", "Don't talk to the counsellor.", "You must stop all your clubs forever."], dogru: 1, aciklama: "Time management and breaks help with exam anxiety." },
      ], { baslik: "Clubs, stress and celebrations", gecmeOrani: 0.75 });
    },
  },
];

dersBaslat({ adimlar, sahneKur: (kap) => kap.classList.add("eng-zemin") });
kodlariKisalt();
