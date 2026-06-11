export type LocationSearchView = 'search' | 'results';

export interface LocationSearchFormValues {
  code: string;
  name: string;
  country: string;
  unCode: string;
  locationType: string;
  status: string;
  exportRegion: string;
  importRegion: string;
  lclAgent: string;
  fclAgent: string;
  deconsolidationPoint: string;
}
