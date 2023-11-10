import React from 'react';
import { Country } from '@consensys/on-ramp-sdk';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderScreen } from '../../../../../../util/test/renderWithProvider';

import Regions from './Regions';
import useRegions from '../../hooks/useRegions';
import { RampSDK } from '../../../common/sdk';
import { RampType, Region } from '../../../common/types';
import { createPaymentMethodsNavDetails } from '../PaymentMethods/PaymentMethods';
import Routes from '../../../../../../constants/navigation/Routes';
import initialBackgroundState from '../../../../../../util/test/initial-background-state.json';

function render(Component: React.ComponentType) {
  return renderScreen(
    Component,
    {
      name: Routes.RAMP.REGION,
    },
    {
      state: {
        engine: {
          backgroundState: initialBackgroundState,
        },
      },
    },
  );
}

const mockSetSelectedRegion = jest.fn();
const mockSetSelectedCurrency = jest.fn();

const mockuseRampSDKInitialValues: Partial<RampSDK> = {
  setSelectedRegion: mockSetSelectedRegion,
  setSelectedFiatCurrencyId: mockSetSelectedCurrency,
  sdkError: undefined,
  selectedChainId: '1',
  rampType: RampType.BUY,
  isBuy: true,
  isSell: false,
};

let mockUseRampSDKValues: Partial<RampSDK> = {
  ...mockuseRampSDKInitialValues,
};

jest.mock('../../../common/sdk', () => ({
  ...jest.requireActual('../../../common/sdk'),
  useRampSDK: () => mockUseRampSDKValues,
}));

const mockQueryGetCountries = jest.fn();
const mockClearUnsupportedRegion = jest.fn();

const mockRegionsData = [
  {
    currencies: ['/currencies/fiat/clp'],
    emoji: '🇨🇱',
    id: '/regions/cl',
    name: 'Chile',
    unsupported: false,
    support: {
      buy: true,
      sell: true,
    },
  },
  {
    currencies: ['/currencies/fiat/ars'],
    emoji: '🇦🇷',
    id: '/regions/ar',
    name: 'Argentina',
    unsupported: false,
    support: {
      buy: true,
      sell: true,
    },
  },
] as Partial<Country>[];

const mockuseRegionsInitialValues: Partial<ReturnType<typeof useRegions>> = {
  data: mockRegionsData as Country[],
  isFetching: false,
  error: null,
  query: mockQueryGetCountries,
  selectedRegion: null,
  unsupportedRegion: undefined,
  clearUnsupportedRegion: mockClearUnsupportedRegion,
};

let mockUseRegionsValues: Partial<ReturnType<typeof useRegions>> = {
  ...mockuseRegionsInitialValues,
};

jest.mock('../../hooks/useRegions', () => jest.fn(() => mockUseRegionsValues));

const mockSetOptions = jest.fn();
const mockNavigate = jest.fn();
const mockPop = jest.fn();
const mockTrackEvent = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualReactNavigation = jest.requireActual('@react-navigation/native');
  return {
    ...actualReactNavigation,
    useNavigation: () => ({
      navigate: mockNavigate,
      setOptions: mockSetOptions.mockImplementation(
        actualReactNavigation.useNavigation().setOptions,
      ),
      dangerouslyGetParent: () => ({
        pop: mockPop,
      }),
    }),
  };
});

jest.mock('../../../common/hooks/useAnalytics', () => () => mockTrackEvent);

describe('Regions View', () => {
  afterEach(() => {
    mockNavigate.mockClear();
    mockSetOptions.mockClear();
    mockPop.mockClear();
    mockTrackEvent.mockClear();
    (mockuseRampSDKInitialValues.setSelectedRegion as jest.Mock).mockClear();
    (
      mockuseRampSDKInitialValues.setSelectedFiatCurrencyId as jest.Mock
    ).mockClear();
  });

  beforeEach(() => {
    mockUseRampSDKValues = {
      ...mockuseRampSDKInitialValues,
    };
    mockUseRegionsValues = {
      ...mockuseRegionsInitialValues,
    };
  });

  it('calls setOptions when rendering', async () => {
    render(Regions);
    expect(mockSetOptions).toBeCalledTimes(1);
  });

  it('renders correctly', async () => {
    render(Regions);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('renders correctly while loading', async () => {
    mockUseRegionsValues = {
      ...mockuseRegionsInitialValues,
      isFetching: true,
    };
    render(Regions);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('renders correctly with no data', async () => {
    mockUseRegionsValues = {
      ...mockuseRegionsInitialValues,
      data: null,
    };
    render(Regions);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('renders correctly with selectedRegion', async () => {
    mockUseRegionsValues = {
      ...mockuseRegionsInitialValues,
      selectedRegion: mockRegionsData[0] as Country,
    };
    render(Regions);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('renders regions modal when pressing select button', async () => {
    render(Regions);
    const selectRegionButton = screen.getByRole('button', {
      name: 'Select your region',
    });
    fireEvent.press(selectRegionButton);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('calls setSelectedRegion when pressing a region', async () => {
    render(Regions);
    const regionToPress = mockRegionsData[0] as Region;
    // First show region modal
    const selectRegionButton = screen.getByRole('button', {
      name: 'Select your region',
    });
    fireEvent.press(selectRegionButton);
    // Then detect region selection buttons
    const regionButton = screen.getByRole('button', {
      name: regionToPress.name,
    });
    fireEvent.press(regionButton);
    expect(mockSetSelectedRegion).toHaveBeenCalledWith(regionToPress);
  });

  it('navigates on continue press', async () => {
    mockUseRegionsValues = {
      ...mockuseRegionsInitialValues,
      selectedRegion: mockRegionsData[0] as Country,
    };
    render(Regions);
    fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(mockNavigate).toHaveBeenCalledWith(
      ...createPaymentMethodsNavDetails(),
    );
  });

  it('navigates and tracks event on cancel button press', async () => {
    mockUseRampSDKValues = {
      ...mockuseRampSDKInitialValues,
    };
    render(Regions);
    fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockPop).toHaveBeenCalled();
    expect(mockTrackEvent).toBeCalledWith('ONRAMP_CANCELED', {
      chain_id_destination: '1',
      location: 'Region Screen',
    });
  });

  it('has continue button disabled', async () => {
    render(Regions);
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton.props.disabled).toBe(true);
  });

  it('renders correctly with unsupportedRegion', async () => {
    mockUseRegionsValues = {
      ...mockuseRegionsInitialValues,
      unsupportedRegion: mockRegionsData[1] as Region,
    };
    render(Regions);
    expect(screen.toJSON()).toMatchSnapshot();

    mockUseRampSDKValues = {
      ...mockuseRampSDKInitialValues,
      isBuy: false,
      isSell: true,
      rampType: RampType.SELL,
    };
    render(Regions);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('renders correctly with sdkError', async () => {
    mockUseRampSDKValues = {
      ...mockuseRampSDKInitialValues,
      sdkError: new Error('sdkError'),
    };
    render(Regions);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('navigates to home when clicking sdKError button', async () => {
    mockUseRampSDKValues = {
      ...mockuseRampSDKInitialValues,
      sdkError: new Error('sdkError'),
    };
    render(Regions);
    fireEvent.press(
      screen.getByRole('button', { name: 'Return to Home Screen' }),
    );
    expect(mockPop).toBeCalledTimes(1);
  });

  it('renders correctly with error', async () => {
    mockUseRegionsValues = {
      ...mockuseRegionsInitialValues,
      error: 'Test error',
    };
    render(Regions);
    expect(screen.toJSON()).toMatchSnapshot();
  });

  it('queries countries again with error', async () => {
    mockUseRegionsValues = {
      ...mockuseRegionsInitialValues,
      error: 'Test error',
    };
    render(Regions);
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(mockQueryGetCountries).toBeCalledTimes(1);
  });
});
