import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import VerifyEmailPage from './components/VerifyEmailPage';
import ProtectedRoute from './components/ProtectedRoute';
import PortalLayout from './components/PortalLayout';
import HomePage from './components/HomePage';

import ProductionDashboard from './portals/production/Dashboard';
import ProductionsModule from './portals/production/ProductionsModule';
import ProductionCalendar from './portals/production/Calendar';
import ProjectDetail from './portals/production/ProjectDetail';
import ProjectTalentShortlistPage from './portals/production/ProjectTalentShortlistPage';
import ProjectCrewBuilderPage from './portals/production/ProjectCrewBuilderPage';
import TalentsModule from './portals/production/TalentsModule';
import TalentDetailPage from './portals/production/TalentDetailPage';
import CrewPage from './portals/production/CrewPage';
import CrewDetailPage from './portals/production/CrewDetailPage';
import ProductionRequestDetail from './portals/production/RequestDetail';
import ProductionMessages from './portals/production/Messages';
import TalentPaymentAdmin from './portals/production/TalentPaymentAdmin';
import InvoiceManager from './portals/production/InvoiceManager';
import InvoiceDetail from './portals/production/InvoiceDetail';
import RevenueAnalysis from './portals/production/RevenueAnalysis';


import DocumentGenerator from './portals/production/DocumentGenerator';
import ShootPage from './portals/production/ShootPage';

import ClientDashboard from './portals/client/Dashboard';
import ClientProjectRequest from './portals/client/ProjectRequest';
import ClientProduction from './portals/client/Timeline';
import ClientDeliverableCenter from './portals/client/DeliverableCenter';
import ClientMessages from './portals/client/Messages';
import ClientTalentRoster from './portals/client/TalentRoster';
import ClientInvoicesPayments from './portals/client/InvoicesPayments';

import TalentDashboard from './portals/talent/Dashboard';
import TalentProfile from './portals/talent/Profile';
import TalentBookings from './portals/talent/Bookings';
import BookingDetail from './portals/talent/BookingDetail';
import TalentCalendar from './portals/talent/Calendar';
import TalentRecords from './portals/talent/Records';
import TalentPayments from './portals/talent/Payments';
import TalentDocuments from './portals/talent/Documents';

import CrewDashboard from './portals/crew/Dashboard';
import CrewProfilePage from './portals/crew/Profile';
import CrewCalendar from './portals/crew/Calendar';
import CrewAssignmentsPage from './portals/crew/Assignments';
import CrewRecords from './portals/crew/Records';
import CrewReimbursements from './portals/crew/Reimbursements';
import CrewPayments from './portals/crew/Payments';
import CrewDocuments from './portals/crew/Documents';

// ── v2 preview (additive, public, light theme) ──────────────────────────────
import DashboardV2 from './v2/DashboardV2';
import NewProjectV2 from './v2/NewProjectV2';
import ProjectV2 from './v2/ProjectV2';
import CallSheetCreateV2 from './v2/CallSheetCreateV2';
import TalentsV2 from './v2/TalentsV2';
import ShortlistV2 from './v2/ShortlistV2';
import SavedShortlistV2 from './v2/SavedShortlistV2';
import ClientsMessagesV2 from './v2/ClientsMessagesV2';
import TalentsMessagesV2 from './v2/TalentsMessagesV2';
import CrewMessagesV2 from './v2/CrewMessagesV2';
import TalentProfileV2 from './v2/TalentProfileV2';
import TimeLogV2 from './v2/TimeLogV2';

export default function App() {
  const location = useLocation();
  return (
    <>
    <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
    {/* AnimatePresence mode="sync" keeps both exiting and entering routes mounted
        briefly so motion.div with shared layoutId can perform cross-route morph
        (Apple app-launch style). location.pathname as key triggers transitions. */}
    <AnimatePresence mode="sync">
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<HomePage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* v2 preview — public, no auth guard, light shadcn theme */}
      <Route path="/production-v2" element={<DashboardV2 />} />
      <Route path="/production-v2/new-project" element={<NewProjectV2 />} />
      <Route path="/production-v2/project" element={<ProjectV2 />} />
      <Route path="/production-v2/project/call-sheet/new" element={<CallSheetCreateV2 />} />
      <Route path="/production-v2/talents" element={<TalentsV2 />} />
      <Route path="/production-v2/shortlist" element={<ShortlistV2 />} />
      <Route path="/production-v2/saved-shortlist" element={<SavedShortlistV2 />} />
      <Route path="/production-v2/messages/clients" element={<ClientsMessagesV2 />} />
      <Route path="/production-v2/messages/talents" element={<TalentsMessagesV2 />} />
      <Route path="/production-v2/messages/crew" element={<CrewMessagesV2 />} />
      <Route path="/production-v2/talent-profile" element={<TalentProfileV2 />} />
      <Route path="/production-v2/time-log" element={<TimeLogV2 />} />

      {/* Production Portal */}
      <Route path="/production/login" element={<LoginPage portal="production" />} />
      <Route
        path="/production"
        element={
          <ProtectedRoute portal="production">
            <PortalLayout portal="production" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ProductionDashboard />} />
        <Route path="projects" element={<ProductionsModule />} />
        <Route path="calendar" element={<ProductionCalendar />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="projects/:id/talent-shortlist" element={<ProjectTalentShortlistPage />} />
        <Route path="projects/:id/crew-builder" element={<ProjectCrewBuilderPage />} />
        <Route path="projects/:id/shoots/:shootId" element={<ShootPage />} />
        <Route path="requests" element={<Navigate to="/production/projects?tab=requests" replace />} />
        <Route path="requests/:id" element={<ProductionRequestDetail />} />
        <Route path="talent" element={<TalentsModule />} />
        <Route path="talent/:id" element={<TalentDetailPage />} />
        <Route path="performances" element={<Navigate to="/production/talent-payments?tab=production-time-logs" replace />} />
        <Route path="talent-payments" element={<TalentPaymentAdmin />} />
        <Route path="crew" element={<CrewPage />} />
        <Route path="crew/:id" element={<CrewDetailPage />} />
        <Route path="documents" element={<DocumentGenerator />} />
        <Route path="invoices" element={<InvoiceManager />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="payments" element={<Navigate to="/production/invoices" replace />} />
        <Route path="revenue" element={<RevenueAnalysis />} />
        <Route path="messages" element={<ProductionMessages />} />
        <Route path="archive" element={<Navigate to="/production/projects?tab=archived" replace />} />
      </Route>
      {/* AnimatePresence close moved below — keeping route definitions clean */}

      {/* Client Portal */}
      <Route path="/client/login" element={<LoginPage portal="client" />} />
      <Route path="/client/register" element={<RegisterPage portal="client" />} />
      <Route path="/client/forgot-password" element={<ForgotPasswordPage portal="client" />} />
      <Route path="/client/reset-password" element={<ResetPasswordPage portal="client" />} />
      <Route
        path="/client"
        element={
          <ProtectedRoute portal="client">
            <PortalLayout portal="client" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ClientDashboard />} />
        <Route path="request" element={<ClientProjectRequest />} />
        <Route path="production" element={<ClientProduction />} />
        <Route path="timeline" element={<Navigate to="/client/production" replace />} />
        <Route path="deliverables" element={<ClientDeliverableCenter />} />
        <Route path="payments" element={<ClientInvoicesPayments />} />
        <Route path="talent" element={<ClientTalentRoster />} />
        <Route path="messages" element={<ClientMessages />} />
      </Route>

      {/* Talent Portal */}
      <Route path="/talent/login" element={<LoginPage portal="talent" />} />
      <Route path="/talent/register" element={<RegisterPage portal="talent" />} />
      <Route path="/talent/forgot-password" element={<ForgotPasswordPage portal="talent" />} />
      <Route path="/talent/reset-password" element={<ResetPasswordPage portal="talent" />} />
      <Route
        path="/talent"
        element={
          <ProtectedRoute portal="talent">
            <PortalLayout portal="talent" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TalentDashboard />} />
        <Route path="profile" element={<TalentProfile />} />
        <Route path="bookings" element={<TalentBookings />} />
        <Route path="bookings/:id" element={<BookingDetail />} />
        <Route path="calendar" element={<TalentCalendar />} />
        <Route path="records" element={<TalentRecords />} />
        <Route path="payments" element={<TalentPayments />} />
        <Route path="documents" element={<TalentDocuments />} />
      </Route>

      {/* Crew Portal */}
      <Route path="/crew/login" element={<LoginPage portal="crew" />} />
      <Route path="/crew/register" element={<RegisterPage portal="crew" />} />
      <Route path="/crew/forgot-password" element={<ForgotPasswordPage portal="crew" />} />
      <Route path="/crew/reset-password" element={<ResetPasswordPage portal="crew" />} />
      <Route
        path="/crew"
        element={
          <ProtectedRoute portal="crew">
            <PortalLayout portal="crew" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CrewDashboard />} />
        <Route path="profile" element={<CrewProfilePage />} />
        <Route path="calendar" element={<CrewCalendar />} />
        <Route path="assignments" element={<CrewAssignmentsPage />} />
        <Route path="records" element={<CrewRecords />} />
        <Route path="payments" element={<CrewPayments />} />
        <Route path="reimbursements" element={<CrewReimbursements />} />
        <Route path="documents" element={<CrewDocuments />} />
      </Route>
    </Routes>
    </AnimatePresence>
    </>
  );
}
