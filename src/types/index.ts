export interface Abhang {
  id: string;
  saint: string;
  title: string;
  content: string;
  meaning: string;
  isUserAdded: boolean;
  createdAt?: number;
}

export type AbhangSource = 'builtin' | 'user';

export type RootTabParamList = {
  HomeTab: undefined;
  FavoritesTab: undefined;
  UserTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Browse: { saint?: string };
  AbhangDetail: { id: string };
};

export type FavoritesStackParamList = {
  Favorites: undefined;
  AbhangDetail: { id: string };
};

export type UserStackParamList = {
  UserAbhangs: undefined;
  AddAbhang: { editId?: string };
  AbhangDetail: { id: string };
};
