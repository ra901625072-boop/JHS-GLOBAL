import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import Button from '../../components/ui/Button';

export const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found — 404</title>
      </Helmet>
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-20 text-center">
        <div className="max-w-md">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-primary-800 mx-auto mb-6">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-neutral-900">Document Not Located</h1>
          <p className="mt-3 text-sm text-neutral-600">
            The commodity page or resource you requested may have been repositioned or updated in our international export catalogue.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/">
              <Button variant="primary" size="md" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" size="md" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Explore Products</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
