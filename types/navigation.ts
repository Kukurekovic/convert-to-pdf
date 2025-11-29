import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
  Convert: undefined;
  History: undefined;
  Settings: undefined;
};

export type ConvertScreenProps = BottomTabScreenProps<RootTabParamList, 'Convert'>;
export type HistoryScreenProps = BottomTabScreenProps<RootTabParamList, 'History'>;
export type SettingsScreenProps = BottomTabScreenProps<RootTabParamList, 'Settings'>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
