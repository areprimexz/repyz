import type { ScoreSummary as Summary } from '../../lib/quiz';

export function ScoreSummary({ summary, label = 'Markah anda' }: { summary: Summary; label?: string }) {
  const tone = summary.percent >= 80 ? 'success' : summary.percent >= 50 ? 'primary' : 'warning';
  const message =
    summary.percent >= 80
      ? 'Bagus! Semak penjelasan untuk mengukuhkan pemahaman.'
      : summary.percent >= 50
        ? 'Usaha yang baik. Baca penjelasan bagi soalan yang salah, kemudian cuba lagi.'
        : 'Baca semula nota pelajaran dan penjelasan di bawah, kemudian cuba lagi.';
  return (
    <div className={`score score--${tone}`} role="status">
      <div className="score__main">
        <span className="score__label">{label}</span>
        <span className="score__value">
          {summary.earned}/{summary.total}
        </span>
        <span className="score__percent">{summary.percent}%</span>
      </div>
      <ul className="score__breakdown">
        <li>
          <strong>{summary.correct}</strong> betul
        </li>
        {summary.partial > 0 && (
          <li>
            <strong>{summary.partial}</strong> separa betul
          </li>
        )}
        <li>
          <strong>{summary.incorrect}</strong> salah
        </li>
        <li>
          <strong>{summary.unanswered}</strong> tidak dijawab
        </li>
      </ul>
      <p className="score__message">{message}</p>
    </div>
  );
}
