// Original listening and reading texts written for this lesson (no copyrighted material).
// Podcast "School Swap" (Maya, Elif, Jack) and article "Three Schools, Three Mornings" (Haruto, Aino, Deniz).

export const SESLER = {
  Maya: { dil: "en-GB", hiz: 0.95 },
  Elif: { dil: "en-US", hiz: 0.92 },
  Jack: { dil: "en-GB", hiz: 0.9 },
};

export const PODCAST = [
  { kim: "Maya", metin: "Hello and welcome to School Swap, the podcast where students compare their school lives. I'm Maya. Today we've got two guests: Elif from Türkiye and Jack from Scotland. Hi, both!" },
  { kim: "Elif", metin: "Hi, Maya! I'm Elif. I'm sixteen and I go to an Anatolian high school in Kayseri. It's a state school, so it's free." },
  { kim: "Jack", metin: "Hello! I'm Jack. I'm in Year 11 at a boarding school near Edinburgh. I live at school from Monday to Friday and go home at weekends." },
  { kim: "Maya", metin: "Jack, you live at school? That's different, isn't it?" },
  { kim: "Jack", metin: "It is! We wake up at seven, we have breakfast in the dining hall, and lessons start at half past eight. In the evening we usually do our homework in a study room." },
  { kim: "Maya", metin: "And Elif, what does a normal day look like for you?" },
  { kim: "Elif", metin: "Lessons start at twenty past eight and finish at about half past three. We always have lunch in the canteen. On Wednesdays I stay after school for the coding club. Right now we're building an app for our school library." },
  { kim: "Maya", metin: "Nice! Jack, what extracurricular activities do you do?" },
  { kim: "Jack", metin: "I play rugby twice a week, and this term I'm also taking photography. Our school has a food technology room too, so on Thursdays we cook." },
  { kim: "Maya", metin: "What about the facilities at your school, Elif?" },
  { kim: "Elif", metin: "We have a big courtyard, a library, a prayer room and a new basketball court. My friends and I often play there at lunchtime." },
  { kim: "Maya", metin: "Let's talk about stress. Do exams ever make you anxious?" },
  { kim: "Jack", metin: "Honestly, yes. I'm a bit of a perfectionist, so I sometimes study until really late. That can't be good for me, can it?" },
  { kim: "Elif", metin: "I feel the same before big exams. Our school counsellor taught us about time management. Now I make a weekly plan, and I never study late the night before an exam." },
  { kim: "Maya", metin: "Great tip! Thank you both. Next week, we're visiting a school in Japan. See you then!" },
];

/* Step 1: picture-based predictions (checked after listening) */
export const TAHMINLER = [
  { id: "karsilastir", metin: "The guests will compare two different types of schools.", dogru: true },
  { id: "yatili", metin: "One of the guests lives at school during the week.", dogru: true },
  { id: "spor", metin: "They will talk about sports and clubs.", dogru: true },
  { id: "gezi", metin: "The podcast is about a school trip abroad.", dogru: false },
  { id: "uniforma", metin: "They will argue about school uniforms.", dogru: false },
];

/* Step 2: gist */
export const ANA_KONU = [
  { deger: "dogru", metin: "Two students compare their school lives and talk about exam stress." },
  { deger: "gezi", metin: "A teacher explains how to plan a school trip to Japan." },
  { deger: "spor", metin: "Two rugby players talk about a match between their schools." },
];
export const KONU_SIRASI = [
  { id: "tanisma", metin: "The guests introduce themselves and their schools." },
  { id: "gun", metin: "They describe a normal school day." },
  { id: "etkinlik", metin: "They talk about extracurricular activities." },
  { id: "olanak", metin: "They describe the facilities at school." },
  { id: "stres", metin: "They talk about exam stress and time management." },
];

/* Step 3: details (Elif / Jack / Both) */
export const AYRINTILAR = [
  { id: "a1", metin: "lives at school from Monday to Friday", kova: "jack" },
  { id: "a2", metin: "goes to a free state school", kova: "elif" },
  { id: "a3", metin: "is in a coding club", kova: "elif" },
  { id: "a4", metin: "plays rugby twice a week", kova: "jack" },
  { id: "a5", metin: "cooks in the food technology room", kova: "jack" },
  { id: "a6", metin: "plays basketball at lunchtime", kova: "elif" },
  { id: "a7", metin: "sometimes feels anxious about exams", kova: "ikisi", neden: "Jack says “Honestly, yes.” and Elif says “I feel the same before big exams.”" },
  { id: "a8", metin: "learned about time management from a counsellor", kova: "elif" },
  { id: "a9", metin: "does homework in a study room in the evening", kova: "jack" },
];
export const CIKARIMLAR = [
  {
    soru: "Why does Jack sometimes study until really late?",
    liste: [
      { deger: "dogru", metin: "He is a perfectionist and wants everything to be perfect." },
      { deger: "ders", metin: "His lessons finish very late in the evening." },
      { deger: "rugby", metin: "He plays rugby every evening." },
    ],
    aciklama: "“I'm a bit of a perfectionist, so I sometimes study until really late.” The word so shows the result.",
  },
  {
    soru: "What is Elif's coding club doing these days?",
    liste: [
      { deger: "ders", metin: "Teaching younger students to code." },
      { deger: "dogru", metin: "Building an app for the school library." },
      { deger: "yarisma", metin: "Preparing for a national competition." },
    ],
    aciklama: "“Right now we're building an app for our school library.” Right now + present progressive = a temporary activity.",
  },
  {
    soru: "Jack says: “That can't be good for me, can it?” What does he mean?",
    liste: [
      { deger: "dogru", metin: "He knows that studying very late is probably bad for him." },
      { deger: "soru", metin: "He really doesn't know if studying late is good or bad." },
      { deger: "iyi", metin: "He thinks studying late is a great habit." },
    ],
    aciklama: "can't = a logical deduction (it's impossible that it is good). With a falling tag, he expects Maya to agree.",
  },
];

/* Step 5: intonation */
export const TONLAMA = [
  { id: "t1", metin: "That's different, isn't it?", ton: "dusen", tur: "Question tag: the speaker is sure and expects agreement." },
  { id: "t2", metin: "Do exams ever make you anxious?", ton: "yukselen", tur: "Yes/no question: the voice usually goes up at the end." },
  { id: "t3", metin: "What does a normal day look like for you?", ton: "dusen", tur: "Wh- question: the voice usually goes down at the end." },
  { id: "t4", metin: "We have a big courtyard and a new basketball court.", ton: "dusen", tur: "Positive statement: the voice goes down at the end." },
  { id: "t5", metin: "I don't live at school at weekends.", ton: "dusen", tur: "Negative statement: the voice also goes down at the end." },
  { id: "t6", metin: "That can't be good for me, can it?", ton: "dusen", tur: "Question tag: Jack already knows the answer; he is checking, not asking." },
  { id: "t7", metin: "The canteen isn't serving lunch now, is it?", ton: "yukselen", baglam: "(You are not sure. You really want to know.)", tur: "Question tag: when you are not sure and really ask, the tag goes up." },
];

/* Reading: [[key|text]] = scan answer, {{word}} = target vocabulary */
export const MAKALE_BASLIK = "Three Schools, Three Mornings";
export const MAKALE_GIRIS = "At eight o'clock in the morning, millions of teenagers around the world are starting their school day. But what does that morning really look like? We asked three students from three different countries.";
export const MAKALE = [
  {
    kim: "haruto", ad: "Haruto, 15", yer: "Osaka, Japan",
    metin: "When I arrive at school, I take off my outdoor shoes and put on [[ayakkabi|indoor shoes]]. I keep my outdoor shoes in a small {{locker}} by the entrance. Lessons start at [[saat|8:40]]. After lunch, we clean our classrooms ourselves, so there are no cleaners at our school! Three times a week I practise kendo after school. This week our club is preparing for a {{competition}}, so the gym is really busy.",
  },
  {
    kim: "aino", ad: "Aino, 16", yer: "Tampere, Finland",
    metin: "My school day usually starts at 9:00, and we have a [[mola|fifteen-minute]] break after every lesson. Lunch is free for all students, so we eat together in the {{canteen}}. We don't have many exams, but we often do projects. At the moment I'm preparing a {{presentation}} about clean energy with two classmates. I also spend a lot of time in the music room because I play the [[gitar|guitar]] in the school {{band}}.",
  },
  {
    kim: "deniz", ad: "Deniz, 15", yer: "Bursa, Türkiye",
    metin: "Every Monday morning, we start the week with a flag {{ceremony}} in the {{courtyard}} and sing the National Anthem together. Lessons begin at 8:30. Today we're having a [[sinav|chemistry quiz]], so everyone is {{revising}} in the corridor! I'm the leader of our literature club, and this week we're preparing a poetry evening for Republic Day on [[gun|29 October]].",
  },
];
export const MAKALE_SON = "Three countries, three very different mornings. But all three students agree on one thing: good friends make every school day better.";

export const GOZ_GEZDIR = [
  { deger: "dogru", metin: "What a school morning looks like in three countries" },
  { deger: "sinav", metin: "Why exams are difficult in Japan" },
  { deger: "zaman", metin: "How to manage your time before exams" },
  { deger: "yarisma", metin: "A sports competition between three schools" },
];
export const TARAMA = [
  { anahtar: "saat", soru: "What time do Haruto's lessons start?" },
  { anahtar: "ayakkabi", soru: "What does Haruto put on when he arrives at school?" },
  { anahtar: "mola", soru: "How long is the break after every lesson at Aino's school?" },
  { anahtar: "gitar", soru: "What instrument does Aino play?" },
  { anahtar: "sinav", soru: "What is Deniz's class having today?" },
  { anahtar: "gun", soru: "When is Republic Day?" },
];

/* Step 6: reading predictions (photos → countries, statements) */
export const FOTO_TAHMIN = [
  { id: "f1", metin: "Photo 1: small lockers full of shoes", dogru: "haruto" },
  { id: "f2", metin: "Photo 2: a guitar in a music room", dogru: "aino" },
  { id: "f3", metin: "Photo 3: a flag ceremony in a courtyard", dogru: "deniz" },
];
export const OKUMA_TAHMIN = [
  { id: "temiz", metin: "At one school, students clean their own classrooms.", dogru: true },
  { id: "ayni", metin: "All three schools start at exactly the same time.", dogru: false },
  { id: "kutlama", metin: "One student is getting ready for a national celebration.", dogru: true },
  { id: "sinavYok", metin: "One school has no lessons on Mondays.", dogru: false },
];
export const KISILER = { haruto: "Haruto (Japan)", aino: "Aino (Finland)", deniz: "Deniz (Türkiye)" };

/* Step 8: vocabulary in context */
export const KELIMELER = [
  { id: "locker", kelime: "locker", tanim: "a small cupboard with a door where you keep your things at school" },
  { id: "competition", kelime: "competition", tanim: "an event where people or teams try to win" },
  { id: "canteen", kelime: "canteen", tanim: "the place in a school where students buy and eat meals" },
  { id: "presentation", kelime: "presentation", tanim: "a talk in front of a group to show and explain your work" },
  { id: "band", kelime: "band", tanim: "a group of people who play music together" },
  { id: "ceremony", kelime: "ceremony", tanim: "a formal event, often with traditions, for a special occasion" },
  { id: "courtyard", kelime: "courtyard", tanim: "an open space with walls or buildings around it" },
  { id: "revising", kelime: "revising", tanim: "studying something again before a test or exam" },
];

/* Step 9: compare the three schools */
export const KARSILASTIR = [
  { id: "k1", metin: "cleans the classroom after lunch", kova: "haruto" },
  { id: "k2", metin: "eats a free lunch with everyone", kova: "aino" },
  { id: "k3", metin: "starts the week with a flag ceremony", kova: "deniz" },
  { id: "k4", metin: "has a quiz today", kova: "deniz" },
  { id: "k5", metin: "has a club that is getting ready for a competition", kova: "haruto", neden: "“This week our club is preparing for a competition.”" },
  { id: "k6", metin: "does projects more often than exams", kova: "aino" },
  { id: "k7", metin: "changes shoes at the entrance", kova: "haruto" },
  { id: "k8", metin: "leads a club", kova: "deniz" },
  { id: "k9", metin: "plays music at school", kova: "aino" },
];
export const OKUMA_CIKARIM = [
  {
    soru: "Why is everyone revising in the corridor at Deniz's school?",
    liste: [
      { deger: "dogru", metin: "Because they are having a chemistry quiz today." },
      { deger: "toren", metin: "Because the flag ceremony is in the corridor." },
      { deger: "kulup", metin: "Because the literature club meets there." },
    ],
  },
  {
    soru: "Why are there no cleaners at Haruto's school?",
    liste: [
      { deger: "para", metin: "Because the school has no money." },
      { deger: "dogru", metin: "Because the students clean the classrooms themselves." },
      { deger: "kendo", metin: "Because the kendo club cleans the gym." },
    ],
  },
];
