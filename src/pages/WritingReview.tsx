import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CircleHelp, PenLine } from 'lucide-react';
import { getPrompt } from '../content';
import { analyzeWriting } from '../lib/writing';
import { formatDateTime, nowIso } from '../lib/format';
import { useAppState, useDispatch } from '../state/StoreContext';
import { AnalysisPanel } from '../components/writing/AnalysisPanel';
import { RubricForm } from '../components/writing/RubricForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Callout } from '../components/ui/Callout';
import { EmptyState } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';

export function WritingReview() {
  const { promptId = '', submissionId = '' } = useParams();
  const state = useAppState();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const prompt = getPrompt(promptId);
  const submission = state.submissions.find((s) => s.id === submissionId && s.promptId === promptId);
  const [confirmReplace, setConfirmReplace] = useState(false);

  const analysis = useMemo(() => (submission && prompt ? analyzeWriting(submission.text, prompt) : null), [submission, prompt]);
  const modelAnalysis = useMemo(() => (prompt ? analyzeWriting(prompt.modelAnswer, prompt) : null), [prompt]);

  if (!prompt || !submission || !analysis || !modelAnalysis) {
    return (
      <EmptyState title="Penghantaran tidak dijumpai" action={<Link className="btn btn--primary" to="/writing">Kembali ke Writing Studio</Link>}>
        Penghantaran ini mungkin telah dipadam apabila kemajuan ditetapkan semula.
      </EmptyState>
    );
  }

  const draft = state.drafts[promptId];
  const draftText = draft?.text ?? '';
  const latest = state.submissions.filter((s) => s.promptId === promptId && s.context === 'studio').slice(-1)[0];
  const isLatestStudio = submission.context === 'studio' && latest?.id === submission.id;

  const applyAsDraft = () => {
    dispatch({ type: 'saveDraft', promptId, text: submission.text, plan: submission.plan, at: nowIso() });
    navigate(`/writing/${promptId}`);
  };
  const revise = () => {
    if (isLatestStudio || draftText === submission.text) {
      navigate(`/writing/${promptId}`);
    } else if (draftText.trim() === '') {
      applyAsDraft();
    } else {
      setConfirmReplace(true);
    }
  };

  const missingLinking = modelAnalysis.linkingWords.filter((w) => !analysis.linkingWords.includes(w));
  const differences: string[] = [
    `Bilangan perkataan: anda ${analysis.words}, model ${modelAnalysis.words}.`,
    `Bilangan perenggan: anda ${analysis.paragraphs}, model ${modelAnalysis.paragraphs}.`,
  ];
  if (missingLinking.length > 0) differences.push(`Penanda wacana dalam model yang tidak anda gunakan: ${missingLinking.join(', ')}.`);
  const yourStructure = analysis.issues.filter((i) => i.category === 'structure').map((i) => i.title);
  if (yourStructure.length > 0) differences.push(`Isu struktur dalam tulisan anda tetapi tidak dalam model: ${yourStructure.join('; ')}.`);
  const undetected = analysis.points.filter((p) => !p.detected);
  if (undetected.length > 0) differences.push(`Model menyentuh setiap isi wajib; dalam tulisan anda, kata kunci untuk ${undetected.length} isi tidak dikesan.`);

  return (
    <div className="review-page">
      <Link className="back-link" to={submission.context === 'exam' ? '/exam' : `/writing/${promptId}`}>
        <ArrowLeft size={16} aria-hidden /> {submission.context === 'exam' ? 'Exam Arena' : 'Kembali ke tugasan'}
      </Link>
      <header className="page-header">
        <div className="page-header__text">
          <p className="eyebrow">Maklum balas penulisan</p>
          <h1>{prompt.title}</h1>
          <p className="page-header__desc">
            Versi {submission.version} · dihantar {formatDateTime(submission.submittedAt)} {submission.context === 'exam' && <Badge tone="navy">Ujian percubaan</Badge>}
          </p>
        </div>
      </header>

      <Callout tone="info" title="Bagaimana maklum balas ini dihasilkan">
        Semakan di bawah ialah <strong>semakan asas berasaskan peraturan</strong> (bilangan perkataan, perenggan, tanda baca dan beberapa corak kesilapan lazim). Ia bukan penilaian AI dan tidak dapat menilai kualiti idea anda sepenuhnya. Bandingkan tulisan anda dengan jawapan model, kemudian nilai diri anda menggunakan rubrik.
      </Callout>

      <section className="panel" aria-labelledby="yours-heading">
        <h2 id="yours-heading" className="panel__title">
          1. Respons anda
        </h2>
        <div className="writing-text" lang="en">
          {submission.text}
        </div>
      </section>

      <section className="panel" aria-labelledby="checks-heading">
        <h2 id="checks-heading" className="panel__title">
          2. Semakan asas automatik
        </h2>
        <AnalysisPanel analysis={analysis} guide={prompt.wordGuide} />
      </section>

      <section className="panel" aria-labelledby="points-heading">
        <h2 id="points-heading" className="panel__title">
          3. Isi wajib
        </h2>
        <p className="muted small">
          "Ditanda" ialah semakan anda sendiri. "Kata kunci" hanya petunjuk: ia mencari perkataan berkaitan dan boleh tersilap — anda mungkin menjawab isi dengan perkataan lain.
        </p>
        <ul className="points">
          {analysis.points.map((p) => {
            const ticked = submission.pointsTicked.includes(p.id);
            return (
              <li key={p.id} className="points__item">
                <span lang="en" className="points__text">
                  {p.text}
                </span>
                <span className={`badge ${ticked ? 'badge--success' : 'badge--neutral'}`}>{ticked ? 'Ditanda dijawab' : 'Tidak ditanda'}</span>
                <span className={`badge ${p.detected ? 'badge--primary' : 'badge--warning'}`}>
                  {p.detected ? (
                    <>
                      <CheckCircle2 size={12} aria-hidden /> Kata kunci dikesan
                    </>
                  ) : (
                    <>
                      <CircleHelp size={12} aria-hidden /> Kata kunci tidak dikesan — semak
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel" aria-labelledby="model-heading">
        <h2 id="model-heading" className="panel__title">
          4. Bandingkan dengan jawapan model
        </h2>
        <p className="muted small">Jawapan model ialah satu contoh yang baik, bukan satu-satunya jawapan yang betul. Jangan salin — gunakannya untuk melihat perbezaan.</p>
        <div className="compare-writing">
          <div>
            <p className="compare-writing__label">Tulisan anda ({analysis.words} perkataan)</p>
            <div className="writing-text writing-text--small" lang="en">
              {submission.text}
            </div>
          </div>
          <div>
            <p className="compare-writing__label">Jawapan model ({modelAnalysis.words} perkataan)</p>
            <div className="writing-text writing-text--small writing-text--model" lang="en">
              {prompt.modelAnswer}
            </div>
          </div>
        </div>
        <div className="compare-notes">
          <div>
            <h3>Apa yang dilakukan dengan baik oleh model</h3>
            <ul className="prose-list">
              {prompt.modelNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Perbezaan yang boleh diperhatikan</h3>
            <ul className="prose-list">
              {differences.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="panel" id="rubric" aria-labelledby="rubric-heading">
        <h2 id="rubric-heading" className="panel__title">
          5. Penilaian kendiri dengan rubrik
        </h2>
        <RubricForm
          key={submission.id}
          submission={submission}
          analysis={analysis}
          onSave={(scores, reflection) => dispatch({ type: 'saveRubric', submissionId: submission.id, scores, reflection, at: nowIso() })}
        />
      </section>

      <section className="panel revise-panel" aria-labelledby="revise-heading">
        <h2 id="revise-heading" className="panel__title">
          6. Perbaiki dan hantar semula
        </h2>
        <p>Gunakan maklum balas dan rubrik untuk memperbaiki draf anda. Setiap versi baharu disimpan berasingan; tulisan asal anda tidak akan diganti dengan jawapan model.</p>
        <button type="button" className="btn btn--primary" onClick={revise}>
          <PenLine size={16} aria-hidden /> {submission.context === 'exam' ? 'Perbaiki dalam Writing Studio' : 'Perbaiki draf'}
        </button>
      </section>

      <ConfirmDialog
        open={confirmReplace}
        title="Gantikan draf semasa?"
        tone="danger"
        confirmLabel="Ya, gunakan versi ini"
        cancelLabel="Batal"
        onConfirm={() => {
          setConfirmReplace(false);
          applyAsDraft();
        }}
        onCancel={() => setConfirmReplace(false)}
      >
        <p>Anda mempunyai draf lain untuk tugasan ini dalam Writing Studio. Jika diteruskan, draf itu akan digantikan dengan teks versi ini. Versi yang telah dihantar tidak terjejas.</p>
      </ConfirmDialog>
    </div>
  );
}
