export const validateLatitude = (value: string): string => {
    if (!value.trim()) return '';
    const num = parseFloat(value);
    if (isNaN(num) || num < -90 || num > 90) {
        return 'Latitude must be between -90 and 90.';
    }
    return '';
};

export const validateLongitude = (value: string): string => {
    if (!value.trim()) return '';
    const num = parseFloat(value);
    if (isNaN(num) || num < -180 || num > 180) {
        return 'Longitude must be between -180 and 180.';
    }
    return '';
};
