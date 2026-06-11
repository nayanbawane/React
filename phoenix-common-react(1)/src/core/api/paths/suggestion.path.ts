export const suggestionBoxPaths = {
  GET_SUGGESTION_DATA:
    '/phoenix/api-common/1.0/suggestionbox/common/getSuggestData',
  GET_SELECTION_DATA:
    '/phoenix/api-common/1.0/selectionbox/common/getSelectionData',
  GET_MULTI_PANEL_SUGGEST_DATA:
    '/phoenix/api-common/1.0/suggestionbox/common/getMultiPanelSuggestData',
  GET_LISTBOX_DATA:
    '/phoenix/api-common/1.0/commonlistbox/common/getCommonListBoxData',
  GET_GEN_BASIS_DATA: '/phoenix/api-common/1.0/genBasis/displayGenBasisData',
  GET_SUGGESTION_DATA_FROM_API: '/phoenix/api-common/1.0/suggestionbox/common/getSuggestDataFromApi'
} as const;
