import React, { useEffect, useMemo, useState } from "react";
import "./Galeria.css";

const PLACES = [
  {
    id: "matra",
    title: "Mátra",
    subtitle: "Magaslatok, fenyvesek, kilátók és a Kékes ikonikus hangulata.",
    images: [
      {
        src: "https://eszakmatratura.hu/wp-content/uploads/Kekesteto-Matra-latnivalo-Eszak-Matra-tura.webp",
        alt: "Mátra - Kékestető panoráma",
        size: "tall",
      },
      {
        src: "https://eszakmatratura.hu/wp-content/uploads/Sasto-01-Matra-latnivalo-Eszak-Matra-tura.webp",
        alt: "Mátra - Sástó",
        size: "medium",
      },
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/K%C3%A9kestet%C5%912004.jpg/250px-K%C3%A9kestet%C5%912004.jpg",
        alt: "Mátra - Kékestető",
        size: "small",
      },
    ],
  },
  {
    id: "balaton-felvidek",
    title: "Balaton-felvidék",
    subtitle: "Tanúhegyek, bazaltformák és az egyik legszebb magyar táj.",
    images: [
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Pliocene_Volcanoes_near_Lake_Balaton_in_Hungary.jpg",
        alt: "Balaton-felvidék - tanúhegyek",
        size: "medium",
      },
      {
        src: "https://utazom.com/sites/default/files/u15/images/unnamed(4).jpg",
        alt: "Balaton-felvidék - panoráma",
        size: "small",
      },
      {
        src: "https://blog.szallas.hu/wp-content/uploads/2018/11/hegyestu_shutterstock_754252984.jpg",
        alt: "Balaton-felvidék - Hegyestű",
        size: "tall",
      },
    ],
  },
  {
    id: "bukk",
    title: "Bükk",
    subtitle: "Vadregényes erdők, völgyek, sziklák és klasszikus bükki hangulat.",
    images: [
      {
        src: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Lilla_fromszeleta1.jpg",
        alt: "Bükk - Lillafüred",
        size: "tall",
      },
      {
        src: "https://img0.oastatic.com/img2/57543791/max/variant.jpg",
        alt: "Bükk - hegyvidéki táj",
        size: "medium",
      },
      {
        src: "https://utazaskatalogus.hu/wp-content/uploads/2020/12/utazaskatalogus-bukk-latnivalok-kirandulasok.jpg",
        alt: "Bükk - kirándulóhely",
        size: "small",
      },
    ],
  },
  {
    id: "dunakanyar",
    title: "Dunakanyar",
    subtitle: "Kanyargó Duna, magas partfalak és ikonikus panorámák.",
    images: [
      {
        src: "https://cms.static.marquardmedia.hu/data/cikk/354/354904.1160x480.jpg",
        alt: "Dunakanyar - panoráma",
        size: "medium",
      },
      {
        src: "https://setarepulesbudapest.hu/wp-content/uploads/2024/12/Gyonyoru_Dunakanyar_setarepules_web_3.jpg",
        alt: "Dunakanyar - légi látkép",
        size: "tall",
      },
      {
        src: "https://blog.szallas.hu/wp-content/uploads/2017/10/dunakanyar_shutterstock_513725098.jpg",
        alt: "Dunakanyar - tájkép",
        size: "small",
      },
    ],
  },
  {
    id: "mecsek",
    title: "Mecsek",
    subtitle: "Erdők, ösvények, kilátópontok és délies hangulat.",
    images: [
      {
        src: "https://www.turistamagazin.hu/media/thumbs/el/me/ny/elmenykavalkad-a-mecsek-keleti-tajain-60e8a238-7986679.jpg",
        alt: "Mecsek - keleti tájak",
        size: "medium",
      },
      {
        src: "https://aktivkalandor.hu/wp-content/uploads/2024/04/New-Project-96.jpg",
        alt: "Mecsek - kirándulóhely",
        size: "small",
      },
      {
        src: "https://i.szalas.hu/pois/3795/500x500/87630.jpg",
        alt: "Mecsek - látnivaló",
        size: "tall",
      },
    ],
  },
  {
    id: "orseg",
    title: "Őrség",
    subtitle: "Nyugodt falvak, rétek, erdők és különleges természetközeli világ.",
    images: [
      {
        src: "https://csodalatosmagyarorszag.hu/wp-content/uploads/2020/07/szalafo-pityerszer-nepi-muemlekegyuttes-orseg-bringazas-csodalatosmagyarorszag-dronfoto1.jpg",
        alt: "Őrség - Szalafő Pityerszer",
        size: "tall",
      },
      {
        src: "https://kep.index.hu/1/0/3412/34123/341233/34123319_2612917_bcd3f4b5a73cbcf762b96e4a4f8f269e_wm.jpg",
        alt: "Őrség - tájkép",
        size: "medium",
      },
      {
        src: "https://csodalatosmagyarorszag.hu/wp-content/uploads/2024/11/orseg-szalafo-kirandulas-gyalogtura-osz-jegyvasarlas-csodalatosmagyarorszag.jpg",
        alt: "Őrség - őszi gyalogtúra",
        size: "small",
      },
    ],
  },
  {
    id: "ausztria",
    title: "Ausztria",
    subtitle: "Grüner See az Eisenerzi-Alpok között, brutál alpesi panorámával.",
    images: [
      {
        src: "https://kirandulastippek.hu/thumbnail//images/a-messnerin-es-a-gruner-see1.jpg?3072,2304,width",
        alt: "Ausztria - Grüner See, Eisenerzi-Alpok",
        size: "tall",
      },
    ],
  },
];

export default function Galeria() {
  const [activePlace, setActivePlace] = useState("Összes");
  const [activeIndex, setActiveIndex] = useState(null);

  const places = useMemo(
    () => ["Összes", ...PLACES.map((place) => place.title)],
    []
  );

  const allImages = useMemo(() => {
    return PLACES.flatMap((place) =>
      place.images.map((image) => ({
        ...image,
        placeId: place.id,
        placeTitle: place.title,
        placeSubtitle: place.subtitle,
      }))
    );
  }, []);

  const filteredImages = useMemo(() => {
    if (activePlace === "Összes") return allImages;
    return allImages.filter((image) => image.placeTitle === activePlace);
  }, [activePlace, allImages]);

  useEffect(() => {
    if (activeIndex === null) {
      document.body.style.overflow = "";
      return undefined;
    }

    if (!filteredImages.length) {
      setActiveIndex(null);
      return undefined;
    }

    if (activeIndex > filteredImages.length - 1) {
      setActiveIndex(0);
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActiveIndex(null);

      if (e.key === "ArrowRight") {
        setActiveIndex((prev) => {
          if (prev === null) return 0;
          return (prev + 1) % filteredImages.length;
        });
      }

      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => {
          if (prev === null) return 0;
          return (prev - 1 + filteredImages.length) % filteredImages.length;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, filteredImages]);

  const openLightbox = (index) => {
    setActiveIndex(index);
  };

  const closeLightbox = () => {
    setActiveIndex(null);
  };

  const prevImage = () => {
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      return (prev - 1 + filteredImages.length) % filteredImages.length;
    });
  };

  const nextImage = () => {
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % filteredImages.length;
    });
  };

  const activeImage = activeIndex !== null ? filteredImages[activeIndex] : null;

  return (
    <div className="explore-gallery-page">
      <div className="explore-gallery-aurora explore-gallery-aurora-left" />
      <div className="explore-gallery-aurora explore-gallery-aurora-right" />
      <div className="explore-gallery-noise" />

      <section className="explore-gallery-hero">
        <div className="explore-gallery-badge">EXPLORE. GALÉRIA</div>

        <h1>Helyek ahol már jártunk</h1>

        <p className="explore-gallery-lead">
          Magyarország kedvenc helyei mellé bekerült egy alpesi kedvenc is.
          Pinterestes hangulat, üveges EXPLORE dizájn, normális nagyítás és
          helyszín szerinti szűrés.
        </p>
      </section>

      <section className="explore-gallery-filters">
        {places.map((place) => (
          <button
            type="button"
            key={place}
            className={`explore-gallery-filter ${
              activePlace === place ? "is-active" : ""
            }`}
            onClick={() => {
              setActivePlace(place);
              setActiveIndex(null);
            }}
          >
            {place}
          </button>
        ))}
      </section>

      <section className="explore-gallery-masonry">
        {filteredImages.map((image, index) => (
          <button
            type="button"
            key={`${image.placeId}-${index}-${image.src}`}
            className={`explore-gallery-pin explore-gallery-pin-${image.size}`}
            onClick={() => openLightbox(index)}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              referrerPolicy="no-referrer"
            />

            <div className="explore-gallery-pin-overlay">
              <span>{image.placeTitle}</span>
              <strong>{image.alt}</strong>
            </div>
          </button>
        ))}
      </section>

      {activeImage && (
        <div className="explore-gallery-lightbox" onClick={closeLightbox}>
          <button
            type="button"
            className="explore-gallery-lightbox-close"
            onClick={closeLightbox}
            aria-label="Bezárás"
          >
            ×
          </button>

          <button
            type="button"
            className="explore-gallery-lightbox-nav explore-gallery-lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            aria-label="Előző kép"
          >
            ‹
          </button>

          <div
            className="explore-gallery-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              className="explore-gallery-lightbox-image"
              src={activeImage.src}
              alt={activeImage.alt}
              referrerPolicy="no-referrer"
            />

            <div className="explore-gallery-lightbox-info">
              <span>
                {activeIndex + 1} / {filteredImages.length} • {activeImage.placeTitle}
              </span>
              <h3>{activeImage.alt}</h3>
              <p>{activeImage.placeSubtitle}</p>
            </div>
          </div>

          <button
            type="button"
            className="explore-gallery-lightbox-nav explore-gallery-lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            aria-label="Következő kép"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}