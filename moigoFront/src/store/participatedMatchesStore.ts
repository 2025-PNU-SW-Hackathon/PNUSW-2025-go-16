import { create } from 'zustand';
import { participatedMatches } from '@/mocks/reservations';
import type { ParticipatedMatch, MatchCategory, SortOption } from '@/types/reservation';

interface ParticipatedMatchesState {
  // 상태
  matches: ParticipatedMatch[];
  selectedCategory: MatchCategory;
  selectedSort: SortOption;
  isLoading: boolean;
  
  // 액션
  setCategory: (category: MatchCategory) => void;
  setSort: (sort: SortOption) => void;
  writeReview: (matchId: string) => void;
  setLoading: (loading: boolean) => void;
  
  // 계산된 값
  getFilteredAndSortedMatches: () => ParticipatedMatch[];
}

export const useParticipatedMatchesStore = create<ParticipatedMatchesState>((set, get) => ({
  // 초기 상태
  matches: participatedMatches,
  selectedCategory: '전체',
  selectedSort: '최신순',
  isLoading: false,
  
  // 카테고리 설정
  setCategory: (category: MatchCategory) => {
    set({ selectedCategory: category });
  },
  
  // 정렬 설정
  setSort: (sort: SortOption) => {
    set({ selectedSort: sort });
  },
  
  // 리뷰 작성
  writeReview: (matchId: string) => {
    set((state) => ({
      matches: state.matches.map((match) =>
        match.id === matchId ? { ...match, hasReview: true } : match
      ),
    }));
  },
  
  // 로딩 상태 설정
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  // 필터링 및 정렬된 매칭 목록
  getFilteredAndSortedMatches: () => {
    const { matches, selectedCategory, selectedSort } = get();
    
    // 카테고리 필터링
    let filtered = matches;
    if (selectedCategory !== '전체') {
      filtered = matches.filter((match) => match.category === selectedCategory);
    }
    
    // 정렬
    const sorted = [...filtered].sort((a, b) => {
      // 날짜 파싱 함수
      const parseDate = (dateStr: string, timeStr: string) => {
        // "2024년 7월 10일" -> "2024-07-10"
        const dateMatch = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
        if (!dateMatch) return new Date(0);
        
        const year = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[2]) - 1; // 월은 0부터 시작
        const day = parseInt(dateMatch[3]);
        
        // "오후 6:30" -> 18:30
        const timeMatch = timeStr.match(/(오전|오후)\s*(\d{1,2}):(\d{2})/);
        if (!timeMatch) return new Date(year, month, day);
        
        const period = timeMatch[1];
        let hour = parseInt(timeMatch[2]);
        const minute = parseInt(timeMatch[3]);
        
        if (period === '오후' && hour !== 12) hour += 12;
        if (period === '오전' && hour === 12) hour = 0;
        
        return new Date(year, month, day, hour, minute);
      };
      
      const dateA = parseDate(a.date, a.time);
      const dateB = parseDate(b.date, b.time);
      
      if (selectedSort === '최신순') {
        return dateB.getTime() - dateA.getTime();
      } else {
        return dateA.getTime() - dateB.getTime();
      }
    });
    
    console.log('정렬 결과:', sorted.map(m => ({ title: m.title, date: m.date, time: m.time })));
    
    return sorted;
  },
})); 