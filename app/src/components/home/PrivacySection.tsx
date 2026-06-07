import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';

const PrivacySection = () => {
    return (
        <section className="py-20 lg:py-32">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div className="reveal-up">
                        <div className="relative rounded-[18px] overflow-hidden shadow-xl h-[500px]">
                            <img
                                src="/server_room.jpg"
                                alt="Secure data center"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A3E]/40 to-transparent" />
                        </div>
                    </div>

                    <div className="reveal-up">
                        <h2 className="text-3xl lg:text-4xl font-bold text-[#0B1A3E]">
                            Privacy-first by design
                        </h2>
                        <p className="mt-6 text-gray-600 leading-relaxed">
                            Data is encrypted, access is logged, and retention is limited.
                            No data is sold or used for advertising.
                        </p>

                        <div className="mt-8 grid grid-cols-2 gap-4">
                            {[
                                'End-to-end encryption',
                                'Role-based access control',
                                'Automatic data retention limits',
                                'Transparency reports published quarterly',
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100">
                                    <Lock className="w-5 h-5 text-[#1E6BFF] flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-700">{item}</span>
                                </div>
                            ))}
                        </div>

                        <Link
                            to="/privacy"
                            className="inline-flex items-center gap-2 mt-8 text-[#1E6BFF] font-medium hover:underline"
                        >
                            Read our privacy policy
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PrivacySection;
