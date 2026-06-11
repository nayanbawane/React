import { ReactNode } from 'react';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
  featureLinks?: Array<{ path: string; label: string }>;
}

const MainLayout = ({ children, featureLinks = [] }: MainLayoutProps) => {
  return (
    <div className='booking_quote_outer_main_panel'>
      <main style={{ flex: 1, padding: '5px' }}>{children}</main>
    </div>
  );
};

export default MainLayout;
