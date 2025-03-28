import React, { useState } from 'react';
import ProfilePage from './ProfilePage';
import ProfileCommunities from './ProfileCommunities';
import ProfilePublications from './ProfilePublications';
import ProfileComments from './ProfileComments';
import ProfileLikes from './ProfileLikes';
import '../../sharedStyles/ProfilePage.css';

const ProfileMain = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile Data' },
    { id: 'communities', label: 'My Communities' },
    { id: 'publications', label: 'My Publications' },
    { id: 'comments', label: 'My Comments' },
    { id: 'likes', label: 'My Likes' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfilePage />;
      case 'communities': return <ProfileCommunities />;
      case 'publications': return <ProfilePublications />;
      case 'comments': return <ProfileComments />;
      case 'likes': return <ProfileLikes />;
      default: return <ProfilePage />;
    }
  };

  return (
    <div className="profile-layout">
      <div className="profile-content">
        {renderTabContent()}
      </div>
      
      <div className="profile-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileMain;