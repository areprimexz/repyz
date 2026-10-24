import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle, Lock, PenLine, Timer, Layers, Target } from 'lucide-react';
import type { DayNumber } from '../types/content';
import { DAYS, VOCABULARY, dayDurationMin, lessonsForDay } from '../content';
import {
  continueLesson,
  courseProgress,
  dayProgress,
  dayRequirementMet,
  dayStatus,
  examUnlocked,
  isBootcampComplete,
  isLessonComplete,
  overallAccuracy,
  writingStats,
} from '../lib/progress';
import { revisionCount } from '../lib/vocab';
import { formatRelative, nowIso } from '../lib/format';
import { useAppState } from '../state/StoreContext';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatusBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/PageHeader';

const DAY_REQUIREMENT_LABEL: Record<DayNumber, string> = {
  1: 'Hantar sekurang-kurangnya satu emel kendiri',
  2: 'Hantar sekurang-kurangnya satu esei kendiri',
  3: 'Hantar ujian percubaan dan semak keputusannya',
};

export function Dashboard() {
  const state = useAppState();
  const course = courseProgress(state);
  const next = continueLesson(state);
  const accuracy = overallAccuracy(state);
  const toRevise = revisionCount(VOCABULARY, state.vocab, nowIso());
  const writing = writingStats(state);
  const started = course.completed > 0 || state.attempts.length > 0 || Object.keys(state.lessons).length > 0;
  const name = state.preferences.displayName;
  const complete = isBootcampComplete(state);

  const focusDay: DayNumber = next?.day ?? 3;
  const focusLessons = lessonsForDay(focusDay);

  return (
    <div className="dashboard">
      <header className="page-header">
        <div className="page-header__text">
          <p className="eyebrow">Papan Pemuka</p>
          <h1>{started ? `Selamat kembali${name ? `, ${name}` : ''}!` : `Selamat datang ke ENGLISH LAB${name ? `, ${name}` : ''}!`}</h1>
          <p className="page-header__desc">
            {started ? 'Teruskan dari tempat anda berhenti. Semua kemajuan dikira daripada aktiviti sebenar anda.' : 'Anda belum memulakan sebarang pelajaran. Mulakan dengan Pelajaran 1.1 — kira-kira 15 minit.'}
          </p>
        </div>
      </header>

      <section className="continue-card" aria-labelledby="continue-heading">
        <div className="continue-card__text">
          <p className="eyebrow eyebrow--light" id="continue-heading">
            {complete ? 'Kem selesai' : started ? 'Teruskan pembelajaran' : 'Mula di sini'}
          </p>
          {next ? (
            <>
              <h2 className="continue-card__title">
                {next.number} {next.title}
              </h2>
              <p className="continue-card__meta">
                Hari {next.day} · {next.durationMin} minit · {next.objective}
              </p>
            </>
          ) : complete ? (
            <h2 className="continue-card__title">Tahniah — anda telah melengkapkan ketiga-tiga hari.</h2>
          ) : (
            <h2 className="continue-card__title">Semua pelajaran yang dibuka telah selesai.</h2>
          )}
        </div>
        <div className="continue-card__side">
          <ProgressBar value={course.completed} max={course.total} label="Kemajuan kursus" showValue tone="success" />
          {next ? (
            <Link className="btn btn--primary btn--lg" to={`/lesson/${next.id}`}>
              {started ? 'Teruskan' : 'Mula Hari 1'} <ArrowRight size={18} aria-hidden />
            </Link>
          ) : (
            <Link className="btn btn--primary btn--lg" to="/progress">
              Lihat kemajuan <ArrowRight size={18} aria-hidden />
            </Link>
          )}
        </div>
      </section>

      <ul className="stat-row" aria-label="Ringkasan">
        <li className="stat">
          <span className="stat__label">
            <Target size={16} aria-hidden /> Ketepatan latihan
          </span>
          <span className="stat__value">{accuracy.percent === null ? '—' : `${accuracy.percent}%`}</span>
          <span className="stat__meta">{accuracy.answered > 0 ? `${accuracy.earned}/${accuracy.marks} markah daripada ${accuracy.answered} soalan dijawab` : 'Belum ada cubaan direkodkan'}</span>
        </li>
        <li className="stat">
          <span className="stat__label">
            <Layers size={16} aria-hidden /> Kosa kata untuk diulang kaji
          </span>
          <span className="stat__value">{toRevise}</span>
          <span className="stat__meta">
            <Link to="/vocabulary">{toRevise > 0 ? 'Ulang kaji sekarang' : 'Buka Vocabulary Lab'}</Link>
          </span>
        </li>
        <li className="stat">
          <span className="stat__label">
            <PenLine size={16} aria-hidden /> Tugasan penulisan dihantar
          </span>
          <span className="stat__value">{writing.email + writing.essay}</span>
          <span className="stat__meta">
            {writing.email} emel · {writing.essay} esei
          </span>
        </li>
      </ul>

      <section aria-labelledby="days-heading">
        <h2 id="days-heading" className="section-title">
          Program tiga hari
        </h2>
        <ul className="day-cards">
          {DAYS.map((d) => {
            const status = dayStatus(state, d.day);
            const prog = dayProgress(state, d.day);
            const first = lessonsForDay(d.day).find((l) => !isLessonComplete(state, l.id)) ?? lessonsForDay(d.day)[0];
            return (
              <li key={d.day} className={`day-card day-card--${status}`}>
                <div className="day-card__head">
                  <span className="day-card__num">Hari {d.day}</span>
                  <StatusBadge state={status} />
                </div>
                <h3 className="day-card__title">{d.title}</h3>
                <p className="day-card__sub">{d.subtitle}</p>
                <ProgressBar value={prog.completed} max={prog.total} label={`Kemajuan Hari ${d.day}`} showValue size="sm" tone={status === 'complete' ? 'success' : 'primary'} />
                <p className="day-card__meta">±{dayDurationMin(d.day)} minit</p>
                {status === 'locked' ? (
                  <p className="day-card__lock">
                    <Lock size={14} aria-hidden /> Lengkapkan Hari {d.day - 1} untuk membuka
                  </p>
                ) : (
                  <Link className="btn btn--secondary btn--sm" to={status === 'complete' ? `/curriculum#day-${d.day}` : `/lesson/${first.id}`}>
                    {status === 'complete' ? 'Ulang kaji' : status === 'in-progress' ? 'Teruskan' : 'Mula'}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <div className="dashboard__grid">
        <section className="panel" aria-labelledby="checklist-heading">
          <h2 id="checklist-heading" className="panel__title">
            Senarai semak Hari {focusDay}
          </h2>
          <ul className="checklist-view">
            {focusLessons.map((l) => {
              const done = isLessonComplete(state, l.id);
              return (
                <li key={l.id} className={done ? 'is-done' : ''}>
                  {done ? <CheckCircle2 size={18} className="ok" aria-label="Selesai" /> : <Circle size={18} aria-label="Belum selesai" />}
                  <Link to={`/lesson/${l.id}`}>
                    {l.number} {l.title}
                  </Link>
                  <span className="muted">{l.durationMin} min</span>
                </li>
              );
            })}
            <li className={dayRequirementMet(state, focusDay) ? 'is-done' : ''}>
              {dayRequirementMet(state, focusDay) ? <CheckCircle2 size={18} className="ok" aria-label="Selesai" /> : <Circle size={18} aria-label="Belum selesai" />}
              <span>{DAY_REQUIREMENT_LABEL[focusDay]}</span>
            </li>
          </ul>
        </section>

        <section className="panel" aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="panel__title">
            Aktiviti terkini
          </h2>
          {state.activity.length === 0 ? (
            <EmptyState title="Belum ada aktiviti">Aktiviti seperti kuiz yang dihantar dan pelajaran yang diselesaikan akan muncul di sini.</EmptyState>
          ) : (
            <ul className="activity-list">
              {state.activity.slice(0, 6).map((e) => (
                <li key={e.id}>
                  {e.href ? <Link to={e.href}>{e.text}</Link> : <span>{e.text}</span>}
                  <time dateTime={e.at} className="muted">
                    {formatRelative(e.at)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={`exam-teaser ${examUnlocked(state) ? '' : 'exam-teaser--locked'}`} aria-labelledby="exam-heading">
        <div>
          <h2 id="exam-heading" className="panel__title">
            <Timer size={18} aria-hidden /> Exam Arena — ujian percubaan bertempoh
          </h2>
          <p className="muted">
            {examUnlocked(state)
              ? 'Ujian dibuka. Gabungan tatabahasa, kosa kata dan satu tugasan penulisan.'
              : 'Dibuka selepas Hari 1 dan Hari 2 selesai. Bahan pelajaran yang telah selesai sentiasa boleh diulang kaji.'}
          </p>
        </div>
        {examUnlocked(state) ? (
          <Link className="btn btn--primary" to="/exam">
            Buka Exam Arena
          </Link>
        ) : (
          <span className="badge badge--neutral">
            <Lock size={14} aria-hidden /> Terkunci
          </span>
        )}
      </section>
    </div>
  );
}
