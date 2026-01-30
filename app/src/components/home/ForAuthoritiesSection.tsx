import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const ForAuthoritiesSection = () => {
    return (
        <section id="authorities" className="py-20 lg:py-32">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div className="reveal-up order-2 lg:order-1">
                        <div className="relative rounded-[18px] overflow-hidden shadow-xl h-[500px]">
                            <img
                                src="/officer_workstation.jpg"
                                alt="Officer using Pehchaan system"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A3E]/40 to-transparent" />
                        </div>
                    </div>

                    <div className="reveal-up order-1 lg:order-2">
                        <h2 className="text-3xl lg:text-4xl font-bold text-[#0B1A3E]">
                            A secure partner for law enforcement
                        </h2>
                        <p className="mt-6 text-gray-600 leading-relaxed">
                            Officers get clear match proposals, case timelines, and one-click
                            reporting—without noise.
                        </p>

                        <ul className="mt-8 space-y-4">
                            {[
                                'Role-based access & approvals',
                                'Case timelines with attachments',
                                'Export-ready reports for courts',
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                                    </div>
                                    <span className="text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-[#1E6BFF] text-white font-medium rounded-xl hover:bg-[#1a5fe6] transition-colors"
                        >
                            Request a station demo
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ForAuthoritiesSection;
