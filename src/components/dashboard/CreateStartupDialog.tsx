import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/firebase/compat';

interface CreateStartupDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'E-commerce',
  'AI/ML',
  'SaaS',
  'Consumer',
  'Enterprise',
  'Other',
];

const stages = ['Idea', 'MVP', 'Seed', 'Series A', 'Series B+', 'Growth'];

export function CreateStartupDialog({ open, onClose, onSuccess }: CreateStartupDialogProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState('');
  const [lookingForTeam, setLookingForTeam] = useState(false);
  const [lookingForMentorship, setLookingForMentorship] = useState(false);
  const [lookingForFunding, setLookingForFunding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user || !name.trim()) return;

    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase.from('startups').insert({
      name: name.trim(),
      description: description.trim() || null,
      industry: industry || null,
      stage: stage || null,
      looking_for_team: lookingForTeam,
      looking_for_mentorship: lookingForMentorship,
      looking_for_funding: lookingForFunding,
      founder_id: user.id,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
    } else {
      resetForm();
      onSuccess();
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setIndustry('');
    setStage('');
    setLookingForTeam(false);
    setLookingForMentorship(false);
    setLookingForFunding(false);
    setError(null);
    setSaving(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold">Create New Startup</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <Stack spacing={3} className="mt-2">
          <TextField
            fullWidth
            label="Startup Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your startup name"
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            placeholder="Describe your startup..."
          />

          <FormControl fullWidth>
            <InputLabel>Industry</InputLabel>
            <Select value={industry} label="Industry" onChange={(e) => setIndustry(e.target.value)}>
              {industries.map((ind) => (
                <MenuItem key={ind} value={ind}>
                  {ind}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Stage</InputLabel>
            <Select value={stage} label="Stage" onChange={(e) => setStage(e.target.value)}>
              {stages.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack>
            <FormControlLabel
              control={
                <Checkbox checked={lookingForTeam} onChange={(e) => setLookingForTeam(e.target.checked)} />
              }
              label="Looking for team members"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={lookingForMentorship}
                  onChange={(e) => setLookingForMentorship(e.target.checked)}
                />
              }
              label="Looking for mentorship"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={lookingForFunding}
                  onChange={(e) => setLookingForFunding(e.target.checked)}
                />
              }
              label="Looking for funding"
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions className="p-4">
        <Button onClick={handleClose} color="inherit" disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving || !name.trim()}
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {saving ? 'Creating...' : 'Create Startup'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
