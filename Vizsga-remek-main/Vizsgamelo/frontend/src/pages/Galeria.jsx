import React, { useEffect, useMemo, useState } from "react";
import "./Galeria.css";

const SectionHead = ({ title, subtitle }) => (
  <div className="section-head reveal">
    <div className="section-title-row">
      <span className="section-logo" aria-hidden="true">
        <span className="brand-mark small" />
        <span className="section-logo-text">EXPLORE.</span>
      </span>
      <h2>{title}</h2>
    </div>
    {subtitle ? <p>{subtitle}</p> : null}
  </div>
);

export default function Galeria() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const tours = useMemo(
    () => [
      {
        place: "Mátra",
        title: "Téli Mátra Gerinctúra",
        text: "Hideg levegő, komoly gerincek és az a tiszta fókusz, amiért megéri kiszakadni a hétköznapokból.",
        images: [
          "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600&q=80&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80&auto=format&fit=crop",
        ],
      },
      {
        place: "Gemenc",
        title: "Gemenci Vízivilág",
        text: "Nyugodtabb ritmus, vízparti hangulat és természetközeli élmény. Ez a vonal inkább lelassít, mint szétpörget.",
        images: [
          "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=1600&q=80&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=80&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80&auto=format&fit=crop",
        ],
      },
      {
        place: "Bükk",
        title: "Bükki Őserdő",
        text: "Sűrű erdő, mélyebb csend, komolyabb ösvények. Az a túratípus, ahol tényleg érzed, hogy máshol vagy.",
        images: [
          "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1600&q=80&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&q=80&auto=format&fit=crop",
        ],
      },
      {
        place: "Alpok",
        title: "Alpesi Hajnal Expedíció",
        text: "Korai indulás, brutál látvány és magashegyi hangulat. Az egyik legerősebb élmény, amit vissza lehet hozni képekben.",
        images: [
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=80&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80&auto=format&fit=crop",
        ],
      },
    ],
    []
  );

  const flatImages = useMemo(() => {
    const result = [];
    tours.forEach((tour) => {
      tour.images.forEach((img, idx) => {
        result.push({
          img,
          place: tour.place,
          title: tour.title,
          text: tour.text,
          imageNo: idx + 1,
        });
      });
    });
    return result;
  }, [tours]);

  const [selectedIndex, setSelectedIndex] = useState(null);
  const selectedItem = selectedIndex !== null ? flatImages[selectedIndex] : null;

  const closeLightbox = () => setSelectedIndex(null);
  const prevImage = () =>
    setSelectedIndex((prev) => (prev - 1 + flatImages.length) % flatImages.length);
  const nextImage = () =>
    setSelectedIndex((prev) => (prev + 1) % flatImages.length);

  const getFlatIndex = (tourIndex, imageIndex) => {
    let count = 0;
    for (let i = 0; i < tourIndex; i += 1) {
      count += tours[i].images.length;
    }
    return count + imageIndex;
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex, flatImages.length]);

  return (
    <div className="galeria-page">
      <section className="galeria-hero">
        <div className="container">
          <SectionHead
            title="Eddigi túráink"
            subtitle="Helyszínenként összerakva az Explore eddigi útjaiból néhány pillanat. Letisztultan, átláthatóan."
          />
        </div>
      </section>

      <div className="black-sep" />

      <section className="galeria-section">
        <div className="container">
          <div className="tour-list">
            {tours.map((tour, tourIndex) => (
              <article className="tour-gallery-row glass reveal" key={tour.place}>
                <div className="tour-gallery-copy">
                  <div className="tour-gallery-brand">
                    <span className="brand-mark small" />
                    <span className="tour-gallery-brand-text">EXPLORE.</span>
                  </div>

                  <span className="tour-gallery-place">{tour.place}</span>
                  <h3>{tour.title}</h3>
                  <p>{tour.text}</p>
                </div>

                <div className="tour-gallery-images">
                  {tour.images.map((img, imageIndex) => (
                    <button
                      key={`${tour.place}-${imageIndex}`}
                      type="button"
                      className="tour-gallery-image-card"
                      onClick={() => setSelectedIndex(getFlatIndex(tourIndex, imageIndex))}
                    >
                      <img src={img} alt={`${tour.title} ${imageIndex + 1}`} />
                      <span className="tour-gallery-image-badge">
                        {imageIndex + 1}. kép
                      </span>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {selectedItem && (
        <div className="gallery-lightbox" onClick={closeLightbox}>
          <div
            className="gallery-lightbox-inner glass"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="gallery-close"
              onClick={closeLightbox}
              aria-label="Bezárás"
            >
              ✕
            </button>

            <button
              type="button"
              className="gallery-nav gallery-nav-left"
              onClick={prevImage}
              aria-label="Előző kép"
            >
              ‹
            </button>

            <div className="gallery-lightbox-image-wrap">
              <img
                src={selectedItem.img}
                alt={`${selectedItem.title} ${selectedItem.imageNo}`}
                className="gallery-lightbox-image"
              />
            </div>

            <button
              type="button"
              className="gallery-nav gallery-nav-right"
              onClick={nextImage}
              aria-label="Következő kép"
            >
              ›
            </button>

            <div className="gallery-lightbox-meta">
              <div className="gallery-lightbox-brand">
                <span className="brand-mark small" />
                <span className="gallery-lightbox-brand-text">EXPLORE.</span>
              </div>

              <span className="gallery-lightbox-place">{selectedItem.place}</span>
              <h3>{selectedItem.title}</h3>
              <p>{selectedItem.text}</p>
              <div className="gallery-lightbox-counter">
                {selectedItem.imageNo}. kép
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}