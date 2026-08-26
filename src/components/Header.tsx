import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Home, LayoutDashboard, Menu, Search, Ticket, TreePine, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import ThemeToggle from './ThemeToggle';

const guestLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/lookup', label: 'My Booking', icon: Ticket },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-forest-500 to-forest-700 text-white shadow-soft">
            <TreePine className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Evergreen <span className="text-forest-700 dark:text-forest-400">Stays</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {guestLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={navLinkClass}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button asChild variant="secondary" size="sm" className="hidden sm:inline-flex">
            <Link to="/staff" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Staff
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t bg-background md:hidden" aria-label="Mobile">
          <div className="container flex flex-col gap-1 py-3">
            {guestLinks.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/'} className={navLinkClass} onClick={() => setOpen(false)}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <NavLink to="/staff" className={navLinkClass} onClick={() => setOpen(false)}>
              <LayoutDashboard className="h-4 w-4" />
              Staff
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}
