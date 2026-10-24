import { Link } from 'react-router-dom';
import { Clock3, Lock } from 'lucide-react';
import type { Lesson } from '../types/content';
import { DAYS, dayDurationMin, lessonActivities, lessonsForDay } from '../content';
import { dayProgress, dayStatus, isLessonComplete, isLessonLocked, lessonSteps } from '../lib/progress';
import { useAppState } from '../state/StoreContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Badge, StatusBadge, type ProgressState } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';

const ACTIVITY_LABELS = {
  quiz: 'Kuiz',
  'short-writing': 'Penulisan pendek',
  'writing-task': 'Tugasan penulisan',
  'rubric-review': 'Penilaian rubrik',
  mock: 'Ujian bertempoh',
  'final-review': 'Ringkasan kemajuan',
} as const;

function activityChips(lesson: Lesson): string[] {
  return [...new Set(lessonActivities(lesson).map((a) => ACTIVITY_LABELS[a.kind]))];
}

export function Curriculum() {
  const state = useAppState();
  return (
    <div>
      <PageHeader
        eyebrow="Kurikulum"
        title="Semua pelajaran"
        description="Tiga hari, disusun mengikut urutan. Setiap hari dibuka selepas hari sebelumnya selesai. Pelajaran yang telah selesai sentiasa boleh diulang kaji."
      />
      {DAYS.map((d) => {
        const status = dayStatus(state, d.day);
        const prog = dayProgress(state, d.day);
        return (
          <section key={d.day} id={`day-${d.day}`} className="curriculum-day" aria-labelledby={`day-${d.day}-title`}>
            <div className="curriculum-day__head">
              <div>
                <p className="eyebrow">Hari {d.day}</p>
                <h2 id={`day-${d.day}-title`}>
                  {d.title} <span className="muted">— {d.subtitle}</span>
                </h2>
                <p>{d.goal}</p>
                <p className="muted small">
                  ±{dayDurationMin(d.day)} minit · Syarat selesai: {d.completionNote}
                </p>
              </div>
              <div className="curriculum-day__status">
                <StatusBadge state={status} />
                <ProgressBar value={prog.completed} max={prog.total} label={`Pelajaran selesai Hari ${d.day}`} showValue size="sm" />
              </div>
            </div>
            <ol className="lesson-list">
              {lessonsForDay(d.day).map((lesson) => {
                const locked = isLessonLocked(state, lesson);
                const complete = isLessonComplete(state, lesson.id);
                const steps = lessonSteps(state, lesson);
                const started = Boolean(state.lessons[lesson.id]?.lastOpenedAt) || steps.guided.done + steps.practice.done > 0 || steps.read;
                const lessonState: ProgressState = complete ? 'complete' : locked ? 'locked' : started ? 'in-progress' : 'not-started';
                return (
                  <li key={lesson.id} className={`lesson-row lesson-row--${lessonState}`}>
                    <div className="lesson-row__num" aria-hidden>
                      {lesson.number}
                    </div>
                    <div className="lesson-row__body">
                      <h3 className="lesson-row__title">
                        <span className="sr-only">Pelajaran {lesson.number}: </span>
                        {lesson.title}
                      </h3>
                      <p className="lesson-row__objective">{lesson.objective}</p>
                      <p className="lesson-row__meta">
                        <span>
                          <Clock3 size={14} aria-hidden /> {lesson.durationMin} minit
                        </span>
                        {activityChips(lesson).map((c) => (
                          <Badge key={c} tone="navy">
                            {c}
                          </Badge>
                        ))}
                      </p>
                    </div>
                    <div className="lesson-row__action">
                      <StatusBadge state={lessonState} />
                      {locked ? (
                        <span className="lesson-row__locked">
                          <Lock size={14} aria-hidden /> Selesaikan Hari {lesson.day - 1}
                        </span>
                      ) : (
                        <Link className={`btn btn--sm ${complete ? 'btn--ghost' : 'btn--secondary'}`} to={`/lesson/${lesson.id}`}>
                          {complete ? 'Ulang kaji' : started ? 'Teruskan' : 'Buka'}
                          <span className="sr-only"> pelajaran {lesson.number}</span>
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
