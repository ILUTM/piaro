import React from 'react';
import PublicationListItem from './PublicationListItem';
import useInfiniteScroll from './useInfiniteScroll';

const PublicationsList = ({ 
  publications, 
  onLoadMore, 
  hasMore, 
  isFetching, 
  contentTypeId,
  onLikeToggle 
}) => {
  const lastPublicationElementRef = useInfiniteScroll(hasMore, isFetching, onLoadMore);

  return (
    <ul className="publications-list">
      {publications.map((publication, index) => (
        <PublicationListItem
          key={publication.id}
          publication={publication}
          index={index}
          lastPublicationElementRef={index === publications.length - 1 ? lastPublicationElementRef : null}
          contentTypeId={contentTypeId}
          onLikeToggle={onLikeToggle}
        />
      ))}
    </ul>
  );
};

export default PublicationsList;