import AdminLayout from "@/components/AdminLayout";
import StatsCard from "@/components/StatsCard";
import { Users, Shield, Database, Activity } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
const AdminDashboard = () => {
  return (
    <>
    <Navbar />
    <AdminLayout title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Total Cases" value="30" icon={Database} />
        <StatsCard title="Police Officers" value="5" icon={Shield} />
        <StatsCard title="Active Users" value="150" icon={Users} />
        <StatsCard title="System Health" value="98%" icon={Activity} />
      </div>
    </AdminLayout>
    <Footer />
    </>
  );
};

export default AdminDashboard;
