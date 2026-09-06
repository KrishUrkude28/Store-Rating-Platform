const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticate } = require('../middleware/auth');
const { authorizeRole } = require('../middleware/role');
const { validateRatingInput } = require('../middleware/validate');

// Only Normal Users can submit or modify ratings (USER-003, USER-005, BR-001)
router.use(authenticate, authorizeRole('USER'));

router.post('/', validateRatingInput, ratingController.submitRating);
router.put('/:id', validateRatingInput, ratingController.modifyRating);

module.exports = router;
