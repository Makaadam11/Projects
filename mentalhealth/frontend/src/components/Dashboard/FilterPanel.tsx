import React from 'react';
import {
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Box
} from '@mui/material';
import type { FilterState } from '../../types/dashboard';

interface Props {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
}

export const FilterPanel: React.FC<Props> = ({ filters, onFilterChange }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Student Type
        </Typography>
        <FormGroup>
          {['European', 'Home Student', 'International Student'].map(type => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
                  checked={filters.studentType.includes(type)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...filters.studentType, type]
                      : filters.studentType.filter(t => t !== type);
                    onFilterChange({ studentType: newTypes });
                  }}
                />
              }
              label={type}
            />
          ))}
        </FormGroup>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Age Range
        </Typography>
        <Slider
          value={filters.ageRange}
          onChange={(_, newValue) => onFilterChange({ ageRange: newValue as [number, number] })}
          valueLabelDisplay="auto"
          min={18}
          max={65}
        />
      </Box>

      {/* Add more filter sections here */}
    </Paper>
  );
};