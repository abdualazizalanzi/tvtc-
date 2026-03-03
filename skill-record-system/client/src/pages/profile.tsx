import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/Avatar';
import { ImageUploader } from '../components/ImageUploader';
import { Button } from '../components/Button';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [initials, setInitials] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch user profile data from API
    const fetchUserProfile = async () => {
      const response = await fetch('/api/profile');
      const data = await response.json();
      setUser(data);
      setInitials(data.name ? data.name.charAt(0) : '');
    };

    fetchUserProfile();
  }, []);

  const handleImageUpload = async (url) => {
    // Update user profile with new image URL
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profileImageUrl: url }),
    });

    if (response.ok) {
      const updatedUser = await response.json();
      setUser(updatedUser);
    }
  };

  return (
    <div className="profile-container">
      <h1>الملف الشخصي</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user?.profileImageUrl} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute bottom-0 right-0 rounded-full"
            onClick={() => fileInputRef.current?.click()}
          >
            <span>📷</span>
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const formData = new FormData();
              formData.append('file', file);
              fetch('/api/upload/profile-image', {
                method: 'POST',
                body: formData,
              })
              .then(response => response.json())
              .then(data => handleImageUpload(data.url));
            }
          }}
          className="hidden"
        />
      </div>
      <div className="profile-details">
        <h2>تفاصيل المستخدم</h2>
        <p>الاسم: {user?.name}</p>
        <p>البريد الإلكتروني: {user?.email}</p>
        {/* Add more user details as needed */}
      </div>
    </div>
  );
};

export default Profile;