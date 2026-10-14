import { Loader2 } from 'lucide-react';
import ChildDashboard from './components/ChildDashboard';
import LoginScreen from './components/LoginScreen';
import ParentDashboard from './components/ParentDashboard';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return session.type === 'parent' ? <ParentDashboard /> : <ChildDashboard />;
}