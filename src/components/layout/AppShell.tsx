import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Dumbbell,
  FlaskConical,
  LayoutDashboard,
  Layers,
  LineChart,
  Menu,
  PenLine,
  Settings,
  Timer,
  X,
} from 'lucide-react';
import { useAppState, useStoreStatus } from '../../state/StoreContext';
import { courseProgress } from '../../lib/progress';
import { ProgressBar } from '../ui/ProgressBar';

export const NAV_ITEMS = [
  { to: '/', label: 'Papan Pemuka', icon: LayoutDashboard, end: true },
  { to: '/curriculum', label: 'Kurikulum', icon: BookOpen },
  { to: '/writing', label: 'Writing Studio', icon: PenLine },
  { to: '/vocabulary', label: 'Vocabulary Lab', icon: Layers },
  { to: '/grammar', label: 'Grammar Gym', icon: Dumbbell },
  { to: '/exam', label: 'Exam Arena', icon: Timer },
  { to: '/progress', label: 'Kemajuan & Kesilapan', icon: LineChart },
  { to: '/settings', label: 'Tetapan', icon: Settings },
];

function Brand() {
  return (
    <div className="brand">
      <span className="brand__mark" aria-hidden>
        <FlaskConical size={20} />
      </span>
      <span className="brand__text">
        <span className="brand__name">ENGLISH LAB</span>
        <span className="brand__tag">3-Day Writing Bootcamp</span>
      </span>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="nav">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <li key={to}>
          <NavLink to={to} end={end} className={({ isActive }) => `nav__link ${isActive ? 'nav__link--active' : ''}`} onClick={onNavigate}>
            <Icon size={18} aria-hidden />
            <span>{label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function SidebarProgress() {
  const state = useAppState();
  const course = courseProgress(state);
  return (
    <div className="sidebar__progress">
      <ProgressBar value={course.completed} max={course.total} label="Kemajuan kursus" showValue size="sm" />
      <p className="sidebar__note">Kemajuan disimpan dalam pelayar ini sahaja.</p>
    </div>
  );
}

function StorageBanner() {
  const status = useStoreStatus();
  const [dismissed, setDismissed] = useState(false);
  if (status.storage === 'unavailable') {
    return (
      <div className="banner banner--warning" role="alert">
        Storan pelayar tidak tersedia (mungkin mod peribadi atau tetapan privasi). Anda masih boleh belajar, tetapi kemajuan tidak akan disimpan selepas halaman ditutup.
      </div>
    );
  }
  if (status.saveError) {
    return (
      <div className="banner banner--warning" role="alert">
        Kemajuan terbaharu tidak dapat disimpan (storan mungkin penuh). Jangan tutup halaman ini sebelum menyalin tulisan penting anda.
      </div>
    );
  }
  if (status.loadStatus === 'recovered' && !dismissed) {
    return (
      <div className="banner banner--info" role="status">
        <span>
          Data kemajuan yang disimpan sebelum ini tidak dapat dibaca, jadi aplikasi bermula dengan kemajuan kosong. Salinan data lama disimpan dalam pelayar dan tidak dipadam.
        </span>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setDismissed(true)}>
          Faham
        </button>
      </div>
    );
  }
  return null;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const state = useAppState();
  const course = courseProgress(state);
  const largeText = state.preferences.textSize === 'large';

  useEffect(() => {
    document.documentElement.classList.toggle('text-large', largeText);
  }, [largeText]);

  // Move focus to the page on navigation so screen readers announce the new view.
  useEffect(() => {
    setOpen(false);
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!location.hash) {
      window.scrollTo(0, 0);
      mainRef.current?.focus({ preventScroll: true });
    } else {
      const target = document.getElementById(location.hash.slice(1));
      target?.scrollIntoView();
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    drawer?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="app">
      <a className="skip-link" href="#main" onClick={(e) => (e.preventDefault(), mainRef.current?.focus())}>
        Langkau ke kandungan
      </a>

      <aside className="sidebar" aria-label="Navigasi utama">
        <Brand />
        <nav aria-label="Menu">
          <NavList />
        </nav>
        <SidebarProgress />
      </aside>

      <header className="topbar">
        <button
          ref={menuButton}
          type="button"
          className="topbar__menu"
          aria-expanded={open}
          aria-controls="mobile-drawer"
          onClick={() => setOpen(true)}
        >
          <Menu size={22} aria-hidden />
          <span className="sr-only">Buka menu</span>
        </button>
        <Brand />
        <span className="topbar__progress" aria-label={`Kemajuan kursus ${course.percent} peratus`}>
          {course.percent}%
        </span>
      </header>

      {open && (
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <div
            id="mobile-drawer"
            ref={drawerRef}
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer__head">
              <Brand />
              <button
                type="button"
                className="icon-btn icon-btn--light"
                onClick={() => {
                  setOpen(false);
                  menuButton.current?.focus();
                }}
              >
                <X size={22} aria-hidden />
                <span className="sr-only">Tutup menu</span>
              </button>
            </div>
            <nav aria-label="Menu mudah alih">
              <NavList onNavigate={() => setOpen(false)} />
            </nav>
            <SidebarProgress />
          </div>
        </div>
      )}

      <div className="content">
        <StorageBanner />
        <main id="main" ref={mainRef} tabIndex={-1} className="main">
          {children}
        </main>
        <footer className="footer">
          <p>
            ENGLISH LAB — latihan penulisan bahasa Inggeris. Kandungan asal untuk tujuan pembelajaran; bukan bahan peperiksaan rasmi.
          </p>
        </footer>
      </div>
    </div>
  );
}
