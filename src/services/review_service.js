const { getConnection } = require('../config/db_config');

exports.createReview = async (user_id, data) => {
  const conn = getConnection();
  const {
    store_id,
    review_text,
    review_rating,
    review_visited_time,
    images = []
  } = data;

  const [storeRows] = await conn.query(
    'SELECT store_id FROM store_table WHERE store_id = ?',
    [store_id]
  );
  if (storeRows.length === 0) {
    const err = new Error('존재하지 않는 가게입니다.');
    err.status = 400;
    err.errorCode = 'INVALID_STORE_ID';
    throw err;
  }

  // ⭐ review_id 생성 (기존 MAX + 1)
  const [rows] = await conn.query('SELECT MAX(review_id) as maxId FROM review_table');
  const review_id = (rows[0].maxId || 0) + 1;

  const now = new Date();

  await conn.query(
    `INSERT INTO review_table (
      review_id, review_text, store_id, user_id, review_rating,
      review_visited_time, review_created_time,
      review_img1, review_img2, review_img3, review_img4, review_img5
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      review_id,
      review_text,
      store_id,
      user_id,
      review_rating,
      review_visited_time,
      now,
      images[0] || null,
      images[1] || null,
      images[2] || null,
      images[3] || null,
      images[4] || null
    ]
  );

  return review_id;
};