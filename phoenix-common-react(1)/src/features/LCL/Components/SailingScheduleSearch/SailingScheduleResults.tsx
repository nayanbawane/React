import { useState } from 'react';
import { Box } from '@mui/material';
import type {
  SailingScheduleResultsProps,
  ScheduleRow,
  ScheduleGroup,
} from '@/types/LCL/misc/SailingScheduleSearch.types';
import styles from '../../../../styles/LCL/SailingScheduleSearch.module.css';

function fmtDate(raw: string): string {
  if (!raw) return '';
  const [y, m, d] = raw.split('-');
  if (!y || !m || !d) return raw;
  return `${m}/${d}/${y}`;
}

function fmtCutoff(raw: string): string {
  if (!raw) return '';
  const sp = raw.indexOf(' ');
  const date = sp > -1 ? raw.slice(0, sp) : raw;
  const time = sp > -1 ? raw.slice(sp + 1, sp + 6) : '';
  return time ? `${fmtDate(date)} / ${time}` : fmtDate(date);
}

type ColKey = typeof COLUMNS[number]['key'];

function displayCell(key: ColKey, row: ScheduleRow): string {
  if (key === 'cutOffDateTime') return fmtCutoff(row.cutOffDateTime);
  if (key === 'etd') return fmtDate(row.etd);
  if (key === 'eta') return fmtDate(row.eta);
  return String(row[key] ?? '');
}

const COLUMNS = [
  { key: 'vesselVoyage', label: 'Vessel/Voyage' },
  { key: 'carrierScac', label: 'Carrier SCAC' },
  { key: 'houseCarrierScac', label: 'House Carrier SCAC' },
  { key: 'cutOffDateTime', label: 'Cut Off Date/Time' },
  { key: 'etd', label: 'ETD' },
  { key: 'eta', label: 'ETA' },
  { key: 'routingVia', label: 'Routing via' },
  { key: 'transitTimeCutoffPort', label: 'Transit Time Cut-off/Port' },
  { key: 'transitTimePortPort', label: 'Transit Time Port/Port' },
] as const;

function SailingScheduleResults({
  groups,
  isLoading = false,
  isAccurateRatesReset,
  onBookThis,
  onBackToSearch,
  onShowNearby,
}: SailingScheduleResultsProps) {
  const [collapsedSet, setCollapsedSet] = useState<Set<number>>(new Set());

  const toggleCollapse = (idx: number) => {
    setCollapsedSet((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  return (
    <Box className={styles.resultsRoot}>
      <Box className={styles.resultsNavRow}>
        <span
          className={styles.resultLink}
          onClick={onBackToSearch}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onBackToSearch()}
        >
          Back to Schedule Search
        </span>
      </Box>

      <Box className={styles.resultsTopBar}>
        <Box className={styles.resultsTitle}>Sailing Schedule Result(s)</Box>
        <span
          className={styles.resultLink}
          onClick={onShowNearby}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onShowNearby?.()}
        >
          Show Nearby Schedules
        </span>
      </Box>

      {isLoading ? (
        groups.map((group: ScheduleGroup, gi: number) => (
          <Box key={gi} className={styles.group}>
            <Box className={styles.groupHeader}>
              <span>{group.label}</span>
              <Box className={styles.collapseBtn}>−</Box>
            </Box>
            <Box className={styles.loadingRow}>
              <div className={styles.spinner} />
            </Box>
          </Box>
        ))
      ) : groups.length === 0 ? (
        <Box className={styles.noResults}>No schedules found.</Box>
      ) : (
        groups.map((group: ScheduleGroup, gi: number) => {
          const collapsed = collapsedSet.has(gi);
          return (
            <Box key={gi} className={styles.group}>
              <Box className={styles.groupHeader}>
                <span>{group.label}</span>
                <Box
                  className={styles.collapseBtn}
                  onClick={() => toggleCollapse(gi)}
                >
                  {collapsed ? '+' : '−'}
                </Box>
              </Box>

              {!collapsed && (
                <Box className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <colgroup>
                      <col style={{ width: '13%' }} />
                      <col style={{ width: '5%' }} />
                      <col style={{ width: '5%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '7%' }} />
                      <col style={{ width: '7%' }} />
                      <col style={{ width: '8%' }} />
                    </colgroup>
                    <thead>
                      <tr>
                        {COLUMNS.map((col) => (
                          <th key={col.key} className={styles.th}>
                            {col.label}
                          </th>
                        ))}
                        <th className={styles.th} />
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((row: ScheduleRow, ri: number) => (
                        <tr key={ri} className={styles.tr}>
                          {COLUMNS.map((col) => (
                            <td key={col.key} className={styles.td}>
                              {displayCell(col.key, row)}
                            </td>
                          ))}
                          <td className={styles.td}>
                            <span
                              className={styles.bookThisLink}
                              onClick={() => onBookThis(row, group, isAccurateRatesReset ?? 'YES')}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) =>
                                e.key === 'Enter' && onBookThis(row, group, isAccurateRatesReset ?? 'YES')
                              }
                            >
                              Book This
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
}

export default SailingScheduleResults;
