"use client"
import React from 'react';
import { Paper, Typography, FormGroup, FormControlLabel, Checkbox, Slider, Box } from '@mui/material';
import type { DashboardData, FilterState } from '../../types/dashboard';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  data: DashboardData[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, data }) => {
  const uniqueValues = React.useMemo(() => {
    if (!Array.isArray(data)) return {
      studentType: [],
      gender: [],
      courseCategory: [],
      employmentStatus: [],
      ethnicGroup: []
    };

    return {
      studentType: [...new Set(data.filter(Boolean).map(item => item?.student_type_location).filter(Boolean))],
      gender: [...new Set(data.filter(Boolean).map(item => item?.gender).filter(Boolean))],
      courseCategory: [...new Set(data.filter(Boolean).map(item => item?.course_of_study).filter(Boolean))],
      employmentStatus: [...new Set(data.filter(Boolean).map(item => item?.form_of_employment).filter(Boolean))],
      ethnicGroup: [...new Set(data.filter(Boolean).map(item => item?.ethnic_group).filter(Boolean))]
    };
  }, [data]);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      
      {Object.entries(uniqueValues).map(([key, values]) => (
        <Box key={key} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </Typography>
          <FormGroup>
            {values.map(value => (
              <FormControlLabel
                key={value}
                control={
                  <Checkbox
                    checked={filters[key as keyof typeof uniqueValues].includes(value)}
                    onChange={() => {
                      const currentValues = filters[key as keyof typeof uniqueValues];
                      const newValues = currentValues.includes(value)
                        ? currentValues.filter(v => v !== value)
                        : [...currentValues, value];
                      onFilterChange({ [key]: newValues });
                    }}
                  />
                }
                label={value}
              />
            ))}
          </FormGroup>
        </Box>
      ))}

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
    </Paper>
  );
};