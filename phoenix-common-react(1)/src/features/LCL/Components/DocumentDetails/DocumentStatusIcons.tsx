
import styles from '../../../../styles/LCL/DocumentStatusIcons.module.css';
import receivedIcon from '../../../../assets/icon-signgreenbig.png';
import pendingIcon from '../../../../assets/icon-signredbig.png';
import notReceivedIcon from '../../../../assets/icon-signorangebig.png';

const items = [
  {
    label: "Received",
    icon: receivedIcon,
  },
  {
    label: "Pending",
    icon: pendingIcon,
  },
  {
    label: "Not Received",
    icon: notReceivedIcon,
  },
];

export function DocumentStatusIcon() {
  return (
    <div className={styles.container}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <img src={item.icon} alt={item.label} className={styles.icon} />
          <span className={styles.label}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default DocumentStatusIcon;
