import { Link } from 'react-router-dom';
import { Upload, Scan, CheckCircle, ChevronRight } from 'lucide-react';
import { forwardRef } from 'react';

const HowItWorksSection = forwardRef<HTMLDivElement>((_, ref) => {
    return (
        <section ref={ref} className="py-20 lg:py-32 relative">
            <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 relative">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="hiw-title text-3xl lg:text-4xl font-bold text-[#0B1A3E]">
                        How Pehchaan works
                    </h2>
                    <p className="mt-4 text-gray-600">
                        Three steps. Human oversight at every stage.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                    {/* Step 1 */}
                    <div className="hiw-card bg-white rounded-[18px] border border-gray-100 p-8 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 rounded-xl bg-[#1E6BFF]/10 flex items-center justify-center mb-6">
                            <Upload className="w-8 h-8 text-[#1E6BFF]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#0B1A3E] mb-3">1. Upload</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Submit a photo and basic details. The system accepts mobile uploads
                            and station kiosks.
                        </p>
                        <Link to="/how-it-works" className="inline-flex items-center gap-1 mt-4 text-[#1E6BFF] text-sm font-medium hover:gap-2 transition-all">
                            Learn more <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Step 2 */}
                    <div className="hiw-card bg-white rounded-[18px] border border-gray-100 p-8 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 rounded-xl bg-[#1E6BFF]/10 flex items-center justify-center mb-6">
                            <Scan className="w-8 h-8 text-[#1E6BFF]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#0B1A3E] mb-3">2. Analyze</h3>
                        <p className="text-gray-600 leading-relaxed">
                            AI extracts features and searches across registered cases and
                            public appeals.
                        </p>
                        <Link to="/how-it-works" className="inline-flex items-center gap-1 mt-4 text-[#1E6BFF] text-sm font-medium hover:gap-2 transition-all">
                            Learn more <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Step 3 */}
                    <div className="hiw-card bg-white rounded-[18px] border border-gray-100 p-8 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 rounded-xl bg-[#1E6BFF]/10 flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8 text-[#1E6BFF]" />
                        </div>
                        <h3 className="text-xl font-bold text-[#0B1A3E] mb-3">3. Match & Verify</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Potential matches are reviewed by authorities before any contact
                            is made.
                        </p>
                        <Link to="/how-it-works" className="inline-flex items-center gap-1 mt-4 text-[#1E6BFF] text-sm font-medium hover:gap-2 transition-all">
                            Learn more <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
});

HowItWorksSection.displayName = 'HowItWorksSection';

export default HowItWorksSection;
