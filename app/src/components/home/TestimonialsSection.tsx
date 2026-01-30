import { Quote } from 'lucide-react';

const TestimonialsSection = () => {
    return (
        <section className="py-20 lg:py-32 bg-white">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="text-center max-w-2xl mx-auto mb-16 reveal-up">
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#0B1A3E]">
                        Trusted by those who protect
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                    {[
                        {
                            quote: "Pehchaan reduced our initial search time significantly while keeping the process accountable.",
                            name: "Inspector R. Mehta",
                            role: "State Police HQ",
                        },
                        {
                            quote: "The system is calm, clear, and respectful—exactly what families need.",
                            name: "Dr. A. Pillai",
                            role: "Crisis Response NGO",
                        },
                        {
                            quote: "Audit logs and approvals make it easy to present matches in court.",
                            name: "Advocate S. Kaur",
                            role: "Legal Aid Cell",
                        },
                    ].map((testimonial, i) => (
                        <div key={i} className="reveal-up bg-[#F4F6FA] rounded-[18px] p-8">
                            <Quote className="w-8 h-8 text-[#1E6BFF]/30 mb-4" />
                            <p className="text-gray-700 leading-relaxed mb-6">
                                "{testimonial.quote}"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#1E6BFF]/10 flex items-center justify-center">
                                    <span className="text-[#1E6BFF] font-semibold">
                                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-[#0B1A3E]">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
