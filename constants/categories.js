// خريطة الأصناف: كل صنف له لون مميز يُستعمل في الشارات، البطاقات، ودبابيس الخريطة
export const CATEGORIES = [
  { id: "الكل", label: "الكل", color: "#2B2118" },
  { id: "طبيعة", label: "طبيعة", color: "#4B6E4A" },
  { id: "مغامرات", label: "مغامرات", color: "#B5502E" },
  { id: "تاريخ وثقافة", label: "تاريخ وثقافة", color: "#1F2A44" },
  { id: "أسواق", label: "أسواق", color: "#C08A2E" },
  { id: "متاجر ومحلات", label: "متاجر ومحلات", color: "#2E8B9E" },
  { id: "الفنادق", label: "الفنادق", color: "#3D6E77" },
  { id: "المرافق الصحية", label: "المرافق الصحية", color: "#9B3B4A" },
];

export function categoryColor(category) {
  const found = CATEGORIES.find((c) => c.id === category);
  return found ? found.color : "#B5502E";
}
