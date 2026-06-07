import { Phone, Mail, MapPin } from 'lucide-react';

const ContactSection = () => {
    return (
        <section className="py-20 lg:py-32 bg-white">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                    <div className="reveal-up">
                        <h2 className="text-3xl lg:text-4xl font-bold text-[#0B1A3E]">
                            We're here to help
                        </h2>
                        <p className="mt-6 text-gray-600 leading-relaxed">
                            If you need to report a missing person, request access, or ask a
                            question, reach out.
                        </p>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-[#F4F6FA] rounded-xl">
                                <Phone className="w-5 h-5 text-[#1E6BFF]" />
                                <div>
                                    <p className="text-sm text-gray-500">Emergency</p>
                                    <p className="font-medium text-[#0B1A3E]">112</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-[#F4F6FA] rounded-xl">
                                <Phone className="w-5 h-5 text-[#1E6BFF]" />
                                <div>
                                    <p className="text-sm text-gray-500">Support line</p>
                                    <p className="font-medium text-[#0B1A3E]">1800-XXX-XXXX</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-[#F4F6FA] rounded-xl">
                                <Mail className="w-5 h-5 text-[#1E6BFF]" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-[#0B1A3E]">support@pehchaan.gov.in</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-[#F4F6FA] rounded-xl">
                                <MapPin className="w-5 h-5 text-[#1E6BFF]" />
                                <div>
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="font-medium text-[#0B1A3E]">State Police HQ, Capital City</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="reveal-up">
                        <form className="bg-[#F4F6FA] rounded-[18px] p-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Name</label>
                                    <input type="text" className="input-field" placeholder="Your name" />
                                </div>
                                <div>
                                    <label className="label">Email</label>
                                    <input type="email" className="input-field" placeholder="your@email.com" />
                                </div>
                                <div>
                                    <label className="label">Role</label>
                                    <select className="input-field">
                                        <option>Citizen</option>
                                        <option>Law Enforcement</option>
                                        <option>Media</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Message</label>
                                    <textarea className="input-field min-h-[120px]" placeholder="How can we help?" />
                                </div>
                                <button type="button" className="btn-primary w-full">
                                    Send message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
