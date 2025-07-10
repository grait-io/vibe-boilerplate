import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Pagination,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search,
  Delete,
  ContentCopy,
  Notes,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import api from '../services/api';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    style: '',
    min_rating: '',
    used_only: false,
    success_only: false,
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [notesDialog, setNotesDialog] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [page, filters]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        per_page: 10,
        ...filters,
      });
      
      const response = await api.get(`/history/?${params}`);
      setHistory(response.data.history);
      setTotalPages(response.data.pages);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/history/${id}`);
      fetchHistory();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleRating = async (id, rating) => {
    try {
      await api.post(`/pickup/rate/${id}`, { rating });
      fetchHistory();
    } catch (err) {
      console.error('Failed to rate item:', err);
    }
  };

  const handleUsedToggle = async (id, used) => {
    try {
      await api.post(`/pickup/rate/${id}`, { used });
      fetchHistory();
    } catch (err) {
      console.error('Failed to update used status:', err);
    }
  };

  const handleSuccessToggle = async (id, success) => {
    try {
      await api.post(`/pickup/rate/${id}`, { success });
      fetchHistory();
    } catch (err) {
      console.error('Failed to update success status:', err);
    }
  };

  const handleNotesSubmit = async () => {
    if (selectedItem) {
      try {
        await api.post(`/pickup/rate/${selectedItem.id}`, { notes });
        setNotesDialog(false);
        setNotes('');
        fetchHistory();
      } catch (err) {
        console.error('Failed to update notes:', err);
      }
    }
  };

  const openNotesDialog = (item) => {
    setSelectedItem(item);
    setNotes(item.notes || '');
    setNotesDialog(true);
  };

  const filteredHistory = history.filter((item) =>
    item.pickup_line.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.person_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && history.length === 0) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Pickup History
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search pickup lines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Style</InputLabel>
          <Select
            value={filters.style}
            onChange={(e) => setFilters({ ...filters, style: e.target.value })}
            label="Style"
          >
            <MenuItem value="">All</MenuItem>
            {['playful', 'romantic', 'funny', 'cheesy', 'unhinged'].map((style) => (
              <MenuItem key={style} value={style}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Min Rating</InputLabel>
          <Select
            value={filters.min_rating}
            onChange={(e) => setFilters({ ...filters, min_rating: e.target.value })}
            label="Min Rating"
          >
            <MenuItem value="">All</MenuItem>
            {[1, 2, 3, 4, 5].map((rating) => (
              <MenuItem key={rating} value={rating}>
                {rating}+ Stars
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={filters.used_only}
              onChange={(e) => setFilters({ ...filters, used_only: e.target.checked })}
            />
          }
          label="Used Only"
        />

        <FormControlLabel
          control={
            <Switch
              checked={filters.success_only}
              onChange={(e) => setFilters({ ...filters, success_only: e.target.checked })}
            />
          }
          label="Successful Only"
        />
      </Box>

      {filteredHistory.length === 0 ? (
        <Alert severity="info">No pickup lines found. Generate some first!</Alert>
      ) : (
        <>
          {filteredHistory.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={item.style} size="small" color="primary" />
                    <Chip label={`Dirtiness: ${item.dirtiness_level}/10`} size="small" />
                    {item.used && <Chip label="Used" size="small" color="success" />}
                    {item.success && <Chip label="Successful" size="small" color="success" />}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  For: {item.person_description}
                </Typography>

                <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                  "{item.pickup_line}"
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Rating
                    value={item.rating || 0}
                    onChange={(e, value) => handleRating(item.id, value)}
                  />

                  <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(item.pickup_line)}
                      title="Copy"
                    >
                      <ContentCopy />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => handleUsedToggle(item.id, !item.used)}
                      color={item.used ? 'success' : 'default'}
                      title="Mark as used"
                    >
                      <CheckCircle />
                    </IconButton>

                    {item.used && (
                      <IconButton
                        size="small"
                        onClick={() => handleSuccessToggle(item.id, !item.success)}
                        color={item.success ? 'success' : 'error'}
                        title="Mark success"
                      >
                        {item.success ? <CheckCircle /> : <Cancel />}
                      </IconButton>
                    )}

                    <IconButton
                      size="small"
                      onClick={() => openNotesDialog(item)}
                      title="Add notes"
                    >
                      <Notes />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => handleDelete(item.id)}
                      color="error"
                      title="Delete"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                {item.notes && (
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    Notes: {item.notes}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </>
      )}

      <Dialog open={notesDialog} onClose={() => setNotesDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Notes</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this pickup line..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotesDialog(false)}>Cancel</Button>
          <Button onClick={handleNotesSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default History;