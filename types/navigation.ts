import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootTabParamList = {
  Convert: undefined;
  HistoryStack: undefined;
  Settings: undefined;
};

export type HistoryStackParamList = {
  HistoryList: undefined;
  PDFDetail: { pdfId: string };
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

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
