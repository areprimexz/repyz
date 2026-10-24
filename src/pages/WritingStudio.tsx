import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, PenLine } from 'lucide-react';
import type { WritingType } from '../types/content';
import { WRITING_PROMPTS, getPrompt } from '../content';
import { rubricTotal, rubricMax } from '../content/rubric';
import { DIFFICULTY_LABELS } from '../lib/exam';
import { formatDateTime } from '../lib/format';
import { useAppState } from '../state/StoreContext';
import { PageHeader, EmptyState } from '../components/ui/PageHeader';
import { Badge } from '../components/ui/Badge';

const TYPE_LABELS: Record<WritingType, string> = { email: 'Emel', essay: 'Esei' };

export function WritingStudio() {
  const state = useAppState();
  const [filter, setFilter] = useState<'all' | WritingType>('all');
  const prompts = WRITING_PROMPTS.filter((p) => filter === 'all' || p.type === filter);
  const submissions = state.submissions.slice().reverse();

  return (
    <div>
      <PageHeader
        eyebrow="Writing Studio"
        title="Tugasan penulisan"
        description="Analisis soalan, rancang, tulis, semak dengan senarai semak, hantar, kemudian bandingkan dengan jawapan model dan perbaiki. Draf disimpan secara automatik dalam pelayar ini."
      />

      <div className="segmented" role="group" aria-label="Tapis jenis tugasan">
        {(['all', 'email', 'essay'] as const).map((f) => (
          <button key={f} type="button" className={`segmented__btn ${filter === f ? 'is-active' : ''}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Semua' : TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      <ul className="prompt-grid">
        {prompts.map((p) => {
          const count = state.submissions.filter((s) => s.promptId === p.id && s.context === 'studio').length;
          const draft = state.drafts[p.id];
          const status = count > 0 ? `Dihantar ${count}×` : draft?.text.trim() ? 'Draf disimpan' : 'Belum dimulakan';
          return (
            <li key={p.id} className="prompt-card">
              <div className="prompt-card__badges">
                <Badge tone="primary">{TYPE_LABELS[p.type]}</Badge>
                <Badge tone="navy">{DIFFICULTY_LABELS[p.difficulty]}</Badge>
                <Badge tone={count > 0 ? 'success' : draft?.text.trim() ? 'warning' : 'neutral'}>{status}</Badge>
              </div>
              <h2 className="prompt-card__title">{p.title}</h2>
              <p className="prompt-card__purpose">{p.purpose}</p>
              <p className="prompt-card__meta">
                <Clock3 size={14} aria-hidden /> {p.suggestedMinutes} minit
                {p.wordGuide && ` · ${p.wordGuide.min}–${p.wordGuide.max} patah perkataan`}
              </p>
              <Link className="btn btn--secondary btn--sm" to={`/writing/${p.id}`}>
                <PenLine size={16} aria-hidden /> {count > 0 ? 'Buka' : draft?.text.trim() ? 'Sambung menulis' : 'Mula menulis'}
                <span className="sr-only">: {p.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="panel" aria-labelledby="history-heading">
        <h2 id="history-heading" className="panel__title">
          Penghantaran anda
        </h2>
        {submissions.length === 0 ? (
          <EmptyState title="Belum ada penghantaran">Tulisan yang anda hantar akan disenaraikan di sini supaya anda boleh menyemak semula maklum balas.</EmptyState>
        ) : (
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Senarai penghantaran">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Tugasan</th>
                  <th scope="col">Versi</th>
                  <th scope="col">Tarikh</th>
                  <th scope="col">Perkataan</th>
                  <th scope="col">Rubrik (kendiri)</th>
                  <th scope="col">
                    <span className="sr-only">Tindakan</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const total = rubricTotal(s.rubricScores);
                  return (
                    <tr key={s.id}>
                      <th scope="row">
                        {getPrompt(s.promptId)?.title ?? s.promptId}
                        {s.context === 'exam' && (
                          <>
                            {' '}
                            <Badge tone="navy">Ujian</Badge>
                          </>
                        )}
                      </th>
                      <td>{s.version}</td>
                      <td>{formatDateTime(s.submittedAt)}</td>
                      <td>{s.wordCount}</td>
                      <td>{total !== null ? `${total}/${rubricMax()}` : '—'}</td>
                      <td>
                        <Link to={`/writing/${s.promptId}/review/${s.id}`}>Lihat maklum balas</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
