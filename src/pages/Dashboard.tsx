import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Rocket, 
  TrendingUp, 
  GraduationCap, 
  Code, 
  LogOut, 
  Plus, 
  Users,
  LayoutDashboard,
  Briefcase,
  User,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Startup {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  stage: string | null;
  looking_for_team: boolean;
  looking_for_mentorship: boolean;
  looking_for_funding: boolean;
  rating: number;
  founder_id: string;
  profiles?: {
    full_name: string;
  };
}

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loadingStartups, setLoadingStartups] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStartups();
    }
  }, [user, profile]);

  const fetchStartups = async () => {
    setLoadingStartups(true);
    let query = supabase
      .from('startups')
      .select('*, profiles(full_name)');
    
    if (profile?.role === 'founder') {
      query = query.eq('founder_id', user?.id);
    } else if (profile?.role === 'developer') {
      query = query.eq('looking_for_team', true);
    } else if (profile?.role === 'mentor') {
      query = query.eq('looking_for_mentorship', true);
    } else if (profile?.role === 'investor') {
      query = query.eq('looking_for_funding', true);
    }
    
    const { data } = await query.order('created_at', { ascending: false });
    setStartups((data as Startup[]) || []);
    setLoadingStartups(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const getRoleIcon = () => {
    switch (profile.role) {
      case 'founder': return Rocket;
      case 'investor': return TrendingUp;
      case 'mentor': return GraduationCap;
      case 'developer': return Code;
      default: return User;
    }
  };

  const getRoleColor = () => {
    switch (profile.role) {
      case 'founder': return 'founder';
      case 'investor': return 'investor';
      case 'mentor': return 'mentor';
      case 'developer': return 'developer';
      default: return 'primary';
    }
  };

  const getDashboardTitle = () => {
    switch (profile.role) {
      case 'founder': return 'Your Startups';
      case 'investor': return 'Investment Opportunities';
      case 'mentor': return 'Startups Seeking Guidance';
      case 'developer': return 'Startups Hiring';
      default: return 'Dashboard';
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 hidden lg:flex flex-col">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-hero flex items-center justify-center">
            <Rocket className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">StartupHub</span>
        </Link>
        
        <nav className="flex-1 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Briefcase className="w-5 h-5" />
            Startups
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Users className="w-5 h-5" />
            Network
          </Link>
        </nav>
        
        <div className="pt-6 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `hsl(var(--${getRoleColor()}) / 0.15)` }}
            >
              <RoleIcon 
                className="w-5 h-5"
                style={{ color: `hsl(var(--${getRoleColor()}))` }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{profile.full_name}</div>
              <div className="text-sm text-muted-foreground capitalize">{profile.role}</div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>
      
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border px-4 flex items-center justify-between z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
            <Rocket className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">StartupHub</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="w-5 h-5" />
        </Button>
      </header>
      
      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 p-6 lg:p-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">
              Welcome back, {profile.full_name.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening in the ecosystem today.
            </p>
          </div>
          {profile.role === 'founder' && (
            <Button variant="hero">
              <Plus className="w-5 h-5" />
              Add Startup
            </Button>
          )}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Startups', value: startups.length, icon: Rocket },
            { label: 'Looking for Team', value: startups.filter(s => s.looking_for_team).length, icon: Users },
            { label: 'Seeking Funding', value: startups.filter(s => s.looking_for_funding).length, icon: TrendingUp },
            { label: 'Need Mentorship', value: startups.filter(s => s.looking_for_mentorship).length, icon: GraduationCap },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <stat.icon className="w-5 h-5 text-primary mb-3" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Content */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">{getDashboardTitle()}</h2>
          </div>
          
          {loadingStartups ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            </div>
          ) : startups.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No startups yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {profile.role === 'founder' 
                  ? 'Create your first startup to get started and connect with investors and mentors.'
                  : 'Check back later for new opportunities in the ecosystem.'}
              </p>
              {profile.role === 'founder' && (
                <Button variant="hero">
                  <Plus className="w-5 h-5" />
                  Create Startup
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {startups.map((startup) => (
                <div key={startup.id} className="p-6 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{startup.name}</h3>
                      {startup.description && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {startup.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {startup.industry && (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
                            {startup.industry}
                          </span>
                        )}
                        {startup.stage && (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                            {startup.stage}
                          </span>
                        )}
                        {startup.looking_for_team && (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-developer/15 text-developer">
                            Hiring
                          </span>
                        )}
                        {startup.looking_for_funding && (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-investor/15 text-investor">
                            Seeking Funding
                          </span>
                        )}
                        {startup.looking_for_mentorship && (
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-mentor/15 text-mentor">
                            Needs Mentorship
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-sm font-medium">Rating</div>
                        <div className="text-2xl font-bold text-primary">{startup.rating.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
