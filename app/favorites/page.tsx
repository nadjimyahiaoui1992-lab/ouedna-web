import { Heart } from "lucide-react";
import PlatformFrame from "@/components/platform/PlatformFrame";
import FavoritesClient from "./FavoritesClient";

export default function FavoritesPage() {
  return <PlatformFrame active="/favorites"><section className="platform-page"><div className="platform-container"><div className="platform-page-hero"><div><span className="platform-eyebrow"><i />05 / محفوظاتك</span><h1>أماكن<br /><em>تعود إليها.</em></h1><p>قائمة محلية تحفظها على جهازك لتعود إلى المعالم التي أثارت فضولك قبل الرحلة.</p></div><div className="platform-page-hero__aside"><Heart size={20} /><strong>♡</strong><span>محفوظات شخصية</span></div></div><FavoritesClient /></div></section></PlatformFrame>;
}
