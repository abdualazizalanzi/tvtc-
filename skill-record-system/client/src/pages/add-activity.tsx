import React, { useState } from 'react';
import { useMutation } from 'react-query';
import ImageUploader from '../components/ImageUploader';

const AddActivity = () => {
  const [activityName, setActivityName] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [certificateFile, setCertificateFile] = useState(null);
  const [proofFiles, setProofFiles] = useState([]);

  const addActivityMutation = useMutation(async () => {
    const formData = new FormData();
    formData.append('name', activityName);
    formData.append('description', activityDescription);
    if (certificateFile) {
      formData.append('certificate', certificateFile);
    }
    proofFiles.forEach(file => {
      formData.append('proofFiles', file);
    });

    const response = await fetch('/api/activities', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Error adding activity');
    }

    return response.json();
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addActivityMutation.mutate();
  };

  return (
    <div className="add-activity">
      <h1>Add New Activity</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="activityName">Activity Name</label>
          <input
            type="text"
            id="activityName"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="activityDescription">Description</label>
          <textarea
            id="activityDescription"
            value={activityDescription}
            onChange={(e) => setActivityDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="certificateFile">Upload Certificate</label>
          <input
            type="file"
            id="certificateFile"
            accept=".pdf,.doc,.docx,.jpg,.png,.zip"
            onChange={(e) => setCertificateFile(e.target.files[0])}
            required
          />
        </div>
        <div>
          <ImageUploader
            value={proofFiles}
            onChange={setProofFiles}
            maxSize={10 * 1024 * 1024} // 10MB
            aspectRatio="any"
            placeholder="Upload proof files"
          />
        </div>
        <button type="submit" disabled={addActivityMutation.isLoading}>
          {addActivityMutation.isLoading ? 'Adding...' : 'Add Activity'}
        </button>
      </form>
      {addActivityMutation.isError && <p>Error adding activity: {addActivityMutation.error.message}</p>}
      {addActivityMutation.isSuccess && <p>Activity added successfully!</p>}
    </div>
  );
};

export default AddActivity;