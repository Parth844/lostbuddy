
const StatsSection = () => {
    return (
        <section className="py-20 lg:py-32">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div className="reveal-up">
                        <h2 className="text-3xl lg:text-4xl font-bold text-[#0B1A3E]">
                            Reaching communities statewide
                        </h2>

                        <div className="mt-10 grid grid-cols-2 gap-6">
                            {[
                                { value: '12,400+', label: 'Cases registered' },
                                { value: '8,200+', label: 'Matches reviewed' },
                                { value: '180+', label: 'Connected stations' },
                                { value: '<2 min', label: 'Average search time' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
                                    <p className="text-3xl lg:text-4xl font-bold text-[#0B1A3E]">{stat.value}</p>
                                    <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="reveal-up">
                        <div className="relative rounded-[18px] overflow-hidden shadow-xl h-[400px]">
                            <img
                                src="/abstract_map.jpg"
                                alt="Coverage map"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
