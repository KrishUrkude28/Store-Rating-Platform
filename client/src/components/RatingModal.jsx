import React, { useState } from 'react';
import { api } from '../services/api';
import { X, Star, AlertCircle } from 'lucide-react';

export default function RatingModal({ store, onClose, onRatingSaved }) {
  const isModifying = !!store.user_rating;
  const [rating, setRating] = useState(store.user_rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (isModifying && store.user_rating_id) {
        await api.modifyRating(store.user_rating_id, rating, review);
      } else {
        await api.submitRating(store.id, rating, review);
      }

      if (onRatingSaved) {
        onRatingSaved();
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{isModifying ? 'Modify Your Rating' : 'Rate this Store'}</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '2px' }}>{store.name}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Interactive Star Selector */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div className="interactive-stars-row">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isFilled = (hoverRating || rating) >= starVal;
                return (
                  <button
                    key={starVal}
                    type="button"
                    className={`interactive-star-btn ${isFilled ? 'active' : ''}`}
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    ★
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
              {rating} of 5 Stars
            </p>
          </div>

          {/* Optional Review Textarea */}
          <div className="form-group">
            <label className="form-label">Review or Feedback (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Tell others what you enjoyed about this store..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
            />
          </div>

          {/* Modal Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              className="action-btn-sm"
              onClick={onClose}
              disabled={submitting}
              style={{ padding: '10px 18px', fontSize: '0.875rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={submitting}
              style={{ width: 'auto', padding: '0 24px', margin: 0 }}
            >
              <Star size={16} fill="#ffffff" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
              <span>{submitting ? 'Saving...' : isModifying ? 'Update Rating' : 'Submit Rating'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
