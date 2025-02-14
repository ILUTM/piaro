import React, { useEffect, useState } from 'react';
import '../../sharedStyles/RightSideBar.css';

const RightSidebar = () => {
  const [lastVisited, setLastVisited] = useState([]);

  useEffect(() => {
    const storedVisited = JSON.parse(localStorage.getItem('lastVisitedPublications')) || [];
    setLastVisited(storedVisited);
  }, []);

  return (
    <div className="right-sidebar">
      <h3>Last Visited Publications</h3>
      <ul>
        {lastVisited.map((publication, index) => (
          <li key={index}>
            <a href={`/publication/${publication.id}`}>{publication.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RightSidebar;
