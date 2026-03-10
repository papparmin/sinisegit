import React, { useMemo, useState } from "react";
import "./Galeria.css";

const trips = [
  {
    id: 1,
    place: "Mátra",
    region: "Magyarország",
    year: "2025",
    images: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    id: 2,
    place: "Balaton-felvidék",
    region: "Magyarország",
    year: "2025",
    images: [
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    id: 3,
    place: "Bükk",
    region: "Magyarország",
    year: "2024",
    images: [
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    id: 4,
    place: "Dunakanyar",
    region: "Magyarország",
    year: "2024",
    images: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    id: 5,
    place: "Mecsek",
    region: "Magyarország",
    year: "2024",
    images: [
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1400&q=80",
    ],
  },
  {
    id: 6,
    place: "Őrség",
    region: "Magyarország",
    year: "2023",
    images: [
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1501550816-8c6d7b1b2b6b?auto=format&fit=crop&w=1400&q=80",
    ],
  },
];

export default function Galeria() {
  const [activePlace, setActivePlace] = useState("Összes");
  const [selectedImage, setSelectedImage] = useState(null);
  const [cardIndexes, setCardIndexes] = useState(
    Object.fromEntries(trips.map((trip) => [trip.id, 0]))
  );

  const filters = useMemo(
    () => ["Összes", ...trips.map((trip) => trip.place)],
    []
  );

  const filteredTrips = useMemo(() => {
    if (activePlace === "Összes") return trips;
    return trips.filter((trip) => trip.place === activePlace);
  }, [activePlace]);

  const changeCardImage = (tripId, direction, imageCount) => {
    setCardIndexes((prev) => {
      const current = prev[tripId] ?? 0;
      const next =
        direction === "next"
          ? (current + 1) % imageCount
          : (current - 1 + imageCount) % imageCount;

      return {
        ...prev,
        [tripId]: next,
      };
    });
  };

  const openLightbox = (trip, imageIndex) => {
    setSelectedImage({
      tripId: trip.id,
      title: trip.place,
      subtitle: `${trip.region} • ${trip.year}`,
      images: trip.images,
      currentIndex: imageIndex,
    });
  };

  const changeLightboxImage = (direction) => {
    setSelectedImage((prev) => {
      if (!prev) return prev;

      const count = prev.images.length;
      const nextIndex =
        direction === "next"
          ? (prev.currentIndex + 1) % count
          : (prev.currentIndex - 1 + count) % count;

      return {
        ...prev,
        currentIndex: nextIndex,
      };
    });
  };

  return (
    <section className="gallery-page">
      <div className="gallery-shell">
        <div className="gallery-head">
          <div>
            <span className="gallery-badge">Eddigi túráink</span>
            <h1>Galéria</h1>
            <p>Lapozható túrakártyák, igényes mintaképekkel.</p>
          </div>

          <div className="gallery-filters">
            {filters.map((filter) => (
              <button
                key={filter}
                className={activePlace === filter ? "active" : ""}
                onClick={() => setActivePlace(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="gallery-cards">
          {filteredTrips.map((trip) => {
            const currentIndex = cardIndexes[trip.id] ?? 0;
            const currentImage = trip.images[currentIndex];

            return (
              <article className="gallery-card" key={trip.id}>
                <div className="gallery-card-topbar" />

                <div className="gallery-image-wrap">
                  <button
                    className="gallery-main-image"
                    onClick={() => openLightbox(trip, currentIndex)}
                    type="button"
                  >
                    <img
                      src={currentImage}
                      alt={`${trip.place} ${currentIndex + 1}`}
                    />
                    <div className="gallery-main-overlay">
                      <span>Nagyban megnyitás</span>
                    </div>
                  </button>

                  <button
                    className="gallery-nav gallery-nav-left"
                    onClick={() =>
                      changeCardImage(trip.id, "prev", trip.images.length)
                    }
                    aria-label="Előző kép"
                    type="button"
                  >
                    <span>❮</span>
                  </button>

                  <button
                    className="gallery-nav gallery-nav-right"
                    onClick={() =>
                      changeCardImage(trip.id, "next", trip.images.length)
                    }
                    aria-label="Következő kép"
                    type="button"
                  >
                    <span>❯</span>
                  </button>

                  <div className="gallery-dots">
                    {trip.images.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`gallery-dot ${
                          index === currentIndex ? "active" : ""
                        }`}
                        onClick={() =>
                          setCardIndexes((prev) => ({
                            ...prev,
                            [trip.id]: index,
                          }))
                        }
                        aria-label={`${index + 1}. kép`}
                      />
                    ))}
                  </div>
                </div>

                <div className="gallery-card-body">
                  <div className="gallery-meta">
                    <span>{trip.region}</span>
                    <span>•</span>
                    <span>{trip.year}</span>
                  </div>

                  <h2>{trip.place}</h2>

                  <div className="gallery-thumbs">
                    {trip.images.map((image, index) => (
                      <button
                        key={index}
                        className={`gallery-thumb ${
                          index === currentIndex ? "active" : ""
                        }`}
                        type="button"
                        onClick={() =>
                          setCardIndexes((prev) => ({
                            ...prev,
                            [trip.id]: index,
                          }))
                        }
                      >
                        <img
                          src={image}
                          alt={`${trip.place} bélyegkép ${index + 1}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {selectedImage && (
        <div className="gallery-lightbox" onClick={() => setSelectedImage(null)}>
          <button
            className="gallery-lightbox-close"
            onClick={() => setSelectedImage(null)}
            type="button"
          >
            ✕
          </button>

          <button
            className="gallery-lightbox-arrow gallery-lightbox-arrow-left"
            onClick={(e) => {
              e.stopPropagation();
              changeLightboxImage("prev");
            }}
            type="button"
            aria-label="Előző kép"
          >
            <span>❮</span>
          </button>

          <button
            className="gallery-lightbox-arrow gallery-lightbox-arrow-right"
            onClick={(e) => {
              e.stopPropagation();
              changeLightboxImage("next");
            }}
            type="button"
            aria-label="Következő kép"
          >
            <span>❯</span>
          </button>

          <div
            className="gallery-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.images[selectedImage.currentIndex]}
              alt={selectedImage.title}
            />
            <div className="gallery-lightbox-info">
              <h3>{selectedImage.title}</h3>
              <p>{selectedImage.subtitle}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}