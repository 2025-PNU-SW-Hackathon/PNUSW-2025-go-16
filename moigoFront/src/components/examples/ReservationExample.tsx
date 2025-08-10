import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import {
  useGetReservations,
  useCreateReservation,
  useJoinReservation,
  useGetMatches,
  useGetMatchDetail,
  useGetMatchReservations,
} from '@/hooks/queries/useReservationQueries';
import {
  useLogin,
  useSignup,
} from '@/hooks/queries/useAuthQueries';
import {
  useGetMyInfo,
  useUpdateProfile,
} from '@/hooks/queries/useUserQueries';
import {
  useGetMatchingHistory,
} from '@/hooks/queries/useUserQueries';
import {
  useGetChatRooms,
  useEnterChatRoom,
} from '@/hooks/queries/useChatQueries';
import {
  useGetPaymentStatus,
  useRequestPayment,
} from '@/hooks/queries/usePaymentQueries';
import {
  useCreateReview,
  useGetMyReviews,
} from '@/hooks/queries/useReviewQueries';
import type {
  CreateReservationRequestDTO,
} from '@/types/DTO/reservations';
import type {
  LoginRequestDTO,
  SignupRequestDTO,
} from '@/types/DTO/auth';
import type {
  UpdateProfileRequestDTO,
} from '@/types/DTO/users';
import type {
  CreateReviewRequestDTO,
} from '@/types/DTO/reviews';

export const ReservationExample: React.FC = () => {
  const [queryParams, setQueryParams] = useState({
    region: '',
    date: '',
    category: undefined as string | undefined,
    keyword: '',
  });

  // 예약 관련 훅
  const { data: reservations, isLoading, error } = useGetReservations(queryParams);
  const createReservationMutation = useCreateReservation();
  const joinReservationMutation = useJoinReservation();

  // 경기 관련 훅
  const { data: matches, isLoading: matchesLoading } = useGetMatches();
  const { data: matchDetail, isLoading: matchDetailLoading } = useGetMatchDetail(123456);
  const { data: matchReservations, isLoading: matchReservationsLoading } = useGetMatchReservations(123456);

  // 인증 관련 훅
  const loginMutation = useLogin();
  const signupMutation = useSignup();
  const { data: myInfo } = useGetMyInfo();
  const updateProfileMutation = useUpdateProfile();
  const { data: matchingHistory } = useGetMatchingHistory();
  const { data: chatRooms } = useGetChatRooms();
  const enterChatRoomMutation = useEnterChatRoom();
  const { data: paymentStatus } = useGetPaymentStatus(1); // 예시로 roomId 1 사용
  const requestPaymentMutation = useRequestPayment();
  const createReviewMutation = useCreateReview();
  const { data: myReviews } = useGetMyReviews();

  // POST /reservations - 모임 생성 예시
  const handleCreateReservation = () => {
    const newReservation: CreateReservationRequestDTO = {
      store_id: 1, // 숫자로 변경
      reservation_start_time: '2025-07-28T19:00:00',
      reservation_end_time: '2025-07-28T21:00:00',
      reservation_match: '맨시티 vs 첼시',
      reservation_bio: '맥주한잔하며 즐겁게 보실분들!',
      reservation_max_participant_cnt: 6,
      reservation_match_category: 'sports', // 문자열로 변경
    };

    createReservationMutation.mutate(newReservation);
  };

  // POST /reservations/{reservation_id}/join - 모임 참여 예시
  const handleJoinReservation = (reservationId: number) => {
    joinReservationMutation.mutate(reservationId);
  };

  // POST /auth/login - 로그인 예시
  const handleLogin = () => {
    const loginData: LoginRequestDTO = {
      user_id: 'user123',
      user_pwd: 'password123',
    };

    loginMutation.mutate(loginData);
  };

  // POST /auth/signup - 회원가입 예시
  const handleSignup = () => {
    const signupData: SignupRequestDTO = {
      user_id: 'user123',
      user_pwd: 'strongPassword123!',
      user_email: 'user123@example.com',
      user_name: '홍길동',
      user_phone_number: '010-1234-5678',
    };

    signupMutation.mutate(signupData);
  };

  // PUT /users/me - 프로필 수정 예시
  const handleUpdateProfile = () => {
    const profileData: UpdateProfileRequestDTO = {
      user_name: '김서연',
      user_phone_number: '010-1234-5678',
      user_email: 'ptw0414@naver.com',
      user_bio: '안녕하세요! 새로운 사람들과의 만남을 좋아하는 김서연입니다.',
    };

    updateProfileMutation.mutate(profileData);
  };

  // POST /chat/rooms/enter - 채팅방 입장 예시
  const handleEnterChatRoom = () => {
    enterChatRoomMutation.mutate({ group_id: 101 });
  };

  // POST /chat/rooms/{roomId}/payments/request - 결제 요청 예시
  const handleRequestPayment = () => {
    requestPaymentMutation.mutate({
      roomId: 1,
      data: {
        amount: 5000,
        message: '모임 확정을 위해 예약금을 결제해주세요!',
      },
    });
  };

  // POST /reviews - 리뷰 작성 예시
  const handleCreateReview = () => {
    const reviewData: CreateReviewRequestDTO = {
      store_id: 'store_123',
      review_text: '너무 맛있고 분위기도 좋았어요!',
      review_rating: 5,
      review_visited_time: '2025-07-27T19:00:00',
      images: ['image1.jpg', 'image2.jpg'],
    };

    createReviewMutation.mutate(reviewData);
  };

  if (isLoading || matchesLoading) {
    return <Text>로딩 중...</Text>;
  }

  if (error) {
    return <Text>에러: {error.message}</Text>;
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        API 테스트 예시
      </Text>

      {/* 경기 관련 API */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          경기 관련 API
        </Text>
        
        <TouchableOpacity
          onPress={() => console.log('경기 목록:', matches)}
          style={{ backgroundColor: '#FF6B6B', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            GET /matches - 경기 목록 조회 ({matches?.data?.length || 0}개)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => console.log('경기 상세:', matchDetail)}
          style={{ backgroundColor: '#4ECDC4', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            GET /matches/123456 - 경기 상세 정보
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => console.log('경기별 모임:', matchReservations)}
          style={{ backgroundColor: '#45B7D1', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            GET /matches/123456/reservations - 경기별 모임 ({matchReservations?.data?.length || 0}개)
          </Text>
        </TouchableOpacity>
      </View>

      {/* 예약 관련 API */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          예약 관련 API
        </Text>
        
        <TouchableOpacity
          onPress={() => console.log('예약 목록:', reservations)}
          style={{ backgroundColor: '#96CEB4', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            GET /reservations - 예약 목록 조회 ({reservations?.data?.length || 0}개)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCreateReservation}
          style={{ backgroundColor: '#34C759', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            POST /reservations - 새 모임 생성
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleJoinReservation(1)}
          style={{ backgroundColor: '#FF9500', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            POST /reservations/1/join - 모임 참여
          </Text>
        </TouchableOpacity>
      </View>

      {/* 인증 관련 API */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          인증 관련 API
        </Text>

        <TouchableOpacity
          onPress={handleLogin}
          style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            POST /auth/login - 로그인
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignup}
          style={{ backgroundColor: '#FF9500', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            POST /auth/signup - 회원가입
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleUpdateProfile}
          style={{ backgroundColor: '#5856D6', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            PUT /users/me - 프로필 수정
          </Text>
        </TouchableOpacity>
      </View>

      {/* 채팅 관련 API */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          채팅 관련 API
        </Text>

        <TouchableOpacity
          onPress={() => console.log('채팅방 목록:', chatRooms)}
          style={{ backgroundColor: '#FF2D92', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            GET /chat/rooms - 채팅방 목록 ({chatRooms?.data?.length || 0}개)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleEnterChatRoom}
          style={{ backgroundColor: '#FF2D92', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            POST /chat/rooms/enter - 채팅방 입장
          </Text>
        </TouchableOpacity>
      </View>

      {/* 결제 관련 API */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          결제 관련 API
        </Text>

        <TouchableOpacity
          onPress={() => console.log('결제 상태:', paymentStatus)}
          style={{ backgroundColor: '#FF3B30', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            GET /chat/rooms/1/payments/status - 결제 상태
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRequestPayment}
          style={{ backgroundColor: '#FF3B30', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            POST /chat/rooms/1/payments/request - 결제 요청
          </Text>
        </TouchableOpacity>
      </View>

      {/* 리뷰 관련 API */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          리뷰 관련 API
        </Text>

        <TouchableOpacity
          onPress={() => console.log('내 리뷰:', myReviews)}
          style={{ backgroundColor: '#FF9500', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            GET /reviews/me - 내 리뷰 목록 ({myReviews?.data?.length || 0}개)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCreateReview}
          style={{ backgroundColor: '#FF9500', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            POST /reviews - 리뷰 작성
          </Text>
        </TouchableOpacity>
      </View>

      {/* 사용자 정보 */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          사용자 정보
        </Text>

        <TouchableOpacity
          onPress={() => console.log('내 정보:', myInfo)}
          style={{ backgroundColor: '#5856D6', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            GET /users/me - 내 정보
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => console.log('매칭 이력:', matchingHistory)}
          style={{ backgroundColor: '#5856D6', padding: 15, borderRadius: 8, marginBottom: 10 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            GET /users/me/matching-history - 매칭 이력 ({matchingHistory?.data?.length || 0}개)
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}; 