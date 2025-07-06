// src/components/Avis/StarRating.jsx
import React from "react";
import "./StarRating.css";

const StarRating = ({ rate, handleRating }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          onClick={() => handleRating(i)}
          className={`star ${i <= rate ? "filled" : ""}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

StarRating.defaultProps = {
  rate: 0,
  handleRating: () => {},
};

export default StarRating;
