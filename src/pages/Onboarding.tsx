import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Database, Eye, Lightbulb, PenLine, RefreshCw, Search, Target } from 'lucide-react';
import { DAYS, dayDurationMin, lessonsForDay } from '../content';
import { useAppState, useDispatch } from '../state/StoreContext';

const LOOP = [
  { icon: BookOpen, label: 'Belajar', text: 'Penerangan dalam BM' },
  { icon: Eye, label: 'Lihat contoh', text: 'Contoh beranotasi' },
  { icon: Lightbulb, label: 'Latihan berpandu', text: 'Maklum balas segera' },
  { icon: PenLine, label: 'Cuba sendiri', text: 'Tulis secara berdikari' },
  { icon: Search, label: 'Semak kesilapan', text: 'Buku Kesilapan' },
  { icon: RefreshCw, label: 'Perbaiki', text: 'Semak dan hantar semula' },
];

export function Onboarding() {
  const state = useAppState();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState(state.preferences.displayName);

  const start = (to: string) => {
    dispatch({ type: 'onboard', displayName: name });
    navigate(to);
  };

  return (
    <div className="onboarding">
      <section className="hero">
        <p className="eyebrow eyebrow--light">ENGLISH LAB</p>
        <h1 className="hero__title">3-Day Writing Bootcamp</h1>
        <p className="hero__lead">
          Kem intensif tiga hari untuk pelajar sekolah menengah: belajar <strong>cara</strong> menulis emel dan esei bahasa Inggeris dengan jelas, tepat dan yakin — bukan sekadar menghafal nota.
        </p>
        <div className="hero__field">
          <label htmlFor="onboard-name">Nama panggilan (pilihan)</label>
          <input id="onboard-name" className="input" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Aina" autoComplete="nickname" />
        </div>
        <div className="hero__actions">
          <button type="button" className="btn btn--primary btn--lg" onClick={() => start('/lesson/d1-l1')}>
            Mula Hari 1 <ArrowRight size={18} aria-hidden />
          </button>
          <button type="button" className="btn btn--on-dark btn--lg" onClick={() => start('/curriculum')}>
            Lihat kurikulum
          </button>
        </div>
      </section>

      <section className="onboarding__section" aria-labelledby="days-heading">
        <h2 id="days-heading">Program tiga hari</h2>
        <p className="muted">Sasaran kira-kira dua jam pembelajaran aktif sehari. Anda boleh berhenti dan sambung bila-bila masa.</p>
        <ol className="day-overview">
          {DAYS.map((d) => (
            <li key={d.day} className="day-overview__item">
              <span className="day-overview__num">Hari {d.day}</span>
              <h3>{d.title}</h3>
              <p className="day-overview__sub">{d.subtitle}</p>
              <p>{d.goal}</p>
              <p className="day-overview__meta">
                {lessonsForDay(d.day).length} pelajaran · ±{dayDurationMin(d.day)} minit
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="onboarding__section" aria-labelledby="loop-heading">
        <h2 id="loop-heading">Cara anda akan belajar</h2>
        <ol className="loop">
          {LOOP.map(({ icon: Icon, label, text }) => (
            <li key={label} className="loop__step">
              <Icon size={20} aria-hidden />
              <span className="loop__label">{label}</span>
              <span className="loop__text">{text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="onboarding__grid">
        <div className="panel">
          <h2 className="panel__title">
            <Target size={18} aria-hidden /> Matlamat pembelajaran
          </h2>
          <ul className="prose-list">
            <li>Memahami dan menjawab setiap isi dalam soalan penulisan.</li>
            <li>Menyusun emel dan esei dengan struktur yang jelas.</li>
            <li>Mengembangkan idea dengan teknik PEEL dan penanda wacana.</li>
            <li>Mengenal pasti dan membetulkan kesilapan tatabahasa lazim.</li>
            <li>Menulis di bawah tekanan masa dalam ujian percubaan.</li>
          </ul>
        </div>
        <div className="panel">
          <h2 className="panel__title">
            <Database size={18} aria-hidden /> Bagaimana kemajuan direkodkan
          </h2>
          <ul className="prose-list">
            <li>Tiada pendaftaran atau akaun diperlukan.</li>
            <li>Kemajuan, jawapan dan draf tulisan disimpan dalam <strong>pelayar dan peranti ini sahaja</strong> (localStorage).</li>
            <li>Data tidak disegerakkan ke peranti lain, dan akan hilang jika anda memadam data pelayar.</li>
            <li>Statistik dikira daripada aktiviti sebenar anda — tiada markah rekaan.</li>
            <li>Anda boleh menetapkan semula kemajuan dalam Tetapan.</li>
          </ul>
        </div>
      </section>

      <p className="onboarding__note muted">
        Nota: Latihan ini berdasarkan kemahiran umum penulisan sekolah menengah. Format, had perkataan dan skema pemarkahan peperiksaan rasmi mungkin berbeza — sentiasa rujuk arahan guru anda dan format peperiksaan terkini.
      </p>
    </div>
  );
}
