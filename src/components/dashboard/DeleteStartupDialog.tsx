import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { supabase } from '@/integrations/supabase/client';

interface Startup {
  id: string;
  name: string;
}

interface DeleteStartupDialogProps {
  open: boolean;
  onClose: () => void;
  startup: Startup;
  onSuccess: () => void;
}

export function DeleteStartupDialog({ open, onClose, startup, onSuccess }: DeleteStartupDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    const { error: deleteError } = await supabase.from('startups').delete().eq('id', startup.id);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
    } else {
      setDeleting(false);
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className="font-bold">Delete Startup</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        <DialogContentText>
          Are you sure you want to delete <strong>{startup.name}</strong>? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions className="p-4">
        <Button onClick={onClose} color="inherit" disabled={deleting}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={deleting}
          startIcon={deleting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
