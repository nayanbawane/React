import { useMemo, useState } from 'react';
interface ProgressConfig {
  currentValue: number;
  fieldPriority: number;
}

interface StackState {
  progressConfig: ProgressConfig;
  fieldFilledMap: Record<string, boolean>;
}

const isFieldFilled = (value: any) =>
  value !== undefined && value !== null && value !== '';

const calcProgress = (filledCount: number, fieldPriority: number): number =>
  Math.min(100, (filledCount * fieldPriority) | 0);

const getValueByPath = (obj: any, path: string) =>
  path.split('.').reduce((acc: any, key: string) => acc?.[key], obj);

export const useStackProgressBar = () => {
  const [stackStateMap, setStackStateMap] = useState<
    Record<string, StackState>
  >({});

  const registerFields = (stackId: string, fields: string[]) => {
    if (fields.length === 0) {
      setStackStateMap((prev) => ({
        ...prev,
        [stackId]: {
          progressConfig: { currentValue: 0, fieldPriority: 0 },
          fieldFilledMap: {},
        },
      }));
      return;
    }
    setStackStateMap((prev) => {
      const existingFilled = prev[stackId]?.fieldFilledMap ?? {};
      const newFieldFilledMap = Object.fromEntries(
        fields.map((f) => [f, existingFilled[f] ?? false])
      );
      const fieldPriority = 100 / fields.length;
      const filledCount =
        Object.values(newFieldFilledMap).filter(Boolean).length;
      return {
        ...prev,
        [stackId]: {
          progressConfig: {
            currentValue: calcProgress(filledCount, fieldPriority),
            fieldPriority,
          },
          fieldFilledMap: newFieldFilledMap,
        },
      };
    });
  };

  const handleFieldsChange = (stackId: string, formData: any) => {
    const fields = Object.keys(stackStateMap[stackId]?.fieldFilledMap ?? {});
    if (!fields.length) return;
    fields.forEach((fieldPath) => {
      const value = getValueByPath(formData, fieldPath);
      handleFieldChange(stackId, isFieldFilled(value), fieldPath);
    });
  };

  const handleFieldChange = (
    stackId: string,
    value: boolean,
    field: string
  ) => {
    setStackStateMap((prev) => {
      const stack = prev[stackId];
      if (!stack) return prev;
      if (!(field in stack.fieldFilledMap)) return prev;
      if (stack.fieldFilledMap[field] === value) return prev;
      const newFieldFilledMap = { ...stack.fieldFilledMap, [field]: value };
      const filledCount =
        Object.values(newFieldFilledMap).filter(Boolean).length;
      return {
        ...prev,
        [stackId]: {
          progressConfig: {
            fieldPriority: stack.progressConfig.fieldPriority,
            currentValue: calcProgress(
              filledCount,
              stack.progressConfig.fieldPriority
            ),
          },
          fieldFilledMap: newFieldFilledMap,
        },
      };
    });
  };
  const progressOf = (stackId: string) =>
    stackStateMap[stackId]?.progressConfig.currentValue ?? 0;

  const screenProgress:number = useMemo(() => {
    const stacks = Object.values(stackStateMap);
    if (stacks.length === 0) return 0;
    const total = stacks.reduce(
      (sum, s) => sum + s.progressConfig.currentValue,
      0
    );
    return (total / stacks.length) | 0;
  }, [stackStateMap]);

  return { registerFields, handleFieldsChange, progressOf, screenProgress };
};
