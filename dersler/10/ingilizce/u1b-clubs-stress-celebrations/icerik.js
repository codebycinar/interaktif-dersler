// Original texts written for this lesson: grammar examples, counsellor dialogue, role-play phrase bank, model blog post.

/* Step 1: routine or now? */
export const ZAMAN_KARTLARI = [
  { id: "z1", metin: "The teacher explains the lesson every morning.", kova: "rutin" },
  { id: "z2", metin: "The students are discussing a project in the seminar room right now.", kova: "simdi" },
  { id: "z3", metin: "Our school often organises spelling bees.", kova: "rutin" },
  { id: "z4", metin: "Look! The volleyball team is practising in the gym.", kova: "simdi" },
  { id: "z5", metin: "Zeynep usually has lunch in the canteen.", kova: "rutin" },
  { id: "z6", metin: "This term, we are learning photography after school.", kova: "simdi", neden: "this term = a limited, temporary period, so we use the present progressive." },
  { id: "z7", metin: "The library opens at eight o'clock.", kova: "rutin", neden: "A timetable or a fact: present simple." },
  { id: "z8", metin: "I'm revising for the quiz at the moment.", kova: "simdi" },
];
export const ZAMAN_BOSLUK = [
  { id: "b1", cumle: "Every Wednesday, Elif ___ to the coding club.", secenekler: ["goes", "is going"], dogru: "goes", neden: "Every Wednesday = a routine." },
  { id: "b2", cumle: "Be quiet! The headmaster ___ an announcement.", secenekler: ["makes", "is making"], dogru: "is making", neden: "Be quiet! = it is happening now." },
  { id: "b3", cumle: "The pupils ___ on time for their Physics lectures.", secenekler: ["always arrive", "arrive always", "are always arriving"], dogru: "always arrive", neden: "Frequency adverbs go before the main verb: always arrive." },
  { id: "b4", cumle: "Jack ___ photography this term.", secenekler: ["takes", "is taking"], dogru: "is taking", neden: "this term = temporary." },
  { id: "b5", cumle: "We ___ PE twice a week.", secenekler: ["have", "are having"], dogru: "have", neden: "twice a week = how often, a routine." },
];

/* Step 2: question tags (the tag is calculated by soruEki) */
export const ETIKET_CUMLELERI = [
  { id: "e1", cumle: "The students practise martial arts after school," },
  { id: "e2", cumle: "The canteen isn't serving lunch now," },
  { id: "e3", cumle: "Zeynep can't attend the science club today," },
  { id: "e4", cumle: "Mert always arrives on time," },
  { id: "e5", cumle: "You're coming to the poetry evening," },
  { id: "e6", cumle: "Our school doesn't have a swimming pool,", ozne: "Our school" },
  { id: "e7", cumle: "My friends and I are preparing a presentation," },
];
export const YARDIMCILAR = ["do", "does", "is", "are", "am", "can", "don't", "doesn't", "isn't", "aren't", "can't"];
export const ZAMIR_LISTESI = ["I", "you", "he", "she", "it", "we", "they"];

/* Step 3: detective */
export const IPUCLARI = [
  "It's 4 p.m. on Thursday. Defne's school bag is still in the locker room.",
  "Her volleyball shoes are not in her locker.",
  "The gym lights are on and you can hear a ball.",
  "Emre's bag isn't in the locker room and his bike isn't in the bike park.",
  "The headmaster is at a conference in Ankara today.",
];
export const CIKARIM_BOSLUK = [
  { id: "c1", cumle: "Defne ___ be in the gym. Her bag is here, but her volleyball shoes aren't.", dogru: "must", neden: "The clues make it almost certain: must." },
  { id: "c2", cumle: "Emre ___ be at school. His bag and his bike aren't here.", dogru: "can't", neden: "The clues show it's impossible: can't." },
  { id: "c3", cumle: "The headmaster ___ be in his office. He's at a conference in Ankara.", dogru: "can't", neden: "He is in another city, so it's impossible." },
  { id: "c4", cumle: "Someone ___ be playing volleyball. The lights are on and you can hear a ball.", dogru: "must", neden: "Two clues point to the same answer: must." },
];
export const BELIRSIZ_BOSLUK = [
  { id: "s1", cumle: "Is there ___ in the food technology room that we can use for the experiment?", dogru: "anything" },
  { id: "s2", cumle: "There is ___ in the locker room because the students cleared it out.", dogru: "nothing", neden: "The students cleared it out: it's empty, so the meaning is negative." },
  { id: "s3", cumle: "The counsellor said there is ___ bothering the pupil, but they won't talk about it.", dogru: "something", neden: "There is a problem, but we don't know what it is: something." },
  { id: "s4", cumle: "They did ___ to prepare for the quiz, so they are worried.", dogru: "nothing", neden: "They are worried because they didn't prepare: nothing (= not anything)." },
  { id: "s5", cumle: "I didn't bring ___ for lunch, so I'm going to the canteen.", dogru: "anything" },
];

/* Step 4: model conversation */
export const SESLER = { "Ms Aksoy": { dil: "en-GB", hiz: 0.92 }, Mert: { dil: "en-US", hiz: 0.95 } };
export const DIYALOG = [
  { kim: "Ms Aksoy", metin: "Come in, Mert. You look worried. Is anything wrong?" },
  { kim: "Mert", metin: "Yes, Ms Aksoy. The chemistry exam is on Friday and I can't sleep before exams. I study every night until one o'clock." },
  { kim: "Ms Aksoy", metin: "That's very late. You want to get everything right, don't you?" },
  { kim: "Mert", metin: "Yes. I always want a perfect score. I feel terrible when I make one mistake." },
  { kim: "Ms Aksoy", metin: "You're not alone. Exams make a lot of students anxious, don't they? What do you usually do after school?" },
  { kim: "Mert", metin: "I usually go to the chess club, but this week I'm not going. I'm revising all the time." },
  { kim: "Ms Aksoy", metin: "Breaks help your brain, you know. Why don't you make a weekly plan? Study for forty minutes, then take a ten-minute break." },
  { kim: "Mert", metin: "Can I still go to the chess club?" },
  { kim: "Ms Aksoy", metin: "Of course! You should keep doing things you enjoy. And try to go to bed before eleven." },
  { kim: "Mert", metin: "OK, I'll try. Thank you, Ms Aksoy. I feel better already." },
  { kim: "Ms Aksoy", metin: "You're welcome. Let's catch up again next week." },
];
export const ISLEVLER = [
  { id: "duygu", baslik: "Talking about feelings" },
  { id: "tavsiye", baslik: "Giving advice" },
  { id: "rutin", baslik: "Describing routines" },
  { id: "etiket", baslik: "Checking with a question tag" },
];
export const ISLEV_KARTLARI = [
  { id: "i1", metin: "I feel terrible when I make one mistake.", kova: "duygu" },
  { id: "i2", metin: "I can't sleep before exams.", kova: "duygu" },
  { id: "i3", metin: "Why don't you make a weekly plan?", kova: "tavsiye" },
  { id: "i4", metin: "You should keep doing things you enjoy.", kova: "tavsiye" },
  { id: "i5", metin: "I usually go to the chess club.", kova: "rutin" },
  { id: "i6", metin: "I study every night until one o'clock.", kova: "rutin", neden: "every night = a routine (even if it's a bad one!)." },
  { id: "i7", metin: "You want to get everything right, don't you?", kova: "etiket" },
  { id: "i8", metin: "Exams make a lot of students anxious, don't they?", kova: "etiket" },
];
export const DIYALOG_SORULARI = [
  {
    soru: "What is Mert's problem?",
    liste: [
      { deger: "dogru", metin: "He is anxious about an exam and studies too late." },
      { deger: "kulup", metin: "He doesn't like the chess club." },
      { deger: "not", metin: "He failed his chemistry exam." },
    ],
  },
  {
    soru: "What does Ms Aksoy suggest?",
    liste: [
      { deger: "birak", metin: "Stop going to the chess club until the exam." },
      { deger: "dogru", metin: "A weekly plan with short breaks, and more sleep." },
      { deger: "gece", metin: "Study until two o'clock on Friday." },
    ],
  },
];

/* Step 5: role-play builder */
export const SORUNLAR = {
  sinav: "I have a big exam and I'm very anxious.",
  kulup: "I'm in too many clubs and I have no free time.",
  yatili: "I'm new at a boarding school and I miss my family.",
};
export const ROL_TURLARI = [
  { kim: "B", etiket: "Friend: start the conversation", ortak: ["Hi! You look worried. Is anything wrong?", "Hey, are you OK? You're very quiet today."] },
  {
    kim: "A", etiket: "You: explain the problem",
    sorun: {
      sinav: ["I've got a maths exam on Monday and I'm really anxious.", "I'm a bit of a perfectionist, so I always study until midnight."],
      kulup: ["I'm in the chess, art, coding and volunteering clubs. I never have free time!", "I'm always tired because I have club meetings every day."],
      yatili: ["I'm new at this boarding school and I miss my family.", "Everything is different here and I don't know anyone yet."],
    },
  },
  {
    kim: "B", etiket: "Friend: check with a question tag",
    sorun: {
      sinav: ["You usually get good marks, don't you?", "You aren't sleeping enough, are you?"],
      kulup: ["You enjoy all the clubs, don't you?", "You don't have time for homework, do you?"],
      yatili: ["You talk to your family every week, don't you?", "You aren't sleeping well, are you?"],
    },
  },
  { kim: "A", etiket: "You: answer", ortak: ["Yes, but I'm still worried.", "No, not really. That's the problem.", "Sometimes, but not often."] },
  {
    kim: "B", etiket: "Friend: give advice",
    tavsiye: [
      { metin: "Why don't you make a weekly plan and take short breaks?", uygun: ["sinav", "kulup"] },
      { metin: "You should choose one or two clubs and leave the others.", uygun: ["kulup"] },
      { metin: "Why don't you join a club? It's a great way to meet people.", uygun: ["yatili"] },
      { metin: "Try to talk to the school counsellor. She often helps students like you.", uygun: ["sinav", "kulup", "yatili"] },
      { metin: "You should stop sleeping and study all night.", uygun: [] },
    ],
  },
  { kim: "A", etiket: "You: finish the conversation", ortak: ["That's a good idea. Thanks!", "OK, I'll try. Let's catch up during lunchtime!", "Thanks! I feel better now."] },
];

/* Step 6: national and religious days */
export const GUNLER = [
  { id: "cumhuriyet", sol: "29 October · Republic Day", sag: "The Republic of Türkiye was declared in 1923.", tarih: "29 October" },
  { id: "cocuk", sol: "23 April · National Sovereignty and Children's Day", sag: "The Grand National Assembly opened in 1920; children celebrate with shows.", tarih: "23 April" },
  { id: "genclik", sol: "19 May · Commemoration of Atatürk, Youth and Sports Day", sag: "Atatürk landed in Samsun in 1919; young people celebrate with sports events.", tarih: "19 May" },
  { id: "zafer", sol: "30 August · Victory Day", sag: "It celebrates the victory in the Great Offensive in 1922.", tarih: "30 August" },
  { id: "demokrasi", sol: "15 July · Democracy and National Unity Day", sag: "People remember the night when citizens defended democracy against the coup attempt in 2016.", tarih: "15 July" },
  { id: "ramazan", sol: "Eid al-Fitr (Ramadan Feast)", sag: "A three-day festival at the end of Ramadan; people visit relatives and children get sweets.", tarih: "" },
  { id: "kurban", sol: "Eid al-Adha (Festival of Sacrifice)", sag: "A four-day religious festival; families share meat with neighbours and people in need.", tarih: "" },
];
export const DUYURU = {
  etkinlik: ["a poetry evening", "a sports tournament", "a ceremony", "an art exhibition", "a charity collection"],
  yer: ["courtyard", "conference hall", "gym", "library"],
  saat: ["9:00", "10:30", "13:30", "15:30"],
  duzenleyen: ["literature club", "volunteering club", "art club", "PE department"],
};

/* Step 7: model blog post */
export const MODEL_YAZI = [
  { id: "m1", metin: "Hi everyone at our partner school in Lisbon!", kova: "giris" },
  { id: "m2", metin: "My name is Zeynep and I'm in Year 10 at an Anatolian high school in İzmir. It's a state school with about 900 students.", kova: "giris" },
  { id: "m3", metin: "Our lessons start at 8:30 and finish at 15:10. We usually have seven lessons a day.", kova: "rutin" },
  { id: "m4", metin: "I always have lunch in the canteen with my friends, and we often play volleyball in the courtyard after lunch.", kova: "rutin" },
  { id: "m5", metin: "This month is really busy! Right now, my literature club is preparing a poetry evening for Republic Day on 29 October, and I'm writing a poem for it.", kova: "simdi" },
  { id: "m6", metin: "Before exams, I sometimes feel anxious. Our counsellor gave us a great tip: make a weekly plan and take short breaks. It really works!", kova: "duygu" },
  { id: "m7", metin: "What is a normal school day like at your school? Do you have clubs too?", kova: "kapanis" },
  { id: "m8", metin: "Write soon! Zeynep", kova: "kapanis" },
];
export const MODEL_PARAGRAF = [["m1"], ["m2"], ["m3", "m4"], ["m5"], ["m6"], ["m7"], ["m8"]];
export const MODEL_BOLUMLER = [
  { id: "giris", baslik: "Greeting and introduction" },
  { id: "rutin", baslik: "Routines (present simple)" },
  { id: "simdi", baslik: "Now and these days (present progressive)" },
  { id: "duygu", baslik: "Feelings and tips" },
  { id: "kapanis", baslik: "Questions and closing" },
];

/* Step 8: brainstorm */
export const BEYIN_FIRTINASI = [
  { id: "tur", etiket: "My school", secenekler: ["an Anatolian high school", "a state school", "a private school", "a boarding school", "a vocational high school"], tek: true },
  { id: "olanak", etiket: "Facilities", secenekler: ["canteen", "courtyard", "basketball court", "prayer room", "locker room", "food technology room", "library"] },
  { id: "kulup", etiket: "Clubs and activities", secenekler: ["chess club", "coding club", "literature club", "art club", "volunteering club", "spelling bee club", "volleyball", "photography"] },
  { id: "simdi", etiket: "These days we are…", secenekler: ["preparing for Republic Day", "revising for a quiz", "rehearsing a play", "practising for a tournament", "working on a presentation"] },
  { id: "ipucu", etiket: "My stress tip", secenekler: ["make a weekly plan", "take short breaks", "sleep before eleven", "talk to the counsellor", "do sport"], tek: true },
];

/* Step 10: reflection rubric */
export const YANSIMA_OLCUTLERI = [
  { ad: "akicilik", etiket: "Speaking fluently", kisa: "Fluency" },
  { ad: "tonlama", etiket: "Pronunciation and intonation", kisa: "Intonation" },
  { ad: "dilbilgisi", etiket: "Using the grammar of the theme", kisa: "Grammar" },
  { ad: "kelime", etiket: "Using theme words", kisa: "Vocabulary" },
  { ad: "duzen", etiket: "Organising my writing", kisa: "Organisation" },
  { ad: "guven", etiket: "Feeling confident", kisa: "Confidence" },
];
