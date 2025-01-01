'use client';
import React, { useEffect, useState } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { viewReport, deleteReport } from '../../api/data';

const ReportView = () => {
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const timestampParam = urlParams.get('timestamp');
      setTimestamp(timestampParam);

      if (timestampParam) {
        fetchReport(timestampParam);
      }
    }
  }, []);

  const fetchReport = async (timestamp: string) => {
    try {
      const reportBlob = await viewReport(timestamp);
      const reportUrl = URL.createObjectURL(reportBlob);
      setReportUrl(reportUrl);
    } catch (error) {
      console.error('Error viewing report:', error);
      alert('Failed to view report');
    }
  };

  const handleDeleteReport = async () => {
    try {
      await deleteReport(timestamp!);
      alert('Report deleted successfully');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
    }
  };

  if (!timestamp || !reportUrl) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Report View
        </Typography>
        <Button variant="contained" color="error" onClick={handleDeleteReport}>
          Close and Delete Report
        </Button>
        <Button variant="contained" color="primary" onClick={() => window.location.href = '/dashboard'}>
          Close
        </Button>
      </Box>
      <iframe
        src={reportUrl}
        style={{ width: '100%', height: '80vh', border: 'none' }}
        title="Report"
      />
    </Box>
  );
};

export default ReportView;