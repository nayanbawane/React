import { HashRouter, BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import MainLayout from '@/layouts/MainLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import NotFoundPage from '@/pages/NotFoundPage';

const PreBookingPage = lazy(
  () => import('@/features/LCL/PreBooking/preBookingPage')
);

const BookingPage = lazy(() => import('@/features/LCL/Booking/bookingPage'));
const QuotePage = lazy(() => import('@/features/LCL/Quote/quotePage'));

interface FeatureRouteConfig {
  path: string;
  label: string;
  element: JSX.Element;
}

const HealthCheck = () => {
  return (
<div>
<h1>Application is running</h1>
<p>Status: OK</p>
</div>
  );
};

const path = window.location.pathname;

const baseName =
    path.lastIndexOf('/') > 0
        ? path.substring(0, path.lastIndexOf('/'))
        : '';

const featureRoutes: FeatureRouteConfig[] = [
  {
    path: '/reactHealth',
    label: 'Health-Check',
    element: <HealthCheck />,
  },
  {
    path: '/prebooking',
    label: 'Pre-Booking',
    element: <PreBookingPage />,
  }, 
  {
    path: '/booking',
    label: 'Booking',
    element: <BookingPage />,
  },
  {
    path: '/quote',
    label: 'Quote',
    element: <QuotePage />,
  },
];

function App() {
  return (
      <BrowserRouter basename={baseName}>
      <Routes>
        <Route path="/reactHealth" element={<HealthCheck />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/booking" element={<BookingPage />} />

        <Route path="/prebooking" element={<PreBookingPage />} />             

      </Routes>
    </BrowserRouter>
  );
}

export default App;
