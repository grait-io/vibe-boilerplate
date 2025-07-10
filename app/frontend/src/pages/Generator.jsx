import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
  Typography,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  ContentCopy,
  Refresh,
  Star,
  StarBorder,
} from '@mui/icons-material';
import api from '../services/api';

const styles = ['playful', 'romantic', 'funny', 'cheesy', 'unhinged'];

function Generator() {
  const [personDescription, setPersonDescription] = useState('');
  const [dirtinessLevel, setDirtinessLevel] = useState(5);
  const [style, setStyle] = useState('playful');
  const [pickupLine, setPickupLine] = useState('');
  const [historyId, setHistoryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/');
      setSettings(response.data);
      setDirtinessLevel(response.data.default_dirtiness_level);
      setStyle(response.data.preferred_style);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const generatePickupLine = async () => {
    if (!personDescription.trim()) {
      setError('Please describe the person of interest');
      return;
    }

    setLoading(true);
    setError('');
    setCopied(false);

    try {
      const response = await api.post('/pickup/generate', {
        person_description: personDescription,
        dirtiness_level: dirtinessLevel,
        style: style,
      });

      setPickupLine(response.data.pickup_line);
      setHistoryId(response.data.history_id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate pickup line');
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    if (historyId) {
      setLoading(true);
      setError('');
      setCopied(false);

      try {
        const response = await api.post(`/pickup/regenerate/${historyId}`);
        setPickupLine(response.data.pickup_line);
        setHistoryId(response.data.history_id);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to regenerate');
      } finally {
        setLoading(false);
      }
    } else {
      generatePickupLine();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pickupLine);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ratePickupLine = async (rating) => {
    if (historyId) {
      try {
        await api.post(`/pickup/rate/${historyId}`, { rating });
      } catch (err) {
        console.error('Failed to rate pickup line:', err);
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Pickup Line Generator
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Describe the person of interest"
          placeholder="E.g., loves hiking and has a great smile, works in tech, enjoys coffee..."
          value={personDescription}
          onChange={(e) => setPersonDescription(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            Dirtiness Level: {dirtinessLevel}/10
          </Typography>
          <Slider
            value={dirtinessLevel}
            onChange={(e, newValue) => setDirtinessLevel(newValue)}
            min={1}
            max={10}
            marks
            valueLabelDisplay="auto"
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">Innocent</Typography>
            <Typography variant="caption">Spicy</Typography>
          </Box>
        </Box>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Style</InputLabel>
          <Select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            label="Style"
          >
            {styles.map((s) => (
              <MenuItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Button
          fullWidth
          variant="contained"
          onClick={generatePickupLine}
          disabled={loading}
          size="large"
        >
          {loading ? <CircularProgress size={24} /> : 'Generate Pickup Line'}
        </Button>
      </Paper>

      {pickupLine && (
        <Card elevation={3}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Chip label={style} color="primary" size="small" />
              <Chip label={`Dirtiness: ${dirtinessLevel}/10`} size="small" />
            </Box>
            
            <Typography variant="h6" sx={{ mb: 2, fontStyle: 'italic' }}>
              "{pickupLine}"
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                startIcon={<ContentCopy />}
                onClick={copyToClipboard}
                variant="outlined"
                size="small"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                startIcon={<Refresh />}
                onClick={regenerate}
                variant="outlined"
                size="small"
              >
                Regenerate
              </Button>
              
              <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <IconButton
                    key={rating}
                    onClick={() => ratePickupLine(rating)}
                    size="small"
                  >
                    {rating <= 3 ? <StarBorder /> : <Star color="primary" />}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default Generator;