// 기존 거절된 예약들에 대해 채팅방에 시스템 메시지 추가하는 마이그레이션 스크립트
const { getConnection } = require('./src/config/db_config');
const messageService = require('./src/services/message_service');

async function migrateRejectedReservations() {
  const conn = getConnection();
  
  try {
    console.log('🔍 [MIGRATION] 거절된 예약 마이그레이션 시작...');
    
    // 1. 거절된 예약들 조회 (reservation_status = 2 또는 3)
    const [rejectedReservations] = await conn.query(`
      SELECT 
        reservation_id, 
        reservation_status,
        reservation_match,
        selected_store_name,
        reservation_bio
      FROM reservation_table 
      WHERE reservation_status IN (2, 3)
    `);
    
    console.log(`📋 [MIGRATION] 찾은 거절된 예약: ${rejectedReservations.length}개`);
    
    if (rejectedReservations.length === 0) {
      console.log('✅ [MIGRATION] 거절된 예약이 없습니다.');
      return;
    }
    
    // 2. 각 거절된 예약에 대해 시스템 메시지가 이미 있는지 확인
    for (const reservation of rejectedReservations) {
      const { reservation_id, reservation_match, selected_store_name } = reservation;
      
      console.log(`🔍 [MIGRATION] 예약 ${reservation_id} 처리 중... (${reservation_match})`);
      
      // 이미 거절 시스템 메시지가 있는지 확인
      const [existingMessages] = await conn.query(`
        SELECT id FROM chat_messages 
        WHERE reservation_id = ? 
        AND sender_id = 'system' 
        AND (message LIKE '%거절%' OR message_type = 'system_reservation_rejected')
      `, [reservation_id]);
      
      if (existingMessages.length > 0) {
        console.log(`⏭️  [MIGRATION] 예약 ${reservation_id}: 이미 거절 메시지 존재, 건너뜀`);
        continue;
      }
      
      // 3. 시스템 메시지 추가
      try {
        const systemMessage = '예약이 거절되었습니다.';
        
        await messageService.saveNewMessage(
          'system',
          reservation_id,
          systemMessage,
          'system_reservation_rejected'
        );
        
        console.log(`✅ [MIGRATION] 예약 ${reservation_id}: 거절 시스템 메시지 추가 완료`);
        
      } catch (messageError) {
        console.error(`❌ [MIGRATION] 예약 ${reservation_id}: 메시지 추가 실패:`, messageError.message);
      }
    }
    
    console.log('🎉 [MIGRATION] 거절된 예약 마이그레이션 완료!');
    
  } catch (error) {
    console.error('❌ [MIGRATION] 마이그레이션 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트 실행
if (require.main === module) {
  migrateRejectedReservations()
    .then(() => {
      console.log('✅ 마이그레이션 완료!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 마이그레이션 실패:', error);
      process.exit(1);
    });
}

module.exports = { migrateRejectedReservations };
