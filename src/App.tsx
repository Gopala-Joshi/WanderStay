import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomePage from '@/pages/HomePage';
import SearchPage from '@/pages/SearchPage';
import HotelDetailPage from '@/pages/HotelDetailPage';
import DashboardPage from '@/pages/DashboardPage';
import AdminPage from '@/pages/AdminPage';
import AuthPage from '@/pages/AuthPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/hotel/:id" element={<HotelDetailPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
