import { useState } from 'react';
import type { WritingSubmission } from '../../types/progress';
import type { WritingAnalysis } from '../../lib/writing';
import { LEARNING_RUBRIC, rubricMax, rubricTotal } from '../../content/rubric';
import { Callout } from '../ui/Callout';

/** Automatic signals shown beside each dimension — hints only, never a score. */
function signalsFor(dimensionId: string, analysis: WritingAnalysis, submission: WritingSubmission): string[] {
  const issues = analysis.issues;
  const has = (cat: string) => issues.filter((i) => i.category === cat).length;
  switch (dimensionId) {
    case 'task': {
      const total = analysis.points.length;
      const notDetected = analysis.points.filter((p) => !p.detected).length;
      const ticked = submission.pointsTicked.length;
      return [
        `Anda menandakan ${ticked}/${total} isi wajib sebagai dijawab.`,
        notDetected > 0 ? `${notDetected} isi tiada kata kunci berkaitan dikesan — semak semula.` : 'Kata kunci berkaitan dikesan untuk setiap isi (petunjuk sahaja).',
      ];
    }
    case 'organisation':
      return [
        `${analysis.paragraphs} perenggan dikesan.`,
        has('structure') > 0 ? `${has('structure')} isu struktur dikesan dalam semakan asas.` : 'Tiada isu struktur asas dikesan.',
      ];
    case 'development':
      return [`${analysis.words} patah perkataan, ${analysis.sentences} ayat.`, 'Semakan automatik tidak dapat menilai kualiti huraian — bandingkan dengan jawapan model.'];
    case 'grammar':
      return [
        has('pattern') > 0 ? `${has('pattern')} corak kesilapan lazim mungkin dikesan.` : 'Tiada corak kesilapan lazim dikesan (senarai corak adalah terhad).',
        issues.some((i) => i.id === 'long-sentence') ? 'Terdapat ayat yang sangat panjang.' : 'Tiada ayat yang terlalu panjang.',
      ];
    case 'vocabulary':
      return [`${analysis.linkingWords.length} penanda wacana berbeza digunakan.`, has('style') > 0 ? `${has('style')} cadangan gaya dalam semakan asas.` : 'Tiada cadangan gaya.'];
    case 'mechanics':
      return [has('mechanics') + has('format') > 0 ? `${has('mechanics') + has('format')} isu tanda baca/format dikesan.` : 'Tiada isu tanda baca asas dikesan.', 'Ejaan tidak disemak secara automatik — gunakan garis merah semakan ejaan pelayar.'];
    default:
      return [];
  }
}

export function RubricForm({
  submission,
  analysis,
  onSave,
}: {
  submission: WritingSubmission;
  analysis: WritingAnalysis;
  onSave: (scores: Record<string, number>, reflection: string) => void;
}) {
  const rubric = LEARNING_RUBRIC;
  const [scores, setScores] = useState<Record<string, number>>(submission.rubricScores ?? {});
  const [reflection, setReflection] = useState(submission.reflection ?? '');
  const [saved, setSaved] = useState(Boolean(submission.rubricAt));
  const complete = rubric.dimensions.every((d) => typeof scores[d.id] === 'number');
  const total = complete ? rubricTotal(scores) : null;
  const options = Array.from({ length: rubric.maxPerDimension + 1 }, (_, i) => i);

  const weakest = complete
    ? rubric.dimensions
        .slice()
        .sort((a, b) => scores[a.id] - scores[b.id])
        .slice(0, 2)
    : [];

  return (
    <form
      className="rubric"
      onSubmit={(e) => {
        e.preventDefault();
        if (!complete) return;
        onSave(scores, reflection.trim());
        setSaved(true);
      }}
    >
      <Callout tone="info" title={rubric.name}>
        {rubric.disclaimer}
      </Callout>

      {rubric.dimensions.map((d) => {
        const value = scores[d.id];
        const band = typeof value === 'number' ? d.bands.find((b) => value >= b.range[0] && value <= b.range[1]) : undefined;
        return (
          <fieldset key={d.id} className="rubric__dim">
            <legend className="rubric__name">{d.name}</legend>
            <p className="rubric__what">{d.whatAssessed}</p>
            <details className="rubric__details">
              <summary>Kriteria, sebab markah hilang dan langkah seterusnya</summary>
              <div className="rubric__cols">
                <div>
                  <p className="rubric__sub">Tulisan yang lebih kukuh</p>
                  <ul>
                    {d.stronger.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="rubric__sub">Sebab markah mungkin hilang</p>
                  <ul>
                    {d.loseMarks.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p>
                <strong>Langkah seterusnya:</strong> {d.nextStep}
              </p>
              <table className="table table--compact">
                <caption className="sr-only">Julat skor untuk {d.name}</caption>
                <thead>
                  <tr>
                    <th scope="col">Skor</th>
                    <th scope="col">Tahap</th>
                    <th scope="col">Penerangan</th>
                  </tr>
                </thead>
                <tbody>
                  {d.bands.map((b) => (
                    <tr key={b.label}>
                      <td>{b.range[0] === b.range[1] ? b.range[0] : `${b.range[0]}–${b.range[1]}`}</td>
                      <td>{b.label}</td>
                      <td>{b.descriptor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
            <ul className="rubric__signals" aria-label="Petunjuk automatik">
              {signalsFor(d.id, analysis, submission).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="rubric__scale" role="radiogroup" aria-label={`Skor untuk ${d.name}`}>
              {options.map((n) => (
                <label key={n} className={`scale-option ${value === n ? 'scale-option--active' : ''}`}>
                  <input
                    type="radio"
                    name={`rubric-${d.id}`}
                    value={n}
                    checked={value === n}
                    onChange={() => {
                      setScores((s) => ({ ...s, [d.id]: n }));
                      setSaved(false);
                    }}
                  />
                  <span>{n}</span>
                </label>
              ))}
            </div>
            {band && (
              <p className="rubric__band">
                <strong>{band.label}:</strong> {band.descriptor}
              </p>
            )}
          </fieldset>
        );
      })}

      <div className="field">
        <label htmlFor="reflection" className="field-label">
          Satu perkara yang akan saya perbaiki dalam draf seterusnya
        </label>
        <textarea
          id="reflection"
          className="textarea"
          rows={3}
          value={reflection}
          onChange={(e) => {
            setReflection(e.target.value);
            setSaved(false);
          }}
        />
      </div>

      <div className="rubric__footer">
        <p className="rubric__total" aria-live="polite">
          {total !== null ? (
            <>
              Jumlah penilaian kendiri: <strong>{total}/{rubricMax()}</strong>
            </>
          ) : (
            'Pilih skor untuk setiap dimensi untuk melihat jumlah.'
          )}
        </p>
        <button type="submit" className="btn btn--primary" disabled={!complete}>
          {saved ? 'Disimpan ✓' : 'Simpan penilaian'}
        </button>
      </div>

      {weakest.length > 0 && (
        <Callout tone="tip" title="Fokus seterusnya">
          <ul className="plain-list">
            {weakest.map((d) => (
              <li key={d.id}>
                <strong>{d.name}:</strong> {d.nextStep}
              </li>
            ))}
          </ul>
        </Callout>
      )}
    </form>
  );
}
