export const SAINTS = [
  'संत तुकाराम',
  'संत नामदेव',
  'संत एकनाथ',
  'संत ज्ञानेश्वर',
] as const;

export type SaintName = (typeof SAINTS)[number];
