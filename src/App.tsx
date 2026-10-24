import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { useAppState } from './state/StoreContext';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Curriculum } from './pages/Curriculum';
import { LessonRoom } from './pages/LessonRoom';
import { WritingStudio } from './pages/WritingStudio';
import { WritingTask } from './pages/WritingTask';
import { WritingReview } from './pages/WritingReview';
import { VocabularyLab } from './pages/VocabularyLab';
import { GrammarGym } from './pages/GrammarGym';
import { ExamArena } from './pages/ExamArena';
import { ExamResults } from './pages/ExamResults';
import { ProgressPage } from './pages/ProgressPage';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

function Home() {
  const state = useAppState();
  return state.onboarded ? <Dashboard /> : <Navigate to="/welcome" replace />;
}

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<Onboarding />} />
        <Route path="/curriculum" element={<Curriculum />} />
        <Route path="/lesson/:lessonId" element={<LessonRoom />} />
        <Route path="/writing" element={<WritingStudio />} />
        <Route path="/writing/:promptId" element={<WritingTask />} />
        <Route path="/writing/:promptId/review/:submissionId" element={<WritingReview />} />
        <Route path="/vocabulary" element={<VocabularyLab />} />
        <Route path="/grammar" element={<GrammarGym />} />
        <Route path="/exam" element={<ExamArena />} />
        <Route path="/exam/:examId" element={<ExamResults />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}
