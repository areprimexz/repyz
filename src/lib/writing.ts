import type { RequiredPoint, WritingPrompt } from '../types/content';

// Rule-based checks only. They catch surface features (length, layout,
// punctuation spacing, a short list of common error patterns). They cannot
// judge the quality of ideas, and every pattern-based finding is phrased as
// "mungkin" (possibly) so students verify it themselves.

export type IssueSeverity = 'warning' | 'info';
export type IssueCategory = 'length' | 'format' | 'mechanics' | 'structure' | 'pattern' | 'style';

export interface WritingIssue {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  title: string;
  detail: string;
  examples?: string[];
}

export interface PointHint {
  id: string;
  text: string;
  detected: boolean;
}

export interface WritingAnalysis {
  empty: boolean;
  words: number;
  sentences: number;
  paragraphs: number;
  avgSentenceLength: number;
  issues: WritingIssue[];
  points: PointHint[];
  linkingWords: string[];
}

const WORD_CHAR = /[A-Za-z0-9À-ɏ]/;

/** Counts words: whitespace-separated tokens that contain a letter or digit. */
export function countWords(text: string): number {
  if (!text) return 0;
  let count = 0;
  for (const token of text.split(/\s+/)) {
    if (token && WORD_CHAR.test(token)) count++;
  }
  return count;
}

/** Paragraphs are blocks separated by blank lines; single-line breaks are a fallback. */
export function splitParagraphs(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const blocks = trimmed
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => countWords(b) > 0);
  if (blocks.length === 1) {
    const lines = blocks[0]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => countWords(l) > 0);
    if (lines.length > 1) return lines;
  }
  return blocks;
}

/** Splits text into rough sentences ending in . ! or ? (lines without end punctuation count as one). */
export function splitSentences(text: string): string[] {
  const sentences: string[] = [];
  for (const line of text.split('\n')) {
    const parts = line.match(/[^.!?]+(?:[.!?]+["')\]]*|$)/g) ?? [];
    for (const part of parts) {
      const s = part.trim();
      if (countWords(s) > 0) sentences.push(s);
    }
  }
  return sentences;
}

/** Counts sentences that end with terminal punctuation. */
export function countSentences(text: string): number {
  return splitSentences(text).filter((s) => /[.!?]["')\]]*$/.test(s)).length;
}

export const LINKING_WORDS = [
  'furthermore',
  'moreover',
  'in addition',
  'additionally',
  'besides',
  'apart from that',
  'for example',
  'for instance',
  'such as',
  'however',
  'although',
  'on the other hand',
  'nevertheless',
  'whereas',
  'because',
  'therefore',
  'as a result',
  'consequently',
  'thus',
  'firstly',
  'secondly',
  'finally',
  'lastly',
  'first of all',
  'in conclusion',
  'to sum up',
  'in short',
  'all in all',
];

export function findLinkingWords(text: string): string[] {
  const lower = ` ${text.toLowerCase().replace(/\s+/g, ' ')} `;
  return LINKING_WORDS.filter((w) => new RegExp(`[^a-z]${w.replace(/ /g, '\\s')}[^a-z]`).test(lower));
}

interface PatternRule {
  id: string;
  regex: RegExp;
  title: string;
  detail: string;
  /** Previous words that make a match acceptable (checked in code, no lookbehind for older Safari). */
  allowAfter?: string[];
}

const PATTERN_RULES: PatternRule[] = [
  {
    id: 'am-agree',
    regex: /\b(?:am|is|are)\s+(?:agree|disagree)\b/gi,
    title: 'Mungkin salah: "am/is/are agree"',
    detail: '"Agree" ialah kata kerja. Tulis "I agree" atau "I disagree", bukan "I am agree".',
  },
  {
    id: 'very-like',
    regex: /\bvery\s+(?:like|love|enjoy|hate|want)\b/gi,
    title: 'Mungkin salah: "very like"',
    detail: '"Very" tidak digunakan terus sebelum kata kerja. Cuba "I really like..." atau "I like ... very much".',
  },
  {
    id: 'plural-was',
    regex: /\b(?:we|you|they)\s+was\b/gi,
    title: 'Mungkin salah: "we/you/they was"',
    detail: 'Subjek "we", "you" dan "they" menggunakan "were".',
  },
  {
    id: 'he-have',
    regex: /(\S+\s+)?\b(?:he|she)\s+have\b/gi,
    title: 'Mungkin salah: "he/she have"',
    detail: 'Dalam ayat positif masa kini, "he" dan "she" menggunakan "has". (Selepas does/did/can/will dan sebagainya, "have" adalah betul.)',
    allowAfter: [
      'does', 'did', 'do', "doesn't", "didn't", 'will', "won't", 'would', "wouldn't", 'can', "can't", 'could',
      "couldn't", 'should', "shouldn't", 'may', 'might', 'must', 'to', 'let', 'make', 'help', 'not',
    ],
  },
  {
    id: 'he-dont',
    regex: /\b(?:he|she|it)\s+don't\b/gi,
    title: 'Mungkin salah: "he/she/it don\'t"',
    detail: 'Gunakan "doesn\'t" untuk subjek tunggal orang ketiga: "She doesn\'t like..."',
  },
  {
    id: 'more-better',
    regex: /\bmore\s+(?:better|worse|easier|bigger|happier)\b/gi,
    title: 'Mungkin salah: perbandingan berganda',
    detail: '"Better" sudah bermaksud "lebih baik". Tulis "better", bukan "more better".',
  },
  {
    id: 'most-est',
    regex: /\bmost\s+(?:best|worst|happiest|biggest|easiest|fastest|nicest|largest|smallest)\b/gi,
    title: 'Mungkin salah: "most" + bentuk -est',
    detail: 'Jangan gabungkan "most" dengan bentuk -est. Tulis "the happiest", bukan "the most happiest".',
  },
  {
    id: 'discuss-about',
    regex: /\bdiscuss(?:es|ed|ing)?\s+about\b/gi,
    title: 'Mungkin salah: "discuss about"',
    detail: '"Discuss" tidak memerlukan "about": "We discussed the problem."',
  },
  {
    id: 'uncountable-plural',
    regex: /\b(?:informations|advices|knowledges|homeworks|equipments|furnitures|luggages)\b/gi,
    title: 'Mungkin salah: kata nama tidak boleh dikira dalam bentuk jamak',
    detail: 'Perkataan seperti information, advice, knowledge dan homework tidak menerima -s.',
  },
  {
    id: 'although-but',
    regex: /\balthough\b[^.!?]*\bbut\b/gi,
    title: 'Mungkin salah: "although ... but" dalam satu ayat',
    detail: 'Dalam bahasa Inggeris, gunakan sama ada "although" atau "but", bukan kedua-duanya.',
  },
  {
    id: 'opinion-think',
    regex: /\bin my opinion,?\s+i\s+think\b/gi,
    title: 'Gaya: "In my opinion, I think"',
    detail: 'Kedua-duanya bermaksud perkara yang sama. Pilih satu sahaja.',
  },
];

function snippet(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 20);
  const end = Math.min(text.length, index + length + 20);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${end < text.length ? '…' : ''}`;
}

function collectMatches(text: string, regex: RegExp, limit = 3): string[] {
  const out: string[] = [];
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`);
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) && out.length < limit) {
    out.push(snippet(text, m.index, m[0].length));
    if (m[0].length === 0) re.lastIndex++;
  }
  return out;
}

function countMatches(text: string, regex: RegExp): number {
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : `${regex.flags}g`);
  return (text.match(re) ?? []).length;
}

export function detectPointHints(text: string, points: RequiredPoint[]): PointHint[] {
  const lower = text.toLowerCase();
  return points.map((p) => ({
    id: p.id,
    text: p.text,
    detected: p.keywords.some((k) => lower.includes(k.toLowerCase())),
  }));
}

const GREETING = /^(dear|hi|hello|hey|assalamualaikum|good (morning|afternoon|evening))\b/i;
const SIGN_OFF =
  /(best wishes|best regards|kind regards|warm regards|regards|yours sincerely|yours faithfully|sincerely|love|take care|cheers|see you|thank you|thanks)\b/i;

export function analyzeWriting(text: string, prompt?: Pick<WritingPrompt, 'type' | 'register' | 'wordGuide' | 'requiredPoints'>): WritingAnalysis {
  const words = countWords(text);
  const paragraphsList = splitParagraphs(text);
  const sentenceList = splitSentences(text);
  const sentences = countSentences(text);
  const points = prompt ? detectPointHints(text, prompt.requiredPoints) : [];
  const linkingWords = findLinkingWords(text);

  if (words === 0) {
    return {
      empty: true,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      avgSentenceLength: 0,
      issues: [
        {
          id: 'empty',
          severity: 'warning',
          category: 'length',
          title: 'Tiada jawapan',
          detail: 'Ruang jawapan masih kosong. Tulis respons anda dahulu.',
        },
      ],
      points: points.map((p) => ({ ...p, detected: false })),
      linkingWords: [],
    };
  }

  const issues: WritingIssue[] = [];
  const add = (issue: WritingIssue) => issues.push(issue);

  // Length against this task's guidance.
  if (prompt?.wordGuide) {
    const { min, max } = prompt.wordGuide;
    if (words < min) {
      add({
        id: 'too-short',
        severity: 'warning',
        category: 'length',
        title: `Kurang daripada panduan perkataan (${words}/${min})`,
        detail: `Panduan untuk latihan ini ialah ${min}–${max} patah perkataan. Respons yang terlalu pendek biasanya tidak menghuraikan semua isi yang diminta.`,
      });
    } else if (words > Math.round(max * 1.15)) {
      add({
        id: 'too-long',
        severity: 'info',
        category: 'length',
        title: `Melebihi panduan perkataan (${words}/${max})`,
        detail: 'Tulisan yang terlalu panjang meningkatkan risiko kesilapan dan mengambil masa. Pastikan setiap ayat relevan dengan tugasan.',
      });
    }
  }

  // Formatting.
  const doubleSpaces = countMatches(text, /\S[^\S\n]{2,}\S/g);
  if (doubleSpaces > 0) {
    add({
      id: 'double-space',
      severity: 'info',
      category: 'format',
      title: `Ruang berganda (${doubleSpaces})`,
      detail: 'Terdapat dua atau lebih ruang di antara perkataan. Gunakan satu ruang sahaja.',
      examples: collectMatches(text, /\S[^\S\n]{2,}\S/g),
    });
  }

  const spaceBeforePunct = countMatches(text, /\w[^\S\n]+[,.!?;:](?=\s|$)/g);
  if (spaceBeforePunct > 0) {
    add({
      id: 'space-before-punct',
      severity: 'info',
      category: 'mechanics',
      title: `Ruang sebelum tanda baca (${spaceBeforePunct})`,
      detail: 'Dalam bahasa Inggeris, tanda koma dan noktah diletakkan rapat dengan perkataan sebelumnya: "However, ..." bukan "However , ...".',
      examples: collectMatches(text, /\w[^\S\n]+[,.!?;:](?=\s|$)/g),
    });
  }

  // Tokens like "fun.It" or "however,we" — skipping emails, web addresses and numbers.
  const missingSpaceTokens = text
    .split(/\s+/)
    .filter((t) => /[A-Za-z]{2}[,;!?.][A-Za-z]{2}/.test(t) && !/@|www\.|https?:|\.(com|my|org|net|edu|gov)\b/i.test(t));
  if (missingSpaceTokens.length > 0) {
    add({
      id: 'missing-space',
      severity: 'info',
      category: 'mechanics',
      title: `Mungkin tiada ruang selepas tanda baca (${missingSpaceTokens.length})`,
      detail: 'Letakkan satu ruang selepas koma, noktah, tanda soal dan tanda seru.',
      examples: missingSpaceTokens.slice(0, 3),
    });
  }

  // Capitalisation.
  const lowerStart = /[.!?]\s+[a-z]/g;
  const lowerStartCount = countMatches(text, lowerStart);
  const paragraphLowerStarts = paragraphsList.filter((p) => /^[a-z]/.test(p)).length;
  if (lowerStartCount + paragraphLowerStarts > 0) {
    add({
      id: 'lowercase-start',
      severity: 'warning',
      category: 'mechanics',
      title: `Ayat mungkin bermula dengan huruf kecil (${lowerStartCount + paragraphLowerStarts})`,
      detail: 'Setiap ayat baharu dan setiap perenggan perlu bermula dengan huruf besar.',
      examples: [...collectMatches(text, lowerStart), ...paragraphsList.filter((p) => /^[a-z]/.test(p)).map((p) => snippet(p, 0, 0))].slice(0, 3),
    });
  }

  const lowerI = /(^|[\s("])i(?=[\s,.!?']|$)/gm;
  const lowerICount = countMatches(text, lowerI);
  if (lowerICount > 0) {
    add({
      id: 'lowercase-i',
      severity: 'warning',
      category: 'mechanics',
      title: `"i" ditulis dengan huruf kecil (${lowerICount})`,
      detail: 'Kata ganti nama "I" sentiasa ditulis dengan huruf besar, termasuk "I\'m" dan "I\'ll".',
      examples: collectMatches(text, lowerI),
    });
  }

  const repeated = /\b([A-Za-z]+)\s+\1\b/gi;
  const repeatedMatches = (text.match(repeated) ?? []).filter((m) => !/^(that that|had had)$/i.test(m));
  if (repeatedMatches.length > 0) {
    add({
      id: 'repeated-word',
      severity: 'info',
      category: 'mechanics',
      title: `Perkataan berulang (${repeatedMatches.length})`,
      detail: 'Perkataan yang sama ditulis dua kali berturut-turut. Mungkin ini kesilapan taip.',
      examples: repeatedMatches.slice(0, 3),
    });
  }

  if (/[!?]{2,}/.test(text)) {
    add({
      id: 'multi-punct',
      severity: 'info',
      category: 'mechanics',
      title: 'Tanda baca berganda',
      detail: 'Elakkan "!!" atau "??". Satu tanda seru sudah mencukupi, terutamanya dalam penulisan formal.',
      examples: collectMatches(text, /[!?]{2,}/g),
    });
  }

  const unfinished = paragraphsList.filter((p) => countWords(p) >= 8 && !/[.!?]["')\]]*$/.test(p));
  if (unfinished.length > 0) {
    add({
      id: 'no-end-punct',
      severity: 'warning',
      category: 'mechanics',
      title: `Perenggan tanpa tanda noktah di akhir (${unfinished.length})`,
      detail: 'Ayat terakhir dalam perenggan perlu diakhiri dengan noktah, tanda soal atau tanda seru.',
      examples: unfinished.slice(0, 3).map((p) => `…${p.slice(-40)}`),
    });
  }

  const longSentences = sentenceList.filter((s) => countWords(s) > 35);
  if (longSentences.length > 0) {
    add({
      id: 'long-sentence',
      severity: 'info',
      category: 'style',
      title: `Ayat yang sangat panjang (${longSentences.length})`,
      detail: 'Ayat melebihi 35 patah perkataan sukar dibaca dan mungkin ayat bercantum (run-on). Pertimbangkan untuk membahagikannya kepada dua ayat.',
      examples: longSentences.slice(0, 2).map((s) => `${s.slice(0, 80)}…`),
    });
  }

  // Repeated sentence openings, e.g. many sentences starting with "I".
  if (sentenceList.length >= 5) {
    const starts = new Map<string, number>();
    for (const s of sentenceList) {
      const first = s.match(/^[^A-Za-z]*([A-Za-z']+)/)?.[1]?.toLowerCase();
      if (first) starts.set(first, (starts.get(first) ?? 0) + 1);
    }
    for (const [word, n] of starts) {
      if (n >= 4 && n / sentenceList.length >= 0.4) {
        add({
          id: `repeated-start-${word}`,
          severity: 'info',
          category: 'style',
          title: `Banyak ayat bermula dengan "${word}" (${n})`,
          detail: 'Variasikan permulaan ayat, contohnya dengan frasa masa, penanda wacana atau subjek yang berbeza.',
        });
      }
    }
  }

  // Pattern-based possible errors.
  for (const rule of PATTERN_RULES) {
    const re = new RegExp(rule.regex.source, rule.regex.flags);
    const found: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const previous = m[1]?.trim().toLowerCase().replace(/[^a-z']/g, '');
      if (rule.allowAfter && previous && rule.allowAfter.includes(previous)) continue;
      found.push(snippet(text, m.index, m[0].length));
    }
    if (found.length > 0) {
      add({
        id: `pattern-${rule.id}`,
        severity: 'warning',
        category: 'pattern',
        title: rule.title,
        detail: rule.detail,
        examples: found.slice(0, 3),
      });
    }
  }

  // Type-specific structure.
  if (prompt?.type === 'email') {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const first = lines[0] ?? '';
    if (!GREETING.test(first)) {
      add({
        id: 'no-greeting',
        severity: 'warning',
        category: 'structure',
        title: 'Salam pembuka tidak dikesan',
        detail: 'Emel biasanya bermula dengan salam pada baris pertama, contohnya "Dear Mr Lim," atau "Hi Aina,".',
      });
    } else if (prompt.register === 'formal' && /^(hi|hey|hello)\b/i.test(first)) {
      add({
        id: 'informal-greeting',
        severity: 'info',
        category: 'structure',
        title: 'Salam mungkin terlalu tidak formal',
        detail: 'Untuk emel formal (contohnya kepada guru atau pengetua), "Dear Sir/Madam," atau "Dear Mr/Ms ...," lebih sesuai.',
      });
    }
    const tail = lines.slice(-3).join(' ');
    if (!SIGN_OFF.test(tail)) {
      add({
        id: 'no-sign-off',
        severity: 'warning',
        category: 'structure',
        title: 'Penutup emel tidak dikesan',
        detail: 'Akhiri emel dengan penutup seperti "Best wishes," atau "Yours sincerely," diikuti nama anda.',
      });
    }
    if (prompt.register === 'formal') {
      const contractions = countMatches(text, /\b[A-Za-z]+'(?:t|re|ll|ve|m|d)\b/g);
      if (contractions > 0) {
        add({
          id: 'contractions',
          severity: 'info',
          category: 'style',
          title: `Bentuk singkatan dalam emel formal (${contractions})`,
          detail: 'Dalam penulisan formal, bentuk penuh seperti "I am" dan "do not" lebih sesuai daripada "I\'m" dan "don\'t".',
          examples: collectMatches(text, /\b[A-Za-z]+'(?:t|re|ll|ve|m|d)\b/g),
        });
      }
    }
  }

  if (prompt?.type === 'essay') {
    if (paragraphsList.length < 3) {
      add({
        id: 'few-paragraphs',
        severity: 'warning',
        category: 'structure',
        title: `Hanya ${paragraphsList.length} perenggan dikesan`,
        detail: 'Esei biasanya mempunyai pendahuluan, sekurang-kurangnya satu atau dua perenggan isi, dan penutup. Tinggalkan satu baris kosong di antara perenggan.',
      });
    }
    if (words >= 80 && !/\b(in conclusion|to sum up|in short|all in all|to conclude|overall)\b/i.test(text)) {
      add({
        id: 'no-conclusion-marker',
        severity: 'info',
        category: 'structure',
        title: 'Penanda penutup tidak dikesan',
        detail: 'Ini bukan kesalahan, tetapi frasa seperti "In conclusion," membantu pembaca mengenal pasti perenggan penutup.',
      });
    }
  }

  if (words >= 60 && linkingWords.length === 0) {
    add({
      id: 'no-linking',
      severity: 'info',
      category: 'style',
      title: 'Tiada penanda wacana dikesan',
      detail: 'Penanda wacana seperti "Furthermore", "For example" dan "However" membantu menghubungkan idea.',
    });
  }

  return {
    empty: false,
    words,
    sentences,
    paragraphs: paragraphsList.length,
    avgSentenceLength: sentences > 0 ? Math.round((words / sentences) * 10) / 10 : words,
    issues,
    points,
    linkingWords,
  };
}
