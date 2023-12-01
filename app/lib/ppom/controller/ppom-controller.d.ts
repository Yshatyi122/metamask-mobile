/* eslint-disable */

import { BaseControllerV2, RestrictedControllerMessenger } from '@metamask/base-controller';
import { StorageBackend, FileMetadataList, FileMetadata } from './ppom-storage';
export declare const REFRESH_TIME_INTERVAL: number;
export declare const NETWORK_CACHE_DURATION: number;
/**
 * @type PPOMFileVersion
 * @augments FileMetadata
 * @property filePath - Path of the file in CDN.
 */
declare type PPOMFileVersion = FileMetadata & {
    filePath: string;
    signature: string;
    hashSignature: string;
};
/**
 * @type PPOMVersionResponse - array of objects of type PPOMFileVersion
 */
declare type PPOMVersionResponse = PPOMFileVersion[];
declare type ChainInfo = {
    chainId: string;
    lastVisited: number;
    dataFetched: boolean;
    versionInfo: PPOMVersionResponse;
};
declare type ChainType = Record<string, ChainInfo>;
/**
 * @type PPOMState
 *
 * Controller state
 * @property chainId - ID of current chain.
 * @property chainStatus - Array of chainId and time it was last visited.
 * @property versionInfo - Version information fetched from CDN.
 * @property storageMetadata - Metadata of files storaged in storage.
 */
export declare type PPOMState = {
    chainStatus: ChainType;
    versionInfo: PPOMVersionResponse;
    storageMetadata: FileMetadataList;
    versionFileETag?: string;
};
declare const controllerName = "PPOMController";
export declare type UsePPOM = {
    type: `${typeof controllerName}:usePPOM`;
    handler: (callback: (ppom: any) => Promise<any>) => Promise<any>;
};
export declare type UpdatePPOM = {
    type: `${typeof controllerName}:updatePPOM`;
    handler: () => void;
};
export declare type PPOMControllerActions = UsePPOM | UpdatePPOM;
export declare type PPOMControllerMessenger = RestrictedControllerMessenger<typeof controllerName, PPOMControllerActions, never, never, never>;
declare type PPOMProvider = {
    ppomInit: (wasmFilePath: string) => Promise<void>;
    PPOM: any;
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
export declare class PPOMController extends BaseControllerV2<typeof controllerName, PPOMState, PPOMControllerMessenger> {
    #private;
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
    constructor({ chainId, messenger, onNetworkChange, provider, storageBackend, securityAlertsEnabled, onPreferencesChange, ppomProvider, cdnBaseUrl, providerRequestLimit, dataUpdateDuration, fileFetchScheduleDuration, state, blockaidPublicKey, }: {
        chainId: string;
        onNetworkChange: (callback: (networkState: any) => void) => void;
        messenger: PPOMControllerMessenger;
        provider: any;
        storageBackend: StorageBackend;
        securityAlertsEnabled: boolean;
        onPreferencesChange: (callback: (perferenceState: any) => void) => void;
        ppomProvider: PPOMProvider;
        cdnBaseUrl: string;
        providerRequestLimit?: number;
        dataUpdateDuration?: number;
        fileFetchScheduleDuration?: number;
        state?: PPOMState;
        blockaidPublicKey: string;
    });
    /**
     * Update the PPOM.
     */
    updatePPOM(): Promise<void>;
    /**
     * Use the PPOM.
     * This function receives a callback that will be called with the PPOM.
     *
     * @param callback - Callback to be invoked with PPOM.
     */
    usePPOM<T>(callback: (ppom: any) => Promise<T>): Promise<T & {
        providerRequestsCount: Record<string, number>;
    }>;
}
export {};
