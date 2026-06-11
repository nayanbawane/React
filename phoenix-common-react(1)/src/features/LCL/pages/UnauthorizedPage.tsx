import styles from '../../../styles/LCL/ErrorPages.module.css';

const UnauthorizedPage = () => {
  return (
    <div className={styles.pageContainer}>
      <div>
        <h1>Unauthorized</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
