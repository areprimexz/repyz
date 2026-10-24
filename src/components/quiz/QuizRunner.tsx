import { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, Send } from 'lucide-react';
import type { QuestionResponse } from '../../types/content';
import type { QuizSource, QuizSession } from '../../types/progress';
import { resolveQuestions } from '../../content';
import { isAnswered, reviewQuestion, summarize, toPublicQuestion, buildResult } from '../../lib/quiz';
import { newSeed, uid } from '../../lib/random';
import { nowIso } from '../../lib/format';
import { useAppState, useDispatch } from '../../state/StoreContext';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { QuestionView } from './QuestionView';
import { ScoreSummary } from './ScoreSummary';

export interface QuizRunnerProps {
  slot: string;
  source: QuizSource;
  title: string;
  intro?: string;
  /** When given, the runner creates/maintains the session for these ids (lesson quizzes). */
  questionIds?: string[];
  feedback?: 'instant' | 'end';
  lessonId?: string;
  activityId?: string;
  /** Custom "try again" for generated sets; defaults to restarting the same questions. */
  onRetry?: () => void;
  retryLabel?: string;
  headingLevel?: 'h2' | 'h3';
}

export function makeSession(params: {
  slot: string;
  source: QuizSource;
  title: string;
  questionIds: string[];
  feedback: 'instant' | 'end';
  lessonId?: string;
  activityId?: string;
}): QuizSession {
  return { ...params, seed: newSeed(), responses: {}, checked: [], startedAt: nowIso() };
}

function sameIds(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

export function QuizRunner({
  slot,
  source,
  title,
  intro,
  questionIds,
  feedback = 'end',
  lessonId,
  activityId,
  onRetry,
  retryLabel = 'Cuba lagi',
  headingLevel = 'h3',
}: QuizRunnerProps) {
  const state = useAppState();
  const dispatch = useDispatch();
  const session = state.quizSessions[slot];
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [onlyMistakes, setOnlyMistakes] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const wasFinished = useRef(Boolean(session?.attemptId));

  // Lesson quizzes: create the session on first view, or refresh it if the content changed.
  const idsKey = questionIds?.join('|');
  useEffect(() => {
    if (!questionIds) return;
    if (!session) {
      dispatch({ type: 'startQuiz', session: makeSession({ slot, source, title, questionIds, feedback, lessonId, activityId }) });
    } else if (!session.attemptId && !sameIds(session.questionIds, questionIds)) {
      dispatch({ type: 'startQuiz', force: true, session: makeSession({ slot, source, title, questionIds, feedback, lessonId, activityId }) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slot, idsKey, Boolean(session)]);

  const questions = useMemo(() => (session ? resolveQuestions(session.questionIds) : []), [session?.questionIds]); // eslint-disable-line react-hooks/exhaustive-deps
  const publicQuestions = useMemo(
    () => (session ? questions.map((q) => toPublicQuestion(q, session.seed)) : []),
    [questions, session?.seed], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const finished = Boolean(session?.attemptId);

  useEffect(() => {
    if (finished && !wasFinished.current) summaryRef.current?.focus();
    wasFinished.current = finished;
    if (!finished) setSubmitting(false);
  }, [finished]);

  if (!session) {
    return (
      <div className="quiz quiz--loading" aria-busy="true">
        Menyediakan soalan…
      </div>
    );
  }

  const Heading = headingLevel;
  const answeredCount = questions.filter((q) => isAnswered(q, session.responses[q.id])).length;
  const unanswered = questions.length - answeredCount;
  const instant = session.feedback === 'instant';
  const results = finished ? questions.map((q) => buildResult(q, session.responses[q.id])) : [];
  const summary = finished ? summarize(results) : null;

  const answer = (questionId: string, response: QuestionResponse) => dispatch({ type: 'answerQuestion', slot, questionId, response });
  const check = (questionId: string) => dispatch({ type: 'checkQuestion', slot, questionId, at: nowIso(), attemptId: uid('att') });
  const submit = () => {
    setConfirmOpen(false);
    if (submitting || finished) return;
    setSubmitting(true);
    dispatch({ type: 'submitQuiz', slot, attemptId: uid('att'), at: nowIso() });
  };
  const retry = () => {
    setOnlyMistakes(false);
    if (onRetry) onRetry();
    else
      dispatch({
        type: 'startQuiz',
        force: true,
        session: makeSession({
          slot,
          source: session.source,
          title: session.title,
          questionIds: session.questionIds,
          feedback: session.feedback,
          lessonId: session.lessonId,
          activityId: session.activityId,
        }),
      });
  };

  const visible = questions
    .map((q, i) => ({ q, pq: publicQuestions[i], i }))
    .filter(({ q }) => !onlyMistakes || buildResult(q, session.responses[q.id]).status !== 'correct');

  return (
    <section className="quiz" aria-label={title}>
      <div className="quiz__header">
        <div>
          <Heading className="quiz__title">{title}</Heading>
          {intro && <p className="quiz__intro">{intro}</p>}
        </div>
        {!finished && (
          <p className="quiz__progress" aria-live="polite">
            {instant ? `${session.checked.length}/${questions.length} disemak` : `${answeredCount}/${questions.length} dijawab`}
          </p>
        )}
      </div>

      {finished && summary && (
        <div ref={summaryRef} tabIndex={-1} className="quiz__summary-wrap">
          <ScoreSummary summary={summary} />
          <div className="quiz__summary-actions">
            {summary.correct < questions.length && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOnlyMistakes((v) => !v)} aria-pressed={onlyMistakes}>
                {onlyMistakes ? 'Tunjukkan semua soalan' : 'Semak kesilapan sahaja'}
              </button>
            )}
            <button type="button" className="btn btn--secondary btn--sm" onClick={retry}>
              <RotateCcw size={16} aria-hidden /> {retryLabel}
            </button>
          </div>
        </div>
      )}

      <ol className="quiz__list">
        {visible.map(({ q, pq, i }, vi) => {
          const response = session.responses[q.id];
          // Show a shared context once per run of questions, then refer back to it.
          let contextSameAs: number | undefined;
          for (let k = vi - 1; k >= 0 && q.context && visible[k].q.context === q.context; k--) contextSameAs = visible[k].i + 1;
          const checked = session.checked.includes(q.id);
          const review = finished || checked ? reviewQuestion(q, response) : undefined;
          return (
            <li key={q.id} className="quiz__item">
              <QuestionView question={pq} number={i + 1} response={response} onChange={(r) => answer(q.id, r)} review={review} contextSameAs={contextSameAs} />
              {instant && !checked && !finished && (
                <div className="quiz__check">
                  <button type="button" className="btn btn--primary btn--sm" onClick={() => check(q.id)} disabled={!isAnswered(q, response)}>
                    Semak jawapan
                  </button>
                  {!isAnswered(q, response) && <span className="hint">Jawab dahulu untuk menyemak.</span>}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {!instant && !finished && (
        <div className="quiz__footer">
          <p className="hint">
            {unanswered > 0 ? `${unanswered} soalan belum dijawab. ` : 'Semua soalan telah dijawab. '}
            Penjelasan akan dipaparkan selepas anda menghantar.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            disabled={submitting || answeredCount === 0}
            onClick={() => (unanswered > 0 ? setConfirmOpen(true) : submit())}
          >
            <Send size={16} aria-hidden /> {submitting ? 'Menghantar…' : 'Hantar jawapan'}
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Hantar dengan soalan yang belum dijawab?"
        confirmLabel="Hantar juga"
        cancelLabel="Kembali menjawab"
        onConfirm={submit}
        onCancel={() => setConfirmOpen(false)}
      >
        <p>
          Anda belum menjawab {unanswered} daripada {questions.length} soalan. Soalan yang tidak dijawab akan dikira sebagai "Tidak dijawab" (0 markah).
        </p>
      </ConfirmDialog>
    </section>
  );
}
