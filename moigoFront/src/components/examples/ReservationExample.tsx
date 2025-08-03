import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useGetReservations, useCreateReservation, useJoinReservation, useCancelReservation, useGetReservationDetail } from '../../hooks/useReservations';
import { useLogin, useSignup } from '../../hooks/useAuth';
import { useGetMyInfo, useUpdateProfile, useGetMatchingHistory } from '../../hooks/useUsers';
import { useGetChatRooms, useEnterChatRoom } from '../../hooks/useChat';
import { useGetPaymentStatus, useRequestPayment } from '../../hooks/usePayments';
import { useCreateReview, useGetMyReviews } from '../../hooks/useReviews';
import type { CreateReservationRequestDTO } from '../../types/DTO/reservations';
import type { SignupRequestDTO, LoginRequestDTO } from '../../types/DTO/auth';
import type { UpdateProfileRequestDTO } from '../../types/DTO/users';
import type { CreateReviewRequestDTO } from '../../types/DTO/reviews';

export const ReservationExample: React.FC = () => {
  const [queryParams, setQueryParams] = useState({
    region: '',
    date: '',
    category: undefined as number | undefined,
    keyword: '',
  });

  // 훅 사용
  const { data: reservations, isLoading, error } = useGetReservations(queryParams);
  const createReservationMutation = useCreateReservation();
  const joinReservationMutation = useJoinReservation();
  const cancelReservationMutation = useCancelReservation();
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
      store_id: 'store_123',
      reservation_start_time: '2025-07-28T19:00:00',
      reservation_end_time: '2025-07-28T21:00:00',
      reservation_match: '맨시티 vs 첼시',
      reservation_bio: '맥주한잔하며 즐겁게 보실분들!',
      reservation_max_participant_cnt: 6,
      reservation_match_category: 1,
    };

    createReservationMutation.mutate(newReservation);
  };

  // POST /reservations/{reservation_id}/join - 모임 참여 예시
  const handleJoinReservation = (reservationId: number) => {
    joinReservationMutation.mutate(reservationId);
  };

  // DELETE /reservations/{reservation_id} - 모임 취소 예시
  const handleCancelReservation = (reservationId: number) => {
    cancelReservationMutation.mutate(reservationId);
  };

  // POST /auth/login - 로그인 예시
  const handleLogin = () => {
    const loginData: LoginRequestDTO = {
      user_id: 'user123',
      user_password: 'password123',
    };

    loginMutation.mutate(loginData);
  };

  // POST /auth/signup - 회원가입 예시
  const handleSignup = () => {
    const signupData: SignupRequestDTO = {
      user_id: 'user123',
      user_password: 'strongPassword123!',
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

  if (isLoading) {
    return <Text>로딩 중...</Text>;
  }

  if (error) {
    return <Text>에러: {error.message}</Text>;
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
        API 사용 예시 (URL 경로별)
      </Text>

      {/* GET /reservations - 모임 조회 결과 */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          모임 목록 ({reservations?.data?.length || 0}개)
        </Text>
        {reservations?.data?.map((reservation) => (
          <View key={reservation.reservation_id} style={{ marginBottom: 10, padding: 10, borderWidth: 1 }}>
            <Text>ID: {reservation.reservation_id}</Text>
            <Text>매장: {reservation.store_name}</Text>
            <Text>경기: {reservation.reservation_match}</Text>
            <Text>참여자: {reservation.reservation_participant_cnt}/{reservation.reservation_max_participant_cnt}</Text>
            <View style={{ flexDirection: 'row', gap: 5, marginTop: 5 }}>
              <TouchableOpacity
                onPress={() => handleJoinReservation(reservation.reservation_id)}
                style={{ backgroundColor: '#007AFF', padding: 8, borderRadius: 5, flex: 1 }}
              >
                <Text style={{ color: 'white', textAlign: 'center' }}>참여하기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleCancelReservation(reservation.reservation_id)}
                style={{ backgroundColor: '#FF3B30', padding: 8, borderRadius: 5, flex: 1 }}
              >
                <Text style={{ color: 'white', textAlign: 'center' }}>취소하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* 액션 버튼들 */}
      <View style={{ gap: 10 }}>
        <TouchableOpacity
          onPress={handleCreateReservation}
          style={{ backgroundColor: '#34C759', padding: 15, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            POST /reservations - 새 모임 생성
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            POST /auth/login - 로그인
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignup}
          style={{ backgroundColor: '#FF9500', padding: 15, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            POST /auth/signup - 회원가입
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleUpdateProfile}
          style={{ backgroundColor: '#5856D6', padding: 15, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            PUT /users/me - 프로필 수정
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleEnterChatRoom}
          style={{ backgroundColor: '#FF2D92', padding: 15, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            POST /chat/rooms/enter - 채팅방 입장
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRequestPayment}
          style={{ backgroundColor: '#FFCC00', padding: 15, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            POST /chat/rooms/payments/request - 결제 요청
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCreateReview}
          style={{ backgroundColor: '#FF6B35', padding: 15, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            POST /reviews - 리뷰 작성
          </Text>
        </TouchableOpacity>
      </View>

      {/* 상태 표시 */}
      {createReservationMutation.isPending && <Text>모임 생성 중...</Text>}
      {joinReservationMutation.isPending && <Text>모임 참여 중...</Text>}
      {cancelReservationMutation.isPending && <Text>모임 취소 중...</Text>}
      {loginMutation.isPending && <Text>로그인 중...</Text>}
      {signupMutation.isPending && <Text>회원가입 중...</Text>}
      {updateProfileMutation.isPending && <Text>프로필 수정 중...</Text>}
      {enterChatRoomMutation.isPending && <Text>채팅방 입장 중...</Text>}
      {requestPaymentMutation.isPending && <Text>결제 요청 중...</Text>}
      {createReviewMutation.isPending && <Text>리뷰 작성 중...</Text>}

      {/* 데이터 표시 */}
      {myInfo && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
          <Text style={{ fontWeight: 'bold' }}>내 정보:</Text>
          <Text>이름: {myInfo.data.user_name}</Text>
          <Text>이메일: {myInfo.data.user_email}</Text>
        </View>
      )}

      {matchingHistory && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
          <Text style={{ fontWeight: 'bold' }}>매칭 이력 ({matchingHistory.data.length}개):</Text>
          {matchingHistory.data.map((match, index) => (
            <Text key={index}>- {match.reservation_match} ({match.status})</Text>
          ))}
        </View>
      )}

      {chatRooms && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
          <Text style={{ fontWeight: 'bold' }}>채팅방 ({chatRooms.data.length}개):</Text>
          {chatRooms.data.map((room) => (
            <Text key={room.chat_room_id}>- {room.chat_room_name}</Text>
          ))}
        </View>
      )}

      {paymentStatus && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
          <Text style={{ fontWeight: 'bold' }}>결제 현황:</Text>
          <Text>결제 완료: {paymentStatus.data.current_paid_participants_count}/{paymentStatus.data.required_participants_count}</Text>
        </View>
      )}

      {myReviews && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
          <Text style={{ fontWeight: 'bold' }}>내 리뷰 ({myReviews.data.length}개):</Text>
          {myReviews.data.map((review) => (
            <Text key={review.review_id}>- {review.store_name} ({review.review_rating}점)</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}; 