import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Root level navigator (onboarding or main app)
export type RootStackParamList = {
  OnboardingStack: undefined;
  MainApp: undefined;
};

// Onboarding screens
export type OnboardingStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
};

// Main app tab navigator
export type RootTabParamList = {
  Convert: undefined;
  HistoryStack: undefined;
  Settings: undefined;
};

export type HistoryStackParamList = {
  HistoryList: undefined;
  PDFDetail: { pdfId: string };
  ManagePages: { pdfId: string };
};

export type ConvertScreenProps = BottomTabScreenProps<RootTabParamList, 'Convert'>;
export type SettingsScreenProps = BottomTabScreenProps<RootTabParamList, 'Settings'>;

export type HistoryListScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HistoryStackParamList, 'HistoryList'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type PDFDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HistoryStackParamList, 'PDFDetail'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type ManagePagesScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HistoryStackParamList, 'ManagePages'>,
  BottomTabScreenProps<RootTabParamList>
>;

// Onboarding screen props
export type Onboarding1ScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'Onboarding1'
>;

export type Onboarding2ScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'Onboarding2'
>;

export type Onboarding3ScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  'Onboarding3'
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
