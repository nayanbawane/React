import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../styles/LCL/MainLayout.module.css';

interface MainLayoutProps {
  children: ReactNode;
  featureLinks?: Array<{ path: string; label: string }>;
}

const MainLayout = ({ children, featureLinks = [] }: MainLayoutProps) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Phoenix React Module</h2>
        {featureLinks.length > 0 && (
          <nav className={styles.nav}>
            {featureLinks.map((feature) => (
              <NavLink
                key={feature.path}
                to={feature.path}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
              >
                {feature.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <p>Embedded iframe module for booking import</p>
      </footer>
    </div>
  );
};

export default MainLayout;
