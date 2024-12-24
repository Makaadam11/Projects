export const loadCourses = async (university: string): Promise<string[]> => {
    try {
      const response = await fetch(`http://localhost:8000/api/courses/${university}`);
      if (!response.ok) throw new Error(`Failed to fetch courses: ${response.statusText}`);
      const data = await response.json();
      return data.courses;
    } catch (error) {
      console.error('Error loading courses:', error);
      return [];
    }
  };