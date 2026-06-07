import { Search } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { forwardRef } from 'react';

const DashboardPreviewSection = forwardRef<HTMLDivElement>((_, ref) => {
    return (
        <section ref={ref} className="py-20 lg:py-32 relative">
            <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 relative">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="dashboard-title text-3xl lg:text-4xl font-bold text-[#0B1A3E]">
                        Track every case with clarity
                    </h2>
                    <p className="mt-4 text-gray-600">
                        From first report to final resolution—one timeline, one source of truth.
                    </p>
                </div>

                <div className="dashboard-card-preview bg-white rounded-[18px] border border-gray-100 shadow-xl overflow-hidden">
                    {/* Mock Dashboard Header */}
                    <div className="border-b border-gray-100 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-amber-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="flex gap-2">
                                {['All cases', 'Matches', 'Pending'].map((tab, i) => (
                                    <button
                                        key={tab}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-lg ${i === 0 ? 'bg-[#1E6BFF] text-white' : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-48 h-9 bg-gray-100 rounded-lg" />
                            <div className="w-9 h-9 bg-[#1E6BFF] rounded-lg flex items-center justify-center">
                                <Search className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Mock Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    {['Case ID', 'Name', 'Date', 'Status'].map((col) => (
                                        <th key={col} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[
                                    { id: 'PEH-2026-001', name: 'Rahul Sharma', date: 'Jan 28, 2026', status: 'under-review' },
                                    { id: 'PEH-2026-002', name: 'Priya Patel', date: 'Jan 27, 2026', status: 'matched' },
                                    { id: 'PEH-2026-003', name: 'Amit Kumar', date: 'Jan 26, 2026', status: 'verified' },
                                    { id: 'PEH-2026-004', name: 'Sneha Gupta', date: 'Jan 25, 2026', status: 'closed' },
                                ].map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-mono text-gray-600">{row.id}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-[#0B1A3E]">{row.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{row.date}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={row.status as any} size="sm" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
});

DashboardPreviewSection.displayName = 'DashboardPreviewSection';

export default DashboardPreviewSection;
