import { Button } from '@/components/ui/button';
import { Rocket, TrendingUp, GraduationCap, Code, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const roles = [
  {
    icon: Rocket,
    title: 'Founders',
    color: 'founder',
    description: 'Showcase your startup, find co-founders, and connect with investors and mentors who believe in your vision.',
    features: ['Create startup profiles', 'Connect with investors', 'Find mentors'],
  },
  {
    icon: TrendingUp,
    title: 'Investors',
    color: 'investor',
    description: 'Discover promising startups, access detailed metrics, and connect directly with founders.',
    features: ['Browse startups', 'View ratings & metrics', 'Direct founder access'],
  },
  {
    icon: GraduationCap,
    title: 'Mentors',
    color: 'mentor',
    description: 'Share your expertise, guide the next generation of entrepreneurs, and give back to the ecosystem.',
    features: ['Mentor matching', 'Startup guidance', 'Build your legacy'],
  },
  {
    icon: Code,
    title: 'Developers',
    color: 'developer',
    description: 'Join innovative startups, work on cutting-edge projects, and grow your career in the startup world.',
    features: ['Find startup jobs', 'Join early-stage teams', 'Equity opportunities'],
  },
];

export function RoleCards() {
  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Built for{' '}
            <span className="text-gradient">Every Role</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you're building, investing, mentoring, or coding — there's a place for you here.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {roles.map((role) => (
            <div
              key={role.title}
              className="group relative p-8 rounded-2xl bg-card border border-border/50 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}
                style={{ backgroundColor: `hsl(var(--${role.color}) / 0.15)` }}
              >
                <role.icon 
                  className="w-7 h-7"
                  style={{ color: `hsl(var(--${role.color}))` }}
                />
              </div>
              
              <h3 className="text-2xl font-bold mb-3">{role.title}</h3>
              <p className="text-muted-foreground mb-6">{role.description}</p>
              
              <ul className="space-y-2 mb-6">
                {role.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: `hsl(var(--${role.color}))` }}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <Button variant="ghost" className="group-hover:translate-x-1 transition-transform" asChild>
                <Link to={`/auth?role=${role.title.toLowerCase().slice(0, -1)}`}>
                  Join as {role.title.slice(0, -1)}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
