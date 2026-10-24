import type { SkillCategory } from '../types/content';

export interface TagInfo {
  label: string;
  /** Lessons to revisit when this tag is often missed. */
  lessonIds: string[];
}

export const SKILL_LABELS: Record<SkillCategory, string> = {
  email: 'Penulisan emel',
  essay: 'Penulisan esei',
  grammar: 'Tatabahasa',
  vocabulary: 'Kosa kata',
};

export const TAGS: Record<string, TagInfo> = {
  'email-task': { label: 'Memahami soalan emel', lessonIds: ['d1-l1'] },
  'email-structure': { label: 'Struktur emel', lessonIds: ['d1-l2'] },
  'email-tone': { label: 'Nada emel (formal/tidak formal)', lessonIds: ['d1-l2', 'd1-l3'] },
  'email-expressions': { label: 'Ungkapan emel', lessonIds: ['d1-l3'] },
  'email-review': { label: 'Menilai emel', lessonIds: ['d1-l7'] },
  'sentence-building': { label: 'Membina ayat', lessonIds: ['d1-l4'] },
  'essay-task': { label: 'Memahami soalan esei', lessonIds: ['d2-l1'] },
  'essay-structure': { label: 'Struktur esei', lessonIds: ['d2-l2'] },
  peel: { label: 'Teknik PEEL', lessonIds: ['d2-l3'] },
  linking: { label: 'Penanda wacana', lessonIds: ['d2-l4'] },
  'sentence-improvement': { label: 'Memperbaiki ayat dan kosa kata', lessonIds: ['d2-l5'] },
  sva: { label: 'Persetujuan subjek–kata kerja', lessonIds: ['d3-l1', 'd3-l3'] },
  tenses: { label: 'Kala', lessonIds: ['d3-l1'] },
  articles: { label: 'Artikel a/an/the', lessonIds: ['d3-l1'] },
  prepositions: { label: 'Kata sendi nama', lessonIds: ['d3-l1'] },
  nouns: { label: 'Kata nama boleh/tidak boleh dikira', lessonIds: ['d3-l1'] },
  pronouns: { label: 'Kata ganti nama dan milikan', lessonIds: ['d3-l1'] },
  sentences: { label: 'Fragmen dan ayat bercantum', lessonIds: ['d3-l1', 'd2-l4'] },
  mechanics: { label: 'Huruf besar dan tanda baca', lessonIds: ['d3-l1', 'd3-l4'] },
  'word-choice': { label: 'Pilihan perkataan lazim', lessonIds: ['d3-l3'] },
  review: { label: 'Menyemak tulisan', lessonIds: ['d3-l4'] },
  vocab: { label: 'Kosa kata', lessonIds: ['d3-l2'] },
};

export function tagLabel(tag: string): string {
  return TAGS[tag]?.label ?? tag;
}
