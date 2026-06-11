import { Box, Button } from '@mui/material';
import { PRippleButton } from 'phoenix-react-lib';
import styles from '../../../../styles/LCL/Header.module.css';

export default function Header({ statusBtns, flags, setFlags, activeTab, setActiveTab ,modulecode}: any) {
  return (
    <Box className={styles.cargoStatusRow}>
      {statusBtns.map(({ key, label, handler }: any) => (
        <PRippleButton
          key={key}
          title={label}
          active={flags[key]}
          onChange={
            handler
              ? () => handler()
              : (next: boolean) => setFlags((f: any) => ({ ...f, [key]: next }))
          }
          className={`${styles.cargoStatusBtn}${flags[key] ? ' active' : ''}${key === 'nonStackable' && flags[key] ? ' non-stackable' : ''}`}
        />
      ))}

      {modulecode === 'BKG' && (
        <Box className={styles.cargoTabSwitch}>
          {[
            ['actual', 'Actual'],
            ['customsDeclared', 'Customs Declared'],
          ].map(([tabKey, tabLabel]) => (
            <Button
              key={tabKey}
              className={`${styles.cargoTabBtn}${activeTab === tabKey ? ` ${styles.active}` : ''}`}
              onClick={() => setActiveTab(tabKey)}
            >
              {tabLabel}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
}
