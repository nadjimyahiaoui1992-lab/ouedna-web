import { supabase } from '@/lib/supabase/client';
import { decodeImageUrls } from '@/services/places';

export type PlaceCategory = string;
export type PlacePopularity = "high" | "medium" | "low";

export interface Place {
  id: number;
  name: string;
  subtitle: string;
  category: PlaceCategory;
  municipality: string;
  district?: string;
  popularity: PlacePopularity;
  lat: number;
  lng: number;
  rating: number;
  image: string;
  description: string;
  location: string;
  tags: string[];
  phone?: string;
  website?: string;
  openingHours?: string;
}

export async function getPlacesFromDB(): Promise<Place[]> {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('status', 'منشور')
    .order('id', { ascending: false });

  if (error || !data) {
    console.error("خطأ في جلب البيانات من قاعدة البيانات:", error);
    return [];
  }

  return data.map((item: any) => {
    const images = decodeImageUrls(item.image_url);
    const finalImage = images[0] || "/images/images.jpg";

    return {
      id: item.id,
      name: item.name,
      subtitle: item.description ? item.description.substring(0, 40) + "..." : item.name,
      category: item.category || item.main_category || 'تاريخ وثقافة',
      municipality: item.municipality || "الوادي",
      district: item.district || "الوادي",
      popularity: "high",
      lat: item.lat || 33.3683,
      lng: item.lng || 6.8667,
      rating: item.rating || 4.5,
      image: finalImage,
      description: item.description || '',
      location: item.municipality || "الوادي",
      tags: [item.category || 'سياحة'],
      phone: item.phone,
      website: item.website,
      openingHours: item.opening_hours,
    };
  });
}
