import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 20,
  showLabel = false,
  max = 5
}) {
  const [hoverRating, setHoverRating] = useState(0);

  if (readOnly) {
    if (value === null || value === undefined) {
      return (
        <span className="text-muted" style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
          No ratings yet
        </span>
      );
    }

    const roundedVal = Math.round(Number(value));

    return (
      <div className="star-rating-display">
        <div style={{ display: 'flex', gap: '2px' }}>
          {[...Array(max)].map((_, i) => (
            <Star
              key={i}
              size={size}
              className={i < roundedVal ? 'star-icon-filled' : 'star-icon-empty'}
            />
          ))}
        </div>
        {showLabel && (
          <span className="rating-badge" style={{ marginLeft: '0.4rem' }}>
            {Number(value).toFixed(1)} / 5
          </span>
        )}
      </div>
    );
  }

  // Interactive mode (1 - 5 stars)
  const activeRating = hoverRating || value || 0;

  return (
    <div className="interactive-stars" id="star-rating-selector">
      {[1, 2, 3, 4, 5].map((starIndex) => (
        <button
          key={starIndex}
          type="button"
          className="interactive-star"
          onMouseEnter={() => setHoverRating(starIndex)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => onChange && onChange(starIndex)}
          id={`star-btn-${starIndex}`}
          title={`Rate ${starIndex} out of 5 stars`}
        >
          <Star
            size={size || 28}
            className={starIndex <= activeRating ? 'star-icon-filled' : 'star-icon-empty'}
          />
        </button>
      ))}
      <span style={{ marginLeft: '0.75rem', fontWeight: 600, color: '#fbbf24', alignSelf: 'center', fontSize: '1.1rem' }}>
        {activeRating > 0 ? `${activeRating} / 5` : 'Select rating'}
      </span>
    </div>
  );
}
