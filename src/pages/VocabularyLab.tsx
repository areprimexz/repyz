import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, ThumbsUp, Repeat } from 'lucide-react';
import type { DayNumber, VocabEntry, VocabLevel } from '../types/content';
import { VOCABULARY, vocabQuestionId, type VocabQuestionType } from '../content';
import { POS_LABELS, VOCAB_LEVEL_LABELS, VOCAB_TOPIC_LABELS } from '../content/vocabulary';
import { VOCAB_STATUS_LABELS, isDue, selectRevisionWords, vocabStatus, type VocabStatus } from '../lib/vocab';
import { createRng, newSeed, seededShuffle } from '../lib/random';
import { nowIso } from '../lib/format';
import { useAppState, useDispatch } from '../state/StoreContext';
import { PageHeader, EmptyState } from '../components/ui/PageHeader';
import { Badge, type BadgeTone } from '../components/ui/Badge';
import { Callout } from '../components/ui/Callout';
import { QuizRunner, makeSession } from '../components/quiz/QuizRunner';
import { TabPanel, Tabs } from '../components/ui/Tabs';

type Tab = 'cards' | 'list' | 'quiz';
const STATUS_TONE: Record<VocabStatus, BadgeTone> = { new: 'neutral', learning: 'primary', practice: 'warning', mastered: 'success' };
const QUIZ_SLOT = 'vocab';
const QUIZ_LENGTH = 10;

interface Filters {
  day: 'all' | DayNumber;
  level: 'all' | VocabLevel;
  status: 'all' | VocabStatus;
}

export function VocabularyLab() {
  const state = useAppState();
  const [tab, setTab] = useState<Tab>(() => (state.quizSessions[QUIZ_SLOT] && !state.quizSessions[QUIZ_SLOT].attemptId ? 'quiz' : 'cards'));
  const [filters, setFilters] = useState<Filters>({ day: 'all', level: 'all', status: 'all' });

  const filtered = VOCABULARY.filter(
    (v) =>
      (filters.day === 'all' || v.day === filters.day) &&
      (filters.level === 'all' || v.level === filters.level) &&
      (filters.status === 'all' || vocabStatus(state.vocab[v.id]) === filters.status),
  );

  const counts = VOCABULARY.reduce(
    (acc, v) => {
      acc[vocabStatus(state.vocab[v.id])]++;
      return acc;
    },
    { new: 0, learning: 0, practice: 0, mastered: 0 } as Record<VocabStatus, number>,
  );
  const now = nowIso();
  const due = VOCABULARY.filter((v) => isDue(state.vocab[v.id], now)).length;

  return (
    <div>
      <PageHeader
        eyebrow="Vocabulary Lab"
        title="Makmal kosa kata"
        description={`${VOCABULARY.length} perkataan dan ungkapan dari Hari 1–3. Penguasaan dikira daripada jawapan kuiz sebenar — membuka kad imbas sahaja tidak dikira.`}
      />

      <ul className="stat-row stat-row--compact" aria-label="Status kosa kata">
        <li className="stat">
          <span className="stat__label">Dikuasai</span>
          <span className="stat__value">{counts.mastered}</span>
        </li>
        <li className="stat">
          <span className="stat__label">Sedang dipelajari</span>
          <span className="stat__value">{counts.learning}</span>
        </li>
        <li className="stat">
          <span className="stat__label">Perlu latihan</span>
          <span className="stat__value">{counts.practice}</span>
        </li>
        <li className="stat">
          <span className="stat__label">Untuk diulang kaji sekarang</span>
          <span className="stat__value">{due}</span>
        </li>
      </ul>

      <Tabs
        label="Mod Vocabulary Lab"
        idPrefix="vocab"
        value={tab}
        onChange={setTab}
        tabs={[
          ['cards', 'Kad imbas'],
          ['list', 'Senarai kata'],
          ['quiz', 'Kuiz'],
        ]}
      />

      {tab !== 'quiz' && <FilterBar filters={filters} onChange={setFilters} />}

      <TabPanel idPrefix="vocab" value={tab}>
        {tab === 'cards' && <Flashcards entries={filtered} />}
        {tab === 'list' && <WordList entries={filtered} />}
        {tab === 'quiz' && <VocabQuiz />}
      </TabPanel>
    </div>
  );
}

function FilterBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  return (
    <div className="filters">
      <div className="field field--inline">
        <label htmlFor="f-day">Hari</label>
        <select id="f-day" className="select" value={filters.day} onChange={(e) => onChange({ ...filters, day: e.target.value === 'all' ? 'all' : (Number(e.target.value) as DayNumber) })}>
          <option value="all">Semua</option>
          <option value="1">Hari 1</option>
          <option value="2">Hari 2</option>
          <option value="3">Hari 3</option>
        </select>
      </div>
      <div className="field field--inline">
        <label htmlFor="f-level">Tahap</label>
        <select id="f-level" className="select" value={filters.level} onChange={(e) => onChange({ ...filters, level: e.target.value as Filters['level'] })}>
          <option value="all">Semua</option>
          {(Object.keys(VOCAB_LEVEL_LABELS) as VocabLevel[]).map((l) => (
            <option key={l} value={l}>
              {VOCAB_LEVEL_LABELS[l]}
            </option>
          ))}
        </select>
      </div>
      <div className="field field--inline">
        <label htmlFor="f-status">Status</label>
        <select id="f-status" className="select" value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value as Filters['status'] })}>
          <option value="all">Semua</option>
          {(Object.keys(VOCAB_STATUS_LABELS) as VocabStatus[]).map((s) => (
            <option key={s} value={s}>
              {VOCAB_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Flashcards({ entries }: { entries: VocabEntry[] }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (entries.length === 0) return <EmptyState title="Tiada perkataan sepadan dengan penapis">Tukar penapis untuk melihat perkataan lain.</EmptyState>;

  const i = Math.min(index, entries.length - 1);
  const entry = entries[i];
  const vs = state.vocab[entry.id];
  const status = vocabStatus(vs);
  const go = (delta: number) => {
    setIndex((i + delta + entries.length) % entries.length);
    setFlipped(false);
  };
  const mark = (m: 'known' | 'practice') => dispatch({ type: 'vocabSelfMark', wordId: entry.id, mark: vs?.selfMark === m ? null : m });

  return (
    <div className="flashcards">
      <p className="flashcards__count" aria-live="polite">
        Kad {i + 1} daripada {entries.length}
      </p>
      <div className={`flashcard ${flipped ? 'is-flipped' : ''}`}>
        <div className="flashcard__badges">
          <Badge tone={STATUS_TONE[status]}>{VOCAB_STATUS_LABELS[status]}</Badge>
          <Badge tone="navy">{VOCAB_LEVEL_LABELS[entry.level]}</Badge>
          <Badge>Hari {entry.day}</Badge>
          {vs?.selfMark === 'known' && <Badge tone="success">Ditanda "Saya tahu" (belum disahkan kuiz)</Badge>}
        </div>
        <p className="flashcard__word" lang="en">
          {entry.word}
        </p>
        <p className="flashcard__pos">
          {POS_LABELS[entry.pos]} · {VOCAB_TOPIC_LABELS[entry.topic]}
        </p>
        {flipped ? (
          <div className="flashcard__back">
            <p className="flashcard__meaning">{entry.meaningMs}</p>
            <p className="flashcard__example" lang="en">
              “{entry.example}”
            </p>
            {entry.synonyms && (
              <p className="flashcard__syn">
                Sinonim: <span lang="en">{entry.synonyms.join(', ')}</span>
              </p>
            )}
            {entry.note && <p className="flashcard__note">{entry.note}</p>}
          </div>
        ) : (
          <p className="flashcard__prompt">Cuba ingat maksudnya, kemudian tekan "Tunjuk maksud".</p>
        )}
        <button type="button" className="btn btn--secondary" onClick={() => setFlipped((f) => !f)} aria-expanded={flipped}>
          <RotateCcw size={16} aria-hidden /> {flipped ? 'Sembunyi maksud' : 'Tunjuk maksud'}
        </button>
      </div>
      <div className="flashcards__marks">
        <button type="button" className={`btn btn--sm ${vs?.selfMark === 'known' ? 'btn--success' : 'btn--ghost'}`} aria-pressed={vs?.selfMark === 'known'} onClick={() => mark('known')}>
          <ThumbsUp size={16} aria-hidden /> Saya tahu
        </button>
        <button type="button" className={`btn btn--sm ${vs?.selfMark === 'practice' ? 'btn--warning' : 'btn--ghost'}`} aria-pressed={vs?.selfMark === 'practice'} onClick={() => mark('practice')}>
          <Repeat size={16} aria-hidden /> Perlu latihan
        </button>
      </div>
      <div className="flashcards__nav">
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => go(-1)}>
          <ChevronLeft size={18} aria-hidden /> Sebelumnya
        </button>
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => go(1)}>
          Seterusnya <ChevronRight size={18} aria-hidden />
        </button>
      </div>
      <p className="hint center">"Saya tahu" ialah catatan peribadi. Perkataan hanya "Dikuasai" selepas dijawab betul dalam beberapa sesi kuiz.</p>
    </div>
  );
}

function WordList({ entries }: { entries: VocabEntry[] }) {
  const state = useAppState();
  if (entries.length === 0) return <EmptyState title="Tiada perkataan sepadan dengan penapis" />;
  return (
    <ul className="word-list">
      {entries.map((v) => {
        const vs = state.vocab[v.id];
        const status = vocabStatus(vs);
        return (
          <li key={v.id} className="word-item">
            <div className="word-item__head">
              <span className="word-item__word" lang="en">
                {v.word}
              </span>
              <span className="muted small">{POS_LABELS[v.pos]}</span>
              <Badge tone={STATUS_TONE[status]}>{VOCAB_STATUS_LABELS[status]}</Badge>
            </div>
            <p className="word-item__meaning">{v.meaningMs}</p>
            <p className="word-item__example" lang="en">
              {v.example}
            </p>
            {v.note && <p className="word-item__note">{v.note}</p>}
            {vs && vs.correct + vs.incorrect > 0 && (
              <p className="muted small">
                Kuiz: {vs.correct} betul, {vs.incorrect} salah
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

type QuizMode = 'smart' | 'filter' | 'missed';

function VocabQuiz() {
  const state = useAppState();
  const dispatch = useDispatch();
  const [mode, setMode] = useState<QuizMode>('smart');
  const [day, setDay] = useState<'all' | DayNumber>('all');
  const [level, setLevel] = useState<'all' | VocabLevel>('all');
  const session = state.quizSessions[QUIZ_SLOT];

  const pool = useMemo(() => {
    const now = nowIso();
    if (mode === 'smart') return selectRevisionWords(VOCABULARY, state.vocab, now, QUIZ_LENGTH);
    if (mode === 'missed') return VOCABULARY.filter((v) => (state.vocab[v.id]?.incorrect ?? 0) > 0 && vocabStatus(state.vocab[v.id]) === 'practice');
    return VOCABULARY.filter((v) => (day === 'all' || v.day === day) && (level === 'all' || v.level === level));
  }, [mode, day, level, state.vocab]);

  const start = () => {
    const seed = newSeed();
    const rng = createRng(seed);
    const types: VocabQuestionType[] = ['meaning', 'word', 'cloze'];
    const words = seededShuffle(pool, seed).slice(0, QUIZ_LENGTH);
    const ids = words.map((w) => vocabQuestionId(types[Math.floor(rng() * types.length)], w.id));
    const title = mode === 'smart' ? 'Ulang kaji pintar' : mode === 'missed' ? 'Perkataan yang pernah salah' : 'Kuiz kosa kata';
    dispatch({ type: 'startQuiz', force: true, session: { ...makeSession({ slot: QUIZ_SLOT, source: 'vocab', title, questionIds: ids, feedback: 'end' }), seed } });
  };

  if (session && !session.attemptId) {
    return (
      <div>
        <QuizRunner slot={QUIZ_SLOT} source="vocab" title={session.title} headingLevel="h2" />
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => dispatch({ type: 'discardQuiz', slot: QUIZ_SLOT })}
        >
          Tinggalkan kuiz ini
        </button>
      </div>
    );
  }

  return (
    <div className="vocab-quiz">
      {session?.attemptId && (
        <QuizRunner slot={QUIZ_SLOT} source="vocab" title={`Keputusan: ${session.title}`} headingLevel="h2" onRetry={start} retryLabel="Kuiz baharu" />
      )}
      {(
        <div className="panel">
          <h2 className="panel__title">{session?.attemptId ? 'Mulakan kuiz baharu' : 'Mulakan kuiz'}</h2>
          <fieldset className="choices">
            <legend className="field-label">Mod kuiz</legend>
            <label className="choice">
              <input type="radio" name="vq-mode" checked={mode === 'smart'} onChange={() => setMode('smart')} />
              <span className="choice__text">
                <strong>Ulang kaji pintar (disyorkan)</strong> — perkataan yang perlu latihan dan yang sudah tiba masa ulang kaji didahulukan.
              </span>
            </label>
            <label className="choice">
              <input type="radio" name="vq-mode" checked={mode === 'missed'} onChange={() => setMode('missed')} />
              <span className="choice__text">
                <strong>Perkataan yang pernah salah</strong> — uji semula perkataan sukar.
              </span>
            </label>
            <label className="choice">
              <input type="radio" name="vq-mode" checked={mode === 'filter'} onChange={() => setMode('filter')} />
              <span className="choice__text">
                <strong>Ikut penapis</strong> — pilih hari dan tahap.
              </span>
            </label>
          </fieldset>
          {mode === 'filter' && (
            <div className="filters">
              <div className="field field--inline">
                <label htmlFor="vq-day">Hari</label>
                <select id="vq-day" className="select" value={day} onChange={(e) => setDay(e.target.value === 'all' ? 'all' : (Number(e.target.value) as DayNumber))}>
                  <option value="all">Semua</option>
                  <option value="1">Hari 1</option>
                  <option value="2">Hari 2</option>
                  <option value="3">Hari 3</option>
                </select>
              </div>
              <div className="field field--inline">
                <label htmlFor="vq-level">Tahap</label>
                <select id="vq-level" className="select" value={level} onChange={(e) => setLevel(e.target.value as 'all' | VocabLevel)}>
                  <option value="all">Semua</option>
                  {(Object.keys(VOCAB_LEVEL_LABELS) as VocabLevel[]).map((l) => (
                    <option key={l} value={l}>
                      {VOCAB_LEVEL_LABELS[l]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {pool.length === 0 ? (
            <Callout tone="info">{mode === 'missed' ? 'Tiada perkataan yang sedang ditanda salah. Bagus!' : 'Tiada perkataan sepadan dengan pilihan ini.'}</Callout>
          ) : (
            <button type="button" className="btn btn--primary" onClick={start}>
              Mula kuiz ({Math.min(pool.length, QUIZ_LENGTH)} soalan)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
