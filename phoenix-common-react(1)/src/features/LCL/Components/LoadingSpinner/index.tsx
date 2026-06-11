import styles from '../../../../styles/LCL/LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

const LoadingSpinner = ({ fullScreen = false }: LoadingSpinnerProps) => {
  return (
    <div className={`${styles.container} ${fullScreen ? styles.fullScreen : ''}`}>
      <div className={styles.spinner} />
    </div>
  );
};

export default LoadingSpinner;
