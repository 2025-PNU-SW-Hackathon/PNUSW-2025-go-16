const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });


const main = async () => {
  const TOSS_CLIENT_KEY = process.env.TOSS_CLIENT_KEY;
  const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY;

  if (!TOSS_CLIENT_KEY || !TOSS_SECRET_KEY) {
    console.error('[❌ 환경 변수 누락] .env에서 키를 불러올 수 없습니다.');
    return;
  }

  const orderId = `spotple-${Date.now()}`;
  const amount = 15000;
  const customerName = '테스트유저';

  try {
    const res = await axios.post(
      'https://api.tosspayments.com/v1/payments',
      {
        amount,
        orderId,
        orderName: '단체관람 예약 결제',
        customerName,
        successUrl: 'https://example.com/success',
        failUrl: 'https://example.com/fail',
        card: {
          number: '4111111111111111',
          expirationYear: '29',
          expirationMonth: '12',
          cvc: '123',
          cardPassword: '12',
          customerIdentityNumber: '900101',
        },
      },
      {
        auth: { username: TOSS_SECRET_KEY, password: '' },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('[✅ 카드 결제 요청 성공]');
    console.log('▶ paymentKey:', res.data.paymentKey);
    console.log('▶ orderId:', res.data.orderId);
    console.log('▶ status:', res.data.status);
  } catch (err) {
    console.error('[❌ 카드 결제 요청 실패]');
    console.dir(err.response?.data || err.message, { depth: null });
  }
};

main();