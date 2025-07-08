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
          style={{ cursor: "pointer", fontSize: "1.5rem", color: i <= rate ? "#ffc107" : "#e4e5e9" }}
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
