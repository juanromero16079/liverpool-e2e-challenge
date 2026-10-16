export const testConfig = {
  searchTerm: process.env.SEARCH_TERM ?? 'playstation 5',
  /** Challenge wording is "White"; Liverpool MX UI label is Spanish. */
  colorFilter: {
    challengeLabel: 'White',
    uiLabel: 'Blanco',
  },
  sortByLowestPriceLabel: 'Menor precio',
  resultsCount: 5,
  minUiResultsInApiResponse: 3,
  plpSearchPath: '/api/plp/search',
  /** Bonus: max time (ms) from home load to search results grid visible. */
  maxSearchResultsLoadMs: Number(process.env.MAX_LOAD_MS ?? 45_000),
} as const;
