import { Link } from 'react-router-dom';
import { TreePine } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-card/60">
      <div className="container flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-forest-500 to-forest-700 text-white">
              <TreePine className="h-4 w-4" />
            </span>
            <span className="font-semibold text-foreground">
              Evergreen <span className="text-forest-700 dark:text-forest-400">Stays</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Hand-picked forest-side hotels and cabins. Reserve with your details only — no payment required until you
            arrive.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-sm">
          <div className="space-y-3">
            <p className="font-medium text-foreground">Guests</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/search" className="hover:text-foreground">
                  Find a stay
                </Link>
              </li>
              <li>
                <Link to="/lookup" className="hover:text-foreground">
                  My booking
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-medium text-foreground">Company</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/staff" className="hover:text-foreground">
                  Staff portal
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-foreground">
                  Home
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="container flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Evergreen Stays. All rights reserved.</p>
          <p>Reservations are confirmed without any payment processing.</p>
        </div>
      </div>
    </footer>
  );
}
