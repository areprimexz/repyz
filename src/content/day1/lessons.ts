import type { Lesson } from '../../types/content';

export const day1Lessons: Lesson[] = [
  // =========================================================================
  {
    id: 'd1-l1',
    day: 1,
    number: '1.1',
    title: 'Understanding Email Questions',
    objective: 'Mengenal pasti penerima, tujuan dan setiap isi wajib dalam soalan emel sebelum menulis.',
    objectives: [
      'Mengenal pasti penerima emel dan hubungan anda dengannya.',
      'Memahami tujuan emel daripada arahan soalan.',
      'Mengasingkan setiap isi wajib (required points), termasuk isi yang mempunyai dua bahagian.',
      'Membuat rancangan ringkas dan menyemak bahawa semua isi telah dijawab.',
    ],
    durationMin: 15,
    skill: 'email',
    parts: [
      {
        id: 'read',
        title: 'Baca soalan seperti seorang penyiasat',
        blocks: [
          {
            kind: 'text',
            paragraphs: [
              'Kesilapan paling biasa dalam penulisan emel bukanlah tatabahasa — tetapi **tidak menjawab soalan sepenuhnya**. Sebelum menulis satu perkataan pun, baca soalan dengan teliti dan cari empat perkara:',
            ],
          },
          {
            kind: 'table',
            columns: ['Perkara', 'Soalan yang anda tanya', 'Mengapa penting'],
            rows: [
              ['Penerima (recipient)', 'Kepada siapa saya menulis?', 'Menentukan salam, nada dan penutup.'],
              ['Tujuan (purpose)', 'Mengapa saya menulis?', 'Menentukan ayat pembuka dan fokus emel.'],
              ['Isi wajib (required points)', 'Apakah yang mesti saya sebut?', 'Setiap isi yang tertinggal menyebabkan markah hilang.'],
              ['Nada (tone)', 'Formal atau tidak formal?', 'Guru/pengetua → sopan; kawan/sepupu → mesra.'],
            ],
          },
          {
            kind: 'example',
            heading: 'Contoh soalan emel',
            caption: 'Baca soalan ini. Kita akan menganalisisnya bersama.',
            lines: [
              {
                en: 'Your cousin, Hafiz, is going to start Form 1 at your school next year. He has emailed you to ask about the school.',
                label: 'Situasi',
                note: 'Penerima: Hafiz, sepupu anda → nada mesra. Dia menghantar emel dahulu, jadi anda sedang MEMBALAS.',
              },
              { en: 'Write an email to Hafiz. In your email, you should:', label: 'Arahan' },
              { en: '• describe one interesting place in the school', label: 'Isi 1', note: 'Kata kerja tugasan: "describe" (terangkan).' },
              { en: '• tell him about one club he could join', label: 'Isi 2', note: 'Hanya SATU kelab — tidak perlu senaraikan semua kelab.' },
              { en: '• give him one piece of advice for his first week.', label: 'Isi 3', note: 'Nasihat khusus untuk minggu pertama, bukan nasihat umum tentang hidup.' },
            ],
          },
        ],
      },
      {
        id: 'technique',
        title: 'Teknik Garis–Bulat–Nombor',
        blocks: [
          {
            kind: 'list',
            ordered: true,
            items: [
              '**Garis** nama penerima dan hubungan anda dengannya (sepupu, guru, kawan, pengetua).',
              '**Bulatkan** kata kerja tugasan: describe, tell, explain, suggest, invite, give advice, recommend.',
              '**Nomborkan** setiap isi wajib. Perhatikan isi yang mempunyai dua bahagian, contohnya "where AND what time to meet".',
            ],
          },
          {
            kind: 'callout',
            tone: 'warning',
            title: 'Isi berganda',
            body: 'Jika soalan berkata "tell her where and what time to meet", anda perlu memberi TEMPAT dan MASA. Memberi tempat sahaja bermakna isi itu belum lengkap.',
          },
        ],
      },
      {
        id: 'plan',
        title: 'Rancang dalam 2–3 minit',
        blocks: [
          {
            kind: 'text',
            paragraphs: [
              'Rancangan tidak perlu panjang. Tulis satu baris untuk setiap isi: idea utama + satu butiran atau sebab. Rancangan ini menjadi "peta" emel anda.',
            ],
          },
          {
            kind: 'table',
            heading: 'Contoh rancangan untuk emel kepada Hafiz',
            columns: ['Isi wajib', 'Idea', 'Butiran / sebab'],
            rows: [
              ['1. Tempat menarik', 'The school garden', 'Quiet place to read; has a small fish pond'],
              ['2. Satu kelab', 'Photography Club', 'He likes taking photos; club trips every term'],
              ['3. Nasihat minggu pertama', 'Prepare the timetable the night before', 'So he will not forget books'],
            ],
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Semak sebelum hantar',
            body: 'Selepas menulis, kembali kepada nombor isi dalam soalan dan tandakan setiap satu dalam emel anda. Jika ada nombor yang tiada tanda, tambahkan ayat untuk menjawabnya.',
          },
        ],
      },
      {
        id: 'pitfalls',
        title: 'Elakkan perangkap biasa',
        blocks: [
          {
            kind: 'compare',
            weakLabel: 'Kurang berkesan',
            strongLabel: 'Lebih berkesan',
            items: [
              {
                weak: 'Writing three paragraphs about your favourite teacher when the question asks about a place, a club and advice.',
                strong: 'One short paragraph for each required point: a place, a club and one piece of advice.',
                why: 'Pemeriksa menilai sama ada anda menjawab soalan sebenar, bukan sejauh mana anda boleh menulis panjang.',
              },
              {
                weak: 'Using a memorised email about "My Hobby" for every question.',
                strong: 'Adapting your ideas to the recipient, purpose and points in the question.',
                why: 'Emel hafalan biasanya tertinggal isi wajib dan nadanya mungkin tidak sesuai dengan penerima.',
              },
            ],
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'quiz',
        id: 'd1-l1-guided',
        role: 'guided',
        title: 'Latihan berpandu: Analisis soalan Reading Week',
        intro: 'Jawab setiap soalan dan tekan "Semak" untuk maklum balas segera.',
        feedback: 'instant',
        questionIds: ['d1l1-g1', 'd1l1-g2', 'd1l1-g3', 'd1l1-g4', 'd1l1-g5', 'd1l1-g6'],
      },
      {
        kind: 'quiz',
        id: 'd1-l1-practice',
        role: 'practice',
        title: 'Latihan kendiri: Analisis soalan baharu',
        intro: 'Kali ini jawab semua soalan dahulu, kemudian hantar untuk melihat markah dan penjelasan.',
        feedback: 'end',
        questionIds: ['d1l1-p1', 'd1l1-p2', 'd1l1-p3', 'd1l1-p4', 'd1l1-p5', 'd1l1-p6'],
      },
    ],
    summary: [
      'Kenal pasti penerima, tujuan, isi wajib dan nada sebelum menulis.',
      'Nomborkan setiap isi dan berhati-hati dengan isi yang mempunyai dua bahagian.',
      'Rancang satu baris untuk setiap isi, kemudian semak semula selepas menulis.',
    ],
  },

  // =========================================================================
  {
    id: 'd1-l2',
    day: 1,
    number: '1.2',
    title: 'Email Structure',
    objective: 'Menyusun emel dengan salam, pembuka, isi, penutup dan tandatangan yang sesuai dengan nada formal atau tidak formal.',
    objectives: [
      'Mengenal pasti lima bahagian utama emel dan fungsinya.',
      'Membezakan bahasa formal dan tidak formal.',
      'Memilih salam dan penutup yang sesuai dengan penerima.',
      'Memahami bahawa format sebenar bergantung pada arahan tugasan.',
    ],
    durationMin: 20,
    skill: 'email',
    parts: [
      {
        id: 'parts',
        title: 'Lima bahagian emel',
        blocks: [
          {
            kind: 'table',
            columns: ['Bahagian', 'Fungsi', 'Contoh'],
            rows: [
              ['Greeting (salam)', 'Menyapa penerima', 'Dear Ms Wong, / Hi Hafiz,'],
              ['Opening sentence (pembuka)', 'Menyatakan sebab menulis atau membalas emel', 'I am writing to... / Thanks for your email!'],
              ['Main content (isi)', 'Menjawab setiap isi wajib dengan butiran', 'One short paragraph for each point'],
              ['Closing sentence (ayat penutup)', 'Mengakhiri mesej dengan sopan', 'I hope this helps. / Write back soon!'],
              ['Sign-off (penutup + nama)', 'Menutup emel dan menyatakan nama penulis', 'Yours sincerely, Aina / Best wishes, Aina'],
            ],
          },
          {
            kind: 'callout',
            tone: 'info',
            title: 'Format bergantung pada tugasan',
            body: 'Sesetengah soalan menyediakan ruang "To", "From" dan "Subject"; sesetengahnya hanya menilai isi emel. Sentiasa ikut format yang diberikan dalam soalan dan arahan guru anda. Struktur lima bahagian ini ialah panduan umum yang sesuai untuk kebanyakan tugasan emel.',
          },
        ],
      },
      {
        id: 'register',
        title: 'Formal atau tidak formal?',
        blocks: [
          {
            kind: 'text',
            paragraphs: [
              'Nada emel ditentukan oleh **penerima**. Emel kepada guru, pengetua atau organisasi perlu formal. Emel kepada kawan atau sepupu boleh mesra — tetapi tatabahasa, ejaan dan tanda baca masih perlu betul.',
            ],
          },
          {
            kind: 'table',
            columns: ['', 'Formal (guru, pengetua, organisasi)', 'Tidak formal (kawan, keluarga)'],
            rows: [
              ['Salam', 'Dear Mr Tan, / Dear Sir/Madam,', 'Hi Aina, / Dear Aina,'],
              ['Pembuka', 'I am writing to...', 'Thanks for your email! / How are you?'],
              ['Bahasa', 'Bentuk penuh: I am, do not', 'Singkatan dibenarkan: I\'m, don\'t'],
              ['Ayat penutup', 'I look forward to hearing from you.', 'Write back soon! / Take care!'],
              ['Penutup', 'Yours sincerely, / Yours faithfully,', 'Best wishes, / Take care,'],
            ],
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Sincerely atau faithfully?',
            body: 'Konvensyen British: "Yours sincerely," apabila anda tahu nama penerima (Dear Ms Wong). "Yours faithfully," apabila anda tidak tahu namanya (Dear Sir/Madam). "Kind regards," juga diterima secara meluas dalam emel moden.',
          },
        ],
      },
      {
        id: 'informal-example',
        title: 'Contoh beranotasi: emel tidak formal',
        blocks: [
          {
            kind: 'example',
            heading: 'Reply to Hafiz (informal)',
            caption: 'Lihat fungsi setiap ayat. Anotasi ditulis dalam BM.',
            lines: [
              { en: 'Hi Hafiz,', label: 'Salam', note: 'Mesra kerana Hafiz ialah sepupu. Ada koma selepas nama.' },
              { en: "Thanks for your email! I'm so happy that you're joining my school next year.", label: 'Pembuka', note: 'Membalas emelnya dan menunjukkan perasaan.' },
              {
                en: 'One interesting place is the school garden behind the library. It is quiet and shady, so it is a perfect place to read during recess.',
                label: 'Isi 1',
                note: 'Menerangkan SATU tempat dengan butiran (di mana, mengapa menarik).',
              },
              {
                en: 'Since you love taking photos, you should join the Photography Club. Members go on a photo trip every term.',
                label: 'Isi 2',
                note: 'Satu kelab + sebab yang dikaitkan dengan minat Hafiz.',
              },
              {
                en: 'My advice for your first week is to pack your bag the night before, so you will not forget any books.',
                label: 'Isi 3',
                note: 'Nasihat khusus untuk minggu pertama dengan sebab ("so...").',
              },
              { en: 'I hope this helps. See you soon!', label: 'Ayat penutup' },
              { en: 'Best wishes,\nAmir', label: 'Penutup + nama' },
            ],
          },
        ],
      },
      {
        id: 'formal-example',
        title: 'Contoh beranotasi: emel formal',
        blocks: [
          {
            kind: 'example',
            heading: 'Email to Ms Wong (formal)',
            lines: [
              { en: 'Dear Ms Wong,', label: 'Salam', note: 'Gelaran + nama keluarga. Jangan tulis "Dear teacher Wong".' },
              { en: 'I am writing to suggest an activity for Reading Week.', label: 'Pembuka', note: 'Terus menyatakan tujuan.' },
              {
                en: 'I would like to suggest a Book Swap. Students could bring a book they have finished reading and exchange it for a different one.',
                label: 'Isi 1',
                note: 'Cadangan + penerangan ringkas bagaimana ia berfungsi.',
              },
              {
                en: 'I believe students would enjoy it because they can discover new books without spending any money.',
                label: 'Isi 2',
                note: 'Sebab yang jelas dengan "because".',
              },
              {
                en: 'I would be happy to help by collecting the books and making posters for the event.',
                label: 'Isi 3',
                note: 'Tawaran bantuan yang khusus, bukan sekadar "I can help".',
              },
              { en: 'Thank you for considering my suggestion.', label: 'Ayat penutup' },
              { en: 'Yours sincerely,\nNurul Aina (4 Bestari)', label: 'Penutup + nama', note: 'Tiada singkatan seperti "I\'m" dalam emel formal ini.' },
            ],
          },
          {
            kind: 'callout',
            tone: 'warning',
            title: 'Kesilapan biasa',
            body: 'Bermula dengan "Dear Ms Wong," tetapi kemudian menulis "Hey, gonna tell u my idea" — nada mesti konsisten dari awal hingga akhir. Lupa menulis nama selepas penutup juga ialah kesilapan biasa.',
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'quiz',
        id: 'd1-l2-guided',
        role: 'guided',
        title: 'Latihan berpandu: Struktur dan nada',
        feedback: 'instant',
        questionIds: ['d1l2-g1', 'd1l2-g2', 'd1l2-g3', 'd1l2-g4', 'd1l2-g5', 'd1l2-g6', 'd1l2-g7'],
      },
      {
        kind: 'quiz',
        id: 'd1-l2-practice',
        role: 'practice',
        title: 'Latihan kendiri: Susun dan pilih',
        feedback: 'end',
        questionIds: ['d1l2-p1', 'd1l2-p2', 'd1l2-p3', 'd1l2-p4', 'd1l2-p5', 'd1l2-p6'],
      },
    ],
    summary: [
      'Struktur umum: salam → pembuka → isi → ayat penutup → penutup + nama.',
      'Penerima menentukan nada: formal untuk guru/organisasi, mesra untuk kawan/keluarga.',
      'Ikut format yang diberikan dalam tugasan; struktur ini ialah panduan umum.',
    ],
  },

  // =========================================================================
  {
    id: 'd1-l3',
    day: 1,
    number: '1.3',
    title: 'Useful Email Expressions',
    objective: 'Memilih ungkapan emel yang sesuai dengan fungsi, nada dan situasi — bukan menghafal semuanya untuk setiap emel.',
    objectives: [
      'Memahami maksud dan fungsi ungkapan emel yang lazim.',
      'Memilih ungkapan berdasarkan nada (formal/tidak formal) dan situasi.',
      'Menggunakan struktur tatabahasa yang betul selepas ungkapan tertentu.',
    ],
    durationMin: 20,
    skill: 'email',
    parts: [
      {
        id: 'bank',
        title: 'Bank ungkapan mengikut fungsi',
        blocks: [
          {
            kind: 'keyterms',
            heading: 'Membuka emel',
            items: [
              {
                term: 'Thank you for your email.',
                meaning: 'Terima kasih atas emel anda.',
                note: 'Hanya jika anda MEMBALAS emel. Sesuai untuk formal dan tidak formal.',
              },
              {
                term: 'I am writing to tell you about...',
                meaning: 'Saya menulis untuk memberitahu anda tentang...',
                note: 'Formal/separa formal. Terus menyatakan tujuan.',
              },
              { term: 'It was great to hear from you!', meaning: 'Gembira menerima berita daripada anda!', note: 'Tidak formal, untuk kawan/keluarga.' },
            ],
          },
          {
            kind: 'keyterms',
            heading: 'Memberi pendapat dan cadangan',
            items: [
              {
                term: 'In my opinion, ...',
                meaning: 'Pada pendapat saya, ...',
                example: 'In my opinion, the school field is the best place for the event.',
                note: 'Jangan tulis "In my opinion, I think..." — kedua-duanya bermaksud sama.',
              },
              {
                term: 'I would recommend...',
                meaning: 'Saya mengesyorkan...',
                example: 'I would recommend joining the Nature Club.',
                note: 'Diikuti kata kerja -ing atau kata nama. Bukan "recommend to join".',
              },
              { term: 'You should...', meaning: 'Anda patut...', example: 'You should bring a raincoat.', note: 'Diikuti kata kerja dasar.' },
              { term: 'How about...?', meaning: 'Bagaimana kalau...?', example: 'How about going to the museum?', note: 'Tidak formal. Diikuti kata kerja -ing.' },
            ],
          },
          {
            kind: 'keyterms',
            heading: 'Memberi sebab',
            items: [
              {
                term: 'One of the reasons is that...',
                meaning: 'Salah satu sebabnya ialah...',
                example: 'One of the reasons is that it helps me relax.',
                note: 'Selepas "that", tulis ayat lengkap (subjek + kata kerja).',
              },
              { term: 'This is because...', meaning: 'Ini kerana...', example: 'This is because the hall is too small.' },
            ],
          },
          {
            kind: 'keyterms',
            heading: 'Menutup emel',
            items: [
              { term: 'I hope this information helps.', meaning: 'Saya harap maklumat ini membantu.', note: 'Selepas memberi maklumat atau nasihat.' },
              {
                term: 'I look forward to hearing from you.',
                meaning: 'Saya menantikan balasan daripada anda.',
                note: 'Formal. Perhatikan "to hearing", bukan "to hear".',
              },
              { term: 'Write back soon!', meaning: 'Balas segera ya!', note: 'Tidak formal sahaja.' },
              { term: 'Best wishes,', meaning: 'Salam sejahtera / Yang ikhlas (mesra)', note: 'Penutup mesra tetapi sopan; sesuai untuk kawan dan keluarga.' },
              { term: 'Yours sincerely,', meaning: 'Yang benar (formal)', note: 'Formal, apabila anda tahu nama penerima.' },
            ],
          },
          {
            kind: 'callout',
            tone: 'info',
            title: 'Terjemahan bukan sentiasa tepat',
            body: 'Maksud BM di atas ialah panduan fungsi, bukan terjemahan perkataan demi perkataan. Contohnya, "Best wishes," tiada padanan tepat dalam BM — yang penting ialah anda tahu ia penutup yang mesra.',
          },
        ],
      },
      {
        id: 'grammar',
        title: 'Struktur tatabahasa selepas ungkapan',
        blocks: [
          {
            kind: 'compare',
            weakLabel: 'Salah',
            strongLabel: 'Betul',
            items: [
              { weak: 'I look forward to hear from you.', strong: 'I look forward to hearing from you.', why: '"To" dalam "look forward to" ialah kata sendi nama, jadi diikuti kata kerja -ing.' },
              { weak: 'I would recommend to join the club.', strong: 'I would recommend joining the club.', why: '"Recommend" diikuti -ing atau kata nama.' },
              { weak: 'In my opinion, I think the trip is fun.', strong: 'In my opinion, the trip is fun.', why: 'Elakkan pengulangan makna. Gunakan salah satu sahaja.' },
              { weak: 'One of the reason is it help me.', strong: 'One of the reasons is that it helps me.', why: '"One of the" + kata nama jamak; "it" + kata kerja dengan -s.' },
            ],
          },
        ],
      },
      {
        id: 'choose',
        title: 'Pilih, jangan longgokkan',
        blocks: [
          {
            kind: 'callout',
            tone: 'warning',
            title: 'Bukan semua ungkapan untuk semua emel',
            body: 'Emel yang memasukkan sepuluh ungkapan hafalan tanpa menjawab soalan tetap lemah. Pilih 2–4 ungkapan yang sesuai dengan tujuan emel anda. Contohnya, emel jemputan memerlukan "Would you like to...?", bukan "I hope this information helps."',
          },
          {
            kind: 'table',
            heading: 'Padankan ungkapan dengan situasi',
            columns: ['Situasi', 'Ungkapan yang sesuai'],
            rows: [
              ['Membalas emel kawan yang meminta nasihat', 'Thanks for your email! / You should... / I hope this helps.'],
              ['Menjemput kawan ke aktiviti', 'Would you like to...? / It starts at... / Let me know if you can come.'],
              ['Emel formal kepada guru dengan cadangan', 'Dear Ms..., / I am writing to suggest... / Yours sincerely,'],
            ],
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'quiz',
        id: 'd1-l3-guided',
        role: 'guided',
        title: 'Latihan berpandu: Fungsi dan bentuk',
        feedback: 'instant',
        questionIds: ['d1l3-g1', 'd1l3-g2', 'd1l3-g3', 'd1l3-g4', 'd1l3-g5', 'd1l3-g6'],
      },
      {
        kind: 'quiz',
        id: 'd1-l3-practice',
        role: 'practice',
        title: 'Latihan kendiri: Ungkapan dalam situasi sebenar',
        feedback: 'end',
        questionIds: ['d1l3-p1', 'd1l3-p2', 'd1l3-p3', 'd1l3-p4', 'd1l3-p5', 'd1l3-p6', 'd1l3-p7'],
      },
    ],
    summary: [
      'Pilih ungkapan berdasarkan fungsi dan penerima.',
      '"Look forward to" dan "How about" diikuti kata kerja -ing; "recommend" diikuti -ing atau kata nama.',
      'Gunakan beberapa ungkapan yang tepat, bukan semua ungkapan yang anda hafal.',
    ],
  },

  // =========================================================================
  {
    id: 'd1-l4',
    day: 1,
    number: '1.4',
    title: 'Sentence Building for Emails',
    objective: 'Mengembangkan ayat ringkas menjadi ayat lengkap yang jelas dengan sebab, cadangan, pilihan dan butiran.',
    objectives: [
      'Membina ayat dengan struktur subjek + kata kerja + objek + butiran.',
      'Memberi sebab, cadangan dan pilihan dengan struktur yang betul.',
      'Menghubungkan idea dengan kata hubung yang sesuai.',
      'Mengembangkan ayat tanpa menjadikannya terlalu rumit.',
    ],
    durationMin: 20,
    skill: 'email',
    parts: [
      {
        id: 'basic',
        title: 'Struktur ayat asas',
        blocks: [
          {
            kind: 'text',
            paragraphs: [
              'Ayat bahasa Inggeris yang lengkap memerlukan sekurang-kurangnya **subjek** dan **kata kerja**. Kemudian anda boleh menambah objek dan butiran seperti tempat, masa atau sebab.',
            ],
          },
          {
            kind: 'table',
            columns: ['Subjek', 'Kata kerja', 'Objek', 'Butiran (tempat / masa)'],
            rows: [
              ['I', 'play', 'badminton', 'at the community hall every Saturday.'],
              ['My sister', 'is learning', 'the guitar', 'during the school holidays.'],
              ['Our class', 'visited', 'a fire station', 'last Thursday.'],
            ],
          },
        ],
      },
      {
        id: 'expand',
        title: 'Daripada ayat asas kepada ayat yang dikembangkan',
        blocks: [
          {
            kind: 'compare',
            weakLabel: 'Asas',
            strongLabel: 'Dikembangkan',
            items: [
              {
                weak: 'I like reading.',
                strong: 'I enjoy reading because it helps me learn new vocabulary and develop my imagination.',
                why: 'Kata kerja "enjoy" lebih khusus, "because" memberi sebab, dan dua faedah dihubungkan dengan "and". Ayat masih ringkas dan betul.',
              },
              {
                weak: 'The trip was good.',
                strong: 'The trip to Melaka was memorable because we learned about its history and tried local food.',
                why: 'Menambah DI MANA (to Melaka) dan MENGAPA (because...). "Memorable" lebih tepat daripada "good".',
              },
              {
                weak: 'You can join a club.',
                strong: 'You can join the Science Club, where members do simple experiments every Wednesday.',
                why: 'Menamakan kelab dan menambah butiran yang membantu pembaca membuat keputusan.',
              },
            ],
          },
        ],
      },
      {
        id: 'functions',
        title: 'Ayat untuk fungsi tertentu',
        blocks: [
          {
            kind: 'keyterms',
            heading: 'Struktur penting',
            items: [
              { term: 'Reason: ... because + subject + verb', meaning: 'Memberi sebab', example: 'I chose this hobby because it is cheap and fun.' },
              { term: 'Suggestion: You should + base verb', meaning: 'Memberi cadangan', example: 'You should bring an umbrella.', note: 'Bukan "should to bring".' },
              { term: 'Suggestion: I suggest + -ing', meaning: 'Mencadangkan', example: 'I suggest leaving early to avoid the traffic.' },
              { term: 'Preference: I prefer X to Y', meaning: 'Lebih suka X daripada Y', example: 'I prefer swimming to running.', note: 'Bukan "prefer ... than".' },
              { term: 'Preference: My favourite ... is ... because ...', meaning: 'Menyatakan kegemaran', example: 'My favourite subject is Science because I love experiments.' },
            ],
          },
          {
            kind: 'table',
            heading: 'Kata hubung asas',
            columns: ['Kata hubung', 'Fungsi', 'Contoh'],
            rows: [
              ['and', 'Menambah idea', 'We sang songs and played games.'],
              ['but', 'Menunjukkan perbezaan', 'The hike was tiring, but the view was amazing.'],
              ['because', 'Memberi sebab', 'I stayed at home because it was raining.'],
              ['so', 'Menunjukkan akibat', 'It was raining, so I stayed at home.'],
              ['or', 'Memberi pilihan', 'We can meet on Friday or Saturday.'],
            ],
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Jelas lebih baik daripada rumit',
            body: 'Ayat yang panjang dan penuh perkataan sukar tidak semestinya lebih baik. Jika anda tidak pasti tentang sesuatu perkataan atau struktur, gunakan versi yang anda yakin betul. Pemeriksa menghargai ketepatan.',
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'quiz',
        id: 'd1-l4-guided',
        role: 'guided',
        title: 'Latihan berpandu: Bina ayat',
        feedback: 'instant',
        questionIds: ['d1l4-g1', 'd1l4-g2', 'd1l4-g3', 'd1l4-g4', 'd1l4-g5', 'd1l4-g6'],
      },
      {
        kind: 'short-writing',
        id: 'd1-l4-practice',
        role: 'practice',
        title: 'Latihan kendiri: Kembangkan ayat',
        intro: 'Tulis versi anda dahulu. Ayat contoh akan dipaparkan selepas anda menghantar setiap jawapan. Jawapan anda tidak perlu sama dengan contoh.',
        items: [
          {
            id: 'a',
            instruction: 'Kembangkan ayat ini dengan memberi sebab (gunakan "because").',
            starter: 'I like drawing.',
            model: 'I like drawing because it helps me relax and express my ideas.',
            checklist: ['Ayat saya mempunyai subjek dan kata kerja.', 'Saya memberi sebab yang jelas.', 'Ayat bermula dengan huruf besar dan berakhir dengan noktah.'],
          },
          {
            id: 'b',
            instruction: 'Kembangkan cadangan ini dengan menamakan kelab dan memberi sebab.',
            starter: 'You should join the club.',
            model: 'You should join the Photography Club because you will learn how to take better pictures and make new friends.',
            checklist: ['Saya menggunakan "should" + kata kerja dasar.', 'Saya menamakan kelab yang khusus.', 'Saya memberi sebab.'],
          },
          {
            id: 'c',
            instruction: 'Tambah butiran BILA dan MENGAPA kepada ayat ini.',
            starter: 'The event was fun.',
            model: 'Our Sports Day last Friday was fun because every class cheered loudly for their team.',
            checklist: ['Saya menamakan acara itu.', 'Saya menambah bila acara berlaku.', 'Saya menerangkan mengapa ia menyeronokkan.'],
          },
          {
            id: 'd',
            instruction: 'Gabungkan dua ayat ini menjadi satu ayat dengan kata hubung yang sesuai.',
            starter: 'I want to go. I have tuition.',
            model: 'I want to go, but I have tuition that afternoon.',
            checklist: ['Saya menggunakan kata hubung yang menunjukkan perbezaan (but).', 'Ayat saya hanya mempunyai satu noktah di akhir.'],
          },
        ],
      },
    ],
    summary: [
      'Ayat lengkap memerlukan subjek dan kata kerja; tambah objek dan butiran.',
      'Gunakan "because" untuk sebab, "should + kata kerja dasar" untuk cadangan, "prefer X to Y" untuk pilihan.',
      'Kembangkan ayat dengan butiran yang relevan, bukan perkataan yang sukar.',
    ],
  },

  // =========================================================================
  {
    id: 'd1-l5',
    day: 1,
    number: '1.5',
    title: 'Guided Email Practice',
    objective: 'Melengkapkan emel separa siap sambil menjawab setiap isi wajib dengan bimbingan.',
    objectives: [
      'Menganalisis soalan emel dan membuat rancangan ringkas.',
      'Melengkapkan emel contoh dengan ungkapan dan struktur yang betul.',
      'Memilih ayat pembuka dan penutup yang sesuai.',
    ],
    durationMin: 20,
    skill: 'email',
    parts: [
      {
        id: 'task',
        title: 'Tugasan',
        blocks: [
          {
            kind: 'example',
            heading: 'Email question',
            lines: [
              {
                en: 'Your friend, Aina, has emailed you. She wants to start a new hobby during the school holidays and has asked for your advice.',
                label: 'Situasi',
                note: 'Penerima: Aina (kawan) → nada mesra. Anda membalas emelnya.',
              },
              { en: 'Write an email to Aina. In your email, you should:', label: 'Arahan' },
              { en: '• recommend one hobby', label: 'Isi 1' },
              { en: '• explain why it is a good hobby', label: 'Isi 2' },
              { en: '• tell her how she can start.', label: 'Isi 3', note: 'Langkah praktikal, contohnya apa yang perlu dibeli atau dilakukan dahulu.' },
            ],
          },
          {
            kind: 'table',
            heading: 'Rancangan Farah',
            columns: ['Isi', 'Idea', 'Butiran'],
            rows: [
              ['1. Recommend one hobby', 'Gardening', '—'],
              ['2. Why it is good', 'Relaxing; you can eat what you grow', 'Fresh herbs for cooking'],
              ['3. How to start', 'Small pots of herbs', 'Mint or basil; water every morning'],
            ],
          },
        ],
      },
      {
        id: 'sample',
        title: 'Emel separa siap',
        blocks: [
          {
            kind: 'example',
            heading: "Farah's reply (with gaps)",
            caption: 'Lengkapkan tempat kosong dalam latihan berpandu di bawah.',
            lines: [
              { en: 'Hi Aina,', label: 'Salam' },
              { en: '(1) ______ for your email. It was great to hear from you!', label: 'Pembuka' },
              { en: 'I would (2) ______ gardening as your new hobby.', label: 'Isi 1' },
              {
                en: '(3) ______ of the reasons is that it is very relaxing. Spending time with plants after a busy day helps me feel calm. Another reason is that you can use what you grow. I often add fresh mint from my garden to our drinks!',
                label: 'Isi 2',
              },
              {
                en: 'You can start by (4) ______ a few small pots of herbs, such as mint or basil. Put them near a sunny window and water them every morning.',
                label: 'Isi 3',
              },
              { en: 'I hope this information (5) ______. Let me know if you decide to try it!', label: 'Ayat penutup' },
              { en: '(6) ______ wishes,\nFarah', label: 'Penutup + nama' },
            ],
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'quiz',
        id: 'd1-l5-guided',
        role: 'guided',
        title: 'Latihan berpandu: Lengkapkan emel Farah',
        intro: 'Isi tempat kosong (1)–(6), kemudian pilih salam yang sesuai dan semak isi yang dijawab.',
        feedback: 'instant',
        questionIds: ['d1l5-g1', 'd1l5-g2', 'd1l5-g3', 'd1l5-g4', 'd1l5-g5', 'd1l5-g6', 'd1l5-g7', 'd1l5-g8'],
      },
      {
        kind: 'short-writing',
        id: 'd1-l5-practice',
        role: 'practice',
        title: 'Latihan kendiri: Tulis bahagian anda sendiri',
        intro: 'Bayangkan anda mencadangkan hobi yang lain kepada Aina. Tulis bahagian ini dengan perkataan anda sendiri.',
        items: [
          {
            id: 'a',
            instruction: 'Cadangkan SATU hobi lain dan terangkan mengapa ia hobi yang baik (2–3 ayat).',
            placeholder: 'I would recommend...',
            model:
              'I would recommend cycling as your new hobby. It keeps you fit, and you can explore new places in your neighbourhood. It is also more fun when you cycle with friends.',
            checklist: ['Saya mencadangkan satu hobi sahaja.', 'Saya memberi sekurang-kurangnya satu sebab yang jelas.', 'Ayat saya lengkap dan berakhir dengan noktah.'],
            rows: 4,
          },
          {
            id: 'b',
            instruction: 'Terangkan bagaimana Aina boleh bermula (1–2 ayat).',
            placeholder: 'You can start by...',
            model: 'You can start by borrowing a bicycle and riding around the park near your house on Saturday mornings.',
            checklist: ['Saya memberi langkah praktikal.', 'Saya menggunakan "start by + -ing" atau struktur cadangan yang betul.'],
            rows: 3,
          },
          {
            id: 'c',
            instruction: 'Tulis ayat penutup yang mesra dan sesuai untuk emel ini.',
            model: 'I hope this helps. Tell me which hobby you choose!',
            checklist: ['Ayat penutup saya sesuai untuk kawan.', 'Saya tidak menggunakan penutup formal seperti "Yours faithfully".'],
            rows: 2,
          },
        ],
      },
    ],
    summary: [
      'Ikut rancangan: setiap isi wajib mendapat sekurang-kurangnya satu ayat atau perenggan pendek.',
      'Ayat pembuka dan penutup mesti sesuai dengan penerima dan tujuan.',
      'Semak bahawa semua isi telah dijawab sebelum menutup emel.',
    ],
  },

  // =========================================================================
  {
    id: 'd1-l6',
    day: 1,
    number: '1.6',
    title: 'Independent Email Writing',
    objective: 'Menulis emel lengkap secara berdikari berdasarkan tugasan dengan penerima, tujuan dan isi wajib yang jelas.',
    objectives: [
      'Mengaplikasikan langkah analisis–rancang–tulis–semak.',
      'Menulis emel lengkap dalam masa yang dicadangkan.',
      'Membandingkan tulisan sendiri dengan jawapan model selepas menghantar.',
    ],
    durationMin: 25,
    skill: 'email',
    parts: [
      {
        id: 'process',
        title: 'Lima langkah menulis emel',
        blocks: [
          {
            kind: 'list',
            ordered: true,
            items: [
              '**Analisis (2 minit):** Garis penerima, bulatkan kata kerja tugasan, nomborkan isi wajib.',
              '**Rancang (3 minit):** Tulis satu idea dan satu butiran untuk setiap isi dalam ruang perancangan.',
              '**Tulis (12–15 minit):** Ikut struktur emel. Satu perenggan pendek untuk setiap isi.',
              '**Semak (3 minit):** Gunakan senarai semak kendiri — isi, nada, tatabahasa, ejaan, tanda baca.',
              '**Bandingkan dan perbaiki:** Selepas menghantar, baca jawapan model dan maklum balas, kemudian perbaiki draf anda.',
            ],
          },
          {
            kind: 'callout',
            tone: 'info',
            title: 'Panduan bilangan perkataan',
            body: 'Setiap tugasan mempunyai panduan perkataannya sendiri. Panduan ini untuk latihan dalam aplikasi sahaja — ikut had yang dinyatakan dalam soalan sebenar atau oleh guru anda.',
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Tulis dahulu, lihat model kemudian',
            body: 'Jawapan model hanya dipaparkan selepas anda menghantar tulisan sendiri. Ini supaya anda benar-benar berlatih membuat keputusan sendiri.',
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'writing-task',
        id: 'd1-l6-writing',
        role: 'practice',
        title: 'Tulis emel anda',
        intro: 'Pilih sekurang-kurangnya satu tugasan. Mulakan dengan tugasan "Asas" jika ini kali pertama anda.',
        writingType: 'email',
        promptIds: ['email-hobby', 'email-invite', 'email-event', 'email-study', 'email-trip'],
        required: 1,
      },
    ],
    summary: [
      'Analisis → rancang → tulis → semak → bandingkan dan perbaiki.',
      'Panduan perkataan berbeza mengikut tugasan.',
      'Jawapan model ialah alat perbandingan, bukan untuk disalin.',
    ],
  },

  // =========================================================================
  {
    id: 'd1-l7',
    day: 1,
    number: '1.7',
    title: 'Email Review',
    objective: 'Menilai emel menggunakan senarai semak dan rubrik pembelajaran, kemudian mengenal pasti langkah penambahbaikan.',
    objectives: [
      'Menggunakan senarai semak enam perkara untuk menilai emel.',
      'Memahami rubrik pembelajaran dan had-hadnya.',
      'Menilai emel sendiri dan menetapkan langkah penambahbaikan.',
    ],
    durationMin: 10,
    skill: 'email',
    parts: [
      {
        id: 'checklist',
        title: 'Senarai semak emel',
        blocks: [
          {
            kind: 'list',
            items: [
              '**Isi tugasan:** Adakah semua isi wajib dijawab?',
              '**Salam dan penutup:** Adakah ia sesuai dengan penerima?',
              '**Kandungan:** Adakah idea jelas, relevan dan mempunyai butiran?',
              '**Tatabahasa dan ayat:** Adakah ayat lengkap dan kata kerja betul?',
              '**Nada:** Adakah nada konsisten dan sesuai (formal/tidak formal)?',
              '**Ejaan dan tanda baca:** Huruf besar, noktah, koma, apostrof.',
            ],
          },
        ],
      },
      {
        id: 'rubric',
        title: 'Rubrik pembelajaran',
        blocks: [
          {
            kind: 'text',
            paragraphs: [
              'Selepas menghantar tulisan dalam Writing Studio, anda akan menilai diri sendiri menggunakan **enam dimensi** rubrik, setiap satu 0–5 markah (jumlah 30). Setiap dimensi menerangkan apa yang dinilai, ciri tulisan yang lebih kukuh, sebab markah hilang dan langkah seterusnya.',
            ],
          },
          {
            kind: 'table',
            columns: ['Dimensi', 'Soalan utama'],
            rows: [
              ['Task fulfilment', 'Adakah saya menjawab semua isi dengan relevan?'],
              ['Organisation', 'Adakah struktur dan perenggan jelas?'],
              ['Development of ideas', 'Adakah setiap isi dihuraikan dengan butiran atau sebab?'],
              ['Grammar & sentences', 'Adakah ayat lengkap dan tatabahasa tepat?'],
              ['Vocabulary & expression', 'Adakah perkataan dan ungkapan sesuai dan tepat?'],
              ['Spelling & punctuation', 'Adakah ejaan, huruf besar dan tanda baca betul?'],
            ],
          },
          {
            kind: 'callout',
            tone: 'warning',
            title: 'Bukan skor rasmi',
            body: 'Rubrik ini ialah rubrik pembelajaran yang direka untuk aplikasi ini. Ia membantu anda menilai dan memperbaiki tulisan, tetapi ia bukan skema pemarkahan rasmi SPM atau mana-mana peperiksaan. Semakan automatik dalam aplikasi hanya mengesan ciri asas seperti bilangan perkataan dan tanda baca — ia tidak menilai kualiti idea anda.',
          },
        ],
      },
    ],
    activities: [
      {
        kind: 'quiz',
        id: 'd1-l7-guided',
        role: 'guided',
        title: 'Latihan berpandu: Nilai emel yang lemah',
        feedback: 'instant',
        questionIds: ['d1l7-g1', 'd1l7-g2', 'd1l7-g3', 'd1l7-g4', 'd1l7-g5'],
      },
      {
        kind: 'rubric-review',
        id: 'd1-l7-rubric',
        role: 'practice',
        title: 'Latihan kendiri: Nilai emel anda sendiri',
        intro: 'Buka emel yang anda hantar dalam Pelajaran 1.6 dan lengkapkan penilaian kendiri menggunakan rubrik.',
        writingType: 'email',
      },
    ],
    summary: [
      'Semak enam perkara: isi, salam/penutup, kandungan, tatabahasa, nada, ejaan/tanda baca.',
      'Rubrik pembelajaran membantu anda menilai diri; ia bukan gred rasmi.',
      'Setiap penilaian perlu diikuti dengan satu langkah penambahbaikan yang jelas.',
    ],
  },
];
