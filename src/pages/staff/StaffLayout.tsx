import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BedDouble, Building2, ClipboardList, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

const tabs = [
  { to: '/staff/reservations', label: 'Reservations', icon: ClipboardList },
  { to: '/staff/hotels', label: 'Hotels', icon: Building2 },
  { to: '/staff/rooms', label: 'Rooms', icon: BedDouble },
];

export default function StaffLayout() {
  const staff = useAuthStore((s) => s.staff);
  const staffLogout = useAuthStore((s) => s.staffLogout);
  const navigate = useNavigate();

  if (!staff) return <Navigate to="/staff/login" replace />;

  function handleLogout() {
    staffLogout();
    navigate('/staff/login', { replace: true });
  }

  return (
    <div className="container px-4 py-10 sm:py-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Staff portal</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Signed in as {staff.name} ({staff.email})
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>

        <nav className="flex flex-wrap gap-2 border-b" aria-label="Staff sections">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 rounded-t-md border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-forest-600 text-forest-700 dark:border-forest-400 dark:text-forest-300'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </div>
    </div>
  );
}
