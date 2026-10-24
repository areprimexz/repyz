import { useState } from 'react';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import type { DayNumber, SkillCategory } from '../types/content';
import { DAYS, VOCABULARY, getPrompt, resolveQuestion } from '../content';
import { SKILL_LABELS, tagLabel } from '../content/tags';
import { rubricMax, rubricTotal } from '../content/rubric';
import { courseProgress, dayProgress, unresolvedMistakes } from '../lib/progress';
import { describeCorrectAnswer, describeResponse } from '../lib/quiz';
import { isDue, vocabStatus } from '../lib/vocab';
import { formatDateTime, nowIso } from '../lib/format';
import { newSeed } from '../lib/random';
import { useAppState, useDispatch } from '../state/StoreContext';
import { PageHeader, EmptyState } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { RichText } from '../components/ui/RichText';
import { Badge } from '../components/ui/Badge';
import { MissedTopics, Recommendations, SkillScores } from '../components/progress/StatsSummary';
import { QuizRunner, makeSession } from '../components/quiz/QuizRunner';
import { TabPanel, Tabs } from '../components/ui/Tabs';

const SLOT = 'mistakes';

export function ProgressPage() {
  const [tab, setTab] = useState<'overview' | 'notebook'>('overview');
  return (
    <div>
      <PageHeader
        eyebrow="Kemajuan"
        title="Kemajuan & Buku Kesilapan"
        description="Semua angka di sini dikira daripada aktiviti sebenar anda dalam pelayar ini."
      />
      <Tabs
        label="Paparan kemajuan"
        idPrefix="progress"
        value={tab}
        onChange={setTab}
        tabs={[
          ['overview', 'Ringkasan'],
          ['notebook', 'Buku Kesilapan'],
        ]}
      />
      <TabPanel idPrefix="progress" value={tab}>
        {tab === 'overview' ? <Overview /> : <Notebook />}
      </TabPanel>
    </div>
  );
}

function Overview() {
  const state = useAppState();
  const course = courseProgress(state);
  const now = nowIso();
  const vocabToRevise = VOCABULARY.filter((v) => isDue(state.vocab[v.id], now));
  const submissions = state.submissions.slice().reverse();
  const exams = state.exams.filter((e) => e.status === 'submitted').slice().reverse();

  return (
    <div className="progress-page">
      <section className="panel" aria-labelledby="lessons-h">
        <h2 id="lessons-h" className="panel__title">
          Pelajaran selesai: {course.completed}/{course.total}
        </h2>
        <ProgressBar value={course.completed} max={course.total} label="Semua pelajaran" tone="success" />
        <ul className="day-progress">
          {DAYS.map((d) => {
            const p = dayProgress(state, d.day as DayNumber);
            return (
              <li key={d.day}>
                <ProgressBar value={p.completed} max={p.total} label={`Hari ${d.day}: ${d.title}`} showValue size="sm" />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel" aria-labelledby="skills-h">
        <h2 id="skills-h" className="panel__title">
          Markah mengikut kemahiran
        </h2>
        <p className="muted small">Ketepatan = markah diperoleh ÷ markah bagi soalan yang dijawab, merentas semua cubaan. Soalan yang tidak dijawab dikira berasingan.</p>
        <SkillScores state={state} />
      </section>

      <div className="two-col">
        <section className="panel" aria-labelledby="missed-h">
          <h2 id="missed-h" className="panel__title">
            Peraturan yang kerap salah
          </h2>
          <MissedTopics state={state} />
        </section>
        <section className="panel" aria-labelledby="rec-h">
          <h2 id="rec-h" className="panel__title">
            Pelajaran yang disyorkan untuk ulang kaji
          </h2>
          <Recommendations state={state} />
        </section>
      </div>

      <section className="panel" aria-labelledby="vocab-h">
        <h2 id="vocab-h" className="panel__title">
          Kosa kata yang perlu diulang kaji ({vocabToRevise.length})
        </h2>
        {vocabToRevise.length === 0 ? (
          <EmptyState title="Tiada perkataan untuk diulang kaji sekarang">Perkataan yang salah dijawab atau sudah tiba masa ulang kaji akan muncul di sini.</EmptyState>
        ) : (
          <>
            <ul className="tag-list">
              {vocabToRevise.slice(0, 20).map((v) => (
                <li key={v.id} className={`badge ${vocabStatus(state.vocab[v.id]) === 'practice' ? 'badge--warning' : 'badge--primary'}`} lang="en">
                  {v.word}
                </li>
              ))}
            </ul>
            <Link className="btn btn--secondary btn--sm" to="/vocabulary">
              Ulang kaji dalam Vocabulary Lab
            </Link>
          </>
        )}
      </section>

      <div className="two-col">
        <section className="panel" aria-labelledby="writing-h">
          <h2 id="writing-h" className="panel__title">
            Tulisan yang dihantar ({submissions.length})
          </h2>
          {submissions.length === 0 ? (
            <EmptyState title="Belum ada tulisan dihantar" action={<Link to="/writing">Buka Writing Studio</Link>} />
          ) : (
            <ul className="plain-list">
              {submissions.slice(0, 10).map((s) => {
                const total = rubricTotal(s.rubricScores);
                return (
                  <li key={s.id}>
                    <Link to={`/writing/${s.promptId}/review/${s.id}`}>
                      {getPrompt(s.promptId)?.title ?? s.promptId} (v{s.version})
                    </Link>{' '}
                    {s.context === 'exam' && <Badge tone="navy">Ujian</Badge>}
                    <span className="muted small">
                      {' '}
                      · {formatDateTime(s.submittedAt)} · {s.wordCount} perkataan{total !== null ? ` · ${total}/${rubricMax()}` : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="panel" aria-labelledby="exams-h">
          <h2 id="exams-h" className="panel__title">
            Sejarah penilaian ({exams.length})
          </h2>
          {exams.length === 0 ? (
            <EmptyState title="Belum ada ujian percubaan" />
          ) : (
            <ul className="plain-list">
              {exams.map((e) => (
                <li key={e.id}>
                  <Link to={`/exam/${e.id}`}>{formatDateTime(e.submittedAt ?? e.startedAt)}</Link>
                  <span className="muted small">
                    {' '}
                    · objektif {e.objectiveEarned}/{e.objectiveTotal} {e.reviewedAt ? '· disemak' : '· belum disemak'}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="panel__sub">Kuiz yang dihantar: {state.attempts.filter((a) => a.source !== 'exam').length}</p>
        </section>
      </div>
    </div>
  );
}

function Notebook() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [skill, setSkill] = useState<'all' | SkillCategory>('all');
  const [showResolved, setShowResolved] = useState(false);
  const session = state.quizSessions[SLOT];
  const open = unresolvedMistakes(state).filter((m) => (skill === 'all' || m.skill === skill) && resolveQuestion(m.questionId));
  const resolved = Object.values(state.mistakes).filter((m) => m.resolved && (skill === 'all' || m.skill === skill));

  const startReview = () => {
    const seed = newSeed();
    const ids = open.slice(0, 10).map((m) => m.questionId);
    dispatch({ type: 'startQuiz', force: true, session: { ...makeSession({ slot: SLOT, source: 'mistakes', title: 'Ulang kesilapan', questionIds: ids, feedback: 'end' }), seed } });
  };

  if (session && !session.attemptId) {
    return (
      <div>
        <QuizRunner slot={SLOT} source="mistakes" title="Ulang kesilapan" headingLevel="h2" />
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'discardQuiz', slot: SLOT })}>
          Kembali ke Buku Kesilapan
        </button>
      </div>
    );
  }

  return (
    <div className="notebook">
      {session?.attemptId && (
        <div className="panel">
          <QuizRunner slot={SLOT} source="mistakes" title="Keputusan ulang kesilapan" headingLevel="h2" onRetry={startReview} retryLabel="Ulang kesilapan yang masih tinggal" />
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'discardQuiz', slot: SLOT })}>
            Tutup keputusan
          </button>
        </div>
      )}

      <div className="notebook__bar">
        <div className="field field--inline">
          <label htmlFor="nb-skill">Kemahiran</label>
          <select id="nb-skill" className="select" value={skill} onChange={(e) => setSkill(e.target.value as 'all' | SkillCategory)}>
            <option value="all">Semua</option>
            {(Object.keys(SKILL_LABELS) as SkillCategory[]).map((s) => (
              <option key={s} value={s}>
                {SKILL_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn--primary" onClick={startReview} disabled={open.length === 0}>
          <History size={16} aria-hidden /> Ulang {Math.min(open.length, 10)} kesilapan
        </button>
      </div>

      {open.length === 0 ? (
        <EmptyState title="Tiada kesilapan yang belum dibetulkan">Jawapan salah daripada kuiz, Grammar Gym, Vocabulary Lab dan ujian percubaan akan direkodkan di sini.</EmptyState>
      ) : (
        <ul className="mistake-list">
          {open.map((m) => {
            const q = resolveQuestion(m.questionId)!;
            return (
              <li key={m.questionId} className="mistake">
                <div className="mistake__head">
                  <Badge tone="warning">{tagLabel(m.tag)}</Badge>
                  <span className="muted small">
                    {SKILL_LABELS[m.skill]} · salah {m.timesWrong}× · terakhir {formatDateTime(m.lastWrongAt)}
                  </span>
                </div>
                {q.context && (
                  <div className="question__context question__context--small">
                    <RichText text={q.context} />
                  </div>
                )}
                <p className="mistake__prompt">
                  <RichText text={q.prompt} />
                </p>
                {'text' in q && (
                  <p className="correction-source" lang="en">
                    {q.text}
                  </p>
                )}
                <p>
                  <span className="review__key">Jawapan anda:</span> <span lang="en">{describeResponse(q, m.lastResponse)}</span>
                </p>
                <p>
                  <span className="review__key">Jawapan yang betul:</span>{' '}
                  <span lang="en" className="pre-line">
                    {describeCorrectAnswer(q).join(' / ')}
                  </span>
                </p>
                <p className="review__explanation">
                  <RichText text={q.explanation} />
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {resolved.length > 0 && (
        <div className="panel">
          <button type="button" className="btn btn--ghost btn--sm" aria-expanded={showResolved} onClick={() => setShowResolved((v) => !v)}>
            {showResolved ? 'Sembunyikan' : 'Tunjukkan'} kesilapan yang telah dibetulkan ({resolved.length})
          </button>
          {showResolved && (
            <ul className="plain-list">
              {resolved.map((m) => {
                const q = resolveQuestion(m.questionId);
                return (
                  <li key={m.questionId}>
                    <Badge tone="success">Dibetulkan</Badge> <RichText text={q?.prompt ?? m.questionId} /> <span className="muted small">· {tagLabel(m.tag)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
