import { ContainerDataBean, ContainerTypeList } from 'phoenix-common-react';

export interface TeuCalculator {
  getContainerData: () => ContainerTypeList[];
  setTotalTeu: (totalTeu: number) => void;
  // reCalculateAmountAndRecalculateAllCharges: () => void;
}

export const calculateTEU = (
  moduleCode: string,
  teuCalculator: TeuCalculator,
  containerDataBeanMap: ContainerDataBean[]
): void => {
  const containerDataList = teuCalculator.getContainerData();
  let totalTeu = 0;
  let teu = 0;
  containerDataList.forEach((containerDataBean, index) => {
    const key = containerDataBean.containerMapKey as string;
    if (key && (key !== '-1' && key !== '')) {
       const bean = containerDataBeanMap.find(
      (item) =>
        `${item.containerSize}-${item.containerType}` === key
    );
      if (!bean) return;
      teu = Number(bean.teu || 0);
      if (moduleCode === 'BKG') {
        const noOfContainer =
          Number(containerDataBean.numberOfContainer || 0);
        totalTeu += noOfContainer * teu;
      } else {
        totalTeu += teu;
      }
    }
  });
  teuCalculator.setTotalTeu(totalTeu);
  // teuCalculator.reCalculateAmountAndRecalculateAllCharges();
};