import React, { useState } from 'react';
import LocationResultDetail from './LocationResultDetail';
import styles from '../../../../styles/LCL/LocationSearch.module.css';
import { LocationResult } from '@/types';

interface Props {
  results: LocationResult[];
  onSelect?: (loc: LocationResult) => void;
  onBackToSearch: () => void;
}

const HEADERS = [
  'Code', 'Name', 'Export Region', 'Import Region',
  'UN Code', 'LCL Agent', 'FCL Agent', 'Deconsolidation Point', '',
];

const LocationResultTable: React.FC<Props> = ({ results, onSelect, onBackToSearch }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      <div className={styles.toolbar}>
        <span className={styles.toolbarTitle}>Location</span>
        <span className={styles.backLink} onClick={onBackToSearch}>← Back to Search</span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {HEADERS.map((h, i) => (
                <th
                  key={i}
                  className={i === HEADERS.length - 1 ? styles.thLast : styles.th}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {results.length === 0 && (
              <tr>
                <td colSpan={9} className={styles.tdNoRecord}>
                  No records found.
                </td>
              </tr>
            )}
            {results.map((loc, idx) => {
              const isExpanded = expandedIds.has(loc.id);
              const rowClass = idx % 2 === 0 ? styles.trEven : styles.trOdd;

              return (
                <React.Fragment key={loc.id}>
                  <tr className={rowClass}>
                    <td className={isExpanded ? styles.tdExpandedLeft : styles.td}>
                      {loc.code}
                    </td>
                    <td className={styles.td}>{loc.name}</td>
                    <td className={styles.td}>{loc.exportRegion}</td>
                    <td className={styles.td}>{loc.importRegion}</td>
                    <td className={styles.td}>{loc.unCode}</td>
                    <td className={styles.td}>{loc.lclAgent}</td>
                    <td className={styles.td}>{loc.fclAgent}</td>
                    <td className={styles.td}>{loc.deconsolidationPoint}</td>
                    <td className={isExpanded ? styles.tdBtnExpanded : styles.tdBtn}>
                      <div className={styles.actionBtnRow}>
                        <button className={styles.actionBtn} onClick={() => toggleExpand(loc.id)}>
                          {isExpanded ? '▲' : '▼'}
                        </button>
                        {onSelect && (
                          <button className={styles.actionBtnPlus} onClick={() => onSelect(loc)}>
                            +
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={9} className={styles.detailCell}>
                        <LocationResultDetail loc={loc} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default LocationResultTable;
