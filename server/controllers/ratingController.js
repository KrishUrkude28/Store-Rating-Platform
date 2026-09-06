const db = require('../config/db');

// Helper to recalculate average store rating
async function getStoreStats(storeId) {
  const result = await db.query(
    `SELECT ROUND(AVG(rating)::numeric, 1) as average_rating,
            COUNT(id)::int as total_ratings
     FROM ratings
     WHERE store_id = $1`,
    [storeId]
  );
  return {
    average_rating: result.rows[0].average_rating !== null ? Number(result.rows[0].average_rating) : null,
    total_ratings: result.rows[0].total_ratings
  };
}

// Submit a new rating (USER-003, USER-004)
const submitRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { store_id, rating, review } = req.body;

    if (!store_id) {
      return res.status(400).json({ message: 'store_id is required.' });
    }

    // Verify store exists
    const storeResult = await db.query('SELECT id, name FROM stores WHERE id = $1', [store_id]);
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    // Check if user has already rated this store (BR-003 / USER-004: upsert/update if existing)
    const existingResult = await db.query(
      'SELECT id, rating, review FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, store_id]
    );

    let ratingRecord;
    let isModified = false;

    if (existingResult.rows.length > 0) {
      // Modify existing rating
      isModified = true;
      const updateResult = await db.query(
        `UPDATE ratings
         SET rating = $1, review = COALESCE($2, review), updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING id, user_id, store_id, rating, review, updated_at`,
        [rating, review !== undefined ? review : null, existingResult.rows[0].id]
      );
      ratingRecord = updateResult.rows[0];
    } else {
      // Insert new rating
      const insertResult = await db.query(
        `INSERT INTO ratings (user_id, store_id, rating, review)
         VALUES ($1, $2, $3, $4)
         RETURNING id, user_id, store_id, rating, review, created_at`,
        [userId, store_id, rating, review || null]
      );
      ratingRecord = insertResult.rows[0];
    }

    const storeStats = await getStoreStats(store_id);

    return res.status(isModified ? 200 : 201).json({
      message: isModified ? 'Rating modified successfully.' : 'Rating submitted successfully.',
      rating: ratingRecord,
      storeStats
    });
  } catch (err) {
    console.error('Submit rating error:', err);
    return res.status(500).json({ message: 'Internal server error while submitting rating.' });
  }
};

// Modify an existing rating by ID (USER-005)
const modifyRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, review } = req.body;

    const existingResult = await db.query('SELECT * FROM ratings WHERE id = $1', [id]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Rating record not found.' });
    }

    const existingRating = existingResult.rows[0];

    // Verify ownership (Section 47: The backend must verify that the rating being modified belongs to the authenticated user)
    if (existingRating.user_id !== userId) {
      return res.status(403).json({
        message: 'You are not authorized to modify another user\'s rating.'
      });
    }

    const updateResult = await db.query(
      `UPDATE ratings
       SET rating = $1, review = COALESCE($2, review), updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, user_id, store_id, rating, review, updated_at`,
      [rating, review !== undefined ? review : null, id]
    );

    const storeStats = await getStoreStats(existingRating.store_id);

    return res.status(200).json({
      message: 'Rating updated successfully.',
      rating: updateResult.rows[0],
      storeStats
    });
  } catch (err) {
    console.error('Modify rating error:', err);
    return res.status(500).json({ message: 'Internal server error while modifying rating.' });
  }
};

module.exports = {
  submitRating,
  modifyRating
};
