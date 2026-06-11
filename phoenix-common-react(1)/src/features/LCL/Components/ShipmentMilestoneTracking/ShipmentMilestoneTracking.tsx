import React from 'react';
import activeStatusIcon from '../../../../assets/images/activestatus-icon.png';
import inactiveStatusIcon from '../../../../assets/images/inactivestatus-icon.png';
import styles from './ShipmentMilestoneTracking.module.css';

export interface MilestoneStep {
  label: string;
  isActive?: boolean;
  activeDate?: string;
  activeTime?: string;
}

interface ShipmentMilestoneTrackingProps {
  steps: MilestoneStep[];
}

const getLabelClass = (isAbove: boolean, lineCount: number, isActive: boolean): string => {
  const base = isAbove ? styles.labelAbove : styles.labelBelow;
  const position = isAbove
    ? (lineCount === 3 ? styles.labelAboveThree : styles.labelAboveOne)
    : (lineCount === 3 ? styles.labelBelowThree : styles.labelBelowOne);
  return isActive
    ? `${base} ${position} ${styles.labelActive}`
    : `${base} ${position}`;
};

const ShipmentMilestoneTracking: React.FC<ShipmentMilestoneTrackingProps> = ({ steps }) => {
  const last = steps.length - 1;
  return (
    <div className={styles.container}>
      <div className={styles.stepsWrapper}>
        <div className={styles.stepsInner}>
          {steps.map((step, index) => {
            const isAbove = index % 2 === 0;
            const lineCount = step.activeDate ? 3 : 1;
            const labelContent = step.activeDate
              ? `${step.label}\non ${step.activeDate}\nat ${step.activeTime ?? ''}`
              : step.label;

            const itemClass = [
              styles.stepItem,
              index === last ? styles.stepItemLast : '',
            ].filter(Boolean).join(' ');

            return (
              <div key={index} className={itemClass}>
                <img
                  src={step.isActive ? activeStatusIcon : inactiveStatusIcon}
                  className={styles.icon}
                  alt=""
                />
                <div className={styles.stepInner}>
                  <div className={getLabelClass(isAbove, lineCount, !!step.isActive)}>
                    {labelContent}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShipmentMilestoneTracking;
