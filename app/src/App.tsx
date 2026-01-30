import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

// Pages
import Home from '@/pages/Home';
import HowItWorks from '@/pages/HowItWorks';
import SearchPerson from '@/pages/SearchPerson';
import ReportMissing from '@/pages/ReportMissing';
import TrackCase from '@/pages/TrackCase';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import CitizenDashboard from '@/pages/CitizenDashboard';
import PoliceDashboard from '@/pages/PoliceDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import About from '@/pages/About';
import Privacy from '@/pages/Privacy';
import DataUsage from '@/pages/DataUsage';
import Contact from '@/pages/Contact';
import Cases from '@/pages/Cases';
import CaseDetails from '@/pages/CaseDetails';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import ScrollToTop from '@/components/shared/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/cases/:id" element={<CaseDetails />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/search" element={<SearchPerson />} />
        <Route path="/report" element={<ReportMissing />} />
        <Route path="/track" element={<TrackCase />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard/citizen" element={
          <ProtectedRoute allowedRoles={['citizen', 'police', 'admin']}>
            <CitizenDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/police" element={
          <ProtectedRoute allowedRoles={['police', 'admin']}>
            <PoliceDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/data-usage" element={<DataUsage />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Toaster
        position="top-right"
        theme="light"
        richColors
        closeButton
        className="bg-white"
        style={{ background: 'white' }}
      />
    </Router>
  );
}

export default App;
