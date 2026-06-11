import { Typography } from "@mui/material";
import styles from '../../../../styles/LCL/RateDetails.module.css';
import rateDetailsSprite from '../../../../assets/ratedetails_task-sprite.png';

type Item = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const items: Item[] = [
  { label: "Ocean Freight (OFR)", x: -180, y: -60, width: 24, height: 14 },
  { label: "Origin Charges (FOB)", x: -60, y: -80, width: 16, height: 15 },
  { label: "Post Landing Charges (PLC)", x: -160, y: -80, width: 16, height: 15 },
  { label: "Income", x: -80, y: -80, width: 14, height: 10 },
  { label: "Expense", x: -100, y: -80, width: 14, height: 10 },
];

const SpriteIcon = ({ x, y, width, height }: { x: number; y: number; width: number; height: number }) => (
  <div
    style={{
      width: `${width}px`,
      height: `${height}px`,
      backgroundImage: `url('${rateDetailsSprite}')`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: `${x}px ${y}px`,
      flexShrink: 0,
    }}
  />
);

export function RateDetailsIcons() {
  return (
    <div className={styles.iconLegend}>
      {items.map((item) => (
        <div key={item.label} className={styles.iconLegendItem}>
          <SpriteIcon x={item.x} y={item.y} width={item.width} height={item.height} />
          <Typography className={styles.iconLegendLabel}>{item.label}</Typography>
        </div>
      ))}
    </div>
  );
}


export default RateDetailsIcons;
