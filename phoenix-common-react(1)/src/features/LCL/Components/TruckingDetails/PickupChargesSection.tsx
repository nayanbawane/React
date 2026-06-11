import React from 'react';
import { Box, InputAdornment } from '@mui/material';
import { PTextField, PGradientButton } from 'phoenix-react-lib';
import Loader from '../Loader/Loader';
import styles from '../../../../styles/LCL/TruckingDetails.module.css';
import type { FetchTmsButtonState, PickupCharge } from '../../../../types/LCL/misc/TruckingDetails.types';

interface PickupChargesSectionProps {
    charges: PickupCharge[];
    onModifyTmsBooking?: () => void;
    moduleType?: string;
    fetchTmsButtonState?: FetchTmsButtonState;
    onChargeChange?: (index: number, field: keyof PickupCharge, value: string | number) => void;
    onAddCharge?: () => void;
    onRemoveCharge?: (index: number) => void;
    showTransmitToTrk?: boolean;
    onTransmitToTrk?: () => void;
}

const DEFAULT_BUTTON_STATE: FetchTmsButtonState = {
    show: true,
    disabled: false,
    loading: false,
    label: 'Fetch Quote from TMS',
};

const fmt = (val: number) => val.toFixed(2);

const COL_WIDTHS = { amt: '45%' };

const ROW_SX = { display: 'flex', width: '100%' };

const TRANSMIT_BTN_SX = { height: '25px', borderRadius: '4px', fontSize: '13px', minWidth: '140px' };

const PF_SX = {
    '& .MuiOutlinedInput-root': {
        height: '22px',
        fontSize: '12px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        borderRadius: 0,
        backgroundColor: '#f5f5f5',
        '& fieldset': { borderColor: '#bdbdbd', borderRadius: 0 },
    },
    '& .MuiOutlinedInput-input': {
        padding: '0 4px',
        fontSize: '12px',
        color: '#555555',
        textAlign: 'right' as const,
    },
};

const PF_DESC_SX = {
    ...PF_SX,
    '& .MuiOutlinedInput-input': {
        ...PF_SX['& .MuiOutlinedInput-input'],
        textAlign: 'left' as const,
    },
};

const currencySlotProps = (currency: string) => ({
    input: {
        readOnly: true,
        startAdornment: (
            <InputAdornment position="start" sx={{ mr: 0 }}>
                <span style={{ fontSize: '12px', color: '#555555', fontFamily: 'Arial, Helvetica, sans-serif', whiteSpace: 'nowrap' }}>
                    {currency}
                </span>
            </InputAdornment>
        ),
    },
    htmlInput: { readOnly: true },
});

const DESC_SLOT_PROPS = { htmlInput: { readOnly: true } };


const PickupChargesSection: React.FC<PickupChargesSectionProps> = ({ charges, onModifyTmsBooking, moduleType, fetchTmsButtonState, showTransmitToTrk, onTransmitToTrk }) => {
    const btnState = fetchTmsButtonState ?? DEFAULT_BUTTON_STATE;
    const buyTotal = charges.reduce((sum, c) => sum + c.expense, 0);
    const sellTotal = charges.reduce((sum, c) => sum + c.income, 0);
    const profitLoss = sellTotal - buyTotal;
    const chargeCurrency = charges.find(c => c.id !== -1)?.expenseCurrency || 'USD';

    const rows = charges.length > 0
        ? charges
        : [{ id: -1, chargeDescription: '', expenseCurrency: 'USD', expense: 0, incomeCurrency: 'USD', income: 0 }];

    return (
        <Box className={styles.container}>
            <Box className={styles.sectionTitle}>Pickup Charges:</Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                    {rows.map((charge, index) => (
                        <Box key={charge.id} sx={ROW_SX}>
                            <Box sx={{ width: COL_WIDTHS.amt }} className={styles.td}>
                                <PTextField
                                    fullWidth
                                    label={index === 0 ? "Charge Description" : undefined}
                                    value={charge.chargeDescription}
                                    sx={PF_DESC_SX}
                                    slotProps={DESC_SLOT_PROPS}
                                />
                            </Box>
                            <Box sx={{ width: COL_WIDTHS.amt }} className={styles.td}>
                                <PTextField
                                    fullWidth
                                    label={index === 0 ? "Expense" : undefined}
                                    value={charge.id === -1 ? '' : fmt(charge.expense)}
                                    sx={PF_SX}
                                    slotProps={currencySlotProps(charge.expenseCurrency)}
                                />
                            </Box>
                            <Box sx={{ width: COL_WIDTHS.amt }} className={styles.td}>
                                <PTextField
                                    fullWidth
                                    label={index === 0 ? "Income" : undefined}
                                    value={charge.id === -1 ? '' : fmt(charge.income)}
                                    sx={PF_SX}
                                    slotProps={currencySlotProps(charge.incomeCurrency)}
                                />
                            </Box>
                        </Box>
                    ))}
                </Box>

                {btnState.show && (
                    <Box sx={{ pl: '12px', alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '8px', mt: '1rem' }}>
                        {moduleType != "prebooking" && (
                            btnState.loading
                                ? (
                                    <Box sx={{ minWidth: '160px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <Loader />
                                    </Box>
                                )
                                : (
                                    <PGradientButton
                                        title={btnState.label}
                                        onClick={onModifyTmsBooking}
                                        disabled={btnState.disabled}
                                        sx={{ height: '25px', borderRadius: '4px', fontSize: '13px', minWidth: '160px' }}
                                    />
                                )
                        )}
                        <PGradientButton
                            title="Transmit to TRK"
                            onClick={onTransmitToTrk}
                            disabled={!onTransmitToTrk}
                            sx={{ ...TRANSMIT_BTN_SX, visibility: showTransmitToTrk ? 'visible' : 'hidden' }}
                        />
                    </Box>
                )}
            </Box>

            <Box className={styles.footer}>
                <Box className={styles.footerCell}>
                    <span className={styles.footerLabel}>Buy Total</span>
                    <Box className={styles.footerAmountRow}>
                        <span className={styles.footerCurrency}>{chargeCurrency}</span>
                        <span className={styles.footerValue}>{fmt(buyTotal)}</span>
                    </Box>
                </Box>
                <Box className={`${styles.footerCell} ${styles.footerCellBordered}`}>
                    <span className={styles.footerLabel}>Sell Total</span>
                    <Box className={styles.footerAmountRow}>
                        <span className={styles.footerCurrency}>{chargeCurrency}</span>
                        <span className={styles.footerValue}>{fmt(sellTotal)}</span>
                    </Box>
                </Box>
                <Box className={`${styles.footerCell} ${styles.footerCellBordered}`}>
                    <span className={styles.footerLabel}>Profit/Loss</span>
                    <Box className={styles.footerAmountRow}>
                        <span className={styles.footerCurrency}>{chargeCurrency}</span>
                        <span className={styles.footerValue}>{fmt(profitLoss)}</span>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default PickupChargesSection;
