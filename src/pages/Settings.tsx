import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { nowIso } from '../lib/format';
import { useAppState, useDispatch, useStoreStatus } from '../state/StoreContext';
import { PageHeader } from '../components/ui/PageHeader';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Callout } from '../components/ui/Callout';

export function Settings() {
  const state = useAppState();
  const status = useStoreStatus();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState(state.preferences.displayName);
  const [confirmReset, setConfirmReset] = useState(false);
  const [savedName, setSavedName] = useState(false);

  return (
    <div className="settings">
      <PageHeader eyebrow="Tetapan" title="Tetapan dan data" />

      <section className="panel" aria-labelledby="pref-h">
        <h2 id="pref-h" className="panel__title">
          Pilihan
        </h2>
        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: 'setPreferences', prefs: { displayName: name.trim() } });
            setSavedName(true);
          }}
        >
          <label htmlFor="pref-name" className="field-label">
            Nama panggilan
          </label>
          <div className="text-question__row">
            <input
              id="pref-name"
              className="input"
              value={name}
              maxLength={40}
              onChange={(e) => {
                setName(e.target.value);
                setSavedName(false);
              }}
              autoComplete="nickname"
            />
            <button type="submit" className="btn btn--secondary">
              {savedName ? 'Disimpan ✓' : 'Simpan'}
            </button>
          </div>
        </form>
        <fieldset className="choices">
          <legend className="field-label">Saiz teks</legend>
          <label className="choice">
            <input type="radio" name="text-size" checked={state.preferences.textSize === 'normal'} onChange={() => dispatch({ type: 'setPreferences', prefs: { textSize: 'normal' } })} />
            <span className="choice__text">Biasa</span>
          </label>
          <label className="choice">
            <input type="radio" name="text-size" checked={state.preferences.textSize === 'large'} onChange={() => dispatch({ type: 'setPreferences', prefs: { textSize: 'large' } })} />
            <span className="choice__text">Besar</span>
          </label>
        </fieldset>
      </section>

      <section className="panel" aria-labelledby="data-h">
        <h2 id="data-h" className="panel__title">
          Di mana kemajuan anda disimpan
        </h2>
        <ul className="prose-list">
          <li>
            Kemajuan disimpan dalam <strong>localStorage pelayar ini</strong> pada peranti ini sahaja.
          </li>
          <li>Ia tidak disegerakkan ke peranti atau pelayar lain, dan tiada data dihantar ke pelayan.</li>
          <li>Memadam data pelayar, menggunakan mod peribadi atau menukar pelayar akan menyebabkan kemajuan tidak kelihatan.</li>
        </ul>
        <p className="muted small">
          Status storan: {status.storage === 'ok' ? 'tersedia' : 'tidak tersedia — kemajuan hanya kekal sehingga halaman ditutup'}
          {status.dropped > 0 ? ` · ${status.dropped} rekod rosak diabaikan semasa memuatkan` : ''}.
        </p>
      </section>

      <section className="panel" aria-labelledby="about-h">
        <h2 id="about-h" className="panel__title">
          Tentang format peperiksaan
        </h2>
        <p>
          ENGLISH LAB mengajar kemahiran umum penulisan sekolah menengah (emel, esei, artikel). Panduan bilangan perkataan, rubrik dan ujian percubaan dalam aplikasi ini direka untuk latihan sahaja. Format, had perkataan dan skema pemarkahan peperiksaan rasmi (contohnya SPM) mungkin berbeza — sentiasa rujuk arahan guru anda dan format peperiksaan terkini.
        </p>
        <p>Maklum balas penulisan dihasilkan oleh semakan berasaskan peraturan dan penilaian kendiri. Tiada perkhidmatan AI digunakan.</p>
      </section>

      <section className="panel panel--danger" aria-labelledby="reset-h">
        <h2 id="reset-h" className="panel__title">
          Tetapkan semula kemajuan
        </h2>
        <Callout tone="warning">
          Ini akan memadam semua pelajaran yang selesai, jawapan kuiz, draf dan tulisan yang dihantar, rekod kosa kata, Buku Kesilapan dan sejarah ujian dalam pelayar ini. Tindakan ini tidak boleh dibatalkan.
        </Callout>
        <button type="button" className="btn btn--danger" onClick={() => setConfirmReset(true)}>
          <Trash2 size={16} aria-hidden /> Tetapkan semula semua kemajuan
        </button>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="Padam semua kemajuan?"
        tone="danger"
        confirmLabel="Padam semua"
        requireText="RESET"
        onConfirm={() => {
          setConfirmReset(false);
          dispatch({ type: 'reset', at: nowIso() });
          navigate('/welcome');
        }}
        onCancel={() => setConfirmReset(false)}
      >
        <p>Semua data ENGLISH LAB dalam pelayar ini akan dipadam, termasuk tulisan anda. Salin tulisan yang ingin disimpan sebelum meneruskan.</p>
      </ConfirmDialog>
    </div>
  );
}
