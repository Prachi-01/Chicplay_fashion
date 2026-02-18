import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import DressingRoom from './pages/DressingRoom';
import GameZone from './pages/GameZone';
import FashionBingo from './pages/games/FashionBingo';
import StyleChallenge from './pages/games/StyleChallenge';
import SpinWheel from './pages/games/SpinWheel';
import Dresses from './pages/Dresses';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import Mannequin3DDemo from './pages/Mannequin3DDemo';
import VendorRegister from './pages/VendorRegister';
import VendorDashboard from './pages/VendorDashboard';
import VendorStatus from './pages/VendorStatus';
import VendorRoute from './components/auth/VendorRoute';
import ProductDetail from './pages/ProductDetail';
import Orders from './pages/Orders';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import SizeGuide from './pages/SizeGuide';
import StyleQuiz from './pages/StyleQuiz';
import ArchetypesPage from './pages/ArchetypesPage';
import TrendsPage from './pages/TrendsPage';
import BlogPage from './pages/BlogPage';

import { MobileBottomNav, Breadcrumbs, ScrollToTop } from './components/navigation';
import TozyChatbot from './components/chatbot/TozyChatbot';
import './components/navigation/Navigation.css';
import './App.css'

function App() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/vendor/dashboard');

  // Handle ESC key globally
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        // Close any open modals by dispatching custom event
        window.dispatchEvent(new CustomEvent('escapePressed'));
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  return (
    <div className="app-container">
      <ScrollToTop />
      <Toaster position="top-center" reverseOrder={false} />
      {!isDashboard && <Header />}
      {!isDashboard && <Breadcrumbs />}
      <main className={isDashboard ? "dashboard-content" : "main-content"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/dresses" element={<Dresses />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="/quiz" element={<StyleQuiz />} />
          <Route path="/archetypes" element={<ArchetypesPage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/blog" element={<BlogPage />} />

          {/* Protected Routes */}
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/dressing-room" element={
            <ProtectedRoute>
              <DressingRoom />
            </ProtectedRoute>
          } />
          <Route path="/game-zone" element={
            <ProtectedRoute>
              <GameZone />
            </ProtectedRoute>
          } />
          <Route path="/game-zone/bingo" element={
            <ProtectedRoute>
              <FashionBingo />
            </ProtectedRoute>
          } />
          <Route path="/game-zone/challenge" element={
            <ProtectedRoute>
              <StyleChallenge />
            </ProtectedRoute>
          } />
          <Route path="/game-zone/spin" element={
            <ProtectedRoute>
              <SpinWheel />
            </ProtectedRoute>
          } />

          {/* Admin Route - Requires Admin Role */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* Vendor Routes */}
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/vendor/status" element={
            <VendorRoute>
              <VendorStatus />
            </VendorRoute>
          } />
          <Route path="/vendor/dashboard" element={
            <VendorRoute>
              <VendorDashboard />
            </VendorRoute>
          } />

          {/* 3D Mannequin Demo */}
          <Route path="/mannequin-3d" element={<Mannequin3DDemo />} />


        </Routes>
      </main>

      {!isDashboard && <Footer />}

      {/* Mobile Bottom Navigation - Always visible on mobile EXCEPT dashboards */}
      {!isDashboard && <MobileBottomNav />}
      <TozyChatbot />
    </div>
  )
}

export default App;
