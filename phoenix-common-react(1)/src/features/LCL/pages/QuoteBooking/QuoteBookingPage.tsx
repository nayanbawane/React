import React, { useState } from 'react';
import { Accordion } from 'phoenix-react-lib';
import DocumentDetails from '../DocumentDetails/DocumentDetails';
import CustomerDetails from '@/shared/components/customerDetails/CustomerDetails';
import LCLRoutingPage from '@/shared/components/RoutingComponent/LCLRoutingPage';
import CargoDetails from '@/features/CargoDetails/CargoDetails';
import RateDetails from '../../Components/RateDetails/RateDetails';
import {
  FileText,
  Files,
  Save,
  XCircle,
  Maximize,
  FileCheck,
  Video,

  BookOpen
} from 'lucide-react';
import './QuoteBookingPage.css';
import { QuoteMainDetails } from '../../Components/QuoteMainDetails/MainDetails';
import { LocationInformation } from '../../Components/locationInfo/LocationInformation';

import { useAppSelector } from '../../../../app/store/hooks';
import { RootState } from '../../../../app/store/store';
import { ActionBar, ActionItem } from './components/ActionBar/ActionBar';


/* ─── Main QuoteBooking Page ─── */
const QuoteBookingPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const formState = useAppSelector((state: RootState) => state.quoteBooking);
  
  const handleSave = () => {
    alert('Form data logged to console as JSON.');
  };

  const accordionItems: any = [
    {
      id: "stack1",
      label: "Main Details",
      content: <QuoteMainDetails formData={formState.mainDetails} />,
      progress: true,
      icon: false,
      progressValue: 60
    },
    {
      id: "stack2",
      label: "Document Details",
      content: <DocumentDetails />,
      progress: true,
      icon: true,
      progressValue: 100
    },
    {
      id: "stack3",
      label: "Customer Details",
      content: <CustomerDetails />,
      progress: true,
      icon: false,
      progressValue: 0,
    }, {
      id: "stack4",
      label: "Routing Details",
      content: <LCLRoutingPage />,
      progress: true,
      icon: false,
      progressValue: 0,
    }, {
      id: "stack5",
      label: "Cargo Details",
      content: <CargoDetails />,
      progress: true,
      icon: false,
      progressValue: 100,
    }, {
      id: "stack6",
      label: "Rate Details",
      content: <RateDetails moduleType='BKG' />,
      progress: true,
      icon: true,
      progressValue: 100,
    }, {
      id: "stack7",
      label: "Location Information",
      content: <LocationInformation />,
      progress: true,
      icon: false,
      progressValue: 100,
    }
  ];

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const openAll = () => {
    setOpenItems(accordionItems.map((item: any) => item.id));
  };


  const clearAll = () => {
    setOpenItems([]);
  };

  const closeAll = () => {
    setOpenItems([]);
  };

  const handleSelectAction = (label: string) => {
    alert(`Action selected: ${label}`);
  };

  const leftActions: ActionItem[] = [
    { id: 'notes', label: 'Notes', icon: <FileText size={14} />, onClick: () => console.warn('Notes clicked') },
    { id: 'docs', label: 'Documents', icon: <Files size={14} />, onClick: () => console.warn('Documents clicked') },
  ];

  const rightActionGroups: ActionItem[][] = [
    [
      { id: 'video', icon: <Video size={14} color="white" />, type: 'icon', onClick: () => console.warn('Video clicked') },
      { id: 'book', icon: <BookOpen size={14} color="white" />, type: 'icon', onClick: () => console.warn('Book clicked') },
    ],
    [
      { id: 'openAll', label: 'Open All', icon: <Maximize size={14} />, type: 'button', onClick: openAll },
      { id: 'closeAll', label: 'Close All', icon: <XCircle size={14} />, type: 'button', onClick: closeAll },
      { id: 'clearAll', label: 'Clear All', icon: <XCircle size={14} />, type: 'button', onClick: clearAll },
      { id: 'preview', label: 'Preview', type: 'button', onClick: () => console.warn('Preview clicked') },
    ],
    [
      { id: 'save', label: 'Save', icon: <Save size={14} />, type: 'blue', onClick: handleSave },
      { id: 'edocs', label: 'eDocs', icon: <FileCheck size={14} />, type: 'blue', onClick: () => console.warn('eDocs clicked') },
    ],
  ];

  const selectActions = [
    { label: 'Option 1', onClick: handleSelectAction },
    { label: 'Option 2', onClick: handleSelectAction },
    { label: 'Option 3', onClick: handleSelectAction },
  ];




  const accordionProps: any = {
    accordionData: accordionItems,
    openItems: openItems,
    toggleItem: toggleItem,
  };

  return (
    <div className="quote-booking">
      {/* ─── Action Bar ─── */}
      <ActionBar
        leftActions={leftActions}
        rightActionGroups={rightActionGroups}
        selectActions={selectActions}
      />


      <div className="qb-accordion-container">
        {/*@ts-ignore*/}
        <Accordion {...accordionProps} />
      </div>
    </div>
  );
};

export default QuoteBookingPage;
