const FIELD_H      = "22px";
const FIELD_FONT   = "12px";
const FIELD_PAD    = "3px 5px";
const FIELD_RADIUS = "20px";

export const inputSx = {
  width: "100%",
  "& .MuiInputBase-root": {
    height: FIELD_H,
    minHeight: FIELD_H,
    fontSize: FIELD_FONT,
    borderRadius: FIELD_RADIUS,
    backgroundColor: "white",
    boxSizing: "border-box" as const,
  },
  "& .MuiInputBase-input": {
    height: FIELD_H,
    padding: FIELD_PAD,
    fontSize: FIELD_FONT,
    boxSizing: "border-box" as const,
  },
  "& .MuiSelect-select": {
    height: `${FIELD_H} !important`,
    minHeight: "unset !important",
    padding: `${FIELD_PAD} !important`,
    fontSize: FIELD_FONT,
    lineHeight: FIELD_H,
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box" as const,
    boxShadow: "inset 1px 1px 1px #ddd;",
    backgroundColor: "white",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#bbb",
    borderRadius: FIELD_RADIUS,
  },
  "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "black",
    borderWidth: "2px",
  },
  "& .MuiSelect-icon": {
    fontSize: "16px",
    right: "4px",
  },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#000' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#000',borderRadius:'3px' },
} as const;

export const selectOverrideSx = {
  ...inputSx,
  "& .MuiOutlinedInput-notchedOutline": {
    borderWidth: "1px",
    borderRadius: "1px",
  },
  "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "black",
    borderWidth: "2px",
  },
} as const;


export const PAGE_SIZE = 100;
export const MAX_PAGE_BUTTONS = 10;
export const FILTER_PANEL_WIDTH = 185;
export const FOUND_ROW_HEIGHT = 32;

export const COL_WIDTHS = {
  expand:  28,
  type:    80,
  code:   80,
  alias:  80,
  name:   100,
  address:100,
  city:    60,
  state:   70,
  country: 80,
  phone:  105,
  email:  80,
  region:  40,
  select:  36,
};

export const sharedMenuProps = {
  disableScrollLock: true,
  PaperProps: {
    sx: {
      borderRadius: '0px',
      border: '1px solid #000',
      boxShadow: 'none',
      '& .MuiList-root': { padding: 0 },
      '& .MuiMenuItem-root': {
        fontSize: '12px',
        color: '#555',
        padding: '2px 10px',
        minHeight: '22px',
        fontFamily: 'Arial, Helvetica, sans-serif',
      },
      '& .MuiMenuItem-root.Mui-selected': {
        backgroundColor: '#1976d2',
        color: '#fff !important',
        '&:hover': { backgroundColor: '#1976d2' },
      },
      '& .MuiMenuItem-root:hover': { backgroundColor: '#f5f5f5' },
    },
  },
};