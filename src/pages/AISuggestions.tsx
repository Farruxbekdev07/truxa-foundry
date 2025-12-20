import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Lightbulb,
  TrendingUp,
  Groups,
  Analytics,
  AutoAwesome,
  RocketLaunch,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { supabase } from '@/integrations/supabase/client';

interface Suggestions {
  productMarketFit: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
  growthStrategy: {
    immediateActions: string[];
    longTermGoals: string[];
  };
  marketInsights: {
    opportunities: string[];
    challenges: string[];
    competitiveAdvantage: string;
  };
  teamAndResources: {
    currentNeeds: string[];
    recommendations: string[];
  };
  overallSummary: string;
}

const AISuggestions = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [startupName, setStartupName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && profile?.role === 'founder') {
      fetchSuggestions();
    } else if (user && profile && profile.role !== 'founder') {
      setError('AI Suggestions are only available for founders.');
      setLoading(false);
    }
  }, [user, profile]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke('ai-suggestions');

      if (fnError) {
        console.error('Function error:', fnError);
        setError('Failed to generate suggestions. Please try again.');
        return;
      }

      if (data?.error) {
        if (data.error === 'No startup found') {
          setError('Please complete your startup profile first to get AI suggestions.');
        } else {
          setError(data.error);
        }
        return;
      }

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
        setStartupName(data.startup || '');
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !profile) return null;

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <AutoAwesome sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              AI Suggestions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Personalized insights for {startupName || 'your startup'}
            </Typography>
          </Box>
        </Box>

        {loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }} color="text.secondary">
              Analyzing your startup profile...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Our AI is generating personalized suggestions
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="warning" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {suggestions && (
          <Box sx={{ display: 'grid', gap: 3 }}>
            {/* Overall Summary */}
            <Paper sx={{ p: 3, background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.05))' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <RocketLaunch sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Executive Summary
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {suggestions.overallSummary}
              </Typography>
            </Paper>

            {/* Product-Market Fit */}
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Analytics sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Product-Market Fit
                </Typography>
                <Chip
                  label={`Score: ${suggestions.productMarketFit.score}/10`}
                  color={suggestions.productMarketFit.score >= 7 ? 'success' : suggestions.productMarketFit.score >= 4 ? 'warning' : 'error'}
                  size="small"
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={suggestions.productMarketFit.score * 10}
                  sx={{ height: 8, borderRadius: 4, mb: 2 }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle fontSize="small" color="success" /> Strengths
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {suggestions.productMarketFit.strengths.map((item, idx) => (
                      <Typography component="li" key={idx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Lightbulb fontSize="small" color="warning" /> Areas to Improve
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {suggestions.productMarketFit.improvements.map((item, idx) => (
                      <Typography component="li" key={idx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Growth Strategy */}
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <TrendingUp sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Growth Strategy
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    🎯 Immediate Actions (Next 30 Days)
                  </Typography>
                  {suggestions.growthStrategy.immediateActions.map((action, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 1, bgcolor: 'background.default' }}>
                      <Typography variant="body2">{action}</Typography>
                    </Paper>
                  ))}
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    🚀 Long-Term Goals (6-12 Months)
                  </Typography>
                  {suggestions.growthStrategy.longTermGoals.map((goal, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 1, bgcolor: 'background.default' }}>
                      <Typography variant="body2">{goal}</Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Paper>

            {/* Market Insights */}
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Lightbulb sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Market Insights
                </Typography>
              </Box>

              <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                  💡 Your Competitive Advantage
                </Typography>
                <Typography variant="body2">
                  {suggestions.marketInsights.competitiveAdvantage}
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle fontSize="small" color="success" /> Opportunities
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {suggestions.marketInsights.opportunities.map((item, idx) => (
                      <Typography component="li" key={idx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning fontSize="small" color="warning" /> Challenges to Address
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {suggestions.marketInsights.challenges.map((item, idx) => (
                      <Typography component="li" key={idx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* Team & Resources */}
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Groups sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">
                  Team & Resources
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    📋 Current Needs
                  </Typography>
                  {suggestions.teamAndResources.currentNeeds.map((need, idx) => (
                    <Chip
                      key={idx}
                      label={need}
                      variant="outlined"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
                    👥 Recommendations
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {suggestions.teamAndResources.recommendations.map((rec, idx) => (
                      <Typography component="li" key={idx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {rec}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default AISuggestions;
