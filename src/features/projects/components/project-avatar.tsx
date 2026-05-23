import Image from 'next/image';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ProjectAvatarProps {
  image?: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export const ProjectAvatar = ({ image, name, className, fallbackClassName }: ProjectAvatarProps) => {
  if (image) {
    return (
      <div className={cn('relative size-5 overflow-hidden rounded-full', className)}>
        <Image src={image} alt={name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <Avatar className={cn('size-5 rounded-full', className)}>
      <AvatarFallback className={cn('rounded-full bg-blue-600 text-xs font-semibold uppercase text-white', fallbackClassName)}>
        {name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};
