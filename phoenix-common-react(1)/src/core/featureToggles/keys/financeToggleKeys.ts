export const FinanceToggleKeys = {
  PHX_COMMON_VAT_UTIL_FIN: 'PHX_COMMON_VAT_UTIL_FIN',
  ENABLE_PAYMENT_PROPOSAL_APPROVAL_GROUP: 'ENABLE_PAYMENT_PROPOSAL_APPROVAL_GROUP',
} as const;

export type FinanceToggleKey = typeof FinanceToggleKeys[keyof typeof FinanceToggleKeys];
