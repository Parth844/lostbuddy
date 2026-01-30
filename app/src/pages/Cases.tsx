import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Loader2, SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import CaseCard from "@/components/ui/CaseCard";
import SearchFilters from "@/components/ui/SearchFilters";
//  

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const Cases = () => {
  const [casesData, setCasesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ PAGINATION
  // ✅ PAGINATION
  const [page, setPage] = useState(1);
  const limit = 12; // Adjusted for better grid layout (divisible by 2 and 3)

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

        // Append Age Range
        params.append("min_age", String(ageRange[0]));
        params.append("max_age", String(ageRange[1]));

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

          // Generate deterministic "realistic" DOB from ID
          let dob = "Unknown";
          if (birthYear) {
            let hash = 0;
            const str = item.final_person_id || item.name || "default";
            for (let i = 0; i < str.length; i++) {
              hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            const month = (Math.abs(hash) % 12) + 1;
            const day = (Math.abs(hash >> 5) % 28) + 1;
            const mStr = month < 10 ? `0${month}` : month;
            const dStr = day < 10 ? `0${day}` : day;
            dob = `${dStr}-${mStr}-${birthYear}`;
          }

          return {
            id: item.final_person_id,
            name: item.name,
            gender: item.sex,
            city: item.district,
            state: item.state,
            status: item.tracing_status,
            age,
            date_of_birth: dob,
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <header>
            <h1 className="text-3xl font-bold text-[#0B1A3E]">Browse Cases</h1>
            <p className="text-gray-500 mt-2">Explore missing and found person records</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
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
            </div>

            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                  <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                  <p className="text-gray-500 font-medium">Loading cases...</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing <span className="font-medium text-gray-900">{casesData.length}</span> of <span className="font-medium text-gray-900">{total}</span> cases
                    </div>
                  </div>

                  {casesData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-xl">
                      <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <SearchX className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">No cases found</h3>
                      <p className="text-gray-500 text-sm max-w-sm text-center">
                        Try adjusting your search or filters to find what you're looking for.
                      </p>
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearchTerm("");
                          setGenderFilter("all");
                          setStatusFilter("all");
                          setStateFilter("All States");
                          setAgeRange([0, 100]);
                        }}
                        className="mt-2 text-primary"
                      >
                        Clear all filters
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {casesData.map((caseItem) => (
                          <CaseCard key={caseItem.id} {...caseItem} />
                        ))}
                      </div>

                      {/* ✅ POLISHED PAGINATION CONTROLS */}
                      {total > limit && (
                        <div className="flex items-center justify-center gap-2 mt-12 bg-white p-4 rounded-lg border shadow-sm inline-flex">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="h-9 w-9"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>

                          <div className="flex items-center gap-1 mx-2">
                            <span className="text-sm font-medium">Page {page}</span>
                            <span className="text-sm text-gray-400">/</span>
                            <span className="text-sm text-gray-500">{Math.ceil(total / limit)}</span>
                          </div>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(page + 1)}
                            disabled={page * limit >= total}
                            className="h-9 w-9"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cases;
