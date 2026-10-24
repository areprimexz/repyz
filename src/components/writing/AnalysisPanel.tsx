import { AlertTriangle, Info } from 'lucide-react';
import type { WritingAnalysis } from '../../lib/writing';
import { guideStatus } from './WritingEditor';

export function AnalysisPanel({ analysis, guide }: { analysis: WritingAnalysis; guide: { min: number; max: number } | null }) {
  const warnings = analysis.issues.filter((i) => i.severity === 'warning');
  const infos = analysis.issues.filter((i) => i.severity === 'info');
  const status = guideStatus(analysis.words, guide);
  return (
    <div className="analysis">
      <ul className="stat-row stat-row--compact">
        <li className="stat">
          <span className="stat__label">Perkataan</span>
          <span className="stat__value">{analysis.words}</span>
          <span className={`stat__meta editor__guide--${status.tone}`}>{status.text}</span>
        </li>
        <li className="stat">
          <span className="stat__label">Ayat (anggaran)</span>
          <span className="stat__value">{analysis.sentences}</span>
          <span className="stat__meta">Purata {analysis.avgSentenceLength} perkataan/ayat</span>
        </li>
        <li className="stat">
          <span className="stat__label">Perenggan (anggaran)</span>
          <span className="stat__value">{analysis.paragraphs}</span>
        </li>
        <li className="stat">
          <span className="stat__label">Penanda wacana</span>
          <span className="stat__value">{analysis.linkingWords.length}</span>
          <span className="stat__meta">{analysis.linkingWords.length ? analysis.linkingWords.join(', ') : 'Tiada dikesan'}</span>
        </li>
      </ul>

      {analysis.issues.length === 0 ? (
        <p className="analysis__clear">
          Tiada isu asas dikesan. Ini <strong>tidak</strong> bermakna tulisan anda bebas kesilapan — semakan ini hanya melihat ciri permukaan. Gunakan rubrik di bawah untuk menilai kualiti idea dan bahasa.
        </p>
      ) : (
        <>
          {warnings.length > 0 && (
            <div className="issues">
              <h4 className="issues__heading">
                <AlertTriangle size={16} aria-hidden /> Perlu disemak ({warnings.length})
              </h4>
              <IssueList issues={warnings} />
            </div>
          )}
          {infos.length > 0 && (
            <div className="issues">
              <h4 className="issues__heading">
                <Info size={16} aria-hidden /> Cadangan ({infos.length})
              </h4>
              <IssueList issues={infos} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function IssueList({ issues }: { issues: WritingAnalysis['issues'] }) {
  return (
    <ul className="issues__list">
      {issues.map((issue) => (
        <li key={issue.id} className={`issue issue--${issue.severity}`}>
          <p className="issue__title">{issue.title}</p>
          <p className="issue__detail">{issue.detail}</p>
          {issue.examples && issue.examples.length > 0 && (
            <ul className="issue__examples" lang="en">
              {issue.examples.map((ex, i) => (
                <li key={i}>
                  <code>{ex}</code>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
