export declare const IdGenerator: () => number;
export declare const createPayload: (method: string, params: Record<string, unknown>) => {
    id: number;
    jsonrpc: string;
    method: string;
    params: Record<string, unknown>;
};
export declare const PROVIDER_ERRORS: {
    limitExceeded: () => {
        jsonrpc: string;
        id: number;
        error: {
            code: number;
            message: string;
        };
    };
    methodNotSupported: () => {
        jsonrpc: string;
        id: number;
        error: {
            code: number;
            message: string;
        };
    };
};
export declare const validateSignature: (data: any, signature: string, key: string, filePath: string) => Promise<void>;
export declare const constructURLHref: (base: string, path: string) => string;
export declare const addHexPrefix: (str: string) => string;
