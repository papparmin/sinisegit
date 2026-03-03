import TourCard from "./TourCard/TourCard";

export default function FeaturedTours() {
  const tours = [
    {
      badge: "TÉL / PROFI",
      image:
        "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800",
      title: "Téli Mátra Gerinctúra",
      description:
        "Havas gerincek Kékes és Galyatető között. Hidegmenedzsment és tájékozódás.",
      duration: "2 Nap / 1 Éj",
      price: "85 000 Ft",
    },
    {
      badge: "VÍZ / KEZDŐ",
      image:
        "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=800",
      title: "Gemenci Vízivilág",
      description:
        "Kenuzás Európa egyik legnagyobb ártéri erdejében. Tábor a víz közelében.",
      duration: "3 Nap / 2 Éj",
      price: "125 000 Ft",
    },
    {
      badge: "ERDŐ / HALADÓ",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
      title: "Bükki Őserdő",
      description:
        "Rejtett ösvények a Bükk-fennsíkon, barlangszakaszok, tábor tűzzel.",
      duration: "2 Nap / 1 Éj",
      price: "79 000 Ft",
    },
  ];

  return (
    <section id="tours">
      <div className="container">
        <div className="section-head reveal">
          <h2>Ajánlott túráink</h2>
          <p>
            Válogatott útvonalak, átlátható információk. A teljes listához kattints
            a gombra.
          </p>
        </div>

        <div className="grid">
          {tours.map((tour, i) => (
            <TourCard key={i} {...tour} />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <a href="/turak" className="btn">
            Összes túra listázása
          </a>
        </div>
      </div>
    </section>
  );
}
