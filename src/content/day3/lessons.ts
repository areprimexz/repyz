import type { Lesson, QuizActivity } from '../../types/content';

function check(topic: string, questionIds: string[]): QuizActivity {
  return {
    kind: 'quiz',
    id: `d3-l1-check-${topic}`,
    role: 'guided',
    title: 'Semak pantas',
    feedback: 'instant',
    questionIds,
  };
}

export const day3Lessons: Lesson[] = [
  // =========================================================================
  {
    id: 'd3-l1',
    day: 3,
    number: '3.1',
    title: 'Essential Grammar',
    objective: 'Mengukuhkan lapan topik tatabahasa yang paling kerap menjejaskan penulisan emel dan esei.',
    objectives: [
      'Menggunakan persetujuan subjek–kata kerja dan kala asas dengan tepat.',
      'Memilih artikel, kata sendi nama dan penanda kuantiti yang betul.',
      'Menggunakan kata ganti nama dan milikan dengan betul.',
      'Mengenal pasti fragmen dan ayat bercantum, serta membetulkan huruf besar dan tanda baca.',
    ],
    durationMin: 25,
    skill: 'grammar',
    parts: [
      {
        id: 'sva',
        title: '1. Persetujuan subjek–kata kerja (Subject-verb agreement)',
        blocks: [
          {
            kind: 'text',
            paragraphs: [
              'Dalam bahasa Inggeris, kata kerja **berubah mengikut subjek**. Dalam simple present, subjek tunggal orang ketiga (he, she, it, my brother, the cat) menggunakan kata kerja dengan **-s/-es**. Subjek lain (I, you, we, they, my friends) menggunakan kata kerja dasar.',
            ],
          },
          {
            kind: 'table',
            columns: ['Subjek', 'be (kini)', 'be (lampau)', 'have', 'Kata kerja biasa'],
            rows: [
              ['I', 'am', 'was', 'have', 'play'],
              ['he / she / it / Ali', 'is', 'was', 'has', 'plays'],
              ['you / we / they / my friends', 'are', 'were', 'have', 'play'],
            ],
          },
          {
            kind: 'compare',
            weakLabel: 'Salah',
            strongLabel: 'Betul',
            items: [
              { weak: 'My sister play the piano.', strong: 'My sister plays the piano.', why: '"My sister" = she → plays.' },
              { weak: 'Ali and Ravi is my classmates.', strong: 'Ali and Ravi are my classmates.', why: 'Dua orang = subjek jamak → are.' },
            ],
          },
        ],
        check: check('sva', ['g-sva-1', 'g-sva-2']),
      },
      {
        id: 'tenses',
        title: '2. Kala asas (Basic verb tenses)',
        blocks: [
          {
            kind: 'table',
            columns: ['Kala', 'Bila digunakan', 'Kata petunjuk', 'Contoh'],
            rows: [
              ['Simple present', 'Kebiasaan, fakta', 'every day, usually, always', 'She walks to school every day.'],
              ['Present continuous', 'Sedang berlaku sekarang', 'now, Look!, at the moment', 'They are playing football now.'],
              ['Simple past', 'Selesai pada masa lampau', 'yesterday, last week, in 2023', 'We visited Melaka last week.'],
              ['Past continuous', 'Sedang berlaku pada masa lampau', 'while, when', 'I was reading when you called.'],
              ['Present perfect', 'Bermula dahulu, berkaitan sekarang', 'since, for, ever, already', 'I have lived here since 2019.'],
              ['Future', 'Masa hadapan', 'tomorrow, next week', 'We will visit the zoo tomorrow.'],
            ],
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Konsisten',
            body: 'Jika anda menceritakan peristiwa lampau (contohnya pengalaman lawatan), kekalkan kala lampau dari awal hingga akhir. Banyak kata kerja lampau tidak sekata: go → went, buy → bought, see → saw, eat → ate.',
          },
        ],
        check: check('tenses', ['g-ten-1', 'g-ten-2']),
      },
      {
        id: 'articles',
        title: '3. Artikel: a, an, the',
        blocks: [
          {
            kind: 'list',
            items: [
              '**a** sebelum bunyi konsonan: a book, a university (bunyi "yu"), a European country.',
              '**an** sebelum bunyi vokal: an apple, an hour (h tidak dibunyikan), an honest boy.',
              '**the** untuk perkara khusus yang pembaca tahu, sesuatu yang unik, atau yang sudah disebut: the sun, the principal of our school.',
              '**Tiada artikel** untuk perkara umum dalam bentuk jamak atau tidak boleh dikira: Students need sleep. Water is important.',
            ],
          },
          {
            kind: 'compare',
            weakLabel: 'Salah',
            strongLabel: 'Betul',
            items: [
              { weak: 'She is a honest girl.', strong: 'She is an honest girl.', why: 'Bunyi pertama "honest" ialah vokal.' },
              { weak: 'I saw a dog. A dog was barking.', strong: 'I saw a dog. The dog was barking.', why: 'Kali kedua disebut → "the".' },
            ],
          },
        ],
        check: check('articles', ['g-art-1', 'g-art-2']),
      },
      {
        id: 'prepositions',
        title: '4. Kata sendi nama (Prepositions)',
        blocks: [
          {
            kind: 'table',
            columns: ['', 'at', 'on', 'in'],
            rows: [
              ['Masa', 'at 8 a.m., at noon, at night', 'on Monday, on 5 May, on my birthday', 'in May, in 2025, in the morning'],
              ['Tempat', 'at school, at the bus stop', 'on the table, on the wall', 'in the classroom, in Kuala Lumpur'],
            ],
          },
          {
            kind: 'keyterms',
            heading: 'Pasangan lazim',
            items: [
              { term: 'good at', meaning: 'pandai dalam', example: 'She is good at drawing.' },
              { term: 'interested in', meaning: 'berminat dengan', example: 'He is interested in robotics.' },
              { term: 'afraid of', meaning: 'takut akan', example: 'I am afraid of heights.' },
              { term: 'depend on', meaning: 'bergantung pada', example: 'It depends on the weather.' },
              { term: 'arrive at / in', meaning: 'tiba di', example: 'We arrived at the station. / We arrived in Ipoh.' },
            ],
          },
        ],
        check: check('prepositions', ['g-prep-1', 'g-prep-2']),
      },
      {
        id: 'nouns',
        title: '5. Kata nama boleh dan tidak boleh dikira',
        blocks: [
          {
            kind: 'text',
            paragraphs: [
              'Kata nama **boleh dikira** mempunyai bentuk jamak (book → books) dan boleh menggunakan a/an. Kata nama **tidak boleh dikira** tiada bentuk jamak dan tidak menggunakan a/an.',
            ],
          },
          {
            kind: 'table',
            columns: ['', 'Boleh dikira', 'Tidak boleh dikira'],
            rows: [
              ['Contoh', 'book, student, idea, suggestion', 'advice, information, homework, furniture, equipment, knowledge'],
              ['Banyak', 'many books', 'much homework / a lot of homework'],
              ['Sedikit', 'a few ideas', 'a little information'],
              ['Satu', 'an idea', 'a piece of advice'],
            ],
          },
        ],
        check: check('nouns', ['g-noun-1', 'g-noun-2']),
      },
      {
        id: 'pronouns',
        title: '6. Kata ganti nama dan milikan',
        blocks: [
          {
            kind: 'table',
            columns: ['Subjek', 'Objek', 'Milik + kata nama', 'Milik (berdiri sendiri)'],
            rows: [
              ['I', 'me', 'my book', 'mine'],
              ['you', 'you', 'your book', 'yours'],
              ['he / she', 'him / her', 'his / her book', 'his / hers'],
              ['it', 'it', 'its colour', '—'],
              ['we / they', 'us / them', 'our / their book', 'ours / theirs'],
            ],
          },
          {
            kind: 'callout',
            tone: 'warning',
            title: 'Perkataan yang sering keliru',
            body: '"its" (milik) vs "it\'s" (it is). "their" (milik mereka) vs "there" (di sana) vs "they\'re" (they are). Milikan TIDAK menggunakan apostrof: yours, hers, its.',
          },
        ],
        check: check('pronouns', ['g-pro-1', 'g-pro-2']),
      },
      {
        id: 'sentences',
        title: '7. Fragmen dan ayat bercantum',
        blocks: [
          {
            kind: 'text',
            paragraphs: [
              '**Fragmen** ialah ayat yang tidak lengkap — tiada subjek, tiada kata kerja, atau hanya klausa bergantung (Because I was tired.). **Ayat bercantum (run-on)** berlaku apabila dua ayat lengkap disambung tanpa tanda baca atau hanya dengan koma.',
            ],
          },
          {
            kind: 'compare',
            weakLabel: 'Bermasalah',
            strongLabel: 'Dibetulkan',
            items: [
              { weak: 'Because it was raining.', strong: 'We stayed indoors because it was raining.', why: 'Fragmen disambung dengan klausa utama.' },
              { weak: 'I finished my homework, I watched TV.', strong: 'I finished my homework, and then I watched TV.', why: 'Koma sahaja tidak cukup; tambah kata hubung atau gunakan noktah.' },
            ],
          },
        ],
        check: check('sentences', ['g-sen-1', 'g-sen-2']),
      },
      {
        id: 'mechanics',
        title: '8. Huruf besar dan tanda baca',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Huruf besar:** permulaan ayat, "I", nama orang dan tempat, hari, bulan, bahasa (English, Malay), dan gelaran (Mr Lee, Puan Aminah).',
              '**Noktah / tanda soal:** setiap ayat berakhir dengan . ? atau !',
              '**Koma:** dalam senarai (pens, books and rulers) dan selepas penanda wacana di awal ayat (However, ...).',
              '**Apostrof:** milikan (my friend\'s house) dan singkatan (don\'t, it\'s).',
            ],
          },
        ],
        check: check('mechanics', ['g-mech-1', 'g-mech-2']),
      },
    ],
    activities: [
      {
        kind: 'quiz',
        id: 'd3-l1-practice',
        role: 'practice',
        title: 'Latihan kendiri: Campuran lapan topik',
        intro: 'Jawab semua soalan, kemudian hantar. Kesilapan akan direkodkan dalam Buku Kesilapan.',
        feedback: 'end',
        questionIds: ['g-sva-4', 'g-ten-3', 'g-art-3', 'g-prep-3', 'g-noun-3', 'g-pro-3', 'g-sen-3', 'g-mech-3'],
      },
    ],
    summary: [
      'Semak subjek dahulu, kemudian pilih bentuk kata kerja yang sepadan.',
      'Kekalkan kala yang konsisten; hafal kata kerja tidak sekata yang lazim.',
      'a/an ikut bunyi; at/on/in ikut jenis masa dan tempat; uncountable tiada -s.',
      'Setiap ayat perlu lengkap, bermula dengan huruf besar dan berakhir dengan tanda baca.',
    ],
  },

  // =========================================================================
  {
    id: 'd3-l2',
    day: 3,
    number: '3.2',
    title: 'Vocabulary Revision',
    objective: 'Mengulang kaji kosa kata kem secara berjarak dan menguji penguasaan berdasarkan jawapan sebenar.',
    objectives: [
      'Mengulang kaji perkataan penting dari Hari 1 hingga Hari 3.',
      'Memahami cara ulang kaji berjarak (spaced revision) dalam Vocabulary Lab.',
      'Menguji maksud dan penggunaan perkataan dalam ayat.',
    ],
    durationMin: 25,
    skill: 'vocabulary',
    parts: [
      {
        id: 'spaced',
        title: 'Bagaimana ulang kaji berjarak berfungsi',
        blocks: [
          {
            kind: 'text',
            paragraphs: [
              'Otak lebih mudah mengingati perkataan yang **diulang kaji beberapa kali dengan selang masa**. Vocabulary Lab menggunakan sistem kotak (Leitner):',
            ],
          },
          {
            kind: 'list',
            items: [
              'Jawapan **betul** semasa perkataan perlu diulang kaji → perkataan naik ke kotak seterusnya dan diuji semula selepas selang yang lebih panjang (10 minit → 1 hari → 3 hari → 7 hari).',
              'Jawapan **salah** → perkataan kembali ke kotak permulaan dan ditanda "Perlu latihan".',
              'Perkataan dianggap **dikuasai** selepas dijawab betul dalam beberapa sesi ulang kaji yang berasingan (kotak 3 ke atas).',
              'Menanda "Saya tahu" pada kad imbas hanya catatan peribadi — ia **tidak** dikira sebagai penguasaan sehingga anda menjawab kuiz dengan betul.',
            ],
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Gunakan perkataan dalam ayat',
            body: 'Selepas setiap sesi, cuba tulis satu ayat sendiri dengan perkataan yang anda salah jawab. Perkataan yang digunakan dalam ayat lebih mudah diingati.',
          },
        ],
      },
      {
        id: 'errors',
        title: 'Kesilapan penggunaan yang lazim',
        blocks: [
          {
            kind: 'compare',
            weakLabel: 'Salah',
            strongLabel: 'Betul',
            items: [
              { weak: 'She gave me many advices.', strong: 'She gave me a lot of advice.', why: '"Advice" tidak boleh dikira.' },
              { weak: 'We attended to the ceremony.', strong: 'We attended the ceremony.', why: '"Attend" (hadir) tidak memerlukan "to".' },
              { weak: 'I am very excited about the trip. The trip is excited.', strong: 'I am very excited about the trip. The trip is exciting.', why: '-ed untuk perasaan, -ing untuk perkara yang menyebabkan perasaan.' },
              { weak: 'He is addicted with games.', strong: 'He is addicted to games.', why: 'Pasangan tetap: addicted to.' },
            ],
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'quiz',
        id: 'd3-l2-guided',
        role: 'guided',
        title: 'Latihan berpandu: Maksud dan konteks',
        intro: 'Jawapan anda di sini juga dikemas kini dalam Vocabulary Lab.',
        feedback: 'instant',
        questionIds: [
          'v:meaning:recommend',
          'v:word:advice',
          'v:cloze:attend',
          'v:meaning:essential',
          'v:cloze:reduce',
          'v:word:knowledge',
          'v:cloze:addicted',
          'v:meaning:punctual',
        ],
      },
      {
        kind: 'quiz',
        id: 'd3-l2-practice',
        role: 'practice',
        title: 'Latihan kendiri: Ujian kosa kata',
        feedback: 'end',
        questionIds: [
          'v:cloze:opportunity',
          'v:meaning:convenient',
          'v:word:protect',
          'v:cloze:encourage',
          'v:meaning:significant',
          'v:cloze:aware',
          'v:word:responsible',
          'v:cloze:efficient',
          'v:meaning:accommodation',
          'v:cloze:priority',
        ],
      },
    ],
    summary: [
      'Ulang kaji berjarak: betul → selang lebih panjang; salah → ulang semula.',
      'Penguasaan diukur melalui jawapan kuiz, bukan dengan membuka kad imbas.',
      'Perhatikan kesilapan penggunaan: advice (uncountable), attend (tanpa "to"), excited/exciting.',
    ],
  },

  // =========================================================================
  {
    id: 'd3-l3',
    day: 3,
    number: '3.3',
    title: 'Correct Common Mistakes',
    objective: 'Mengenal pasti dan membetulkan kesilapan lazim pelajar Malaysia dengan memahami sebab tatabahasanya.',
    objectives: [
      'Mengenal pasti kesilapan lazim dalam ayat.',
      'Membetulkan ayat dan menerangkan sebabnya.',
      'Mengesan kategori kesilapan yang berulang dalam Buku Kesilapan.',
    ],
    durationMin: 15,
    skill: 'grammar',
    parts: [
      {
        id: 'why',
        title: 'Mengapa kesilapan ini berlaku?',
        blocks: [
          {
            kind: 'text',
            paragraphs: [
              'Banyak kesilapan lazim berlaku kerana kita **menterjemah terus daripada Bahasa Melayu**. Dalam BM, kata kerja tidak berubah mengikut subjek atau masa ("Dia pergi", "Mereka pergi", "Semalam dia pergi"), tetapi dalam bahasa Inggeris ia berubah. Memahami punca kesilapan membantu anda mengelakkannya.',
            ],
          },
          {
            kind: 'table',
            columns: ['Kesilapan', 'Punca', 'Pembetulan'],
            rows: [
              ['She go to school.', 'Kata kerja BM tidak berubah', 'She goes to school.'],
              ['I am agree.', 'Terjemahan "saya setuju" + "am"', 'I agree.'],
              ['I very like it.', '"Saya sangat suka"', 'I really like it. / I like it very much.'],
              ['Please on the fan.', '"Tolong buka kipas"', 'Please switch on the fan.'],
              ['Although..., but...', '"Walaupun..., tetapi..."', 'Although..., ... (tanpa "but")'],
            ],
          },
          {
            kind: 'callout',
            tone: 'info',
            title: 'Buku Kesilapan',
            body: 'Setiap jawapan salah anda direkodkan mengikut kategori (contohnya persetujuan subjek–kata kerja). Lihat halaman Kemajuan untuk mengetahui kategori yang paling kerap anda salah dan cadangan pelajaran untuk diulang kaji.',
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'quiz',
        id: 'd3-l3-guided',
        role: 'guided',
        title: 'Latihan berpandu: Betulkan kesilapan',
        intro: 'Tulis semula ayat yang betul. Tukar hanya bahagian yang salah.',
        feedback: 'instant',
        questionIds: ['d3l3-1', 'd3l3-2', 'd3l3-3', 'd3l3-4', 'd3l3-5', 'd3l3-6', 'd3l3-7'],
      },
      {
        kind: 'quiz',
        id: 'd3-l3-practice',
        role: 'practice',
        title: 'Latihan kendiri: Lebih banyak kesilapan lazim',
        feedback: 'end',
        questionIds: ['d3l3-8', 'd3l3-9', 'd3l3-10', 'd3l3-11', 'd3l3-12', 'd3l3-13', 'd3l3-14'],
      },
    ],
    summary: [
      'Banyak kesilapan berpunca daripada terjemahan terus dari BM.',
      'Semak subjek–kata kerja, kala, artikel dan pilihan perkataan.',
      'Gunakan Buku Kesilapan untuk melihat corak kesilapan anda.',
    ],
  },

  // =========================================================================
  {
    id: 'd3-l4',
    day: 3,
    number: '3.4',
    title: 'Writing Checklist',
    objective: 'Menyemak tulisan secara sistematik — daripada isi tugasan hingga ejaan dan tanda baca.',
    objectives: [
      'Menggunakan senarai semak lapan perkara selepas menulis.',
      'Menyemak daripada perkara besar (isi) kepada perkara kecil (tanda baca).',
      'Membetulkan perenggan berdasarkan senarai semak.',
    ],
    durationMin: 10,
    skill: 'grammar',
    parts: [
      {
        id: 'checklist',
        title: 'Senarai semak penulisan',
        blocks: [
          {
            kind: 'list',
            ordered: true,
            items: [
              'Adakah saya menjawab **setiap bahagian** soalan?',
              'Adakah **struktur** sesuai (emel: salam–isi–penutup; esei: pendahuluan–isi–penutup)?',
              'Adakah **idea** saya jelas dan dihuraikan?',
              'Adakah semua **ayat lengkap** (tiada fragmen atau ayat bercantum)?',
              'Adakah saya menyemak **bentuk kata kerja** dan persetujuan subjek–kata kerja?',
              'Adakah **penanda wacana** saya sesuai dan tidak berlebihan?',
              'Adakah saya menyemak **ejaan dan tanda baca**?',
              'Adakah tulisan **sesuai dengan pembaca** (formal/tidak formal)?',
            ],
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Besar kepada kecil',
            body: 'Semak isi dan struktur dahulu kerana ia memberi kesan paling besar. Kemudian baca sekali lagi untuk tatabahasa, dan akhir sekali untuk ejaan dan tanda baca. Dalam Writing Studio, senarai semak ini dipaparkan di sebelah editor.',
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'quiz',
        id: 'd3-l4-guided',
        role: 'guided',
        title: 'Latihan berpandu: Semak perenggan',
        feedback: 'instant',
        questionIds: ['d3l4-1', 'd3l4-2', 'd3l4-3', 'd3l4-4', 'd3l4-5'],
      },
      {
        kind: 'short-writing',
        id: 'd3-l4-practice',
        role: 'practice',
        title: 'Latihan kendiri: Tulis semula perenggan',
        items: [
          {
            id: 'rewrite',
            instruction: 'Tulis semula perenggan ini dengan membetulkan semua masalah yang anda kenal pasti.',
            starter:
              'Last holiday, my family and I goes to Langkawi. we stayed in a small hotel near the beach. The beach was very very beautiful, we swam every morning. Although the weather was hot, but we enjoyed ourselves.',
            model:
              'Last holiday, my family and I went to Langkawi. We stayed in a small hotel near the beach. The beach was beautiful, so we swam every morning. Although the weather was hot, we enjoyed ourselves.',
            checklist: [
              'Saya menukar "goes" kepada "went".',
              'Saya menggunakan huruf besar untuk "We".',
              'Saya membetulkan ayat bercantum (contohnya dengan "so").',
              'Saya membuang "but" selepas "Although".',
              'Saya membuang pengulangan "very very".',
            ],
            rows: 6,
          },
        ],
      },
    ],
    summary: [
      'Gunakan senarai semak lapan perkara setiap kali selepas menulis.',
      'Semak daripada besar (isi, struktur) kepada kecil (ejaan, tanda baca).',
    ],
  },

  // =========================================================================
  {
    id: 'd3-l5',
    day: 3,
    number: '3.5',
    title: 'Timed Mock Exam',
    objective: 'Mengaplikasikan semua kemahiran dalam ujian percubaan bertempoh: tatabahasa, kosa kata dan satu tugasan penulisan.',
    objectives: [
      'Menjawab soalan tatabahasa dan kosa kata dalam masa terhad.',
      'Menulis emel atau esei lengkap di bawah tekanan masa.',
      'Menyemak keputusan dan mengenal pasti kelemahan.',
    ],
    durationMin: 35,
    skill: 'grammar',
    parts: [
      {
        id: 'about',
        title: 'Tentang ujian percubaan',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Bahagian A:** soalan tatabahasa (dimarkah secara automatik).',
              '**Bahagian B:** soalan kosa kata (dimarkah secara automatik).',
              '**Bahagian C:** satu tugasan penulisan — emel atau esei (semakan asas automatik + penilaian kendiri dengan rubrik).',
            ],
          },
          {
            kind: 'callout',
            tone: 'warning',
            title: 'Ujian latihan dalaman',
            body: 'Ini ialah ujian latihan dalaman ENGLISH LAB, bukan format peperiksaan rasmi. Tempoh lalai ialah 35 minit; anda boleh menukar jenis tugasan penulisan, tahap kesukaran dan tempoh sebelum bermula.',
          },
          {
            kind: 'callout',
            tone: 'info',
            title: 'Pemasa dan simpanan automatik',
            body: 'Selepas anda menekan "Mula", pemasa berjalan berdasarkan masa sebenar — termasuk jika anda menutup atau memuat semula halaman. Jawapan disimpan secara automatik. Apabila masa tamat, jawapan yang disimpan akan dihantar secara automatik.',
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'mock',
        id: 'd3-l5-mock',
        role: 'practice',
        title: 'Duduki ujian percubaan',
        intro: 'Ujian dijalankan dalam Exam Arena. Pelajaran ini dianggap lengkap selepas anda menghantar ujian dan menyemak keputusannya.',
      },
    ],
    summary: [
      'Baca arahan dan kriteria sebelum bermula.',
      'Urus masa: objektif dahulu, kemudian penulisan, dan tinggalkan masa untuk menyemak.',
      'Selepas menghantar, semak keputusan dan lengkapkan penilaian kendiri.',
    ],
  },

  // =========================================================================
  {
    id: 'd3-l6',
    day: 3,
    number: '3.6',
    title: 'Final Review',
    objective: 'Melihat semula kemajuan sebenar sepanjang kem, mengenal pasti kekuatan dan kelemahan, serta merancang ulang kaji.',
    objectives: [
      'Meninjau pelajaran, markah dan tugasan yang telah diselesaikan.',
      'Mengenal pasti kemahiran terkuat dan topik yang paling kerap salah.',
      'Memilih pelajaran untuk diulang kaji selepas kem.',
    ],
    durationMin: 10,
    skill: 'grammar',
    parts: [
      {
        id: 'next',
        title: 'Selepas kem',
        blocks: [
          {
            kind: 'text',
            paragraphs: [
              'Tiga hari ialah permulaan, bukan pengakhiran. Kemahiran menulis berkembang melalui latihan yang konsisten. Semua pelajaran, tugasan dan kemajuan anda kekal boleh diakses selepas kem tamat.',
            ],
          },
          {
            kind: 'list',
            items: [
              'Tulis satu emel atau esei setiap minggu dalam Writing Studio dan perbaiki menggunakan maklum balas.',
              'Ulang kaji kosa kata yang "Perlu latihan" dalam Vocabulary Lab.',
              'Ulang latihan Grammar Gym untuk topik yang paling kerap anda salah.',
              'Tunjukkan tulisan anda kepada guru untuk maklum balas yang lebih mendalam.',
            ],
          },
          {
            kind: 'callout',
            tone: 'info',
            title: 'Jujur tentang keputusan',
            body: 'Statistik di bawah dikira daripada aktiviti sebenar anda dalam pelayar ini. Ia menunjukkan prestasi latihan anda, bukan ramalan gred peperiksaan rasmi.',
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'final-review',
        id: 'd3-l6-review',
        role: 'practice',
        title: 'Ringkasan kemajuan anda',
      },
    ],
    summary: [
      'Gunakan data kemajuan untuk memilih fokus ulang kaji.',
      'Teruskan berlatih menulis dan semak dengan senarai semak.',
    ],
  },
];
