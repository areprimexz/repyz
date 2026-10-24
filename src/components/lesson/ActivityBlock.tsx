import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, PenLine, Timer } from 'lucide-react';
import type { Lesson, LessonActivity } from '../../types/content';
import { getPrompt } from '../../content';
import { rubricTotal } from '../../content/rubric';
import { DIFFICULTY_LABELS } from '../../lib/exam';
import { examUnlocked, isActivityDone } from '../../lib/progress';
import { useAppState } from '../../state/StoreContext';
import { QuizRunner } from '../quiz/QuizRunner';
import { Badge } from '../ui/Badge';
import { Callout } from '../ui/Callout';
import { FinalSummary } from '../progress/StatsSummary';
import { ShortWriting } from './ShortWriting';

export function ActivityBlock({ lesson, activity }: { lesson: Lesson; activity: LessonActivity }) {
  const state = useAppState();
  const done = isActivityDone(state, activity);

  switch (activity.kind) {
    case 'quiz':
      return (
        <QuizRunner
          slot={`lesson:${lesson.id}:${activity.id}`}
          source="lesson"
          title={activity.title}
          intro={activity.intro}
          questionIds={activity.questionIds}
          feedback={activity.feedback}
          lessonId={lesson.id}
          activityId={activity.id}
        />
      );

    case 'short-writing':
      return <ShortWriting activity={activity} />;

    case 'writing-task': {
      const submitted = state.submissions.filter((s) => s.context === 'studio' && activity.promptIds.includes(s.promptId));
      return (
        <section className="activity-card" aria-label={activity.title}>
          <div className="quiz__header">
            <div>
              <h3 className="quiz__title">{activity.title}</h3>
              {activity.intro && <p className="quiz__intro">{activity.intro}</p>}
            </div>
            <p className="quiz__progress">{done ? 'Selesai' : `${submitted.length}/${activity.required} dihantar`}</p>
          </div>
          <ul className="prompt-mini-list">
            {activity.promptIds.map((id) => {
              const prompt = getPrompt(id);
              if (!prompt) return null;
              const count = submitted.filter((s) => s.promptId === id).length;
              const draft = state.drafts[id];
              return (
                <li key={id} className="prompt-mini">
                  <div>
                    <p className="prompt-mini__title">{prompt.title}</p>
                    <p className="prompt-mini__meta">
                      <Badge tone="navy">{DIFFICULTY_LABELS[prompt.difficulty]}</Badge> {prompt.suggestedMinutes} minit
                      {prompt.wordGuide ? ` · ${prompt.wordGuide.min}–${prompt.wordGuide.max} patah perkataan` : ''}
                      {count > 0 ? ` · dihantar ${count}×` : draft?.text ? ' · draf disimpan' : ''}
                    </p>
                  </div>
                  <Link className="btn btn--secondary btn--sm" to={`/writing/${id}`}>
                    <PenLine size={16} aria-hidden /> {count > 0 ? 'Buka' : draft?.text ? 'Sambung' : 'Mula menulis'}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      );
    }

    case 'rubric-review': {
      const subs = state.submissions.filter((s) => s.writingType === activity.writingType);
      return (
        <section className="activity-card" aria-label={activity.title}>
          <div className="quiz__header">
            <div>
              <h3 className="quiz__title">{activity.title}</h3>
              {activity.intro && <p className="quiz__intro">{activity.intro}</p>}
            </div>
            <p className="quiz__progress">{done ? 'Selesai' : 'Belum selesai'}</p>
          </div>
          {subs.length === 0 ? (
            <Callout tone="info">
              Anda belum menghantar {activity.writingType === 'email' ? 'emel' : 'esei'}.{' '}
              <Link to={activity.writingType === 'email' ? '/lesson/d1-l6' : '/lesson/d2-l6'}>Tulis satu dahulu</Link>, kemudian kembali ke sini.
            </Callout>
          ) : (
            <ul className="prompt-mini-list">
              {subs.map((s) => {
                const total = rubricTotal(s.rubricScores);
                return (
                  <li key={s.id} className="prompt-mini">
                    <div>
                      <p className="prompt-mini__title">
                        {getPrompt(s.promptId)?.title} — versi {s.version}
                      </p>
                      <p className="prompt-mini__meta">{total !== null ? `Penilaian kendiri: ${total}/30` : 'Belum dinilai dengan rubrik'}</p>
                    </div>
                    <Link className="btn btn--secondary btn--sm" to={`/writing/${s.promptId}/review/${s.id}#rubric`}>
                      {total !== null ? 'Lihat' : 'Nilai dengan rubrik'}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      );
    }

    case 'mock': {
      const unlocked = examUnlocked(state);
      const reviewed = state.exams.find((e) => e.status === 'submitted' && e.reviewedAt);
      const pending = state.exams.find((e) => e.status === 'submitted' && !e.reviewedAt);
      const inProgress = state.exams.find((e) => e.status === 'in-progress');
      return (
        <section className="activity-card" aria-label={activity.title}>
          <h3 className="quiz__title">{activity.title}</h3>
          {activity.intro && <p className="quiz__intro">{activity.intro}</p>}
          {!unlocked ? (
            <Callout tone="info" title="Ujian belum dibuka">
              Lengkapkan Hari 1 dan Hari 2 untuk membuka Exam Arena.
            </Callout>
          ) : reviewed ? (
            <p className="done-line">
              <CheckCircle2 size={18} aria-hidden /> Ujian dihantar dan keputusan telah disemak. <Link to={`/exam/${reviewed.id}`}>Lihat keputusan</Link>
            </p>
          ) : pending ? (
            <Callout tone="warning" title="Semak keputusan anda">
              Anda telah menghantar ujian. <Link to={`/exam/${pending.id}`}>Buka keputusan</Link>, lengkapkan penilaian kendiri dan tandakan keputusan sebagai disemak.
            </Callout>
          ) : (
            <Link className="btn btn--primary" to="/exam">
              <Timer size={16} aria-hidden /> {inProgress ? 'Sambung ujian yang sedang berjalan' : 'Pergi ke Exam Arena'}
            </Link>
          )}
        </section>
      );
    }

    case 'final-review':
      return (
        <section className="activity-card" aria-label={activity.title}>
          <h3 className="quiz__title">{activity.title}</h3>
          {!done && (
            <Callout tone="info" title="Ujian percubaan diperlukan">
              <Lock size={14} aria-hidden /> Hantar ujian percubaan dan semak keputusannya (Pelajaran 3.5) sebelum kem boleh ditandakan selesai.
            </Callout>
          )}
          <FinalSummary state={state} />
        </section>
      );
  }
}
