import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock3, Save, Send, Trash2, Users, Target } from 'lucide-react';
import { getPrompt } from '../content';
import { SELF_REVIEW, rubricTotal, rubricMax } from '../content/rubric';
import { DIFFICULTY_LABELS } from '../lib/exam';
import { countWords } from '../lib/writing';
import { formatDateTime, nowIso } from '../lib/format';
import { uid } from '../lib/random';
import { useAutosave } from '../hooks/useAutosave';
import { useAppState, useDispatch, useGetState } from '../state/StoreContext';
import { WritingEditor } from '../components/writing/WritingEditor';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Badge } from '../components/ui/Badge';
import { Callout } from '../components/ui/Callout';
import { EmptyState } from '../components/ui/PageHeader';
import { RichText } from '../components/ui/RichText';

const REGISTER_LABELS = { formal: 'Formal', informal: 'Tidak formal', 'semi-formal': 'Separa formal' };

export function WritingTask() {
  const { promptId = '' } = useParams();
  const prompt = getPrompt(promptId);
  if (!prompt) {
    return (
      <EmptyState title="Tugasan tidak dijumpai" action={<Link className="btn btn--primary" to="/writing">Kembali ke Writing Studio</Link>}>
        Pautan ini mungkin salah.
      </EmptyState>
    );
  }
  return <WritingTaskInner key={prompt.id} promptId={prompt.id} />;
}

function WritingTaskInner({ promptId }: { promptId: string }) {
  const prompt = getPrompt(promptId)!;
  const state = useAppState();
  const getState = useGetState();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const draft = state.drafts[promptId];

  const [text, setText] = useState(draft?.text ?? '');
  const [plan, setPlan] = useState<Record<string, string>>(draft?.plan ?? {});
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Decided once on mount; deriving it from live state would collapse the plan while typing.
  const [planInitiallyOpen] = useState(!draft?.text);
  const checklist = draft?.checklist ?? [];

  const saveText = useCallback((value: string) => dispatch({ type: 'saveDraft', promptId, text: value, at: nowIso() }), [dispatch, promptId]);
  const savePlan = useCallback((value: Record<string, string>) => dispatch({ type: 'saveDraft', promptId, plan: value, at: nowIso() }), [dispatch, promptId]);
  const textSave = useAutosave(saveText);
  const planSave = useAutosave(savePlan);

  const history = state.submissions.filter((s) => s.promptId === promptId && s.context === 'studio');
  const lastSubmitted = draft?.lastSubmittedId ? history.find((s) => s.id === draft.lastSubmittedId) : undefined;
  const reviewItems = SELF_REVIEW[prompt.type];
  const words = countWords(text);
  const untickedPoints = prompt.requiredPoints.filter((p) => !checklist.includes(`point:${p.id}`));
  const untickedReview = reviewItems.filter((_, i) => !checklist.includes(`review:${i}`));
  const changedSinceSubmit = lastSubmitted ? lastSubmitted.text !== text : true;

  const toggle = (key: string) => {
    const next = checklist.includes(key) ? checklist.filter((k) => k !== key) : [...checklist, key];
    dispatch({ type: 'saveDraft', promptId, checklist: next, at: nowIso() });
  };

  const saveNow = () => {
    textSave.flush();
    planSave.flush();
    dispatch({ type: 'saveDraft', promptId, text, plan, at: nowIso() });
  };

  const submit = () => {
    setConfirmSubmit(false);
    if (submitting || words === 0) return;
    setSubmitting(true);
    saveNow();
    const id = uid('sub');
    const latest = getState().drafts[promptId];
    dispatch({
      type: 'submitWriting',
      submission: {
        id,
        promptId,
        writingType: prompt.type,
        context: 'studio',
        text,
        plan,
        checklist: latest?.checklist ?? checklist,
        wordCount: words,
        submittedAt: nowIso(),
        version: 1,
        pointsTicked: prompt.requiredPoints.filter((p) => (latest?.checklist ?? checklist).includes(`point:${p.id}`)).map((p) => p.id),
      },
    });
    navigate(`/writing/${promptId}/review/${id}`);
  };

  return (
    <div className="writing-task">
      <Link className="back-link" to="/writing">
        <ArrowLeft size={16} aria-hidden /> Writing Studio
      </Link>

      <header className="task-card">
        <div className="task-card__badges">
          <Badge tone="primary">{prompt.type === 'email' ? 'Emel' : 'Esei'}</Badge>
          <Badge tone="navy">{REGISTER_LABELS[prompt.register]}</Badge>
          <Badge tone="navy">{DIFFICULTY_LABELS[prompt.difficulty]}</Badge>
        </div>
        <h1 className="task-card__title">{prompt.title}</h1>
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
        <dl className="task-card__facts">
          <div>
            <dt>
              <Users size={14} aria-hidden /> Pembaca
            </dt>
            <dd>{prompt.audience}</dd>
          </div>
          <div>
            <dt>
              <Target size={14} aria-hidden /> Tujuan
            </dt>
            <dd>{prompt.purpose}</dd>
          </div>
          <div>
            <dt>
              <Clock3 size={14} aria-hidden /> Masa dicadangkan
            </dt>
            <dd>{prompt.suggestedMinutes} minit</dd>
          </div>
          <div>
            <dt>Panduan perkataan</dt>
            <dd>{prompt.wordGuide ? `${prompt.wordGuide.min}–${prompt.wordGuide.max} (untuk latihan ini)` : 'Tiada'}</dd>
          </div>
        </dl>
        <div>
          <p className="task-card__sub">Isi wajib</p>
          <ol className="prose-list" lang="en">
            {prompt.requiredPoints.map((p) => (
              <li key={p.id}>{p.text}</li>
            ))}
          </ol>
        </div>
        <details className="tips">
          <summary>Tip perancangan</summary>
          <ul className="prose-list">
            {prompt.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </details>
      </header>

      {lastSubmitted && (
        <Callout tone="info" title={`Versi ${lastSubmitted.version} dihantar pada ${formatDateTime(lastSubmitted.submittedAt)}`}>
          Teks di bawah ialah draf anda. Anda boleh memperbaikinya dan menghantar versi baharu.{' '}
          <Link to={`/writing/${promptId}/review/${lastSubmitted.id}`}>Lihat maklum balas versi {lastSubmitted.version}</Link>
        </Callout>
      )}

      <div className="writing-layout">
        <div className="writing-layout__main">
          <details className="panel plan" open={planInitiallyOpen}>
            <summary className="plan__summary">Lembaran perancangan (2–5 minit)</summary>
            <div className="plan__fields">
              {prompt.planFields.map((f) => (
                <div key={f.id} className="field">
                  <label htmlFor={`plan-${f.id}`} className="field-label">
                    {f.label}
                  </label>
                  <textarea
                    id={`plan-${f.id}`}
                    className="textarea"
                    rows={2}
                    value={plan[f.id] ?? ''}
                    placeholder={f.placeholder}
                    onChange={(e) => {
                      const next = { ...plan, [f.id]: e.target.value };
                      setPlan(next);
                      planSave.schedule(next);
                    }}
                    onBlur={planSave.flush}
                  />
                </div>
              ))}
            </div>
          </details>

          <WritingEditor
            id="writing-editor"
            label="Respons anda"
            value={text}
            onChange={(v) => {
              setText(v);
              textSave.schedule(v);
            }}
            onBlur={textSave.flush}
            guide={prompt.wordGuide}
            savedAt={draft?.updatedAt}
          />

          <div className="editor-actions">
            <button type="button" className="btn btn--secondary" onClick={saveNow}>
              <Save size={16} aria-hidden /> Simpan draf
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => setConfirmClear(true)} disabled={!text && Object.values(plan).every((v) => !v)}>
              <Trash2 size={16} aria-hidden /> Kosongkan draf
            </button>
            <button
              type="button"
              className="btn btn--primary editor-actions__submit"
              disabled={words === 0 || submitting || !changedSinceSubmit}
              onClick={() => setConfirmSubmit(true)}
            >
              <Send size={16} aria-hidden /> {lastSubmitted ? 'Hantar versi baharu' : 'Hantar untuk semakan'}
            </button>
          </div>
          {words === 0 && <p className="hint">Tulis respons anda sebelum menghantar.</p>}
          {lastSubmitted && !changedSinceSubmit && <p className="hint">Draf ini sama dengan versi yang telah dihantar. Buat perubahan untuk menghantar versi baharu.</p>}
        </div>

        <aside className="writing-layout__side" aria-label="Senarai semak kendiri">
          <fieldset className="panel checklist">
            <legend>Isi wajib — saya telah menjawab:</legend>
            {prompt.requiredPoints.map((p) => (
              <label key={p.id} className="checklist__item">
                <input type="checkbox" checked={checklist.includes(`point:${p.id}`)} onChange={() => toggle(`point:${p.id}`)} />
                <span lang="en">{p.text}</span>
              </label>
            ))}
          </fieldset>
          <fieldset className="panel checklist">
            <legend>Senarai semak kendiri</legend>
            {reviewItems.map((item, i) => (
              <label key={item} className="checklist__item">
                <input type="checkbox" checked={checklist.includes(`review:${i}`)} onChange={() => toggle(`review:${i}`)} />
                <span>{item}</span>
              </label>
            ))}
          </fieldset>
          {history.length > 0 && (
            <div className="panel">
              <p className="panel__title">Versi terdahulu</p>
              <ul className="plain-list">
                {history
                  .slice()
                  .reverse()
                  .map((s) => {
                    const total = rubricTotal(s.rubricScores);
                    return (
                      <li key={s.id}>
                        <Link to={`/writing/${promptId}/review/${s.id}`}>
                          Versi {s.version} · {formatDateTime(s.submittedAt)}
                        </Link>
                        <span className="muted">
                          {' '}
                          · {s.wordCount} perkataan{total !== null ? ` · ${total}/${rubricMax()}` : ''}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Kosongkan draf ini?"
        tone="danger"
        confirmLabel="Ya, kosongkan"
        onConfirm={() => {
          setConfirmClear(false);
          setText('');
          setPlan({});
          dispatch({ type: 'clearDraft', promptId, at: nowIso() });
        }}
        onCancel={() => setConfirmClear(false)}
      >
        <p>Teks respons dan lembaran perancangan untuk tugasan ini akan dipadam. Versi yang telah dihantar tidak terjejas. Tindakan ini tidak boleh dibatalkan.</p>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmSubmit}
        title="Hantar tulisan untuk semakan?"
        confirmLabel="Hantar"
        cancelLabel="Kembali menulis"
        onConfirm={submit}
        onCancel={() => setConfirmSubmit(false)}
      >
        <ul className="plain-list">
          <li>
            <strong>{words}</strong> patah perkataan
            {prompt.wordGuide && words < prompt.wordGuide.min ? ` — kurang daripada panduan minimum (${prompt.wordGuide.min})` : ''}
          </li>
          {untickedPoints.length > 0 && <li>{untickedPoints.length} isi wajib belum ditanda sebagai dijawab.</li>}
          {untickedReview.length > 0 && <li>{untickedReview.length} item senarai semak kendiri belum ditanda.</li>}
        </ul>
        <p>Selepas menghantar, anda akan melihat semakan asas, jawapan model dan rubrik. Draf anda kekal supaya anda boleh memperbaikinya.</p>
      </ConfirmDialog>
    </div>
  );
}
