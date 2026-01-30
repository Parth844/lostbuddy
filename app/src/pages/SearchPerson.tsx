import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, X, Shield, Lock, AlertCircle, 
  CheckCircle, Clock, User, ChevronRight, Scan,
  Eye, ArrowRight, RefreshCw, Phone, Database
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import StatusBadge from '@/components/shared/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { searchFace, type SearchMatch } from '@/services/api';

export default function SearchPerson() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [results, setResults] = useState<SearchMatch[] | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<SearchMatch | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setResults(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const startSearch = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a photo first');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setResults(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 10, 80));
      }, 200);

      // Search face
      const searchResponse = await searchFace(uploadedFile);
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setResults(searchResponse.results);
      
      if (searchResponse.results.length > 0) {
        toast.success(`Found ${searchResponse.results.length} potential match(es)`);
      } else {
        toast.info('No matches found. Try uploading a clearer photo.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Search failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const clearUpload = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setResults(null);
    setScanProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusFromScore = (score: number): 'matched' | 'under-review' | 'no-match' => {
    if (score >= 0.80) return 'matched';
    if (score >= 0.60) return 'under-review';
    return 'no-match';
  };

  const getConfidencePercentage = (score: number): number => {
    return Math.round(score * 100);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <Navbar />
      
      <div className="pt-24 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-[#1E6BFF]">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#0B1A3E]">Search Person</span>
          </nav>

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0B1A3E]">
                Search for a Missing Person
              </h1>
              <p className="mt-4 text-gray-600">
                Upload a photo to check for potential matches in our database. 
                All searches are encrypted and logged.
              </p>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-[18px] border border-gray-100 shadow-lg p-8 mb-8">
              {!uploadedImage ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`upload-zone cursor-pointer ${isDragging ? 'dragover' : ''}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <div className="w-20 h-20 rounded-2xl bg-[#1E6BFF]/10 flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-10 h-10 text-[#1E6BFF]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#0B1A3E] mb-2">
                    Drag and drop a photo
                  </h3>
                  <p className="text-gray-500 mb-4">
                    or click to browse from your device
                  </p>
                  <p className="text-sm text-gray-400">
                    Supports JPG, PNG up to 10MB
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={clearUpload}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={uploadedImage}
                      alt="Uploaded photo"
                      className="w-full max-h-[400px] object-contain bg-gray-50"
                    />
                  </div>
                  
                  {!isScanning && !results && (
                    <div className="mt-6 flex justify-center">
                      <Button
                        onClick={startSearch}
                        className="px-8 py-6 bg-[#1E6BFF] text-white font-medium rounded-xl hover:bg-[#1a5fe6] text-lg"
                      >
                        <Scan className="w-5 h-5 mr-2" />
                        Start Search
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Scanning State */}
              {isScanning && (
                <div className="mt-8 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-[#1E6BFF]/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Scan className="w-10 h-10 text-[#1E6BFF]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#0B1A3E] mb-2">
                    Analyzing photo...
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Our AI is searching across all registered cases
                  </p>
                  <div className="max-w-md mx-auto">
                    <Progress value={scanProgress} className="h-2" />
                    <p className="mt-2 text-sm text-gray-500">
                      {Math.round(scanProgress)}% complete
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Searching databases...
                    </span>
                    <span className="flex items-center gap-2">
                      <Scan className="w-4 h-4" />
                      Extracting features...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#1E6BFF]" />
                <span>Encrypted upload</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#22C55E]" />
                <span>Human verification required</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Data auto-deleted after 30 days</span>
              </div>
            </div>

            {/* Results Section */}
            {results && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#0B1A3E]">
                    Potential Matches ({results.length})
                  </h2>
                  <Button
                    variant="outline"
                    onClick={clearUpload}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New Search
                  </Button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800">
                      <strong>Important:</strong> These are AI-generated potential matches. 
                      All matches require human verification by authorized officers before 
                      any contact is made. Confidence scores indicate similarity, not certainty.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {results.map((match) => (
                    <div
                      key={match.FinalPersonId}
                      className="bg-white rounded-[18px] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedMatch(match)}
                    >
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Photo Placeholder */}
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {match.image_file ? (
                            <img 
                              src={`/uploads/${match.image_file}`} 
                              alt={match.name} 
                              className="w-full h-full object-cover rounded-xl" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <User className="w-12 h-12 text-gray-300" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-bold text-[#0B1A3E]">{match.name}</h3>
                              <p className="text-gray-500">
                                {new Date().getFullYear() - match.birth_year} years • {match.sex}
                              </p>
                            </div>
                            <StatusBadge status={getStatusFromScore(match.score)} />
                          </div>

                          <div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                            <p><strong>Case ID:</strong> {match.FinalPersonId}</p>
                            <p><strong>Status:</strong> {match.tracing_status}</p>
                            <p className="sm:col-span-2"><strong>Location:</strong> {match.district}, {match.state}</p>
                            <p className="sm:col-span-2"><strong>Police Station:</strong> {match.police_station}</p>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Match Confidence</span>
                              <span className={`font-bold ${
                                match.score >= 0.80 ? 'text-green-600' :
                                match.score >= 0.60 ? 'text-amber-600' : 'text-gray-600'
                              }`}>
                                {getConfidencePercentage(match.score)}%
                              </span>
                            </div>
                            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  match.score >= 0.80 ? 'bg-green-500' :
                                  match.score >= 0.60 ? 'bg-amber-500' : 'bg-gray-400'
                                }`}
                                style={{ width: `${getConfidencePercentage(match.score)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex items-center">
                          <Button variant="ghost" className="text-[#1E6BFF]">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* No Match Option */}
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-gray-600 mb-4">
                    Don't see a match? You can report this sighting to help with future searches.
                  </p>
                  <Link to="/report">
                    <Button variant="outline" className="flex items-center gap-2 mx-auto">
                      Report a Sighting
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match Detail Dialog */}
      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Case Details</DialogTitle>
            <DialogDescription>
              Review the case information carefully. Contact authorities if you have relevant information.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMatch && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center">
                  {selectedMatch.image_file ? (
                    <img 
                      src={`/uploads/${selectedMatch.image_file}`} 
                      alt={selectedMatch.name} 
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-300" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0B1A3E]">{selectedMatch.name}</h3>
                  <p className="text-gray-500">
                    {new Date().getFullYear() - selectedMatch.birth_year} years • {selectedMatch.sex}
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={getStatusFromScore(selectedMatch.score)} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-sm text-gray-500">Case ID</p>
                  <p className="font-mono text-[#0B1A3E]">{selectedMatch.FinalPersonId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-[#0B1A3E]">{selectedMatch.tracing_status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">State</p>
                  <p className="text-[#0B1A3E]">{selectedMatch.state}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">District</p>
                  <p className="text-[#0B1A3E]">{selectedMatch.district}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Police Station</p>
                  <p className="text-[#0B1A3E]">{selectedMatch.police_station}</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>Next Steps:</strong> If you believe this is a valid match, 
                  please contact the nearest police station or call our support line. 
                  Do not attempt to contact the family directly.
                </p>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-[#1E6BFF]">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Potential Match
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
