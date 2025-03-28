import { useCallback, useRef, useEffect } from 'react';

const useInfiniteScroll = (hasMore, isFetching, onLoadMore) => {
  const observer = useRef();
  
  const lastElementRef = useCallback(node => {
    if (isFetching) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    }, {
      rootMargin: '100px' // Trigger load when element is 100px from viewport
    });
    
    if (node) observer.current.observe(node);
  }, [hasMore, isFetching, onLoadMore]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return lastElementRef;
};

export default useInfiniteScroll;