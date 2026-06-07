import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { getCaseById, type Case } from '@/services/api';
import {
    MapPin, User, Phone, Building2,
    ArrowLeft, Share2, Printer, AlertTriangle,
    Calendar
} from 'lucide-react';

export default function CaseDetails() {
    const { id } = useParams<{ id: string }>();
    const [caseData, setCaseData] = useState<Case | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCase = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await getCaseById(id);
                setCaseData(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load case details. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchCase();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#F7F8FC]">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div className="min-h-screen flex flex-col bg-[#F7F8FC]">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4 border border-red-100">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Case Not Found</h1>
                    <p className="text-slate-500 mb-6 text-sm">{error || "The requested case could not be found."}</p>
                    <Link to="/cases">
                        <Button className="bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-600/30">Back to Cases</Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const getStatusStyle = (status?: string) => {
        if (!status) return { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
        const s = status.toLowerCase();
        if (s.includes('untraced') || s.includes('missing'))
            return { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
        if (s.includes('traced') || s.includes('matched'))
            return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
        return { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' };
    };

    const formattedDate = (dateStr?: string) => {
        if (!dateStr || dateStr === 'Unknown') return 'Unknown';
        const date = new Date(dateStr);
        return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Unknown';
    };

    const st = getStatusStyle(caseData.status);

    return (
        <div className="min-h-screen bg-[#F7F8FC] flex flex-col">
            <Navbar />

            <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-10">
                <div className="max-w-5xl mx-auto">
                    {/* Back link */}
                    <Link to="/cases" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Back to all cases
                    </Link>

                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.07)] overflow-hidden">
                        <div className="grid lg:grid-cols-3 gap-0">

                            {/* Left: Photo + status */}
                            <div className="lg:col-span-1 bg-slate-50/60 p-8 flex flex-col items-center justify-start border-b lg:border-b-0 lg:border-r border-slate-100">
                                <div className="relative w-full max-w-[260px] aspect-square rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(15,23,42,0.12)] mb-5">
                                    <img
                                        src={caseData.photo_url || "/placeholder.jpg"}
                                        alt={caseData.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                                        }}
                                    />
                                </div>
                                <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold border ${st.bg} ${st.text} border-current/10`}>
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
                                    {caseData.status?.toUpperCase() || 'UNKNOWN'}
                                </span>

                                {/* Quick share/print row */}
                                <div className="flex gap-2 mt-5">
                                    <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-600">
                                        <Share2 className="w-4 h-4" />
                                        Share
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-600" onClick={() => window.print()}>
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </Button>
                                </div>
                            </div>

                            {/* Right: Details */}
                            <div className="lg:col-span-2 p-8">
                                {/* Name + meta */}
                                <div className="mb-7">
                                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">{caseData.name}</h1>
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                        {caseData.age && (
                                            <span className="flex items-center gap-1.5">
                                                <User className="w-4 h-4 text-slate-400" />
                                                {caseData.age} years old
                                            </span>
                                        )}
                                        {caseData.gender && (
                                            <span className="flex items-center gap-1.5">
                                                <User className="w-4 h-4 text-slate-400" />
                                                {caseData.gender}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-7">
                                    {/* Left column */}
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Case Details</p>
                                            <dl className="space-y-2.5">
                                                {[
                                                    { label: 'Full Name', value: caseData.name },
                                                    { label: 'Date of Birth', value: caseData.birth_year ? `Year ${caseData.birth_year}` : 'Unknown' },
                                                    { label: 'Last Seen', value: formattedDate(caseData.last_seen_date) },
                                                    { label: 'Reported', value: formattedDate(caseData.reported_date) },
                                                ].map(({ label, value }) => (
                                                    <div key={label} className="flex justify-between items-baseline border-b border-slate-50 pb-2.5">
                                                        <dt className="text-sm text-slate-400">{label}</dt>
                                                        <dd className="text-sm font-semibold text-slate-900">{value}</dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Location</p>
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                    <div className="text-sm">
                                                        <p className="font-semibold text-slate-900">{caseData.last_seen_location}</p>
                                                        <p className="text-slate-500 mt-1 space-y-0.5">
                                                            <span className="block">District: {caseData.district}</span>
                                                            <span className="block">State: {caseData.state}</span>
                                                            <span className="block">Police Station: {caseData.police_station}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right column */}
                                    <div className="space-y-6">
                                        {caseData.description && (
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Description</p>
                                                <p className="text-sm text-slate-600 leading-relaxed">{caseData.description}</p>
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Contact Authorities</p>
                                            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                                <p className="text-[11px] text-red-600 font-semibold uppercase tracking-wide mb-3">If seen, please contact:</p>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm text-slate-900">
                                                        <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                        <span className="font-semibold">100 (Police Control Room)</span>
                                                    </div>
                                                    {caseData.police_station && (
                                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                                            <Building2 className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                            <span>{caseData.police_station} Station</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <button className="w-full mt-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-b from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 border border-red-600/30 shadow-[0_1px_3px_rgba(220,38,38,0.3)] transition-all">
                                                    Report Sighting
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
