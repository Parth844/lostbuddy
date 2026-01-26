import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import App from "./App";

// Pages
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Matches from "./pages/Matches";
import Cases from "./pages/Cases";
import CaseDetail from "./pages/CaseDetail";
import ReportMissing from "./pages/ReportMissing";
import ReportFound from "./pages/ReportFound";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMatches from "./pages/AdminMatches";
import AdminCases from "@/pages/AdminCases";

import PoliceLogin from "./pages/PoliceLogin";
import PoliceDashboard from "./pages/PoliceDashboard";

import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      {/* App Layout */}
      <Route path="/" element={<App />}>
        <Route index element={<Index />} />

        {/* Public */}
        <Route path="upload" element={<Upload />} />
        <Route path="matches" element={<Matches />} />
        <Route path="cases" element={<Cases />} />
        <Route path="cases/:id" element={<CaseDetail />} />

        {/* Report */}
        <Route path="report/missing" element={<ReportMissing />} />
        <Route path="report/found" element={<ReportFound />} />
        <Route
          path="report"
          element={<Navigate to="/report/missing" replace />}
        />

        {/* Admin */}
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/matches" element={<AdminMatches />} />
        <Route path="admin/cases" element={<AdminCases />} />

        {/* Police */}
        <Route path="police/login" element={<PoliceLogin />} />
        <Route path="police/dashboard" element={<PoliceDashboard />} />

        {/* Misc */}
        <Route path="notifications" element={<Notifications />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
