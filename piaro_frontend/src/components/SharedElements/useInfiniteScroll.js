import { useCallback, useRef } from 'react';

const useInfiniteScroll = (hasMore, isFetching, setPageNumber) => {
  const observer = useRef();

  const lastElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isFetching) {
        setPageNumber(prevPageNumber => prevPageNumber + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [hasMore, isFetching]);

  return lastElementRef;
};

export default useInfiniteScroll;
