import { Cairo } from 'next/font/google';
import './tokens.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: 'لوحة تحكم سوف 360',
};

export default function AdminLayout({ children }) {
  return (
    <div id="admin-root" dir="rtl" lang="ar" className={cairo.className}>
      {children}
    </div>
  );
}
