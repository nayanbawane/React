import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import MainLayout from '@/layouts/MainLayout';
import LoadingSpinner from '@/features/LCL/Components/LoadingSpinner';
import ErrorBoundary from '@/features/LCL/Components/ErrorBoundary';
import NotFoundPage from '@/features/LCL/pages/NotFoundPage';
import BookingMainDetailsSection from '../../features/LCL/Components/BookingMainDetails/BookingMainDetails';
import CustomerDetails from '../../features/LCL/Components/CustomDetails/CustomDetails';
import UploadDocumentsDemo from '@/features/LCL/Components/UploadDocuments/UploadDocumentsDemo';
import RateDetails from '../../features/LCL/Components/RateDetails/RateDetails';
import DocumentUploadDemo from '../../features/LCL/Components/DocumentUpload/DocumentUploadDemo';
// import LCLRoutingPage from '@/shared/components/RoutingComponent/LCLRoutingPage';
import RoutingDetailsPage from '../../features/LCL/Components/RoutingDetails/RoutingDetailsPage';
import { PreBookingMainDetails } from '../../features/LCL/Components/PreBookingMainDetails/PreBookingMainDetails';
import { CargoDetailsPage, FCLQuoteRoutingDetails } from '@/features';

import { FCLEquipmentDetails, FCLTruckingDetails } from '@/features';

const DocumentDetailsPage = lazy(
  () => import('../../features/LCL/Components/DocumentDetails/DocumentDetails')
);
const QuoteBookingPage = lazy(
  () => import('../../features/LCL/pages/QuoteBooking/QuoteBookingPage')
);

interface FeatureRouteConfig {
  path: string;
  label: string;
  element: JSX.Element;
}

const shippingType = "F" as "F" | "L"

const featureRoutes: FeatureRouteConfig[] = [
  {
    path: '/document-details',
    label: 'Document Details',
    element: <DocumentDetailsPage />,
  },
  {
    path: '/main-details',
    label: 'Main Details',
    element: <BookingMainDetailsSection />,
  },
  {
    path: '/customer-details',
    label: 'Customer Details',
    element: (
      <CustomerDetails
        bookingType="l"
        // isOpen={true}
        isPreBooking={true}
      // onToggle={() => {}}
      />
    ),
  },
  {
    path: '/DocumentUpload',
    label: ' DocumentUpload',
    element: <DocumentUploadDemo />,
  },
  // {
  //   path: '/LCLRouting',
  //   label: 'LCL Routing',
  //   element: <LCLRoutingPage />,
  // },
  {
    path: '/routing-details',
    label: 'Routing Details',
    element: <RoutingDetailsPage />,
  },

  {
    path: '/rateDetails',
    label: 'Rate Details',
    element: <RateDetails moduleType="BKG" />,
  },
  {
    path: '/prebookingMain',
    label: 'prebookingMain',
    element: <PreBookingMainDetails />,
  },
  {
    path: '/upload-documents',
    label: 'Upload Documents',
    element: <UploadDocumentsDemo />,
  },
  {
    path: '/quote-booking',
    label: 'Quote Booking',
    element: <QuoteBookingPage />,
  },
  {
    path: '/FileUploadRefector',
    label: 'File Upload Refector',
    element: <DocumentUploadDemo />,
  },
  // {
  //   path: '/FCLRoutingDetails',
  //   label: 'FCL Routing Details',
  //   element: <FCLRoutingDetails />
  // },
  {
    path: '/FCLRoutingDetails',
    label: 'FCL Routing Details',
    element: <FCLQuoteRoutingDetails />
  },
  {
    path: '/QuoteBookingCargoDetails',
    label: 'QuoteBooking Cargo Details',
    element: <CargoDetailsPage
      shippingType={shippingType}
    />
  },
  {
    path: '/FCLEquipmentDetails',
    label: 'FCL Equipment Details',
    element: <FCLEquipmentDetails />
    
  },
  {
    path: '/FCLTruckingDetails',
    label: 'FCL Trucking Details',
    element: <FCLTruckingDetails />
    
  }
];

const AppRouter = () => {
  const defaultRoute = featureRoutes[0]?.path ?? '/';

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            <Route path="/" element={<Navigate to={defaultRoute} replace />} />
            {featureRoutes.map((feature) => (
              <Route
                key={feature.path}
                path={feature.path}
                element={
                  <MainLayout
                    featureLinks={featureRoutes.map(({ path, label }) => ({
                      path,
                      label,
                    }))}
                  >
                    {feature.element}
                  </MainLayout>
                }
              />
            ))}
            <Route
              path="*"
              element={
                <MainLayout
                  featureLinks={featureRoutes.map(({ path, label }) => ({
                    path,
                    label,
                  }))}
                >
                  <NotFoundPage />
                </MainLayout>
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRouter;
