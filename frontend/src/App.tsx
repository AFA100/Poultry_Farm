import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProvincesPage from "@/pages/ProvincesPage";
import FarmsPage from "@/pages/FarmsPage";
import EmployeesPage from "@/pages/EmployeesPage";
import ChickensPage from "@/pages/ChickensPage";
import FeedPage from "@/pages/FeedPage";
import FinancePage from "@/pages/FinancePage";
import ReportsPage from "@/pages/ReportsPage";
import MainLayout from "@/layouts/MainLayout";
import ProtectedRoute from "@/routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/provinces" element={<ProvincesPage />} />
            <Route path="/farms" element={<FarmsPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/chickens" element={<ChickensPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
