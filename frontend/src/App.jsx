import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import PortalLayout from './components/PortalLayout';
import HomePage from './components/HomePage';

import ProductionDashboard from './portals/production/Dashboard';
import ProductionsModule from './portals/production/ProductionsModule';
import ProductionCalendar from './portals/production/Calendar';
import ProjectDetail from './portals/production/ProjectDetail';
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

import ClientDashboard from './portals/client/Dashboard';
import ClientProjectRequest from './portals/client/ProjectRequest';
import ClientTimeline from './portals/client/Timeline';
import ClientDeliverableCenter from './portals/client/DeliverableCenter';
import ClientMessages from './portals/client/Messages';
import ClientTalentRoster from './portals/client/TalentRoster';
import ClientInvoicesPayments from './portals/client/InvoicesPayments';

import TalentDashboard from './portals/talent/Dashboard';
import TalentProfile from './portals/talent/Profile';
import TalentBookings from './portals/talent/Bookings';
import TalentCalendar from './portals/talent/Calendar';
import TalentRecords from './portals/talent/Records';
import TalentPayments from './portals/talent/Payments';

import CrewDashboard from './portals/crew/Dashboard';
import CrewProfilePage from './portals/crew/Profile';
import CrewCalendar from './portals/crew/Calendar';
import CrewAssignmentsPage from './portals/crew/Assignments';
import CrewReimbursements from './portals/crew/Reimbursements';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

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
        <Route path="requests" element={<Navigate to="/production/projects?tab=requests" replace />} />
        <Route path="requests/:id" element={<ProductionRequestDetail />} />
        <Route path="talent" element={<TalentsModule />} />
        <Route path="talent/:id" element={<TalentDetailPage />} />
        <Route path="performances" element={<Navigate to="/production/talent?tab=records" replace />} />
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
        <Route path="timeline" element={<ClientTimeline />} />
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
        <Route path="calendar" element={<TalentCalendar />} />
        <Route path="records" element={<TalentRecords />} />
        <Route path="payments" element={<TalentPayments />} />
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
        <Route path="reimbursements" element={<CrewReimbursements />} />
      </Route>
    </Routes>
  );
}
