import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-xpress-bg-primary flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-xpress-accent-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-xpress-accent-red" />
        </div>
        
        <h1 className="text-6xl font-bold text-xpress-text-primary mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-semibold text-xpress-text-primary mb-2">
          Page Not Found
        </h2>
        
        <p className="text-xpress-text-secondary mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link to="/">
          <Button variant="primary" icon={<Home className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
