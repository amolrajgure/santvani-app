/**
 * Curated daily abhang list.
 *
 * Each entry is an abhang ID from the built-in data files.
 * The home screen cycles through this list one entry per day (rolling).
 *
 * To add/change entries:
 *   - Find the abhang ID in the relevant data file (bt-*, gyan-* etc.)
 *   - Append or replace an entry in the array below
 *   - IDs must exist in BUILTIN_ABHANGAS or DNYANDEV_ABHANGAS
 *
 * Current: one abhang from each saint as a starter set.
 */
export const DAILY_ABHANG_IDS: string[] = [
  'bt-0',      // संत तुकाराम — अभंग १
  'bt-4079',   // संत नामदेव  — अभंग १
  'bt-4844',   // संत एकनाथ  — अभंग १
  'gyan-१',    // संत ज्ञानेश्वर — अभंग १
];
