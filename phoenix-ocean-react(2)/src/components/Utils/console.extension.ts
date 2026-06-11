declare global {
    interface Console {
        devAPILog(key: string, value?: unknown, error?: boolean): void;
    }
}

console.devAPILog = function (
    key: string,
    value: unknown,
    error: boolean = false
) {
    if (true) {
        console.log( //don't change this console.log.
            `%c${key}%c : `,
            `background-color: ${error ? 'red' : 'green'}; color: black; font-weight: bold;`,
            "color: inherit;",
            value || ''
        );
    }
};

export const devAPIlog = (key: string, value?: unknown, error?: boolean) =>
    console.devAPILog(key, value, error);
