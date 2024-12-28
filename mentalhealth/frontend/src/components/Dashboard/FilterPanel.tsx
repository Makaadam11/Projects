"use client"
import React from 'react';
import { Paper, Typography, FormControl, Select, MenuItem, FormControlLabel, Checkbox, Box, InputLabel, ListItemText } from '@mui/material';
import type { DashboardData, FilterState } from '../../types/dashboard';

interface FilterPanelProps {
  filters: FilterState | any;
  onFilterChange: (key: keyof FilterState, value: string[]) => void;
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
          
          {key === 'courseCategory' ? (
            <FormControl fullWidth>
              <InputLabel>Course Category</InputLabel>
              <Select
                multiple
                value={filters[key] || []}
                onChange={(e) => {
                  const value = e.target.value as string[];
                  onFilterChange(key as keyof FilterState, value);
                }}
                renderValue={(selected) => (selected as string[]).join(', ')}
              >
                <MenuItem value="">
                  <em>All Courses</em>
                </MenuItem>
                {values.map((value: string) => (
                  <MenuItem key={value} value={value}>
                    <Checkbox checked={filters[key]?.includes(value) || false} />
                    <ListItemText primary={value} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Box>
              {values.map((value: string) => (
                <FormControlLabel
                  key={value}
                  control={
                    <Checkbox
                      checked={filters[key]?.includes(value) || false}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const currentFilters = filters[key] || [];
                        onFilterChange(
                          key as keyof FilterState,
                          isChecked
                            ? [...currentFilters, value]
                            : currentFilters.filter((v: string) => v !== value)
                        );
                      }}
                    />
                  }
                  label={value}
                />
              ))}
            </Box>
          )}
        </Box>
      ))}
    </Paper>
  );
};