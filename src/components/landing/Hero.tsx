import { Button } from '@/components/ui/button';
import { ArrowRight, Rocket, Users, TrendingUp, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-subtle" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      
      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 animate-fade-in">
            <Rocket className="w-4 h-4" />
            <span className="text-sm font-medium">Building the future of startups</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-slide-up">
            Connect{' '}
            <span className="text-gradient">Founders, Investors,</span>
            <br />
            <span className="text-gradient">Mentors & Developers</span>
            <br />
            in One Platform
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            The all-in-one ecosystem where startup dreams meet the right people. 
            Find mentors, attract investors, build your team, and scale your vision.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline-hero" size="xl" asChild>
              <Link to="/auth?mode=login">
                Sign In
              </Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {[
              { icon: Users, label: 'Founders', value: '2,500+' },
              { icon: TrendingUp, label: 'Investors', value: '500+' },
              { icon: Rocket, label: 'Startups', value: '1,200+' },
              { icon: Code, label: 'Developers', value: '3,000+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50 shadow-sm">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
