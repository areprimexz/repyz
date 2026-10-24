import type { Question } from '../../types/content';

const CHECK_PARAGRAPH =
  'Task: Write an email to a friend about your last holiday.\n\nStudent paragraph:\n"Last holiday, my family and I goes to Langkawi. we stayed in a small hotel near the beach. The beach was very very beautiful, we swam every morning. Although the weather was hot, but we enjoyed ourselves."';

function correction(
  id: string,
  tag: string,
  text: string,
  accepted: string[],
  explanation: string,
  difficulty: 1 | 2 | 3 = 1,
): Question {
  return {
    id,
    type: 'correction',
    skill: 'grammar',
    tag,
    difficulty,
    prompt: 'Find the error and rewrite the whole sentence correctly.',
    text,
    accepted,
    explanation,
  };
}

export const day3Questions: Question[] = [
  // ---------------------------------------------------- Lesson 3.3 (guided)
  correction(
    'd3l3-1',
    'sva',
    'She go to school every day.',
    ['She goes to school every day.'],
    '"She" ialah subjek tunggal orang ketiga. Dalam simple present, tambah -es: "goes". Dalam BM, kata kerja tidak berubah mengikut subjek — sebab itu kesilapan ini lazim.',
  ),
  correction(
    'd3l3-2',
    'sva',
    'He have two brothers.',
    ['He has two brothers.'],
    '"He", "she" dan "it" menggunakan "has", bukan "have", dalam ayat positif simple present.',
  ),
  correction(
    'd3l3-3',
    'word-choice',
    'I am agree.',
    ['I agree.'],
    '"Agree" sudah menjadi kata kerja. "Am" tidak diperlukan. Bentuk negatif: "I do not agree" atau "I disagree".',
  ),
  correction(
    'd3l3-4',
    'sva',
    'They was happy.',
    ['They were happy.'],
    'Subjek jamak dan "you/we/they" menggunakan "were" dalam kala lampau. "Was" hanya untuk I/he/she/it dan subjek tunggal.',
  ),
  correction(
    'd3l3-5',
    'word-choice',
    'I very like this activity.',
    ['I really like this activity.', 'I like this activity very much.', 'I really enjoy this activity.', 'I enjoy this activity very much.'],
    '"Very" menerangkan kata sifat atau kata keterangan (very happy, very quickly), bukan kata kerja. Gunakan "really like" atau "like ... very much".',
  ),
  correction(
    'd3l3-6',
    'tenses',
    'Yesterday we buy a new fan.',
    ['Yesterday we bought a new fan.', 'Yesterday, we bought a new fan.'],
    '"Yesterday" memerlukan kala lampau. Bentuk lampau "buy" ialah "bought" (tidak sekata).',
  ),
  correction(
    'd3l3-7',
    'articles',
    'I want to buy a umbrella.',
    ['I want to buy an umbrella.'],
    '"Umbrella" bermula dengan bunyi vokal, jadi gunakan "an".',
  ),

  // --------------------------------------------------- Lesson 3.3 (practice)
  correction(
    'd3l3-8',
    'sva',
    'My father work in a factory.',
    ['My father works in a factory.'],
    '"My father" = "he", jadi kata kerja simple present perlu -s: "works".',
  ),
  correction(
    'd3l3-9',
    'word-choice',
    'Can you borrow me your ruler?',
    ['Can you lend me your ruler?', 'Could you lend me your ruler?', 'Can I borrow your ruler?', 'Could I borrow your ruler?'],
    '"Lend" = beri pinjam; "borrow" = pinjam daripada. Anda meminta orang lain memberi pinjam: "Can you lend me...?" atau "Can I borrow...?"',
    2,
  ),
  correction(
    'd3l3-10',
    'word-choice',
    'Please on the fan.',
    ['Please switch on the fan.', 'Please turn on the fan.'],
    '"On" bukan kata kerja dalam bahasa Inggeris. Gunakan "switch on" atau "turn on" (dan "switch off/turn off").',
    2,
  ),
  correction(
    'd3l3-11',
    'nouns',
    'The informations are very useful.',
    ['The information is very useful.'],
    '"Information" tidak boleh dikira: tiada -s dan menggunakan kata kerja tunggal "is".',
    2,
  ),
  correction(
    'd3l3-12',
    'sentences',
    'Although I was tired, but I finished my homework.',
    ['Although I was tired, I finished my homework.', 'I was tired, but I finished my homework.'],
    'Gunakan "although" ATAU "but", bukan kedua-duanya. Struktur "Walaupun... tetapi..." dalam BM tidak diterjemah terus.',
    2,
  ),
  correction(
    'd3l3-13',
    'pronouns',
    'I and my sister like to cook.',
    ['My sister and I like to cook.'],
    'Konvensyen sopan dalam bahasa Inggeris: sebut orang lain dahulu, kemudian "I": "My sister and I...".',
    2,
  ),
  correction(
    'd3l3-14',
    'word-choice',
    'He is more taller than me.',
    ['He is taller than me.', 'He is taller than I am.'],
    '"Taller" sudah bermaksud "lebih tinggi". Jangan tambah "more" kepada kata sifat yang menggunakan -er.',
    2,
  ),

  // ---------------------------------------------------------- Lesson 3.4
  {
    id: 'd3l4-1',
    type: 'multi',
    skill: 'grammar',
    tag: 'review',
    context: CHECK_PARAGRAPH,
    prompt: 'Which checklist problems does this paragraph have? Select all that apply.',
    options: [
      { id: 'a', text: 'A wrong verb form ("goes" should be past tense)' },
      { id: 'b', text: 'A sentence that starts with a small letter' },
      { id: 'c', text: 'Two sentences joined with only a comma' },
      { id: 'd', text: '"Although" and "but" used together' },
      { id: 'e', text: 'A spelling mistake in "beach"' },
    ],
    answer: ['a', 'b', 'c', 'd'],
    explanation:
      '"Goes" perlu "went" (kala lampau, subjek jamak). "we" perlu huruf besar. "The beach was very very beautiful, we swam..." ialah ayat bercantum. "Although... but" ialah kesilapan. Ejaan "beach" betul.',
  },
  {
    id: 'd3l4-2',
    type: 'correction',
    skill: 'grammar',
    tag: 'tenses',
    context: CHECK_PARAGRAPH,
    prompt: 'Correct the first sentence. Rewrite the whole sentence.',
    text: 'Last holiday, my family and I goes to Langkawi.',
    accepted: ['Last holiday, my family and I went to Langkawi.'],
    explanation: '"Last holiday" menunjukkan masa lampau, jadi gunakan "went". Subjek "my family and I" juga jamak, jadi "goes" salah dari dua segi.',
  },
  {
    id: 'd3l4-3',
    type: 'mcq',
    skill: 'grammar',
    tag: 'sentences',
    context: CHECK_PARAGRAPH,
    prompt: 'Which is the best revision of "The beach was very very beautiful, we swam every morning."?',
    options: [
      { id: 'a', text: 'The beach was beautiful, so we swam every morning.' },
      { id: 'b', text: 'The beach was very very beautiful, we swam every morning.' },
      { id: 'c', text: 'The beach very beautiful we swam every morning.' },
      { id: 'd', text: 'The beach was very very very beautiful. Swam every morning.' },
    ],
    answer: ['a'],
    explanation:
      'Pilihan (a) membuang pengulangan "very very" dan menyambung dua ayat dengan "so". Pilihan (d) mempunyai fragmen ("Swam every morning." tiada subjek).',
  },
  {
    id: 'd3l4-4',
    type: 'mcq',
    skill: 'grammar',
    tag: 'review',
    prompt: 'When you review your writing, what should you check FIRST?',
    options: [
      { id: 'a', text: 'Did I answer every part of the question?' },
      { id: 'b', text: 'Are all my commas perfect?' },
      { id: 'c', text: 'Did I use at least ten difficult words?' },
      { id: 'd', text: 'Is my handwriting neat?' },
    ],
    answer: ['a'],
    explanation:
      'Semak daripada besar kepada kecil: isi tugasan dahulu, kemudian struktur, kemudian ayat dan tatabahasa, akhir sekali ejaan dan tanda baca. Tulisan yang sempurna tetapi tidak menjawab soalan tetap kehilangan markah.',
  },
  {
    id: 'd3l4-5',
    type: 'truefalse',
    skill: 'grammar',
    tag: 'review',
    prompt: 'True or false: If my writing has no grammar mistakes, it is a strong answer even if it misses a required point.',
    options: [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ],
    answer: ['false'],
    explanation: 'Salah. Ketepatan tatabahasa penting, tetapi isi yang tertinggal bermakna tugasan tidak dipenuhi sepenuhnya.',
  },
];
