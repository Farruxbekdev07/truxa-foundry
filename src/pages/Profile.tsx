import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Avatar,
  CircularProgress,
  Alert,
  Container,
  Stack,
} from '@mui/material';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/firebase/compat';
import { Save, ArrowLeft, Rocket, TrendingUp, GraduationCap, Code, User } from 'lucide-react';
import { roleColors } from '@/theme/muiTheme';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        bio,
        avatar_url: avatarUrl || null,
      })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center bg-background">
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !profile) return null;

  const getRoleIcon = () => {
    switch (profile.role) {
      case 'founder':
        return Rocket;
      case 'investor':
        return TrendingUp;
      case 'mentor':
        return GraduationCap;
      case 'developer':
        return Code;
      default:
        return User;
    }
  };

  const getRoleColor = () => {
    return roleColors[profile.role as keyof typeof roleColors] || roleColors.founder;
  };

  const RoleIcon = getRoleIcon();

  return (
    <DashboardLayout>
      <Container maxWidth="md" className="py-8">
        <Button
          startIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/dashboard')}
          className="mb-6"
          color="inherit"
        >
          Back to Dashboard
        </Button>

        <Paper elevation={0} className="rounded-xl border border-border p-6 md:p-8">
          <Typography variant="h5" className="font-bold mb-6">
            Edit Profile
          </Typography>

          {error && (
            <Alert severity="error" className="mb-6">
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" className="mb-6">
              Profile updated successfully!
            </Alert>
          )}

          <Stack spacing={4}>
            {/* Avatar Section */}
            <Box className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar
                src={avatarUrl || undefined}
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: getRoleColor(),
                  fontSize: '1.5rem',
                  fontWeight: 600,
                }}
              >
                {fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </Avatar>
              <Box className="flex-1 w-full sm:w-auto">
                <TextField
                  fullWidth
                  label="Avatar URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  size="small"
                />
                <Typography variant="caption" className="text-muted-foreground mt-1 block">
                  Enter a URL to your profile picture
                </Typography>
              </Box>
            </Box>

            {/* Role Badge */}
            <Box className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
              <Box
                className="w-10 h-10 rounded-full flex items-center justify-center"
                sx={{ backgroundColor: `${getRoleColor()}20` }}
              >
                <RoleIcon className="w-5 h-5" style={{ color: getRoleColor() }} />
              </Box>
              <Box>
                <Typography variant="body2" className="text-muted-foreground">
                  Your Role
                </Typography>
                <Typography variant="body1" className="font-semibold capitalize">
                  {profile.role}
                </Typography>
              </Box>
            </Box>

            {/* Form Fields */}
            <TextField
              fullWidth
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              multiline
              rows={4}
              placeholder="Tell us about yourself..."
            />

            <TextField
              fullWidth
              label="Email"
              value={user.email}
              disabled
              helperText="Email cannot be changed"
            />

            {/* Save Button */}
            <Box className="flex justify-end">
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save className="w-4 h-4" />}
                onClick={handleSave}
                disabled={saving || !fullName.trim()}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </DashboardLayout>
  );
}
