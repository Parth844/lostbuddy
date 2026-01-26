import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CaseCard from "@/components/CaseCard";
import SearchFilters from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const Cases = () => {
  const [casesData, setCasesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ PAGINATION
  const [page, setPage] = useState(1);
  const limit = 100;

  // ✅ FILTERS
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("All States");
  const [ageRange, setAgeRange] = useState([0, 100]);

  const [total, setTotal] = useState(0);

  // ==============================
  // FETCH CASES
  // ==============================
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });

        if (statusFilter !== "all") params.append("status", statusFilter);
        if (stateFilter !== "All States") params.append("state", stateFilter);
        if (genderFilter !== "all") params.append("gender", genderFilter);
        if (searchTerm.trim()) params.append("search", searchTerm.trim());

        const res = await fetch(`${BASE_URL}/cases?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch cases");

        const json = await res.json();
        setTotal(json.total || 0);
        const rawCases = Array.isArray(json?.data) ? json.data : [];

        const normalizedCases = rawCases.map((item: any) => {
          const birthYear = item.birth_year;
          const age = birthYear
            ? new Date().getFullYear() - birthYear
            : undefined;

          return {
            id: item.final_person_id,
            name: item.name,
            gender: item.sex,
            city: item.district,
            state: item.state,
            status: item.tracing_status,
            age,
            date_of_birth: birthYear ? `01-01-${birthYear}` : "Unknown",
            photo: item.image_file
              ? `${BASE_URL}/uploads/${item.image_file}`
              : "/placeholder.jpg",
          };
        });

        setCasesData(normalizedCases);
      } catch (err) {
        console.error(err);
        setCasesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, [page, statusFilter, stateFilter, genderFilter, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Browse Cases
            </h1>
            <p className="text-muted-foreground">
              Explore missing and found person records
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">Loading cases...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <SearchFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  genderFilter={genderFilter}
                  setGenderFilter={setGenderFilter}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  stateFilter={stateFilter}
                  setStateFilter={setStateFilter}
                  ageRange={ageRange}
                  setAgeRange={setAgeRange}
                />
              </div>

              <div className="lg:col-span-3">
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {casesData.length} cases
                </div>

                {casesData.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg">
                    No matching cases found
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {casesData.map((caseItem) => (
                        <CaseCard key={caseItem.id} {...caseItem} />
                      ))}
                    </div>

                    {/* ✅ PAGINATION CONTROLS */}
                    <div className="flex justify-center gap-2 mt-8">
                      {Array.from({ length: Math.ceil(total / limit) }).map(
                        (_, i) => (
                          <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`px-3 py-1 rounded ${
                              page === i + 1
                                ? "bg-primary text-white"
                                : "border hover:bg-muted"
                            }`}
                          >
                            {i + 1}
                          </button>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cases;
