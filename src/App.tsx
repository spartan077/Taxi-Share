import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Matches from './pages/Matches';
import Confirmation from './pages/Confirmation';
import AuthForm from './components/AuthForm';
import { useNotifications } from './lib/useNotifications';
import { supabase } from './lib/supabase';
import AdminDashboard from './components/AdminDashboard';
import CarSelection from './components/CarSelection';
import { Session } from '@supabase/supabase-js';
import Footer from './components/Footer';
import HelpCenter from './pages/HelpCenter';
import PrivacyPolicy from './pages/app_(policies)_privacy-policy_page';
import CancellationPolicy from './pages/app_(policies)_cancellation-policy_page';
import ShippingPolicy from './pages/app_(policies)_shipping-policy_page';
import Terms from './pages/app_(policies)_terms_page';

// Wrapper component to handle location state
function CarSelectionWrapper() {
  const location = useLocation();
  const rideDetails = location.state;

  if (!rideDetails) {
    return <Navigate to="/" replace />;
  }

  return <CarSelection rideDetails={rideDetails} />;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session and set up auth listener
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);

        // Set up auth listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {!session ? (
              <>
                <Route path="/" element={<AuthForm />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/confirmation" element={<Confirmation />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/car-selection" element={<CarSelectionWrapper />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/cancellation-policy" element={<CancellationPolicy />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </main>
        <Footer />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }} 
        />
      </div>
    </Router>
  );
}

export default App;