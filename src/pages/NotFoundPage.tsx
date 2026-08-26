import { Link } from 'react-router-dom';
import { ArrowLeft, TreeDeciduous } from 'lucide-react';
import { Button } from '../components/ui/Button';
import PagePlaceholder from '../components/PagePlaceholder';

export default function NotFoundPage() {
  return (
    <PagePlaceholder
      icon={TreeDeciduous}
      title="Lost in the woods?"
      description="The page you're looking for doesn't exist or has moved. Head back to the trailhead and start fresh."
    >
      <Button asChild className="gap-2">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </Button>
    </PagePlaceholder>
  );
}
