import { Link } from 'react-router-dom';
import { Search, FileText, ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { forwardRef } from 'react';

const HeroSection = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <section ref={ref} className="min-h-screen pt-16 relative overflow-hidden bg-[#F7F8FC]">
      {/* Background layers */}
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-blue-100/60 to-transparent rounded-full -translate-y-1/4 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-radial from-indigo-100/40 to-transparent rounded-full translate-y-1/4 -translate-x-1/4 pointer-events-none" />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-12rem)]">

          {/* Left: Hero Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_32px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)] p-8 lg:p-12 relative">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              AI-powered missing person search
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-[54px] font-bold text-slate-900 leading-[1.1] tracking-tight">
              Identify with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                dignity.
              </span>
              Reunite with care.
            </h1>

            <p className="mt-5 text-[16px] text-slate-500 leading-relaxed max-w-md">
              Pehchaan uses privacy-first AI to help families and authorities
              find missing persons — quickly, securely, and with human oversight.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-[14px] bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-[0_1px_4px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] border border-blue-600/30 transition-all duration-150 hover:shadow-[0_4px_12px_rgba(37,99,235,0.4)] hover:-translate-y-px"
              >
                <Search className="w-4 h-4" />
                Search a person
              </Link>
              <Link
                to="/report"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-slate-700 text-[14px] bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-[0_1px_3px_rgba(15,23,42,0.06)] transition-all duration-150 group"
              >
                <FileText className="w-4 h-4" />
                Report missing person
                <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>

            {/* Trust row */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-5">
              <div className="flex items-center gap-2 text-[13px] text-slate-500">
                <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                Human verification required
              </div>
              <div className="flex items-center gap-2 text-[13px] text-slate-500">
                <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                </div>
                End-to-end encrypted
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative lg:h-[600px] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
            <img
              src="/hero_phone_hands.jpg"
              alt="Person using Pehchaan on mobile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />

            {/* Floating stat chip */}
            <div className="absolute bottom-6 left-6 right-6 flex gap-3">
              <div className="flex-1 glass rounded-xl px-4 py-3">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Cases Tracked</p>
                <p className="text-2xl font-bold text-slate-900 font-['Sora'] mt-0.5">12,400+</p>
              </div>
              <div className="flex-1 glass rounded-xl px-4 py-3">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Reunited</p>
                <p className="text-2xl font-bold text-slate-900 font-['Sora'] mt-0.5">8,200+</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
export default HeroSection;
