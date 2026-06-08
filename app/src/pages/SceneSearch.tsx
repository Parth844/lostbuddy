import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload, X, Shield, Lock, Clock, ChevronRight,
  Scan, Database, Users, User, MapPin, RefreshCw,
  AlertCircle, CheckCircle, Camera
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import StatusBadge from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { searchScene, flagPotentialMatch, type SceneFaceMatch, type SearchMatch } from '@/services/api';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

function getConfidencePct(score: number) {
  return Math.round(score * 100);
}

function getStatusFromScore(score: number): 'matched' | 'under-review' | 'no-match' {
  if (score >= 0.80) return 'matched';
  if (score >= 0.60) return 'under-review';
  return 'no-match';
}

interface SelectedFaceDetail {
  face: SceneFaceMatch;
  match: SearchMatch;
}

export default function SceneSearch() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [sceneResult, setSceneResult] = useState<{ faces: SceneFaceMatch[]; imgW: number; imgH: number } | null>(null);
  const [activeFaceIdx, setActiveFaceIdx] = useState<number | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<SelectedFaceDetail | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !sceneResult) return;

    const { faces, imgW, imgH } = sceneResult;
    const dispW = img.clientWidth;
    const dispH = img.clientHeight;
    const scaleX = dispW / imgW;
    const scaleY = dispH / imgH;

    canvas.width = dispW;
    canvas.height = dispH;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, dispW, dispH);

    faces.forEach((face, i) => {
      const color = COLORS[i % COLORS.length];
      const [x1, y1, x2, y2] = face.bbox;
      const sx = x1 * scaleX;
      const sy = y1 * scaleY;
      const sw = (x2 - x1) * scaleX;
      const sh = (y2 - y1) * scaleY;

      const isActive = activeFaceIdx === i;
      const hasMatch = face.matches.length > 0;

      ctx.strokeStyle = isActive ? '#fff' : color;
      ctx.lineWidth = isActive ? 3 : 2;
      ctx.setLineDash(hasMatch ? [] : [6, 3]);
      ctx.strokeRect(sx, sy, sw, sh);

      // Label background
      const label = hasMatch
        ? `Face ${i + 1} · ${getConfidencePct(face.matches[0].score)}%`
        : `Face ${i + 1} · No match`;
      ctx.font = 'bold 12px Inter, sans-serif';
      const textW = ctx.measureText(label).width + 12;
      const labelY = sy > 22 ? sy - 6 : sy + sh + 20;

      ctx.fillStyle = isActive ? '#fff' : color;
      ctx.beginPath();
      ctx.roundRect(sx, labelY - 16, textW, 20, 4);
      ctx.fill();

      ctx.fillStyle = isActive ? color : '#fff';
      ctx.fillText(label, sx + 6, labelY - 2);
    });
  }, [sceneResult, activeFaceIdx]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  useEffect(() => {
    const obs = new ResizeObserver(drawOverlay);
    if (imgRef.current) obs.observe(imgRef.current);
    return () => obs.disconnect();
  }, [drawOverlay]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error('File size should be less than 20MB'); return; }
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setSceneResult(null);
      setActiveFaceIdx(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const startScan = async () => {
    if (!uploadedFile) { toast.error('Please upload a photo first'); return; }
    setIsScanning(true);
    setScanProgress(0);
    setSceneResult(null);
    setActiveFaceIdx(null);

    try {
      const interval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 8, 85));
      }, 250);

      const res = await searchScene(uploadedFile);
      clearInterval(interval);
      setScanProgress(100);

      setSceneResult({ faces: res.faces, imgW: res.image_width, imgH: res.image_height });

      const matched = res.faces.filter(f => f.matches.length > 0).length;
      if (res.faces.length === 0) {
        toast.info(res.message || 'No faces detected in image');
      } else if (matched > 0) {
        toast.success(`Detected ${res.faces.length} face(s) — ${matched} matched in database`);
      } else {
        toast.info(`Detected ${res.faces.length} face(s) — no database matches found`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const clearUpload = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setSceneResult(null);
    setScanProgress(0);
    setActiveFaceIdx(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFlagMatch = async () => {
    if (!selectedDetail || !uploadedFile) return;
    try {
      await flagPotentialMatch(selectedDetail.match.FinalPersonId, uploadedFile);
      toast.success('Potential match flagged and reported to authorities.');
      setSelectedDetail(null);
    } catch {
      toast.error('Failed to flag match. Please try again.');
    }
  };

  const matchedFaces = sceneResult?.faces.filter(f => f.matches.length > 0) ?? [];
  const unmatchedFaces = sceneResult?.faces.filter(f => f.matches.length === 0) ?? [];

  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
            <Link to="/" className="hover:text-blue-500">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/search" className="hover:text-blue-500">Search Person</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900">Scene / CCTV Search</span>
          </nav>

          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold uppercase tracking-wide mb-4">
                <Camera className="w-3.5 h-3.5" />
                Multi-Face Scene Search
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
                Search a Crowd or CCTV Frame
              </h1>
              <p className="mt-3 text-slate-500 max-w-xl mx-auto">
                Upload any photo with multiple people. Our AI detects every face and
                searches each one independently against the missing persons database.
              </p>
            </div>

            {/* Upload / Image panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.06)] p-6 mb-6">
              {!uploadedImage ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
                  <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Drop a scene photo here</h3>
                  <p className="text-slate-500 text-sm mb-1">crowd photo, CCTV frame, or any group image</p>
                  <p className="text-xs text-slate-400">JPG, PNG up to 20MB</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Uploaded Image</span>
                    <button onClick={clearUpload} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700 transition-colors">
                      <X className="w-4 h-4" /> Clear
                    </button>
                  </div>

                  {/* Image + canvas overlay */}
                  <div className="relative rounded-xl overflow-hidden bg-slate-900">
                    <img
                      ref={imgRef}
                      src={uploadedImage}
                      alt="Scene"
                      className="w-full max-h-[500px] object-contain"
                      onLoad={drawOverlay}
                    />
                    {sceneResult && (
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      />
                    )}
                  </div>

                  {!isScanning && !sceneResult && (
                    <div className="mt-5 flex justify-center">
                      <Button
                        onClick={startScan}
                        className="px-8 py-5 bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-600/30 shadow-sm text-white font-medium rounded-xl text-base"
                      >
                        <Scan className="w-5 h-5 mr-2" />
                        Scan All Faces
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Scanning progress */}
              {isScanning && (
                <div className="mt-6 text-center">
                  <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Detecting all faces…</h3>
                  <p className="text-slate-500 text-sm mb-5">AI is scanning every person in the scene</p>
                  <div className="max-w-sm mx-auto">
                    <Progress value={scanProgress} className="h-2" />
                    <p className="mt-2 text-xs text-slate-400">{scanProgress}% complete</p>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Detecting faces</span>
                    <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5" />Searching database</span>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy strip */}
            <div className="flex flex-wrap items-center justify-center gap-5 mb-10 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-blue-500" />Encrypted upload</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-500" />Human verification required</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" />Data auto-deleted after 30 days</span>
            </div>

            {/* Results */}
            {sceneResult && (
              <div className="space-y-6">
                {/* Summary bar */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Scene Analysis Complete
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {sceneResult.faces.length} face{sceneResult.faces.length !== 1 ? 's' : ''} detected &nbsp;·&nbsp;
                      {matchedFaces.length} matched in database
                    </p>
                  </div>
                  <Button variant="outline" onClick={clearUpload} className="flex items-center gap-2 text-sm">
                    <RefreshCw className="w-4 h-4" /> New Scan
                  </Button>
                </div>

                {/* Face stat chips */}
                <div className="flex flex-wrap gap-3">
                  {sceneResult.faces.map((face, i) => {
                    const color = COLORS[i % COLORS.length];
                    const hasMatch = face.matches.length > 0;
                    return (
                      <button
                        key={i}
                        onClick={() => setActiveFaceIdx(activeFaceIdx === i ? null : i)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                          activeFaceIdx === i
                            ? 'shadow-md scale-105'
                            : 'hover:scale-105'
                        }`}
                        style={{
                          borderColor: color,
                          background: activeFaceIdx === i ? color : `${color}18`,
                          color: activeFaceIdx === i ? '#fff' : color,
                        }}
                      >
                        <User className="w-3.5 h-3.5" />
                        Face {i + 1}
                        {hasMatch && <CheckCircle className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>

                {sceneResult.faces.length === 0 && (
                  <div className="bg-slate-50 rounded-xl p-8 text-center text-slate-500">
                    No faces were detected. Try a clearer image with visible faces.
                  </div>
                )}

                {/* Warning */}
                {matchedFaces.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      <strong>Important:</strong> These are AI-generated potential matches and require
                      human verification by authorized officers before any action is taken.
                    </p>
                  </div>
                )}

                {/* Matched faces */}
                {matchedFaces.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                      Matched Faces ({matchedFaces.length})
                    </h3>
                    <div className="space-y-4">
                      {matchedFaces.map((face) => {
                        const color = COLORS[face.face_index % COLORS.length];
                        return (
                          <div
                            key={face.face_index}
                            className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(15,23,42,0.06)] overflow-hidden"
                          >
                            {/* Face header */}
                            <div
                              className="flex items-center gap-3 px-5 py-3 border-b border-slate-100"
                              style={{ borderLeftColor: color, borderLeftWidth: 4 }}
                            >
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ background: color }}
                              >
                                {face.face_index + 1}
                              </div>
                              <span className="font-semibold text-slate-900">Face {face.face_index + 1}</span>
                              <span className="text-xs text-slate-400">{face.matches.length} match{face.matches.length !== 1 ? 'es' : ''} found</span>
                            </div>

                            {/* Matches */}
                            <div className="divide-y divide-slate-100/80">
                              {face.matches.map((match) => (
                                <div
                                  key={match.FinalPersonId}
                                  className="flex flex-col sm:flex-row gap-4 p-5 hover:bg-slate-50/60 cursor-pointer transition-colors"
                                  onClick={() => setSelectedDetail({ face, match })}
                                >
                                  <div className="w-20 h-20 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
                                    {match.image_file ? (
                                      <img
                                        src={`/uploads/${match.image_file}`}
                                        alt={match.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-8 h-8 text-slate-300" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                      <div>
                                        <h4 className="font-bold text-slate-900">{match.name}</h4>
                                        <p className="text-sm text-slate-500">
                                          {new Date().getFullYear() - match.birth_year} yrs · {match.sex}
                                        </p>
                                      </div>
                                      <StatusBadge status={getStatusFromScore(match.score)} />
                                    </div>

                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {match.district}, {match.state}
                                      </span>
                                    </div>

                                    {/* Confidence bar */}
                                    <div>
                                      <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-slate-400">Match confidence</span>
                                        <span className={`font-bold ${match.score >= 0.80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                          {getConfidencePct(match.score)}%
                                        </span>
                                      </div>
                                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${match.score >= 0.80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                          style={{ width: `${getConfidencePct(match.score)}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Unmatched faces */}
                {unmatchedFaces.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                      Unmatched Faces ({unmatchedFaces.length})
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {unmatchedFaces.map((face) => {
                        const color = COLORS[face.face_index % COLORS.length];
                        return (
                          <div
                            key={face.face_index}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm text-slate-500"
                            style={{ borderColor: `${color}40`, background: `${color}0a` }}
                          >
                            <User className="w-4 h-4" style={{ color }} />
                            Face {face.face_index + 1} — not in database
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match detail dialog */}
      <Dialog open={!!selectedDetail} onOpenChange={() => setSelectedDetail(null)}>
        <DialogContent className="max-w-lg !bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Match Details
              {selectedDetail && <StatusBadge status={getStatusFromScore(selectedDetail.match.score)} size="sm" />}
            </DialogTitle>
            <DialogDescription>Review before flagging to authorities</DialogDescription>
          </DialogHeader>

          {selectedDetail && (
            <div className="space-y-5 mt-2">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  {selectedDetail.match.image_file ? (
                    <img
                      src={`/uploads/${selectedDetail.match.image_file}`}
                      alt={selectedDetail.match.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{selectedDetail.match.name}</h3>
                  <p className="text-slate-500 text-sm">
                    {new Date().getFullYear() - selectedDetail.match.birth_year} yrs · {selectedDetail.match.sex}
                  </p>
                  <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedDetail.match.district}, {selectedDetail.match.state}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 rounded-xl p-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Case ID</p>
                  <p className="font-mono font-medium text-slate-900">{selectedDetail.match.FinalPersonId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Police Station</p>
                  <p className="font-medium text-slate-900">{selectedDetail.match.police_station}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Detected as</p>
                  <p className="font-medium text-slate-900">Face {selectedDetail.face.face_index + 1}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Confidence</p>
                  <p className={`font-bold ${selectedDetail.match.score >= 0.80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {getConfidencePct(selectedDetail.match.score)}%
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                <strong>Next Steps:</strong> If this looks like a valid match, flag it so officers can verify.
                Do not contact the family directly.
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-600/30 shadow-sm text-white"
                  onClick={handleFlagMatch}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Flag as Potential Match
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setSelectedDetail(null)}>
                  Dismiss
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
