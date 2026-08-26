import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface PagePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Designed empty-state used for pages that gain full functionality in a
 * later phase. Reads as a helpful state, never as a scaffold stub.
 */
export default function PagePlaceholder({ icon: Icon, title, description, children, className }: PagePlaceholderProps) {
  return (
    <section className={cn('container flex flex-col items-center px-4 py-24 text-center sm:py-28', className)}>
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-forest-100 to-forest-200 text-forest-700 ring-1 ring-forest-700/10 dark:from-forest-900 dark:to-forest-950 dark:text-forest-300 dark:ring-forest-300/10">
        <Icon className="h-8 w-8" />
      </span>
      <h1 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">{description}</p>
      {children && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>}
    </section>
  );
}
