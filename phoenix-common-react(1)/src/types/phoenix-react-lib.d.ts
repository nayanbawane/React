import { checkDateValidation } from './../../../phoenix-ocean-react/src/types/phoenix-react-lib.d';
import React from "react";

export interface PConfirmationModalAction {
  label: string;
  onClick: () => void;
}
export interface PConfirmationModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  message: string | React.ReactNode;
  primaryAction?: PConfirmationModalAction;
  secondaryAction?: PConfirmationModalAction;
  width?: number | string;
  sx?: SxProps<Theme>;
  buttonAlign?: ButtonAlignmentType;
  variant?: PConfirmationModalVariant;
}
declare module 'phoenix-react-lib' {
  import type { ComponentType, ReactNode } from 'react';

  export type AccordionItem = any;
  export type AccordionProps = any;

  export const Accordion: ComponentType<any>;
  export const PAccordion: ComponentType<any>;
  export const PButton: ComponentType<any>;
  export const PCard: ComponentType<any>;
  export const PDatePicker: ComponentType<any>;
  export const PGradientButton: ComponentType<any>;
  export const PIconButton: ComponentType<any>;
  export const PInputField: ComponentType<any>;
  export const PModal: ComponentType<any>;
  export const PMultiValueSearchableField: ComponentType<any>;
  export const PNumberInputField: ComponentType<any>;
  export const PSingleValueSearchableField: ComponentType<any>;
  export const PMapCoordinatePicker: ComponentType<any>;
  export const PStatusBar: ComponentType<any>;
  export const PTab: ComponentType<any>;
  export const PToggleButton: ComponentType<any>;
  export const PTooltip: ComponentType<any>;
  export const PUploadDocuments: ComponentType<any>;
  export const PSelect: ComponentType<any>;
  export const PTextField: ComponentType<any>;
  export const PStatusSelect: ComponentType<any>;
  export const PConfirmationModal: React.FC<PConfirmationModalProps>;
  export const PRippleButton: ComponentType<any>;
  export const ProgressBar: ComponentType<any>;

  export type PModalProps = {
    children?: ReactNode;
    [key: string]: any;
  };

  export type PSingleValueSearchableFieldPropsTypes = Record<string, any>;
  export type PMultiValueSearchablePropsTypes = Record<string, any>;
  export type PToggleButtonProps = Record<string, any>;
  export type PNumberInputFieldProps = Record<string, any>;

  export const AutoTextarea: ComponentType<any>;
  export const PNumberField: ComponentType<any>;
  export const TagifyBox: ComponentType<any>;
  export const PStatusSelect: ComponentType<any>;
  export const checkDateValidation: any

}
