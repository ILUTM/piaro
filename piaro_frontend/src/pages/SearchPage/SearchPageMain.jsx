import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchCommunity from './SearchCommunity';
import SearchPublication from './SearchPublication';
import '../../sharedStyles/SearchPage.css'; // Import the CSS file

const SearchPageMain = () => {
  const [activeTab, setActiveTab] = useState('publications');
  const [query, setQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newQuery = params.get('query') || '';
    if (newQuery !== query) {
      setQuery(newQuery);
    }
  }, [location, query]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'publications':
        return <SearchPublication query={query} />;
      case 'communities':
        return <SearchCommunity query={query} />;
      default:
        return <SearchPublication query={query} />;
    }
  };

  return (
    <div className="search-page-wrapper">
      <div className="tabs">
        <button onClick={() => setActiveTab('publications')}>Publications</button>
        <button onClick={() => setActiveTab('communities')}>Communities</button>
      </div>
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SearchPageMain;
