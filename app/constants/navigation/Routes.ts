const Routes = {
  WALLET_VIEW: 'WalletView',
  BROWSER_TAB_HOME: 'BrowserTabHome',
  BROWSER_URL_MODAL: 'BrowserUrlModal',
  BROWSER_VIEW: 'BrowserView',
  SETTINGS_VIEW: 'SettingsView',
  RAMP: {
    ID: 'Ramp',
    BUY: 'RampBuy',
    SELL: 'RampSell',
    GET_STARTED: 'GetStarted',
    PAYMENT_METHOD: 'PaymentMethod',
    PAYMENT_METHOD_HAS_STARTED: 'PaymentMethodHasStarted',
    BUILD_QUOTE: 'BuildQuote',
    QUOTES: 'Quotes',
    CHECKOUT: 'Checkout',
    REGION: 'Region',
    REGION_HAS_STARTED: 'RegionHasStarted',
    NETWORK_SWITCHER: 'BuyNetworkSwitcher',
    ORDER_DETAILS: 'OrderDetails',
    SEND_TRANSACTION: 'SendTransaction',
    SETTINGS: 'RampSettings',
    ADD_ACTIVATION_KEY: 'RampAddActivationKey',
  },
  HW: {
    CONNECT: 'ConnectHardwareWalletFlow',
    SELECT_DEVICE: 'SelectHardwareWallet',
    CONNECT_QR_DEVICE: 'ConnectQRHardwareFlow',
    CONNECT_LEDGER: 'ConnectLedgerFlow',
    LEDGER_ACCOUNT: 'LedgerAccountInfo',
    LEDGER_CONNECT: 'LedgerConnect',
  },
  LEDGER_MESSAGE_SIGN_MODAL: 'LedgerMessageSignModal',
  LEDGER_TRANSACTION_MODAL: 'LedgerTransactionModal',
  QR_SCANNER: 'QRScanner',
  TRANSACTIONS_VIEW: 'TransactionsView',
  MODAL: {
    DELETE_WALLET: 'DeleteWalletModal',
    ROOT_MODAL_FLOW: 'RootModalFlow',
    MODAL_CONFIRMATION: 'ModalConfirmation',
    MODAL_MANDATORY: 'ModalMandatory',
    WHATS_NEW: 'WhatsNewModal',
    TURN_OFF_REMEMBER_ME: 'TurnOffRememberMeModal',
    UPDATE_NEEDED: 'UpdateNeededModal',
    ENABLE_AUTOMATIC_SECURITY_CHECKS: 'EnableAutomaticSecurityChecksModal',
    DETECTED_TOKENS: 'DetectedTokens',
    SRP_REVEAL_QUIZ: 'SRPRevealQuiz',
    WALLET_ACTIONS: 'WalletActions',
  },
  ONBOARDING: {
    ROOT_NAV: 'OnboardingRootNav',
    HOME_NAV: 'HomeNav',
    ONBOARDING: 'Onboarding',
    LOGIN: 'Login',
    NAV: 'OnboardingNav',
    MANUAL_BACKUP: {
      STEP_3: 'ManualBackupStep3',
    },
    IMPORT_FROM_SECRET_RECOVERY_PHRASE: 'ImportFromSecretRecoveryPhrase',
  },
  SEND_FLOW: {
    SEND_TO: 'SendTo',
    AMOUNT: 'Amount',
    CONFIRM: 'Confirm',
  },
  ACCOUNT_BACKUP: {
    STEP_1_B: 'AccountBackupStep1B',
  },
  SETTINGS: {
    CONTACT_FORM: 'ContactForm',
    REVEAL_PRIVATE_CREDENTIAL: 'RevealPrivateCredentialView',
    CHANGE_PASSWORD: 'ResetPassword',
    EXPERIMENTAL_SETTINGS: 'ExperimentalSettings',
  },
  SHEET: {
    ACCOUNT_SELECTOR: 'AccountSelector',
    AMBIGUOUS_ADDRESS: 'AmbiguousAddress',
    SDK_LOADING: 'SDKLoading',
    SDK_FEEDBACK: 'SDKFeedback',
    ACCOUNT_CONNECT: 'AccountConnect',
    ACCOUNT_PERMISSIONS: 'AccountPermissions',
    NETWORK_SELECTOR: 'NetworkSelector',
    RETURN_TO_DAPP_MODAL: 'ReturnToDappModal',
    BLOCKAID_INDICATOR: 'BlockaidIndicator',
    ACCOUNT_ACTIONS: 'AccountActions',
    ETH_SIGN_FRICTION: 'SettingsAdvancedEthSignFriction',
    SHOW_IPFS: 'ShowIpfs',
    SHOW_NFT_DISPLAY_MEDIA: 'ShowNftDisplayMedia',
  },
  BROWSER: {
    HOME: 'BrowserTabHome',
    URL_MODAL: 'BrowserUrlModal',
    VIEW: 'BrowserView',
  },
  WEBVIEW: {
    MAIN: 'Webview',
    SIMPLE: 'SimpleWebview',
  },
  WALLET: {
    HOME: 'WalletTabHome',
    TAB_STACK_FLOW: 'WalletTabStackFlow',
  },
  VAULT_RECOVERY: {
    RESTORE_WALLET: 'RestoreWallet',
    WALLET_RESTORED: 'WalletRestored',
    WALLET_RESET_NEEDED: 'WalletResetNeeded',
  },
  ADD_NETWORK: 'AddNetwork',
  SWAPS: 'Swaps',
  LOCK_SCREEN: 'LockScreen',
  ///: BEGIN:ONLY_INCLUDE_IF(flask)
  SNAPS: {
    SNAPS_SETTINGS_LIST: 'SnapsSettingsList',
  },
  ///: END:ONLY_INCLUDE_IF
};

export default Routes;
