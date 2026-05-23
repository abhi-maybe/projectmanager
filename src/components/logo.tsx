import { Plus_Jakarta_Sans } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

const font = Plus_Jakarta_Sans({
  weight: ['700', '800'],
  subsets: ['latin'],
});

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-x-2.5">
      <Image src="/icon.svg" alt="Icon" height={36} width={36} className="object-contain" />
      <p className={cn('text-2xl font-extrabold tracking-tight text-primary dark:text-white', font.className)}>PRM</p>
    </Link>
  );
};
