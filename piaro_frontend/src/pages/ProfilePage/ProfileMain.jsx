import React, { useState } from 'react';
import ProfilePage from './ProfilePage';
import ProfileCommunities from './ProfileCommunities';
import ProfilePublications from './ProfilePublications';
import ProfileComments from './ProfileComments';
import '../../sharedStyles/ProfileMain.css'; 

const ProfileMain = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfilePage />;
      case 'communities':
        return <ProfileCommunities />;
      case 'publications':
        return <ProfilePublications />;
      case 'comments':
        return <ProfileComments />;
      default:
        return <ProfilePage />;
    }
  };

  return (
    <div className="profile-container">
      <div className="tabs">
        <button onClick={() => setActiveTab('profile')}>Profile Data</button>
        <button onClick={() => setActiveTab('communities')}>My Communities</button>
        <button onClick={() => setActiveTab('publications')}>My Publications</button>
        <button onClick={() => setActiveTab('comments')}>My Comments</button>
      </div>
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfileMain;
