"use client"
import React, { useMemo } from 'react';
import { Paper, Typography, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import type { DashboardData, FilterState } from '../../types/dashboard';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string[]) => void;
  data: DashboardData[];
}

export const FilterPanel = ({ data, filters, onFilterChange }: FilterPanelProps) => {
  const uniqueValues = useMemo(() => {
    return {
      ethnic_group: [...new Set(data.filter(Boolean).map(item => item?.ethnic_group).filter(Boolean))],
      home_country: [...new Set(data.filter(Boolean).map(item => item?.home_country).filter(Boolean))],
      age: [...new Set(data.filter(Boolean).map(item => item?.age).filter(value => value >= 0 && value <= 100))],
      gender: [...new Set(data.filter(Boolean).map(item => item?.gender).filter(Boolean))],
      student_type_location: [...new Set(data.filter(Boolean).map(item => item?.student_type_location).filter(Boolean))],
      student_type_time: [...new Set(data.filter(Boolean).map(item => item?.student_type_time).filter(Boolean))],
      course_of_study: [...new Set(data.filter(Boolean).map(item => item?.course_of_study).filter(Boolean))],
      hours_between_lectures: [...new Set(data.filter(Boolean).map(item => item?.hours_between_lectures).filter(Boolean))],
      hours_per_week_lectures: [...new Set(data.filter(Boolean).map(item => item?.hours_per_week_lectures).filter(Boolean))],
      hours_per_week_university_work: [...new Set(data.filter(Boolean).map(item => item?.hours_per_week_university_work).filter(Boolean))],
      level_of_study: [...new Set(data.filter(Boolean).map(item => item?.level_of_study).filter(Boolean))],
      timetable_preference: [...new Set(data.filter(Boolean).map(item => item?.timetable_preference).filter(Boolean))],
      timetable_reasons: [...new Set(data.filter(Boolean).map(item => item?.timetable_reasons).filter(Boolean))],
      timetable_impact: [...new Set(data.filter(Boolean).map(item => item?.timetable_impact).filter(Boolean))],
      financial_support: [...new Set(data.filter(Boolean).map(item => item?.financial_support).filter(Boolean))],
      financial_problems: [...new Set(data.filter(Boolean).map(item => item?.financial_problems).filter(Boolean))],
      family_earning_class: [...new Set(data.filter(Boolean).map(item => item?.family_earning_class).filter(Boolean))],
      form_of_employment: [...new Set(data.filter(Boolean).map(item => item?.form_of_employment).filter(Boolean))],
      work_hours_per_week: [...new Set(data.filter(Boolean).map(item => item?.work_hours_per_week).filter(Boolean))],
      cost_of_study: [...new Set(data.filter(Boolean).map(item => item?.cost_of_study).filter(Boolean))],
      diet: [...new Set(data.filter(Boolean).map(item => item?.diet).filter(Boolean))],
      well_hydrated: [...new Set(data.filter(Boolean).map(item => item?.well_hydrated).filter(Boolean))],
      exercise_per_week: [...new Set(data.filter(Boolean).map(item => item?.exercise_per_week).filter(Boolean))],
      alcohol_consumption: [...new Set(data.filter(Boolean).map(item => item?.alcohol_consumption).filter(Boolean))],
      personality_type: [...new Set(data.filter(Boolean).map(item => item?.personality_type).filter(Boolean))],
      physical_activities: [...new Set(data.filter(Boolean).map(item => item?.physical_activities).filter(Boolean))],
      mental_health_activities: [...new Set(data.filter(Boolean).map(item => item?.mental_health_activities).filter(Boolean))],
      hours_socialmedia: [...new Set(data.filter(Boolean).map(item => item?.hours_socialmedia).filter(Boolean))],
      total_device_hours: [...new Set(data.filter(Boolean).map(item => item?.total_device_hours).filter(Boolean))],
      hours_socialising: [...new Set(data.filter(Boolean).map(item => item?.hours_socialising).filter(Boolean))],
      quality_of_life: [...new Set(data.filter(Boolean).map(item => item?.quality_of_life).filter(Boolean))],
      feel_afraid: [...new Set(data.filter(Boolean).map(item => item?.feel_afraid).filter(Boolean))],
      stress_in_general: [...new Set(data.filter(Boolean).map(item => item?.stress_in_general).filter(Boolean))],
      stress_before_exams: [...new Set(data.filter(Boolean).map(item => item?.stress_before_exams).filter(Boolean))],
      known_disabilities: [...new Set(data.filter(Boolean).map(item => item?.known_disabilities).filter(Boolean))],
      sense_of_belonging: [...new Set(data.filter(Boolean).map(item => item?.sense_of_belonging).filter(Boolean))]
    };
  }, [data]);

  const renderSelect = (key: string, values: any[]) => (
    <FormControl fullWidth sx={{ mt: 1, mb: 1 }}>
      <InputLabel>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</InputLabel>
      <Select
        multiple
        value={filters[key as keyof FilterState] || []}
        onChange={(e) => {
          const value = e.target.value as string[];
          onFilterChange(key as keyof FilterState, value);
        }}
        renderValue={(selected) => (selected as string[]).join(', ')}
      >
        {values.map((value) => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', borderRadius: '5px', backgroundColor: '#ffff' }}>
        Demographics
      </Typography>
      {renderSelect('ethnic_group', uniqueValues.ethnic_group.filter(value => value !== 'Not Provided'))}
      {renderSelect('home_country', uniqueValues.home_country.filter(value => value !== 'Not Provided'))}
      {renderSelect('age', uniqueValues.age.sort((a, b) => a - b))}
      {renderSelect('gender', uniqueValues.gender.filter(value => value !== 'Not Provided'))}
      {renderSelect('student_type_location', uniqueValues.student_type_location.filter(value => value !== 'Not Provided'))}
      {renderSelect('student_type_time', uniqueValues.student_type_time.filter(value => value !== 'Not Provided'))}

      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', borderRadius: '5px', backgroundColor: '#ffff' }}>
        Academic Context
      </Typography>
      {renderSelect('course_of_study', uniqueValues.course_of_study.filter(value => value !== 'Not Provided'))}
      {renderSelect('hours_between_lectures', uniqueValues.hours_between_lectures.sort((a, b) => a - b))}
      {renderSelect('hours_per_week_lectures', uniqueValues.hours_per_week_lectures.sort((a, b) => a - b))}
      {renderSelect('hours_per_week_university_work', uniqueValues.hours_per_week_university_work.sort((a, b) => a - b))}
      {renderSelect('level_of_study', uniqueValues.level_of_study.filter(value => value !== 'Not Provided'))}
      {renderSelect('timetable_preference', uniqueValues.timetable_preference.filter(value => value !== 'Not Provided'))}
      {renderSelect('timetable_reasons', uniqueValues.timetable_reasons.filter(value => value !== 'Not Provided'))}
      {renderSelect('timetable_impact', uniqueValues.timetable_impact.filter(value => value !== 'Not Provided'))}

      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', borderRadius: '5px', backgroundColor: '#ffff' }}>
        Socioeconomic Factors
      </Typography>
      {renderSelect('financial_support', uniqueValues.financial_support.filter(value => value !== 'Not Provided'))}
      {renderSelect('financial_problems', uniqueValues.financial_problems.filter(value => value !== 'Not Provided'))}
      {renderSelect('family_earning_class', uniqueValues.family_earning_class.filter(value => value !== 'Not Provided'))}
      {renderSelect('form_of_employment', uniqueValues.form_of_employment.filter(value => value !== 'Not Provided'))}
      {renderSelect('work_hours_per_week', uniqueValues.work_hours_per_week.sort((a, b) => a - b))}
      {renderSelect('cost_of_study', uniqueValues.cost_of_study.sort((a, b) => a - b))}

      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', borderRadius: '5px', backgroundColor: '#ffff' }}>
        Lifestyle and Behaviour
      </Typography>
      {renderSelect('diet', uniqueValues.diet.filter(value => value !== 'Not Provided'))}
      {renderSelect('well_hydrated', uniqueValues.well_hydrated.filter(value => value !== 'Not Provided'))}
      {renderSelect('exercise_per_week', uniqueValues.exercise_per_week.sort((a, b) => a - b))}
      {renderSelect('alcohol_consumption', uniqueValues.alcohol_consumption.filter(value => value !== 'Not Provided'))}
      {renderSelect('personality_type', uniqueValues.personality_type.filter(value => value !== 'Not Provided'))}
      {renderSelect('physical_activities', uniqueValues.physical_activities.filter(value => value !== 'Not Provided'))}
      {renderSelect('mental_health_activities', uniqueValues.mental_health_activities.filter(value => value !== 'Not Provided'))}

      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', borderRadius: '5px', backgroundColor: '#ffff' }}>
        Social and Technological Factors
      </Typography>
      {renderSelect('hours_socialmedia', uniqueValues.hours_socialmedia.sort((a, b) => a - b))}
      {renderSelect('total_device_hours', uniqueValues.total_device_hours.sort((a, b) => a - b))}
      {renderSelect('hours_socialising', uniqueValues.hours_socialising.sort((a, b) => a - b))}

      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', borderRadius: '5px', backgroundColor: '#ffff' }}>
        Psychological and Emotional Factors
      </Typography>
      {renderSelect('quality_of_life', uniqueValues.quality_of_life.filter(value => value !== 'Not Provided'))}
      {renderSelect('feel_afraid', uniqueValues.feel_afraid.filter(value => value !== 'Not Provided'))}
      {renderSelect('stress_in_general', uniqueValues.stress_in_general)}
      {renderSelect('stress_before_exams', uniqueValues.stress_before_exams.filter(value => value !== 'Not Provided'))}
      {renderSelect('known_disabilities', uniqueValues.known_disabilities.filter(value => value !== 'Not Provided'))}
      {renderSelect('sense_of_belonging', uniqueValues.sense_of_belonging.filter(value => value !== 'Not Provided'))}
    </Paper>
  );
};