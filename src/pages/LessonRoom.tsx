import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock3, Lock, PartyPopper } from 'lucide-react';
import { adjacentLessons, getDay, getLesson } from '../content';
import { isBootcampComplete, isDayComplete, isLessonComplete, isLessonLocked, lessonSteps } from '../lib/progress';
import { formatDateTime, nowIso } from '../lib/format';
import { useAppState, useDispatch } from '../state/StoreContext';
import { BlockRenderer } from '../components/lesson/BlockRenderer';
import { ActivityBlock } from '../components/lesson/ActivityBlock';
import { StatusBadge } from '../components/ui/Badge';
import { Callout } from '../components/ui/Callout';
import { EmptyState } from '../components/ui/PageHeader';

export function LessonRoom() {
  const { lessonId = '' } = useParams();
  const lesson = getLesson(lessonId);
  const state = useAppState();
  const dispatch = useDispatch();
  const locked = lesson ? isLessonLocked(state, lesson) : false;

  useEffect(() => {
    if (lesson && !locked) dispatch({ type: 'openLesson', lessonId: lesson.id, at: nowIso() });
  }, [lesson, locked, dispatch]);

  if (!lesson) {
    return (
      <EmptyState title="Pelajaran tidak dijumpai" action={<Link className="btn btn--primary" to="/curriculum">Kembali ke kurikulum</Link>}>
        Pautan ini mungkin salah atau lapuk.
      </EmptyState>
    );
  }

  const day = getDay(lesson.day);
  const { prev, next } = adjacentLessons(lesson.id);
  const nextLocked = next ? isLessonLocked(state, next) : false;

  if (locked) {
    return (
      <div className="lesson">
        <Breadcrumb day={lesson.day} number={lesson.number} />
        <h1>
          {lesson.number} {lesson.title}
        </h1>
        <Callout tone="info" title="Pelajaran ini belum dibuka">
          <p>
            <Lock size={14} aria-hidden /> Lengkapkan Hari {lesson.day - 1} dahulu. {getDay(lesson.day - 1)?.completionNote}
          </p>
          <p>
            <Link to="/curriculum">Lihat kurikulum</Link> · Latihan tambahan sentiasa dibuka dalam <Link to="/grammar">Grammar Gym</Link> dan{' '}
            <Link to="/vocabulary">Vocabulary Lab</Link>.
          </p>
        </Callout>
      </div>
    );
  }

  const complete = isLessonComplete(state, lesson.id);
  const steps = lessonSteps(state, lesson);
  const progress = state.lessons[lesson.id];
  const guided = lesson.activities.filter((a) => a.role === 'guided');
  const practice = lesson.activities.filter((a) => a.role === 'practice');
  const dayDone = isDayComplete(state, lesson.day);
  const allDone = isBootcampComplete(state);

  const missing: string[] = [];
  if (!steps.read) missing.push('tandakan bahawa anda telah membaca nota');
  if (steps.guided.done < steps.guided.total) missing.push(`lengkapkan latihan berpandu (${steps.guided.done}/${steps.guided.total})`);
  if (steps.practice.done < steps.practice.total) missing.push(`lengkapkan latihan kendiri (${steps.practice.done}/${steps.practice.total})`);

  return (
    <article className="lesson">
      <Breadcrumb day={lesson.day} number={lesson.number} />
      <header className="lesson__header">
        <p className="eyebrow">
          Hari {lesson.day} · {day?.title} · Pelajaran {lesson.number}
        </p>
        <h1>{lesson.title}</h1>
        <p className="lesson__objective">{lesson.objective}</p>
        <p className="lesson__meta">
          <span>
            <Clock3 size={16} aria-hidden /> ±{lesson.durationMin} minit
          </span>
          <StatusBadge state={complete ? 'complete' : 'in-progress'} />
        </p>
      </header>

      <section className="lesson-section lesson-section--objectives" aria-labelledby="obj-heading">
        <h2 id="obj-heading">Objektif pembelajaran</h2>
        <ul className="objectives">
          {lesson.objectives.map((o) => (
            <li key={o}>
              <CheckCircle2 size={16} aria-hidden /> {o}
            </li>
          ))}
        </ul>
      </section>

      {lesson.parts.map((part) => (
        <section key={part.id} className="lesson-section" aria-labelledby={`part-${part.id}`}>
          <h2 id={`part-${part.id}`}>{part.title}</h2>
          {part.blocks.map((block, i) => (
            <BlockRenderer key={i} block={block} />
          ))}
          {part.check && (
            <div className="lesson-check">
              <ActivityBlock lesson={lesson} activity={part.check} />
            </div>
          )}
        </section>
      ))}

      {guided.length > 0 && (
        <section className="lesson-section lesson-section--activity" aria-labelledby="guided-heading">
          <h2 id="guided-heading">Latihan berpandu</h2>
          <p className="muted">Maklum balas dan penjelasan jawapan dipaparkan selepas setiap semakan.</p>
          {guided.map((a) => (
            <ActivityBlock key={a.id} lesson={lesson} activity={a} />
          ))}
        </section>
      )}

      {practice.length > 0 && (
        <section className="lesson-section lesson-section--activity" aria-labelledby="practice-heading">
          <h2 id="practice-heading">Latihan kendiri</h2>
          <p className="muted">Cuba sendiri dahulu. Penjelasan jawapan atau contoh dipaparkan selepas anda menghantar.</p>
          {practice.map((a) => (
            <ActivityBlock key={a.id} lesson={lesson} activity={a} />
          ))}
        </section>
      )}

      <section className="lesson-section" aria-labelledby="summary-heading">
        <h2 id="summary-heading">Ringkasan</h2>
        <ul className="prose-list">
          {lesson.summary.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section className={`completion ${complete ? 'completion--done' : ''}`} aria-labelledby="completion-heading">
        <h2 id="completion-heading">Status pelajaran</h2>
        <ul className="completion__steps">
          <li>
            <label className="checklist__item">
              <input
                type="checkbox"
                checked={steps.read}
                disabled={complete}
                onChange={(e) => dispatch({ type: 'setReadAck', lessonId: lesson.id, value: e.target.checked })}
              />
              <span>Saya telah membaca penerangan dan contoh</span>
            </label>
          </li>
          <li className={steps.guided.done === steps.guided.total ? 'is-done' : ''}>
            {steps.guided.done === steps.guided.total ? <CheckCircle2 size={18} className="ok" aria-hidden /> : <Circle size={18} aria-hidden />}
            Latihan berpandu: {steps.guided.done}/{steps.guided.total}
          </li>
          <li className={steps.practice.done === steps.practice.total ? 'is-done' : ''}>
            {steps.practice.done === steps.practice.total ? <CheckCircle2 size={18} className="ok" aria-hidden /> : <Circle size={18} aria-hidden />}
            Latihan kendiri: {steps.practice.done}/{steps.practice.total}
          </li>
        </ul>
        {complete ? (
          <p className="completion__done" role="status">
            <CheckCircle2 size={18} aria-hidden /> Pelajaran selesai pada {formatDateTime(progress?.completedAt ?? '')}. Anda boleh kembali untuk ulang kaji bila-bila masa.
          </p>
        ) : (
          <>
            <button
              type="button"
              className="btn btn--primary"
              disabled={!steps.ready}
              onClick={() => dispatch({ type: 'completeLesson', lessonId: lesson.id, at: nowIso() })}
            >
              <CheckCircle2 size={18} aria-hidden /> Tandakan pelajaran selesai
            </button>
            {!steps.ready && <p className="hint">Untuk selesai: {missing.join('; ')}.</p>}
          </>
        )}
        {complete && dayDone && lesson.day < 3 && (!next || next.day !== lesson.day) && (
          <Callout tone="success" title={`Hari ${lesson.day} selesai!`}>
            Hari {lesson.day + 1} kini dibuka.
          </Callout>
        )}
        {complete && allDone && lesson.id === 'd3-l6' && (
          <Callout tone="success" title="Kem 3 hari selesai">
            <PartyPopper size={16} aria-hidden /> Anda telah melengkapkan semua pelajaran dan ujian percubaan. Teruskan berlatih dalam Writing Studio, Grammar Gym dan Vocabulary Lab — kemajuan anda kekal disimpan.
          </Callout>
        )}
      </section>

      <nav className="lesson-nav" aria-label="Navigasi pelajaran">
        {prev ? (
          <Link className="btn btn--ghost" to={`/lesson/${prev.id}`}>
            <ArrowLeft size={18} aria-hidden /> <span className="lesson-nav__label">Sebelumnya: {prev.number} {prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next &&
          (nextLocked ? (
            <span className="btn btn--ghost is-disabled" aria-disabled="true">
              <Lock size={16} aria-hidden /> <span className="lesson-nav__label">Seterusnya: {next.number} (terkunci)</span>
            </span>
          ) : (
            <Link className="btn btn--secondary" to={`/lesson/${next.id}`}>
              <span className="lesson-nav__label">Seterusnya: {next.number} {next.title}</span> <ArrowRight size={18} aria-hidden />
            </Link>
          ))}
      </nav>
    </article>
  );
}

function Breadcrumb({ day, number }: { day: number; number: string }) {
  return (
    <nav className="breadcrumb" aria-label="Laluan">
      <Link to="/curriculum">Kurikulum</Link>
      <span aria-hidden>›</span>
      <Link to={`/curriculum#day-${day}`}>Hari {day}</Link>
      <span aria-hidden>›</span>
      <span aria-current="page">{number}</span>
    </nav>
  );
}
