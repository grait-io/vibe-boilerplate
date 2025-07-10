import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Switch,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import api from '../services/api';

function Settings() {
  const [settings, setSettings] = useState({
    custom_prompt_template: '',
    preferred_model: 'meta-llama/llama-3.2-3b-instruct:free',
    temperature: 0.8,
    max_tokens: 150,
    default_dirtiness_level: 5,
    include_emojis: true,
    preferred_style: 'playful',
  });
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchModels();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/');
      setSettings(response.data);
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await api.get('/settings/models');
      setModels(response.data.models);
    } catch (err) {
      console.error('Failed to fetch models:', err);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings({ ...settings, [field]: value });
  };

  const handleSliderChange = (field) => (event, newValue) => {
    setSettings({ ...settings, [field]: newValue });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      await api.put('/settings/', settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyModelSlug = async () => {
    try {
      await navigator.clipboard.writeText(settings.preferred_model);
      setCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCloseCopySnackbar = () => {
    setCopySuccess(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Settings saved successfully!</Alert>}

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Generation Settings
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Preferred Model</InputLabel>
          <Select
            value={settings.preferred_model}
            onChange={handleChange('preferred_model')}
            label="Preferred Model"
          >
            {models.map((model) => (
              <MenuItem key={model.id} value={model.id}>
                <Box>
                  <Typography variant="body1">{model.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {model.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
            Current model slug: <Typography component="span" variant="body2" fontFamily="monospace" sx={{ backgroundColor: 'grey.100', p: 0.5, borderRadius: 1 }}>{settings.preferred_model}</Typography>
          </Typography>
          <Tooltip title="Copy model slug to clipboard">
            <IconButton onClick={handleCopyModelSlug} size="small">
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            Temperature: {settings.temperature}
          </Typography>
          <Slider
            value={settings.temperature}
            onChange={handleSliderChange('temperature')}
            min={0}
            max={2}
            step={0.1}
            valueLabelDisplay="auto"
          />
          <Typography variant="caption" color="text.secondary">
            Higher values make output more creative but less focused
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            Max Tokens: {settings.max_tokens}
          </Typography>
          <Slider
            value={settings.max_tokens}
            onChange={handleSliderChange('max_tokens')}
            min={50}
            max={500}
            step={10}
            valueLabelDisplay="auto"
          />
          <Typography variant="caption" color="text.secondary">
            Maximum length of generated pickup lines
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Default Preferences
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography gutterBottom>
            Default Dirtiness Level: {settings.default_dirtiness_level}
          </Typography>
          <Slider
            value={settings.default_dirtiness_level}
            onChange={handleSliderChange('default_dirtiness_level')}
            min={1}
            max={10}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Preferred Style</InputLabel>
          <Select
            value={settings.preferred_style}
            onChange={handleChange('preferred_style')}
            label="Preferred Style"
          >
            {['playful', 'romantic', 'funny', 'cheesy', 'unhinged'].map((style) => (
              <MenuItem key={style} value={style}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={settings.include_emojis}
              onChange={handleChange('include_emojis')}
            />
          }
          label="Include emojis in pickup lines"
          sx={{ mb: 3 }}
        />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Custom Prompt Template
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          value={settings.custom_prompt_template}
          onChange={handleChange('custom_prompt_template')}
          placeholder="Leave empty to use default prompts. Use {description}, {dirtiness}, and {style} as placeholders."
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          size="large"
        >
          {saving ? <CircularProgress size={24} /> : 'Save Settings'}
        </Button>
      </Paper>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={handleCloseCopySnackbar}
        message="Model slug copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}

export default Settings;