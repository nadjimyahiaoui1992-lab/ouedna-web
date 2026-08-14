import { createClient } from "@supabase/supabase-js";
import PlatformFrame from "@/components/platform/PlatformFrame";
import CommunityClient from "./CommunityClient";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

async function getExperiences() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data } = await supabase.from("testimonials").select("id,name,message,photos,created_at").eq("status", "approved").order("created_at", { ascending: false }).limit(30);
  return data || [];
}

export default async function CommunityPage() {
  const experiences = await getExperiences();
  return <PlatformFrame active="/community"><section className="platform-page platform-community-page"><div className="platform-container"><div className="platform-page-hero"><div><span className="platform-eyebrow"><i />04 / صوت الزوار</span><h1>المكان يكبر<br /><em>بأهله.</em></h1><p>شارك تجربة، صورة، اقتراحاً أو سؤالاً. هنا تتحول المعرفة المحلية إلى طريق أوضح للزائر التالي.</p></div><div className="platform-page-hero__aside platform-page-hero__aside--image platform-community-hero-visual"><img src="/ouedna/palm-oasis.jpg" alt="واحة النخيل في وادي سوف" /><span>كل ملاحظة<br /><b>تترك أثراً.</b></span></div></div><CommunityClient experiences={experiences} /></div></section></PlatformFrame>;
}
