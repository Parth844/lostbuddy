import { Building2 } from 'lucide-react';

const PartnersSection = () => {
    return (
        <section id="partners" className="py-20 lg:py-32">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="text-center max-w-2xl mx-auto mb-12 reveal-up">
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#0B1A3E]">
                        Built with leading institutions
                    </h2>
                    <p className="mt-4 text-gray-600">
                        Developed in collaboration with law enforcement, academic researchers,
                        and civil liberties experts.
                    </p>
                </div>

                <div className="reveal-up flex flex-wrap justify-center items-center gap-8 lg:gap-16">
                    {[
                        'State Police HQ',
                        'Cyber Forensics Institute',
                        'Civic Aid Foundation',
                        'University AI Ethics Lab',
                        'National Legal Aid',
                    ].map((partner, i) => (
                        <div key={i} className="flex items-center gap-2 text-gray-400 hover:text-[#0B1A3E] transition-colors">
                            <Building2 className="w-5 h-5" />
                            <span className="font-medium">{partner}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PartnersSection;
