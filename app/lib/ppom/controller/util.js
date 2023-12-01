/* eslint-disable */

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHexPrefix = exports.constructURLHref = exports.validateSignature = exports.PROVIDER_ERRORS = exports.createPayload = exports.IdGenerator = void 0;
const elliptic_1 = __importDefault(require("elliptic"));
const json_rpc_random_id_1 = __importDefault(require("json-rpc-random-id"));
const EdDSA = elliptic_1.default.eddsa;
const URL_PREFIX = 'https://';
exports.IdGenerator = (0, json_rpc_random_id_1.default)();
const createPayload = (method, params) => ({
    id: (0, exports.IdGenerator)(),
    jsonrpc: '2.0',
    method,
    params: params || [],
});
exports.createPayload = createPayload;
exports.PROVIDER_ERRORS = {
    limitExceeded: () => ({
        jsonrpc: '2.0',
        id: (0, exports.IdGenerator)(),
        error: {
            code: -32005,
            message: 'Limit exceeded',
        },
    }),
    methodNotSupported: () => ({
        jsonrpc: '2.0',
        id: (0, exports.IdGenerator)(),
        error: {
            code: -32601,
            message: 'Method not supported',
        },
    }),
};
const validateSignature = async (data, signature, key, filePath) => {
    const ec = new EdDSA('ed25519');
    const ecKey = ec.keyFromPublic(key);
    // eslint-disable-next-line no-restricted-globals
    const result = ecKey.verify(Buffer.from(data), signature);
    if (!result) {
        throw Error(`Signature verification failed for file path: ${filePath}`);
    }
};
exports.validateSignature = validateSignature;
const constructURLHref = (base, path) => new URL(`${URL_PREFIX}${base}/${path}`
    .replace(/https:\/\/https:\/\//gu, 'https://')
    .replace(/\/\//gu, '/')).href;
exports.constructURLHref = constructURLHref;
const addHexPrefix = (str) => {
    if (typeof str !== 'string' || str.match(/^-?0x/u)) {
        return str;
    }
    if (str.match(/^-?0X/u)) {
        return str.replace('0X', '0x');
    }
    return `0x${str}`;
};
exports.addHexPrefix = addHexPrefix;
//# sourceMappingURL=util.js.map