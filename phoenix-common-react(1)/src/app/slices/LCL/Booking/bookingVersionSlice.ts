import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type ProcessVersioningPayload = {
    doDisplayVersionButton: boolean;
    versionPopupParameters: any;
};

export interface StateTypes {
    doDisplayVersionButton: boolean;
    versionPopupParameters: any;
}

const initialVersionState: StateTypes = {
    doDisplayVersionButton: false,
    versionPopupParameters: {},
};

const bookingVersionSlice = createSlice({
    name: "versionbutton",
    initialState: initialVersionState,
    reducers: {
        processVersioning: (
            state,
            action: PayloadAction<ProcessVersioningPayload>
        ) => {
            state.doDisplayVersionButton =
                action.payload.doDisplayVersionButton;

            state.versionPopupParameters =
                action.payload.versionPopupParameters;
        }
    }
});

export const {
    processVersioning
} = bookingVersionSlice.actions;

export default bookingVersionSlice.reducer;