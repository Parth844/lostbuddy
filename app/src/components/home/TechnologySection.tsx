import { Scan, Database, FileCheck, BarChart3, CheckCircle } from 'lucide-react';

const TechnologySection = () => {
    return (
        <section id="technology" className="py-20 lg:py-32">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div className="reveal-up">
                        <h2 className="text-3xl lg:text-4xl font-bold text-[#0B1A3E]">
                            Built for accuracy and trust
                        </h2>
                        <p className="mt-6 text-gray-600 leading-relaxed">
                            Pehchaan uses modern face recognition with strict fairness checks,
                            audit logging, and human-in-the-loop decisions.
                        </p>

                        <div className="mt-8 space-y-4">
                            {[
                                { icon: Scan, text: 'Face recognition with liveness detection' },
                                { icon: Database, text: 'Cross-database search in seconds' },
                                { icon: FileCheck, text: 'Audit logs for every action' },
                                { icon: BarChart3, text: 'Bias testing & ongoing model review' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
                                    <div className="w-10 h-10 rounded-lg bg-[#1E6BFF]/10 flex items-center justify-center flex-shrink-0">
                                        <item.icon className="w-5 h-5 text-[#1E6BFF]" />
                                    </div>
                                    <span className="font-medium text-[#0B1A3E]">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="reveal-up lg:pl-8">
                        <div className="bg-white rounded-[18px] border border-gray-100 p-8 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="space-y-4">
                                <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                                <div className="h-3 bg-gray-100 rounded-full w-full" />
                                <div className="h-3 bg-gray-100 rounded-full w-5/6" />
                                <div className="h-3 bg-[#1E6BFF]/20 rounded-full w-1/2" />
                            </div>
                            <div className="mt-8 p-4 bg-[#F4F6FA] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-[#22C55E]/20 flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-[#22C55E]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#0B1A3E]">Model Accuracy</p>
                                        <p className="text-2xl font-bold text-[#22C55E]">99.2%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TechnologySection;
