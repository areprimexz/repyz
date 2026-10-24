import { countWords, countSentences, splitParagraphs } from '../../lib/writing';
import { formatTime } from '../../lib/format';

interface WritingEditorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  guide?: { min: number; max: number } | null;
  savedAt?: string;
  readOnly?: boolean;
  rows?: number;
  placeholder?: string;
}

export function guideStatus(words: number, guide?: { min: number; max: number } | null): { text: string; tone: 'neutral' | 'warning' | 'success' } {
  if (!guide) return { text: 'Tiada panduan perkataan untuk tugasan ini', tone: 'neutral' };
  if (words === 0) return { text: `Panduan latihan: ${guide.min}–${guide.max} patah perkataan`, tone: 'neutral' };
  if (words < guide.min) return { text: `${guide.min - words} lagi untuk mencapai panduan minimum (${guide.min})`, tone: 'warning' };
  if (words > guide.max) return { text: `Melebihi panduan maksimum (${guide.max}) sebanyak ${words - guide.max}`, tone: 'warning' };
  return { text: `Dalam julat panduan (${guide.min}–${guide.max})`, tone: 'success' };
}

/** Plain textarea editor with live word, sentence and paragraph counts. */
export function WritingEditor({ id, label, value, onChange, onBlur, guide, savedAt, readOnly, rows = 14, placeholder }: WritingEditorProps) {
  const words = countWords(value);
  const status = guideStatus(words, guide);
  return (
    <div className="editor">
      <div className="editor__top">
        <label htmlFor={id} className="editor__label">
          {label}
        </label>
        <span className="editor__saved" aria-live="polite">
          {readOnly ? 'Baca sahaja' : savedAt ? `Disimpan automatik ${formatTime(savedAt)}` : 'Belum disimpan'}
        </span>
      </div>
      <textarea
        id={id}
        className="textarea editor__area"
        lang="en"
        spellCheck
        rows={rows}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder ?? 'Mula menulis di sini dalam bahasa Inggeris. Tinggalkan satu baris kosong di antara perenggan.'}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-describedby={`${id}-counts`}
      />
      <div className="editor__counts" id={`${id}-counts`}>
        <span className="editor__words">
          <strong>{words}</strong> patah perkataan
        </span>
        <span>{countSentences(value)} ayat</span>
        <span>{splitParagraphs(value).length} perenggan</span>
        <span className={`editor__guide editor__guide--${status.tone}`}>{status.text}</span>
      </div>
    </div>
  );
}
