import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import { ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import arrowRightImg from "../../../../assets/images/orgarrow-grey-2.png";
import funnelImg from "../../../../assets/images/filter_blue.png";
import minusImg from "../../../../assets/images/minus.png";
import plusImg from "../../../../assets/images/plusImage.png";
import chevronRightImg from "../../../../assets/images/arrow_edoc.jpg";
import chevronLeftImg from "../../../../assets/images/arrow_edoc_active.jpg";

import { PAGE_SIZE, MAX_PAGE_BUTTONS, COL_WIDTHS } from "./styles";

import styles from '../../../../styles/LCL/OrganizationSearch.module.css';
import { FilterState, OrgRow } from "@/types";
import OrganizationExpand from "../OrganizationSearch/OrganizationSerachResultExpand/POrganizationSearchResultExpand";
import React from "react";
import { useApi, useFeatureToggle } from "../../../../hooks";
import { OrganizationResultDetail, OrganizationSearchExpandRequest, OrganizationSearchExpandResponse } from "@/hooks/LCL/OrganizationSerach/organizationSerachService";
import { useSelector } from "react-redux";
import { selectLoginClientBean } from "../../../../core/featureToggles/featureToggle.selectors";
import { CommonToggleKeys } from "../../../../core";
import { COMMON_ENDPOINTS } from '../../../../core/api/config/common.endpoints';


function CellTooltip({ header, value }: { header: string; value: string }) {
  if (!value) return <>{value}</>;
  return (
    <Tooltip
      placement="bottom-start"
      arrow
      title={
        <Box>
          <Typography className={styles.tooltipHeader}>
            {header}
          </Typography>
          <Typography className={styles.tooltipValue}>
            {value}
          </Typography>
        </Box>
      }
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: "white",
            color: "#333",
            border: "1px solid #d8d8d8",
            boxShadow: "0 3px 10px rgba(0,0,0,0.14)",
            borderRadius: "12px",
            px: "10px",
            py: "8px",
            maxWidth: "220px",
          },
        },
        arrow: {
          sx: { color: "white", "&::before": { border: "1px solid #d8d8d8" } },
        },
      }}
    >
      <span className={styles.cellEllipsis}>
        {value}
      </span>
    </Tooltip>
  );
}


type SectionKey = "shipment" | "financial" | "organization" | "salesRep";


export default function POrganizationResultWidget({
  rows = [],
  rowCount,
  onSelect,
  onPageChange,
}: {
  rows: OrgRow[];
  expandData: any;
  rowCount?: string;
  onSelect?: (row: OrgRow) => void;
  onPageChange?: (lowerLimit: number, upperLimit: number) => void;
}) {
  const [page, setPage] = useState(1);
  const [collapsed, setCollapsed] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    inTransit: false,
    uninvoiced: false,
    onHold: false,
    selectedOrgCodes: [],
    selectedSalesReps: [],
  });

  const [collapsedSections, setCollapsedSections] = useState<Set<SectionKey>>(new Set());
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const handleToggleSection = (section: SectionKey) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const [pendingRowId, setPendingRowId] = useState<string | null>(null);
  const {
    data: organizationSearchExpandData,
    loading: isOrganizationSearchExpandDataFetching,
    execute: executeOrganizationSearchExpandDataFetch,
  } = useApi<OrganizationSearchExpandRequest, OrganizationSearchExpandResponse>({
    endpoint: COMMON_ENDPOINTS.ORGANIZATION_SEARCH.GET_ORGANIZATION_SEARCH_EXPAND_DATA,
    onSuccess: () => {
      setExpandedRowId(pendingRowId);
    },

    onError: (err) => {
      console.error('Failed to fetch organization search data:', err.message);
    },
  });


  const loginClientBean = useSelector(selectLoginClientBean);
  const { isVisible } = useFeatureToggle();


  const callOrganizationSerachExpandAPI = (rowId: string, row: OrganizationResultDetail) => {
    setPendingRowId(rowId);

    executeOrganizationSearchExpandDataFetch({
      organizationResultDetailBean: row,
      loginBean: {
        officeId: loginClientBean?.officeId ?? '',
        schema: loginClientBean?.schema ?? '',
        company: loginClientBean?.company ?? '',
        userId: loginClientBean?.userId ?? '',
        siteId: loginClientBean?.siteId ?? '',
        DATE_FORMAT: loginClientBean?.officeSettingMap?.DATE_FORMAT?.[0] ?? '',
        INTERVAL1_TARGET: loginClientBean?.officeSettingMap?.INTERVAL1_TARGET?.[0] ?? '',
        INTERVAL1_TARGET_TYPE: loginClientBean?.officeSettingMap?.INTERVAL1_TARGET_TYPE?.[0] ?? '',
        INTERVAL2_TARGET: loginClientBean?.officeSettingMap?.INTERVAL2_TARGET?.[0] ?? '',
        INTERVAL2_TARGET_TYPE: loginClientBean?.officeSettingMap?.INTERVAL2_TARGET_TYPE?.[0] ?? '',
        INTERVAL3_TARGET: loginClientBean?.officeSettingMap?.INTERVAL3_TARGET?.[0] ?? '',
        INTERVAL3_TARGET_TYPE: loginClientBean?.officeSettingMap?.INTERVAL3_TARGET_TYPE?.[0] ?? '',
        INTERVAL4_TARGET: loginClientBean?.officeSettingMap?.INTERVAL4_TARGET?.[0] ?? '',
        INTERVAL4_TARGET_TYPE: loginClientBean?.officeSettingMap?.INTERVAL4_TARGET_TYPE?.[0] ?? '',
        INTERVAL5_TARGET: loginClientBean?.officeSettingMap?.INTERVAL5_TARGET?.[0] ?? '',
        INTERVAL5_TARGET_TYPE: loginClientBean?.officeSettingMap?.INTERVAL5_TARGET_TYPE?.[0] ?? '',
        INVOICE_DUE_DATE_WITH_END_MONTH_LOGIC: isVisible(CommonToggleKeys.INVOICE_DUE_DATE_WITH_END_MONTH_LOGIC),
        ORG_DASH_INVOICE_DTL_CAL_INVOICE_DUE_DATE_AGING: isVisible(CommonToggleKeys.ORG_DASH_INVOICE_DTL_CAL_INVOICE_DUE_DATE_AGING),
        USER_LOCALE_SEARCH: isVisible(CommonToggleKeys.USER_LOCALE_SEARCH),
        VENDOR_PROFILE_LOCALE: isVisible(CommonToggleKeys.VENDOR_PROFILE_LOCALE),
        TAX_ID_PROFILE_LOCALE: isVisible(CommonToggleKeys.TAX_ID_PROFILE_LOCALE),
        KINGDEE_RECORD_EXTRACTION: isVisible(CommonToggleKeys.KINGDEE_RECORD_EXTRACTION)
      }
    })
  }

  const handleToggleRow = (rowId: string, row: OrganizationResultDetail) => {
    if (expandedRowId === rowId) {
      setExpandedRowId(null);
      return;
    }
    callOrganizationSerachExpandAPI(rowId, row);
  };

  const allOrgCodes = useMemo(() => {
    const seen = new Set<string>();
    const codes: string[] = [];
    for (const row of rows) {
      
      const code = row.organizationResultDetail.organizationCode ?? "";
      if (code && !seen.has(code)) { seen.add(code); codes.push(code); }
    }
    return codes;
  }, [rows]);

  const allSalesReps = useMemo(() => {
    const seen = new Set<string>();
    const reps: string[] = [];
    for (const row of rows) {
      const rep = row.organizationResultDetail.salesRepresentative ?? "–";
      if (!seen.has(rep)) { seen.add(rep); reps.push(rep); }
    }
    return reps;
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      if (filters.inTransit && !row.organizationResultDetail.inTransitShipment) return false;
      if (filters.uninvoiced && !row.organizationResultDetail.uninvoicedShipment) return false;
      if (filters.onHold && !row.organizationResultDetail.onHoldStatus) return false;
      if (filters.selectedOrgCodes.length > 0 && !filters.selectedOrgCodes.includes(row.organizationResultDetail.organizationCode ?? "")) return false;
      if (filters.selectedSalesReps.length > 0 && !filters.selectedSalesReps.includes(row.organizationResultDetail.salesRepresentative ?? "–")) return false;
      return true;
    });
  }, [rows, filters]);

  const totalPages = Math.max(1, Math.ceil(Number(rowCount) / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredRows;

  const startPage = Math.max(1, Math.min(safePage - Math.floor(MAX_PAGE_BUTTONS / 2), totalPages - MAX_PAGE_BUTTONS + 1));
  const visiblePageCount = Math.min(MAX_PAGE_BUTTONS, totalPages);
  const visiblePages = Array.from({ length: visiblePageCount }, (_, i) => startPage + i);
  const hasMore = startPage + visiblePageCount - 1 < totalPages;

  const goToPage = (p: number) => {
    const newPage = Math.max(1, Math.min(totalPages, p));
    setPage(newPage);
    const lowerLimit = newPage === 1 ? 0 : (newPage - 1) * PAGE_SIZE + 1;
    const upperLimit = newPage * PAGE_SIZE;
    onPageChange?.(lowerLimit, upperLimit);
  };

  const handleCheckboxChange = (field: "inTransit" | "uninvoiced" | "onHold", value: boolean) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const toggleOrgCode = (code: string) => {
    setFilters(prev => {
      const already = prev.selectedOrgCodes.includes(code);
      return { ...prev, selectedOrgCodes: already ? prev.selectedOrgCodes.filter(c => c !== code) : [...prev.selectedOrgCodes, code] };
    });
    setPage(1);
  };

  const removeOrgCode = (code: string) => {
    setFilters(prev => ({ ...prev, selectedOrgCodes: prev.selectedOrgCodes.filter(c => c !== code) }));
    setPage(1);
  };

  const toggleSalesRep = (rep: string) => {
    setFilters(prev => {
      const already = prev.selectedSalesReps.includes(rep);
      return { ...prev, selectedSalesReps: already ? prev.selectedSalesReps.filter(r => r !== rep) : [...prev.selectedSalesReps, rep] };
    });
    setPage(1);
  };

  const removeSalesRep = (rep: string) => {
    setFilters(prev => ({ ...prev, selectedSalesReps: prev.selectedSalesReps.filter(r => r !== rep) }));
    setPage(1);
  };

  const hasActiveFilters =
    filters.inTransit || filters.uninvoiced || filters.onHold ||
    filters.selectedOrgCodes.length > 0 ||
    filters.selectedSalesReps.length > 0;

  const appliedFilterItems: Array<{ key: string; label: string; onRemove: () => void }> = [];
  if (filters.inTransit)
    appliedFilterItems.push({ key: "inTransit", label: "In Transit", onRemove: () => handleCheckboxChange("inTransit", false) });
  if (filters.uninvoiced)
    appliedFilterItems.push({ key: "uninvoiced", label: "Uninvoiced", onRemove: () => handleCheckboxChange("uninvoiced", false) });
  if (filters.onHold)
    appliedFilterItems.push({ key: "onHold", label: "On Hold", onRemove: () => handleCheckboxChange("onHold", false) });
  filters.selectedOrgCodes.forEach(code =>
    appliedFilterItems.push({ key: `org-${code}`, label: `Organization - ${code}`, onRemove: () => removeOrgCode(code) })
  );
  filters.selectedSalesReps.forEach(rep =>
    appliedFilterItems.push({ key: `salesrep-${rep}`, label: `Sales Representative - ${rep}`, onRemove: () => removeSalesRep(rep) })
  );

  const sectionHeaderClass = (section: SectionKey) =>
    `${styles.filterSectionHeader}${collapsedSections.has(section) ? ` ${styles.filterSectionHeaderCollapsed}` : ""}`;

  return (
    <Box className={styles.root}>
      <Box className={styles.contentFlex}>
        <Box className={styles.tableArea}>

          <Box className={styles.foundBar}>
            <Typography className={styles.foundText}>
              Found{" "}
              <Box component="span" className={styles.foundCount}>
                {rowCount}
              </Box>{" "}
              items
            </Typography>
            <Box className={styles.foundActions}>
              <Box onClick={() => setFilterPanelOpen(o => !o)} className={styles.filterIconBtn}>
                <img src={funnelImg} alt="filter" className={styles.funnelImg} />
              </Box>
              <Box onClick={() => setFilterPanelOpen(o => !o)} className={styles.filterToggleBtn}>
                {filterPanelOpen
                  ? <img src={chevronLeftImg} className={styles.chevronImg} />
                  : <img src={chevronRightImg} className={styles.chevronImg} />
                }
              </Box>
            </Box>
          </Box>

          <Box className={styles.tableHeader}>
            <Typography className={styles.tableHeaderTitle}>
              Organization ({rowCount })
            </Typography>
            <Box className={styles.paginationControls}>
              <IconButton size="small" disabled={safePage === 1} onClick={() => goToPage(1)} className={styles.navBtn}><ChevronFirstIcon /></IconButton>
              <IconButton size="small" disabled={safePage === 1} onClick={() => goToPage(safePage - 1)} className={styles.navBtn}><ChevronLeftIcon /></IconButton>
              {visiblePages.map(p => (
                <Box key={p} onClick={() => goToPage(p)} sx={{ minWidth: "17px", height: "17px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontFamily: "Arial, Helvetica, sans-serif", cursor: "pointer", color: p === safePage ? "#0095d4" : "white", backgroundColor: p === safePage ? "white" : "transparent", fontWeight: p === safePage ? "bold" : "normal", px: "3px", borderRadius: "1px", "&:hover": { backgroundColor: p === safePage ? "white" : "rgba(255,255,255,0.2)" } }}>
                  {p}
                </Box>
              ))}
              {hasMore && <Typography className={styles.ellipsisPage}>...</Typography>}
              <Select value={safePage} onChange={e => goToPage(Number(e.target.value))} size="small" sx={{ height: "18px", fontSize: "11px", color: "black", backgroundColor: "white", minWidth: "42px", ml: "3px", "& .MuiSelect-select": { padding: "0 18px 0 4px", fontSize: "11px", lineHeight: "18px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#999", borderWidth: "1px" }, "& .MuiSvgIcon-root": { fontSize: "14px", right: "2px" } }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <MenuItem key={p} value={p} sx={{ fontSize: "11px", minHeight: "auto", py: 0.2 }}>{p}</MenuItem>
                ))}
              </Select>
              <IconButton size="small" disabled={safePage === totalPages} onClick={() => goToPage(safePage + 1)} className={styles.navBtn}><ChevronRightIcon /></IconButton>
              <IconButton size="small" disabled={safePage === totalPages} onClick={() => goToPage(totalPages)} className={styles.navBtn}><ChevronLastIcon /></IconButton>
              <Box onClick={() => setCollapsed(c => !c)} className={styles.collapseBtn}>
                <img src={minusImg} alt="collapse" className={styles.collapseImg} />
              </Box>
            </Box>
          </Box>

          {!collapsed && (
            <Box>
              <Box className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <colgroup>
                    {Object.values(COL_WIDTHS).map((w, i) => <col key={i} style={{ width: `${w}px` }} />)}
                  </colgroup>
                  <thead>
                    <tr className={styles.theadRow}>
                      <th className={styles.th} />
                      <th className={styles.th}>Type</th>
                      <th className={styles.th}>Code</th>
                      <th className={styles.th}>Alias</th>
                      <th className={styles.th}>Name</th>
                      <th className={styles.th}>Address</th>
                      <th className={styles.th}>City</th>
                      <th className={styles.th}>State</th>
                      <th className={styles.th}>Country</th>
                      <th className={styles.th}>Phone Number</th>
                      <th className={styles.th}>Email</th>
                      <th className={styles.th} />
                      <th className={styles.thLastCol} />
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr><td colSpan={13} /></tr>
                    ) : (
                      pageRows.map(row => (
                        <React.Fragment key={row.id}>
                          <tr className={styles.dataRow}>
                            <td className={styles.td}>
                              <img
                                src={arrowRightImg}
                                alt="row"
                                className={styles.rowArrowImg}
                                onClick={() => handleToggleRow(String(row.id), row.organizationResultDetail)}
                                style={{
                                  cursor: "pointer",
                                  transform: expandedRowId === String(row.id) ? "rotate(90deg)" : "rotate(0deg)",
                                  transition: "transform 0.2s ease",
                                }}
                              />
                            </td>
                            <td className={styles.td}><CellTooltip header="Type" value={row.organizationResultDetail.organizationType ?? ""} /></td>
                            <td className={styles.td}><CellTooltip header="Code" value={row.organizationResultDetail.organizationCode ?? ""} /></td>
                            <td className={styles.td}><CellTooltip header="Alias" value={row.organizationResultDetail.organizationAliasCode ?? ""} /></td>
                            <td className={styles.td}><CellTooltip header="Name" value={row.organizationResultDetail.organizationName ?? ""} /></td>
                            <td className={styles.td}><CellTooltip header="Address" value={row.organizationResultDetail.organizationAddress ?? ""} /></td>
                            <td className={styles.td}><CellTooltip header="City" value={row.organizationResultDetail.city ?? ""} /></td>
                            <td className={styles.td}><CellTooltip header="State" value={row.organizationResultDetail.state ?? ""} /></td>
                            <td className={styles.td}><CellTooltip header="Country" value={row.organizationResultDetail.country ?? ""} /></td>
                            <td className={styles.td}><CellTooltip header="Phone Number" value={row.organizationResultDetail.phoneNumber ?? ""} /></td>
                            <td className={styles.td}><CellTooltip header="Email" value={row.organizationResultDetail.email ?? ""} /></td>
                            <td className={styles.td}><CellTooltip header="Region" value={row.organizationResultDetail.region ?? ""} /></td>
                            <td className={styles.tdLastCol}>
                              <Box onClick={() => onSelect?.(row)} className={styles.selectPlusBtn}>
                                <img src={plusImg} alt="select" className={styles.selectPlusImg} />
                              </Box>
                            </td>
                          </tr>
                          {expandedRowId === String(row.id) && organizationSearchExpandData?.result && (
                            <tr>
                              <td colSpan={13}>
                                <OrganizationExpand data={organizationSearchExpandData.result} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </Box>
            </Box>
          )}
        </Box>

        {filterPanelOpen && (
          <Box className={styles.filterPanel}>
            <Box className={styles.filterPanelFoundSpacer} />

            <Box className={sectionHeaderClass("shipment")} onClick={() => handleToggleSection("shipment")}>
              <span>Shipment</span>
            </Box>
            {!collapsedSections.has("shipment") && (
              <Box className={styles.filterSectionContent}>
                <FormControlLabel control={<Checkbox size="small" checked={filters.inTransit} onChange={e => handleCheckboxChange("inTransit", e.target.checked)} className={styles.checkbox} />} label="In Transit" className={styles.checkboxLabel} />
                <FormControlLabel control={<Checkbox size="small" checked={filters.uninvoiced} onChange={e => handleCheckboxChange("uninvoiced", e.target.checked)} className={styles.checkbox} />} label="Uninvoiced" className={styles.checkboxLabel} />
              </Box>
            )}

            <Box className={sectionHeaderClass("financial")} onClick={() => handleToggleSection("financial")}>
              <span>Financial</span>
            </Box>
            {!collapsedSections.has("financial") && (
              <Box className={styles.filterSectionContent}>
                <FormControlLabel control={<Checkbox size="small" checked={filters.onHold} onChange={e => handleCheckboxChange("onHold", e.target.checked)} className={styles.checkbox} />} label="On Hold" className={styles.checkboxLabel} />
              </Box>
            )}

            <Box className={sectionHeaderClass("organization")} onClick={() => handleToggleSection("organization")}>
              <span>Organization</span>
            </Box>
            {!collapsedSections.has("organization") && (
              <Box className={styles.filterSectionContentOrg}>
                {allOrgCodes.length === 0 ? (
                  <Typography className={styles.filterNoResults}>No results</Typography>
                ) : (
                  allOrgCodes.map(code => {
                    const isSelected = filters.selectedOrgCodes.includes(code);
                    return (
                      <Box key={code} onClick={() => toggleOrgCode(code)} sx={{ fontSize: "12px", fontFamily: "Arial, Helvetica, sans-serif", color: isSelected ? "#005a87" : "#0095d4", cursor: "pointer", py: "2px", fontWeight: isSelected ? "bold" : "normal", "&:hover": { textDecoration: "underline", color: "#005a87" } }}>
                        {code}
                      </Box>
                    );
                  })
                )}
              </Box>
            )}

            <Box className={sectionHeaderClass("salesRep")} onClick={() => handleToggleSection("salesRep")}>
              <span>Sales Representative</span>
            </Box>
            {!collapsedSections.has("salesRep") && (
              <Box className={styles.filterSectionContentSalesRep}>
                {allSalesReps.length === 0 ? (
                  <Typography className={styles.filterNoResults}>No results</Typography>
                ) : (
                  allSalesReps.map(rep => {
                    const isSelected = filters.selectedSalesReps.includes(rep);
                    return (
                      <Box key={rep} className={styles.salesRepRow}>
                        <Box onClick={() => toggleSalesRep(rep)} className={styles.salesRepMinus}>
                          −
                        </Box>
                        {rep !== "–" && (
                          <Typography sx={{ fontSize: "12px", fontFamily: "Arial, Helvetica, sans-serif", color: isSelected ? "#005a87" : "#333", fontWeight: isSelected ? "bold" : "normal", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {rep}
                          </Typography>
                        )}
                      </Box>
                    );
                  })
                )}
              </Box>
            )}

            <Box className={styles.appliedFilterHeader}>
              <span>Applied Filter</span>
            </Box>
            <Box className={styles.appliedFilterList}>
              {appliedFilterItems.length === 0 ? (
                <Typography className={styles.appliedFilterEmpty} />
              ) : (
                appliedFilterItems.map(item => (
                  <Box key={item.key} className={styles.appliedFilterItem}>
                    <Typography className={styles.appliedFilterLabel}>
                      {item.label}
                    </Typography>
                    <Box onClick={item.onRemove} className={styles.appliedFilterRemove}>
                      −
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
