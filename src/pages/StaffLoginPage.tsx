import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const staff = useAuthStore((s) => s.staff);
  const staffLogin = useAuthStore((s) => s.staffLogin);

  const [email, setEmail] = useState('staff@hotel.app');
  const [password, setPassword] = useState('staff123');
  const [error, setError] = useState('');

  if (staff) return <Navigate to="/staff" replace />;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (staffLogin(email, password)) {
      navigate('/staff', { replace: true });
    } else {
      setError('Invalid email or password. Use the demo credentials shown below.');
    }
  }

  return (
    <div className="container flex flex-col items-center px-4 py-16 sm:py-24">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-forest-100 to-forest-200 text-forest-700 ring-1 ring-forest-700/10 dark:from-forest-900 dark:to-forest-950 dark:text-forest-300 dark:ring-forest-300/10">
        <ShieldCheck className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Staff portal</h1>
      <p className="mt-3 max-w-md text-center text-base leading-relaxed text-muted-foreground">
        Sign in to review reservations and manage hotel inventory.
      </p>

      <Card className="mt-8 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Sign in</CardTitle>
          <CardDescription>Use the demo account to explore the staff workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge variant="secondary" className="px-3 py-1 font-mono text-xs">
            staff@hotel.app · staff123
          </Badge>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="staff-email">Email</Label>
              <Input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-password">Password</Label>
              <Input
                id="staff-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full gap-2">
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
