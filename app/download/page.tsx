import {
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import PlatformFrame from "@/components/platform/PlatformFrame";

const APP_VERSION = "2.1.5";
const APK_URL =
  "https://github.com/nadjimyahiaoui1992-lab/ouedna-app/releases/download/v2.1.5-admin/app-direct-release.apk";
const RELEASE_URL =
  "https://github.com/nadjimyahiaoui1992-lab/ouedna-app/releases/tag/v2.1.5-admin";
const APK_SHA256 =
  "0ca3049540ef5d20c4157bf8ad35e86a17eab82d35f35b57414046257c5b3511";

export default function DownloadPage() {
  return (
    <PlatformFrame>
      <section className="platform-download-page">
        <div className="platform-container">
          <div className="platform-download-hero">
            <div>
              <span className="platform-eyebrow">
                <i /> مركز تنزيل Ouedna
              </span>
              <h1>
                خذ الوادي
                <br />
                <em>معك.</em>
              </h1>
              <p>
                النسخة الرسمية الجديدة لتطبيق Ouedna Android. حدّث التطبيق
                للاستفادة من خط الرحلة بجدول يومي أدق، وتجربة GPS والخريطة
                والإشعارات المحسّنة.
              </p>
              <div className="platform-hero-actions">
                <a
                  className="platform-button platform-button--amber"
                  href={APK_URL}
                >
                  <Download size={18} /> تنزيل APK {APP_VERSION}
                </a>
                <a
                  className="platform-button platform-button--outline"
                  href={RELEASE_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={16} /> صفحة الإصدار
                </a>
              </div>
            </div>
            <div className="platform-download-card">
              <Image
                src="/ouedna/ouedna-apk-qr.png"
                alt="رمز QR لتحميل تحديث تطبيق Ouedna"
                width={180}
                height={180}
              />
              <strong>امسح من هاتفك</strong>
              <span>Android · {APP_VERSION}</span>
            </div>
          </div>

          <div className="platform-download-release">
            <div>
              <span>التحديث الرسمي الحالي</span>
              <strong>Ouedna {APP_VERSION}</strong>
              <small>
                <ShieldCheck size={14} /> تحديث فوق النسخة السابقة، وليس تثبيتًا
                جديدًا
              </small>
            </div>
            <a className="platform-button platform-button--amber" href={APK_URL}>
              <Download size={16} /> تحميل التحديث
            </a>
          </div>

          <div className="platform-install-grid">
            <article>
              <b>01</b>
              <Smartphone size={21} />
              <h2>نزّل التحديث</h2>
              <p>افتح الرابط من هاتف Android وحمّل ملف APK الرسمي.</p>
            </article>
            <article>
              <b>02</b>
              <ShieldCheck size={21} />
              <h2>اسمح بالتحديث</h2>
              <p>
                عند طلب Android، فعّل السماح للمتصفح المستخدم فقط ثم عُد إلى
                التثبيت.
              </p>
            </article>
            <article>
              <b>03</b>
              <FileCheck2 size={21} />
              <h2>تحقق من الملف</h2>
              <p>قارن بصمة SHA-256 المعروضة أدناه قبل تأكيد التحديث.</p>
            </article>
            <article>
              <b>04</b>
              <CheckCircle2 size={21} />
              <h2>حدّث وابدأ</h2>
              <p>أكد التحديث فوق النسخة الحالية ثم افتح Ouedna واستكشف الوادي.</p>
            </article>
          </div>

          <div className="platform-download-safety">
            <ShieldCheck size={22} />
            <div>
              <strong>سلامة التحديث</strong>
              <p>
                هذا الملف موقّع رسميًا ومخصص لتحديث Ouedna. لا تحذف النسخة
                الحالية قبل التثبيت؛ الهدف هو تحديثها مع الحفاظ على بياناتك
                وإعداداتك.
              </p>
              <code>SHA-256: {APK_SHA256}</code>
            </div>
          </div>

          <div className="platform-download-faq">
            <h2>أسئلة سريعة</h2>
            <details>
              <summary>هل هذا تحديث أم تثبيت جديد؟</summary>
              <p>
                هذا تحديث رسمي للإصدار {APP_VERSION} فوق النسخة السابقة. إذا
                ظهر تعارض، لا تحذف التطبيق مباشرة؛ تأكد أولًا من أن النسخة
                الحالية مثبتة من المصدر الرسمي.
              </p>
            </details>
            <details>
              <summary>هل يعمل التطبيق خارج Google Play؟</summary>
              <p>
                نعم، هذه النسخة الرسمية توزّع مباشرة من صفحة الإصدار، ويجب
                اتباع خطوات Android للمصادر الخارجية عند ظهور الطلب.
              </p>
            </details>
            <details>
              <summary>كيف أعرف أن الملف رسمي؟</summary>
              <p>
                استخدم رابط التحميل وصفحة الإصدار الرسمية، ثم قارن قيمة SHA-256
                المعروضة هنا بالملف الذي حمّلته.
              </p>
            </details>
          </div>
        </div>
      </section>
    </PlatformFrame>
  );
}
