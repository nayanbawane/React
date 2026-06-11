import { PGradientButton } from 'phoenix-react-lib';
import styles from '../../../../styles/LCL/ToolBar.module.css';
import { useAppSelector } from '@/app/store/hooks';
import { GwtBridge } from 'phoenix-common-react';

const handleVersion = ({
    gwtVersionParameters,
    tabId,
}: {
    gwtVersionParameters: any;
    tabId: string;
}) => {

    const openVersionPopUpParams: any = {};

    openVersionPopUpParams.bean =
        JSON.stringify(gwtVersionParameters);
    openVersionPopUpParams.tabId = tabId;

    GwtBridge.gwtActionFromReact(
        'OPEN_BKGESERVICE_VERSION_POPUP',
        openVersionPopUpParams
    );
};

function VersionButton({
    showVersionButton = false,
    tabId,
}: {
    showVersionButton: boolean;
    tabId?: string;
}) {

    const gwtVersionParameters = useAppSelector(
        state => state.versionbutton?.versionPopupParameters
    );

    if (!showVersionButton) {
        return null;
    }

    return (
        <PGradientButton
            title="Version"
            className={`
                ${styles.toolbarButton}
                ${styles.versionButton}
                ${
                    showVersionButton
                        ? styles.showButton
                        : styles.hideButton
                }
            `}
            onClick={() =>
                handleVersion({ gwtVersionParameters, tabId: tabId ?? '' })
            }
        />
    );
}

export default VersionButton;