import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

// Page Sections
import HeroSection from '@/components/home/HeroSection';
import HowItWorksSection from '@/components/home/HowItWorksSection';
import TechnologySection from '@/components/home/TechnologySection';
import ForAuthoritiesSection from '@/components/home/ForAuthoritiesSection';
import DashboardPreviewSection from '@/components/home/DashboardPreviewSection';
import PrivacySection from '@/components/home/PrivacySection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import StatsSection from '@/components/home/StatsSection';
import PressSection from '@/components/home/PressSection';
import PartnersSection from '@/components/home/PartnersSection';
import ContactSection from '@/components/home/ContactSection';
import FinalCtaSection from '@/components/home/FinalCtaSection';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animation
      const heroTl = gsap.timeline();
      heroTl
        .from('.hero-card', { x: '-12vw', opacity: 0, scale: 0.98, duration: 1, ease: 'power2.out' })
        .from('.hero-image', { x: '12vw', opacity: 0, scale: 0.98, duration: 1, ease: 'power2.out' }, 0.15)
        .from('.hero-title span', { y: 24, opacity: 0, duration: 0.6, stagger: 0.03, ease: 'power2.out' }, 0.35)
        .from('.hero-subtitle', { y: 16, opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.55)
        .from('.hero-cta', { y: 16, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out' }, 0.65)
        .from('.hero-trust', { y: 16, opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.75);

      // How It Works Scroll Animation
      ScrollTrigger.create({
        trigger: howItWorksRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.from('.hiw-title', { y: -30, opacity: 0, duration: 0.8, ease: 'power2.out' });
          gsap.from('.hiw-card', {
            y: 60,
            opacity: 0,
            scale: 0.96,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.out',
            delay: 0.2
          });
        },
        once: true
      });

      // Dashboard Preview Animation
      ScrollTrigger.create({
        trigger: dashboardRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.from('.dashboard-title', { y: -30, opacity: 0, duration: 0.8, ease: 'power2.out' });
          gsap.from('.dashboard-card-preview', {
            y: 70,
            opacity: 0,
            scale: 0.94,
            duration: 1,
            ease: 'power2.out',
            delay: 0.2
          });
        },
        once: true
      });

      // Final CTA Animation
      ScrollTrigger.create({
        trigger: finalCtaRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.from('.final-title', { y: -30, opacity: 0, duration: 0.8, ease: 'power2.out' });
          gsap.from('.final-cta-card', {
            y: 70,
            opacity: 0,
            scale: 0.96,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out',
            delay: 0.2
          });
        },
        once: true
      });

      // General Scroll Reveals
      gsap.utils.toArray<HTMLElement>('.reveal-up').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out'
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <Navbar />

      <HeroSection ref={heroRef} />
      <HowItWorksSection ref={howItWorksRef} />
      <TechnologySection />
      <ForAuthoritiesSection />
      <DashboardPreviewSection ref={dashboardRef} />
      <PrivacySection />
      <TestimonialsSection />
      <StatsSection />
      <PressSection />
      <PartnersSection />
      <ContactSection />
      <FinalCtaSection ref={finalCtaRef} />

      <Footer />
    </div>
  );
}
