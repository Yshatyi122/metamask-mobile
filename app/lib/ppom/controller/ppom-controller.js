"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PPOMController_instances, _PPOMController_ppom, _PPOMController_ppomInitError, _PPOMController_provider, _PPOMController_storage, _PPOMController_refreshDataInterval, _PPOMController_fileScheduleInterval, _PPOMController_ppomMutex, _PPOMController_ppomProvider, _PPOMController_cdnBaseUrl, _PPOMController_providerRequestLimit, _PPOMController_providerRequests, _PPOMController_chainId, _PPOMController_dataUpdateDuration, _PPOMController_fileFetchScheduleDuration, _PPOMController_securityAlertsEnabled, _PPOMController_providerRequestsCount, _PPOMController_blockaidPublicKey, _PPOMController_ppomInitialised, _PPOMController_initialisePPOM, _PPOMController_chainStatusIncludeSupportedNetworks, _PPOMController_networkIsSupported, _PPOMController_clearDataFetchIntervals, _PPOMController_resetToInactiveState, _PPOMController_onNetworkChange, _PPOMController_onPreferenceChange, _PPOMController_registerMessageHandlers, _PPOMController_resetPPOM, _PPOMController_reinitPPOM, _PPOMController_reinitPPOMForNetworkIfRequired, _PPOMController_isDataRequiredForCurrentChain, _PPOMController_updatePPOM, _PPOMController_updateVersionInfo, _PPOMController_checkFilePresentInStorage, _PPOMController_checkFilePath, _PPOMController_getFile, _PPOMController_setChainIdDataFetched, _PPOMController_getNewFilesForCurrentChain, _PPOMController_getListOfFilesToBeFetched, _PPOMController_deleteOldChainIds, _PPOMController_getNewFilesForAllChains, _PPOMController_getAPIResponse, _PPOMController_checkIfVersionInfoETagChanged, _PPOMController_fetchVersionInfo, _PPOMController_fetchBlob, _PPOMController_jsonRpcRequest, _PPOMController_getPPOM, _PPOMController_onDataUpdateDuration, _PPOMController_checkScheduleFileDownloadForAllChains;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PPOMController = exports.NETWORK_CACHE_DURATION = exports.REFRESH_TIME_INTERVAL = void 0;
const base_controller_1 = require("@metamask/base-controller");
const controller_utils_1 = require("@metamask/controller-utils");
const await_semaphore_1 = require("await-semaphore");
const crypto_js_1 = __importStar(require("crypto-js"));
const ppom_storage_1 = require("./ppom-storage");
const util_1 = require("./util");
exports.REFRESH_TIME_INTERVAL = 1000 * 60 * 60 * 2;
const PROVIDER_REQUEST_LIMIT = 300;
const FILE_FETCH_SCHEDULE_INTERVAL = 1000 * 60 * 5;
exports.NETWORK_CACHE_DURATION = 1000 * 60 * 60 * 24 * 7;
const NETWORK_CACHE_LIMIT = {
    MAX: 5,
    MIN: 2,
};
// The following methods on provider are allowed to PPOM
const ALLOWED_PROVIDER_CALLS = [
    'eth_call',
    'eth_blockNumber',
    'eth_createAccessList',
    'eth_getLogs',
    'eth_getFilterLogs',
    'eth_getTransactionByHash',
    'eth_chainId',
    'eth_getBlockByHash',
    'eth_getBlockByNumber',
    'eth_getCode',
    'eth_getStorageAt',
    'eth_getBalance',
    'eth_getTransactionCount',
    'trace_call',
    'trace_callMany',
    'debug_traceCall',
    'trace_filter',
];
const ETHEREUM_CHAIN_ID = '0x1';
const stateMetaData = {
    versionInfo: { persist: false, anonymous: false },
    chainStatus: { persist: false, anonymous: false },
    storageMetadata: { persist: false, anonymous: false },
    versionFileETag: { persist: false, anonymous: false },
};
const PPOM_VERSION_FILE_NAME = 'ppom_version.json';
const controllerName = 'PPOMController';
const versionInfoFileHeaders = {
    headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/json',
    },
};
/**
 * PPOMController
 * Controller responsible for managing the PPOM
 *
 * @property config - The controller configuration
 * @property state - The controller state
 * @property storage - The controller storage
 * @property ppom - The PPOM instance
 * @property provider - The provider used to create the PPOM instance
 */
class PPOMController extends base_controller_1.BaseControllerV2 {
    /**
     * Creates a PPOMController instance.
     *
     * @param options - Constructor options.
     * @param options.chainId - ChainId of the selected network.
     * @param options.messenger - Controller messenger.
     * @param options.onNetworkChange - Callback tobe invoked when network changes.
     * @param options.provider - The provider used to create the PPOM instance.
     * @param options.storageBackend - The storage backend to use for storing PPOM data.
     * @param options.securityAlertsEnabled - True if user has enabled preference for blockaid security check.
     * @param options.onPreferencesChange - Callback invoked when user changes preferences.
     * @param options.ppomProvider - Object wrapping PPOM.
     * @param options.cdnBaseUrl - Base URL for the CDN.
     * @param options.providerRequestLimit - Limit of number of requests that can be sent to provider per transaction.
     * @param options.dataUpdateDuration - Duration after which data is fetched again.
     * @param options.fileFetchScheduleDuration - Duration after which next data file is fetched.
     * @param options.state - Initial state of the controller.
     * @param options.blockaidPublicKey - Public key of blockaid for verifying signatures of data files.
     * @returns The PPOMController instance.
     */
    constructor({ chainId, messenger, onNetworkChange, provider, storageBackend, securityAlertsEnabled, onPreferencesChange, ppomProvider, cdnBaseUrl, providerRequestLimit, dataUpdateDuration, fileFetchScheduleDuration, state, blockaidPublicKey, }) {
        const currentChainId = (0, util_1.addHexPrefix)(chainId);
        const initialState = {
            versionInfo: state?.versionInfo ?? [],
            storageMetadata: state?.storageMetadata ?? [],
            chainStatus: state?.chainStatus ?? {
                [currentChainId]: {
                    chainId: currentChainId,
                    lastVisited: new Date().getTime(),
                    dataFetched: false,
                    versionInfo: [],
                },
            },
        };
        super({
            name: controllerName,
            metadata: stateMetaData,
            messenger,
            state: initialState,
        });
        _PPOMController_instances.add(this);
        _PPOMController_ppom.set(this, void 0);
        _PPOMController_ppomInitError.set(this, void 0);
        _PPOMController_provider.set(this, void 0);
        _PPOMController_storage.set(this, void 0);
        _PPOMController_refreshDataInterval.set(this, void 0);
        _PPOMController_fileScheduleInterval.set(this, void 0);
        /*
         * This mutex is used to prevent concurrent usage of the PPOM instance
         * and protect the PPOM instance from being used while it is being initialized/updated
         */
        _PPOMController_ppomMutex.set(this, void 0);
        _PPOMController_ppomProvider.set(this, void 0);
        // base URL of the CDN
        _PPOMController_cdnBaseUrl.set(this, void 0);
        // Limit of number of requests ppom can send to the provider per transaction
        _PPOMController_providerRequestLimit.set(this, void 0);
        // Number of requests sent to provider by ppom for current transaction
        _PPOMController_providerRequests.set(this, 0);
        // id of current chain selected
        _PPOMController_chainId.set(this, void 0);
        // interval at which data files are refreshed, default will be 2 hours
        _PPOMController_dataUpdateDuration.set(this, void 0);
        // interval at which files for a network are fetched
        _PPOMController_fileFetchScheduleDuration.set(this, void 0);
        // true if user has enabled preference for blockaid security check
        _PPOMController_securityAlertsEnabled.set(this, void 0);
        // Map of count of each provider request call
        _PPOMController_providerRequestsCount.set(this, {});
        _PPOMController_blockaidPublicKey.set(this, void 0);
        _PPOMController_ppomInitialised.set(this, false);
        __classPrivateFieldSet(this, _PPOMController_chainId, currentChainId, "f");
        __classPrivateFieldSet(this, _PPOMController_provider, provider, "f");
        __classPrivateFieldSet(this, _PPOMController_ppomProvider, ppomProvider, "f");
        __classPrivateFieldSet(this, _PPOMController_storage, new ppom_storage_1.PPOMStorage({
            storageBackend,
            readMetadata: () => {
                return JSON.parse(JSON.stringify(this.state.storageMetadata));
            },
            writeMetadata: (metadata) => {
                this.update((draftState) => {
                    draftState.storageMetadata = metadata;
                });
            },
        }), "f");
        __classPrivateFieldSet(this, _PPOMController_ppomMutex, new await_semaphore_1.Mutex(), "f");
        __classPrivateFieldSet(this, _PPOMController_cdnBaseUrl, cdnBaseUrl, "f");
        __classPrivateFieldSet(this, _PPOMController_providerRequestLimit, providerRequestLimit ?? PROVIDER_REQUEST_LIMIT, "f");
        __classPrivateFieldSet(this, _PPOMController_dataUpdateDuration, dataUpdateDuration ?? exports.REFRESH_TIME_INTERVAL, "f");
        __classPrivateFieldSet(this, _PPOMController_fileFetchScheduleDuration, fileFetchScheduleDuration === undefined
            ? FILE_FETCH_SCHEDULE_INTERVAL
            : fileFetchScheduleDuration, "f");
        __classPrivateFieldSet(this, _PPOMController_securityAlertsEnabled, securityAlertsEnabled, "f");
        __classPrivateFieldSet(this, _PPOMController_blockaidPublicKey, blockaidPublicKey, "f");
        // add new network to chainStatus list
        onNetworkChange(__classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_onNetworkChange).bind(this));
        // enable / disable PPOM validations as user changes preferences
        onPreferencesChange(__classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_onPreferenceChange).bind(this));
        // register message handlers
        __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_registerMessageHandlers).call(this);
        // start scheduled task to fetch data files
        __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_checkScheduleFileDownloadForAllChains).call(this);
    }
    /**
     * Update the PPOM.
     */
    async updatePPOM() {
        if (!__classPrivateFieldGet(this, _PPOMController_securityAlertsEnabled, "f")) {
            throw Error('User has securityAlertsEnabled set to false');
        }
        // delete chains more than a week old
        __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_deleteOldChainIds).call(this);
        // If none of the networks in chainStatus are supported we stop fetching data files
        // and inactivate functionality by reseting PPOM
        if (!__classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_chainStatusIncludeSupportedNetworks).call(this)) {
            __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_resetToInactiveState).call(this);
            return;
        }
        await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_updatePPOM).call(this);
    }
    /**
     * Use the PPOM.
     * This function receives a callback that will be called with the PPOM.
     *
     * @param callback - Callback to be invoked with PPOM.
     */
    async usePPOM(callback) {
        if (!__classPrivateFieldGet(this, _PPOMController_securityAlertsEnabled, "f")) {
            throw Error('User has securityAlertsEnabled set to false');
        }
        if (!__classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_networkIsSupported).call(this, __classPrivateFieldGet(this, _PPOMController_chainId, "f"))) {
            throw Error('Blockaid validation is available only on ethereum mainnet');
        }
        await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_reinitPPOMForNetworkIfRequired).call(this);
        if (__classPrivateFieldGet(this, _PPOMController_ppomInitError, "f")) {
            throw new Error(__classPrivateFieldGet(this, _PPOMController_ppomInitError, "f"));
        }
        __classPrivateFieldSet(this, _PPOMController_providerRequests, 0, "f");
        __classPrivateFieldSet(this, _PPOMController_providerRequestsCount, {}, "f");
        return await __classPrivateFieldGet(this, _PPOMController_ppomMutex, "f").use(async () => {
            const result = await callback(__classPrivateFieldGet(this, _PPOMController_ppom, "f"));
            return {
                ...result,
                // we are destructuring the object below as this will be used outside the controller
                // we want to avoid possibility of outside code changing an instance variable.
                providerRequestsCount: { ...__classPrivateFieldGet(this, _PPOMController_providerRequestsCount, "f") },
            };
        });
    }
}
exports.PPOMController = PPOMController;
_PPOMController_ppom = new WeakMap(), _PPOMController_ppomInitError = new WeakMap(), _PPOMController_provider = new WeakMap(), _PPOMController_storage = new WeakMap(), _PPOMController_refreshDataInterval = new WeakMap(), _PPOMController_fileScheduleInterval = new WeakMap(), _PPOMController_ppomMutex = new WeakMap(), _PPOMController_ppomProvider = new WeakMap(), _PPOMController_cdnBaseUrl = new WeakMap(), _PPOMController_providerRequestLimit = new WeakMap(), _PPOMController_providerRequests = new WeakMap(), _PPOMController_chainId = new WeakMap(), _PPOMController_dataUpdateDuration = new WeakMap(), _PPOMController_fileFetchScheduleDuration = new WeakMap(), _PPOMController_securityAlertsEnabled = new WeakMap(), _PPOMController_providerRequestsCount = new WeakMap(), _PPOMController_blockaidPublicKey = new WeakMap(), _PPOMController_ppomInitialised = new WeakMap(), _PPOMController_instances = new WeakSet(), _PPOMController_initialisePPOM = 
/*
 * Initialise PPOM loading wasm file.
 * This is done only if user has enabled preference for PPOM Validation.
 * Initialisation is done as soon as controller is constructed
 * or as user enables preference for blcokaid validation.
 */
async function _PPOMController_initialisePPOM() {
    if (__classPrivateFieldGet(this, _PPOMController_securityAlertsEnabled, "f") && !__classPrivateFieldGet(this, _PPOMController_ppomInitialised, "f")) {
        await __classPrivateFieldGet(this, _PPOMController_ppomMutex, "f")
            .use(async () => {
            const { ppomInit } = __classPrivateFieldGet(this, _PPOMController_ppomProvider, "f");
            await ppomInit('./ppom_bg.wasm');
            __classPrivateFieldSet(this, _PPOMController_ppomInitialised, true, "f");
        })
            .catch((error) => {
            console.error('Error in trying to initialize PPOM');
            throw error;
        });
    }
}, _PPOMController_chainStatusIncludeSupportedNetworks = function _PPOMController_chainStatusIncludeSupportedNetworks() {
    const networkIsSupported = __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_networkIsSupported).bind(this);
    return (this.state?.chainStatus &&
        Object.keys(this.state?.chainStatus)?.some(networkIsSupported));
}, _PPOMController_networkIsSupported = function _PPOMController_networkIsSupported(chainId) {
    return chainId === ETHEREUM_CHAIN_ID;
}, _PPOMController_clearDataFetchIntervals = function _PPOMController_clearDataFetchIntervals() {
    clearInterval(__classPrivateFieldGet(this, _PPOMController_refreshDataInterval, "f"));
    clearInterval(__classPrivateFieldGet(this, _PPOMController_fileScheduleInterval, "f"));
    __classPrivateFieldSet(this, _PPOMController_refreshDataInterval, undefined, "f");
    __classPrivateFieldSet(this, _PPOMController_fileScheduleInterval, undefined, "f");
}, _PPOMController_resetToInactiveState = function _PPOMController_resetToInactiveState() {
    __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_resetPPOM).call(this);
    __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_clearDataFetchIntervals).call(this);
    this.update((draftState) => {
        draftState.versionInfo = [];
        const newChainStatus = { ...this.state.chainStatus };
        Object.keys(newChainStatus).forEach((chainId) => {
            if (newChainStatus[chainId]) {
                const chainInfo = {
                    ...newChainStatus[chainId],
                    dataFetched: false,
                    versionInfo: [],
                };
                newChainStatus[chainId] = chainInfo;
            }
        });
        draftState.chainStatus = newChainStatus;
        draftState.storageMetadata = [];
        draftState.versionFileETag = '';
    });
    // todo: as we move data files to controller storage we should also delete those here
}, _PPOMController_onNetworkChange = function _PPOMController_onNetworkChange(networkControllerState) {
    const id = (0, util_1.addHexPrefix)(networkControllerState.providerConfig.chainId);
    let chainStatus = { ...this.state.chainStatus };
    const existingNetworkObject = chainStatus[id];
    const oldChainId = __classPrivateFieldGet(this, _PPOMController_chainId, "f");
    __classPrivateFieldSet(this, _PPOMController_chainId, id, "f");
    chainStatus = {
        ...chainStatus,
        [id]: {
            chainId: id,
            lastVisited: new Date().getTime(),
            dataFetched: existingNetworkObject?.dataFetched ?? false,
            versionInfo: existingNetworkObject?.versionInfo ?? [],
        },
    };
    this.update((draftState) => {
        draftState.chainStatus = chainStatus;
    });
    __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_deleteOldChainIds).call(this);
    __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_checkScheduleFileDownloadForAllChains).call(this);
    if (oldChainId !== id) {
        if (chainStatus[id]?.dataFetched) {
            __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_reinitPPOM).call(this).catch(() => {
                console.error('Error in re-init of PPOM');
            });
        }
        else {
            __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_resetPPOM).call(this);
        }
    }
}, _PPOMController_onPreferenceChange = function _PPOMController_onPreferenceChange(preferenceControllerState) {
    const blockaidEnabled = preferenceControllerState.securityAlertsEnabled;
    if (blockaidEnabled === __classPrivateFieldGet(this, _PPOMController_securityAlertsEnabled, "f")) {
        return;
    }
    __classPrivateFieldSet(this, _PPOMController_securityAlertsEnabled, blockaidEnabled, "f");
    if (blockaidEnabled) {
        __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_checkScheduleFileDownloadForAllChains).call(this);
    }
    else {
        __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_resetToInactiveState).call(this);
    }
}, _PPOMController_registerMessageHandlers = function _PPOMController_registerMessageHandlers() {
    this.messagingSystem.registerActionHandler(`${controllerName}:usePPOM`, this.usePPOM.bind(this));
    this.messagingSystem.registerActionHandler(`${controllerName}:updatePPOM`, this.updatePPOM.bind(this));
}, _PPOMController_resetPPOM = function _PPOMController_resetPPOM() {
    if (__classPrivateFieldGet(this, _PPOMController_ppom, "f")) {
        __classPrivateFieldGet(this, _PPOMController_ppom, "f").free();
        __classPrivateFieldSet(this, _PPOMController_ppom, undefined, "f");
    }
}, _PPOMController_reinitPPOM = 
/*
 * The function initialises PPOM.
 */
async function _PPOMController_reinitPPOM() {
    __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_resetPPOM).call(this);
    __classPrivateFieldSet(this, _PPOMController_ppom, await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_getPPOM).call(this), "f");
}, _PPOMController_reinitPPOMForNetworkIfRequired = 
/**
 * Conditionally update the ppom configuration.
 *
 * The function will check if files are required to be downloaded and
 * if needed will re-initialise PPOM passing new network files to it.
 */
async function _PPOMController_reinitPPOMForNetworkIfRequired() {
    if (__classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_isDataRequiredForCurrentChain).call(this)) {
        await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_getNewFilesForCurrentChain).call(this);
    }
    if (!__classPrivateFieldGet(this, _PPOMController_ppom, "f")) {
        await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_reinitPPOM).call(this);
    }
}, _PPOMController_isDataRequiredForCurrentChain = function _PPOMController_isDataRequiredForCurrentChain() {
    const { chainStatus } = this.state;
    return !chainStatus[__classPrivateFieldGet(this, _PPOMController_chainId, "f")]?.dataFetched;
}, _PPOMController_updatePPOM = 
/*
 * Update the PPOM configuration for all chainId.
 * If new version info file is available the function will update data files for all chains.
 */
async function _PPOMController_updatePPOM() {
    const versionInfoUpdated = await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_updateVersionInfo).call(this);
    if (versionInfoUpdated) {
        await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_getNewFilesForAllChains).call(this);
        await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_reinitPPOMForNetworkIfRequired).call(this);
    }
}, _PPOMController_updateVersionInfo = 
/*
 * Fetch the version info from the CDN and update the version info in state.
 * Function returns true if update is available for versionInfo.
 */
async function _PPOMController_updateVersionInfo() {
    const versionInfo = await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_fetchVersionInfo).call(this);
    if (versionInfo) {
        this.update((draftState) => {
            draftState.versionInfo = versionInfo;
        });
        return true;
    }
    return false;
}, _PPOMController_checkFilePresentInStorage = function _PPOMController_checkFilePresentInStorage(storageMetadata, fileVersionInfo) {
    return storageMetadata.find((file) => file.name === fileVersionInfo.name &&
        file.chainId === fileVersionInfo.chainId &&
        file.version === fileVersionInfo.version &&
        file.checksum === fileVersionInfo.checksum);
}, _PPOMController_checkFilePath = function _PPOMController_checkFilePath(filePath) {
    const filePathRegex = /^[\w./]+$/u;
    if (!filePath.match(filePathRegex)) {
        throw new Error(`Invalid file path for data file: ${filePath}`);
    }
}, _PPOMController_getFile = 
/*
 * Gets a single file from CDN and write to the storage.
 */
async function _PPOMController_getFile(fileVersionInfo, storageFoundCorrupted) {
    const { storageMetadata } = this.state;
    // do not fetch file if the storage version is latest
    if (!storageFoundCorrupted &&
        __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_checkFilePresentInStorage).call(this, storageMetadata, fileVersionInfo)) {
        return undefined;
    }
    // validate file path for valid characters
    __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_checkFilePath).call(this, fileVersionInfo.filePath);
    const fileUrl = (0, util_1.constructURLHref)(__classPrivateFieldGet(this, _PPOMController_cdnBaseUrl, "f"), fileVersionInfo.filePath);
    const fileData = await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_fetchBlob).call(this, fileUrl);
    const hash = (0, crypto_js_1.SHA256)(crypto_js_1.default.lib.WordArray.create(fileData));
    const hashString = hash.toString();
    await (0, util_1.validateSignature)(hashString, fileVersionInfo.hashSignature, __classPrivateFieldGet(this, _PPOMController_blockaidPublicKey, "f"), fileVersionInfo.filePath);
    await __classPrivateFieldGet(this, _PPOMController_storage, "f").writeFile({
        data: fileData,
        ...fileVersionInfo,
    });
    return fileData;
}, _PPOMController_setChainIdDataFetched = 
/*
 * As files for a chain are fetched this function set dataFetched
 * property for that chainId in chainStatus to true.
 */
async function _PPOMController_setChainIdDataFetched(chainId) {
    const { chainStatus, versionInfo } = this.state;
    const chainIdObject = chainStatus[chainId];
    const versionInfoForChain = versionInfo.filter(({ chainId: id }) => id === chainId);
    if (chainIdObject) {
        if (!chainIdObject.dataFetched) {
            this.update((draftState) => {
                draftState.chainStatus = {
                    ...chainStatus,
                    [chainId]: {
                        ...chainIdObject,
                        dataFetched: true,
                        versionInfo: versionInfoForChain,
                    },
                };
            });
        }
    }
}, _PPOMController_getNewFilesForCurrentChain = 
/*
 * Fetches new files for current network and save them to storage.
 * The function is invoked if user if attempting transaction for current network,
 * for which data is not previously fetched.
 */
async function _PPOMController_getNewFilesForCurrentChain() {
    for (const fileVersionInfo of this.state.versionInfo) {
        if (fileVersionInfo.chainId !== __classPrivateFieldGet(this, _PPOMController_chainId, "f")) {
            continue;
        }
        await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_getFile).call(this, fileVersionInfo).catch((exp) => {
            console.error(`Error in getting file ${fileVersionInfo.filePath}: ${exp.message}`);
        });
    }
    await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_setChainIdDataFetched).call(this, __classPrivateFieldGet(this, _PPOMController_chainId, "f"));
    await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_reinitPPOM).call(this);
}, _PPOMController_getListOfFilesToBeFetched = 
/*
 * Function creates list of all files to be fetched for all chainIds in chainStatus.
 */
async function _PPOMController_getListOfFilesToBeFetched() {
    const { chainStatus, storageMetadata, versionInfo: stateVersionInfo, } = this.state;
    const networkIsSupported = __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_networkIsSupported).bind(this);
    // create a map of chainId and files belonging to that chainId
    // not include the files for which the version in storage is the latest one
    // As we add support for multiple chains it will be useful to sort the chain in desc order of lastvisited
    const chainIdsFileInfoList = Object.keys(chainStatus)
        .filter(networkIsSupported)
        .map((chainId) => ({
        chainId,
        versionInfo: stateVersionInfo.filter((versionInfo) => versionInfo.chainId === chainId &&
            !__classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_checkFilePresentInStorage).call(this, storageMetadata, versionInfo)),
    }));
    // build a list of files to be fetched for all networks
    const fileToBeFetchedList = [];
    chainIdsFileInfoList.forEach((chainIdFileInfo) => {
        const { versionInfo } = chainIdFileInfo;
        versionInfo.forEach((fileVersionInfo, index) => {
            fileToBeFetchedList.push({
                fileVersionInfo,
                isLastFileOfNetwork: index === versionInfo.length - 1,
            });
        });
    });
    return fileToBeFetchedList;
}, _PPOMController_deleteOldChainIds = function _PPOMController_deleteOldChainIds() {
    // We keep minimum of 2 chainIds in the state
    if (Object.keys(this.state.chainStatus)?.length <= NETWORK_CACHE_LIMIT.MIN) {
        return;
    }
    const currentTimestamp = new Date().getTime();
    const chainIds = Object.keys(this.state.chainStatus);
    const oldChaninIds = chainIds.filter((chainId) => this.state.chainStatus[chainId].lastVisited <
        currentTimestamp - exports.NETWORK_CACHE_DURATION &&
        chainId !== __classPrivateFieldGet(this, _PPOMController_chainId, "f"));
    if (chainIds.length > NETWORK_CACHE_LIMIT.MAX) {
        const oldestChainId = chainIds.sort((c1, c2) => Number(this.state.chainStatus[c2]?.lastVisited) -
            Number(this.state.chainStatus[c1]?.lastVisited))[NETWORK_CACHE_LIMIT.MAX];
        oldChaninIds.push(oldestChainId);
    }
    const chainStatus = { ...this.state.chainStatus };
    oldChaninIds.forEach((chainId) => {
        delete chainStatus[chainId];
    });
    this.update((draftState) => {
        draftState.chainStatus = chainStatus;
    });
}, _PPOMController_getNewFilesForAllChains = 
/*
 * Function that fetches and saves to storage files for all networks.
 * Files are not fetched parallely but at regular intervals to
 * avoid sending a lot of parallel requests to CDN.
 */
async function _PPOMController_getNewFilesForAllChains() {
    // clear existing scheduled task to fetch files if any
    if (__classPrivateFieldGet(this, _PPOMController_fileScheduleInterval, "f")) {
        clearInterval(__classPrivateFieldGet(this, _PPOMController_fileScheduleInterval, "f"));
    }
    // build a list of files to be fetched for all networks
    const fileToBeFetchedList = await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_getListOfFilesToBeFetched).call(this);
    // Get scheduled interval, if schedule interval is large so that not all files can be fetched in
    // this.#dataUpdateDuration, reduce schedule interval
    let scheduleInterval = __classPrivateFieldGet(this, _PPOMController_fileFetchScheduleDuration, "f");
    if (__classPrivateFieldGet(this, _PPOMController_dataUpdateDuration, "f") / (fileToBeFetchedList.length + 1) <
        __classPrivateFieldGet(this, _PPOMController_fileFetchScheduleDuration, "f")) {
        scheduleInterval =
            __classPrivateFieldGet(this, _PPOMController_dataUpdateDuration, "f") / (fileToBeFetchedList.length + 1);
    }
    // schedule files to be fetched in regular intervals
    __classPrivateFieldSet(this, _PPOMController_fileScheduleInterval, setInterval(() => {
        const fileToBeFetched = fileToBeFetchedList.pop();
        if (fileToBeFetched) {
            const { chainStatus } = this.state;
            const { fileVersionInfo, isLastFileOfNetwork } = fileToBeFetched;
            // check here if chain is present in chainStatus, it may be removed from chainStatus
            // if more than 5 networks are added to it.
            if (chainStatus[fileVersionInfo.chainId]) {
                // get the file from CDN
                __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_getFile).call(this, fileVersionInfo)
                    .then(async () => {
                    if (isLastFileOfNetwork) {
                        // if this was last file for the chainId set dataFetched for chainId to true
                        await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_setChainIdDataFetched).call(this, fileVersionInfo.chainId);
                        if (fileVersionInfo.chainId === __classPrivateFieldGet(this, _PPOMController_chainId, "f")) {
                            await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_reinitPPOM).call(this);
                        }
                    }
                })
                    .catch((exp) => console.error(`Error in getting file ${fileVersionInfo.filePath}: ${exp.message}`));
            }
        }
        // clear interval if all files are fetched
        if (!fileToBeFetchedList.length) {
            clearInterval(__classPrivateFieldGet(this, _PPOMController_fileScheduleInterval, "f"));
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            __classPrivateFieldGet(this, _PPOMController_storage, "f").syncMetadata(this.state.versionInfo);
        }
    }, scheduleInterval), "f");
}, _PPOMController_getAPIResponse = 
/*
 * Generic method to fetch file from CDN.
 */
async function _PPOMController_getAPIResponse(url, options = {}, method = 'GET') {
    const response = await (0, controller_utils_1.safelyExecute)(async () => (0, controller_utils_1.timeoutFetch)(url, {
        method,
        cache: 'no-cache',
        redirect: 'error',
        ...options,
    }, 10000), true);
    if (response?.status !== 200) {
        throw new Error(`Failed to fetch file with url: ${url}`);
    }
    return response;
}, _PPOMController_checkIfVersionInfoETagChanged = 
/*
 * Function sends a HEAD request to version info file and compares the ETag to the one saved in controller state.
 * If ETag is not changed we can be sure that there is not change in files and we do not need to fetch data again.
 */
async function _PPOMController_checkIfVersionInfoETagChanged(url) {
    const headResponse = await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_getAPIResponse).call(this, url, {
        headers: versionInfoFileHeaders,
    }, 'HEAD');
    const { versionFileETag } = this.state;
    if (headResponse.headers.get('ETag') === versionFileETag) {
        return false;
    }
    this.update((draftState) => {
        draftState.versionFileETag = headResponse.headers.get('ETag');
    });
    return true;
}, _PPOMController_fetchVersionInfo = 
/*
 * Fetch the version info from the PPOM cdn.
 */
async function _PPOMController_fetchVersionInfo() {
    const url = (0, util_1.constructURLHref)(__classPrivateFieldGet(this, _PPOMController_cdnBaseUrl, "f"), PPOM_VERSION_FILE_NAME);
    // If ETag is same it is not required to fetch data files again
    const eTagChanged = await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_checkIfVersionInfoETagChanged).call(this, url);
    if (!eTagChanged) {
        return undefined;
    }
    const response = await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_getAPIResponse).call(this, url, {
        headers: versionInfoFileHeaders,
    });
    return response.json();
}, _PPOMController_fetchBlob = 
/*
 * Fetch the blob file from the PPOM cdn.
 */
async function _PPOMController_fetchBlob(url) {
    const response = await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_getAPIResponse).call(this, url);
    return await response.arrayBuffer();
}, _PPOMController_jsonRpcRequest = 
/*
 * Send a JSON RPC request to the provider.
 * This method is used by the PPOM to make requests to the provider.
 */
async function _PPOMController_jsonRpcRequest(method, params) {
    return new Promise((resolve) => {
        // Resolve with error if number of requests from PPOM to provider exceeds the limit for the current transaction
        if (__classPrivateFieldGet(this, _PPOMController_providerRequests, "f") > __classPrivateFieldGet(this, _PPOMController_providerRequestLimit, "f")) {
            resolve(util_1.PROVIDER_ERRORS.limitExceeded());
            return;
        }
        __classPrivateFieldSet(this, _PPOMController_providerRequests, __classPrivateFieldGet(this, _PPOMController_providerRequests, "f") + 1, "f");
        // Resolve with error if the provider method called by PPOM is not allowed for PPOM
        if (!ALLOWED_PROVIDER_CALLS.includes(method)) {
            resolve(util_1.PROVIDER_ERRORS.methodNotSupported());
            return;
        }
        __classPrivateFieldGet(this, _PPOMController_providerRequestsCount, "f")[method] = __classPrivateFieldGet(this, _PPOMController_providerRequestsCount, "f")[method]
            ? Number(__classPrivateFieldGet(this, _PPOMController_providerRequestsCount, "f")[method]) + 1
            : 1;
        // Invoke provider and return result
        __classPrivateFieldGet(this, _PPOMController_provider, "f").sendAsync((0, util_1.createPayload)(method, params), (error, res) => {
            if (error) {
                resolve({
                    jsonrpc: '2.0',
                    id: (0, util_1.IdGenerator)(),
                    error,
                });
            }
            else {
                resolve(res);
            }
        });
    });
}, _PPOMController_getPPOM = 
/*
 * This function can be called to initialise PPOM or re-initilise it,
 * when new files are required to be passed to it.
 *
 * It will load the data files from storage and pass data files and wasm file to ppom.
 */
async function _PPOMController_getPPOM() {
    // For some reason ppom initialisation in contrructor fails for react native
    // thus it is added here to prevent validation from failing.
    await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_initialisePPOM).call(this);
    __classPrivateFieldSet(this, _PPOMController_ppomInitError, undefined, "f");
    const { chainStatus } = this.state;
    const chainInfo = chainStatus[__classPrivateFieldGet(this, _PPOMController_chainId, "f")];
    if (!chainInfo?.versionInfo?.length) {
        __classPrivateFieldSet(this, _PPOMController_ppomInitError, `Aborting validation as no files are found for the network with chainId: ${__classPrivateFieldGet(this, _PPOMController_chainId, "f")}`, "f");
        return undefined;
    }
    // Get all the files for  the chainId
    let files = await Promise.all(chainInfo.versionInfo.map(async (file) => {
        let data;
        try {
            // First try to get file from storage
            data = await __classPrivateFieldGet(this, _PPOMController_storage, "f").readFile(file.name, file.chainId);
        }
        catch {
            try {
                // Get the file from CDN if it is not found in storage
                data = await __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_getFile).call(this, file, true);
            }
            catch (exp) {
                console.error(`Error in getting file ${file.filePath}: ${exp.message}`);
            }
        }
        if (data) {
            return [file.name, new Uint8Array(data)];
        }
        return undefined;
    }));
    files = files.filter((data) => data !== undefined);
    // The following code throw error if no data files are found for the chainId.
    // This check has been put in place after suggestion of security team.
    // If we want to disable ppom validation on all instances of Metamask,
    // this can be achieved by returning empty data from version file.
    if (files.length !== chainInfo?.versionInfo?.length) {
        __classPrivateFieldSet(this, _PPOMController_ppomInitError, `Aborting validation as not all files could not be downloaded for the network with chainId: ${__classPrivateFieldGet(this, _PPOMController_chainId, "f")}`, "f");
        return undefined;
    }
    return await __classPrivateFieldGet(this, _PPOMController_ppomMutex, "f").use(async () => {
        const { PPOM } = __classPrivateFieldGet(this, _PPOMController_ppomProvider, "f");
        return PPOM.new(__classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_jsonRpcRequest).bind(this), files);
    });
}, _PPOMController_onDataUpdateDuration = function _PPOMController_onDataUpdateDuration() {
    this.updatePPOM().catch((exp) => {
        console.error(`Error while trying to update PPOM: ${exp.message}`);
    });
}, _PPOMController_checkScheduleFileDownloadForAllChains = function _PPOMController_checkScheduleFileDownloadForAllChains() {
    if (__classPrivateFieldGet(this, _PPOMController_securityAlertsEnabled, "f") &&
        __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_chainStatusIncludeSupportedNetworks).call(this)) {
        if (!__classPrivateFieldGet(this, _PPOMController_refreshDataInterval, "f")) {
            __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_onDataUpdateDuration).call(this);
            __classPrivateFieldSet(this, _PPOMController_refreshDataInterval, setInterval(__classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_onDataUpdateDuration).bind(this), __classPrivateFieldGet(this, _PPOMController_dataUpdateDuration, "f")), "f");
        }
    }
    else {
        __classPrivateFieldGet(this, _PPOMController_instances, "m", _PPOMController_resetToInactiveState).call(this);
    }
};
//# sourceMappingURL=ppom-controller.js.map