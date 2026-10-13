import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import WhatsAppButton from '../components/layout/WhatsAppButton';
import QuoteDrawer from '../components/rfq/QuoteDrawer';
import ChatWidget from '../components/ai/ChatWidget';
import RouteTransition from '../components/layout/RouteTransition';
import StickyMobileQuoteBar from '../components/layout/StickyMobileQuoteBar';
import { useSmoothScroll } from '../hooks/useSmoothScroll';

export const App = () => {
  // Mount calm inertial smooth scroll (automatically bypassed under prefers-reduced-motion)
  useSmoothScroll();

  return (
    <div className="flex flex-col min-h-screen bg-surface-canvas text-neutral-800 antialiased">
      <Header />
      <main className="flex-1">
        <RouteTransition>
          <Outlet />
        </RouteTransition>
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
      <QuoteDrawer />
      <StickyMobileQuoteBar />
    </div>
  );
};

export default App;
