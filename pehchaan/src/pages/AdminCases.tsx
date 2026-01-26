import AdminLayout from "@/components/AdminLayout";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AdminCases = () => {
  return (
    <>
    <Navbar />
    <AdminLayout title="Admin Cases">
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Case management will appear here.
        </p>
      </div>
    </AdminLayout>
    <Footer />
    </>
  );
};

export default AdminCases;
