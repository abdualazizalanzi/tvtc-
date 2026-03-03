import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleImageUpload = async (courseId, imageUrl) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/image`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      const updatedCourse = await response.json();
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course.id === updatedCourse.id ? updatedCourse : course
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Courses</h1>
      <ul>
        {courses.map((course) => (
          <li key={course.id}>
            <h2>{course.titleAr || course.titleEn}</h2>
            {course.imageUrl && <img src={course.imageUrl} alt={course.titleAr} />}
            <ImageUploader onUpload={(imageUrl) => handleImageUpload(course.id, imageUrl)} />
            <Link to={`/courses/${course.id}`}>View Details</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Courses;