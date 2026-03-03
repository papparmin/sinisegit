import React from "react";
import { Link } from "react-router-dom";
import "./TourCard.css";

export default function TourCard({
  id = "",
  badge = "",
  image = "",
  title = "",
  description = "",
  duration = "",
  price = "",
}) {
  return (
    <article className="tour-card reveal">
      {badge ? <span className="tour-card__badge">{badge}</span> : null}

      <div className="tour-card__img">
        <img src={image} alt={title} loading="lazy" />
      </div>

      <div className="tour-card__body">
        <h3 className="tour-card__title">{title}</h3>
        <p className="tour-card__desc">{description}</p>

        <div className="tour-card__meta">
          <span>{duration}</span>
          <span>{price}</span>
        </div>

        <div className="tour-card__actions">
          {/* Csak a Részletek gomb maradt meg */}
          <Link to={`/turak/${id}`} className="tour-card__btn">
            Részletek
          </Link>
        </div>
      </div>
    </article>
  );
}