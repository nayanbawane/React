import styles from '../../../styles/LCL/ErrorPages.module.css';

const NotFoundPage = () => {
  return (
    <div className={styles.pageContainer}>
      <div>
        <h1>404</h1>
        <p>The page you are looking for does not exist.</p>
      </div>
    </div>
  );
};

export default NotFoundPage;
