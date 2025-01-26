import React, { useMemo, useState, useEffect } from 'react';
import { Paper, Typography, FormControl, Select, MenuItem, InputLabel, Checkbox, ListItemText, Collapse, Box } from '@mui/material';
import type { DashboardData, FilterState } from '../../types/dashboard';
import { loadDepartments } from '../../api/data';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string[]) => void;
  data: DashboardData[];
  onYearChange: (year: string) => void;
  onUniversityChange: (university: string) => void; // Add this prop
  selectedYear: string; // Add this prop
}


export const FilterPanel = ({ data, filters, onFilterChange, onYearChange, onUniversityChange, selectedYear }: FilterPanelProps) => {
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [departments, setDepartments] = useState<{ [key: string]: { [key: string]: string[] } }>({});
  const [selectedUniversity, setSelectedUniversity] = useState<string>(localStorage.getItem('university') || 'All');
  const [selectedDepartment, setSelectedDepartment] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const [enhancedData, setEnhancedData] = useState<DashboardData[]>([]);
  const universities = ['UAL', 'SOL'];
  const [yearRange, setYearRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });

  useEffect(() => {
    if (localStorage.getItem('university') === 'All') {
      const defaultUniversity = 'UAL';
      setSelectedUniversity(defaultUniversity);
      onUniversityChange(defaultUniversity);
    } else {
      const savedUniversity = localStorage.getItem('university') || 'All';
      setSelectedUniversity(savedUniversity);
      onUniversityChange(savedUniversity);
    }
  }, [onUniversityChange]);

  
  // Update loadDepartments effect
  useEffect(() => {
    if (selectedUniversity) {
      const fetchDepartments = async () => {
        try {
          setLoading(prev => ({ ...prev, departments: true }));
          const response = await loadDepartments(selectedUniversity);
          // Response has nested departments property
          setDepartments({ [selectedUniversity]: response.departments });
        } catch (error) {
          console.error('Error loading departments:', error);
        } finally {
          setLoading(prev => ({ ...prev, departments: false }));
        }
      };
  
      fetchDepartments();
    }
  }, [selectedUniversity]);
  
  // Update department mapping effect
  useEffect(() => {
    if (selectedUniversity && departments[selectedUniversity]) {
      const departmentMapping: { [course: string]: string } = {};
      
      // Get departments object
      const departmentsData = departments[selectedUniversity];
      
      // Map courses to departments
      Object.entries(departmentsData).forEach(([department, courses]) => {
        if (Array.isArray(courses)) {
          courses.forEach(course => {
            departmentMapping[course.toLowerCase()] = department;
          });
        }
      });
  
      console.log('Department mapping:', departmentMapping);
  
      // Enhance data with departments
      const newData = data.map(item => ({
        ...item,
        department: item.course_of_study ? 
          departmentMapping[item.course_of_study.toLowerCase()] || 'Unknown' :
          'Unknown'
      }));
  
      setEnhancedData(newData);
    }
  }, [departments, selectedUniversity, data]);

  useEffect(() => {
    if (selectedYear && /^\d{4}-\d{4}$/.test(selectedYear)) {
      const [startYear, endYear] = selectedYear.split('-').map(Number);
      const startDate = new Date(startYear, 8, 1); // Wrzesień 1
      const endDate = new Date(endYear, 7, 31);   // Sierpień 31
      setYearRange({ start: startDate, end: endDate });
    } else {
      console.error("Invalid selectedYear format:", selectedYear);
      setYearRange({ start: null, end: null });
    }
  }, [selectedYear]);
  


    useEffect(() => {
    console.log('Year Range:', yearRange);
  }, [yearRange]);


  const getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };
  
  // Add getAcademicYearsList function
  const getAcademicYearsList = (data: DashboardData[]) => {
    // Get earliest year from data
    const earliestDate = Math.min(...data
      .map(item => new Date(item.captured_at).getFullYear())
      .filter(year => !isNaN(year)));
    
    // Get current academic year
    const currentYear = parseInt(getCurrentAcademicYear().split('-')[0]);
    
    // Generate list of academic years
    const yearsList = [];
    for (let year = earliestDate; year <= currentYear; year++) {
      yearsList.push(`${year}-${year + 1}`);
    }
    
    return yearsList;
  };
  
  const getAcademicYear = (dateString: string | undefined) => {
    if (!dateString) {
      console.error("Date string is undefined");
      return null;
    }
  
    const [datePart] = dateString.split(" ");
    const [day, month, year] = datePart.split(".").map(Number);
  
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.error("Invalid date parts:", { day, month, year });
      return null;
    }
  
    return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };
  
const getFilteredCount = (data: DashboardData[], key: string, value: any, currentFilters: FilterState) => {
  const filteredItems = data.filter(item => {
    const itemDate = item.captured_at ? new Date(item.captured_at.split('.').reverse().join('-')) : null;
    const matchesYear = !yearRange.start || !yearRange.end || !itemDate ? true :
      itemDate >= yearRange.start && itemDate <= yearRange.end;

    const matchesUniversity = !selectedUniversity || item.source === selectedUniversity;
    const matchesDepartment = !selectedDepartment.length || selectedDepartment.some(dept => 
      departments[selectedUniversity]?.[dept]?.includes(item.course_of_study)
    );
    const matchesValue = item[key as keyof DashboardData] === value;
    return matchesUniversity && matchesDepartment && matchesYear && matchesValue;
  });

  console.log(`Filtered Count for ${key}=${value}:`, filteredItems.length);
  return filteredItems.length;
};

    const uniqueValues = useMemo(() => {
    const filteredData = data.filter(item => {
      const academicYear = getAcademicYear(item.captured_at);
      const matchesYear = !selectedYear || academicYear === selectedYear;
      return (!selectedUniversity || item.source === selectedUniversity) &&
             (!filters.course_of_study.length || filters.course_of_study.includes(item.course_of_study)) &&
             matchesYear;
    });
  
    return {
      ethnic_group: [...new Set(filteredData.map(item => item?.ethnic_group).filter(Boolean))],
      home_country: [...new Set(filteredData.map(item => item?.home_country).filter(Boolean))],
      age: [...new Set(filteredData.map(item => item?.age).filter(value => value >= 0 && value <= 100))],
      gender: [...new Set(filteredData.map(item => item?.gender).filter(Boolean))],
      student_type_location: [...new Set(filteredData.map(item => item?.student_type_location).filter(Boolean))],
      student_type_time: [...new Set(filteredData.map(item => item?.student_type_time).filter(Boolean))],
      course_of_study: selectedDepartment.length > 0 ? selectedDepartment.flatMap(dept => departments[selectedUniversity]?.[dept] || []) : [...new Set(filteredData.map(item => item?.course_of_study).filter(Boolean))],
      hours_between_lectures: [...new Set(filteredData.map(item => item?.hours_between_lectures).filter(Boolean))],
      hours_per_week_lectures: [...new Set(filteredData.map(item => item?.hours_per_week_lectures).filter(Boolean))],
      hours_per_week_university_work: [...new Set(filteredData.map(item => item?.hours_per_week_university_work).filter(Boolean))],
      level_of_study: [...new Set(filteredData.map(item => item?.level_of_study).filter(Boolean))],
      timetable_preference: [...new Set(filteredData.map(item => item?.timetable_preference).filter(Boolean))],
      timetable_reasons: [...new Set(filteredData.map(item => item?.timetable_reasons).filter(Boolean))],
      timetable_impact: [...new Set(filteredData.map(item => item?.timetable_impact).filter(Boolean))],
      financial_support: [...new Set(filteredData.map(item => item?.financial_support).filter(Boolean))],
      financial_problems: [...new Set(filteredData.map(item => item?.financial_problems).filter(Boolean))],
      family_earning_class: [...new Set(filteredData.map(item => item?.family_earning_class).filter(Boolean))],
      form_of_employment: [...new Set(filteredData.map(item => item?.form_of_employment).filter(Boolean))],
      work_hours_per_week: [...new Set(filteredData.map(item => item?.work_hours_per_week).filter(Boolean))],
      cost_of_study: [...new Set(filteredData.map(item => item?.cost_of_study).filter(Boolean))],
      diet: [...new Set(filteredData.map(item => item?.diet).filter(Boolean))],
      well_hydrated: [...new Set(filteredData.map(item => item?.well_hydrated).filter(Boolean))],
      exercise_per_week: [...new Set(filteredData.map(item => item?.exercise_per_week).filter(Boolean))],
      alcohol_consumption: [...new Set(filteredData.map(item => item?.alcohol_consumption).filter(Boolean))],
      personality_type: [...new Set(filteredData.map(item => item?.personality_type).filter(Boolean))],
      physical_activities: [...new Set(filteredData.map(item => item?.physical_activities).filter(Boolean))],
      mental_health_activities: [...new Set(filteredData.map(item => item?.mental_health_activities).filter(Boolean))],
      hours_socialmedia: [...new Set(filteredData.map(item => item?.hours_socialmedia).filter(Boolean))],
      total_device_hours: [...new Set(filteredData.map(item => item?.total_device_hours).filter(Boolean))],
      hours_socialising: [...new Set(filteredData.map(item => item?.hours_socialising).filter(Boolean))],
      quality_of_life: [...new Set(filteredData.map(item => item?.quality_of_life).filter(Boolean))],
      feel_afraid: [...new Set(filteredData.map(item => item?.feel_afraid).filter(Boolean))],
      stress_in_general: [...new Set(filteredData.map(item => item?.stress_in_general).filter(Boolean))],
      stress_before_exams: [...new Set(filteredData.map(item => item?.stress_before_exams).filter(Boolean))],
      known_disabilities: [...new Set(filteredData.map(item => item?.known_disabilities).filter(Boolean))],
      sense_of_belonging: [...new Set(filteredData.map(item => item?.sense_of_belonging).filter(Boolean))],
      captured_at: getAcademicYearsList(data),
    };
  }, [data, selectedUniversity, selectedDepartment, filters, selectedYear]);

  const getDepartmentCounts = () => {
    const counts: { [key: string]: number } = {};
    
    enhancedData
      .filter(item => item.source === selectedUniversity)
      .forEach(item => {
        if (item.department) {
          counts[item.department] = (counts[item.department] || 0) + 1;
        }
      });
  
    return counts;
  };
  
  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const handleDepartmentChange = (event: any) => {
    const value = event.target.value;
    if (value.includes('all')) {
      if (selectedDepartment.length === Object.keys(departments[selectedUniversity] || {}).length) {
        setSelectedDepartment([]);
        onFilterChange('course_of_study', []);
      } else {
        const allDepartments = Object.keys(departments[selectedUniversity] || {});
        setSelectedDepartment(allDepartments);
        onFilterChange('course_of_study', allDepartments.flatMap(dept => departments[selectedUniversity]?.[dept] || []));
      }
    } else {
      setSelectedDepartment(value);
      onFilterChange('course_of_study', value.flatMap((dept: string) => departments[selectedUniversity]?.[dept] || []));
    }
  };


  
    const renderSelect = (key: string, values: any[]) => {
      const handleChange = async (event: any) => {
        const value = event.target.value as string[];
        setLoading(prev => ({ ...prev, [key]: true }));
        
        try {
          if (value.includes('all')) {
            if (filters[key as keyof FilterState]?.length === values.length) {
              onFilterChange(key as keyof FilterState, []);
            } else {
              onFilterChange(key as keyof FilterState, values);
            }
          } else {
            onFilterChange(key as keyof FilterState, value);
          }
        } finally {
          setLoading(prev => ({ ...prev, [key]: false }));
        }
      };
    
      const departmentCounts = getDepartmentCounts();
    
      return (
        <FormControl fullWidth sx={{ mt: 1, mb: 1 }}>
          <InputLabel>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</InputLabel>
          <Select
            multiple
            value={filters[key as keyof FilterState] || []}
            onChange={handleChange}
            renderValue={(selected) => (selected as string[]).join(', ')}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 48 * 4.5,
                  width: 250,
                },
              },
            }}
          >
            <MenuItem value="all">
              <Checkbox 
                checked={filters[key as keyof FilterState]?.length === values.length}
                indeterminate={
                  filters[key as keyof FilterState]?.length > 0 && 
                  filters[key as keyof FilterState]?.length < values.length
                }
              />
              <ListItemText primary="Select All" />
            </MenuItem>
            {values.map((value, index) => (
              <MenuItem key={`${value}-${index}`} value={value}>
                <Checkbox 
                  checked={filters[key as keyof FilterState]?.includes(value)}
                  disabled={loading[key]}
                />
                <ListItemText
                  primary={`(${key === 'course_of_study' ? getFilteredCount(data, key, value, filters) : departmentCounts[value]}) ${value} `}
                />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

  return (
    <div>
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', borderRadius: '5px', backgroundColor: '#ffff' }}>
        Year
      </Typography>
      <FormControl fullWidth sx={{ mt: 1, mb: 1 }}>
        <InputLabel>Year</InputLabel>
        <Select
  value={selectedYear}
  onChange={(e) => {
    const newYear = e.target.value;
    console.log('Year selected:', newYear);
    onYearChange(newYear);
  }}
>
  {getAcademicYearsList(data).map((year) => (
    <MenuItem key={year} value={year}>
      {year}
    </MenuItem>
  ))}
</Select>
      </FormControl>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', borderRadius: '5px', backgroundColor: '#ffff' }}>
        University
      </Typography>
      <FormControl fullWidth sx={{ mt: 1, mb: 1 }}>
        <InputLabel>University</InputLabel>
        <Select
            value={selectedUniversity}
            onChange={(e) => {
              const newUniversity = e.target.value;
              setSelectedUniversity(newUniversity);
              onUniversityChange(newUniversity);
              setSelectedDepartment([]); // Reset selected departments
              onFilterChange('course_of_study', []); // Reset course filter
            }}
            disabled={localStorage.getItem('university') !== 'All'}
          >
            {universities.map((university) => (
              <MenuItem key={university} value={university}>
                {university}
              </MenuItem>
            ))}
          </Select>
      </FormControl>

      {selectedUniversity && (
          <>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', borderRadius: '5px', backgroundColor: '#ffff' }}>
              Departments
            </Typography>
            <FormControl fullWidth sx={{ mt: 1, mb: 1 }}>
              <InputLabel>Department</InputLabel>
              <Select
                multiple
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                renderValue={(selected) => (selected as string[]).join(', ')}
              >
                <MenuItem value="all">
                  <Checkbox
                    checked={selectedDepartment.length === Object.keys(departments[selectedUniversity] || {}).length}
                    indeterminate={selectedDepartment.length > 0 && selectedDepartment.length < Object.keys(departments[selectedUniversity] || {}).length}
                  />
                  <ListItemText primary="Select All" />
                </MenuItem>
                {Object.keys(departments[selectedUniversity] || {}).map((dept) => {
                  const counts = getDepartmentCounts();
                  return (
                    <MenuItem key={dept} value={dept}>
                      <Checkbox checked={selectedDepartment.includes(dept)} />
                      <ListItemText primary={`(${counts[dept] || 0}) ${dept}`} />
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </>
        )}

      {selectedDepartment.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', borderRadius: '5px', backgroundColor: '#ffff' }}>
            Courses
          </Typography>
          {renderSelect('course_of_study', selectedDepartment.flatMap(dept => departments[selectedUniversity]?.[dept] || []))}
        </>
      )}

      <Box onClick={() => toggleSection('demographics')}>
        <Typography variant="h6" gutterBottom>
          Demographics
        </Typography>
      </Box>
      <Collapse in={openSections['demographics']}>
        {renderSelect('ethnic_group', uniqueValues.ethnic_group.filter(value => value !== 'Not Provided'))}
        {renderSelect('home_country', uniqueValues.home_country.filter(value => value !== 'Not Provided'))}
        {renderSelect('age', uniqueValues.age.sort((a, b) => a - b))}
        {renderSelect('gender', uniqueValues.gender.filter(value => value !== 'Not Provided'))}
      </Collapse>

      <Box onClick={() => toggleSection('academicContext')}>
        <Typography variant="h6" gutterBottom>
          Academic Context
        </Typography>
      </Box>
      <Collapse in={openSections['academicContext']}>
        {renderSelect('hours_between_lectures', uniqueValues.hours_between_lectures.sort((a, b) => a - b))}
        {renderSelect('hours_per_week_lectures', uniqueValues.hours_per_week_lectures.sort((a, b) => a - b))}
        {renderSelect('hours_per_week_university_work', uniqueValues.hours_per_week_university_work.sort((a, b) => a - b))}
        {renderSelect('level_of_study', uniqueValues.level_of_study.filter(value => value !== 'Not Provided'))}
        {renderSelect('timetable_preference', uniqueValues.timetable_preference.filter(value => value !== 'Not Provided'))}
        {renderSelect('timetable_reasons', uniqueValues.timetable_reasons.filter(value => value !== 'Not Provided'))}
        {renderSelect('timetable_impact', uniqueValues.timetable_impact.filter(value => value !== 'Not Provided'))}
      </Collapse>

      <Box onClick={() => toggleSection('socioeconomicFactors')}>
        <Typography variant="h6" gutterBottom>
          Socioeconomic Factors
        </Typography>
      </Box>
      <Collapse in={openSections['socioeconomicFactors']}>
        {renderSelect('financial_support', uniqueValues.financial_support.filter(value => value !== 'Not Provided'))}
        {renderSelect('financial_problems', uniqueValues.financial_problems.filter(value => value !== 'Not Provided'))}
        {renderSelect('family_earning_class', uniqueValues.family_earning_class.filter(value => value !== 'Not Provided'))}
        {renderSelect('form_of_employment', uniqueValues.form_of_employment.filter(value => value !== 'Not Provided'))}
        {renderSelect('work_hours_per_week', uniqueValues.work_hours_per_week.sort((a, b) => a - b))}
        {renderSelect('cost_of_study', uniqueValues.cost_of_study.sort((a, b) => a - b))}
      </Collapse>

      <Box onClick={() => toggleSection('lifestyleAndBehaviour')}>
        <Typography variant="h6" gutterBottom>
          Lifestyle and Behaviour
        </Typography>
      </Box>
      <Collapse in={openSections['lifestyleAndBehaviour']}>
        {renderSelect('diet', uniqueValues.diet.filter(value => value !== 'Not Provided'))}
        {renderSelect('well_hydrated', uniqueValues.well_hydrated.filter(value => value !== 'Not Provided'))}
        {renderSelect('exercise_per_week', uniqueValues.exercise_per_week.sort((a, b) => a - b))}
        {renderSelect('alcohol_consumption', uniqueValues.alcohol_consumption.filter(value => value !== 'Not Provided'))}
        {renderSelect('personality_type', uniqueValues.personality_type.filter(value => value !== 'Not Provided'))}
        {renderSelect('physical_activities', uniqueValues.physical_activities.filter(value => value !== 'Not Provided'))}
        {renderSelect('mental_health_activities', uniqueValues.mental_health_activities.filter(value => value !== 'Not Provided'))}
      </Collapse>

      <Box onClick={() => toggleSection('socialAndTechnologicalFactors')}>
        <Typography variant="h6" gutterBottom>
          Social and Technological Factors
        </Typography>
      </Box>
      <Collapse in={openSections['socialAndTechnologicalFactors']}>
        {renderSelect('hours_socialmedia', uniqueValues.hours_socialmedia.sort((a, b) => a - b))}
        {renderSelect('total_device_hours', uniqueValues.total_device_hours.sort((a, b) => a - b))}
        {renderSelect('hours_socialising', uniqueValues.hours_socialising.sort((a, b) => a - b))}
      </Collapse>

      <Box onClick={() => toggleSection('psychologicalAndEmotionalFactors')}>
        <Typography variant="h6" gutterBottom>
          Psychological and Emotional Factors
        </Typography>
      </Box>
      <Collapse in={openSections['psychologicalAndEmotionalFactors']}>
        {renderSelect('quality_of_life', uniqueValues.quality_of_life.filter(value => value !== 'Not Provided'))}
        {renderSelect('feel_afraid', uniqueValues.feel_afraid.filter(value => value !== 'Not Provided'))}
        {renderSelect('stress_in_general', uniqueValues.stress_in_general)}
        {renderSelect('stress_before_exams', uniqueValues.stress_before_exams.filter(value => value !== 'Not Provided'))}
        {renderSelect('known_disabilities', uniqueValues.known_disabilities.filter(value => value !== 'Not Provided'))}
        {renderSelect('sense_of_belonging', uniqueValues.sense_of_belonging.filter(value => value !== 'Not Provided'))}
      </Collapse>
    </Paper>
    </div>
  );
};