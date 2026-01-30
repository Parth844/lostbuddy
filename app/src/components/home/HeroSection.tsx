import { Link } from 'react-router-dom';
import { Search, FileText, Users, Lock } from 'lucide-react';
import { forwardRef } from 'react';

const HeroSection = forwardRef<HTMLDivElement>((_, ref) => {
    return (
        <section ref={ref} className="min-h-screen pt-16 relative overflow-hidden">
            {/* Dot Grid Background */}
            <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />

            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12 lg:py-20">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-12rem)]">
                    {/* Hero Card */}
                    <div className="hero-card bg-white rounded-[18px] border border-gray-100 shadow-xl p-8 lg:p-12 relative z-10">
                        <h1 className="hero-title text-4xl lg:text-5xl xl:text-6xl font-bold text-[#0B1A3E] leading-tight">
                            <span className="inline-block">Identify</span>{' '}
                            <span className="inline-block">with</span>{' '}
                            <span className="inline-block">dignity.</span>
                            <br />
                            <span className="inline-block">Reunite</span>{' '}
                            <span className="inline-block">with</span>{' '}
                            <span className="inline-block">care.</span>
                        </h1>

                        <p className="hero-subtitle mt-6 text-lg text-gray-600 leading-relaxed max-w-lg">
                            Pehchaan uses privacy-first AI to help families and authorities
                            find missing persons—quickly, securely, and with human oversight.
                        </p>

                        <div className="mt-8 space-y-3">
                            <Link
                                to="/search"
                                className="hero-cta inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 bg-[#1E6BFF] text-white font-medium rounded-xl hover:bg-[#1a5fe6] transition-colors"
                            >
                                <Search className="w-5 h-5" />
                                Search a person
                            </Link>
                            <Link
                                to="/report"
                                className="hero-cta inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 border border-gray-200 text-[#0B1A3E] font-medium rounded-xl hover:bg-gray-50 transition-colors ml-0 sm:ml-3"
                            >
                                <FileText className="w-5 h-5" />
                                Report a missing person
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="hero-trust mt-8 pt-6 border-t border-gray-100">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Users className="w-4 h-4 text-[#22C55E]" />
                                    <span>Human verification required</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Lock className="w-4 h-4 text-[#1E6BFF]" />
                                    <span>End-to-end encryption</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image */}
                    <div className="hero-image relative lg:h-[600px] rounded-[18px] overflow-hidden shadow-xl">
                        <img
                            src="/hero_phone_hands.jpg"
                            alt="Person using Pehchaan on mobile"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A3E]/20 to-transparent" />
                    </div>
                </div>
            </div>
        </section>
    );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;
