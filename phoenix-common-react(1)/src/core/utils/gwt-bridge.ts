/**
 * This class serves as a bridge to access the GWT module from JavaScript. 
 * It provides a static method to retrieve the GWT module instance, allowing JavaScript code to interact with the GWT module seamlessly.
 */
class GwtBridge {

    userJsonData: any = null;
    schemaName: any = null;

    public passPhoenixConfigurationDataToAngular() {
        if (typeof window.parent.passPhoenixConfigurationDataToAngular === 'function') {
            const data = window.parent.passPhoenixConfigurationDataToAngular();
            this.userJsonData = JSON.parse(data);
            this.schemaName = this.userJsonData.schema;
            return this.userJsonData;
        }else{
            console.warn("passPhoenixConfigurationDataToAngular function is not defined on the window object.");
            return null;
        }
    }

     public passPhoenixConfigurationDataToUrlConstant() {
        if (typeof window.parent.passPhoenixConfigurationDataToReactForUrlConstant === 'function') {
            const data = window.parent.passPhoenixConfigurationDataToReactForUrlConstant();
            this.userJsonData = JSON.parse(data);
            this.schemaName = this.userJsonData.schema;
            return this.userJsonData;
        }else{
            console.warn("passPhoenixConfigurationDataToReactForUrlConstant function is not defined on the window object.");
            return null;
        }
    }

    public passPhoenixConfigurationDataToReactForPreBooking() {
        const fn = (window.parent as any).passPhoenixConfigurationDataToReactForPreBooking;
        if (typeof fn === 'function') {
            try {
                const data = fn();
                return typeof data === 'string' ? JSON.parse(data) : data;
            } catch (e) {
                console.warn("passPhoenixConfigurationDataToReactForPreBooking failed to parse response.", e);
                return null;
            }
        } else {
            console.warn("passPhoenixConfigurationDataToReactForPreBooking function is not defined on the window object.");
            return null;
        }
    }

    public passPhoenixConfigurationDataToReactForQuoteLCL() {
        const fn = (window.parent as any).passPhoenixConfigurationDataToReactForQuoteLCL;
        if (typeof fn === 'function') {
            try {
                const data = fn();
                return typeof data === 'string' ? JSON.parse(data) : data;
            } catch (e) {
                console.warn("passPhoenixConfigurationDataToReactForQuoteLCL failed to parse response.", e);
                return null;
            }
        } else {
            console.warn("passPhoenixConfigurationDataToReactForQuoteLCL function is not defined on the window object.");
            return null;
        }
    }

    public passPhoenixConfigurationDataToReactForBookingLCL() {
        const fn = (window.parent as any).passPhoenixConfigurationDataToReactForBookingLCL;
        if (typeof fn === 'function') {
            try {
                const data = fn();
                return typeof data === 'string' ? JSON.parse(data) : data;
            } catch (e) {
                console.warn("passPhoenixConfigurationDataToReactForBookingLCL failed to parse response.", e);
                return null;
            }
        } else {
            console.warn("passPhoenixConfigurationDataToReactForBookingLCL function is not defined on the window object.");
            return null;
        }
    }

    getPhoenixConfigurationData() {
        if (!this.userJsonData) {
            return this.passPhoenixConfigurationDataToAngular();
        }
        return this.userJsonData;
    }

    gwtActionFromReact(action: string, data: any): void {
        if (typeof (window.parent as any)?.gwtActionFromReact === 'function') {
            (window.parent as any).gwtActionFromReact(action, JSON.stringify(data));
        }
    }
}

const gwtBridgeInstance = new GwtBridge();
export default gwtBridgeInstance;
