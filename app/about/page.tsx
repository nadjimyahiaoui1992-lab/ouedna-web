import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Mail, MapPin, Target, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "من نحن | سوف 360",
  description:
    "تعرّف على منصة اكتشف سوف، دليلك السياحي الرقمي لاستكشاف معالم ولاية الوادي — رؤيتنا، أهدافنا، وكيفية التواصل معنا.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#0b121f] text-white px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-bold mb-10">
          ← العودة إلى الرئيسية
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-tr from-orange-500 to-amber-400 p-2 rounded-xl">
            <Compass className="text-[#0b121f]" size={22} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">من نحن</h1>
        </div>

        <p className="text-gray-300 leading-relaxed mb-8">
          اكتسف سوف هي منصة رقمية مستقلة تهدف إلى تعريف الزوار والمقيمين بمعالم ولاية الوادي
          السياحية والتراثية عبر خريطة تفاعلية حديثة، مع معلومات عملية عن كل موقع
          (الوصول، ساعات العمل، وسائل التواصل). المنصة في طور التطوير المستمر تمهيداً
          لتقديمها لمديرية السياحة بولاية الوادي كأداة رسمية داعمة للترويج السياحي بالمنطقة.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="bg-[#141c2c]/80 border border-white/10 rounded-2xl p-5">
            <Target className="text-orange-400 mb-2" size={22} />
            <h2 className="font-bold mb-1">هدفنا</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              تسهيل اكتشاف معالم عاصمة الألف قبة وقبة، ودعم السياحة المحلية والدولية
              ببيانات دقيقة ومحدّثة.
            </p>
          </div>
          <div className="bg-[#141c2c]/80 border border-white/10 rounded-2xl p-5">
            <Users className="text-orange-400 mb-2" size={22} />
            <h2 className="font-bold mb-1">لمن هذه المنصة</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              الزوار القادمون إلى الوادي، سكان الولاية، والباحثون عن معلومات موثوقة
              حول تراث وثقافة المنطقة.
            </p>
          </div>
        </div>

        <div className="bg-[#141c2c]/80 border border-white/10 rounded-2xl p-5 flex items-start gap-3">
          <Mail className="text-orange-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="font-bold mb-1">تواصل معنا</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              لأي ملاحظة حول دقة معلومات معلم سياحي، أو لاقتراح إضافة موقع جديد،
              أو للاستفسار حول الشراكة الرسمية مع مديرية السياحة، يسعدنا تواصلكم
              عبر البريد الإلكتروني الرسمي للمنصة.
            </p>
          </div>
        </div>

        <div className="mt-4 bg-[#141c2c]/80 border border-white/10 rounded-2xl p-5 flex items-start gap-3">
          <MapPin className="text-orange-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="font-bold mb-1">النطاق الجغرافي</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              تغطي المنصة حالياً معالم ولاية الوادي، مع خطة توسّع مستمرة لإضافة
              المزيد من المواقع والبلديات تدريجياً.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
