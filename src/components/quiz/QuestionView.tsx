import { useId, useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, CircleDashed, XCircle, MinusCircle } from 'lucide-react';
import type { QuestionResponse } from '../../types/content';
import type { PublicQuestion, QuestionReview } from '../../lib/quiz';
import { RichText } from '../ui/RichText';

interface QuestionViewProps {
  question: PublicQuestion;
  number: number;
  response?: QuestionResponse;
  onChange?: (response: QuestionResponse) => void;
  disabled?: boolean;
  review?: QuestionReview;
  /** When the context is identical to an earlier question's, show a short reference instead of repeating it. */
  contextSameAs?: number;
}

const TYPE_LABELS: Record<PublicQuestion['type'], string> = {
  mcq: 'Pilihan jawapan',
  truefalse: 'Betul atau salah',
  multi: 'Pilih semua yang betul',
  fill: 'Isi tempat kosong',
  correction: 'Pembetulan ayat',
  order: 'Susun mengikut urutan',
  match: 'Padankan',
  phrase: 'Pilih ungkapan paling sesuai',
  peel: 'Kenal pasti komponen PEEL',
};

export function QuestionView({ question, number, response, onChange, disabled, review, contextSameAs }: QuestionViewProps) {
  const locked = disabled || Boolean(review);
  const baseId = useId();
  return (
    <article className={`question ${review ? `question--${review.status}` : ''}`} aria-labelledby={`${baseId}-label`}>
      <div className="question__head">
        <span className="question__number">Soalan {number}</span>
        <span className="question__type">{TYPE_LABELS[question.type]}</span>
      </div>
      {question.context &&
        (contextSameAs ? (
          <p className="question__context-ref">Rujuk teks yang sama seperti dalam Soalan {contextSameAs}.</p>
        ) : (
          <div className="question__context">
            <RichText text={question.context} />
          </div>
        ))}
      <div className="question__body">
        <QuestionInput baseId={baseId} question={question} response={response} onChange={onChange} disabled={locked} review={review} />
      </div>
      {review && <ReviewPanel review={review} />}
    </article>
  );
}

function Prompt({ question, id }: { question: PublicQuestion; id: string }) {
  return (
    <p className="question__prompt" id={id}>
      <RichText text={question.prompt} />
    </p>
  );
}

function QuestionInput({ baseId, question, response, onChange, disabled, review }: Omit<QuestionViewProps, 'number'> & { baseId: string }) {
  const labelId = `${baseId}-label`;
  const name = `${baseId}-choice`;

  switch (question.type) {
    case 'mcq':
    case 'phrase':
    case 'peel':
    case 'truefalse': {
      const value = response?.type === 'choice' ? response.value : '';
      return (
        <fieldset className="choices" disabled={disabled}>
          <legend className="question__prompt" id={labelId}>
            <RichText text={question.prompt} />
          </legend>
          {question.options.map((o) => {
            const selected = value === o.id;
            const isCorrect = review?.correctOptionIds.includes(o.id);
            const cls = review ? (isCorrect ? 'choice--correct' : selected ? 'choice--wrong' : '') : selected ? 'choice--selected' : '';
            return (
              <label key={o.id} className={`choice ${cls}`}>
                <input
                  type="radio"
                  name={name}
                  value={o.id}
                  checked={selected}
                  onChange={() => onChange?.({ type: 'choice', value: o.id })}
                />
                <span className="choice__text">
                  <RichText text={o.text} />
                </span>
                {review && isCorrect && <CheckCircle2 className="choice__mark" size={18} aria-label="Jawapan betul" />}
                {review && selected && !isCorrect && <XCircle className="choice__mark" size={18} aria-label="Pilihan anda" />}
              </label>
            );
          })}
        </fieldset>
      );
    }

    case 'multi': {
      const value = response?.type === 'multi' ? response.value : [];
      return (
        <fieldset className="choices" disabled={disabled}>
          <legend className="question__prompt" id={labelId}>
            <RichText text={question.prompt} />
          </legend>
          {question.options.map((o) => {
            const selected = value.includes(o.id);
            const isCorrect = review?.correctOptionIds.includes(o.id);
            const cls = review
              ? isCorrect
                ? selected
                  ? 'choice--correct'
                  : 'choice--missed'
                : selected
                  ? 'choice--wrong'
                  : ''
              : selected
                ? 'choice--selected'
                : '';
            return (
              <label key={o.id} className={`choice choice--check ${cls}`}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    onChange?.({ type: 'multi', value: selected ? value.filter((v) => v !== o.id) : [...value, o.id] })
                  }
                />
                <span className="choice__text">
                  <RichText text={o.text} />
                </span>
                {review && isCorrect && <CheckCircle2 className="choice__mark" size={18} aria-label={selected ? 'Betul' : 'Patut dipilih'} />}
                {review && selected && !isCorrect && <XCircle className="choice__mark" size={18} aria-label="Tidak patut dipilih" />}
              </label>
            );
          })}
        </fieldset>
      );
    }

    case 'fill':
    case 'correction': {
      const value = response?.type === 'text' ? response.value : '';
      const inputId = `${baseId}-input`;
      return (
        <div className="text-question">
          <Prompt question={question} id={labelId} />
          <p className={question.type === 'fill' ? 'fill-sentence' : 'correction-source'} lang="en">
            {question.type === 'fill'
              ? question.text.split('___').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <span className="fill-blank" aria-label="tempat kosong">_____</span>}
                  </span>
                ))
              : question.text}
          </p>
          <label htmlFor={inputId} className="field-label">
            {question.type === 'fill' ? 'Jawapan anda' : 'Tulis semula ayat yang betul'}
          </label>
          <div className="text-question__row">
            <input
              id={inputId}
              className="input"
              lang="en"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              value={value}
              placeholder={question.placeholder ?? (question.type === 'fill' ? 'Taip perkataan…' : 'Taip ayat penuh…')}
              disabled={disabled}
              onChange={(e) => onChange?.({ type: 'text', value: e.target.value })}
            />
            {question.type === 'correction' && !disabled && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange?.({ type: 'text', value: question.text })}>
                Salin ayat asal
              </button>
            )}
          </div>
        </div>
      );
    }

    case 'order':
      return <OrderInput question={question} response={response} onChange={onChange} disabled={disabled} labelId={labelId} />;

    case 'match': {
      const value = response?.type === 'match' ? response.value : {};
      return (
        <div className="match">
          <Prompt question={question} id={labelId} />
          <ul className="match__list">
            {question.left.map((l) => {
              const selectId = `${baseId}-${l.id}`;
              const pairOk = review?.pairs?.[l.id];
              return (
                <li key={l.id} className={`match__row ${review ? (pairOk ? 'match__row--correct' : 'match__row--wrong') : ''}`}>
                  <label htmlFor={selectId} className="match__left">
                    <RichText text={l.text} />
                  </label>
                  <select
                    id={selectId}
                    className="select"
                    value={value[l.id] ?? ''}
                    disabled={disabled}
                    onChange={(e) => onChange?.({ type: 'match', value: { ...value, [l.id]: e.target.value } })}
                  >
                    <option value="">Pilih padanan…</option>
                    {question.right.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.text}
                      </option>
                    ))}
                  </select>
                  {review && (pairOk ? <CheckCircle2 size={18} className="match__mark" aria-label="Betul" /> : <XCircle size={18} className="match__mark" aria-label="Salah" />)}
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
  }
}

function OrderInput({
  question,
  response,
  onChange,
  disabled,
  labelId,
}: {
  question: Extract<PublicQuestion, { type: 'order' }>;
  response?: QuestionResponse;
  onChange?: (r: QuestionResponse) => void;
  disabled?: boolean;
  labelId: string;
}) {
  const [announcement, setAnnouncement] = useState('');
  const order = response?.type === 'order' && response.value.length === question.items.length ? response.value : question.items.map((i) => i.id);
  const byId = new Map(question.items.map((i) => [i.id, i]));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    const next = order.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange?.({ type: 'order', value: next });
    setAnnouncement(`Item dipindahkan ke kedudukan ${target + 1} daripada ${order.length}.`);
  };

  return (
    <div className="order">
      <p className="question__prompt" id={labelId}>
        <RichText text={question.prompt} />
      </p>
      <p className="hint">Gunakan butang anak panah untuk mengubah susunan.</p>
      <ol className="order__list" aria-labelledby={labelId}>
        {order.map((id, index) => (
          <li key={id} className="order__item">
            <span className="order__pos" aria-hidden>
              {index + 1}
            </span>
            <span className="order__text">
              <RichText text={byId.get(id)?.text ?? id} />
            </span>
            {!disabled && (
              <span className="order__controls">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Naikkan: ${byId.get(id)?.text ?? ''}`}
                >
                  <ArrowUp size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => move(index, 1)}
                  disabled={index === order.length - 1}
                  aria-label={`Turunkan: ${byId.get(id)?.text ?? ''}`}
                >
                  <ArrowDown size={18} aria-hidden />
                </button>
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

const STATUS_INFO = {
  correct: { label: 'Betul', Icon: CheckCircle2 },
  partial: { label: 'Separa betul', Icon: MinusCircle },
  incorrect: { label: 'Salah', Icon: XCircle },
  unanswered: { label: 'Tidak dijawab', Icon: CircleDashed },
} as const;

function ReviewPanel({ review }: { review: QuestionReview }) {
  const { label, Icon } = STATUS_INFO[review.status];
  const showAnswer = review.status !== 'correct';
  return (
    <div className={`review review--${review.status}`} role="status">
      <p className="review__status">
        <Icon size={18} aria-hidden /> {label}
        {review.marks > 1 && (
          <span className="review__marks">
            {' '}
            ({review.earned}/{review.marks} markah)
          </span>
        )}
      </p>
      {review.typed && (
        <p className="review__line">
          <span className="review__key">Jawapan anda:</span> <span lang="en">{review.yourAnswer}</span>
        </p>
      )}
      {showAnswer && (
        <div className="review__line">
          <span className="review__key">{review.correctAnswers.length > 1 && review.typed ? 'Jawapan yang diterima:' : 'Jawapan yang betul:'}</span>
          <ul className="review__answers" lang="en">
            {review.correctAnswers.map((a) => (
              <li key={a}>
                <RichText text={a} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="review__explanation">
        <RichText text={review.explanation} />
      </p>
      {review.typed && review.status === 'incorrect' && (
        <p className="review__note">
          Jawapan taip disemak dengan senarai jawapan yang diterima. Jika jawapan anda berbeza tetapi anda yakin ia betul, bandingkan dengan jawapan di atas — kadangkala ada lebih daripada satu cara yang betul.
        </p>
      )}
    </div>
  );
}
