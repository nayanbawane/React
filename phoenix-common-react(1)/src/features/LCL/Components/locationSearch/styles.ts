import type React from 'react';

export const C = {
  sectionBg:     '#e9f6fe',
  sectionBorder: '#c8d8e8',
  sectionTitle:  '#0078c2',
  headerBg:      '#e9e9e9',
  headerText:    '#000000',
  rowAlt:        '#f5f9ff',
  widgetBg:      '#ffffff',
};

export const ROW_WITH_TOP: React.CSSProperties = {
  display: 'flex',
  borderTop:    `1px solid ${C.sectionBorder}`,
  borderBottom: `1px solid ${C.sectionBorder}`,
};

export const ROW: React.CSSProperties = {
  display: 'flex',
  borderBottom: `1px solid ${C.sectionBorder}`,
};

export const SECTION_TITLE_COL: React.CSSProperties = {
  width: 120,
  minWidth: 120,
  background:   C.sectionBg,
  borderRight:  `1px solid ${C.sectionBorder}`,
  padding:      '5px 8px',
  fontWeight:   700,
  fontSize:     13,
  color:        'black',
  boxSizing:    'border-box',
  display:      'flex',
};

export const SECTION_CONTENT: React.CSSProperties = {
  flex: 1,
  padding: '6px 8px',
  boxSizing: 'border-box',
};

export const BTN: React.CSSProperties = {
  height:     22,
  minWidth:   56,
  padding:    '0 10px',
  fontSize:   11,
  fontWeight: 600,
  cursor:     'pointer',
  border:     '1px solid #0066a5',
  borderRadius: 2,
  background: 'linear-gradient(180deg, #3aa0d8 0%, #1f79b7 100%)',
  color:      'white',
};

export const BTN_HOVER: React.CSSProperties = {
  background: 'linear-gradient(180deg, #2a8fc7 0%, #0f68a6 100%)',
};

export const BTN_DISABLED: React.CSSProperties = {
  opacity: 0.5,
  cursor:  'default',
};

export const RESULT_TABLE: React.CSSProperties = {
  width:           '100%',
  borderCollapse:  'collapse',
  fontSize:        11,
  fontFamily:      'Arial, Helvetica, sans-serif',
};

export const TH: React.CSSProperties = {
  background:  C.headerBg,
  color:       C.headerText,
  padding:     '4px 8px',
  textAlign:   'left',
  fontWeight:  600,
  fontSize:    11,
  borderRight: 'rgba(255,255,255,0.2) 1px solid',
  whiteSpace:  'nowrap',
};

export const TD: React.CSSProperties = {
  padding:       '3px 8px',
  borderBottom:  `1px solid ${C.sectionBorder}`,
  fontSize:      11,
  verticalAlign: 'middle',
};

export const TD_BTN: React.CSSProperties = {
  ...TD,
  textAlign: 'center',
  width:     60,
  padding:   '3px 4px',
};

export const rowBg = (idx: number): React.CSSProperties => ({
  background: idx % 2 === 0 ? C.widgetBg : C.rowAlt,
});
