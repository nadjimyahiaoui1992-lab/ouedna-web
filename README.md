# Ouedna Web — وادنا

منصة وادنا العامة لاكتشاف ولاية الوادي، الجزائر. توحّد المعالم والخرائط ومسارات الرحلات والأرشيف وتجارب الزوار ومركز تنزيل تطبيق Android ضمن تجربة عربية RTL متجاوبة.

**الإنتاج:** [ouedna.vercel.app](https://ouedna.vercel.app/)
**النطاق القديم:** `souf360.vercel.app` يحوّل دائماً إلى النطاق الأساسي.

## التقنية والوظائف

يعتمد المشروع على Next.js 16 وReact 19 وSupabase وLeaflet. يقرأ بيانات المعالم المنشورة فقط، ويعرض البحث والتصفية والمفضلة والخريطة وتحديد الموقع والمسارات ومجتمع الزوار والأرشيف ودليل الرحلة الذكي.

| المسار | الغرض |
|---|---|
| `/` | بوابة Ouedna والتنزيل السريع |
| `/explore` | استكشاف المعالم والبحث والتصفية |
| `/map` | خريطة تفاعلية ومسارات وتحديد موقع |
| `/archive` و`/community` | ذاكرة الوادي وصوت الزوار |
| `/guide` و`/itinerary` | المساعد السياحي ومخطط الرحلات |
| `/download` | تنزيل Android وتثبيت PWA |
| `/privacy` | سياسة الخصوصية |

## التشغيل محلياً

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

تُستخدم قيم `NEXT_PUBLIC_SUPABASE_URL` و`NEXT_PUBLIC_SUPABASE_ANON_KEY` للقراءة العامة. لا تضع مفاتيح `service_role` أو مفاتيح مزودي الذكاء الاصطناعي داخل المتصفح أو في المستودع.

## التحقق والنشر

```bash
pnpm lint
NODE_ENV=production pnpm build
```

الدفع إلى `main` يشغّل النشر الإنتاجي على Vercel. يعتمد `sitemap.xml` و`robots.txt` وcanonical على نطاق `https://ouedna.vercel.app`.
