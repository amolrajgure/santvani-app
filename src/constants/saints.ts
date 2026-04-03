export const SAINTS = [
  'संत तुकाराम',
  'संत नामदेव',
  'संत एकनाथ',
] as const;

export type SaintName = (typeof SAINTS)[number];
