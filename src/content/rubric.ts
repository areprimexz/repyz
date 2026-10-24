import type { Rubric, RubricBand, WritingType } from '../types/content';

function bands(strong: string, developing: string, basic: string, none: string): RubricBand[] {
  return [
    { range: [5, 5], label: 'Kukuh', descriptor: strong },
    { range: [3, 4], label: 'Berkembang', descriptor: developing },
    { range: [1, 2], label: 'Asas', descriptor: basic },
    { range: [0, 0], label: 'Belum ditunjukkan', descriptor: none },
  ];
}

/**
 * Learning rubric for self-assessment. It is NOT an official examination
 * marking scheme. Scores per dimension run from 0 to maxPerDimension, and the
 * bands above document what each score range means.
 */
export const LEARNING_RUBRIC: Rubric = {
  id: 'english-lab-learning-rubric-v1',
  name: 'Rubrik Pembelajaran ENGLISH LAB',
  maxPerDimension: 5,
  isOfficial: false,
  disclaimer:
    'Ini rubrik pembelajaran untuk penilaian kendiri, bukan skema pemarkahan rasmi SPM atau mana-mana peperiksaan. Skor anda ialah penilaian anda sendiri berdasarkan penerangan setiap tahap. Untuk penilaian yang lebih tepat, minta guru anda menyemak tulisan anda.',
  dimensions: [
    {
      id: 'task',
      name: 'Pemenuhan tugasan',
      whatAssessed: 'Sama ada semua isi yang diminta dijawab dengan relevan dan sesuai dengan tujuan tugasan.',
      stronger: ['Setiap isi wajib dijawab dengan jelas.', 'Kandungan relevan dengan penerima/pembaca dan tujuan.', 'Isi berganda (contohnya "where AND when") dijawab sepenuhnya.'],
      loseMarks: ['Satu atau lebih isi wajib tertinggal.', 'Kandungan hafalan yang tidak berkaitan dengan soalan.', 'Menjawab hanya separuh isi berganda.'],
      nextStep: 'Nomborkan isi wajib dalam soalan dan tandakan di mana setiap satu dijawab dalam tulisan anda.',
      bands: bands(
        'Semua isi dijawab dengan lengkap dan relevan.',
        'Kebanyakan isi dijawab; satu isi kurang lengkap atau kurang jelas.',
        'Sebahagian isi tertinggal atau kandungan kurang berkaitan.',
        'Tulisan tidak menjawab tugasan.',
      ),
    },
    {
      id: 'organisation',
      name: 'Organisasi dan perenggan',
      whatAssessed: 'Struktur keseluruhan (salam–isi–penutup atau pendahuluan–isi–penutup) dan penggunaan perenggan.',
      stronger: ['Struktur yang sesuai dengan jenis tugasan.', 'Satu idea utama setiap perenggan.', 'Idea mengalir dengan logik dengan penanda wacana yang sesuai.'],
      loseMarks: ['Satu perenggan panjang tanpa pembahagian.', 'Tiada salam/penutup (emel) atau tiada pendahuluan/penutup (esei).', 'Idea melompat tanpa hubungan.'],
      nextStep: 'Rancang perenggan sebelum menulis dan tinggalkan satu baris kosong di antara perenggan.',
      bands: bands(
        'Struktur jelas dan sesuai; perenggan tersusun dengan logik.',
        'Struktur ada tetapi satu bahagian lemah (contohnya penutup terlalu ringkas).',
        'Struktur kurang jelas; perenggan tidak tersusun.',
        'Tiada struktur yang dapat dikenal pasti.',
      ),
    },
    {
      id: 'development',
      name: 'Perkembangan idea',
      whatAssessed: 'Sejauh mana setiap isi dihuraikan dengan penerangan, sebab, contoh atau butiran.',
      stronger: ['Setiap isi mempunyai penerangan dan contoh yang khusus.', 'Butiran relevan dan membantu pembaca memahami.', 'Tiada pengulangan idea yang sama.'],
      loseMarks: ['Isi hanya disebut tanpa huraian ("It is good.").', 'Contoh terlalu umum atau tidak berkaitan.', 'Mengulang idea yang sama dengan perkataan berbeza.'],
      nextStep: 'Gunakan PEEL: selepas setiap isi, tanya "Mengapa?" dan "Contohnya?"',
      bands: bands(
        'Semua isi dihuraikan dengan baik dengan sebab dan contoh yang khusus.',
        'Kebanyakan isi dihuraikan; beberapa butiran masih umum.',
        'Isi kebanyakannya disebut sahaja dengan sedikit huraian.',
        'Tiada huraian.',
      ),
    },
    {
      id: 'grammar',
      name: 'Tatabahasa dan ketepatan ayat',
      whatAssessed: 'Ketepatan kata kerja, kala, persetujuan subjek–kata kerja dan struktur ayat.',
      stronger: ['Kebanyakan ayat tepat dari segi tatabahasa.', 'Ayat lengkap — tiada fragmen atau ayat bercantum.', 'Kala yang konsisten.'],
      loseMarks: ['Kesilapan subjek–kata kerja (she go, they was).', 'Kala yang tidak konsisten.', 'Fragmen dan ayat bercantum.'],
      nextStep: 'Baca semula setiap ayat dan semak: siapa subjeknya, dan adakah kata kerja sepadan? Lihat Buku Kesilapan untuk corak kesilapan anda.',
      bands: bands(
        'Hampir tiada kesilapan tatabahasa; ayat lengkap dan pelbagai.',
        'Beberapa kesilapan kecil yang tidak mengganggu makna.',
        'Banyak kesilapan; sesetengahnya mengganggu makna.',
        'Kesilapan menyebabkan tulisan sukar difahami.',
      ),
    },
    {
      id: 'vocabulary',
      name: 'Kosa kata dan ungkapan',
      whatAssessed: 'Ketepatan dan kesesuaian perkataan, kolokasi dan ungkapan dengan nada tugasan.',
      stronger: ['Perkataan tepat dan khusus (bukan hanya good/bad/nice).', 'Kolokasi semula jadi (make a decision, pay attention).', 'Nada konsisten dengan penerima.'],
      loseMarks: ['Perkataan umum yang berulang.', 'Perkataan sukar yang digunakan secara salah.', 'Slanga dalam tulisan formal.'],
      nextStep: 'Gantikan dua atau tiga perkataan umum dengan perkataan yang lebih tepat yang anda yakin betul.',
      bands: bands(
        'Kosa kata tepat, pelbagai dan sesuai dengan nada.',
        'Kosa kata sesuai tetapi kadangkala berulang atau umum.',
        'Kosa kata terhad atau kerap tidak tepat.',
        'Kosa kata tidak membolehkan makna disampaikan.',
      ),
    },
    {
      id: 'mechanics',
      name: 'Ejaan dan tanda baca',
      whatAssessed: 'Ejaan, huruf besar, noktah, koma, tanda soal dan apostrof.',
      stronger: ['Ejaan betul untuk hampir semua perkataan.', 'Huruf besar dan noktah digunakan dengan betul.', 'Koma dan apostrof tepat.'],
      loseMarks: ['Huruf kecil di permulaan ayat atau untuk "I".', 'Tiada noktah di akhir ayat.', 'Ejaan perkataan lazim yang salah.'],
      nextStep: 'Baca tulisan anda sekali lagi khusus untuk huruf besar dan tanda baca sahaja. Semakan asas automatik boleh membantu mengesan sebahagiannya.',
      bands: bands(
        'Hampir tiada kesilapan ejaan dan tanda baca.',
        'Beberapa kesilapan kecil.',
        'Kesilapan yang kerap.',
        'Kesilapan menyebabkan tulisan sukar dibaca.',
      ),
    },
  ],
};

export function bandFor(score: number, rubric: Rubric = LEARNING_RUBRIC): RubricBand | undefined {
  const dimension = rubric.dimensions[0];
  return dimension?.bands.find((b) => score >= b.range[0] && score <= b.range[1]);
}

export function rubricTotal(scores: Record<string, number> | undefined, rubric: Rubric = LEARNING_RUBRIC): number | null {
  if (!scores) return null;
  let total = 0;
  for (const d of rubric.dimensions) {
    const s = scores[d.id];
    if (typeof s !== 'number') return null;
    total += s;
  }
  return total;
}

export function rubricMax(rubric: Rubric = LEARNING_RUBRIC): number {
  return rubric.dimensions.length * rubric.maxPerDimension;
}

/** Self-review checklist shown next to the editor. */
export const SELF_REVIEW: Record<WritingType, string[]> = {
  email: [
    'Saya menjawab SETIAP isi wajib (termasuk isi yang mempunyai dua bahagian).',
    'Salam dan penutup sesuai dengan penerima.',
    'Ayat pembuka menyatakan tujuan atau membalas emel.',
    'Setiap isi mempunyai butiran atau sebab.',
    'Nada konsisten (formal atau tidak formal).',
    'Saya menyemak bentuk kata kerja dan persetujuan subjek–kata kerja.',
    'Saya menyemak ejaan, huruf besar dan tanda baca.',
  ],
  essay: [
    'Saya menjawab setiap bahagian soalan.',
    'Esei mempunyai pendahuluan, perenggan isi dan penutup.',
    'Setiap perenggan isi mempunyai satu isi utama dengan penerangan dan contoh.',
    'Penanda wacana sesuai dan tidak berlebihan.',
    'Semua ayat lengkap (tiada fragmen atau ayat bercantum).',
    'Saya menyemak bentuk kata kerja dan persetujuan subjek–kata kerja.',
    'Saya menyemak ejaan, huruf besar dan tanda baca.',
    'Penutup merumuskan tanpa isi baharu.',
  ],
};
