import type { DayInfo } from '../types/content';

export const DAYS: DayInfo[] = [
  {
    day: 1,
    title: 'Email Writing',
    subtitle: 'Masterclass Penulisan Emel',
    goal: 'Memahami soalan emel, menyusun respons dan menulis emel lengkap secara berdikari.',
    completionNote: 'Lengkapkan semua pelajaran dan hantar sekurang-kurangnya satu emel kendiri dalam Writing Studio.',
  },
  {
    day: 2,
    title: 'Essay Writing',
    subtitle: 'Masterclass Penulisan Esei',
    goal: 'Merancang, menyusun, mengembangkan dan menyemak esei dengan teknik PEEL dan penanda wacana.',
    completionNote: 'Lengkapkan semua pelajaran dan hantar sekurang-kurangnya satu esei kendiri dalam Writing Studio.',
  },
  {
    day: 3,
    title: 'Grammar, Vocabulary & Mock Exam',
    subtitle: 'Tatabahasa, Kosa Kata dan Ujian Percubaan',
    goal: 'Mengukuhkan tatabahasa dan kosa kata, membetulkan kesilapan lazim dan menduduki ujian percubaan bertempoh.',
    completionNote: 'Hantar ujian percubaan dalam Exam Arena dan semak keputusannya sebelum kem ditandakan selesai.',
  },
];

export function getDay(day: number): DayInfo | undefined {
  return DAYS.find((d) => d.day === day);
}
