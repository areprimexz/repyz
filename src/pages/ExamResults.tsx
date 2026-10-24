import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ClipboardCheck, PenLine } from 'lucide-react';
import { getPrompt, resolveQuestions } from '../content';
import { tagLabel } from '../content/tags';
import { rubricMax, rubricTotal } from '../content/rubric';
import { DIFFICULTY_LABELS } from '../lib/exam';
import { reviewQuestion, summarize, toPublicQuestion, buildResult } from '../lib/quiz';
import { countWords } from '../lib/writing';
import { formatDateTime, nowIso } from '../lib/format';
import { useAppState, useDispatch } from '../state/StoreContext';
import { PageHeader, EmptyState } from '../components/ui/PageHeader';
import { Callout } from '../components/ui/Callout';
import { QuestionView } from '../components/quiz/QuestionView';
import { ScoreSummary } from '../components/quiz/ScoreSummary';

export function ExamResults() {
  const { examId = '' } = useParams();
  const state = useAppState();
  const dispatch = useDispatch();
  const exam = state.exams.find((e) => e.id === examId);
  const [onlyMistakes, setOnlyMistakes] = useState(false);

  const grammar = useMemo(() => (exam ? resolveQuestions(exam.grammarIds) : []), [exam]);
  const vocab = useMemo(() => (exam ? resolveQuestions(exam.vocabIds) : []), [exam]);

  if (!exam) {
    return (
      <EmptyState title="Ujian tidak dijumpai" action={<Link className="btn btn--primary" to="/exam">Kembali ke Exam Arena</Link>}>
        Rekod ujian ini mungkin telah dipadam apabila kemajuan ditetapkan semula.
      </EmptyState>
    );
  }
  if (exam.status === 'in-progress') return <Navigate to="/exam" replace />;

  const prompt = getPrompt(exam.promptId);
  const submission = state.submissions.find((s) => s.id === exam.submissionId);
  const rubric = rubricTotal(submission?.rubricScores);
  const gResults = grammar.map((q) => buildResult(q, exam.responses[q.id]));
  const vResults = vocab.map((q) => buildResult(q, exam.responses[q.id]));
  const gSummary = summarize(gResults);
  const vSummary = summarize(vResults);
  const overall = summarize([...gResults, ...vResults]);
  const missed = [...gResults, ...vResults].filter((r) => r.status !== 'correct');
  const missedTags = [...new Set(missed.map((r) => r.tag))];
  const needsRubric = Boolean(submission) && rubric === null;
  const canMarkReviewed = exam.status === 'submitted' && !exam.reviewedAt && !needsRubric;

  if (exam.status === 'abandoned') {
    return (
      <div>
        <Link className="back-link" to="/exam">
          <ArrowLeft size={16} aria-hidden /> Exam Arena
        </Link>
        <PageHeader eyebrow="Ujian dibatalkan" title="Rekod ujian yang dibatalkan" description={`Dimulakan ${formatDateTime(exam.startedAt)}. Ujian ini tidak dinilai.`} />
        <section className="panel">
          <h2 className="panel__title">Tulisan yang disimpan ({countWords(exam.writing)} perkataan)</h2>
          {exam.writing.trim() ? (
            <div className="writing-text" lang="en">
              {exam.writing}
            </div>
          ) : (
            <p className="muted">Tiada tulisan.</p>
          )}
        </section>
      </div>
    );
  }

  const section = (title: string, questions: typeof grammar, offset: number) => (
    <section className="exam-section" aria-label={title}>
      <h2>{title}</h2>
      <ol className="quiz__list">
        {questions.map((q, i) => {
          const review = reviewQuestion(q, exam.responses[q.id]);
          if (onlyMistakes && review.status === 'correct') return null;
          return (
            <li key={q.id} className="quiz__item">
              <QuestionView question={toPublicQuestion(q, exam.seed)} number={offset + i + 1} response={exam.responses[q.id]} review={review} />
            </li>
          );
        })}
      </ol>
    </section>
  );

  return (
    <div className="exam-results">
      <Link className="back-link" to="/exam">
        <ArrowLeft size={16} aria-hidden /> Exam Arena
      </Link>
      <PageHeader
        eyebrow="Keputusan ujian percubaan"
        title="Pecahan markah"
        description={`Dihantar ${formatDateTime(exam.submittedAt ?? exam.startedAt)} · ${DIFFICULTY_LABELS[exam.config.difficulty]} · ${exam.config.durationMin} minit. Ini ujian latihan dalaman, bukan gred peperiksaan rasmi.`}
      />

      {exam.autoSubmitted && (
        <Callout tone="warning" title="Masa tamat">
          Ujian dihantar secara automatik apabila masa tamat, menggunakan jawapan yang telah disimpan.
        </Callout>
      )}

      <div className="results-grid">
        <ScoreSummary summary={overall} label="Bahagian A + B (automatik)" />
        <div className="panel">
          <h2 className="panel__title">Pecahan</h2>
          <ul className="plain-list breakdown">
            <li>
              <span>A: Tatabahasa</span>
              <strong>
                {gSummary.earned}/{gSummary.total}
              </strong>
            </li>
            <li>
              <span>B: Kosa kata</span>
              <strong>
                {vSummary.earned}/{vSummary.total}
              </strong>
            </li>
            <li>
              <span>C: Penulisan (penilaian kendiri)</span>
              <strong>{submission ? (rubric !== null ? `${rubric}/${rubricMax()}` : 'Belum dinilai') : 'Tiada respons'}</strong>
            </li>
          </ul>
          <p className="muted small">Markah penulisan ialah penilaian kendiri anda menggunakan rubrik pembelajaran, dan dilaporkan berasingan daripada markah objektif.</p>
        </div>
      </div>

      <section className="panel" aria-labelledby="writing-res">
        <h2 id="writing-res" className="panel__title">
          Bahagian C: {prompt?.title}
        </h2>
        {submission ? (
          <>
            <p>
              {submission.wordCount} patah perkataan
              {prompt?.wordGuide ? ` (panduan ${prompt.wordGuide.min}–${prompt.wordGuide.max})` : ''}.{' '}
              {rubric === null ? 'Lengkapkan penilaian kendiri untuk menyemak keputusan anda.' : `Penilaian kendiri: ${rubric}/${rubricMax()}.`}
            </p>
            <Link className="btn btn--secondary" to={`/writing/${submission.promptId}/review/${submission.id}`}>
              <PenLine size={16} aria-hidden /> {rubric === null ? 'Semak tulisan dan nilai dengan rubrik' : 'Lihat maklum balas penulisan'}
            </Link>
          </>
        ) : (
          <p className="muted">Tiada respons penulisan dihantar dalam ujian ini, jadi Bahagian C tidak dinilai.</p>
        )}
      </section>

      <section className="panel" aria-labelledby="weak-res">
        <h2 id="weak-res" className="panel__title">
          Kelemahan dalam ujian ini
        </h2>
        {missedTags.length === 0 ? (
          <p>Semua soalan objektif dijawab dengan betul.</p>
        ) : (
          <ul className="tag-list">
            {missedTags.map((t) => (
              <li key={t} className="badge badge--warning">
                {tagLabel(t)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`completion ${exam.reviewedAt ? 'completion--done' : ''}`} aria-labelledby="reviewed-heading">
        <h2 id="reviewed-heading">Semakan keputusan</h2>
        {exam.reviewedAt ? (
          <p className="completion__done" role="status">
            <CheckCircle2 size={18} aria-hidden /> Keputusan disemak pada {formatDateTime(exam.reviewedAt)}. Pelajaran 3.5 dan 3.6 kini boleh ditandakan selesai.
          </p>
        ) : (
          <>
            <p>Baca penjelasan setiap soalan di bawah{submission ? ' dan lengkapkan penilaian kendiri untuk Bahagian C' : ''}, kemudian tandakan keputusan sebagai disemak.</p>
            <button type="button" className="btn btn--primary" disabled={!canMarkReviewed} onClick={() => dispatch({ type: 'markExamReviewed', examId: exam.id, at: nowIso() })}>
              <ClipboardCheck size={18} aria-hidden /> Tandakan keputusan sudah disemak
            </button>
            {needsRubric && <p className="hint">Lengkapkan penilaian kendiri rubrik untuk Bahagian C dahulu.</p>}
          </>
        )}
      </section>

      <div className="quiz__summary-actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOnlyMistakes((v) => !v)} aria-pressed={onlyMistakes}>
          {onlyMistakes ? 'Tunjukkan semua soalan' : 'Tunjukkan kesilapan sahaja'}
        </button>
      </div>
      {section(`Bahagian A: Tatabahasa (${gSummary.earned}/${gSummary.total})`, grammar, 0)}
      {section(`Bahagian B: Kosa kata (${vSummary.earned}/${vSummary.total})`, vocab, grammar.length)}
    </div>
  );
}
