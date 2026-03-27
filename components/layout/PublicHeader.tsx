import Link from 'next/link';
import { Logo } from '@/components/common/Logo';

export function PublicHeader() {
  return (
    <header className="bg-white border-b border-gray-200 py-4">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
        <Logo size="md" />
        <Link
          href="/login"
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Giriş Yap
        </Link>
      </div>
    </header>
  );
}
