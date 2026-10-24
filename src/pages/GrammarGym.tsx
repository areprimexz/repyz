import { Link } from 'react-router-dom';
import { Dumbbell, History, Shuffle } from 'lucide-react';
import { GRAMMAR_TOPICS, allGrammarQuestions, grammarQuestionsForTopic, resolveQuestion } from '../content';
import { newSeed, seededShuffle } from '../lib/random';
import { useAppState, useDispatch } from '../state/StoreContext';
import { PageHeader } from '../components/ui/PageHeader';
import { QuizRunner, makeSession } from '../components/quiz/QuizRunner';
import { ProgressBar } from '../components/ui/ProgressBar';

const SLOT = 'gym';
const SET_SIZE = 8;

export function GrammarGym() {
  const state = useAppState();
  const dispatch = useDispatch();
  const session = state.quizSessions[SLOT];

  const unresolvedGrammar = Object.values(state.mistakes).filter((m) => !m.resolved && m.skill === 'grammar' && resolveQuestion(m.questionId));

  const startSet = (title: string, ids: string[]) => {
    const seed = newSeed();
    dispatch({
      type: 'startQuiz',
      force: true,
      session: { ...makeSession({ slot: SLOT, source: 'gym', title, questionIds: seededShuffle(ids, seed).slice(0, SET_SIZE + 2), feedback: 'end' }), seed },
    });
    window.scrollTo(0, 0);
  };

  const startTopic = (topicId: string) => {
    const topic = GRAMMAR_TOPICS.find((t) => t.id === topicId);
    startSet(`Grammar Gym: ${topic?.titleEn ?? topicId}`, grammarQuestionsForTopic(topicId).map((q) => q.id).slice(0, 50));
  };
  const startMixed = () => startSet('Grammar Gym: campuran', allGrammarQuestions().map((q) => q.id));
  const startMistakes = () => startSet('Grammar Gym: ulang kesilapan', unresolvedGrammar.map((m) => m.questionId));

  // Per-topic accuracy derived from recorded attempts.
  const topicStats = (topicId: string) => {
    let earned = 0;
    let marks = 0;
    for (const a of state.attempts) {
      for (const r of a.results) {
        if (r.skill === 'grammar' && r.tag === topicId && r.status !== 'unanswered') {
          earned += r.earned;
          marks += r.marks;
        }
      }
    }
    return { earned, marks };
  };

  if (session) {
    return (
      <div>
        <PageHeader eyebrow="Grammar Gym" title={session.attemptId ? 'Keputusan latihan' : 'Latihan tatabahasa'} />
        <QuizRunner
          slot={SLOT}
          source="gym"
          title={session.title}
          headingLevel="h2"
          retryLabel="Ulang set yang sama"
        />
        <div className="gym-actions">
          {session.attemptId ? (
            <button type="button" className="btn btn--secondary" onClick={() => dispatch({ type: 'discardQuiz', slot: SLOT })}>
              Pilih latihan lain
            </button>
          ) : (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: 'discardQuiz', slot: SLOT })}>
              Tinggalkan latihan ini (jawapan tidak disimpan)
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Grammar Gym"
        title="Gim tatabahasa"
        description="Latihan pilihan jawapan, isi tempat kosong dan pembetulan ayat. Setiap jawapan disertakan penjelasan dalam BM, dan kesilapan direkodkan dalam Buku Kesilapan."
      />

      <div className="gym-quick">
        <button type="button" className="btn btn--primary" onClick={startMixed}>
          <Shuffle size={16} aria-hidden /> Latihan campuran ({SET_SIZE + 2} soalan)
        </button>
        <button type="button" className="btn btn--secondary" onClick={startMistakes} disabled={unresolvedGrammar.length === 0}>
          <History size={16} aria-hidden /> Ulang kesilapan ({unresolvedGrammar.length})
        </button>
      </div>
      {unresolvedGrammar.length === 0 && <p className="hint">Tiada kesilapan tatabahasa yang belum dibetulkan. Kesilapan baharu akan muncul di sini.</p>}

      <ul className="topic-grid">
        {GRAMMAR_TOPICS.map((t) => {
          const stats = topicStats(t.id);
          const count = grammarQuestionsForTopic(t.id).length;
          const pending = unresolvedGrammar.filter((m) => m.tag === t.id).length;
          return (
            <li key={t.id} className="topic-card">
              <p className="topic-card__en" lang="en">
                {t.titleEn}
              </p>
              <h2 className="topic-card__title">{t.title}</h2>
              <p className="topic-card__desc">{t.description}</p>
              <p className="muted small">
                {count} soalan · <Link to={`/lesson/${t.lessonId}`}>Nota pelajaran</Link>
                {pending > 0 ? ` · ${pending} kesilapan belum dibetulkan` : ''}
              </p>
              {stats.marks > 0 ? (
                <ProgressBar value={stats.earned} max={stats.marks} label={`Ketepatan ${t.titleEn}`} showValue size="sm" tone={stats.earned / stats.marks >= 0.7 ? 'success' : 'warning'} />
              ) : (
                <p className="muted small">Belum dicuba</p>
              )}
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => startTopic(t.id)}>
                <Dumbbell size={16} aria-hidden /> Latih topik ini
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
