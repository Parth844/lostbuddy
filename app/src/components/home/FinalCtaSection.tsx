import { Link } from 'react-router-dom';
import { Search, FileText, ArrowRight } from 'lucide-react';
import { forwardRef } from 'react';

const FinalCtaSection = forwardRef<HTMLDivElement>((_, ref) => {
    return (
        <section ref={ref} className="py-20 lg:py-32 bg-[#0B1A3E] relative overflow-hidden">
            {/* Grain Overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
            />

            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 relative">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="final-title text-3xl lg:text-5xl font-bold text-white">
                        One photo can bring someone home.
                    </h2>
                    <p className="mt-6 text-lg text-white/70">
                        If you believe you've seen a missing person, upload a photo.
                        If someone is missing, report it now.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
                    {/* Search Card */}
                    <div className="final-cta-card bg-white rounded-[18px] p-8">
                        <div className="w-14 h-14 rounded-xl bg-[#1E6BFF]/10 flex items-center justify-center mb-6">
                            <Search className="w-7 h-7 text-[#1E6BFF]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#0B1A3E] mb-2">Search a person</h3>
                        <p className="text-gray-600 mb-6">
                            Upload a photo to check for potential matches.
                        </p>
                        <Link
                            to="/search"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E6BFF] text-white font-medium rounded-xl hover:bg-[#1a5fe6] transition-colors"
                        >
                            Start search
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Report Card */}
                    <div className="final-cta-card bg-white rounded-[18px] p-8">
                        <div className="w-14 h-14 rounded-xl bg-[#0B1A3E]/10 flex items-center justify-center mb-6">
                            <FileText className="w-7 h-7 text-[#0B1A3E]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#0B1A3E] mb-2">Report a missing person</h3>
                        <p className="text-gray-600 mb-6">
                            Create a case and alert connected stations.
                        </p>
                        <Link
                            to="/report"
                            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#0B1A3E] text-[#0B1A3E] font-medium rounded-xl hover:bg-[#0B1A3E] hover:text-white transition-colors"
                        >
                            Start report
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
});

FinalCtaSection.displayName = 'FinalCtaSection';

export default FinalCtaSection;
