import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlarmClock, CheckCircle2, Circle, Play, Send, XCircle } from 'lucide-react';
import type { Difficulty, WritingType } from '../types/content';
import type { MockExam, MockExamConfig } from '../types/progress';
import { getPrompt, resolveQuestions } from '../content';
import { rubricMax, rubricTotal } from '../content/rubric';
import { DEFAULT_EXAM_CONFIG, DIFFICULTY_LABELS, DURATION_OPTIONS, buildExam, formatClock, remainingMs } from '../lib/exam';
import { isAnswered, toPublicQuestion } from '../lib/quiz';
import { countWords } from '../lib/writing';
import { examUnlocked, isDayComplete } from '../lib/progress';
import { formatDateTime, nowIso } from '../lib/format';
import { newSeed, uid } from '../lib/random';
import { useNow } from '../hooks/useNow';
import { useAutosave } from '../hooks/useAutosave';
import { useAppState, useDispatch } from '../state/StoreContext';
import { PageHeader, EmptyState } from '../components/ui/PageHeader';
import { Callout } from '../components/ui/Callout';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { QuestionView } from '../components/quiz/QuestionView';
import { WritingEditor } from '../components/writing/WritingEditor';
import { RichText } from '../components/ui/RichText';
import { Badge } from '../components/ui/Badge';

export function ExamArena() {
  const state = useAppState();
  const active = state.exams.find((e) => e.status === 'in-progress');
  if (active) return <ExamRunner key={active.id} examId={active.id} />;
  if (!examUnlocked(state)) return <ExamLocked />;
  return <ExamStart />;
}

function ExamLocked() {
  const state = useAppState();
  const items = [
    { label: 'Hari 1 selesai (semua pelajaran + satu emel kendiri)', done: isDayComplete(state, 1), href: '/curriculum#day-1' },
    { label: 'Hari 2 selesai (semua pelajaran + satu esei kendiri)', done: isDayComplete(state, 2), href: '/curriculum#day-2' },
  ];
  return (
    <div>
      <PageHeader eyebrow="Exam Arena" title="Ujian percubaan bertempoh" description="Ujian latihan dalaman yang menggabungkan tatabahasa, kosa kata dan satu tugasan penulisan." />
      <Callout tone="info" title="Exam Arena belum dibuka">
        <p>Ujian percubaan menggunakan kemahiran dari Hari 1 dan Hari 2. Syarat untuk membuka:</p>
        <ul className="checklist-view">
          {items.map((i) => (
            <li key={i.label} className={i.done ? 'is-done' : ''}>
              {i.done ? <CheckCircle2 size={18} className="ok" aria-label="Selesai" /> : <Circle size={18} aria-label="Belum selesai" />}
              <Link to={i.href}>{i.label}</Link>
            </li>
          ))}
        </ul>
        <p>
          Sementara itu, anda boleh berlatih dalam <Link to="/grammar">Grammar Gym</Link>, <Link to="/vocabulary">Vocabulary Lab</Link> dan{' '}
          <Link to="/writing">Writing Studio</Link>.
        </p>
      </Callout>
      <ExamHistory />
    </div>
  );
}

function ExamStart() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [config, setConfig] = useState<MockExamConfig>(DEFAULT_EXAM_CONFIG);
  const used = state.exams.map((e) => e.promptId);

  const start = () => {
    const exam = buildExam(config, nowIso(), newSeed(), used);
    dispatch({ type: 'startExam', exam });
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Exam Arena"
        title="Ujian percubaan bertempoh"
        description="Ujian latihan dalaman ENGLISH LAB — bukan format peperiksaan rasmi. Baca arahan dan kriteria pemarkahan sebelum bermula."
      />

      <div className="exam-start">
        <section className="panel" aria-labelledby="instr-heading">
          <h2 id="instr-heading" className="panel__title">
            Arahan
          </h2>
          <ol className="prose-list">
            <li>Ujian mempunyai tiga bahagian: A (tatabahasa), B (kosa kata) dan C (penulisan).</li>
            <li>Pemasa bermula apabila anda menekan "Mula ujian" dan terus berjalan walaupun anda memuat semula atau menutup halaman.</li>
            <li>Jawapan dan tulisan anda disimpan secara automatik dalam pelayar ini.</li>
            <li>Apabila masa tamat, jawapan yang disimpan akan dihantar secara automatik.</li>
            <li>Cadangan masa: objektif ±10 minit, penulisan selebihnya, dan 3 minit terakhir untuk menyemak.</li>
          </ol>
        </section>

        <section className="panel" aria-labelledby="criteria-heading">
          <h2 id="criteria-heading" className="panel__title">
            Kriteria pemarkahan
          </h2>
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Kriteria pemarkahan">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Bahagian</th>
                  <th scope="col">Markah</th>
                  <th scope="col">Cara dinilai</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">A: Tatabahasa</th>
                  <td>{config.grammarCount}</td>
                  <td>Automatik — 1 markah setiap jawapan yang betul.</td>
                </tr>
                <tr>
                  <th scope="row">B: Kosa kata</th>
                  <td>{config.vocabCount}</td>
                  <td>Automatik — 1 markah setiap jawapan yang betul.</td>
                </tr>
                <tr>
                  <th scope="row">C: Penulisan</th>
                  <td>{rubricMax()}</td>
                  <td>Semakan asas automatik + penilaian kendiri dengan rubrik pembelajaran (6 dimensi × 5). Skor ini dilaporkan berasingan, bukan dicampur dengan markah objektif.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel" aria-labelledby="config-heading">
          <h2 id="config-heading" className="panel__title">
            Tetapan ujian
          </h2>
          <div className="config-grid">
            <div className="field">
              <label htmlFor="cfg-type" className="field-label">
                Jenis tugasan penulisan
              </label>
              <select id="cfg-type" className="select" value={config.writingType} onChange={(e) => setConfig({ ...config, writingType: e.target.value as WritingType | 'any' })}>
                <option value="any">Rawak (emel atau esei)</option>
                <option value="email">Emel</option>
                <option value="essay">Esei / artikel</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="cfg-diff" className="field-label">
                Tahap kesukaran
              </label>
              <select id="cfg-diff" className="select" value={config.difficulty} onChange={(e) => setConfig({ ...config, difficulty: Number(e.target.value) as Difficulty })}>
                {([1, 2, 3] as Difficulty[]).map((d) => (
                  <option key={d} value={d}>
                    {DIFFICULTY_LABELS[d]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="cfg-dur" className="field-label">
                Tempoh
              </label>
              <select id="cfg-dur" className="select" value={config.durationMin} onChange={(e) => setConfig({ ...config, durationMin: Number(e.target.value) })}>
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} minit{d === DEFAULT_EXAM_CONFIG.durationMin ? ' (lalai)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" className="btn btn--primary btn--lg" onClick={start}>
            <Play size={18} aria-hidden /> Mula ujian ({config.durationMin} minit)
          </button>
        </section>
      </div>

      <ExamHistory />
    </div>
  );
}

function ExamHistory() {
  const state = useAppState();
  const exams = state.exams.filter((e) => e.status !== 'in-progress').slice().reverse();
  return (
    <section className="panel" aria-labelledby="exam-history">
      <h2 id="exam-history" className="panel__title">
        Sejarah ujian
      </h2>
      {exams.length === 0 ? (
        <EmptyState title="Belum ada ujian">Ujian yang anda hantar akan disenaraikan di sini.</EmptyState>
      ) : (
        <ul className="plain-list exam-history">
          {exams.map((e) => {
            const sub = state.submissions.find((s) => s.id === e.submissionId);
            const total = rubricTotal(sub?.rubricScores);
            return (
              <li key={e.id}>
                <div>
                  <p>
                    <strong>{formatDateTime(e.startedAt)}</strong> · {DIFFICULTY_LABELS[e.config.difficulty]} · {e.config.durationMin} minit
                  </p>
                  <p className="muted small">
                    {e.status === 'abandoned'
                      ? 'Dibatalkan (tidak dinilai)'
                      : `Objektif ${e.objectiveEarned}/${e.objectiveTotal}${total !== null ? ` · penulisan (kendiri) ${total}/${rubricMax()}` : ''}${e.reviewedAt ? ' · disemak' : ' · belum disemak'}`}
                  </p>
                </div>
                <Link className="btn btn--ghost btn--sm" to={`/exam/${e.id}`}>
                  {e.status === 'abandoned' ? 'Lihat' : 'Keputusan'}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ExamRunner({ examId }: { examId: string }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const exam = state.exams.find((e) => e.id === examId) as MockExam;
  const prompt = getPrompt(exam.promptId)!;
  const now = useNow(1000);
  const remaining = remainingMs(exam, now);
  const [text, setText] = useState(exam.writing);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const submitted = useRef(false);

  const saveWriting = useCallback((value: string) => dispatch({ type: 'saveExamWriting', examId, text: value, at: nowIso() }), [dispatch, examId]);
  const writingSave = useAutosave(saveWriting, 500);

  const grammar = useMemo(() => resolveQuestions(exam.grammarIds), [exam.grammarIds]);
  const vocab = useMemo(() => resolveQuestions(exam.vocabIds), [exam.vocabIds]);
  const publicGrammar = useMemo(() => grammar.map((q) => toPublicQuestion(q, exam.seed)), [grammar, exam.seed]);
  const publicVocab = useMemo(() => vocab.map((q) => toPublicQuestion(q, exam.seed)), [vocab, exam.seed]);
  const all = [...grammar, ...vocab];
  const answered = all.filter((q) => isAnswered(q, exam.responses[q.id])).length;
  const words = countWords(text);

  const doSubmit = useCallback(
    (auto: boolean) => {
      if (submitted.current) return;
      submitted.current = true;
      writingSave.flush();
      dispatch({ type: 'submitExam', examId, at: nowIso(), auto, submissionId: uid('sub') });
      navigate(`/exam/${examId}`);
    },
    [dispatch, examId, navigate, writingSave],
  );

  // Auto-submit once when time runs out (also when returning after the deadline).
  useEffect(() => {
    if (remaining <= 0) doSubmit(true);
  }, [remaining, doSubmit]);

  const warning = remaining <= 5 * 60_000;
  const minutesLeft = Math.ceil(remaining / 60_000);
  const announce = minutesLeft === 5 || minutesLeft === 1 ? `${minutesLeft} minit lagi` : '';

  return (
    <div className="exam-runner">
      <div className={`exam-bar ${warning ? 'exam-bar--warning' : ''}`}>
        <div className="exam-bar__timer" role="timer" aria-live="off" aria-label={`Masa berbaki ${formatClock(remaining)}`}>
          <AlarmClock size={20} aria-hidden />
          <span className="exam-bar__clock">{formatClock(remaining)}</span>
        </div>
        <span className="exam-bar__progress">
          {answered}/{all.length} objektif · {words} perkataan
        </span>
        <button type="button" className="btn btn--primary btn--sm" onClick={() => setConfirmSubmit(true)}>
          <Send size={16} aria-hidden /> Hantar ujian
        </button>
        <span className="sr-only" aria-live="assertive">
          {announce}
        </span>
      </div>

      <PageHeader eyebrow="Exam Arena · ujian sedang berjalan" title="Ujian percubaan" description={`Tahap ${DIFFICULTY_LABELS[exam.config.difficulty]} · ${exam.config.durationMin} minit · mula ${formatDateTime(exam.startedAt)}`} />

      <section className="exam-section" aria-labelledby="sec-a">
        <h2 id="sec-a">Bahagian A: Tatabahasa ({grammar.length} markah)</h2>
        <ol className="quiz__list">
          {grammar.map((q, i) => (
            <li key={q.id} className="quiz__item">
              <QuestionView question={publicGrammar[i]} number={i + 1} response={exam.responses[q.id]} onChange={(r) => dispatch({ type: 'answerExam', examId, questionId: q.id, response: r })} />
            </li>
          ))}
        </ol>
      </section>

      <section className="exam-section" aria-labelledby="sec-b">
        <h2 id="sec-b">Bahagian B: Kosa kata ({vocab.length} markah)</h2>
        <ol className="quiz__list">
          {vocab.map((q, i) => (
            <li key={q.id} className="quiz__item">
              <QuestionView
                question={publicVocab[i]}
                number={grammar.length + i + 1}
                response={exam.responses[q.id]}
                onChange={(r) => dispatch({ type: 'answerExam', examId, questionId: q.id, response: r })}
              />
            </li>
          ))}
        </ol>
      </section>

      <section className="exam-section" aria-labelledby="sec-c">
        <h2 id="sec-c">Bahagian C: Penulisan</h2>
        <div className="task-card">
          <div className="task-card__badges">
            <Badge tone="primary">{prompt.type === 'email' ? 'Emel' : 'Esei'}</Badge>
            <Badge tone="navy">{DIFFICULTY_LABELS[prompt.difficulty]}</Badge>
          </div>
          <h3 className="task-card__title">{prompt.title}</h3>
          <div className="task-card__task" lang="en">
            <RichText text={prompt.task} />
          </div>
          {prompt.stimulus && (
            <div className="stimulus">
              <p className="stimulus__label">{prompt.stimulus.label}</p>
              <p lang="en" className="stimulus__text">
                <RichText text={prompt.stimulus.text} />
              </p>
            </div>
          )}
          {prompt.wordGuide && <p className="muted small">Panduan latihan: {prompt.wordGuide.min}–{prompt.wordGuide.max} patah perkataan.</p>}
        </div>
        <WritingEditor
          id="exam-writing"
          label="Jawapan penulisan anda"
          value={text}
          onChange={(v) => {
            setText(v);
            writingSave.schedule(v);
          }}
          onBlur={writingSave.flush}
          guide={prompt.wordGuide}
          savedAt={exam.writingSavedAt}
        />
      </section>

      <div className="exam-footer">
        <button type="button" className="btn btn--ghost" onClick={() => setConfirmAbandon(true)}>
          <XCircle size={16} aria-hidden /> Batalkan ujian
        </button>
        <button type="button" className="btn btn--primary btn--lg" onClick={() => setConfirmSubmit(true)}>
          <Send size={18} aria-hidden /> Hantar ujian
        </button>
      </div>

      <ConfirmDialog
        open={confirmSubmit}
        title="Hantar ujian sekarang?"
        confirmLabel="Ya, hantar"
        cancelLabel="Kembali ke ujian"
        onConfirm={() => {
          setConfirmSubmit(false);
          doSubmit(false);
        }}
        onCancel={() => setConfirmSubmit(false)}
      >
        <ul className="plain-list">
          <li>
            Objektif dijawab: {answered}/{all.length}
            {answered < all.length ? ` — ${all.length - answered} tidak dijawab akan diberi 0 markah` : ''}
          </li>
          <li>Penulisan: {words} patah perkataan{words === 0 ? ' — tiada respons penulisan akan dinilai' : ''}</li>
          <li>Masa berbaki: {formatClock(remaining)}</li>
        </ul>
        <p>Selepas dihantar, jawapan tidak boleh diubah.</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmAbandon}
        title="Batalkan ujian ini?"
        tone="danger"
        confirmLabel="Ya, batalkan"
        cancelLabel="Teruskan ujian"
        onConfirm={() => {
          setConfirmAbandon(false);
          submitted.current = true;
          writingSave.flush();
          dispatch({ type: 'abandonExam', examId, at: nowIso() });
        }}
        onCancel={() => setConfirmAbandon(false)}
      >
        <p>Ujian tidak akan dinilai dan tidak dikira untuk syarat Hari 3. Jawapan dan tulisan anda kekal disimpan dalam sejarah ujian untuk rujukan.</p>
      </ConfirmDialog>
    </div>
  );
}
