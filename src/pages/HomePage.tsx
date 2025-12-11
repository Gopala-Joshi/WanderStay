import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { getHeroImageUrl } from '@/lib/utils';
import gsap from 'gsap';

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Hero entrance
      tl.from(heroRef.current, {
        opacity: 0,
        duration: 0.6,
      })
        .from(headlineRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
        }, '-=0.3')
        .from(sublineRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out',
        }, '-=0.5')
        .from(ctaRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out',
        }, '-=0.4');

      // Features stagger
      gsap.from('.feature-card', {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Search,
      title: 'Easy Search',
      description: 'Find perfect hotels across 50+ Indian cities with powerful filters and instant results.',
    },
    {
      icon: DollarSign,
      title: 'Best Prices',
      description: 'Get competitive pricing with insights based on demand, events, and seasonality.',
    },
    {
      icon: TrendingUp,
      title: 'Smart Insights',
      description: 'Understand pricing trends with peak season and event-based analysis.',
    },
    {
      icon: Calendar,
      title: 'Event Calendar',
      description: 'Stay informed about festivals and events that might affect hotel availability.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative h-screen flex items-center justify-center overflow-hidden grain-texture"
      >
        {/* Background Image with Parallax */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${getHeroImageUrl()})`,
            transform: 'scale(1.1)',
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            ref={headlineRef}
            className="font-display text-display-lg sm:text-display-md text-white mb-6 text-balance"
          >
            Discover Your Perfect Stay in{' '}
            <span className="text-gradient-accent">India</span>
          </h1>
          
          <p
            ref={sublineRef}
            className="text-xl sm:text-2xl text-white/90 mb-12 max-w-3xl mx-auto text-balance"
          >
            Book premium hotels across 50+ cities with smart price insights. Find the best deals based on events, seasons, and demand.
          </p>

          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search">
              <Button size="lg" className="btn-premium text-lg px-10 py-6">
                <Search className="w-5 h-5 mr-2" />
                Search Hotels
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              >
                How It Works
              </Button>
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 rounded-full bg-white/70" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={featuresRef} className="py-24 bg-background relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-display-sm mb-4 text-foreground">
              Why Choose <span className="text-gradient">WanderStay</span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Smart hotel booking with data-driven insights for better decisions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-30">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card bg-white dark:bg-card p-8 rounded-2xl card-hover border-2 border-primary-200 dark:border-primary-900/50 shadow-2xl relative z-40 hover:border-primary-400 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/10 to-primary-500/10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-strong p-12 rounded-3xl">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-primary-500" />
            <h2 className="font-display text-display-sm mb-4">
              Ready to Find Your Perfect Stay?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start exploring hotels with smart price insights today
            </p>
            <Link to="/search">
              <Button size="lg" className="btn-premium text-lg px-10 py-6">
                <Search className="w-5 h-5 mr-2" />
                Start Searching
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
