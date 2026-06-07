import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight } from 'lucide-react';

const PressSection = () => {
    return (
        <section id="press" className="py-20 lg:py-32 bg-white">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="text-center max-w-2xl mx-auto mb-16 reveal-up">
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#0B1A3E]">
                        In the news
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                    {[
                        {
                            title: "AI-assisted search must stay human-led",
                            source: "The Civic Tech Journal",
                            date: "Jan 2026",
                        },
                        {
                            title: "Pehchaan expands to 50 new stations",
                            source: "State Broadcast Network",
                            date: "Dec 2025",
                        },
                        {
                            title: "Privacy and progress in public safety tools",
                            source: "Digital Rights Weekly",
                            date: "Nov 2025",
                        },
                    ].map((article, i) => (
                        <div key={i} className="reveal-up group cursor-pointer">
                            <div className="bg-[#F4F6FA] rounded-[18px] p-8 hover:shadow-lg transition-shadow">
                                <Newspaper className="w-8 h-8 text-[#1E6BFF]/50 mb-4" />
                                <h3 className="font-semibold text-[#0B1A3E] group-hover:text-[#1E6BFF] transition-colors">
                                    {article.title}
                                </h3>
                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                    <span>{article.source}</span>
                                    <span>•</span>
                                    <span>{article.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <Link
                        to="/about"
                        className="inline-flex items-center gap-2 text-[#1E6BFF] font-medium hover:underline"
                    >
                        View all press coverage
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default PressSection;
