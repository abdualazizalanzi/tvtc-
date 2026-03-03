import React from 'react';
import { useQuery } from 'react-query';
import { fetchUserProfile, fetchUserActivities } from '../api'; // Assuming you have an API file for fetching data

const CVGenerator = () => {
  const { data: profile, isLoading: loadingProfile } = useQuery('userProfile', fetchUserProfile);
  const { data: activities, isLoading: loadingActivities } = useQuery('userActivities', fetchUserActivities);

  if (loadingProfile || loadingActivities) {
    return <div>Loading...</div>;
  }

  return (
    <div className="cv-generator">
      <h1>Curriculum Vitae</h1>
      <div className="profile-section">
        <h2>Profile</h2>
        <img src={profile.profileImageUrl} alt="Profile" />
        <p>Name: {profile.name}</p>
        <p>Email: {profile.email}</p>
        <p>Bio: {profile.bio}</p>
      </div>
      <div className="activities-section">
        <h2>Activities</h2>
        <ul>
          {activities.map(activity => (
            <li key={activity.id}>
              <h3>{activity.name}</h3>
              <p>{activity.description}</p>
              <p>Status: {activity.status}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CVGenerator;