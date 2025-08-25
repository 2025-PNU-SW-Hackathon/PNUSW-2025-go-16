import { ChatMessage, MessageGroup, SystemMessageType } from '@/types/ChatTypes';

/**
 * 메시지 배열을 그룹화하여 렌더링에 최적화된 형태로 변환
 * @param messages - 백엔드에서 받은 메시지 배열
 * @param currentUserId - 현재 사용자 ID
 * @returns 그룹화된 메시지 배열
 */
export function groupMessages(messages: ChatMessage[], currentUserId: string): MessageGroup[] {
  const groups: MessageGroup[] = [];

  // console.log('=== 메시지 그룹화 시작 ===');
  // console.log('현재 사용자 ID:', currentUserId);
  // console.log('입력 메시지 개수:', messages.length);

  // 메시지를 시간 순서대로 정렬
  const sortedMessages = [...messages].sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );

  sortedMessages.forEach((msg, index) => {
    // console.log(`\n[${index + 1}] 메시지 처리:`, {
    //   id: msg.id,
    //   senderId: msg.senderId,
    //   senderName: msg.senderName,
    //   type: msg.type,
    //   message: msg.message.substring(0, 30) + '...'
    // });

    const lastGroup = groups[groups.length - 1];
    
    // 시스템 메시지는 별도 그룹으로 처리
    if (msg.type === 'system') {
      // console.log('→ 시스템 메시지: 새로운 그룹 생성');
      groups.push({
        id: `system-${msg.id}`,
        senderId: 'system',
        senderName: '',
        senderAvatar: '',
        isMyMessage: false,
        messages: [msg],
        type: 'system'
      });
      return;
    }

    // 현재 사용자의 메시지인지 확인
    const isMyMessage = msg.senderId === currentUserId;
    // console.log('→ 내 메시지 여부:', isMyMessage);

    // 🆕 가게 공유 메시지는 항상 별도 그룹으로 처리
    if (msg.type === 'store_share') {
      // console.log('→ 가게 공유 메시지: 새로운 그룹 생성');
      groups.push({
        id: `store-share-${msg.senderId}-${msg.timestamp.getTime()}`,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderAvatar: msg.senderAvatar,
        isMyMessage: isMyMessage,
        messages: [msg],
        type: 'user'
      });
      return;
    }

    // 같은 사용자의 연속된 메시지인지 확인 (일반 텍스트 메시지만)
    if (lastGroup && 
        lastGroup.type === 'user' &&
        lastGroup.senderId === msg.senderId && 
        lastGroup.isMyMessage === isMyMessage &&
        // 🆕 마지막 그룹의 마지막 메시지가 가게 공유가 아닌 경우에만 그룹화
        lastGroup.messages[lastGroup.messages.length - 1].type !== 'store_share') {
      // 기존 그룹에 메시지 추가
      // console.log('→ 기존 그룹에 메시지 추가');
      lastGroup.messages.push(msg);
    } else {
      // 새로운 그룹 생성
      // console.log('→ 새로운 그룹 생성');
      groups.push({
        id: `${msg.senderId}-${msg.timestamp.getTime()}`,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderAvatar: msg.senderAvatar,
        isMyMessage: isMyMessage,
        messages: [msg],
        type: 'user'
      });
    }
  });

  // console.log('\n=== 그룹화 결과 ===');
  // groups.forEach((group, index) => {
  //   console.log(`\n[그룹 ${index + 1}]`, {
  //     id: group.id,
  //     senderId: group.senderId,
  //     senderName: group.senderName,
  //     type: group.type,
  //     isMyMessage: group.isMyMessage,
  //     messageCount: group.messages.length,
  //     messages: group.messages.map(msg => ({
  //       id: msg.id,
  //       type: msg.type,
  //       message: msg.message.substring(0, 20) + '...',
  //       status: msg.status, // 상태도 로깅
  //       isTemporary: msg.isTemporary
  //     }))
  //   });
  // });

  // console.log('\n총 그룹 개수:', groups.length);
  return groups;
}

/**
 * 메시지 타입에 따른 렌더링 컴포넌트 결정
 */
export function getMessageComponentType(message: ChatMessage): 'text' | 'store' | 'system' | 'store_share' {
  return message.type;
}

/**
 * 시스템 메시지 생성 유틸리티 함수
 */
export function createSystemMessage(
  messageType: SystemMessageType,
  userName: string,
  userId: string,
  kickedBy?: string
): ChatMessage {
  const now = new Date();
  const messageId = `system-${now.getTime()}`;
  
  let message = '';
  switch (messageType) {
    case 'system_join':
      message = `${userName}님이 모임에 참여하셨습니다.`;
      break;
    case 'system_leave':
      message = `${userName}님이 모임을 나가셨습니다.`;
      break;
    case 'system_kick':
      message = `${userName}님이 강퇴되었습니다.`;
      break;
  }

  return {
    id: messageId,
    senderId: 'system',
    senderName: '시스템',
    senderAvatar: '⚙️',
    message,
    timestamp: now,
    type: 'system',
    message_type: messageType,
    user_name: userName,
    user_id: userId,
    kicked_by: kickedBy
  };
}

/**
 * 정산 시스템 메시지 생성 유틸리티 함수
 */
export function createPaymentSystemMessage(
  messageType: 'system_payment_start' | 'system_payment_update' | 'system_payment_completed',
  paymentData: {
    paymentId: string;
    storeName: string;
    paymentPerPerson: number;
    totalAmount: number;
    participantCount: number;
    deadline?: string;
    bankInfo?: {
      bank_name: string;
      account_number: string;
      account_holder: string;
    };
    progress?: {
      completed: number;
      total: number;
    };
  }
): ChatMessage {
  const now = new Date();
  const messageId = `payment-${messageType}-${now.getTime()}`;
  
  let message = '';
  
  switch (messageType) {
    case 'system_payment_start':
      message = `💰 정산이 시작되었습니다!

📍 ${paymentData.storeName}
💳 1인당 예약금: ${paymentData.paymentPerPerson.toLocaleString()}원
💰 총 금액: ${paymentData.totalAmount.toLocaleString()}원
👥 참여자: ${paymentData.participantCount}명

${paymentData.bankInfo ? `🏦 입금 계좌
은행: ${paymentData.bankInfo.bank_name}
계좌번호: ${paymentData.bankInfo.account_number}
예금주: ${paymentData.bankInfo.account_holder}

` : ''}${paymentData.deadline ? `⏰ 마감일: ${new Date(paymentData.deadline).toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
` : ''}📊 입금 현황: 0/${paymentData.participantCount}명 완료`;
      break;
      
    case 'system_payment_update':
      const { completed = 0, total = paymentData.participantCount } = paymentData.progress || {};
      message = `💰 정산이 시작되었습니다!

📍 ${paymentData.storeName}
💳 1인당 예약금: ${paymentData.paymentPerPerson.toLocaleString()}원
💰 총 금액: ${paymentData.totalAmount.toLocaleString()}원
👥 참여자: ${paymentData.participantCount}명

${paymentData.bankInfo ? `🏦 입금 계좌
은행: ${paymentData.bankInfo.bank_name}
계좌번호: ${paymentData.bankInfo.account_number}
예금주: ${paymentData.bankInfo.account_holder}

` : ''}${paymentData.deadline ? `⏰ 마감일: ${new Date(paymentData.deadline).toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
` : ''}📊 입금 현황: ${completed}/${total}명 완료`;
      break;
      
    case 'system_payment_completed':
      message = `✅ 정산이 완료되었습니다!

💰 총 ${paymentData.totalAmount.toLocaleString()}원이 모두 입금되었습니다.
👥 모든 참여자(${paymentData.participantCount}명)가 입금을 완료했습니다.

감사합니다! 🎉`;
      break;
  }

  return {
    id: messageId,
    senderId: 'system',
    senderName: '시스템',
    senderAvatar: '💰',
    message,
    timestamp: now,
    type: 'system',
    message_type: messageType,
    payment_id: paymentData.paymentId,
    payment_progress: paymentData.progress ? {
      completed: paymentData.progress.completed,
      total: paymentData.progress.total,
      is_fully_completed: paymentData.progress.completed === paymentData.progress.total
    } : undefined
  };
}

/**
 * 메시지 업데이트 유틸리티 함수
 */
export function updateMessageInList(
  messages: ChatMessage[],
  messageId: string,
  updates: Partial<ChatMessage>
): ChatMessage[] {
  return messages.map(msg =>
    msg.id === messageId
      ? { ...msg, ...updates, updated: true }
      : msg
  );
}

/**
 * 정산 진행률 메시지 찾기
 */
export function findPaymentProgressMessage(
  messages: ChatMessage[],
  paymentId: string
): ChatMessage | undefined {
  return messages.find(msg => 
    msg.payment_id === paymentId && 
    (msg.message_type === 'system_payment_start' || msg.message_type === 'system_payment_update')
  );
} 