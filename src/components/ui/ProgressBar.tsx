export function ProgressBar({
  value,
  max,
  label,
  tone = 'primary',
  showValue = false,
  size = 'md',
}: {
  value: number;
  max: number;
  label: string;
  tone?: 'primary' | 'success' | 'warning';
  showValue?: boolean;
  size?: 'sm' | 'md';
}) {
  const percent = max > 0 ? Math.round((Math.min(value, max) / max) * 100) : 0;
  return (
    <div className={`progress progress--${size}`}>
      {showValue && (
        <div className="progress__meta">
          <span>{label}</span>
          <span>
            {value}/{max}
          </span>
        </div>
      )}
      <div
        className={`progress__track progress__track--${tone}`}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(value, max)}
        aria-valuetext={`${value} daripada ${max}`}
      >
        <div className="progress__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
