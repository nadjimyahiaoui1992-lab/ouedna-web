"use client";

import { Heart, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getPlacesFromDB, Place } from "@/data/places";

export default function FavoritesClient() {
  const [places, setPlaces] = useState<Place[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { const saved = new Set(JSON.parse(localStorage.getItem("souf360_favorites") || "[]").map(String)); getPlacesFromDB().then((items) => { setPlaces(items.filter((item) => saved.has(String(item.id)))); }).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="platform-empty-panel">جارٍ تحميل محفوظاتك...</div>;
  if (!places.length) return <div className="platform-empty-panel"><Heart size={28} /><h2>لم تحفظ أماكن بعد</h2><p>اضغط على القلب في صفحة الاستكشاف، وستجد الأماكن التي لفتت انتباهك هنا.</p><Link className="platform-button platform-button--green" href="/explore">استكشف المعالم</Link></div>;
  return <div className="platform-favorite-grid">{places.map((place) => <article className="platform-place-card" key={place.id}><Link href={`/place/${place.id}`} className="platform-place-card__image-link"><img src={place.image} alt={place.name} className="platform-place-card__image" /><span className="platform-place-card__category">{place.category}</span></Link><div className="platform-place-card__body"><div className="platform-place-card__heading"><div><Link href={`/place/${place.id}`}><h3>{place.name}</h3></Link><p><MapPin size={14} />{place.municipality}</p></div><Heart size={17} fill="currentColor" /></div><div className="platform-place-card__meta"><span><Star size={14} fill="currentColor" />{place.rating.toFixed(1)}</span><Link href={`/place/${place.id}`}>عرض التفاصيل ←</Link></div></div></article>)}</div>;
}
