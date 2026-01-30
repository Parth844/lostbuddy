import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCaseById, type Case } from '@/services/api';
import {
    MapPin, User, Phone,
    ArrowLeft, Share2, Printer, AlertTriangle
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
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E6BFF]"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !caseData) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold text-[#0B1A3E] mb-2">Case Not Found</h1>
                    <p className="text-gray-500 mb-6">{error || "The requested case could not be found."}</p>
                    <Link to="/cases">
                        <Button>Back to Cases</Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const getStatusColor = (status?: string) => {
        if (!status) return "bg-gray-100 text-gray-800";
        const s = status.toLowerCase();
        if (s.includes('untraced')) return "bg-red-100 text-red-800 border-red-200";
        if (s.includes('traced') || s.includes('matched')) return "bg-green-100 text-green-800 border-green-200";
        return "bg-blue-100 text-blue-800 border-blue-200";
    };

    const formattedDate = (dateStr?: string) => {
        if (!dateStr || dateStr === 'Unknown') return 'Unknown';
        const date = new Date(dateStr);
        return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Unknown';
    };

    return (
        <div className="min-h-screen bg-[#F4F6FA] flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">
                <Link to="/cases" className="inline-flex items-center text-gray-500 hover:text-[#1E6BFF] mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to all cases
                </Link>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid lg:grid-cols-3 gap-0">

                        {/* Image Section */}
                        <div className="lg:col-span-1 bg-gray-50 p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
                            <div className="relative w-full max-w-[300px] aspect-square rounded-2xl overflow-hidden shadow-md mb-6">
                                <img
                                    src={caseData.photo_url || "/placeholder.jpg"}
                                    alt={caseData.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                                    }}
                                />
                            </div>
                            <Badge className={`px-4 py-1.5 text-sm font-semibold border ${getStatusColor(caseData.status)}`}>
                                {caseData.status?.toUpperCase() || "UNKNOWN"}
                            </Badge>
                        </div>

                        {/* Details Section */}
                        <div className="lg:col-span-2 p-8">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                                <div>
                                    <h1 className="text-3xl font-bold text-[#0B1A3E] mb-2">{caseData.name}</h1>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <User className="w-4 h-4" />
                                            {caseData.age ? `${caseData.age} years old` : 'Age unknown'}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <User className="w-4 h-4" />
                                            {caseData.gender}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Share2 className="w-4 h-4" />
                                        Share
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </Button>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Details</h3>
                                        <dl className="space-y-3 text-sm">
                                            <div className="flex justify-between border-b border-gray-50 pb-2">
                                                <dt className="text-gray-500">Full Name</dt>
                                                <dd className="font-medium text-[#0B1A3E]">{caseData.name}</dd>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-50 pb-2">
                                                <dt className="text-gray-500">Date of Birth</dt>
                                                <dd className="font-medium text-[#0B1A3E]">{caseData.birth_year ? `Year ${caseData.birth_year}` : 'Unknown'}</dd>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-50 pb-2">
                                                <dt className="text-gray-500">Last Seen Date</dt>
                                                <dd className="font-medium text-[#0B1A3E]">{formattedDate(caseData.last_seen_date)}</dd>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-50 pb-2">
                                                <dt className="text-gray-500">Reported Date</dt>
                                                <dd className="font-medium text-[#0B1A3E]">{formattedDate(caseData.reported_date)}</dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Location</h3>
                                        <div className="bg-[#F8F9FC] rounded-xl p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-5 h-5 text-[#1E6BFF] mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-[#0B1A3E]">{caseData.last_seen_location}</p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        District: {caseData.district}<br />
                                                        State: {caseData.state}<br />
                                                        Police Station: {caseData.police_station}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Description</h3>
                                        <div className="text-gray-600 text-sm leading-relaxed">
                                            {caseData.description || "No description provided."}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Contact Authorities</h3>
                                        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                            <p className="text-xs text-red-600 font-medium mb-3 uppercase">If seen, please contact:</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-[#0B1A3E]">
                                                    <Phone className="w-4 h-4 text-red-500" />
                                                    <span className="font-medium">100 (Police Control Room)</span>
                                                </div>
                                                {caseData.police_station && (
                                                    <div className="flex items-center gap-2 text-sm text-[#0B1A3E]">
                                                        <Building2 className="w-4 h-4 text-red-500" />
                                                        <span>{caseData.police_station} Station</span>
                                                    </div>
                                                )}
                                            </div>
                                            <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white">
                                                Report Sighting
                                            </Button>
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

// Helper component
import { Building2 } from 'lucide-react';
