import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';

const COLORS = ['#FF4081', '#7C4DFF', '#00BCD4', '#4CAF50', '#FF9800'];

function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/history/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Container>
        <Typography>No statistics available yet.</Typography>
      </Container>
    );
  }

  const styleData = Object.entries(stats.style_distribution).map(([style, count]) => ({
    name: style.charAt(0).toUpperCase() + style.slice(1),
    value: count,
  }));

  const dirtinessData = Object.entries(stats.dirtiness_distribution).map(([level, count]) => ({
    level: `Level ${level}`,
    count,
  }));

  const successData = Object.entries(stats.success_by_style).map(([style, data]) => ({
    style: style.charAt(0).toUpperCase() + style.slice(1),
    rate: data.rate.toFixed(1),
    total: data.total,
  }));

  const activityData = stats.recent_activity.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    count: item.count,
  }));

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Statistics
      </Typography>

      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Generated
              </Typography>
              <Typography variant="h4">
                {stats.overview.total_generated}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Used
              </Typography>
              <Typography variant="h4">
                {stats.overview.total_used}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Success Rate
              </Typography>
              <Typography variant="h4">
                {stats.overview.success_rate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Rating
              </Typography>
              <Typography variant="h4">
                {stats.overview.average_rating || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Style Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Style Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={styleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {styleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Dirtiness Level Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Dirtiness Level Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={dirtinessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#FF4081" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Success Rate by Style */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Success Rate by Style
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={successData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="style" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rate" fill="#4CAF50" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#7C4DFF"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Stats;