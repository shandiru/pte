// The whole plan lives here. Change START (must be a Monday) and every date shifts.
export const START = "2026-11-09";

const pad = (n) => String(n).padStart(2, "0");
export const toKey = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
export const addDays = (k, n) => {
  const [y, m, d] = k.split("-").map(Number);
  return toKey(new Date(Date.UTC(y, m - 1, d + n)));
};

// [week, phase, focus, mock week?]
const W = [
  [1, "Grammar Core", "Parts of speech, plurals, articles", false],
  [2, "Grammar Core", "Verb forms, helping verbs, sentence structure, questions", false],
  [3, "Grammar Core", "Present tense (4 types)", false],
  [4, "Grammar Core", "Past tense (4 types)", false],
  [5, "Grammar Core", "Future tense (4 types)", false],
  [6, "Grammar Core", "Tense revision and modal verbs", false],
  [7, "Grammar and PTE Intro", "Active and passive voice, subject-verb agreement", false],
  [8, "Grammar and PTE Intro", "Conditionals, speech, prepositions, phrasal verbs", false],
  [9, "Grammar and PTE Intro", "Diagnostic mock #1, PTE format, Read Aloud, Repeat Sentence", true],
  [10, "Grammar and PTE Intro", "Write from Dictation, Fill in the Blanks, Summarize Written Text", false],
  [11, "PTE Skill Building", "All speaking and listening task types", false],
  [12, "PTE Skill Building", "Speaking and listening, mock #2 on Sunday", true],
  [13, "PTE Skill Building", "Writing: Summarize Written Text and Essay", false],
  [14, "PTE Skill Building", "Reading task types plus listening", false],
  [15, "PTE Intensive", "Fix the weakest section, daily mixed practice", false],
  [16, "PTE Intensive", "Mock #3 on Monday. Below 50 means move the exam to April", true],
  [17, "PTE Intensive", "Templates, timing, mock #4 on Sunday", true],
  [18, "PTE Intensive", "Final weak areas, mock #5 on Sunday", true],
  [19, "Exam Window", "Mock 65+ means book the March exam. Otherwise weak areas only", false],
  [20, "Exam Window", "Exam week or weak-area focus", false],
  [21, "Exam Window", "April backup attempt preparation", false],
  [22, "Exam Window", "April backup attempt preparation", false],
  [23, "Exam Window", "Final attempt window", false],
];

export const weeks = W.map(([n, phase, focus, mock]) => {
  const start = addDays(START, 7 * (n - 1));
  return { n, phase, focus, mock, start, end: addDays(start, 6) };
});
export const END = weeks[weeks.length - 1].end;

const MOCK_DAYS = { "2027-01-04": 1, "2027-01-31": 2, "2027-02-22": 3, "2027-03-07": 4, "2027-03-14": 5 };

/* ---------- Weeks 1-8: one grammar topic per day (Mon to Sat) ---------- */
const tense = (name) => [`Simple ${name}`, `${name} Continuous`, `${name} Perfect`, `${name} Perfect Continuous`, `Compare all 4 ${name.toLowerCase()} tenses`, `${name} tense self-test`];
const GRAMMAR = {
  1: ["Mind setup + parts of speech: noun and pronoun", "Parts of speech: verb, adjective, adverb", "Parts of speech: preposition, conjunction, interjection", "Singular and plural rules (regular, es, y to ies, irregular)", "Articles: a, an, the", "Mixed practice: parts of speech, plurals, articles"],
  2: ["Verb forms: V1, V2, V3, V-ing, V-s", "Helping verbs: is, am, are, was, were", "Helping verbs: have, has, had, do, does, did", "Sentence structure: Subject + Verb + Object", "Questions: yes/no and Wh- questions", "Negative sentences + mixed practice"],
  3: tense("Present").map((t, i) => (i === 0 ? "Simple Present (habits and facts)" : t)),
  4: tense("Past").map((t, i) => (i === 0 ? "Simple Past" : t)),
  5: tense("Future").map((t, i) => (i === 0 ? "Simple Future (will, shall)" : t)),
  6: ["Revision: present tenses", "Revision: past tenses", "Revision: future tenses", "Modal verbs: can, could, may, might", "Modal verbs: must, should, will, would, shall", "12 tenses and modals: mixed test"],
  7: ["Active voice and passive voice basics", "Passive voice: present tenses", "Passive voice: past tenses", "Passive voice: future tense and modals", "Convert 12 sentences, active to passive and back", "Subject-verb agreement"],
  8: ["Conditionals: Type 1 (real future)", "Conditionals: Type 2 (unreal present)", "Conditionals: Type 3 (unreal past)", "Direct and indirect speech", "Prepositions of time and place: in, on, at", "Phrasal verbs: 15 common ones"],
};
// Weeks 9-10: PTE intro, one topic per day. Week 9 Monday is mock #1.
const INTRO = {
  9: [null, ["PTE format and scoring", "Read how the 4 skills are scored. List all 20 task types in your notebook.", 0, ""], ["Read Aloud", "Learn the technique, then do 15 items. Record and listen back.", 15, "items"], ["Repeat Sentence", "20 items. Focus on rhythm and remembering the whole sentence.", 20, "items"], ["Read Aloud + Repeat Sentence, timed", "10 Read Aloud and 15 Repeat Sentence at exam speed.", 25, "items"], ["Fix the errors from mock #1", "Go through the mistakes you wrote down after the mock. Redo 10 items you got wrong.", 10, "items"]],
  10: [["Write from Dictation", "20 sentences. Spelling counts, check every word.", 20, "items"], ["Fill in the Blanks (listening)", "10 items. Write while you listen, then check.", 10, "items"], ["Summarize Written Text", "3 items. One sentence, 5 to 75 words, 10 minutes each.", 3, "items"], ["Summarize Spoken Text", "3 items. 50 to 70 words, 10 minutes each.", 3, "items"], ["Write from Dictation + Summarize Written Text", "10 dictation and 2 summaries, timed.", 12, "items"], ["Essay structure", "Learn intro, 2 body paragraphs, conclusion. Write 1 essay in 20 minutes.", 1, "essay"]],
};

/* ---------- Weeks 11+: PTE task rotation by weekday (Mon to Sat) ---------- */
const SPEAK = [
  ["Read Aloud + Repeat Sentence", "20 Read Aloud and 20 Repeat Sentence. Record, listen back, fix pauses.", 40, "items"],
  ["Describe Image", "10 images (graphs, maps, photos). 40 seconds each, use your template.", 10, "items"],
  ["Retell Lecture + Answer Short Question", "8 Retell Lecture and 20 Answer Short Question.", 28, "items"],
  ["Read Aloud + Describe Image", "15 Read Aloud and 8 Describe Image. No long pauses.", 23, "items"],
  ["Repeat Sentence + Retell Lecture", "20 Repeat Sentence and 6 Retell Lecture.", 26, "items"],
  ["Full Speaking section, timed", "One full Speaking section in exam timing. Note your weakest task type.", 1, "section"],
];
const LISTEN = [
  ["Write from Dictation", "20 sentences. Check every word.", 20, "items"],
  ["Fill in the Blanks (listening)", "10 items. Write while you listen, then review.", 10, "items"],
  ["Summarize Spoken Text", "3 items, 50 to 70 words, 10 minutes each.", 3, "items"],
  ["Highlight Correct Summary + Multiple Choice", "10 items. Read the options before the audio starts.", 10, "items"],
  ["Highlight Incorrect Words + Select Missing Word", "10 items of each.", 20, "items"],
  ["Full Listening section, timed", "One full Listening section in exam timing.", 1, "section"],
];
const WRITE = [
  ["Summarize Written Text", "4 items. One sentence, 5 to 75 words, 10 minutes each.", 4, "items"],
  ["Essay", "1 essay, 20 minutes, 200 to 300 words. Check grammar after.", 1, "essay"],
  ["Summarize Written Text", "4 items. Compare each with a model answer.", 4, "items"],
  ["Essay", "1 essay on a new topic. Use your template, check spelling.", 1, "essay"],
  ["Summarize Written Text + Essay", "2 summaries and 1 essay.", 3, "items"],
  ["Full Writing section, timed", "Summarize Written Text and Essay in exam timing.", 1, "section"],
];
const READ = [
  ["Reading and Writing Fill in the Blanks", "15 items.", 15, "items"],
  ["Re-order Paragraphs", "10 items. Find the opening sentence first.", 10, "items"],
  ["Reading Fill in the Blanks (multiple choice)", "10 items.", 10, "items"],
  ["Multiple Choice (single and multiple answers)", "10 items.", 10, "items"],
  ["Fill in the Blanks + Re-order Paragraphs", "10 fill in the blanks and 5 re-order.", 15, "items"],
  ["Full Reading section, timed", "One full Reading section in exam timing.", 1, "section"],
];

/* ---------- Easy-English daily habits for weeks 1-10 ---------- */
const LISTEN_E = [
  ["Watch a 10 minute video, English subtitles ON", "YouTube. Pause and note 5 new words. Replay the hard parts.", 5, "words"],
  ["Listen to one 6 Minute English episode (BBC)", "Write 5 sentences about what you understood.", 5, "sentences"],
  ["Listen to a short story or podcast", "Retell it in 5 sentences, first speaking, then writing.", 5, "sentences"],
  ["Dictation: write what you hear", "Play 10 short sentences, pause and write each one. Check with subtitles.", 10, "sentences"],
  ["20 minutes of a show with English subtitles", "Netflix or YouTube. Note 5 useful phrases.", 5, "phrases"],
  ["Shadowing: repeat after a speaker", "Pick a 2 minute clip. Repeat each line aloud, 10 rounds.", 10, "rounds"],
];
const SPEAK_E = [
  ["Read aloud", "Read one paragraph 5 times and record the 5th. Fix the words you stumbled on.", 5, "times"],
  ["Describe your day for 3 minutes", "Use today's grammar. Record it and listen back.", 0, ""],
  ["Introduce yourself and your family", "3 minutes. Record, listen, fix mistakes, record again.", 0, ""],
  ["Talk about a place you know", "3 minutes. Then say it again, better.", 0, ""],
  ["Describe pictures", "Pick 5 photos. Speak 1 minute on each.", 5, "pictures"],
  ["Free talk, 5 minutes", "Compare with Monday's recording. What improved?", 0, ""],
];
const tail = " Then 10 minutes of conversation with a friend or an AI voice chat.";

const T = (category, title, plannedMin, detail, target = 0, unit = "") => [category, title, plannedMin, detail, target, unit];

function dayTasks(w, i, date) {
  const mock = MOCK_DAYS[date];
  if (mock) return [
    T("mock", `Full mock test #${mock}`, 180, "Do it in exam conditions. Then add the score in Mock scores.", 1, "test"),
    T("revision", "Review every mistake from the mock", 90, "Write down the 5 biggest weaknesses and one fix for each."),
    T("vocabulary", "Vocabulary revision", 45, "Words from the last two weeks.", 20, "words"),
  ];
  const early = w.n <= 10;
  if (i === 6) return early ? [
    T("revision", "Weekly revision", 120, `Redo every mistake from this week. Topic: ${w.focus}. Then a 20 question self-test.`, 20, "questions"),
    T("listening", "Listening review", 60, "Re-watch the hardest video of the week, first with subtitles, then without."),
    T("vocabulary", "Test yourself on this week's words", 45, "Cover the meaning, say it, check it. Re-learn the ones you missed.", 100, "words"),
    T("speaking", "Record a 3 minute talk on this week's topic", 60, "Listen back and fix mistakes." + tail),
  ] : [
    T("revision", "Weak-area drill", 120, "Open Report and find your lowest rated skills. Drill those task types for 2 hours."),
    T("listening", "Listening practice", 60, "20 Write from Dictation and 10 Fill in the Blanks.", 30, "items"),
    T("vocabulary", "Test yourself on this week's words", 45, "Cover the meaning, say it, check it.", 100, "words"),
    T("speaking", "Speaking practice", 60, "20 Read Aloud and 20 Repeat Sentence. Record and review.", 40, "items"),
  ];

  if (early) {
    let main;
    if (w.n <= 8) {
      const detail = i < 4 ? "Learn the structure, read 15 examples in your notebook, then write your 10 sentences in the Writing task."
        : i === 4 ? (GRAMMAR[w.n][i].startsWith("Compare") ? "Compare the 4 forms side by side in a table. Write the rule in your own words." : "Practice day: 15 new examples on this topic. Write the rule in your own words.")
        : "Self-test: 20 mixed sentences. Write every mistake in your notebook.";
      main = T("grammar", `Grammar: ${GRAMMAR[w.n][i]}`, 90, detail);
    } else {
      const x = INTRO[w.n][i];
      main = T("pte", `PTE: ${x[0]}`, 90, x[1], x[2], x[3]);
    }
    const verbs = w.n === 2 || w.n === 3;
    return [
      main,
      T("listening", LISTEN_E[i][0], 60, LISTEN_E[i][1], LISTEN_E[i][2], LISTEN_E[i][3]),
      verbs ? T("vocabulary", "Vocabulary: 20 new words + 10 irregular verbs", 45, "Meaning plus your own sentence for each word. Say V1, V2, V3 for each verb.", 30, "words and verbs")
            : T("vocabulary", w.n <= 8 ? "Vocabulary: 20 new words" : "Academic vocabulary: 20 new words", 45, "Meaning plus your own sentence for each word.", 20, "words"),
      T("speaking", SPEAK_E[i][0], 60, SPEAK_E[i][1] + tail, SPEAK_E[i][2], SPEAK_E[i][3]),
      i === 5 ? T("writing", "Journal: 5 sentences about your week", 45, "Write, then check each sentence for tense and articles.", 5, "sentences")
              : T("writing", "Write 10 sentences of your own", 45, "Use today's topic. Check each sentence after writing.", 10, "sentences"),
    ];
  }
  const s = SPEAK[i], l = LISTEN[i], r = WRITE[i], d = READ[i];
  return [
    T("speaking", `PTE Speaking: ${s[0]}`, 90, s[1], s[2], s[3]),
    T("listening", `PTE Listening: ${l[0]}`, 60, l[1], l[2], l[3]),
    T("vocabulary", w.n <= 14 ? "Academic vocabulary: 20 new words" : "Vocabulary: 15 new words + revise old ones", 45, "Use every word in a sentence.", w.n <= 14 ? 20 : 15, "words"),
    T("writing", `PTE Writing: ${r[0]}`, 60, r[1], r[2], r[3]),
    T("reading", `PTE Reading: ${d[0]}`, 45, d[1], d[2], d[3]),
  ];
}

export function buildTasks() {
  const out = [];
  for (const w of weeks) {
    for (let i = 0; i < 7; i++) {
      const date = addDays(w.start, i);
      dayTasks(w, i, date).forEach(([category, title, plannedMin, detail, target, unit], order) =>
        out.push({ date, category, title, detail, plannedMin, target, unit, order, seedKey: `${date}#${order}` })
      );
    }
  }
  return out;
}
