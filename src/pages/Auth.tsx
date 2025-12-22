import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

type Role = "founder" | "investor" | "mentor" | "developer";

const roles: { value: Role; label: string; description: string }[] = [
  {
    value: "founder",
    label: "Founder",
    description: "Validate and build your startup",
  },
  {
    value: "investor",
    label: "Investor",
    description: "Discover validated startups",
  },
  {
    value: "mentor",
    label: "Mentor",
    description: "Guide founders to success",
  },
  {
    value: "developer",
    label: "Developer",
    description: "Join innovative teams",
  },
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp, signIn, user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(searchParams.get("mode") === "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>(
    (searchParams.get("role") as Role) || "founder"
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
  }>({});

  useEffect(() => {
    if (user && profile && !authLoading) {
      // Founders need to complete startup info first
      if (profile.role === "founder") {
        checkFounderStartup();
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, profile, authLoading, navigate]);

  const checkFounderStartup = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("startups")
      .select("id")
      .eq("founder_id", user.id)
      .maybeSingle();

    if (data) {
      navigate("/dashboard");
    } else {
      navigate("/create-startup");
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (!isLogin && !fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign in failed",
            description:
              error.message === "Invalid login credentials"
                ? "Invalid email or password. Please try again."
                : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          });
        }
      } else {
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          const errorMessage = error.message.includes("already registered")
            ? "This email is already registered. Please sign in instead."
            : error.message;
          toast({
            title: "Sign up failed",
            description: errorMessage,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to Truxa Foundry. Let's validate your startup!",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="min-h-screen flex bg-gradient-subtle">
      {/* Left Panel - Branding */}
      <Box className="hidden lg:flex lg:w-1/2 bg-gradient-hero p-12 flex-col justify-between relative overflow-hidden">
        <Box className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)]" />
        <Box className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent)]" />

        <Box className="relative z-10">
          <Box
            component={Link}
            to="/"
            className="flex items-center gap-2.5 mb-12 no-underline"
          >
            <Box className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Zap className="w-6 h-6 text-primary-foreground" fill="currentColor" />
            </Box>
            <Typography variant="h5" className="font-bold text-primary-foreground">
              Truxa Foundry
            </Typography>
          </Box>

          <Typography
            variant="h3"
            className="font-bold text-primary-foreground leading-tight mb-6"
          >
            {isLogin ? "Welcome back!" : "Start validating your startup idea"}
          </Typography>
          <Typography variant="body1" className="text-primary-foreground/80 max-w-md leading-relaxed">
            {isLogin
              ? "Sign in to access your dashboard and continue building your validated startup."
              : "Create your account and get AI-powered insights on your startup's product-market fit in minutes."}
          </Typography>
        </Box>

        <Box className="relative z-10">
          <Typography variant="body2" className="text-primary-foreground/60">
            © {new Date().getFullYear()} Truxa Foundry. All rights reserved.
          </Typography>
        </Box>
      </Box>

      {/* Right Panel - Form */}
      <Box className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Box className="w-full max-w-md">
          {/* Mobile Back Link */}
          <Box className="lg:hidden mb-8">
            <Button
              component={Link}
              to="/"
              startIcon={<ArrowLeft className="w-5 h-5" />}
              color="inherit"
              className="text-muted-foreground"
              sx={{ textTransform: 'none' }}
            >
              Back to home
            </Button>
          </Box>

          <Box className="mb-8">
            <Typography variant="h4" className="font-bold mb-2">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </Typography>
            <Typography variant="body2" className="text-muted-foreground">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <Button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-semibold p-0 min-w-0"
                sx={{ textTransform: "none" }}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </Button>
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {!isLogin && (
                <TextField
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </InputAdornment>
                  ),
                }}
              />

              {!isLogin && (
                <Box>
                  <Typography variant="body2" className="font-semibold mb-3">
                    I am a...
                  </Typography>
                  <Box className="grid grid-cols-2 gap-3">
                    {roles.map((r) => (
                      <Paper
                        key={r.value}
                        elevation={0}
                        onClick={() => setRole(r.value)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                          role === r.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Typography variant="body2" className="font-semibold">
                          {r.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-muted-foreground"
                        >
                          {r.description}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ 
                  height: 48,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
}