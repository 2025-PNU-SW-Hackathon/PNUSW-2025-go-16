import { useState } from 'react';

// 페이지네이션 관련 훅
export function useEventPagination() {
  const [currentPage, setCurrentPage] = useState(0);

  return {
    currentPage,
    setCurrentPage,
  };
}
