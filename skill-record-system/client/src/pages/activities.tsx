import React, { useEffect, useState } from 'react';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities');
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Activities</h1>
      <ul>
        {activities.map(activity => (
          <li key={activity.id}>
            <h2>{activity.nameAr} / {activity.nameEn}</h2>
            <p>Status: {activity.status}</p>
            <p>Description: {activity.descriptionAr} / {activity.descriptionEn}</p>
            {/* Placeholder for images */}
            {/* <img src={activity.imageUrl} alt={activity.nameAr} /> */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Activities;