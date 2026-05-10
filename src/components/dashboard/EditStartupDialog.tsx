import { useState, useEffect } from 'react';
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
import { supabase } from '@/lib/firebase/compat';

interface Startup {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  stage: string | null;
  looking_for_team: boolean;
  looking_for_mentorship: boolean;
  looking_for_funding: boolean;
}

interface EditStartupDialogProps {
  open: boolean;
  onClose: () => void;
  startup: Startup;
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

export function EditStartupDialog({ open, onClose, startup, onSuccess }: EditStartupDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState('');
  const [lookingForTeam, setLookingForTeam] = useState(false);
  const [lookingForMentorship, setLookingForMentorship] = useState(false);
  const [lookingForFunding, setLookingForFunding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (startup) {
      setName(startup.name);
      setDescription(startup.description || '');
      setIndustry(startup.industry || '');
      setStage(startup.stage || '');
      setLookingForTeam(startup.looking_for_team);
      setLookingForMentorship(startup.looking_for_mentorship);
      setLookingForFunding(startup.looking_for_funding);
    }
  }, [startup]);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('startups')
      .update({
        name: name.trim(),
        description: description.trim() || null,
        industry: industry || null,
        stage: stage || null,
        looking_for_team: lookingForTeam,
        looking_for_mentorship: lookingForMentorship,
        looking_for_funding: lookingForFunding,
      })
      .eq('id', startup.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
    } else {
      setSaving(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold">Edit Startup</DialogTitle>
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
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
          />

          <FormControl fullWidth>
            <InputLabel>Industry</InputLabel>
            <Select value={industry} label="Industry" onChange={(e) => setIndustry(e.target.value)}>
              <MenuItem value="">Select Industry</MenuItem>
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
              <MenuItem value="">Select Stage</MenuItem>
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
        <Button onClick={onClose} color="inherit" disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving || !name.trim()}
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
