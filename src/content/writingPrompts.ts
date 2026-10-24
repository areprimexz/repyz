import type { PlanField, WritingPrompt } from '../types/content';

const EMAIL_FRAME: PlanField[] = [{ id: 'greeting', label: 'Salam dan penutup yang akan digunakan', placeholder: 'Contoh: Hi Danial, ... Best wishes,' }];

const ESSAY_PLAN: PlanField[] = [
  { id: 'main', label: 'Idea utama esei (1 ayat)', placeholder: 'What is the main message of your essay?' },
  { id: 'p1', label: 'Isi 1 — Point + Explanation + Example', placeholder: 'P: ... / E: ... / Ex: ...' },
  { id: 'p2', label: 'Isi 2 — Point + Explanation + Example', placeholder: 'P: ... / E: ... / Ex: ...' },
  { id: 'p3', label: 'Isi 3 (jika perlu)', placeholder: 'P: ... / E: ... / Ex: ...' },
  { id: 'conclusion', label: 'Penutup — rumusan dan kenyataan akhir', placeholder: 'In conclusion, ...' },
];

function emailPlan(points: string[]): PlanField[] {
  return [
    ...points.map((label, i) => ({ id: `point${i + 1}`, label: `Isi ${i + 1}: ${label}`, placeholder: 'Idea + satu butiran atau sebab' })),
    ...EMAIL_FRAME,
  ];
}

export const WRITING_PROMPTS: WritingPrompt[] = [
  // ================================================================ EMAILS
  {
    id: 'email-hobby',
    type: 'email',
    title: 'Recommend a hobby to your cousin',
    difficulty: 1,
    register: 'informal',
    task:
      'Your cousin, Danial, has emailed you. He is bored during the school holidays and wants to try a new hobby.\n\nWrite an email to Danial. In your email, you should:\n• recommend one hobby\n• explain why you think he will enjoy it\n• tell him what he needs to start.',
    stimulus: {
      label: "Danial's email",
      text: "Hi!\nThe holidays are so long and I'm really bored. You always seem to have fun things to do. Can you recommend a hobby for me?\nDanial",
    },
    audience: 'Sepupu anda (keluarga) — nada mesra',
    purpose: 'Mengesyorkan hobi dan memberi panduan untuk bermula',
    requiredPoints: [
      { id: 'p1', text: 'Recommend one hobby', keywords: ['recommend', 'suggest', 'should try', 'why not', 'how about', 'hobby'] },
      { id: 'p2', text: 'Explain why he will enjoy it', keywords: ['because', 'since', 'enjoy', 'love', 'as you', 'fun'] },
      { id: 'p3', text: 'Tell him what he needs to start', keywords: ['need', 'start', 'begin', 'buy', 'get', 'first'] },
    ],
    suggestedMinutes: 20,
    wordGuide: { min: 80, max: 120 },
    planFields: emailPlan(['Hobi yang disyorkan', 'Mengapa dia akan menyukainya', 'Apa yang diperlukan untuk bermula']),
    tips: [
      'Danial ialah sepupu anda — gunakan "Hi Danial," dan penutup mesra seperti "Best wishes,".',
      'Pilih SATU hobi sahaja dan kaitkan dengan minat Danial.',
      'Isi ketiga perlu praktikal: alat, tempat atau langkah pertama.',
    ],
    modelAnswer:
      "Hi Danial,\n\nThanks for your email! I'm sorry to hear that you are bored.\n\nI would recommend photography as your new hobby. Since you love going outdoors, I think you will enjoy taking pictures of nature and the people around you. It is also a great way to remember special moments.\n\nTo start, you only need a phone with a good camera. You can watch free online tutorials to learn simple tips, such as how to use natural light. Later, you could join the photography club at school.\n\nI hope this helps. Send me some of your photos!\n\nBest wishes,\nHakim",
    modelNotes: [
      'Perenggan 2 menjawab isi 1 (photography) dan isi 2 (mengapa — kaitan dengan minat Danial).',
      'Perenggan 3 menjawab isi 3 dengan langkah yang praktikal dan khusus.',
      'Nada mesra tetapi tatabahasa tetap betul. Singkatan seperti "I\'m" diterima dalam emel tidak formal.',
    ],
  },
  {
    id: 'email-invite',
    type: 'email',
    title: 'Invite a friend to a beach clean-up',
    difficulty: 1,
    register: 'informal',
    task:
      'You and your neighbours are organising a beach clean-up this Saturday.\n\nWrite an email to your friend, Priya, inviting her to join. In your email, you should:\n• tell her about the activity\n• tell her where and when to meet\n• suggest what she should bring.',
    audience: 'Kawan anda — nada mesra',
    purpose: 'Menjemput dan memberi maklumat yang lengkap',
    requiredPoints: [
      { id: 'p1', text: 'Tell her about the activity', keywords: ['clean-up', 'clean', 'rubbish', 'collect', 'beach'] },
      { id: 'p2', text: 'Tell her where AND when to meet', keywords: ['meet', 'a.m.', 'p.m.', "o'clock", 'saturday'] },
      { id: 'p3', text: 'Suggest what she should bring', keywords: ['bring', 'wear', 'remember to', 'pack'] },
    ],
    suggestedMinutes: 20,
    wordGuide: { min: 80, max: 120 },
    planFields: emailPlan(['Aktiviti', 'Tempat DAN masa bertemu', 'Barang yang perlu dibawa']),
    tips: [
      'Isi kedua mempunyai DUA maklumat: tempat dan masa.',
      'Gunakan ungkapan jemputan yang sopan: "Would you like to join...?"',
      'Beri sebab untuk barang yang dicadangkan (contohnya "because it will be hot").',
    ],
    modelAnswer:
      "Hi Priya,\n\nHow are you? I'm writing to invite you to a beach clean-up this Saturday. My neighbours and I are going to collect rubbish along the beach so that it is safer for visitors and sea animals.\n\nLet's meet at the car park near the main entrance at 7.30 a.m. We will finish at about 10 a.m., before it gets too hot.\n\nYou should bring a hat, a water bottle and a pair of gloves. Please wear comfortable shoes too, because we will walk a lot.\n\nWould you like to join us? Let me know by Thursday.\n\nBest wishes,\nMei",
    modelNotes: [
      'Ayat pembuka terus menyatakan tujuan: "I\'m writing to invite you to..."',
      'Isi kedua lengkap: tempat (car park near the main entrance) DAN masa (7.30 a.m.).',
      'Cadangan barang disertakan sebab ("because we will walk a lot").',
    ],
  },
  {
    id: 'email-event',
    type: 'email',
    title: 'Describe a school event to a friend',
    difficulty: 2,
    register: 'informal',
    task:
      'Your friend, Jason, studies at another school. He wants to know about a recent event at your school.\n\nWrite an email to Jason. In your email, you should:\n• describe the event\n• tell him what you did during the event\n• explain what you enjoyed most and why.',
    audience: 'Kawan dari sekolah lain — nada mesra',
    purpose: 'Menerangkan pengalaman dan perasaan tentang acara sekolah',
    requiredPoints: [
      { id: 'p1', text: 'Describe the event', keywords: ['event', 'day', 'held', 'organised', 'organized', 'took place', 'celebrat'] },
      { id: 'p2', text: 'Tell him what you did', keywords: ['i helped', 'i joined', 'i took part', 'i was', 'my class', 'i sold', 'i performed'] },
      { id: 'p3', text: 'Explain what you enjoyed most and why', keywords: ['enjoyed', 'best part', 'favourite', 'most', 'because'] },
    ],
    suggestedMinutes: 25,
    wordGuide: { min: 100, max: 150 },
    planFields: emailPlan(['Acara (apa, bila, di mana)', 'Apa yang anda lakukan', 'Bahagian paling menyeronokkan + sebab']),
    tips: [
      'Gunakan kala lampau secara konsisten: was, held, helped, enjoyed.',
      'Isi ketiga memerlukan DUA perkara: apa yang paling anda nikmati DAN mengapa.',
      'Tambah butiran deria (bunyi, warna, makanan) supaya penerangan lebih hidup.',
    ],
    modelAnswer:
      "Hi Jason,\n\nThanks for your email! You asked about our school's Cultural Day, so here is my news.\n\nThe event was held last Saturday in the school hall. Every class set up a booth to show the food, clothes and traditions of a different community in Malaysia. There were also performances on stage throughout the day.\n\nMy class ran a booth about Sarawak. I helped to prepare plates of kek lapis, and I also explained the meaning of some traditional patterns to visitors.\n\nWhat I enjoyed most was the dance performance at the end of the day. Students from every class danced together on stage, and the whole hall cheered. It showed how well we can work together.\n\nI hope your school has an event like this soon!\n\nTake care,\nArif",
    modelNotes: [
      'Perenggan 2 menerangkan acara: bila, di mana dan apa yang berlaku.',
      'Perenggan 3 menceritakan apa yang penulis lakukan dengan kata kerja lampau (ran, helped, explained).',
      'Perenggan 4 menjawab dua bahagian isi ketiga: apa (dance performance) dan mengapa (it showed how well we can work together).',
    ],
  },
  {
    id: 'email-study',
    type: 'email',
    title: 'Give study advice to a younger cousin',
    difficulty: 2,
    register: 'informal',
    task:
      'Your younger cousin, Aisyah, will sit for an important exam in two months. She has emailed you to say that she feels stressed and does not know how to start revising.\n\nWrite an email to Aisyah. In your email, you should:\n• show that you understand how she feels\n• give her two pieces of advice about studying\n• encourage her.',
    audience: 'Sepupu yang lebih muda — nada mesra dan menyokong',
    purpose: 'Memberi nasihat dan semangat',
    requiredPoints: [
      { id: 'p1', text: 'Show that you understand how she feels', keywords: ['understand', 'know how', 'felt', 'normal', 'feel the same'] },
      { id: 'p2', text: 'Give two pieces of advice about studying', keywords: ['should', 'try', 'advice', 'another', 'second', 'first'] },
      { id: 'p3', text: 'Encourage her', keywords: ['you can do it', 'believe', 'confident', 'good luck', 'proud', "don't give up", 'i know you'] },
    ],
    suggestedMinutes: 25,
    wordGuide: { min: 100, max: 150 },
    planFields: emailPlan(['Menunjukkan anda faham perasaannya', 'Dua nasihat belajar (dengan sebab)', 'Kata-kata semangat']),
    tips: [
      'Isi kedua meminta DUA nasihat. Gunakan "Firstly" dan "Secondly" supaya jelas.',
      'Setiap nasihat lebih berkesan jika disertakan sebab atau contoh.',
      'Nada perlu menyokong, bukan memarahi.',
    ],
    modelAnswer:
      "Dear Aisyah,\n\nThank you for your email. I understand how you feel, because I was also very nervous before my exams last year. It is normal to feel stressed, especially when there is so much to learn.\n\nFirstly, you should make a simple revision timetable. Choose two subjects a day and study each one for about forty minutes. This way, you will not feel that you have to learn everything at once.\n\nSecondly, try to test yourself instead of only reading your notes. For example, you can answer past-year questions or ask a friend to quiz you. This helps you remember more.\n\nTwo months is enough time if you start now. I know you can do it, and I am always here if you need help.\n\nLove,\nKak Nurul",
    modelNotes: [
      'Perenggan 1 menunjukkan empati dengan pengalaman sendiri — menjawab isi 1.',
      'Dua nasihat dipisahkan dengan "Firstly" dan "Secondly", setiap satu dengan sebab.',
      'Penutup memberi semangat yang tulus ("I know you can do it").',
    ],
  },
  {
    id: 'email-trip',
    type: 'email',
    title: 'Report a class trip to your teacher',
    difficulty: 3,
    register: 'formal',
    task:
      'Your class visited the National Science Centre last week. Your English teacher, Mr Ganesh, could not join the trip and has asked you to email him about it.\n\nWrite an email to Mr Ganesh. In your email, you should:\n• describe two activities your class did\n• explain what you learned\n• suggest one way to improve future trips.',
    audience: 'Guru anda — nada formal dan sopan',
    purpose: 'Melaporkan lawatan dan memberi cadangan',
    requiredPoints: [
      { id: 'p1', text: 'Describe two activities', keywords: ['first', 'activity', 'activities', 'we visited', 'we watched', 'we took part', 'also', 'exhibition', 'workshop'] },
      { id: 'p2', text: 'Explain what you learned', keywords: ['learned', 'learnt', 'discovered', 'found out', 'understand'] },
      { id: 'p3', text: 'Suggest one way to improve future trips', keywords: ['suggest', 'recommend', 'next time', 'improve', 'future', 'could', 'would be better'] },
    ],
    suggestedMinutes: 25,
    wordGuide: { min: 120, max: 170 },
    planFields: emailPlan(['Dua aktiviti', 'Apa yang dipelajari', 'Satu cadangan penambahbaikan']),
    tips: [
      'Emel kepada guru: "Dear Mr Ganesh," dan "Yours sincerely,". Elakkan singkatan seperti "I\'m".',
      'Isi pertama meminta DUA aktiviti — pastikan anda menerangkan kedua-duanya.',
      'Cadangan perlu sopan dan membina: "I would like to suggest..."',
    ],
    modelAnswer:
      "Dear Mr Ganesh,\n\nI am writing to tell you about our class trip to the National Science Centre last Wednesday.\n\nWe took part in two main activities. First, we visited the space exhibition, where we saw a model of a rocket and learned how astronauts live on a space station. After that, we joined a workshop and built simple circuits using batteries, wires and small bulbs.\n\nI learned that science is not only about memorising facts. The workshop showed me how electricity flows through a circuit, and I finally understood a topic that I had found difficult in class.\n\nFor future trips, I would like to suggest giving each group a short worksheet. This would help students focus on the most important information at each exhibition.\n\nThank you for reading my email.\n\nYours sincerely,\nLim Wei Jie (4 Cemerlang)",
    modelNotes: [
      'Nada formal yang konsisten: bentuk penuh (I am, would like to), tiada slanga.',
      'Dua aktiviti diterangkan dengan jelas menggunakan "First" dan "After that".',
      'Cadangan disertai sebab ("This would help students focus...").',
    ],
  },

  // ================================================================ ESSAYS
  {
    id: 'essay-reading',
    type: 'essay',
    title: 'The Benefits of Reading',
    difficulty: 1,
    register: 'semi-formal',
    task:
      'Write an essay titled "The Benefits of Reading".\n\nIn your essay, you should write about how reading:\n• improves our language skills\n• helps us relax\n• increases our knowledge.\nGive examples.',
    audience: 'Guru dan rakan sekelas',
    purpose: 'Menerangkan faedah membaca dengan contoh',
    requiredPoints: [
      { id: 'p1', text: 'How reading improves language skills', keywords: ['vocabulary', 'language', 'writing', 'grammar', 'words'] },
      { id: 'p2', text: 'How reading helps us relax', keywords: ['relax', 'stress', 'calm', 'escape', 'peaceful'] },
      { id: 'p3', text: 'How reading increases knowledge', keywords: ['knowledge', 'learn', 'information', 'facts', 'discover'] },
      { id: 'p4', text: 'Give examples', keywords: ['for example', 'for instance', 'such as'] },
    ],
    suggestedMinutes: 30,
    wordGuide: { min: 150, max: 200 },
    planFields: ESSAY_PLAN,
    tips: [
      'Setiap faedah boleh menjadi satu perenggan isi (PEEL).',
      'Soalan meminta contoh — gunakan "For example" sekurang-kurangnya sekali dalam setiap perenggan isi.',
      'Penutup merumuskan tiga faedah tanpa isi baharu.',
    ],
    modelAnswer:
      'The Benefits of Reading\n\nIn a world full of screens, reading books may seem old-fashioned. However, reading still offers many benefits, especially for students.\n\nFirstly, reading improves our language skills. When we read regularly, we meet new words and see how sentences are formed. For example, a student who reads English novels may learn words such as "curious" and use them in essays.\n\nFurthermore, reading helps us relax. A good story allows us to forget our worries for a while. For instance, reading a few chapters before bed can help us feel calm after a busy day.\n\nFinally, reading increases our knowledge. Books, newspapers and magazines teach us about history, science and other cultures. A student who reads about space, for example, may discover facts that are not in the textbook.\n\nIn conclusion, reading is a simple habit that improves our language, calms our minds and widens our knowledge. Students should make time to read every day.',
    modelNotes: [
      'Pendahuluan pendek memberi konteks dan menyatakan idea utama.',
      'Setiap perenggan isi mengikut PEEL dan bermula dengan penanda wacana yang berbeza (Firstly, Furthermore, Finally).',
      'Setiap perenggan mempunyai contoh khusus, seperti yang diminta.',
    ],
  },
  {
    id: 'essay-habits',
    type: 'essay',
    title: 'Good Habits for Students',
    difficulty: 1,
    register: 'semi-formal',
    task:
      'Your teacher has asked you to write an essay titled "Good Habits for Students".\n\nIn your essay, you should:\n• describe at least two good habits\n• explain how each habit helps students\n• give examples.',
    audience: 'Guru dan rakan sekelas',
    purpose: 'Menerangkan tabiat baik dan faedahnya',
    requiredPoints: [
      { id: 'p1', text: 'Describe at least two good habits', keywords: ['habit', 'firstly', 'secondly', 'another'] },
      { id: 'p2', text: 'Explain how each habit helps students', keywords: ['help', 'because', 'so that', 'as a result', 'allows'] },
      { id: 'p3', text: 'Give examples', keywords: ['for example', 'for instance', 'such as'] },
    ],
    suggestedMinutes: 30,
    wordGuide: { min: 150, max: 200 },
    planFields: ESSAY_PLAN,
    tips: [
      'Pilih tabiat yang anda boleh terangkan dengan baik, contohnya merancang masa, membaca atau tidur awal.',
      'Untuk setiap tabiat: apa tabiatnya, bagaimana ia membantu, dan satu contoh.',
    ],
    modelAnswer:
      'Good Habits for Students\n\nGood habits are small actions that we repeat every day. Over time, they can make a big difference to our studies and our health.\n\nOne useful habit is planning our time. Students who write down their homework and deadlines are less likely to forget important tasks. For example, a student who checks a simple planner every evening knows exactly what to prepare for the next day. As a result, they feel less stressed.\n\nAnother good habit is getting enough sleep. Sleep helps the brain store what we have learned during the day. For instance, students who go to bed by ten o\'clock usually find it easier to concentrate in morning lessons than those who stay up late.\n\nIn conclusion, planning our time and sleeping well are simple habits, but they help students stay organised, healthy and focused. If we start building them now, we will benefit from them for many years.',
    modelNotes: [
      'Dua tabiat, setiap satu dalam perenggan sendiri.',
      'Setiap perenggan menerangkan BAGAIMANA tabiat itu membantu, bukan sekadar menyebut "it is good".',
      'Penutup merumuskan dan memberi kenyataan akhir yang positif.',
    ],
  },
  {
    id: 'essay-environment',
    type: 'essay',
    title: 'Ways to Protect the Environment',
    difficulty: 2,
    register: 'semi-formal',
    task:
      'Write an essay titled "Ways to Protect the Environment".\n\nIn your essay, you should:\n• suggest at least three things young people can do at home or at school\n• explain why each action is important.',
    audience: 'Pembaca majalah sekolah (pelajar dan guru)',
    purpose: 'Mencadangkan tindakan praktikal dan menerangkan kepentingannya',
    requiredPoints: [
      { id: 'p1', text: 'Suggest at least three actions', keywords: ['recycle', 'reuse', 'reduce', 'switch off', 'plant', 'save'] },
      { id: 'p2', text: 'Explain why each action is important', keywords: ['because', 'this helps', 'as a result', 'important', 'so that'] },
      { id: 'p3', text: 'Focus on what young people can do at home or school', keywords: ['students', 'young people', 'teenagers', 'at school', 'at home'] },
    ],
    suggestedMinutes: 30,
    wordGuide: { min: 180, max: 230 },
    planFields: ESSAY_PLAN,
    tips: [
      'Cadangkan tindakan yang realistik untuk pelajar — bukan "the government should...".',
      'Setiap tindakan perlukan sebab: apa kesannya kepada alam sekitar?',
      'Variasikan penanda wacana: Firstly, In addition, Finally.',
    ],
    modelAnswer:
      'Ways to Protect the Environment\n\nMany people think that only governments can solve environmental problems. However, young people can also make a real difference through simple daily actions at home and at school.\n\nFirstly, students can reduce plastic waste by bringing reusable water bottles and food containers. Plastic takes hundreds of years to break down, and much of it ends up in rivers and seas. Using reusable items means less rubbish is thrown away every day.\n\nIn addition, we should switch off lights, fans and air-conditioners when we leave a room. This is important because most electricity in Malaysia is still produced by burning fuel, which pollutes the air. Saving electricity also lowers the bills at home and at school.\n\nFinally, students can join or start a recycling programme. For example, a class can collect old newspapers and aluminium cans and send them to a recycling centre. This reduces the amount of rubbish sent to landfills and teaches everyone to value resources.\n\nIn conclusion, reducing plastic, saving electricity and recycling are simple actions that young people can take. If every student does a little, the total effect on our environment will be significant.',
    modelNotes: [
      'Tiga tindakan yang realistik untuk pelajar, setiap satu dengan sebab yang jelas.',
      'Penanda wacana yang berbeza menunjukkan susunan isi tanpa diulang-ulang.',
      'Penutup merumuskan tiga tindakan dan memberi mesej akhir.',
    ],
  },
  {
    id: 'essay-health',
    type: 'essay',
    title: 'Ways to Reduce Stress Among Students',
    difficulty: 2,
    register: 'semi-formal',
    task:
      'Your school counsellor is collecting essays for a wellness week. Write an essay titled "Ways to Reduce Stress Among Students".\n\nIn your essay, you should:\n• explain why many students feel stressed\n• suggest at least two ways to reduce stress\n• give examples.',
    audience: 'Kaunselor sekolah dan pelajar',
    purpose: 'Menerangkan punca tekanan dan mencadangkan cara mengatasinya',
    requiredPoints: [
      { id: 'p1', text: 'Explain why many students feel stressed', keywords: ['because', 'pressure', 'exam', 'homework', 'cause'] },
      { id: 'p2', text: 'Suggest at least two ways to reduce stress', keywords: ['should', 'can', 'way', 'another', 'try'] },
      { id: 'p3', text: 'Give examples', keywords: ['for example', 'for instance', 'such as'] },
    ],
    suggestedMinutes: 30,
    wordGuide: { min: 180, max: 230 },
    planFields: ESSAY_PLAN,
    tips: [
      'Perenggan pertama atau kedua boleh menerangkan punca tekanan.',
      'Cadangan perlu praktikal dan boleh dilakukan oleh pelajar sendiri.',
      'Elakkan nasihat yang terlalu umum seperti "be happy" tanpa penerangan.',
    ],
    modelAnswer:
      'Ways to Reduce Stress Among Students\n\nStress is a common problem among students today. Although a little pressure can motivate us, too much stress can affect our health and our results.\n\nThere are several reasons why students feel stressed. Many have a heavy timetable of classes, tuition and homework. In addition, exams create pressure because students worry about disappointing their parents or themselves. Some students also stay up late on their phones, so they feel tired and anxious the next day.\n\nOne effective way to reduce stress is to exercise regularly. Physical activity releases chemicals in the brain that improve our mood. For example, a twenty-minute walk or a game of badminton after school can help students feel calmer and sleep better.\n\nAnother way is to talk to someone we trust. Keeping worries to ourselves often makes them feel bigger. For instance, a student who shares a problem with a friend, a parent or the school counsellor may receive useful advice and feel less alone.\n\nIn conclusion, stress is a normal part of student life, but it does not have to control us. By exercising and sharing our feelings, we can manage stress and enjoy our school years more.',
    modelNotes: [
      'Perenggan 2 menerangkan punca tekanan, seperti yang diminta oleh isi pertama.',
      'Dua cadangan yang praktikal, setiap satu dengan penerangan dan contoh (PEEL).',
      'Penutup merumuskan tanpa memperkenalkan cadangan baharu.',
    ],
  },
  {
    id: 'essay-technology',
    type: 'essay',
    title: 'Technology: Friend or Foe for Teenagers?',
    difficulty: 3,
    register: 'semi-formal',
    task:
      'Write an essay titled "Technology: Friend or Foe for Teenagers?".\n\nIn your essay, you should:\n• discuss the benefits of technology for teenagers\n• discuss the challenges it brings\n• give your own opinion at the end.',
    audience: 'Guru dan pelajar',
    purpose: 'Membincangkan dua sudut dan memberi pendapat',
    requiredPoints: [
      { id: 'p1', text: 'Discuss the benefits', keywords: ['benefit', 'advantage', 'helps', 'useful', 'positive'] },
      { id: 'p2', text: 'Discuss the challenges', keywords: ['challenge', 'disadvantage', 'however', 'problem', 'negative', 'addicted', 'distract'] },
      { id: 'p3', text: 'Give your own opinion at the end', keywords: ['in my opinion', 'i believe', 'i think', 'personally', 'in my view'] },
    ],
    suggestedMinutes: 35,
    wordGuide: { min: 200, max: 250 },
    planFields: ESSAY_PLAN,
    tips: [
      '"Discuss" bermaksud melihat kedua-dua belah: faedah DAN cabaran.',
      'Gunakan penanda perbezaan seperti "However" atau "On the other hand" apabila beralih kepada cabaran.',
      'Pendapat anda di penutup perlu konsisten dengan hujah dalam esei.',
    ],
    modelAnswer:
      'Technology: Friend or Foe for Teenagers?\n\nToday, most teenagers own a smartphone and spend several hours online every day. Technology has clearly changed the way young people learn and communicate, but is it a friend or a foe?\n\nOn the one hand, technology brings many benefits. It allows students to find information quickly and learn in new ways. For example, online videos can explain difficult Science topics step by step, and students can replay them as often as they need. Technology also helps teenagers communicate with friends and relatives who live far away.\n\nOn the other hand, technology brings serious challenges. Some teenagers become addicted to social media or games and spend less time studying, exercising or sleeping. In addition, notifications can be a constant distraction. A student who checks the phone every few minutes will find it hard to concentrate on homework.\n\nIn my opinion, technology is a friend as long as we use it wisely. Teenagers should set limits, such as switching off their phones during study time and before bed. Parents and teachers can also guide them to use it responsibly.\n\nIn conclusion, technology itself is neither good nor bad. It depends on how we use it. If teenagers manage their screen time well, technology will remain a helpful friend rather than a harmful foe.',
    modelNotes: [
      '"On the one hand" dan "On the other hand" menunjukkan dua sudut dengan jelas.',
      'Setiap sudut mempunyai penerangan dan contoh yang khusus.',
      'Pendapat penulis dinyatakan dengan jelas dan disokong dengan cadangan praktikal.',
    ],
  },
  {
    id: 'essay-time',
    type: 'essay',
    title: 'The Importance of Managing Time (article)',
    difficulty: 3,
    register: 'semi-formal',
    task:
      'Write an ARTICLE for your school magazine titled "The Importance of Managing Time".\n\nIn your article, you should:\n• explain why time management is important for students\n• suggest practical ways to manage time better\n• write in a way that speaks to the readers of your school magazine.',
    audience: 'Pembaca majalah sekolah — pelajar',
    purpose: 'Meyakinkan pembaca tentang kepentingan pengurusan masa dan memberi tip',
    requiredPoints: [
      { id: 'p1', text: 'Explain why time management is important', keywords: ['important', 'because', 'stress', 'results', 'achieve'] },
      { id: 'p2', text: 'Suggest practical ways to manage time', keywords: ['planner', 'schedule', 'timetable', 'list', 'prioritise', 'prioritize', 'plan'] },
      { id: 'p3', text: 'Speak to the readers of the magazine', keywords: ['you', 'your', 'have you ever', 'readers', 'fellow students'] },
    ],
    suggestedMinutes: 35,
    wordGuide: { min: 200, max: 250 },
    planFields: [
      { id: 'title', label: 'Tajuk dan ayat pembuka yang menarik', placeholder: 'Have you ever...?' },
      ...ESSAY_PLAN.slice(1),
    ],
    tips: [
      'Artikel boleh menyapa pembaca secara langsung: "Have you ever...?", "you".',
      'Gabungkan sebab (mengapa penting) dengan tip praktikal (bagaimana).',
      'Tajuk sudah diberi — anda boleh menulisnya di baris pertama.',
    ],
    modelAnswer:
      'The Importance of Managing Time\n\nHave you ever stayed up until midnight to finish homework that was due the next morning? If so, you are not alone. Many students struggle to manage their time, but learning this skill can change your school life.\n\nWhy is time management so important? Firstly, it reduces stress. When you plan your work early, you do not need to rush or worry at the last minute. Secondly, it helps you achieve better results, because you have enough time to revise properly instead of cramming the night before an exam.\n\nSo, how can you manage your time better? One practical way is to use a weekly planner. Write down your classes, homework deadlines and activities, and check it every evening. Another tip is to prioritise your tasks. Finish the most urgent or difficult work first, when your mind is fresh. You can also break big projects into smaller steps, such as finding information on Monday and writing the first draft on Wednesday.\n\nFinally, remember to plan time for rest. Hobbies, exercise and time with your family are not a waste of time; they give you the energy to keep going.\n\nTime is something we can never get back. Start planning today, and you will soon notice the difference in your grades and your mood.',
    modelNotes: [
      'Pembukaan dengan soalan menarik perhatian pembaca — sesuai untuk artikel.',
      'Soalan retorik ("Why is time management so important?", "So, how can you...?") menyusun artikel kepada dua bahagian.',
      'Tip yang praktikal dan khusus (weekly planner, prioritise, break big projects into steps).',
    ],
  },
];

export function getPrompt(id: string): WritingPrompt | undefined {
  return WRITING_PROMPTS.find((p) => p.id === id);
}
