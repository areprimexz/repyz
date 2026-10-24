import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { ShortWritingActivity, ShortWritingItem } from '../../types/content';
import { useAppState, useDispatch } from '../../state/StoreContext';
import { useAutosave } from '../../hooks/useAutosave';
import { countWords } from '../../lib/writing';
import { nowIso } from '../../lib/format';

export function ShortWriting({ activity }: { activity: ShortWritingActivity }) {
  const state = useAppState();
  const responses = state.shortResponses[activity.id] ?? {};
  const done = activity.items.filter((i) => responses[i.id]?.submittedAt).length;
  return (
    <section className="short-writing" aria-label={activity.title}>
      <div className="quiz__header">
        <div>
          <h3 className="quiz__title">{activity.title}</h3>
          {activity.intro && <p className="quiz__intro">{activity.intro}</p>}
        </div>
        <p className="quiz__progress">
          {done}/{activity.items.length} dihantar
        </p>
      </div>
      <ol className="short-writing__list">
        {activity.items.map((item, i) => (
          <li key={item.id}>
            <ShortWritingItemView activityId={activity.id} item={item} number={i + 1} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function ShortWritingItemView({ activityId, item, number }: { activityId: string; item: ShortWritingItem; number: number }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const saved = state.shortResponses[activityId]?.[item.id];
  const [text, setText] = useState(saved?.text ?? '');
  const submitted = Boolean(saved?.submittedAt);
  const inputId = `${activityId}-${item.id}`;
  const { schedule, flush } = useAutosave<string>((value) =>
    dispatch({ type: 'saveShortResponse', activityId, itemId: item.id, text: value, at: nowIso() }),
  );

  const submit = () => {
    flush();
    dispatch({ type: 'saveShortResponse', activityId, itemId: item.id, text, at: nowIso() });
    dispatch({ type: 'submitShortResponse', activityId, itemId: item.id, at: nowIso() });
  };

  const ticks = saved?.ticks ?? [];
  const toggleTick = (index: number) =>
    dispatch({
      type: 'tickShortChecklist',
      activityId,
      itemId: item.id,
      ticks: ticks.includes(index) ? ticks.filter((t) => t !== index) : [...ticks, index],
    });

  return (
    <article className="sw-item">
      <p className="question__number">Tugasan {number}</p>
      <p className="sw-item__instruction">{item.instruction}</p>
      {item.starter && (
        <p className="correction-source" lang="en">
          {item.starter}
        </p>
      )}
      <label htmlFor={inputId} className="field-label">
        Jawapan anda
      </label>
      <textarea
        id={inputId}
        className="textarea"
        lang="en"
        spellCheck
        rows={item.rows ?? 3}
        value={text}
        placeholder={item.placeholder ?? 'Tulis dalam bahasa Inggeris…'}
        readOnly={submitted}
        aria-readonly={submitted}
        onChange={(e) => {
          setText(e.target.value);
          schedule(e.target.value);
        }}
        onBlur={flush}
      />
      {!submitted ? (
        <div className="sw-item__actions">
          <span className="hint">{countWords(text)} patah perkataan · disimpan automatik</span>
          <button type="button" className="btn btn--primary btn--sm" disabled={countWords(text) === 0} onClick={submit}>
            Hantar dan lihat contoh
          </button>
        </div>
      ) : (
        <div className="sw-item__model">
          <p className="sw-item__submitted">
            <CheckCircle2 size={16} aria-hidden /> Dihantar. Bandingkan jawapan anda dengan contoh di bawah.
          </p>
          <div className="model-box">
            <p className="model-box__label">Contoh jawapan (bukan satu-satunya jawapan yang betul)</p>
            <p lang="en" className="model-box__text">
              {item.model}
            </p>
          </div>
          <fieldset className="checklist">
            <legend>Semak jawapan anda sendiri</legend>
            {item.checklist.map((c, i) => (
              <label key={i} className="checklist__item">
                <input type="checkbox" checked={ticks.includes(i)} onChange={() => toggleTick(i)} />
                <span>{c}</span>
              </label>
            ))}
          </fieldset>
        </div>
      )}
    </article>
  );
}
