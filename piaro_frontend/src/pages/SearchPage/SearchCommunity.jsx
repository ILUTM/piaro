import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../sharedStyles/SearchPage.css'; // Import the CSS file

const SearchCommunity = ({ query }) => {
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (query) {
      fetch(`http://127.0.0.1:8000/api/communities/search_by_name?query=${query}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log(data);
          setResults(data);
        })
        .catch(error => {
          console.error("There was an error fetching the search results!", error);
        });
    }
  }, [query]);

  const handleCommunityClick = (id) => {
    navigate(`/community/${id}`);
  };

  return (
    <div className="search-results-wrapper">
      <h2>Search Results for Communities</h2>
      {results.length > 0 ? (
        <ul>
          {results.map(community => (
            <li key={community.id} onClick={() => handleCommunityClick(community.id)}>{community.name}</li>
          ))}
        </ul>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default SearchCommunity;
