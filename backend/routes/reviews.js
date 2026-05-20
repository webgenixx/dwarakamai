import express from 'express';
import { body, validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true }); // mergeParams gives access to :productId

// GET /api/products/:productId/reviews
// Public — fetch all reviews for a product
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ product_id: req.params.productId })
      .sort({ createdAt: -1 })
      .lean();

    const total = reviews.length;
    const avg = total > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
      : 0;

    // Rating breakdown (count per star 1-5)
    const breakdown = [1, 2, 3, 4, 5].reduce((acc, star) => {
      acc[star] = reviews.filter(r => r.rating === star).length;
      return acc;
    }, {});

    res.json({ reviews, total, avg, breakdown });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /api/products/:productId/reviews/can-review
// Authenticated — check if the current user can review this product
// (must have a delivered/completed order containing this product, and not already reviewed)
router.get('/can-review', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    const userEmail = req.user.email;

    console.log(`[can-review] productId=${productId} userEmail=${userEmail}`);

    // Check for a delivered/completed order containing this product
    // Use $elemMatch to ensure proper ObjectId comparison
    const deliveredOrder = await Order.findOne({
      customer_email: userEmail,
      order_status: { $in: ['delivered', 'completed'] },
      items: { $elemMatch: { product_id: productId } },
    }).lean();

    console.log(`[can-review] deliveredOrder found: ${!!deliveredOrder}`);

    if (!deliveredOrder) {
      return res.json({ canReview: false, reason: 'no_delivered_order' });
    }

    // Check if already reviewed
    const existing = await Review.findOne({ product_id: productId, user_id: req.user.id });
    if (existing) {
      return res.json({ canReview: false, reason: 'already_reviewed', review: existing });
    }

    res.json({ canReview: true });
  } catch (error) {
    console.error('Can-review check error:', error);
    res.status(500).json({ error: 'Failed to check review eligibility' });
  }
});

// POST /api/products/:productId/reviews
// Authenticated — submit a review (only if user has a delivered order for this product)
router.post('/',
  authenticate,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
    body('comment').trim().notEmpty().withMessage('Comment is required'),
    body('title').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { rating, comment, title } = req.body;
      const { productId } = req.params;

      // Verify user has a delivered/completed order for this product
      const deliveredOrder = await Order.findOne({
        customer_email: req.user.email,
        order_status: { $in: ['delivered', 'completed'] },
        items: { $elemMatch: { product_id: productId } },
      });

      if (!deliveredOrder) {
        return res.status(403).json({
          error: 'You can only review products you have received',
        });
      }

      // Check for existing review
      const existing = await Review.findOne({ product_id: productId, user_id: req.user.id });
      if (existing) {
        return res.status(409).json({ error: 'You have already reviewed this product' });
      }

      const review = await Review.create({
        product_id: productId,
        user_id:    req.user.id,
        user_name:  req.user.name || req.user.email?.split('@')[0] || 'Customer',
        rating,
        comment,
        title: title || '',
      });

      res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ error: 'You have already reviewed this product' });
      }
      console.error('Submit review error:', error);
      res.status(500).json({ error: 'Failed to submit review' });
    }
  }
);

// PUT /api/products/:productId/reviews/:reviewId
// Authenticated — edit own review
router.put('/:reviewId',
  authenticate,
  [
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').trim().notEmpty(),
    body('title').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const review = await Review.findOne({
        _id: req.params.reviewId,
        product_id: req.params.productId,
        user_id: req.user.id,
      });

      if (!review) return res.status(404).json({ error: 'Review not found or not yours' });

      review.rating  = req.body.rating;
      review.comment = req.body.comment;
      review.title   = req.body.title || '';
      await review.save();

      res.json({ message: 'Review updated', review });
    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({ error: 'Failed to update review' });
    }
  }
);

// DELETE /api/products/:productId/reviews/:reviewId
// Authenticated — delete own review
router.delete('/:reviewId', authenticate, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.reviewId,
      product_id: req.params.productId,
      user_id: req.user.id,
    });

    if (!review) return res.status(404).json({ error: 'Review not found or not yours' });

    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
