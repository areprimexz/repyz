import type { Lesson } from '../../types/content';

export const day2Lessons: Lesson[] = [
  // =========================================================================
  {
    id: 'd2-l1',
    day: 2,
    number: '2.1',
    title: 'Understanding Essay Questions',
    objective: 'Mengenal pasti topik, kata kerja tugasan, pembaca dan isi wajib, kemudian menjana dan menyusun idea sebelum menulis.',
    objectives: [
      'Mengenal pasti topik dan kata kerja tugasan (describe, explain, discuss, suggest).',
      'Memahami pembaca sasaran dan tujuan esei.',
      'Mengekstrak isi wajib daripada soalan.',
      'Menjana idea dan memilih idea yang paling kukuh.',
    ],
    durationMin: 15,
    skill: 'essay',
    parts: [
      {
        id: 'decode',
        title: 'Uraikan soalan esei',
        blocks: [
          {
            kind: 'example',
            heading: 'Contoh soalan esei',
            lines: [
              { en: 'Your school magazine is publishing a special issue on health.', label: 'Konteks', note: 'Pembaca: pelajar dan guru. Gaya separa formal.' },
              { en: 'Write an essay titled "Ways to Stay Healthy as a Student".', label: 'Topik', note: 'Fokus: CARA kekal sihat — bukan sejarah kesihatan atau penyakit.' },
              { en: 'In your essay, you should write about: • eating habits • exercise • sleep', label: 'Isi wajib', note: 'Tiga bidang. Setiap satu boleh menjadi satu perenggan isi.' },
              { en: 'Give reasons and examples.', label: 'Arahan tambahan', note: 'Anda perlu menghuraikan — bukan sekadar menyenaraikan.' },
            ],
          },
          {
            kind: 'table',
            heading: 'Kata kerja tugasan yang lazim',
            columns: ['Kata kerja', 'Maksud', 'Apa yang perlu anda lakukan'],
            rows: [
              ['Describe', 'Huraikan / gambarkan', 'Beri butiran tentang rupa, ciri atau pengalaman.'],
              ['Explain', 'Terangkan', 'Beri sebab dan tunjukkan bagaimana sesuatu berlaku.'],
              ['Discuss', 'Bincangkan', 'Lihat beberapa isi atau sudut, kadangkala kedua-dua belah.'],
              ['Suggest', 'Cadangkan', 'Kemukakan idea atau penyelesaian yang praktikal.'],
              ['Give your opinion', 'Beri pendapat', 'Nyatakan pandangan anda dan sokong dengan sebab.'],
            ],
          },
        ],
      },
      {
        id: 'brainstorm',
        title: 'Jana idea dengan soalan 5W1H',
        blocks: [
          {
            kind: 'text',
            paragraphs: [
              'Tanya diri anda: **What? Why? How? Who? When? Where?** Contohnya, untuk "eating habits": What should students eat? Why is breakfast important? How can students avoid junk food?',
              'Tulis semua idea dengan cepat (2–3 minit), kemudian **pilih 2–3 idea yang paling kukuh** — idea yang anda boleh terangkan dan beri contoh.',
            ],
          },
          {
            kind: 'table',
            heading: 'Contoh peta idea',
            columns: ['Isi', 'Idea utama', 'Sebab / contoh'],
            rows: [
              ['Eating habits', 'Eat breakfast; choose fruit over sweets', 'Energy to focus in morning classes'],
              ['Exercise', '30 minutes of activity a day', 'Cycling, badminton, walking to school'],
              ['Sleep', '8–10 hours a night', 'Better memory; less tired in class'],
            ],
          },
          {
            kind: 'callout',
            tone: 'warning',
            title: 'Jangan hafal satu esei untuk semua soalan',
            body: 'Esei hafalan biasanya tidak menjawab isi yang diminta dan mudah dikesan oleh pemeriksa. Belajarlah teknik menjana dan menyusun idea supaya anda boleh menyesuaikan diri dengan sebarang soalan.',
          },
        ],
      },
      {
        id: 'organise',
        title: 'Susun idea sebelum menulis',
        blocks: [
          {
            kind: 'list',
            ordered: true,
            items: [
              'Tentukan **idea utama** esei dalam satu ayat (contoh: Students can stay healthy by building three simple habits).',
              'Susun isi mengikut logik: daripada yang paling penting, atau mengikut urutan masa (pagi → petang → malam).',
              'Untuk setiap isi, tulis satu sebab dan satu contoh dalam rancangan.',
            ],
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'quiz',
        id: 'd2-l1-guided',
        role: 'guided',
        title: 'Latihan berpandu: Uraikan soalan kesihatan',
        feedback: 'instant',
        questionIds: ['d2l1-g1', 'd2l1-g2', 'd2l1-g3', 'd2l1-g4', 'd2l1-g5', 'd2l1-g6'],
      },
      {
        kind: 'quiz',
        id: 'd2-l1-practice',
        role: 'practice',
        title: 'Latihan kendiri: Kata kerja tugasan dan relevan',
        feedback: 'end',
        questionIds: ['d2l1-p1', 'd2l1-p2', 'd2l1-p3', 'd2l1-p4'],
      },
      {
        kind: 'short-writing',
        id: 'd2-l1-plan',
        role: 'practice',
        title: 'Latihan kendiri: Rancang esei',
        intro: 'Soalan: "Write an essay on the benefits of reading for teenagers. Give reasons and examples." Lengkapkan rancangan ringkas di bawah.',
        items: [
          {
            id: 'topic',
            instruction: 'Nyatakan topik, pembaca dan tujuan esei ini dalam 1–2 ayat (BM atau BI).',
            model: 'Topic: the benefits of reading for teenagers. Readers: teachers and students. Purpose: to explain how reading helps teenagers, with reasons and examples.',
            checklist: ['Saya menyatakan topik dengan tepat.', 'Saya menyebut pembaca dan tujuan.'],
            rows: 3,
          },
          {
            id: 'ideas',
            instruction: 'Senaraikan TIGA idea utama dan satu contoh untuk setiap idea.',
            placeholder: '1. ... (example: ...)\n2. ...\n3. ...',
            model:
              '1. Improves vocabulary and writing (example: learning new words from novels).\n2. Helps us relax and reduce stress (example: reading a story before bed).\n3. Increases general knowledge (example: reading news or science magazines).',
            checklist: ['Setiap idea berkaitan dengan faedah membaca.', 'Setiap idea mempunyai contoh yang khusus.', 'Idea saya tidak bertindih antara satu sama lain.'],
            rows: 6,
          },
        ],
      },
    ],
    summary: [
      'Kenal pasti topik, kata kerja tugasan, pembaca, tujuan dan isi wajib.',
      'Jana idea dengan 5W1H, kemudian pilih 2–3 idea yang paling kukuh.',
      'Rancang satu sebab dan satu contoh untuk setiap isi.',
    ],
  },

  // =========================================================================
  {
    id: 'd2-l2',
    day: 2,
    number: '2.2',
    title: 'Essay Structure',
    objective: 'Menyusun esei dengan pendahuluan, perenggan isi dan penutup yang masing-masing mempunyai fungsi yang jelas.',
    objectives: [
      'Menulis pendahuluan yang memperkenalkan topik dan memberi konteks.',
      'Membina perenggan isi dengan satu isi utama setiap perenggan.',
      'Menulis penutup yang merumuskan tanpa isi baharu.',
      'Memahami bahawa struktur berubah mengikut jenis tugasan.',
    ],
    durationMin: 20,
    skill: 'essay',
    parts: [
      {
        id: 'three',
        title: 'Tiga bahagian esei',
        blocks: [
          {
            kind: 'table',
            columns: ['Bahagian', 'Tugas', 'Tip'],
            rows: [
              ['Introduction (pendahuluan)', 'Memperkenalkan topik, memberi konteks dan (jika sesuai) menyatakan idea utama.', '2–4 ayat. Mulakan dengan fakta, soalan atau situasi yang menarik.'],
              ['Body paragraphs (isi)', 'Satu isi utama setiap perenggan: nyatakan, terangkan, beri contoh, kaitkan dengan topik.', 'Gunakan teknik PEEL (Pelajaran 2.3).'],
              ['Conclusion (penutup)', 'Merumuskan mesej utama dan memberi kenyataan akhir.', 'Jangan perkenalkan hujah baharu.'],
            ],
          },
        ],
      },
      {
        id: 'annotated',
        title: 'Contoh esei beranotasi',
        blocks: [
          {
            kind: 'example',
            heading: 'Ways to Stay Healthy as a Student',
            lines: [
              {
                en: 'Many students today feel tired and stressed because of busy school schedules. However, staying healthy does not have to be difficult. By building a few simple habits, students can feel more energetic and focused.',
                label: 'Pendahuluan',
                note: 'Ayat 1: konteks (pelajar penat). Ayat 2–3: idea utama esei.',
              },
              {
                en: 'Firstly, students should pay attention to their eating habits. A healthy breakfast, such as oats or wholemeal bread, gives the brain the energy it needs for morning lessons. Students who skip breakfast often find it hard to concentrate.',
                label: 'Isi 1',
                note: 'Ayat topik (Firstly...) → penerangan → contoh. Satu isi sahaja: tabiat makan.',
              },
              {
                en: 'Secondly, regular exercise keeps both the body and mind strong. Even thirty minutes of cycling, badminton or brisk walking a day can improve fitness and reduce stress.',
                label: 'Isi 2',
                note: 'Isi baharu = perenggan baharu. Contoh aktiviti yang realistik.',
              },
              {
                en: 'Finally, enough sleep is essential. Teenagers need about eight to ten hours of sleep a night to remember what they have learned. Switching off phones an hour before bedtime can help.',
                label: 'Isi 3',
                note: 'Penanda "Finally" menunjukkan isi terakhir.',
              },
              {
                en: 'In conclusion, eating well, exercising regularly and sleeping enough are simple habits that make a big difference. If students start practising them today, they will have more energy to achieve their goals.',
                label: 'Penutup',
                note: 'Merumuskan tiga isi + kenyataan akhir yang positif. Tiada isi baharu.',
              },
            ],
          },
        ],
      },
      {
        id: 'vary',
        title: 'Struktur mengikut jenis tugasan',
        blocks: [
          {
            kind: 'text',
            paragraphs: [
              'Struktur pendahuluan–isi–penutup ialah asas, tetapi bentuknya berubah mengikut tugasan. **Artikel** untuk majalah lazimnya mempunyai tajuk yang menarik dan boleh menyapa pembaca secara langsung. **Esei pendapat** perlu menyatakan pendirian dengan jelas. **Cerita** mengikut urutan peristiwa (permulaan, konflik, penyelesaian). Sentiasa baca jenis tugasan yang diminta.',
            ],
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Tinggalkan baris kosong',
            body: 'Apabila menaip dalam Writing Studio, tinggalkan satu baris kosong di antara perenggan supaya struktur esei jelas kepada pembaca.',
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'quiz',
        id: 'd2-l2-guided',
        role: 'guided',
        title: 'Latihan berpandu: Susun esei',
        feedback: 'instant',
        questionIds: ['d2l2-g1', 'd2l2-g2', 'd2l2-g3', 'd2l2-g4', 'd2l2-g5', 'd2l2-g6'],
      },
      {
        kind: 'quiz',
        id: 'd2-l2-practice',
        role: 'practice',
        title: 'Latihan kendiri: Kenal pasti dan nilai',
        feedback: 'end',
        questionIds: ['d2l2-p1', 'd2l2-p2', 'd2l2-p3', 'd2l2-p4', 'd2l2-p5'],
      },
    ],
    summary: [
      'Pendahuluan memperkenalkan topik dan konteks; perenggan isi membawa satu isi utama; penutup merumuskan.',
      'Jangan perkenalkan hujah baharu dalam penutup.',
      'Struktur berubah mengikut jenis tugasan — artikel, esei pendapat, cerita.',
    ],
  },

  // =========================================================================
  {
    id: 'd2-l3',
    day: 2,
    number: '2.3',
    title: 'PEEL Paragraph Technique',
    objective: 'Membina perenggan isi yang berkembang dengan teknik PEEL: Point, Explanation, Example, Link.',
    objectives: [
      'Mengenal pasti setiap komponen PEEL dalam perenggan.',
      'Menyusun ayat menjadi perenggan yang koheren.',
      'Mengenal pasti dan membaiki isi yang tidak disokong.',
      'Menulis perenggan PEEL sendiri.',
    ],
    durationMin: 25,
    skill: 'essay',
    parts: [
      {
        id: 'peel',
        title: 'Apakah PEEL?',
        blocks: [
          {
            kind: 'table',
            columns: ['Huruf', 'Komponen', 'Tugas', 'Frasa permulaan'],
            rows: [
              ['P', 'Point', 'Nyatakan isi utama perenggan.', 'One benefit of... / Firstly, ...'],
              ['E', 'Explanation', 'Terangkan mengapa atau bagaimana isi itu benar.', 'This is because... / When we...'],
              ['E', 'Example', 'Beri contoh, situasi atau bukti yang khusus.', 'For example, ... / For instance, ...'],
              ['L', 'Link', 'Kaitkan semula dengan topik atau isi seterusnya.', 'Therefore, ... / This shows that...'],
            ],
          },
          {
            kind: 'example',
            heading: 'Perenggan PEEL beranotasi',
            caption: 'Topik: The Benefits of Reading',
            lines: [
              { en: 'One major benefit of reading is that it improves our vocabulary.', label: 'Point', note: 'Isi utama yang jelas dan khusus.' },
              {
                en: 'When we read regularly, we meet new words and see how they are used in real sentences.',
                label: 'Explanation',
                note: 'Menerangkan BAGAIMANA membaca menambah kosa kata.',
              },
              {
                en: 'For example, a student who reads English mystery novels may learn words such as "suspicious" and "clue" and later use them in an essay.',
                label: 'Example',
                note: 'Situasi khusus dan realistik, bukan "for example, reading is good".',
              },
              { en: 'Therefore, reading is one of the easiest ways to become a more confident writer.', label: 'Link', note: 'Mengaitkan semula isi dengan tujuan esei.' },
            ],
          },
        ],
      },
      {
        id: 'weak',
        title: 'Isi yang tidak disokong',
        blocks: [
          {
            kind: 'compare',
            weakLabel: 'Tidak disokong',
            strongLabel: 'Dikembangkan',
            items: [
              {
                weak: 'Technology helps students learn. It is good.',
                strong:
                  'Technology helps students learn. Online videos can explain difficult topics step by step, and students can replay them as many times as they need. For instance, a short animation can show how the heart pumps blood more clearly than a picture in a textbook.',
                why: '"It is good" tidak menerangkan apa-apa. Versi kedua menerangkan BAGAIMANA dan memberi CONTOH.',
              },
            ],
          },
          {
            kind: 'callout',
            tone: 'info',
            title: 'PEEL ialah panduan, bukan peraturan tegar',
            body: 'PEEL membantu anda merancang perenggan yang berkembang. Kadangkala penerangan memerlukan dua ayat, atau contoh datang sebelum penerangan. Dalam cerita atau emel pendek, PEEL tidak selalu sesuai. Gunakannya sebagai alat untuk memastikan isi anda dihuraikan.',
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'quiz',
        id: 'd2-l3-guided',
        role: 'guided',
        title: 'Latihan berpandu: Kenal pasti dan susun PEEL',
        intro: 'Soalan 1–4 merujuk kepada perenggan yang sama tentang senaman.',
        feedback: 'instant',
        questionIds: ['d2l3-g1', 'd2l3-g2', 'd2l3-g3', 'd2l3-g4', 'd2l3-g5', 'd2l3-g6', 'd2l3-g7'],
      },
      {
        kind: 'short-writing',
        id: 'd2-l3-practice',
        role: 'practice',
        title: 'Latihan kendiri: Kembangkan dan tulis perenggan PEEL',
        items: [
          {
            id: 'develop',
            instruction: 'Isi ini mempunyai penerangan yang lemah. Tulis semula penerangan dan tambah satu contoh.',
            starter: 'Point: Eating breakfast is important for students. Weak explanation: It is good for them.',
            placeholder: 'Eating breakfast is important for students. This is because...',
            model:
              'Eating breakfast is important for students. This is because breakfast gives the brain and body energy after a long night without food. For example, a student who eats a simple breakfast of eggs and bread is more likely to stay focused during the first lesson than a student who skips it.',
            checklist: ['Penerangan saya menunjukkan MENGAPA atau BAGAIMANA.', 'Saya memberi satu contoh yang khusus.', 'Saya tidak sekadar mengulang "it is good".'],
            rows: 5,
          },
          {
            id: 'write',
            instruction: 'Tulis perenggan PEEL lengkap (4–5 ayat) untuk isi ini: "Students should limit their screen time."',
            model:
              'Students should limit their screen time. Spending many hours on phones and computers can make it harder to sleep and leaves less time for homework and exercise. For instance, a student who scrolls through social media until midnight may feel sleepy and unfocused in class the next morning. Therefore, setting a daily limit, such as two hours of recreational screen time, can help students stay healthy and productive.',
            checklist: [
              'Point: ayat pertama menyatakan isi dengan jelas.',
              'Explanation: saya menerangkan mengapa isi itu benar.',
              'Example: saya memberi situasi yang khusus.',
              'Link: ayat terakhir mengaitkan semula dengan topik.',
            ],
            rows: 7,
          },
        ],
      },
    ],
    summary: [
      'PEEL = Point, Explanation, Example, Link.',
      'Isi tanpa penerangan dan contoh ialah isi yang lemah.',
      'PEEL ialah alat perancangan yang fleksibel, bukan formula yang tegar.',
    ],
  },

  // =========================================================================
  {
    id: 'd2-l4',
    day: 2,
    number: '2.4',
    title: 'Linking Words',
    objective: 'Menggunakan penanda wacana dengan tepat, termasuk tanda baca dan kedudukannya dalam ayat.',
    objectives: [
      'Mengenal pasti kategori penanda wacana mengikut fungsi.',
      'Menggunakan tanda baca yang betul bersama penanda wacana.',
      'Mengelakkan kesilapan lazim seperti "Although... but".',
      'Tidak menggunakan penanda wacana secara berlebihan.',
    ],
    durationMin: 15,
    skill: 'essay',
    parts: [
      {
        id: 'categories',
        title: 'Kategori penanda wacana',
        blocks: [
          {
            kind: 'table',
            columns: ['Fungsi', 'Penanda wacana', 'Contoh ayat'],
            rows: [
              ['Menambah idea', 'Furthermore, Moreover, In addition', 'Reading improves vocabulary. Furthermore, it helps us relax.'],
              ['Memberi contoh', 'For example, For instance, such as', 'For example, a short story before bed can help us sleep.'],
              ['Menunjukkan perbezaan', 'However, Although, On the other hand', 'Phones are useful. However, they can be distracting.'],
              ['Sebab dan akibat', 'because, Therefore, As a result', 'It rained heavily. As a result, the match was postponed.'],
              ['Menutup', 'In conclusion, To sum up', 'In conclusion, small habits can make a big difference.'],
            ],
          },
        ],
      },
      {
        id: 'punctuation',
        title: 'Tanda baca dan kedudukan',
        blocks: [
          {
            kind: 'keyterms',
            heading: 'Peraturan penting',
            items: [
              {
                term: 'Furthermore, / However, / Therefore,',
                meaning: 'Di awal ayat: huruf besar + koma selepasnya.',
                example: 'However, some students prefer to study alone.',
              },
              {
                term: 'because',
                meaning: 'Menyambung dua klausa dalam SATU ayat.',
                example: 'I stayed at home because I was unwell.',
                note: '"Because I was unwell." sahaja ialah fragmen (ayat tidak lengkap).',
              },
              {
                term: 'Although + klausa, klausa utama',
                meaning: 'Walaupun...',
                example: 'Although it was raining, we continued the match.',
                note: 'JANGAN tambah "but": "Although it was raining, but..." ialah salah.',
              },
              {
                term: 'such as + kata nama',
                meaning: 'seperti',
                example: 'Students can try hobbies such as chess, badminton and baking.',
                note: 'Tiada koma selepas "such as".',
              },
            ],
          },
          {
            kind: 'compare',
            weakLabel: 'Salah',
            strongLabel: 'Betul',
            items: [
              { weak: 'Although it was late, but we finished the project.', strong: 'Although it was late, we finished the project.', why: 'Gunakan "although" ATAU "but", bukan kedua-duanya.' },
              { weak: 'Moreover exercise is fun.', strong: 'Moreover, exercise is fun.', why: 'Koma selepas penanda wacana di awal ayat.' },
              { weak: 'Because it is cheap. Many students cycle.', strong: 'Many students cycle because it is cheap.', why: 'Klausa "because" perlu disambungkan dengan klausa utama.' },
            ],
          },
        ],
      },
      {
        id: 'overuse',
        title: 'Jangan berlebihan',
        blocks: [
          {
            kind: 'callout',
            tone: 'warning',
            title: 'Bukan setiap ayat',
            body: 'Memulakan setiap ayat dengan "Furthermore" atau "Moreover" menjadikan tulisan kaku dan berulang. Gunakan penanda wacana apabila ia benar-benar menunjukkan hubungan antara idea — biasanya di awal perenggan isi atau apabila idea berubah arah.',
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'quiz',
        id: 'd2-l4-guided',
        role: 'guided',
        title: 'Latihan berpandu: Pilih dan betulkan',
        feedback: 'instant',
        questionIds: ['d2l4-g1', 'd2l4-g2', 'd2l4-g3', 'd2l4-g4', 'd2l4-g5', 'd2l4-g6'],
      },
      {
        kind: 'quiz',
        id: 'd2-l4-practice',
        role: 'practice',
        title: 'Latihan kendiri: Penanda wacana dalam konteks',
        feedback: 'end',
        questionIds: ['d2l4-p1', 'd2l4-p2', 'd2l4-p3', 'd2l4-p4', 'd2l4-p5', 'd2l4-p6'],
      },
    ],
    summary: [
      'Pilih penanda wacana berdasarkan fungsi: tambah, contoh, perbezaan, sebab/akibat, penutup.',
      'Penanda di awal ayat diikuti koma; "although" tidak digunakan bersama "but".',
      'Gunakan secara sederhana — bukan untuk setiap ayat.',
    ],
  },

  // =========================================================================
  {
    id: 'd2-l5',
    day: 2,
    number: '2.5',
    title: 'Vocabulary and Sentence Improvement',
    objective: 'Menjadikan ayat lebih jelas dan khusus dengan kata kerja tepat, kata sifat sesuai dan kolokasi — tanpa memaksa perkataan sukar.',
    objectives: [
      'Menggantikan perkataan umum (good, bad, get) dengan perkataan yang lebih tepat.',
      'Menggunakan kolokasi yang semula jadi.',
      'Mengembangkan ayat dan mengelakkan pengulangan.',
      'Mengekalkan ketepatan tatabahasa semasa memperbaiki ayat.',
    ],
    durationMin: 15,
    skill: 'essay',
    parts: [
      {
        id: 'specific',
        title: 'Lebih khusus, bukan lebih sukar',
        blocks: [
          {
            kind: 'compare',
            weakLabel: 'Asas',
            strongLabel: 'Diperbaiki',
            items: [
              {
                weak: 'Exercise is good.',
                strong: 'Regular exercise helps students maintain their health and reduce stress.',
                why: 'Menambah SIAPA (students), kekerapan (regular) dan faedah khusus (maintain health, reduce stress).',
              },
              {
                weak: 'Junk food is bad.',
                strong: 'Eating too much junk food can lead to weight gain and other health problems.',
                why: '"Bad" diganti dengan akibat yang jelas. "Can lead to" ialah frasa yang berguna.',
              },
              {
                weak: 'I got a prize.',
                strong: 'I received a prize for the best poster in the competition.',
                why: '"Received" lebih tepat daripada "got"; butiran menambah makna.',
              },
            ],
          },
          {
            kind: 'callout',
            tone: 'warning',
            title: 'Jangan paksa perkataan sukar',
            body: '"Exercise is efficacious for the corporeal form" kedengaran janggal dan mungkin salah konteks. Pemeriksa menghargai perkataan yang TEPAT dan digunakan dengan betul, bukan perkataan yang paling panjang.',
          },
        ],
      },
      {
        id: 'collocations',
        title: 'Kolokasi berguna',
        blocks: [
          {
            kind: 'keyterms',
            heading: 'Gabungan perkataan yang semula jadi',
            items: [
              { term: 'make a decision', meaning: 'membuat keputusan', example: 'I made a decision to study harder.', note: 'Bukan "do a decision".' },
              { term: 'take part in', meaning: 'mengambil bahagian dalam', example: 'Many students took part in the clean-up.' },
              { term: 'pay attention', meaning: 'memberi perhatian', example: 'Pay attention to the instructions.' },
              { term: 'spend time on/with', meaning: 'meluangkan masa', example: 'We should spend more time with our families.' },
              { term: 'reduce stress', meaning: 'mengurangkan tekanan', example: 'Gardening helps to reduce stress.' },
              { term: 'a healthy lifestyle', meaning: 'gaya hidup sihat', example: 'A healthy lifestyle includes enough sleep.' },
              { term: 'protect the environment', meaning: 'melindungi alam sekitar', example: 'Recycling is one way to protect the environment.' },
            ],
          },
        ],
      },
      {
        id: 'repetition',
        title: 'Elakkan pengulangan',
        blocks: [
          {
            kind: 'compare',
            weakLabel: 'Berulang',
            strongLabel: 'Lebih lancar',
            items: [
              {
                weak: 'Reading is fun. Reading helps us learn. Reading is cheap.',
                strong: 'Reading is fun and cheap, and it helps us learn.',
                why: 'Gabungkan idea dan gunakan kata ganti nama "it".',
              },
              {
                weak: 'The trip was very very fun and very very exciting.',
                strong: 'The trip was exciting and memorable.',
                why: 'Pilih kata sifat yang tepat dan bukannya mengulang "very".',
              },
            ],
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'quiz',
        id: 'd2-l5-guided',
        role: 'guided',
        title: 'Latihan berpandu: Pilih penambahbaikan terbaik',
        feedback: 'instant',
        questionIds: ['d2l5-g1', 'd2l5-g2', 'd2l5-g3', 'd2l5-g4', 'd2l5-g5', 'd2l5-g6'],
      },
      {
        kind: 'short-writing',
        id: 'd2-l5-practice',
        role: 'practice',
        title: 'Latihan kendiri: Perbaiki ayat',
        intro: 'Tulis semula setiap ayat supaya lebih jelas dan khusus. Kekalkan tatabahasa yang betul.',
        items: [
          {
            id: 'a',
            instruction: 'Perbaiki ayat ini dengan kata kerja yang lebih khusus dan satu butiran.',
            starter: 'Technology is good for students.',
            model: 'Technology allows students to find information quickly and learn at their own pace.',
            checklist: ['Saya menggantikan "good" dengan maksud yang khusus.', 'Ayat saya mempunyai subjek dan kata kerja yang betul.'],
          },
          {
            id: 'b',
            instruction: 'Perbaiki ayat ini dengan menerangkan akibat yang jelas.',
            starter: 'Littering is bad.',
            model: 'Littering makes our neighbourhood dirty and can block drains, which causes flash floods.',
            checklist: ['Saya menerangkan akibat yang khusus.', 'Saya tidak menggunakan perkataan sukar yang saya tidak pasti.'],
          },
          {
            id: 'c',
            instruction: 'Betulkan kolokasi dan kembangkan ayat ini.',
            starter: 'I did a decision to study harder.',
            model: 'I made a decision to study harder after I saw my mid-year results.',
            checklist: ['Saya menggunakan "make a decision".', 'Saya menambah butiran (bila/mengapa).'],
          },
        ],
      },
    ],
    summary: [
      'Gantikan perkataan umum dengan perkataan yang tepat dan butiran yang khusus.',
      'Gunakan kolokasi semula jadi: make a decision, pay attention, take part in.',
      'Ketepatan dan kejelasan lebih penting daripada perkataan yang sukar.',
    ],
  },

  // =========================================================================
  {
    id: 'd2-l6',
    day: 2,
    number: '2.6',
    title: 'Independent Essay Writing',
    objective: 'Merancang dan menulis esei lengkap secara berdikari, kemudian menilai dan memperbaikinya menggunakan rubrik.',
    objectives: [
      'Menggunakan lembaran perancangan sebelum menulis.',
      'Menulis esei lengkap dengan struktur dan perenggan PEEL.',
      'Menilai esei menggunakan rubrik pembelajaran dan memperbaikinya.',
    ],
    durationMin: 30,
    skill: 'essay',
    parts: [
      {
        id: 'process',
        title: 'Strategi esei 30 minit',
        blocks: [
          {
            kind: 'table',
            columns: ['Masa', 'Langkah', 'Apa yang dilakukan'],
            rows: [
              ['0–5 minit', 'Analisis dan rancang', 'Kenal pasti topik dan isi; isi lembaran perancangan.'],
              ['5–25 minit', 'Tulis', 'Pendahuluan → 2–3 perenggan PEEL → penutup.'],
              ['25–30 minit', 'Semak', 'Senarai semak: isi, struktur, tatabahasa, ejaan, tanda baca.'],
            ],
          },
          {
            kind: 'callout',
            tone: 'info',
            title: 'Bagaimana esei anda dinilai di sini',
            body: 'Selepas menghantar, aplikasi menjalankan semakan asas (bilangan perkataan, perenggan, tanda baca dan beberapa corak kesilapan lazim). Anda kemudian membandingkan esei dengan jawapan model dan menilai diri menggunakan rubrik enam dimensi: relevan, organisasi, perkembangan idea, tatabahasa, kosa kata dan ejaan/tanda baca. Ini bukan penilaian AI atau gred rasmi.',
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Semak semula dan hantar semula',
            body: 'Selepas melihat maklum balas, gunakan butang "Perbaiki draf" untuk menyunting esei anda dan hantar versi baharu. Semua versi disimpan supaya anda boleh melihat kemajuan.',
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'writing-task',
        id: 'd2-l6-writing',
        role: 'practice',
        title: 'Tulis esei anda',
        intro: 'Pilih sekurang-kurangnya satu tugasan. Tugasan disusun daripada Asas kepada Mencabar.',
        writingType: 'essay',
        promptIds: ['essay-reading', 'essay-habits', 'essay-environment', 'essay-health', 'essay-technology', 'essay-time'],
        required: 1,
      },
    ],
    summary: [
      'Rancang dahulu: topik, idea utama, 2–3 isi dengan sebab dan contoh.',
      'Tulis dengan struktur pendahuluan–isi–penutup dan PEEL.',
      'Nilai dengan rubrik, bandingkan dengan model, kemudian perbaiki.',
    ],
  },
];
