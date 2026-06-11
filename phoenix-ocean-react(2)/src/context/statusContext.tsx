import { createContext, useContext, useState, useRef, useEffect, type RefObject } from 'react';
import { PStatusBar } from 'phoenix-react-lib';

type StatusType = 'info' | 'warning' | 'error' | 'success';

interface StatusContextType {
  showStatus: (type: StatusType, messages: string[]) => void;
  hideStatus: (id?: number) => void;
}
interface StatusConfig {
  id: number;
  type: StatusType;
  messages: string[];
}
const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider = ({ children }: { children: any }) => {
  // const [config, setConfig] = useState<{
  //   type: StatusType;
  //   messages: string[];
  //   isVisible: boolean;
  // }>({
  //   type: 'info',
  //   messages: [],
  //   isVisible: false,
  // });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [statusList, setStatusList] = useState<StatusConfig[]>([]);
  const idRef = useRef(0);
  const timeoutRefs = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  // const hideStatus = () => {
  //   setConfig((prev) => ({ ...prev, isVisible: false }));

  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current);
  //     timeoutRef.current = null;
  //   }
  // };
  const hideStatus = (id?: number) => {
    if (id !== undefined) {
      setStatusList((prev) => prev.filter((s) => s.id !== id));
      if (timeoutRefs.current[id]) {
        clearTimeout(timeoutRefs.current[id]);
        delete timeoutRefs.current[id];
      }
    } else {
      setStatusList([]);
      Object.values(timeoutRefs.current).forEach(clearTimeout);
      timeoutRefs.current = {};
    }
  };

  const showStatus = (type: StatusType, messages: string[]) => {
    // if (timeoutRef.current) {
    //   clearTimeout(timeoutRef.current);
    //   timeoutRef.current = null;
    // }

    // setConfig({ type, messages, isVisible: true });
    // const showStatus = (type: StatusType, messages: string[]) => {
    const id = idRef.current++;

    // keeping your same field names: type, messages, isVisible
    setStatusList((prev) => [
      ...prev,
      { id, type, messages },
    ]);

    if (
      type === 'success' ||
      type === 'info' ||
      type === 'warning' ||
      type === 'error'
    ) {
      // timeoutRef.current = setTimeout(() => {
      //   hideStatus();
      // }, 5000);
      timeoutRefs.current[id] = setTimeout(() => {
        hideStatus(id);
      }, 5000);
    }
  };

  requestAnimationFrame(() => {
    barRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  useEffect(() => {
    // return () => {
    //   if (timeoutRef.current) {
    //     clearTimeout(timeoutRef.current);
    //   }
    // };
    return () => {
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <StatusContext.Provider value={{ showStatus, hideStatus }}>
      <div ref={barRef} style={{ position: 'sticky', top: 0, zIndex: 1300 }}>
        {statusList.map((status) => (
          <PStatusBar
            // type={config.type}
            // messages={config.messages}
            // isVisible={config.isVisible}
            // onClose={hideStatus}
            type={status.type}
            messages={status.messages}
            onClose={() => hideStatus(status.id)}
          />
        ))}
      </div>
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = () => {
  const context = useContext(StatusContext);
  if (!context) throw new Error('useStatus must be used within StatusProvider');
  return context;
};
