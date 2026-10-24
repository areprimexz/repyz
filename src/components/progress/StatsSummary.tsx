import { Link } from 'react-router-dom';
import type { SkillCategory } from '../../types/content';
import type { AppState } from '../../types/progress';
import { SKILL_LABELS, tagLabel } from '../../content/tags';
import { rubricTotal, rubricMax } from '../../content/rubric';
import {
  accuracyBySkill,
  courseProgress,
  missedTags,
  recommendLessons,
  strongestSkill,
  writingStats,
  MIN_MARKS_FOR_STRENGTH,
} from '../../lib/progress';
import { ProgressBar } from '../ui/ProgressBar';
import { EmptyState } from '../ui/PageHeader';
import { formatDateTime } from '../../lib/format';

const SKILLS: SkillCategory[] = ['email', 'essay', 'grammar', 'vocabulary'];

export function SkillScores({ state }: { state: AppState }) {
  const bySkill = accuracyBySkill(state);
  return (
    <ul className="skill-grid">
      {SKILLS.map((skill) => {
        const acc = bySkill[skill];
        return (
          <li key={skill} className="skill-card">
            <p className="skill-card__name">{SKILL_LABELS[skill]}</p>
            {acc.percent === null ? (
              <p className="skill-card__empty">Belum ada jawapan</p>
            ) : (
              <>
                <p className="skill-card__value">{acc.percent}%</p>
                <ProgressBar value={acc.earned} max={acc.marks} label={`Ketepatan ${SKILL_LABELS[skill]}`} tone={acc.percent >= 70 ? 'success' : 'warning'} size="sm" />
                <p className="skill-card__meta">
                  {acc.earned}/{acc.marks} markah · {acc.answered} soalan dijawab
                  {acc.unanswered > 0 ? ` · ${acc.unanswered} tidak dijawab` : ''}
                </p>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function MissedTopics({ state, limit = 6 }: { state: AppState; limit?: number }) {
  const tags = missedTags(state).slice(0, limit);
  if (tags.length === 0) return <EmptyState title="Tiada kesilapan direkodkan lagi">Topik yang kerap salah akan dipaparkan di sini selepas anda menjawab kuiz.</EmptyState>;
  const max = Math.max(...tags.map((t) => t.timesWrong));
  return (
    <ul className="bar-list">
      {tags.map((t) => (
        <li key={t.tag} className="bar-list__item">
          <div className="bar-list__label">
            <span>{tagLabel(t.tag)}</span>
            <span className="bar-list__count">
              {t.timesWrong}× salah{t.unresolved > 0 ? ` · ${t.unresolved} belum dibetulkan` : ' · semua dibetulkan'}
            </span>
          </div>
          <div className="bar-list__track" aria-hidden>
            <div className="bar-list__fill" style={{ width: `${(t.timesWrong / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Recommendations({ state }: { state: AppState }) {
  const recs = recommendLessons(state);
  if (recs.length === 0)
    return <EmptyState title="Belum ada cadangan">Cadangan pelajaran berdasarkan kesilapan dan ketepatan anda akan muncul selepas anda menjawab lebih banyak soalan.</EmptyState>;
  return (
    <ul className="rec-list">
      {recs.map((r) => (
        <li key={r.lesson.id} className="rec-list__item">
          <div>
            <p className="rec-list__title">
              {r.lesson.number} {r.lesson.title}
            </p>
            <p className="rec-list__reason">{r.reason}</p>
          </div>
          <Link className="btn btn--secondary btn--sm" to={`/lesson/${r.lesson.id}`}>
            Ulang kaji
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Final review summary used in Lesson 3.6. */
export function FinalSummary({ state }: { state: AppState }) {
  const course = courseProgress(state);
  const bySkill = accuracyBySkill(state);
  const strongest = strongestSkill(state);
  const writing = writingStats(state);
  const exams = state.exams.filter((e) => e.status === 'submitted');

  return (
    <div className="final-summary">
      <ul className="stat-row">
        <li className="stat">
          <span className="stat__label">Pelajaran selesai</span>
          <span className="stat__value">
            {course.completed}/{course.total}
          </span>
        </li>
        <li className="stat">
          <span className="stat__label">Ketepatan tatabahasa</span>
          <span className="stat__value">{bySkill.grammar.percent === null ? '—' : `${bySkill.grammar.percent}%`}</span>
        </li>
        <li className="stat">
          <span className="stat__label">Kuiz kosa kata</span>
          <span className="stat__value">{bySkill.vocabulary.percent === null ? '—' : `${bySkill.vocabulary.percent}%`}</span>
        </li>
        <li className="stat">
          <span className="stat__label">Tugasan penulisan</span>
          <span className="stat__value">{writing.email + writing.essay}</span>
          <span className="stat__meta">
            {writing.email} emel · {writing.essay} esei
          </span>
        </li>
      </ul>

      <div className="final-summary__grid">
        <section className="panel">
          <h3>Kemahiran terkuat</h3>
          {strongest ? (
            <p>
              <strong>{SKILL_LABELS[strongest]}</strong> — ketepatan {bySkill[strongest].percent}% daripada {bySkill[strongest].marks} markah yang dijawab.
            </p>
          ) : (
            <p className="muted">Belum cukup data (sekurang-kurangnya {MIN_MARKS_FOR_STRENGTH} markah dijawab dalam satu kemahiran).</p>
          )}
        </section>
        <section className="panel">
          <h3>Ujian percubaan</h3>
          {exams.length === 0 ? (
            <p className="muted">Belum ada ujian percubaan yang dihantar.</p>
          ) : (
            <ul className="plain-list">
              {exams.map((e) => {
                const sub = state.submissions.find((s) => s.id === e.submissionId);
                const total = rubricTotal(sub?.rubricScores);
                return (
                  <li key={e.id}>
                    <Link to={`/exam/${e.id}`}>{formatDateTime(e.submittedAt ?? e.startedAt)}</Link>: objektif {e.objectiveEarned}/{e.objectiveTotal}
                    {total !== null ? ` · penulisan (penilaian kendiri) ${total}/${rubricMax()}` : ''}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="panel">
        <h3>Topik yang paling kerap salah</h3>
        <MissedTopics state={state} limit={5} />
      </section>
      <section className="panel">
        <h3>Cadangan pelajaran untuk diulang kaji</h3>
        <Recommendations state={state} />
      </section>
    </div>
  );
}
