// Shared Ouedna footer for public Next.js routes.
import Link from "next/link";

export default function PlatformFooter() {
  return <footer className="platform-footer"><div><span className="platform-footer__brand">وادنا</span><span>بوابتك المحلية لاكتشاف ولاية الوادي</span></div><div className="platform-footer__links"><Link href="/privacy">الخصوصية</Link><Link href="/download">التطبيق</Link><Link href="/community">المجتمع</Link><a href="mailto:hello@ouedna.dz">تواصل معنا</a></div><small>Ouedna · Wadi Souf</small></footer>;
}
