import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '@/components/ui/Button';
import SEO from '@/components/common/SEO';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <SEO 
        title="Page Not Found" 
        description="The page you are looking for does not exist on BayanihanHub." 
        noindex={true} 
      />
      <div className="text-center max-w-md w-full">
        <h1 className="text-9xl font-extrabold text-primary-200 mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">Page not found</h2>
        <p className="text-neutral-500 mb-8 leading-relaxed">
          We couldn't find the page you were looking for. It might have been moved, deleted, or never existed in the first place.
        </p>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="lg" className="w-full sm:w-auto font-semibold px-8" rightIcon={<Home className="w-5 h-5" />}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
