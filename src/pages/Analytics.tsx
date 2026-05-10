import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  TrendingUp,
  Users,
  Eye,
  DollarSign,
  Briefcase,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/lib/firebase/compat";
import { useAuth } from "@/lib/auth";

interface AnalyticsData {
  totalStartups: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalMessages: number;
  totalHiringRequests: number;
}

export default function Analytics() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");
  const [data, setData] = useState<AnalyticsData>({
    totalStartups: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalMessages: 0,
    totalHiringRequests: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);

    const [
      { count: startupsCount },
      { count: usersCount },
      { data: ordersData },
      { count: messagesCount },
      { count: hiringCount },
    ] = await Promise.all([
      supabase.from("startups").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total_amount"),
      supabase.from("messages").select("*", { count: "exact", head: true }),
      supabase.from("hiring_requests").select("*", { count: "exact", head: true }),
    ]);

    const totalRevenue = ordersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    setData({
      totalStartups: startupsCount || 0,
      totalUsers: usersCount || 0,
      totalOrders: ordersData?.length || 0,
      totalRevenue,
      totalMessages: messagesCount || 0,
      totalHiringRequests: hiringCount || 0,
    });

    setLoading(false);
  };

  const stats = [
    {
      label: "Total Startups",
      value: data.totalStartups,
      icon: Briefcase,
      color: "#0d9488",
      change: "+12%",
    },
    {
      label: "Active Users",
      value: data.totalUsers,
      icon: Users,
      color: "#6366f1",
      change: "+8%",
    },
    {
      label: "Total Orders",
      value: data.totalOrders,
      icon: Eye,
      color: "#f59e0b",
      change: "+24%",
    },
    {
      label: "Revenue",
      value: `$${data.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "#10b981",
      change: "+18%",
    },
    {
      label: "Messages",
      value: data.totalMessages,
      icon: MessageSquare,
      color: "#8b5cf6",
      change: "+32%",
    },
    {
      label: "Hiring Requests",
      value: data.totalHiringRequests,
      icon: TrendingUp,
      color: "#ec4899",
      change: "+15%",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <Box className="min-h-screen flex items-center justify-center">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          className="mb-8"
        >
          <Box>
            <Typography variant="h4" className="font-bold mb-1">
              Analytics
            </Typography>
            <Typography variant="body1" className="text-muted-foreground">
              Track your performance and growth metrics
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Stats Grid */}
        <Grid container spacing={3} className="mb-8">
          {stats.map((stat) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={stat.label}>
              <Paper elevation={0} className="p-6 rounded-xl border border-border">
                <Box className="flex items-start justify-between mb-4">
                  <Box
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    sx={{ backgroundColor: `${stat.color}15` }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </Box>
                  <Typography
                    variant="body2"
                    className="font-medium px-2 py-1 rounded-full"
                    sx={{
                      backgroundColor: "#10b98115",
                      color: "#10b981",
                    }}
                  >
                    {stat.change}
                  </Typography>
                </Box>
                <Typography variant="h4" className="font-bold mb-1">
                  {stat.value}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Charts Placeholder */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper elevation={0} className="p-6 rounded-xl border border-border h-80">
              <Typography variant="h6" className="font-semibold mb-4">
                Growth Over Time
              </Typography>
              <Box className="h-full flex items-center justify-center">
                <Box className="text-center">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <Typography variant="body2" className="text-muted-foreground">
                    Interactive charts coming soon
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper elevation={0} className="p-6 rounded-xl border border-border h-80">
              <Typography variant="h6" className="font-semibold mb-4">
                Top Performing
              </Typography>
              <Stack spacing={3}>
                {[
                  { name: "TechStart Inc", metric: "234 views", growth: "+45%" },
                  { name: "AI Solutions", metric: "189 views", growth: "+32%" },
                  { name: "GreenTech", metric: "156 views", growth: "+28%" },
                  { name: "FinanceApp", metric: "134 views", growth: "+21%" },
                ].map((item, index) => (
                  <Box key={index} className="flex items-center justify-between">
                    <Box>
                      <Typography variant="body2" className="font-medium">
                        {item.name}
                      </Typography>
                      <Typography variant="caption" className="text-muted-foreground">
                        {item.metric}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      className="font-medium"
                      sx={{ color: "#10b981" }}
                    >
                      {item.growth}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
