/* ===================== Config ===================== */
/**
 * AdBook+ Revenue Review — Configuration
 * ---------------------------------------
 * All tunables live here or in the "Config" sheet tab (which wins if set).
 * Nothing in this project sends data outside your Google Workspace.
 */

/**
 * PROFILE SWITCH
 * One codebase, two reports. The profile decides the headline KPI, the derived columns, the Review
 * pivot rows, labels and which web-app renderer is used. The Settings key "Report profile" overrides
 * this constant; leave the key blank to use the code default below.
 *   talent → Talent Revenue Review (Adjusted Blended Revenue, fee types, niches)
 *   print  → Print Yield Review   (Adjusted Earned Blended Revenue, yield, pages, page categories)
 */
const DEFAULT_PROFILE = 'print';

const PROFILES = {
  talent: {
    key: 'talent', title: 'Talent Revenue Review', menu: 'Talent Revenue', shortTitle: 'Talent Revenue',
    kpiCol: 'Adjusted Blended Revenue', reviewMeasure: 'Adjusted Blended Revenue',
    reviewDims: [{ col: 'IO Status', label: 'IO Status' }, { col: '(Drop) Job Code (limit 6 characters)', label: '(Drop) Job Code (limit 6 characters)' }, { col: 'Drop ID', label: 'Drop ID' }, { col: 'Fee Type', label: 'Fee Type' }, { col: 'Campaign Name', label: 'Campaign Name' }],
    reviewWidths: [260, 130, 100, 160, 300],
    derived: ['Region', 'Period', 'Fee Type', 'Niche', 'FX Currency', 'FX Rate', 'Billing Complete', 'Billed Revenue'],
    money: ['Adjusted Blended Revenue', 'Billed Revenue', 'Actual Billed Amount', 'Adjusted Billable Revenue', 'Adjusted Earned Blended Revenue', 'Pro-rata Revenue', 'Earned Blended Revenue'],
    changeMoney: ['Adjusted Blended Revenue', 'Adjusted Billable Revenue', 'Actual Billed Amount'],
    nicheLabel: 'Niche', feeLabel: 'Fee type', marketFilePrefix: 'AdBook+ Revenue – ',
  },
  print: {
    key: 'print', title: 'Print Yield Review', menu: 'Print Yield', shortTitle: 'Print Yield',
    kpiCol: 'Adjusted Earned Blended Revenue', reviewMeasure: 'Adjusted Earned Blended Revenue',
    reviewDims: [{ col: '(Drop) WD Platform', label: 'WD Platform' }, { col: 'Niche', label: 'Brand' }, { col: 'Path 2', label: 'Path 2' }, { col: 'Path 4', label: 'Book (Path 4)' }, { col: 'Page Cat', label: 'Page Cat' }, { col: 'Position Path', label: 'Position Path' }, { col: 'Campaign ID', label: 'Campaign ID' }],
    reviewWidths: [120, 160, 80, 150, 160, 360, 110],
    derived: ['Region', 'Period', 'Fee Type', 'Niche', 'FX Currency', 'FX Rate', 'Billing Complete', 'Billed Revenue',
              'Book', 'Page Cat', 'Page Cat Group', 'Commercial Term', 'Qualifier', 'Pages', 'Insert', 'Insert Weight (g)', 'Insert Pages',
              'Earned Fraction', 'Gross Earned Blended Revenue', 'Rate Card Earned', 'Adjusted Rate Card Earned', 'Space Check', 'Issue Label',
              'Commission Earned', 'Contract Discount Earned', 'Client Discount Earned', 'Tier Adjustment Earned', 'Discount Band', 'Channel',
              'Priced Earned', 'Rate Card Source', 'Brand Family'],
    money: ['Adjusted Earned Blended Revenue', 'Adjusted Blended Revenue', 'Billed Revenue', 'Actual Billed Amount', 'Adjusted Billable Revenue', 'Pro-rata Revenue', 'Earned Blended Revenue',
            'Gross Earned Blended Revenue', 'Current Rate Card Price', '(Drop) Adjusted Rate Card', 'Price', 'Rate Card Earned', 'Adjusted Rate Card Earned',
            'Commission Earned', 'Contract Discount Earned', 'Client Discount Earned', 'Tier Adjustment Earned', 'Priced Earned'],
    changeMoney: ['Adjusted Earned Blended Revenue', 'Gross Earned Blended Revenue', 'Current Rate Card Price', 'Adjusted Billable Revenue'],
    nicheLabel: 'Brand', feeLabel: 'Ad size', marketFilePrefix: 'Print Yield – ',
  },
};

/** The active profile object (Settings key wins over DEFAULT_PROFILE). */
function profile_() { return PROFILES[getConfig().profile] || PROFILES[DEFAULT_PROFILE] || PROFILES.talent; }
function isPrint_() { return profile_().key === 'print'; }
/** Derived columns appended to the canonical set for the active profile. */
function derivedCols_() { return profile_().derived; }
/** Money measures that get a converted twin for the active profile. */
function moneyMeasures_() { return profile_().money; }
function reviewDims_() { return profile_().reviewDims; }
function reviewMeasure_() { return profile_().reviewMeasure; }

const CFG = {
  SHEETS: {
    RAW: 'Raw',              // paste the AdBook+ export here (option 2)
    DATA: 'Data',            // cleaned, filtered canonical dataset (script-owned)
    PIVOTS: 'Pivots',        // QUERY-driven summary tables that feed the charts
    DASH: 'Dashboard',       // visual dashboard
    CONFIG: 'Config',        // settings: Drive folder, reviewers, uploaders
    LOG: 'Import Log',       // audit trail of every import
  },

  // Headline KPI and companion metrics
  KPI_COL: 'Adjusted Blended Revenue',
  BILLED_COL: 'Billed Revenue',            // derived: Adjusted Billable Revenue of lines whose Billing Status counts as billed (Settings)
  ADBOOK_BILLED_COL: 'Actual Billed Amount', // AdBook's own figure, kept for reconciliation
  BILLABLE_COL: 'Adjusted Billable Revenue',
  EARNED_COL: 'Earned Blended Revenue',

  // Geography = text before the first "|" in Position Path (e.g. "US NYC | ...")
  REGION_SOURCE_COL: 'Position Path',
  REGION_DELIM: '|',
  REGION_FALLBACK: 'Unassigned',

  // Derived columns per profile: see PROFILES[*].derived / derivedCols_(). (CFG.DERIVED kept for old callers = Talent list)
  DERIVED: ['Region', 'Period', 'Fee Type', 'Niche', 'FX Currency', 'FX Rate', 'Billing Complete', 'Billed Revenue'],
  // Print profile sources
  BRAND_SRC: 'Path 3', BOOK_SRC: 'Path 4', PAGECAT_SRC: 'Path 5', QUALIFIER_SRC: 'Path 6',
  AD_SIZE_COL: '(Drop) Print Ad Size', PRINT_PAGE_COL: '(Drop) Print Page', ACTUAL_SPACE_COL: '(Drop) Actual Space',
  PAGECAT_DEFAULT: 'Standard', PAGECAT_UNCLASSIFIED: 'Unclassified', GROUP_INSERT: 'Insert', GROUP_HOUSE: 'House Ad', GROUP_STANDARD: 'Standard',
  NICHE_SRC_EU: '(Campaign) SSG Category',                  // European niche source
  NICHE_SRC_US: 'Campaign Name', NICHE_US_DELIM: '-',        // US niche = text before the first "-" in Campaign Name
  FEE_INTERNAL: /internal/i, FEE_EXTERNAL: /external/i,   // how Fee Type values are classified for the European KPI cards
  US_FEE_OTHER: 'Other US fee',                             // label for US lines whose fee type is not in the configured list

  // Money measures per profile: see PROFILES[*].money / moneyMeasures_(). (Talent list kept here for old callers)
  MONEY_MEASURES: ['Adjusted Blended Revenue', 'Billed Revenue', 'Actual Billed Amount', 'Adjusted Billable Revenue',
                   'Adjusted Earned Blended Revenue', 'Pro-rata Revenue', 'Earned Blended Revenue'],
  FX_SHEET: 'FX Rates',

  // Data range used by QUERY formulas (wide enough for canonical + derived)
  DATA_RANGE: 'A:DZ',

  // Columns coerced to numbers (currency symbols, commas, (negatives) stripped)
  NUMERIC_COLS: [
    '(Drop) Agy Commission (DE)', '(Drop) Discount - Client 1', '(Drop) Discount - Client 2',
    '(Drop) Discount - Contract', '(Drop) Discount - Special', 'Campaign Goals', 'Impressions Sold',
    'Price', 'Initial Rate Card Price', 'Current Rate Card Price', '(Drop) Adjusted Rate Card',
    'Actual Billed Amount', 'Adjusted Billable Revenue', 'Adjusted Blended Revenue',
    'Adjusted Earned Blended Revenue', 'Pro-rata Revenue', 'Earned Blended Revenue',
    'Sold Amount', 'Gross Adjusted Blended Revenue', 'Gross Adjusted Billable Revenue', 'Agency Commission%', 'Custom Revenue', '(Drop) Internal Cost',
    '(Drop) Actual Space', '(Inventory Issue) Issue Number', '(Inventory Issue) Issue Year',
  ],

  // Columns coerced to dates when parseable
  DATE_COLS: [
    'Report Run Date', 'Report Start Date', 'Report End Date', 'Campaign Start Date',
    'Campaign End Date', 'Start Date', 'End Date', '(Inventory Issue) Cover Date',
    '(Inventory Issue) Deadline Date', '(Inventory Issue) Publishing Date',
  ],

  // Canonical column list — every import is filtered and re-ordered to exactly this.
  CANONICAL_COLUMNS: [
    'Report Run Date', 'Report Start Date', 'Report End Date', 'Month', 'Year', 'IO Status',
    'Campaign ID', 'Campaign Name', 'Agency Name', 'Client Name', '(Campaign) Commercial Agency',
    'Campaign Start Date', 'Campaign End Date', 'Start Date', 'End Date', 'Drop ID',
    '(Campaign) Client Brand', 'Virtual Site', 'Bill Type', '(Campaign) Billable Status', 'Billing',
    '(Campaign) Billing Type', 'Billing Status', '(Drop) Billing Type', '(Campaign) Order Source',
    'Position ID', 'Position Path', 'Path 1', 'Path 2', 'Path 3', 'Path 4', 'Path 5', 'Path 6',
    'Position', 'Position Name', 'Package Drop ID', 'Package Level', 'Package Position ID',
    'Package Position Path', '(Campaign) Campaign DFP Delivery Status', '(Campaign) Salesforce Status',
    '(Campaign) SSG Category', '(Campaign) SSG Sub-Category', '(Drop) Assoc to Branded Content',
    '(Drop) Assoc to Event', '(Drop) Associated to Event', '(Drop) Branded Content',
    '(Drop) Client Product Name', '(Drop) Custom Solution', '(Drop) Event Filter',
    '(Drop) Inventory Base', '(Drop) Job Code (limit 6 characters)', '(Drop) Media Category',
    '(Drop) Parent Site', '(Drop) Rate Card Pricing', '(Drop) SSG Platform', '(Drop) SSG Sub-Platform',
    '(Position) DFP Inventory Size', '(Position) Inventory Package', '(Position) SSG Platform',
    '(Position) SSG Sub-Platform', '(Position) Tentpole Event', 'Current Rate Card Name',
    'Current Rate Card Price Type', 'Media Name', 'Media Type', 'Price Type', 'Sales Rep',
    'SSG Account Strategy', 'Third Party Ad Server', '(Position) DFP Inventory Size Type',
    '(Drop) Issue', '(Inventory Issue) Cover Date', '(Inventory Issue) Deadline Date',
    '(Inventory Issue) Issue Number', '(Inventory Issue) Issue Year', '(Inventory Issue) Publishing Date',
    '(Drop) Print Ad Size', '(Drop) Print Page', '(Drop) Print Section', '(Drop) Actual Space',
    '(Drop) WD Cost Center', '(Drop) WD Platform', '(Inventory Issue) WD Product',
    '(Drop) WD Revenue Category', '(Drop) WD Rev Cat Custom', '(Drop) WD Rev Cat Contra',
    '(Drop) WD Rev Cat Contra Custom', '(Drop) Agy Commission (DE)', '(Drop) Discount - Client 1',
    '(Drop) Discount - Client 2', '(Drop) Discount - Contract', '(Drop) Discount - Special',
    'Campaign Goals', 'Impressions Sold', 'Price', 'Initial Rate Card Price', 'Current Rate Card Price',
    '(Drop) Adjusted Rate Card', 'Actual Billed Amount', 'Adjusted Billable Revenue',
    'Adjusted Blended Revenue', 'Adjusted Earned Blended Revenue', 'Pro-rata Revenue',
    'Earned Blended Revenue', 'Currency', 'Campaign Exchange Rate',
    // Extra AdBook+ fields retained for reconciliation (dropped silently if absent)
    'Client ID', 'Agency ID', 'IO Number', 'Sold Amount', 'Gross Adjusted Blended Revenue', 'Gross Adjusted Billable Revenue',
    'Agency Commission%', 'Currency Conversion', 'Custom Revenue', '(Drop) WD Company', '(Drop) Internal Cost',
  ],
};

/** Keys read from the Config sheet (column A = key, column B = value). */
const CONFIG_KEYS = {
  DRIVE_FOLDER_ID: 'Drive folder ID',
  REVIEWERS: 'Reviewer emails (comma-separated, blank = anyone in domain)',
  UPLOADERS: 'Uploader emails (comma-separated, blank = owner only)',
  ARCHIVE_FOLDER_ID: 'Archive folder ID (optional — processed files move here)',
  KPI_OVERRIDE: 'Headline KPI column (optional override)',
  MARKET_FILES: 'Generate market files on import (yes/no)',
  MARKET_FOLDER_ID: 'Market files folder ID (blank = same as Drive folder)',
  MARKET_VIEWERS: 'Market viewers (Region=email1,email2; Region2=email3)',
  REPORT_CURRENCY: 'Reporting currency (e.g. EUR)',
  NUMBER_FORMAT: 'Number format (0 = plain, #,##0 = thousands, #,##0.00 = decimals)',
  MARKET_CURRENCIES: 'Market currencies (Region=GBP; Region2=USD — others use the reporting currency)',
  LOGO: 'Logo for the web app (optional: a data:image/png;base64,... string)',
  BILLED_STATUS: 'Billing Status values that count as billed (comma-separated)',
  SHEET_YEARS: 'Sheet reporting year(s) (blank = all years; e.g. 2026 or 2026, 2027)',
  CHARTS: 'Charts in Google Sheets (dashboard / all / none)',
  NOTIFY: 'Notification emails for the nightly job (comma-separated)',
  DIGEST: 'Digest recipients — daily changes email (comma-separated)',
  DIGEST_MODE: 'Digest detail (summary / full)',
  US_PREFIX: 'Position Path first segment that means the US market (e.g. Conde Nast)',
  US_MARKET: 'Name of the US market (e.g. CN US)',
  US_FEES: 'US fee types shown as separate KPI tiles (comma-separated, exact last segment)',
  BLANK_AGENCY: 'Blank Agency Name label',
  BLANK_PLATFORM: 'Blank SSG Platform label',
  // ---- Profile + Print Yield settings (labels must not share a prefix with any other label)
  PROFILE: 'Report profile (talent / print; blank = code default)',
  DEFAULT_IO: 'Default IO Status filter in the web app (blank = all)',   // print: also the scope of the Sheets tabs, deck, digest and Excel
  YIELD_BASIS: 'Yield basis default (gross / ratecard / adjratecard)',
  GROSS_COMMISSION: 'Gross earned includes agency commission (yes/no)',
  COMMISSION_MODE: 'Agency commission column is (amount / percent)',
  PAGE_FACTORS: 'Page factors per Print Ad Size (Size=pages; …)',
  INSERT_SIZES: 'Insert ad sizes (comma-separated — counted as inserts, not pages)',
  PAGECAT_GROUPS: 'Page category groups (one per line: Group = regex)',
  BRAND_FAMILIES: 'Brand family overrides (one per line: Family = regex on Parent Site / Brand; blank = derive from "XX - Brand")',
  TERM_PATTERN: 'Commercial-term values in Path 5 (regex → Page Cat Group Standard)',
  HOUSE_EXCLUDE: 'Exclude house ads from yield and revenue per page (yes/no)',
  POLICY_TIERS: 'Rate card tiers that are pricing policy, not negotiation (between rate card and gross; e.g. 0, 5)',
  REGIONAL_PRORATA: 'Regional split-run pages pro-rata by percent (yes/no)',
  DISCOUNT_BANDS: 'Discount depth bands, upper limits in % (e.g. 25, 50, 70)',
  BRAND_NAME: 'Company name shown on the web page and exports',
  CREDIT_LINE: 'Credit line shown under the title (web, Dashboard, Excel)',
};

/** Default values written when a key is missing from the Config tab. */
const CONFIG_DEFAULTS = {
  [CONFIG_KEYS.MARKET_FILES]: 'yes',
  [CONFIG_KEYS.BILLED_STATUS]: 'Complete',
  [CONFIG_KEYS.CHARTS]: 'dashboard',
  [CONFIG_KEYS.DIGEST_MODE]: 'summary',
  [CONFIG_KEYS.US_PREFIX]: 'Conde Nast',
  [CONFIG_KEYS.US_MARKET]: 'CN US',
  [CONFIG_KEYS.US_FEES]: 'EIC or EL Talent Fee, Talent Fee, Tentpole Talent Fee',
  [CONFIG_KEYS.BLANK_AGENCY]: 'Booked direct',
  [CONFIG_KEYS.BLANK_PLATFORM]: 'Business Services',
  [CONFIG_KEYS.REPORT_CURRENCY]: 'EUR',
  [CONFIG_KEYS.NUMBER_FORMAT]: '#,##0',
  [CONFIG_KEYS.PROFILE]: '',
  [CONFIG_KEYS.DEFAULT_IO]: 'Order Ready for Flighting',
  [CONFIG_KEYS.YIELD_BASIS]: 'gross',
  [CONFIG_KEYS.GROSS_COMMISSION]: 'yes',
  [CONFIG_KEYS.COMMISSION_MODE]: 'amount',
  [CONFIG_KEYS.PAGE_FACTORS]: 'Single Page=1; Simple Page=1; Double Page=2; Double Page Spread=2; Thick Page Recto Verso 2 Page=2; Three Quarters=0.75; Half Page=0.5; Half Page Horizontal=0.5; Half Page Vertical=0.5; One Third=0.333; One Third Page=0.333; Quarter Page=0.25; Gatefold=4; Gatefold 4 pages=4; Gatefold 6 pages=6; Reverse Gatefold=2; Non Standard=0',
  [CONFIG_KEYS.INSERT_SIZES]: 'Loose, Bound-In, Tip-On',
  [CONFIG_KEYS.PAGECAT_GROUPS]: [
    'House Ad = house ad',
    'Cover = ^cover|os reversed|outside back|inside (front|back)',
    'Premium spread = ^dps\\b|^spread \\d|^\\d+(st|nd|rd|th) double|^opening|premium|^double opening',
    'Regional split = \\d+ ?percent',
    'Advertorial = advertorial|promotion|special ops',
    'Negotiated placement = specified position|bespoke',
    'Editorial adjacency = ^(facing|before|after|between) |\\d+(st|nd|rd|th) (recto|part)|^1st part|section rubrique|tunnel|the face|pre-well|editors letter|^contents?( \\d.*)?$|contributors|masthead|^content \\d|^watch \\d|beauty 1st|car 1st|jewellery 1st|^editorial$',
    'Standard = ^standard$|run of paper|^\\d+ campaign$|special rates|special trading|classified|^drop$',
  ].join('\n'),
  [CONFIG_KEYS.TERM_PATTERN]: '^\\d+ campaign$|special rates|special trading|classified|^drop$',
  [CONFIG_KEYS.HOUSE_EXCLUDE]: 'yes',
  [CONFIG_KEYS.POLICY_TIERS]: '0, 5',
  [CONFIG_KEYS.REGIONAL_PRORATA]: 'no',
  [CONFIG_KEYS.DISCOUNT_BANDS]: '25, 50, 70',
  [CONFIG_KEYS.BRAND_NAME]: '',
  [CONFIG_KEYS.CREDIT_LINE]: 'Built by Bangalore Controllership Operations',
};

let CONFIG_CACHE_ = null;

/** Reads the Config sheet into a plain object. Creates the sheet and any missing keys if needed. */
function getConfig() {
  if (CONFIG_CACHE_) return CONFIG_CACHE_;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CFG.SHEETS.CONFIG);
  if (!sh) sh = createConfigSheet_(ss);
  ensureConfigKeys_(sh);
  const rows = sh.getRange(1, 1, Math.max(sh.getLastRow(), 1), 2).getValues();
  // Loose matching: a label only needs to START with the key phrase (case-insensitive),
  // so "Drive folder ID", "drive folder id:" or "Drive folder ID (main)" all work.
  // Value is read from column B; if B is blank and the next row's A is not another label,
  // that cell is used instead (tolerates "value under the label" layouts).
  const labels = Object.values(CONFIG_KEYS).map(k => k.toLowerCase().split('(')[0].trim());
  const isLabel = v => { const t = String(v || '').toLowerCase().trim(); return !t || t === 'notes' || t.startsWith('•') || labels.some(l => t.startsWith(l)); };
  const isMissing = key => { const k = key.toLowerCase().split('(')[0].trim(); return rows.findIndex(r => String(r[0] || '').toLowerCase().trim().startsWith(k)) < 0; };
  const find = key => {
    const k = key.toLowerCase().split('(')[0].trim();
    const i = rows.findIndex(r => String(r[0] || '').toLowerCase().trim().startsWith(k));
    if (i < 0) return '';
    const b = String(rows[i][1] || '').trim();
    if (b) return b;
    const below = rows[i + 1] ? rows[i + 1][0] : '';
    return isLabel(below) ? '' : String(below).trim();
  };
  const profKey = (find(CONFIG_KEYS.PROFILE) || DEFAULT_PROFILE).toLowerCase().trim();
  const prof = PROFILES[profKey] || PROFILES[DEFAULT_PROFILE] || PROFILES.talent;
  const yn = (v, dflt) => { const t = String(v || '').trim().toLowerCase(); return t ? /^(y|yes|true|1)$/.test(t) : dflt; };
  const out = {
    profile: prof.key,
    defaultIoStatus: isMissing(CONFIG_KEYS.DEFAULT_IO) ? CONFIG_DEFAULTS[CONFIG_KEYS.DEFAULT_IO] : find(CONFIG_KEYS.DEFAULT_IO).trim(),
    yieldBasis: (['gross', 'ratecard', 'adjratecard'].includes((find(CONFIG_KEYS.YIELD_BASIS) || 'gross').toLowerCase().trim()) ? (find(CONFIG_KEYS.YIELD_BASIS) || 'gross').toLowerCase().trim() : 'gross'),
    grossIncludesCommission: yn(find(CONFIG_KEYS.GROSS_COMMISSION), true),
    commissionMode: /^per/i.test(find(CONFIG_KEYS.COMMISSION_MODE) || '') ? 'percent' : 'amount',
    pageFactors: parsePageFactors_(find(CONFIG_KEYS.PAGE_FACTORS) || CONFIG_DEFAULTS[CONFIG_KEYS.PAGE_FACTORS]),
    insertSizes: String(find(CONFIG_KEYS.INSERT_SIZES) || CONFIG_DEFAULTS[CONFIG_KEYS.INSERT_SIZES]).split(',').map(x => x.trim().toLowerCase()).filter(Boolean),
    pageCatGroups: parsePageCatGroups_(find(CONFIG_KEYS.PAGECAT_GROUPS) || CONFIG_DEFAULTS[CONFIG_KEYS.PAGECAT_GROUPS]),
    termPattern: safeRegex_(find(CONFIG_KEYS.TERM_PATTERN) || CONFIG_DEFAULTS[CONFIG_KEYS.TERM_PATTERN]),
    houseExclude: yn(find(CONFIG_KEYS.HOUSE_EXCLUDE), true),
    brandFamilies: parsePageCatGroups_(find(CONFIG_KEYS.BRAND_FAMILIES) || ''),
    policyTiers: String(find(CONFIG_KEYS.POLICY_TIERS) || CONFIG_DEFAULTS[CONFIG_KEYS.POLICY_TIERS]).split(/[,;\s]+/).map(x => parseInt(x, 10)).filter(x => !isNaN(x)),
    discountBands: String(find(CONFIG_KEYS.DISCOUNT_BANDS) || CONFIG_DEFAULTS[CONFIG_KEYS.DISCOUNT_BANDS]).split(/[,;\s]+/).map(Number).filter(x => x > 0 && x < 100).sort((a, b) => a - b),
    brandName: (find(CONFIG_KEYS.BRAND_NAME) || '').trim(),
    creditLine: isMissing(CONFIG_KEYS.CREDIT_LINE) ? CONFIG_DEFAULTS[CONFIG_KEYS.CREDIT_LINE] : (find(CONFIG_KEYS.CREDIT_LINE) || '').trim(),
    regionalProrata: yn(find(CONFIG_KEYS.REGIONAL_PRORATA), false),
    driveFolderId: extractDriveId_(find(CONFIG_KEYS.DRIVE_FOLDER_ID)),
    archiveFolderId: extractDriveId_(find(CONFIG_KEYS.ARCHIVE_FOLDER_ID)),
    reviewers: splitEmails_(find(CONFIG_KEYS.REVIEWERS)),
    uploaders: splitEmails_(find(CONFIG_KEYS.UPLOADERS)),
    kpiCol: find(CONFIG_KEYS.KPI_OVERRIDE) || prof.kpiCol,
    marketFiles: /^(y|yes|true|1)$/i.test(find(CONFIG_KEYS.MARKET_FILES) || 'yes'),
    marketFolderId: extractDriveId_(find(CONFIG_KEYS.MARKET_FOLDER_ID)),
    marketViewers: parseMarketViewers_(find(CONFIG_KEYS.MARKET_VIEWERS)),
    reportingCurrency: (find(CONFIG_KEYS.REPORT_CURRENCY) || 'EUR').toUpperCase(),
    numberFormat: find(CONFIG_KEYS.NUMBER_FORMAT) || '#,##0',
    marketCurrencies: parseMarketCurrencies_(find(CONFIG_KEYS.MARKET_CURRENCIES)),
    logo: find(CONFIG_KEYS.LOGO),
    billedStatuses: String(find(CONFIG_KEYS.BILLED_STATUS) || 'Complete').split(',').map(x => x.trim().toLowerCase()).filter(Boolean),
    charts: (find(CONFIG_KEYS.CHARTS) || 'dashboard').toLowerCase().trim(),
    notify: splitEmails_(find(CONFIG_KEYS.NOTIFY)),
    digest: splitEmails_(find(CONFIG_KEYS.DIGEST)),
    digestMode: (find(CONFIG_KEYS.DIGEST_MODE) || 'summary').toLowerCase().trim() === 'full' ? 'full' : 'summary',
    usPrefix: (find(CONFIG_KEYS.US_PREFIX) || 'Conde Nast').trim(),
    usMarket: (find(CONFIG_KEYS.US_MARKET) || 'CN US').trim(),
    usFees: String(find(CONFIG_KEYS.US_FEES) || 'EIC or EL Talent Fee, Talent Fee, Tentpole Talent Fee').split(',').map(x => x.trim()).filter(Boolean),
    blankAgency: (find(CONFIG_KEYS.BLANK_AGENCY) || 'Booked direct').trim(),
    blankPlatform: ((find(CONFIG_KEYS.BLANK_PLATFORM) || 'Business Services').trim().toLowerCase() === 'business services' ? 'Business Services' : find(CONFIG_KEYS.BLANK_PLATFORM).trim()),
    sheetYears: String(find(CONFIG_KEYS.SHEET_YEARS) || '').split(/[,;\s]+/).map(x => x.trim()).filter(x => /^\d{4}$/.test(x)),
    raw: Object.keys(CONFIG_KEYS).reduce((o, k) => { o[k] = find(CONFIG_KEYS[k]); return o; }, {}),
  };
  CONFIG_CACHE_ = out;
  return out;
}

/** Adds any missing setting rows (with defaults) above the Notes block, never touching existing values. */
function ensureConfigKeys_(sh) {
  const last = Math.max(sh.getLastRow(), 1);
  const labels = sh.getRange(1, 1, last, 1).getValues().map(r => String(r[0] || '').toLowerCase().trim());
  const has = key => { const k = key.toLowerCase().split('(')[0].trim(); return labels.some(l => l.startsWith(k)); };
  const missing = Object.values(CONFIG_KEYS).filter(k => !has(k));
  if (!missing.length) return;
  let notesRow = labels.findIndex(l => l === 'notes') + 1;   // 0 if none
  const insertAt = notesRow ? notesRow : last + 1;
  if (notesRow) sh.insertRowsBefore(notesRow, missing.length + 1);
  sh.getRange(insertAt, 1, missing.length, 2).setValues(missing.map(k => [k, CONFIG_DEFAULTS[k] || ''])).setFontWeight('bold');
  sh.getRange(insertAt, 2, missing.length, 1).setFontWeight('normal');
}

/** Writes a value for a key (row is created if missing). */
function setConfigValue_(sh, key, value) {
  const last = Math.max(sh.getLastRow(), 1);
  const labels = sh.getRange(1, 1, last, 1).getValues().map(r => String(r[0] || '').toLowerCase().trim());
  const k = key.toLowerCase().split('(')[0].trim();
  let i = labels.findIndex(l => l.startsWith(k));
  if (i < 0) { ensureConfigKeys_(sh); return setConfigValue_(sh, key, value); }
  sh.getRange(i + 1, 2).setValue(value);
}

/* ------------------------------------------------------------------ */
/* Settings sidebar                                                    */
/* ------------------------------------------------------------------ */

function openSettings() {
  const html = HtmlService.createHtmlOutputFromFile('Settings').setTitle(`${profile_().title} — Settings`).setWidth(440);
  SpreadsheetApp.getUi().showSidebar(html);
}

/** Everything the settings form needs. */
function getSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cfg = getConfig();
  // regions present in Data
  const regions = [];
  const data = ss.getSheetByName(CFG.SHEETS.DATA);
  const cubeMeta = isPrint_() ? cubeMeta_(ss) : null;   // print: the cube already knows markets, IO statuses, currencies, years — no Data reads
  if (cubeMeta) (cubeMeta.dict[2] || []).forEach(r => regions.push(r));
  else if (data && data.getLastRow() > 1) {
    const h = data.getRange(1, 1, 1, data.getLastColumn()).getValues()[0];
    const i = h.indexOf('Region');
    if (i >= 0) new Set(data.getRange(2, i + 1, data.getLastRow() - 1, 1).getValues().map(r => String(r[0])).filter(Boolean)).forEach(r => regions.push(r));
  }
  regions.sort();
  // FX rows
  const fx = [];
  const fxSh = ss.getSheetByName(CFG.FX_SHEET);
  if (fxSh) { const pb = readFxToBase_(fxSh, cfg.reportingCurrency); Object.keys(pb).forEach(c => { if (c !== cfg.reportingCurrency) fx.push({ code: c, rate: pb[c] }); }); }
  Object.values(cfg.marketCurrencies).forEach(c => { if (c !== cfg.reportingCurrency && !fx.some(x => x.code === c)) fx.push({ code: c, rate: '' }); });
  const dataCurrencies = new Set();
  if (cubeMeta) (cubeMeta.currencies || []).forEach(c => dataCurrencies.add(c));
  else if (data && data.getLastRow() > 1) {
    const h = data.getRange(1, 1, 1, data.getLastColumn()).getValues()[0];
    const ic = h.indexOf('FX Currency');
    if (ic >= 0) data.getRange(2, ic + 1, data.getLastRow() - 1, 1).getValues().forEach(r => { const c = String(r[0] || '').toUpperCase().trim(); if (c) dataCurrencies.add(c); });
  }
  return {
    dataCurrencies: Array.from(dataCurrencies).sort(),
    reportingCurrency: cfg.reportingCurrency, numberFormat: cfg.numberFormat,
    driveFolder: cfg.raw.DRIVE_FOLDER_ID, archiveFolder: cfg.raw.ARCHIVE_FOLDER_ID, marketFolder: cfg.raw.MARKET_FOLDER_ID,
    reviewers: cfg.raw.REVIEWERS, uploaders: cfg.raw.UPLOADERS, kpi: cfg.raw.KPI_OVERRIDE,
    marketFiles: cfg.marketFiles, marketViewers: cfg.raw.MARKET_VIEWERS, logo: cfg.logo, billedStatus: cfg.raw.BILLED_STATUS || 'Complete', sheetYears: cfg.raw.SHEET_YEARS || '', charts: cfg.charts, notify: cfg.raw.NOTIFY || '', digest: cfg.raw.DIGEST || '', digestMode: cfg.digestMode, usPrefix: cfg.usPrefix, usMarket: cfg.usMarket, usFees: cfg.usFees.join(', '), blankAgency: cfg.blankAgency, blankPlatform: cfg.blankPlatform,
    yearsInData: cubeMeta ? Array.from(new Set((cubeMeta.dict[8] || []).map(p => String(p).slice(0, 4)).filter(y => /^\d{4}$/.test(y)))).sort() : yearsInData_(),
    buildStatus: isPrint_() ? buildStatus_() : null,
    regions: regions.map(r => ({ name: r, currency: cfg.marketCurrencies[r.toLowerCase()] || '' })),
    fx, hasData: regions.length > 0,
    // profile + print
    profile: cfg.profile, profileSetting: cfg.raw.PROFILE || '', defaultProfile: DEFAULT_PROFILE, profileTitle: profile_().title,
    defaultIoStatus: cfg.defaultIoStatus, yieldBasis: cfg.yieldBasis, grossIncludesCommission: cfg.grossIncludesCommission, commissionMode: cfg.commissionMode,
    pageFactors: cfg.raw.PAGE_FACTORS || CONFIG_DEFAULTS[CONFIG_KEYS.PAGE_FACTORS], insertSizes: cfg.raw.INSERT_SIZES || CONFIG_DEFAULTS[CONFIG_KEYS.INSERT_SIZES],
    pageCatGroups: cfg.raw.PAGECAT_GROUPS || CONFIG_DEFAULTS[CONFIG_KEYS.PAGECAT_GROUPS], termPattern: cfg.raw.TERM_PATTERN || CONFIG_DEFAULTS[CONFIG_KEYS.TERM_PATTERN],
    houseExclude: cfg.houseExclude, regionalProrata: cfg.regionalProrata, discountBands: cfg.discountBands.join(', '), brandName: cfg.brandName, creditLine: cfg.creditLine, policyTiers: cfg.policyTiers.join(', '), brandFamilies: cfg.raw.BRAND_FAMILIES || '',
    ioStatuses: cubeMeta ? (cubeMeta.dict[1] || []).slice().sort() : distinctValues_('IO Status'),
  };
}

/** Distinct values of a Data column (sorted), for Settings pickers. */
function distinctValues_(col) {
  const d = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.SHEETS.DATA);
  if (!d || d.getLastRow() < 2) return [];
  const h = d.getRange(1, 1, 1, d.getLastColumn()).getValues()[0]; const i = h.indexOf(col); if (i < 0) return [];
  return Array.from(new Set(d.getRange(2, i + 1, d.getLastRow() - 1, 1).getValues().map(r => String(r[0] || '').trim()).filter(Boolean))).sort();
}

/** "Single Page=1; Double Page Spread=2" → { 'single page': 1, ... } */
function parsePageFactors_(s) {
  const out = {};
  String(s || '').split(/[;\n]/).forEach(part => { const i = part.indexOf('='); if (i < 0) return; const k = part.slice(0, i).trim().toLowerCase(), v = Number(String(part.slice(i + 1)).trim().replace(',', '.')); if (k && !isNaN(v)) out[k] = v; });
  return out;
}
/** "Group = regex" lines → [{ group, re }] in order. Invalid regexes are skipped. */
function parsePageCatGroups_(s) {
  const out = [];
  String(s || '').split(/\n/).forEach(line => { const i = line.indexOf('='); if (i < 0) return; const g = line.slice(0, i).trim(), re = safeRegex_(line.slice(i + 1).trim()); if (g && re) out.push({ group: g, re }); });
  return out;
}
function safeRegex_(src) { try { return src ? new RegExp(src, 'i') : null; } catch (e) { return null; } }

/** Saves the form. Returns a short status. */
function saveSettings(f) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CFG.SHEETS.CONFIG) || createConfigSheet_(ss);
  const set = (k, v) => setConfigValue_(sh, CONFIG_KEYS[k], v == null ? '' : String(v).trim());
  set('DRIVE_FOLDER_ID', f.driveFolder); set('ARCHIVE_FOLDER_ID', f.archiveFolder); set('MARKET_FOLDER_ID', f.marketFolder);
  set('REVIEWERS', f.reviewers); set('UPLOADERS', f.uploaders); set('KPI_OVERRIDE', f.kpi);
  set('REPORT_CURRENCY', (f.reportingCurrency || 'EUR').toUpperCase()); set('NUMBER_FORMAT', f.numberFormat || '#,##0');
  set('MARKET_FILES', f.marketFiles ? 'yes' : 'no'); set('MARKET_VIEWERS', f.marketViewers); if (f.logo !== undefined) set('LOGO', f.logo); if (f.billedStatus !== undefined) set('BILLED_STATUS', f.billedStatus || 'Complete'); if (f.sheetYears !== undefined) set('SHEET_YEARS', f.sheetYears); if (f.charts !== undefined) set('CHARTS', f.charts || 'dashboard'); if (f.notify !== undefined) set('NOTIFY', f.notify); if (f.digest !== undefined) set('DIGEST', f.digest); if (f.digestMode !== undefined) set('DIGEST_MODE', f.digestMode || 'summary');
  if (f.usPrefix !== undefined) set('US_PREFIX', f.usPrefix || 'Conde Nast'); if (f.usMarket !== undefined) set('US_MARKET', f.usMarket || 'CN US'); if (f.usFees !== undefined) set('US_FEES', f.usFees);
  if (f.blankAgency !== undefined) set('BLANK_AGENCY', f.blankAgency || 'Booked direct'); if (f.blankPlatform !== undefined) set('BLANK_PLATFORM', f.blankPlatform || 'Business Services');
  if (f.profileSetting !== undefined) set('PROFILE', f.profileSetting);
  if (f.defaultIoStatus !== undefined) set('DEFAULT_IO', f.defaultIoStatus); if (f.yieldBasis !== undefined) set('YIELD_BASIS', f.yieldBasis || 'gross');
  if (f.grossIncludesCommission !== undefined) set('GROSS_COMMISSION', f.grossIncludesCommission ? 'yes' : 'no'); if (f.commissionMode !== undefined) set('COMMISSION_MODE', f.commissionMode || 'amount');
  if (f.pageFactors !== undefined) set('PAGE_FACTORS', f.pageFactors || CONFIG_DEFAULTS[CONFIG_KEYS.PAGE_FACTORS]); if (f.insertSizes !== undefined) set('INSERT_SIZES', f.insertSizes || CONFIG_DEFAULTS[CONFIG_KEYS.INSERT_SIZES]);
  if (f.pageCatGroups !== undefined) set('PAGECAT_GROUPS', f.pageCatGroups || CONFIG_DEFAULTS[CONFIG_KEYS.PAGECAT_GROUPS]); if (f.termPattern !== undefined) set('TERM_PATTERN', f.termPattern || CONFIG_DEFAULTS[CONFIG_KEYS.TERM_PATTERN]);
  if (f.houseExclude !== undefined) set('HOUSE_EXCLUDE', f.houseExclude ? 'yes' : 'no'); if (f.regionalProrata !== undefined) set('REGIONAL_PRORATA', f.regionalProrata ? 'yes' : 'no');
  if (f.policyTiers !== undefined) set('POLICY_TIERS', f.policyTiers || CONFIG_DEFAULTS[CONFIG_KEYS.POLICY_TIERS]);
  if (f.brandFamilies !== undefined) set('BRAND_FAMILIES', f.brandFamilies || '');
  if (f.discountBands !== undefined) set('DISCOUNT_BANDS', f.discountBands || CONFIG_DEFAULTS[CONFIG_KEYS.DISCOUNT_BANDS]); if (f.brandName !== undefined) set('BRAND_NAME', f.brandName); if (f.creditLine !== undefined) set('CREDIT_LINE', f.creditLine);
  const mc = (f.regions || []).filter(r => r.currency && r.currency.toUpperCase() !== (f.reportingCurrency || 'EUR').toUpperCase())
    .map(r => `${r.name}=${r.currency.toUpperCase()}`).join('; ');
  set('MARKET_CURRENCIES', mc);
  // FX rates: sidebar values are "1 X = ? base" (Source → Target, as in AdBook)
  CONFIG_CACHE_ = null;
  const cfg2 = getConfig();
  let fxSh = ss.getSheetByName(CFG.FX_SHEET) || ss.insertSheet(CFG.FX_SHEET);
  const toBase = readFxToBase_(fxSh, cfg2.reportingCurrency);
  (f.fx || []).forEach(x => {
    const code = String(x.code || '').toUpperCase().trim(); if (!/^[A-Z]{3}$/.test(code)) return;
    const v = x.rate === '' || x.rate == null ? '' : Number(String(x.rate).replace(',', '.'));
    toBase[code] = (typeof v === 'number' && v > 0) ? v : '';
  });
  toBase[cfg2.reportingCurrency] = 1;
  const codes = Object.keys(toBase);
  fxSh.clear(); fxSh.clearFormats();
  fxSh.getRange(1, 1, codes.length + 1, 2).setValues([['Currency', 'x'], ...codes.map(c => [c, toBase[c]])]);   // list layout, rebuilt below
  ensureFxSheet_(ss, {}, cfg2);
  CONFIG_CACHE_ = null; FX_CACHE_ = null;
  return 'Saved. Use "Apply now" to rebuild the reports with these settings.' + (isPrint_() ? ' Page factors, groups and the gross definition apply at the next import (Import latest / Process Raw).' : '');
}

/** Save + rebuild in one go (called from the sidebar). */
function saveSettingsAndApply(f) {
  const msg = saveSettings(f);
  const data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.SHEETS.DATA);
  if (!data || data.getLastRow() < 2) return 'Saved. No report imported yet — paste an export into "Raw" and run "Process pasted report" (or import from the Drive folder); the settings will be applied then.';
  buildDashboard();
  return 'Saved and applied.';
}

/** "UK London=GBP; US New York=USD" → { 'uk london': 'GBP', 'us new york': 'USD' } */
function parseMarketCurrencies_(s) {
  const out = {};
  String(s || '').split(';').forEach(part => {
    const [k, v] = part.split('=');
    if (k && v) out[k.trim().toLowerCase()] = v.trim().toUpperCase();
  });
  return out;
}

/** Currency a given region reports in. */
function marketCurrency_(region) {
  const cfg = getConfig();
  return cfg.marketCurrencies[String(region || '').toLowerCase()] || cfg.reportingCurrency;
}

let FX_CACHE_ = null;
/** Rate to the reporting currency for a code, read from the FX Rates tab (reporting currency = 1, unknown = 1). */
function fxRate_(code) {
  const cfg = getConfig();
  if (code === cfg.reportingCurrency) return 1;
  if (!FX_CACHE_) {
    FX_CACHE_ = {};
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.FX_SHEET);
    if (sh && sh.getLastRow() > 2) sh.getRange(FX.MATRIX_ROW + 1, FX.DERIVED_COL, sh.getLastRow() - FX.MATRIX_ROW, 2).getValues()
      .forEach(r => { const c = String(r[0] || '').trim().toUpperCase(); if (c && typeof r[1] === 'number' && r[1] > 0) FX_CACHE_[c] = r[1]; });
  }
  return FX_CACHE_[code] || 1;
}

/**
 * Re-expresses the converted money columns of the given rows in the region's market currency.
 * Returns { headers, rows, currency, factor }. Rows are copied only when a conversion is needed.
 */
function convertRowsForMarket_(headers, rows, region) {
  const cfg = getConfig();
  const cur = marketCurrency_(region);
  if (cur === cfg.reportingCurrency) return { headers, rows, currency: cur, factor: 1 };
  const factor = 1 / fxRate_(cur);            // reporting → market currency
  const suffix = ` (${cfg.reportingCurrency})`;
  const idxs = []; const newHeaders = headers.map((h, i) => {
    if (String(h).endsWith(suffix)) { idxs.push(i); return String(h).slice(0, -suffix.length) + ` (${cur})`; }
    return h;
  });
  const newRows = rows.map(r => { const c = r.slice(); idxs.forEach(i => { if (typeof c[i] === 'number') c[i] = c[i] * factor; }); return c; });
  return { headers: newHeaders, rows: newRows, currency: cur, factor };
}

/** Years present in Data (from Period). */
function yearsInData_() {
  const d = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.SHEETS.DATA);
  if (!d || d.getLastRow() < 2) return [];
  const h = d.getRange(1, 1, 1, d.getLastColumn()).getValues()[0]; const i = h.indexOf('Period'); if (i < 0) return [];
  return Array.from(new Set(d.getRange(2, i + 1, d.getLastRow() - 1, 1).getValues().map(r => String(r[0]).slice(0, 4)).filter(y => /^\d{4}$/.test(y)))).sort();
}

/**
 * Data headers + rows for the sheet builders, restricted to the configured reporting year(s).
 * @return {{headers:Array, rows:Array<Array>, years:string[]}}
 */
function sheetData_(ss) {
  const all = allData_(ss);
  const headers = all.headers; const years = getConfig().sheetYears;
  const values = [headers, ...all.rows];
  const iP = headers.indexOf('Period');
  const rows = (years.length && iP >= 0) ? values.slice(1).filter(r => years.includes(String(r[iP]).slice(0, 4))) : values.slice(1);
  return { headers, rows, years };
}

/**
 * Print: the Sheets tabs, deck and digest use the same scope as the web page and the Excel — the Settings default IO status
 * (blank = all). So the Dashboard card, the market tabs and the web headline always show the same number.
 */
function scopedData_(ss) {
  const sd = sheetData_(ss);
  if (!isPrint_()) return sd;
  const io = (getConfig().defaultIoStatus || '').trim(); const i = sd.headers.indexOf('IO Status');
  if (!io || i < 0) return sd;
  const want = io.toLowerCase();
  return { headers: sd.headers, rows: sd.rows.filter(r => String(r[i]).trim().toLowerCase() === want), years: sd.years };
}
/** "IO status Order Ready for Flighting" / "all IO statuses" — for tab headers. */
function scopeLabel_() { const io = isPrint_() ? (getConfig().defaultIoStatus || '').trim() : ''; return io ? `IO status ${io}` : 'all IO statuses'; }

/** Full Data tab (all years) — from the in-memory copy when this execution wrote it (print), else read once from the sheet and cached. */
function allData_(ss) {
  const isMaster = ss.getId() === SpreadsheetApp.getActiveSpreadsheet().getId();
  if (isMaster && typeof DATA_CACHE_ !== 'undefined' && DATA_CACHE_) return DATA_CACHE_;
  const d = ss.getSheetByName(CFG.SHEETS.DATA);
  const n = dataRowCount_(d);
  const values = d.getRange(1, 1, n + 1, d.getLastColumn()).getValues();
  const out = { headers: values[0], rows: values.slice(1) };
  if (isMaster && isPrint_()) DATA_CACHE_ = out;
  return out;
}

/** Year label for titles: "2026" / "2026–2027" / "all years". */
function yearLabel_() { const y = getConfig().sheetYears; return y.length ? y.join(', ') : 'all years'; }

/**
 * Niche for a line. US: Campaign Name before the first "-" (whole name if no dash), trimmed, first letter capitalised.
 * Europe: (Campaign) SSG Category as exported. Blank → "(blank)".
 */
function deriveNiche_(region, ssgCategory, campaignName, brandSrc, positionPath) {
  let v;
  if (isPrint_()) {
    v = String(brandSrc || '').trim();
    if (!v) { const parts = String(positionPath || '').split(CFG.REGION_DELIM).map(x => x.trim()); v = parts[2] || ''; }
  } else if (isUsMarket_(region)) {
    const name = String(campaignName || '').trim();
    const i = name.indexOf(CFG.NICHE_US_DELIM);
    v = (i >= 0 ? name.slice(0, i) : name).trim();
  } else v = String(ssgCategory || '').trim();
  if (!v) return '(blank)';
  return v.charAt(0).toUpperCase() + v.slice(1);
}

/** Niche column name in a Data header set: the derived "Niche" if present, else the European source. */
function nicheCol_(headers) { return headers.indexOf('Niche') >= 0 ? 'Niche' : CFG.NICHE_SRC_EU; }

/**
 * Case/space-insensitive canonicaliser for label columns (platform, agency): the first spelling seen
 * is kept for every later variant, so "Business services", "Business Services " and "BUSINESS SERVICES" become one.
 */
function makeCanon_(seed) {
  const seen = {};
  (seed || []).forEach(v => { const k = String(v || '').trim().toLowerCase().replace(/\s+/g, ' '); if (k && !seen[k]) seen[k] = String(v).trim().replace(/\s+/g, ' '); });
  return v => { const t = String(v || '').trim().replace(/\s+/g, ' '); if (!t) return ''; const k = t.toLowerCase(); if (!seen[k]) seen[k] = t; return seen[k]; };
}

/** Is this region the US market? */
function isUsMarket_(region) { return String(region || '').trim().toLowerCase() === getConfig().usMarket.toLowerCase(); }

/**
 * Fee classification for a line: { kind: 'internal'|'external'|'us'|'none', usFee: <configured US fee name or 'Other US fee'> }.
 * European lines use the internal/external words; US lines use the exact last segment against the configured list.
 */
function classifyFee_(region, fee) {
  const cfg = getConfig();
  if (isUsMarket_(region)) {
    const f = String(fee || '').trim().toLowerCase();
    const hit = cfg.usFees.find(x => x.toLowerCase() === f);
    return { kind: 'us', usFee: hit || CFG.US_FEE_OTHER };
  }
  if (CFG.FEE_INTERNAL.test(fee)) return { kind: 'internal', usFee: '' };
  if (CFG.FEE_EXTERNAL.test(fee)) return { kind: 'external', usFee: '' };
  return { kind: 'none', usFee: '' };
}

/** Fast "yyyy-mm-dd" for a Date (no Utilities.formatDate — that is a slow service call when done per row). */
function ymd_(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }

/** Number of real data rows in a sheet: last non-empty row of column A (header excluded). */
function dataRowCount_(sh) {
  const n = sh.getLastRow(); if (n < 2) return 0;
  const col = sh.getRange(1, 1, n, 1).getValues();
  let last = 0; for (let i = col.length - 1; i >= 0; i--) { if (col[i][0] !== '' && col[i][0] !== null) { last = i + 1; break; } }
  return Math.max(0, last - 1);
}

/**
 * Reads only the named columns (in the order given; missing names skipped) as a few contiguous
 * block reads instead of the whole sheet. Returns { headers, rows }.
 */
function readColumns_(sh, names, nRows) {
  const lastCol = sh.getLastColumn();
  const hdr = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const want = names.map(n => hdr.indexOf(n)).filter(i => i >= 0);
  const uniq = Array.from(new Set(want)).sort((a, b) => a - b);
  if (nRows === undefined) nRows = dataRowCount_(sh);
  const headers = uniq.map(i => hdr[i]);
  if (!nRows) return { headers, rows: [] };
  // contiguous runs (gap ≤ 3 columns merged to save calls)
  const runs = []; uniq.forEach(i => { const r = runs[runs.length - 1]; if (r && i - r.end <= 4) r.end = i; else runs.push({ start: i, end: i }); });
  const cols = {};
  runs.forEach(r => { const block = sh.getRange(2, r.start + 1, nRows, r.end - r.start + 1).getValues(); for (let c = r.start; c <= r.end; c++) cols[c] = block.map(row => row[c - r.start]); });
  const rows = []; for (let k = 0; k < nRows; k++) rows.push(uniq.map(i => cols[i][k]));
  return { headers, rows };
}

/** Columns the web app needs (plus any converted money twins that exist). */
function webColumns_() {
  const cfg = getConfig();
  const base = ['Report Run Date', 'Region', 'Period', 'Fee Type', 'FX Currency', 'IO Status', 'Billing Status', 'Campaign ID', 'Campaign Name',
    '(Drop) Job Code (limit 6 characters)', 'Drop ID', 'Client Name', 'Agency Name', 'Sales Rep', '(Drop) SSG Platform', '(Campaign) SSG Category', 'Niche',
    'SSG Account Strategy', '(Campaign) Order Source', CFG.REGION_SOURCE_COL];
  const money = [cfg.kpiCol, CFG.BILLED_COL, CFG.BILLABLE_COL, CFG.ADBOOK_BILLED_COL, 'Adjusted Earned Blended Revenue', 'Pro-rata Revenue', 'Earned Blended Revenue'];
  if (isPrint_()) {
    base.push('Path 2', 'Path 4', 'Book', 'Page Cat', 'Page Cat Group', 'Commercial Term', 'Qualifier', 'Pages', 'Insert', 'Insert Weight (g)', 'Insert Pages', 'Earned Fraction', 'Space Check', 'Issue Label',
      CFG.AD_SIZE_COL, CFG.PRINT_PAGE_COL, CFG.ACTUAL_SPACE_COL, '(Drop) Issue', '(Inventory Issue) Issue Number', '(Inventory Issue) Cover Date', '(Drop) WD Platform', 'Current Rate Card Name', 'Current Rate Card Price Type', '(Campaign) Client Brand');
    moneyMeasures_().forEach(m => { if (!money.includes(m)) money.push(m); });
  }
  const twins = money.map(m => `${m} (${cfg.reportingCurrency})`);
  return [...base, ...money, ...twins];
}

/** Number format string for money cells: positive; negative in red brackets; zero as dash. */
function moneyFmt_() { const f = getConfig().numberFormat; return `${f};[Red](${f});"-"`; }

/** Names of the converted money columns, e.g. "Adjusted Blended Revenue (EUR)". */
function fxDerivedColumns_() {
  const cfg = getConfig();
  const list = moneyMeasures_().slice();
  if (!list.includes(cfg.kpiCol)) list.push(cfg.kpiCol);
  return list.map(m => `${m} (${cfg.reportingCurrency})`);
}

/** Returns the converted twin of a money column ("<name> (XXX)", any currency code) if present, otherwise the original name.
 *  If the requested column does not exist at all (older Data tab), falls back to a sensible alternative. */
function moneyCol_(headers, name) {
  const find = n => { const re = new RegExp('^' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' \\([A-Z]{3}\\)$');
    return headers.find(h => re.test(String(h))) || (headers.indexOf(n) >= 0 ? n : null); };
  const hit = find(name);
  if (hit) return hit;
  if (name === CFG.BILLED_COL) { const alt = find(CFG.ADBOOK_BILLED_COL); if (alt) { BILLED_FALLBACK_ = true; return alt; } }
  return name;
}
let BILLED_FALLBACK_ = false;   // true when "Billed Revenue" is missing and AdBook's Actual Billed Amount was used instead

/** Currency code the headers are expressed in (from the KPI's converted column), else the reporting currency. */
function currencyOf_(headers) {
  const m = String(moneyCol_(headers, getConfig().kpiCol)).match(/\(([A-Z]{3})\)$/);
  return m ? m[1] : getConfig().reportingCurrency;
}

/** "CN Spain=a@x.com,b@x.com; CN Italy=c@x.com" → { 'cn spain': [...], 'cn italy': [...] } */
function parseMarketViewers_(s) {
  const out = {};
  String(s || '').split(';').forEach(part => {
    const [k, v] = part.split('=');
    if (k && v) out[k.trim().toLowerCase()] = splitEmails_(v);
  });
  return out;
}

/** Accepts a bare folder ID or any Drive folder URL and returns the ID. */
function extractDriveId_(v) {
  v = String(v || '').trim();
  if (!v) return '';
  const m = v.match(/\/folders\/([A-Za-z0-9_-]+)/) || v.match(/[?&]id=([A-Za-z0-9_-]+)/);
  return m ? m[1] : v;
}

function createConfigSheet_(ss) {
  const sh = ss.insertSheet(CFG.SHEETS.CONFIG);
  sh.getRange(1, 1, 12, 2).setValues([
    [CONFIG_KEYS.DRIVE_FOLDER_ID, ''],
    [CONFIG_KEYS.ARCHIVE_FOLDER_ID, ''],
    [CONFIG_KEYS.REVIEWERS, ''],
    [CONFIG_KEYS.UPLOADERS, ''],
    [CONFIG_KEYS.KPI_OVERRIDE, ''],
    [CONFIG_KEYS.MARKET_FILES, 'yes'],
    [CONFIG_KEYS.MARKET_FOLDER_ID, ''],
    [CONFIG_KEYS.MARKET_VIEWERS, ''],
    [CONFIG_KEYS.REPORT_CURRENCY, 'EUR'],
    [CONFIG_KEYS.NUMBER_FORMAT, '#,##0'],
    [CONFIG_KEYS.MARKET_CURRENCIES, ''],
    [CONFIG_KEYS.BILLED_STATUS, 'Complete'],
  ]);
  sh.getRange('A1:A12').setFontWeight('bold');
  sh.setColumnWidth(1, 460).setColumnWidth(2, 520);
  sh.getRange('A14').setValue('Notes').setFontWeight('bold');
  sh.getRange('A15:A24').setValues([
    ['• Drive folder ID: the folder where AdBook+ CSV/XLSX exports are dropped. Paste the folder link or its ID.'],
    ['• Reviewer emails: who can open the web app. Leave blank to allow anyone in your Google Workspace domain (as set in the deployment).'],
    ['• Uploader emails: who can upload a report through the web app. Leave blank so only the sheet owner can.'],
    ['• Headline KPI: defaults to Adjusted Blended Revenue.'],
    ['• Market files: one Google Sheet per region is created/refreshed in the market files folder on every import.'],
    ['• Market viewers: optionally share each market file with specific people, e.g.  CN Spain=ana@x.com,luis@x.com; CN Italy=marco@x.com'],
    ['• Reporting currency: all revenue is shown in this currency. Rates live in the "FX Rates" tab — edit a rate and every report updates.'],
    ['• Number format: 0 shows 12346, #,##0 shows 12,346, #,##0.00 shows 12,345.67.'],
    ['• Market currencies: e.g.  UK London=GBP  makes that market\'s tab, file and web-app view report in GBP; consolidated views stay in the reporting currency.'],
    ['• Billed: a line counts as billed when its Billing Status matches one of the listed values (default Complete). "Billed revenue" = the Adjusted Billable Revenue of those lines.'],
  ]);
  return sh;
}

function splitEmails_(s) {
  return String(s || '').split(/[,;\s]+/).map(e => e.trim().toLowerCase()).filter(Boolean);
}

/* ===================== Ingest ===================== */
/**
 * AdBook+ Revenue Review — Ingest & Transform
 * --------------------------------------------
 * Three intake paths, one pipeline:
 *   1. importLatestFromDrive()  — newest CSV/XLSX in the configured Drive folder
 *   2. processRawTab()          — whatever is pasted in the "Raw" tab
 *   3. uploadReport()           — file uploaded via the web app (see WebApp.gs)
 * All three call processRows_(), which filters to CANONICAL_COLUMNS, coerces
 * numbers/dates, derives Region + Period, writes "Data", then rebuilds the dashboard.
 */

function onOpen() {
  SpreadsheetApp.getUi().createMenu(profile_().menu)
    .addItem('⚙ Settings', 'openSettings')
    .addSeparator()
    .addItem('Import latest report from Drive folder', 'importLatestFromDrive')
    .addItem('Process pasted report in "Raw" tab', 'processRawTab')
    .addSeparator()
    .addItem('Rebuild dashboard', 'buildDashboard')
    .addItem('Apply exchange rates (after editing FX Rates or Config)', 'applyExchangeRates')
    .addItem('Generate / refresh market files', 'generateMarketFiles')
    .addItem('Export leadership deck (Google Slides)', 'exportLeadershipDeck')
    .addItem('Send changes digest email now', 'sendChangesDigest')
    .addItem('Usage report (who opened the web app)', 'buildUsageReport')
    .addItem('Set up nightly auto-import at 00:00 Berlin (Drive folder)', 'installDailyTrigger')
    .addItem('Remove auto-import', 'removeTriggers')
    .addToUi();
}

function ensureConfigSheet() { getConfig(); toast_('Config tab is ready.'); }

/* ------------------------------------------------------------------ */
/* Path 1 — Drive folder                                               */
/* ------------------------------------------------------------------ */

function importLatestFromDrive() {
  const cfg = getConfig();
  if (!cfg.driveFolderId) throw new Error('Set "Drive folder ID" in the Config tab first.');
  const folder = DriveApp.getFolderById(cfg.driveFolderId);
  const files = folder.getFiles();
  let newest = null;
  while (files.hasNext()) {
    const f = files.next();
    if (!isReportFile_(f)) continue;
    if (!newest || f.getLastUpdated() > newest.getLastUpdated()) newest = f;
  }
  if (!newest) { toast_('No CSV/XLSX report found in the folder.'); return; }

  if (alreadyImported_(newest)) { toast_(`"${newest.getName()}" was already imported — nothing new.`); return; }

  const values = parseFileBlob_(newest.getBlob(), newest.getName());
  const result = processRows_(values, `Drive: ${newest.getName()}`, newest.getId());
  if (cfg.archiveFolderId) newest.moveTo(DriveApp.getFolderById(cfg.archiveFolderId));
  return result;
}

function isReportFile_(file) {
  const n = file.getName().toLowerCase();
  return n.endsWith('.csv') || n.endsWith('.xlsx') || n.endsWith('.xls') || n.endsWith('.tsv');
}

function alreadyImported_(file) {
  const log = getOrCreateLogSheet_();
  const last = log.getLastRow();
  if (last < 2) return false;
  const rows = log.getRange(2, 1, last - 1, 6).getValues();
  const key = `${file.getId()}|${file.getLastUpdated().getTime()}`;
  return rows.some(r => r[5] === key);
}

/* ------------------------------------------------------------------ */
/* Path 2 — Raw tab                                                    */
/* ------------------------------------------------------------------ */

function processRawTab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const raw = ss.getSheetByName(CFG.SHEETS.RAW);
  if (!raw || raw.getLastRow() < 2) throw new Error('Paste the AdBook+ export (with its header row) into the "Raw" tab first.');
  const values = raw.getDataRange().getValues();
  return processRows_(values, 'Pasted into Raw tab', '');
}

/* ------------------------------------------------------------------ */
/* Shared parsing                                                      */
/* ------------------------------------------------------------------ */

/** Returns a 2-D array of values (header row first) from a CSV/TSV/XLSX blob. */
function parseFileBlob_(blob, name) {
  const lower = (name || blob.getName() || '').toLowerCase();
  if (lower.endsWith('.csv') || lower.endsWith('.tsv') || blob.getContentType() === 'text/csv') {
    const text = blob.getDataAsString('UTF-8').replace(/^\uFEFF/, '');
    const delim = lower.endsWith('.tsv') || (text.split('\n')[0] || '').includes('\t') ? '\t' : ',';
    return Utilities.parseCsv(text, delim);
  }
  // XLSX/XLS: convert to a temporary Google Sheet via the Drive advanced service, read, delete.
  if (typeof Drive === 'undefined') {
    throw new Error('XLSX import needs the Drive API advanced service. In the Apps Script editor: Services (+) → Drive API → Add. Or export the report as CSV.');
  }
  const tmp = Drive.Files.create(
    { name: `tmp_adbook_${Date.now()}`, mimeType: MimeType.GOOGLE_SHEETS },
    blob
  );
  try {
    const sh = SpreadsheetApp.openById(tmp.id).getSheets()[0];
    return sh.getDataRange().getValues();
  } finally {
    Drive.Files.remove(tmp.id);
  }
}

/* ------------------------------------------------------------------ */
/* Transform                                                           */
/* ------------------------------------------------------------------ */

/**
 * @param {Array<Array>} values  header row + data rows from the export
 * @param {string} sourceLabel   for the import log
 * @param {string} fileId        Drive file id if any (dedupe key)
 */
function processRows_(values, sourceLabel, fileId) {
  if (!values || values.length < 2) throw new Error('The report has no data rows.');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10 * 60 * 1000)) throw new Error('Another import or rebuild is still running. Please wait for it to finish and try again.');
  try { return processRowsLocked_(values, sourceLabel, fileId); } finally { lock.releaseLock(); }
}

function processRowsLocked_(values, sourceLabel, fileId) {
  CONFIG_CACHE_ = null; FX_CACHE_ = null; DATA_CACHE_ = null;
  const cfg = getConfig();
  progressStart_(isPrint_() ? 8 : 11, `Reading ${values.length - 1} rows from ${sourceLabel}…`);

  const srcHeaders = values[0].map(h => String(h || '').trim());
  const srcIndex = {};
  srcHeaders.forEach((h, i) => { srcIndex[normalizeHeader_(h)] = i; });

  const canonical = CFG.CANONICAL_COLUMNS;
  const map = canonical.map(c => {
    const i = srcIndex[normalizeHeader_(c)];
    return i === undefined ? -1 : i;
  });
  const missing = canonical.filter((c, i) => map[i] === -1);

  const numericSet = new Set(CFG.NUMERIC_COLS.map(normalizeHeader_));
  const dateSet = new Set(CFG.DATE_COLS.map(normalizeHeader_));
  const regionIdx = srcIndex[normalizeHeader_(CFG.REGION_SOURCE_COL)];
  const curIdx = srcIndex[normalizeHeader_('Currency')];
  const bsIdx = srcIndex[normalizeHeader_('Billing Status')];
  const catIdx = srcIndex[normalizeHeader_(CFG.NICHE_SRC_EU)], nameIdx = srcIndex[normalizeHeader_(CFG.NICHE_SRC_US)];
  const print = isPrint_();
  RC_UNKNOWN_ = {}; RC_MISMATCH_ = 0;
  const si = name => { const i = srcIndex[normalizeHeader_(name)]; return i === undefined ? -1 : i; };
  const P = print ? { path3: si(CFG.BRAND_SRC), path4: si(CFG.BOOK_SRC), path5: si(CFG.PAGECAT_SRC), path6: si(CFG.QUALIFIER_SRC), adSize: si(CFG.AD_SIZE_COL), printPage: si(CFG.PRINT_PAGE_COL), space: si(CFG.ACTUAL_SPACE_COL),
    adjB: si('Adjusted Blended Revenue'), adjE: si('Adjusted Earned Blended Revenue'), comm: si('(Drop) Agy Commission (DE)'), d1: si('(Drop) Discount - Client 1'), d2: si('(Drop) Discount - Client 2'), dc: si('(Drop) Discount - Contract'),
    rc: si('Current Rate Card Price'), irc: si('Initial Rate Card Price'), parent: si('(Drop) Parent Site'), arc: si('(Drop) Adjusted Rate Card'), rcp: si('(Drop) Rate Card Pricing'), issue: si('(Drop) Issue'), issueNo: si('(Inventory Issue) Issue Number'), issueYear: si('(Inventory Issue) Issue Year'), cover: si('(Inventory Issue) Cover Date') } : null;
  const canonBook = makeCanon_(['*Mainbook', '*Inserts']), canonCat = makeCanon_([CFG.PAGECAT_DEFAULT]);
  const pick = (row, i) => i < 0 ? '' : row[i];
  const pnum = (row, i) => i < 0 ? '' : toNumber_(row[i]);
  const agencyCanon = canonical.indexOf('Agency Name'), platformCanon = canonical.indexOf('(Drop) SSG Platform');
  const canonAgency = makeCanon_([cfg.blankAgency]), canonPlatform = makeCanon_([cfg.blankPlatform]);   // merge spelling variants
  const billableCanonIdx = canonical.indexOf(CFG.BILLABLE_COL);   // Billed Revenue = Adjusted Billable Revenue of billed lines
  const billedSet = new Set(cfg.billedStatuses);
  const fxSrcIdx = srcIndex[normalizeHeader_('Campaign Exchange Rate')];
  const currencies = {};   // code -> [source rates]
  const yearIdx = srcIndex[normalizeHeader_('Year')];
  const monthIdx = srcIndex[normalizeHeader_('Month')];
  const startIdx = srcIndex[normalizeHeader_('Start Date')];

  const numericIdx = canonical.map((c, i) => numericSet.has(normalizeHeader_(c)) ? map[i] : -1).filter(i => i >= 0);
  DECIMAL_SEP_ = detectDecimal_(values, numericIdx);
  progress_('Cleaning columns and converting numbers and dates…', `${missing.length} canonical column(s) not in this export`);

  const out = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    if (row.every(v => v === '' || v === null)) continue;
    const rec = canonical.map((c, i) => {
      const v = map[i] === -1 ? '' : row[map[i]];
      const key = normalizeHeader_(c);
      if (numericSet.has(key)) return toNumber_(v);
      if (dateSet.has(key)) return toDate_(v);
      return v;
    });
    if (agencyCanon >= 0) rec[agencyCanon] = canonAgency(rec[agencyCanon]) || cfg.blankAgency;          // blank agency → "Booked direct"; variants merged
    if (platformCanon >= 0) rec[platformCanon] = canonPlatform(rec[platformCanon]) || cfg.blankPlatform; // blank platform → "Business services"; variants merged
    const regionVal = deriveRegion_(regionIdx === undefined ? '' : row[regionIdx]);
    rec.push(regionVal);
    rec.push(derivePeriod_(
      yearIdx === undefined ? '' : row[yearIdx],
      monthIdx === undefined ? '' : row[monthIdx],
      startIdx === undefined ? '' : row[startIdx]
    ));
    // Row currency: the export's Currency column if present, else the market's currency (Settings), else the reporting currency
    rec.push(deriveFeeType_(regionIdx === undefined ? '' : row[regionIdx]));   // Fee Type = text after the last "|"
    rec.push(deriveNiche_(regionVal, catIdx === undefined ? '' : row[catIdx], nameIdx === undefined ? '' : row[nameIdx], print ? pick(row, P.path3) : '', regionIdx === undefined ? '' : row[regionIdx]));   // Niche (Print: Brand)
    const cur = (curIdx === undefined ? '' : String(row[curIdx] || '').trim().toUpperCase()) || marketCurrency_(regionVal);
    rec.push(cur);                                  // FX Currency
    rec.push('');                                   // FX Rate (formula, set below)
    const bsVal = bsIdx === undefined ? '' : String(row[bsIdx] || '').trim().toLowerCase();
    const isBilled = billedSet.has(bsVal) ? 1 : 0;
    rec.push(isBilled);                             // Billing Complete (1/0)
    const billableLocal = billableCanonIdx >= 0 ? rec[billableCanonIdx] : '';
    rec.push(isBilled && typeof billableLocal === 'number' ? billableLocal : 0);   // Billed Revenue (local) = Adjusted Billable Revenue when billed
    if (print) {
      derivePrintFields_({ path4: pick(row, P.path4), path5: pick(row, P.path5), path6: pick(row, P.path6), adSize: pick(row, P.adSize), printPage: pick(row, P.printPage), actualSpace: pnum(row, P.space),
        adjBlended: pnum(row, P.adjB), adjEarned: pnum(row, P.adjE), commission: pnum(row, P.comm), disc1: pnum(row, P.d1), disc2: pnum(row, P.d2), discContract: pnum(row, P.dc),
        rateCard: pnum(row, P.rc), initialRateCard: pnum(row, P.irc), adjRateCard: pnum(row, P.arc), rcPricing: pick(row, P.rcp), parentSite: pick(row, P.parent), brand: print ? pick(row, P.path3) : '', issue: pick(row, P.issue), issueNo: pick(row, P.issueNo), issueYear: pick(row, P.issueYear), coverDate: toDate_(pick(row, P.cover)),
        agency: agencyCanon >= 0 && rec[agencyCanon] !== cfg.blankAgency }, cfg, canonBook, canonCat)
        .forEach(v => rec.push(v));
    }
    fxDerivedColumns_().forEach(() => rec.push('')); // converted columns (formulas, set below)
    const srcRate = fxSrcIdx === undefined ? '' : toNumber_(row[fxSrcIdx]);
    (currencies[cur] = currencies[cur] || []); if (typeof srcRate === 'number' && srcRate > 0) currencies[cur].push(srcRate);
    out.push(rec);
  }

  progress_('Deriving Region, Fee Type, Period, currency and billed flags…');
  const derived = derivedCols_();
  const headers = [...canonical, ...derived, ...fxDerivedColumns_()];
  const iPer = canonical.length + derived.indexOf('Period');
  const noPeriod = out.filter(r => !r[iPer]).length;
  if (noPeriod) missing.push(`${noPeriod} row(s) without a Period (Year/Month/Start Date unreadable)`);
  const iReg = canonical.length + derived.indexOf('Region');
  const regCounts = {}; out.forEach(r => { regCounts[r[iReg]] = (regCounts[r[iReg]] || 0) + 1; });
  missing.push('Markets: ' + Object.keys(regCounts).sort().map(k => `${k} ${regCounts[k]}`).join(', '));
  if (print) printImportNotes_(out, canonical.length + derived.indexOf('Page Cat'), canonical.length + derived.indexOf('Page Cat Group'), canonical.length + derived.indexOf('Space Check'), canonical.length + derived.indexOf('Commercial Term'), canonical.length + derived.indexOf('Rate Card Source'), canonical.indexOf('Adjusted Earned Blended Revenue'), canonical.length + derived.indexOf('Brand Family')).forEach(n => missing.push(n));
  progress_('Saving the previous dataset for the Changes comparison…');
  snapshotData_(SpreadsheetApp.getActiveSpreadsheet(), headers, out);   // keeps the old snapshot if this is the same report
  if (print) {
    // Short import: FX as values, Data, cube, log — then the tabs build in the background (PrintBuild.gs)
    progress_('Updating the FX Rates matrix and stamping currency values…');
    ensureFxSheet_(SpreadsheetApp.getActiveSpreadsheet(), currencies, cfg);
    stampFxValues_(headers, out, cfg);
    progress_(`Writing ${out.length} rows to the Data tab…`);
    writeData_(headers, out);
    progress_('Pre-computing the web cube…');
    const cube = buildPrintCube_(SpreadsheetApp.getActiveSpreadsheet());
    progress_('Writing the Import Log and queuing the background build…');
    orderMasterTabs_(SpreadsheetApp.getActiveSpreadsheet());
    logImport_(sourceLabel, out.length, missing, fileId, values, DECIMAL_SEP_, 'background build queued', progressTimings_());
    CacheService.getScriptCache().removeAll(['dash_options']);
    scheduleBuild_(BUILD.STEPS);
    progressDone_(`${out.length} rows imported · web app ready (${cube.cells} cube cells) · Dashboard, Review, Regions, market tabs and Changes refresh in the background`);
    return { rows: out.length, missingColumns: missing };
  }
  progress_(`Writing ${out.length} rows to the Data tab…`);
  writeData_(headers, out);
  progress_('Updating the FX Rates matrix and currency formulas…');
  ensureFxSheet_(SpreadsheetApp.getActiveSpreadsheet(), currencies, cfg);
  setFxFormulas_(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.SHEETS.DATA), headers, out.length);
  SpreadsheetApp.flush();
  buildDashboard(true);                           // steps 7–9 report their own progress
  progress_('Comparing with the previous import (Changes tab)…');
  const ch = buildChangesTab_(SpreadsheetApp.getActiveSpreadsheet());
  progress_('Ordering tabs and writing the Import Log…');
  orderMasterTabs_(SpreadsheetApp.getActiveSpreadsheet());
  logImport_(sourceLabel, out.length, missing, fileId, values, DECIMAL_SEP_, ch ? `+${ch.added.length} / −${ch.removed.length} / ~${ch.changed.length}` : 'first import', progressTimings_());
  CacheService.getScriptCache().removeAll(['dash_options']);
  progressDone_(`${out.length} rows imported` + (ch ? ` · changes +${ch.added.length} / −${ch.removed.length} / ~${ch.changed.length}` : ' · first import'));
  return { rows: out.length, missingColumns: missing };
}

function normalizeHeader_(h) {
  return String(h || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Detects whether numeric text in the export uses "1,234.56" (EN) or "1.234,56" (DE).
 * Looks at all values in the numeric columns and votes.
 */
function detectDecimal_(values, numericIdx) {
  let en = 0, de = 0;
  for (let r = 1; r < Math.min(values.length, 3000); r++) {
    for (const i of numericIdx) {
      const v = values[r][i]; if (typeof v !== 'string') continue;
      const t = v.trim();
      if (/,\d{1,2}$/.test(t)) de++;           // ends ",50"  → DE decimal
      else if (/\.\d{1,2}$/.test(t)) en++;    // ends ".50"  → EN decimal
      else if (/\.\d{3}(\D|$)/.test(t) && !t.includes(',')) de++; // "1.234" with no comma → DE thousands
      else if (/,\d{3}(\D|$)/.test(t) && !t.includes('.')) en++;
    }
  }
  return de > en ? ',' : '.';
}

let DECIMAL_SEP_ = '.';

function toNumber_(v) {
  if (v === '' || v === null || v === undefined) return '';
  if (typeof v === 'number') return v;
  let s = String(v).trim();
  if (!s) return '';
  const neg = /^\(.*\)$/.test(s) || /^-/.test(s) || /-$/.test(s);
  s = s.replace(/[^0-9.,]/g, '');
  if (DECIMAL_SEP_ === ',') s = s.replace(/\./g, '').replace(',', '.');
  else s = s.replace(/,/g, '');
  if (s === '' || s === '.') return '';
  const n = parseFloat(s);
  return isNaN(n) ? '' : (neg ? -n : n);
}

function toDate_(v) {
  if (v instanceof Date) return v;
  if (v === '' || v === null || v === undefined) return '';
  const d = new Date(v);
  return isNaN(d.getTime()) ? v : d;
}

function deriveRegion_(positionPath) {
  const s = String(positionPath || '');
  const first = s.split(CFG.REGION_DELIM)[0].trim();
  if (!first) return CFG.REGION_FALLBACK;
  const cfg = getConfig();
  if (cfg.usPrefix && first.toLowerCase() === cfg.usPrefix.toLowerCase()) return cfg.usMarket;   // "Conde Nast | …" → CN US
  return first;
}

/** Text after the last "|" in Position Path (e.g. "Talent Fee Internal"); "(none)" if there is no delimiter. */
function deriveFeeType_(positionPath) {
  const parts = String(positionPath || '').replace(/\u00a0/g, ' ').split(CFG.REGION_DELIM).map(x => x.trim()).filter(Boolean);
  if (parts.length < 2) return '(none)';
  return parts[parts.length - 1];
}

const MONTHS_ = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

function derivePeriod_(year, month, startDate) {
  const toDate = v => {
    if (v instanceof Date && !isNaN(v)) return v;
    if (typeof v === 'number' && v > 20000 && v < 80000) return new Date(Math.round((v - 25569) * 86400000) + 12 * 3600000);   // Excel/Sheets serial (noon avoids TZ drift)
    const t = String(v || '').trim(); if (!t) return null;
    let m = t.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);                   // dd.mm.yyyy / dd/mm/yyyy (or mm/dd/yyyy when unambiguous)
    if (m) { let dd = +m[1], mm = +m[2]; if (mm > 12 && dd <= 12) { const t2 = dd; dd = mm; mm = t2; } if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
             const d = new Date(+m[3], mm - 1, dd); return isNaN(d) ? null : d; }
    m = t.match(/^(\d{4})[./-](\d{1,2})(?:[./-](\d{1,2}))?/);                  // yyyy-mm(-dd)
    if (m) { const d = new Date(+m[1], +m[2] - 1, m[3] ? +m[3] : 1); return isNaN(d) ? null : d; }
    const d = new Date(t); return isNaN(d) ? null : d;
  };
  let y = NaN, mo = NaN;
  // Year: "2026", 2026, "FY26", "2026.0"
  if (typeof year === 'number') y = Math.round(year);
  else { const ym = String(year || '').match(/(\d{4})/); if (ym) y = +ym[1]; else { const y2 = String(year || '').match(/(?:^|\D)(\d{2})$/); if (y2) y = 2000 + +y2[1]; } }
  // Month: 9, "9", "09", "Sep", "September", "Sep-26", "September 2026", "2026-09", "09/2026", a Date, a serial
  if (typeof month === 'number' && month >= 1 && month <= 12) mo = Math.round(month);
  else {
    const md = (typeof month === 'number' || month instanceof Date) ? toDate(month) : null;
    if (md) { mo = md.getMonth() + 1; if (isNaN(y)) y = md.getFullYear(); }
    else {
      const ms = String(month || '').trim().toLowerCase();
      let m = ms.match(/^(\d{1,2})$/); if (m) mo = +m[1];
      if (isNaN(mo)) { const i = MONTHS_.findIndex(n => ms.startsWith(n)); if (i >= 0) mo = i + 1; }
      if (isNaN(mo)) { m = ms.match(/^(\d{4})[./-](\d{1,2})/); if (m) { mo = +m[2]; if (isNaN(y)) y = +m[1]; } }
      if (isNaN(mo)) { m = ms.match(/^(\d{1,2})[./-](\d{4})/); if (m) { mo = +m[1]; if (isNaN(y)) y = +m[2]; } }
      if (isNaN(y)) { m = ms.match(/(\d{4})/); if (m) y = +m[1]; else { m = ms.match(/[a-z]+[\s-]*'?(\d{2})$/); if (m) y = 2000 + +m[1]; } }
    }
  }
  if (isNaN(y) || isNaN(mo)) {
    const d = toDate(startDate);
    if (d) { if (isNaN(y)) y = d.getFullYear(); if (isNaN(mo)) mo = d.getMonth() + 1; }
  }
  if (isNaN(y) || isNaN(mo) || mo < 1 || mo > 12) return '';
  return `${y}-${String(mo).padStart(2, '0')}`;
}

function writeData_(headers, rows, targetSs) {
  const ss = targetSs || SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CFG.SHEETS.DATA);
  if (!sh) sh = ss.insertSheet(CFG.SHEETS.DATA);
  sh.clearContents();
  ensureColumns_(sh, headers.length);
  ensureRows_(sh, rows.length + 1);
  const extra = sh.getMaxRows() - (rows.length + 1);
  if (extra > 0) sh.deleteRows(rows.length + 2, extra);      // trim: reads stay proportional to real data
  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  // Period ("2026-02") must stay text — Sheets would otherwise turn it into a date
  const periodCol = headers.indexOf('Period') + 1;
  if (periodCol && rows.length) sh.getRange(2, periodCol, rows.length, 1).setNumberFormat('@');
  if (rows.length) sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sh.setFrozenRows(1);
  if (isPrint_() && (!targetSs || targetSs.getId() === SpreadsheetApp.getActiveSpreadsheet().getId())) {
    DATA_CACHE_ = { headers: headers.slice(), rows };   // in-memory copy for the rest of this execution
    protectDataTab_(sh);
  }
  // Number formats on money/quantity columns
  [...CFG.NUMERIC_COLS, 'Billed Revenue', 'Gross Earned Blended Revenue', 'Rate Card Earned', 'Adjusted Rate Card Earned', ...fxDerivedColumns_()].forEach(c => {
    const i = headers.indexOf(c);
    if (i >= 0 && rows.length) sh.getRange(2, i + 1, rows.length, 1).setNumberFormat('#,##0.00');
  });
  CFG.DATE_COLS.forEach(c => {
    const i = headers.indexOf(c);
    if (i >= 0 && rows.length) sh.getRange(2, i + 1, rows.length, 1).setNumberFormat('yyyy-mm-dd');
  });
  ['Commission Earned', 'Contract Discount Earned', 'Client Discount Earned', 'Tier Adjustment Earned', 'Priced Earned'].forEach(c => { const i = headers.indexOf(c); if (i >= 0 && rows.length) sh.getRange(2, i + 1, rows.length, 1).setNumberFormat('#,##0.00'); });
  [['Pages', '0.00'], ['Earned Fraction', '0.00'], ['Insert Weight (g)', '0'], ['Insert Pages', '0']].forEach(([c, f]) => { const i = headers.indexOf(c); if (i >= 0 && rows.length) sh.getRange(2, i + 1, rows.length, 1).setNumberFormat(f); });
}

/** Import-log notes for the Print profile: unclassified page cats, Actual Space checks, commercial terms seen. */
function printImportNotes_(rows, iCat, iGroup, iCheck, iTerm, iSrc, iEarned, iFam) {
  const notes = [];
  const un = {}, chk = {}, terms = {}, src = {}, srcK = {};
  rows.forEach(r => {
    if (r[iGroup] === CFG.PAGECAT_UNCLASSIFIED) un[r[iCat]] = (un[r[iCat]] || 0) + 1;
    const c = String(r[iCheck] || ''); if (c) { const k = c.split(/[ ;(]/)[0]; chk[k] = (chk[k] || 0) + 1; }
    if (r[iTerm]) terms[r[iTerm]] = (terms[r[iTerm]] || 0) + 1;
    if (iSrc >= 0) { const k = String(r[iSrc] || 'none'); src[k] = (src[k] || 0) + 1; srcK[k] = (srcK[k] || 0) + (iEarned >= 0 && typeof r[iEarned] === 'number' ? r[iEarned] : 0); }
  });
  const top = (o, n) => Object.keys(o).sort((a, b) => o[b] - o[a]).slice(0, n).map(k => `${k} ×${o[k]}`).join(', ');
  if (iSrc >= 0) {
    const tot = Object.values(srcK).reduce((a, b) => a + b, 0) || 1;
    notes.push(`Gross basis per drop: ${Object.keys(src).sort((a, b) => src[b] - src[a]).map(k => `${k} ${src[k]} drops (${Math.round(100 * srcK[k] / tot)}% of earned)`).join(' · ')}. Drops without a rate card count in earned and pages but not in yield.`);
    const unk = Object.keys(RC_UNKNOWN_); if (unk.length) notes.push(`Rate card tiers not recognised (treated as negotiated discount): ${unk.slice(0, 10).map(k => `${k} ×${RC_UNKNOWN_[k]}`).join(', ')}`);
    if (RC_MISMATCH_) notes.push(`Rate card text where price + adjustments ≠ AdjustedRateCard (±0.05): ${RC_MISMATCH_} drops — gross taken from the text's components`);
  }
  if (iFam >= 0) { const fam = {}; rows.forEach(r => { const k = String(r[iFam] || '(blank)'); fam[k] = (fam[k] || 0) + 1; }); notes.push(`Brand families (from Parent Site "XX - Brand"): ${Object.keys(fam).sort((a, b) => fam[b] - fam[a]).map(k => `${k} ×${fam[k]}`).join(', ')}`); }
  if (Object.keys(un).length) notes.push(`Unclassified Page Cat (add a rule in Settings → Page category groups): ${top(un, 12)}`);
  if (Object.keys(chk).length) notes.push(`Actual Space check: ${Object.keys(chk).map(k => `${k} ${chk[k]}`).join(', ')} — see "Space Check" in Data`);
  if (Object.keys(terms).length) notes.push(`Commercial terms in Path 5 (treated as Standard placement): ${top(terms, 8)}`);
  return notes;
}

/* ------------------------------------------------------------------ */
/* Exchange rates                                                      */
/* ------------------------------------------------------------------ */

/**
 * Creates the "FX Rates" tab if missing and adds any currency not yet listed.
 * Existing rates are never overwritten — the sheet is the single place to maintain them.
 * Rate = multiply a local amount by this to get the reporting currency.
 */
/**
 * FX Rates tab = one matrix, cell(from, to) = 1 unit of "from" = ? "to".
 * INPUT cells (yellow): the reporting-currency COLUMN, i.e. "1 GBP = ? EUR" — the same direction as
 * AdBook's Source → Target rate, so the export's number is entered as-is.
 * All other cells are formulas; the diagonal is 1. A derived table (columns L:M) repeats the inputs
 * for the reports and the Data formulas.
 */
const FX = { MATRIX_ROW: 2, MATRIX_COL: 1, DERIVED_COL: 12 /* L */, INPUT_BG: '#fff3bf' };

function ensureFxSheet_(ss, currencies, cfg) {
  let sh = ss.getSheetByName(CFG.FX_SHEET);
  if (!sh) sh = ss.insertSheet(CFG.FX_SHEET);
  const base = cfg.reportingCurrency;

  // 1. Collect existing "1 X = ? base" values from any previous layout
  const toBase = readFxToBase_(sh, base);
  const ok = c => /^[A-Z]{3}$/.test(c);
  Object.keys(toBase).forEach(c => { if (!ok(c)) delete toBase[c]; });
  Object.values(cfg.marketCurrencies).forEach(c => { if (ok(c) && !(c in toBase)) toBase[c] = ''; });
  Object.keys(currencies || {}).forEach(c => { if (ok(c) && !(c in toBase)) toBase[c] = ''; });
  toBase[base] = 1;
  const codes = Object.keys(toBase).sort((a, b) => a === base ? -1 : b === base ? 1 : a.localeCompare(b));
  const n = codes.length;

  // 2. Rewrite the tab
  sh.clear(); sh.clearFormats(); sh.getBandings().forEach(b => b.remove());
  sh.setHiddenGridlines(true);
  ensureColumns_(sh, Math.max(FX.DERIVED_COL + 3, n + 2));
  sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).setFontFamily('Roboto');
  const R = FX.MATRIX_ROW, C = FX.MATRIX_COL;
  const baseCol = C + 1;                      // reporting currency is always the first column
  const cellRef = (r, c) => `${columnLetter_(c)}${r}`;
  sh.getRange(1, 1).setValue(`Exchange rates — 1 unit of row currency = ? column currency. Type only in the yellow ${base} column (e.g. GBP → ${base} = 1.1647, exactly as in AdBook); everything else is computed.`).setFontWeight('bold');
  sh.getRange(R, C).setValue('From \\ To').setFontWeight('bold').setBackground('#e8ece5');
  sh.getRange(R, C + 1, 1, n).setValues([codes]).setFontWeight('bold').setBackground('#e8ece5').setHorizontalAlignment('center');
  codes.forEach((from, i) => {
    const r = R + 1 + i;
    sh.getRange(r, C).setValue(from).setFontWeight('bold').setBackground('#e8ece5');
    codes.forEach((to, j) => {
      const c = C + 1 + j, cell = sh.getRange(r, c);
      if (i === j) { cell.setValue(1).setFontColor('#9aa39d'); return; }
      if (to === base) { cell.setValue(toBase[from] === '' ? '' : toBase[from]).setBackground(FX.INPUT_BG); return; }   // input: 1 from = ? base
      // 1 from = ? to  =  (1 from = ? base) / (1 to = ? base)
      cell.setFormula(`=IFERROR(${cellRef(r, baseCol)}/${cellRef(R + 1 + j, baseCol)}, "")`);
    });
  });
  sh.getRange(R + 1, C + 1, n, n).setNumberFormat('0.0000').setHorizontalAlignment('right');
  sh.setColumnWidth(C, 90); sh.setColumnWidths(C + 1, n, 90);
  sh.getRange(R + n + 2, 1).setValue(`Read: row GBP, column ${base} = how many ${base} one GBP is worth. A blank input counts as 1 (no conversion).`).setFontColor('#5f6b63');
  const missing = codes.filter(c => c !== base && toBase[c] === '');
  if (missing.length) sh.getRange(R + n + 3, 1).setValue(`Missing rate(s): ${missing.join(', ')} — fill the yellow cell(s).`).setFontColor('#a53a2f').setFontWeight('bold');

  // 3. Derived table used by the reports: 1 unit of X = ? base (mirrors the yellow column)
  const D = FX.DERIVED_COL;
  sh.getRange(1, D).setValue('Used by the reports (computed)').setFontWeight('bold').setFontColor('#5f6b63');
  sh.getRange(R, D, 1, 2).setValues([['Currency', `1 unit = ? ${base}`]]).setFontWeight('bold').setBackground('#e8ece5');
  codes.forEach((code, i) => {
    sh.getRange(R + 1 + i, D).setValue(code);
    sh.getRange(R + 1 + i, D + 1).setFormula(code === base ? '=1' : `=IF(ISNUMBER(${cellRef(R + 1 + i, baseCol)}), ${cellRef(R + 1 + i, baseCol)}, 1)`);
  });
  sh.getRange(R + 1, D + 1, n, 1).setNumberFormat('0.000000').setFontColor('#5f6b63');
  sh.setColumnWidth(D, 90).setColumnWidth(D + 1, 120);
  sh.setFrozenRows(0);
}

/** Reads "1 X = ? base" per currency from the current tab, whatever layout it has. Re-bases if the base changed. */
function readFxToBase_(sh, base) {
  const out = {};
  const vals = sh.getDataRange().getValues();
  if (!vals.length) return out;
  const a1 = String(vals[0][0] || '');
  const isCode = v => /^[A-Z]{3}$/.test(String(v || '').trim().toUpperCase());
  if (a1.startsWith('Exchange rates')) {
    const hdr = vals[FX.MATRIX_ROW - 1] || [];
    const codes = [], colOf = {};
    for (let j = 1; j < Math.min(hdr.length, FX.DERIVED_COL - 1); j++) { if (!isCode(hdr[j])) continue; const c = String(hdr[j]).toUpperCase().trim(); codes.push(c); colOf[c] = j; }
    const oldBase = codes[0];                                      // base is always the first column/row
    if (!oldBase) return out;
    const rowOf = {}; for (let i = 0; i < codes.length; i++) rowOf[codes[i]] = FX.MATRIX_ROW + i;
    codes.forEach(c => { const v = (vals[rowOf[c]] || [])[colOf[oldBase]]; out[c] = c === oldBase ? 1 : ((typeof v === 'number' && v > 0) ? v : ''); });
    if (oldBase !== base && typeof out[base] === 'number' && out[base] > 0) {
      // Re-base: 1 X = ? newBase  =  (1 X = ? oldBase) / (1 newBase = ? oldBase)
      const k = out[base];
      Object.keys(out).forEach(c => { if (typeof out[c] === 'number') out[c] = out[c] / k; });
    }
  } else if (a1 === 'Currency') {                                  // list layout: A = code, B = 1 unit = ? base
    vals.slice(1).forEach(r => { const c = String(r[0] || '').toUpperCase().trim(); if (!isCode(c)) return;
      out[c] = (typeof r[1] === 'number' && r[1] > 0) ? r[1] : ''; });
  }
  return out;
}

/** Kept for compatibility. */
function writeFxMatrix_(sh, cfg) { ensureFxSheet_(SpreadsheetApp.getActiveSpreadsheet(), {}, cfg); }

/** Writes ARRAYFORMULAs for FX Rate and the converted money columns so Data reacts live to FX Rates edits. */
function setFxFormulas_(sh, headers, nRows) {
  if (!nRows) return;
  const L = n => columnLetter_(n);
  const curCol = L(headers.indexOf('FX Currency') + 1);
  const fxIdx = headers.indexOf('FX Rate') + 1;
  const fxCol = L(fxIdx);
  const dl = columnLetter_(FX.DERIVED_COL), dr = columnLetter_(FX.DERIVED_COL + 1);
  const N = nRows + 1;   // bounded ranges: no spill below the data
  const lookup = `IFERROR(VLOOKUP(${curCol}2:${curCol}${N},'${CFG.FX_SHEET}'!$${dl}:$${dr},2,FALSE),1)`;
  sh.getRange(2, fxIdx).setFormula(`=ARRAYFORMULA(IF(LEN(${curCol}2:${curCol}${N}), IF(ISNUMBER(${lookup}), ${lookup}, 1), ""))`);
  sh.getRange(2, fxIdx, nRows, 1).setNumberFormat('0.000000');
  fxDerivedColumns_().forEach(name => {
    const local = name.replace(/ \([A-Z]{3}\)$/, '');
    const li = headers.indexOf(local), ci = headers.indexOf(name);
    if (li < 0 || ci < 0) return;
    const lc = L(li + 1);
    // non-numeric locals become true blanks (IFERROR(1/0)) so QUERY keeps the column numeric
    sh.getRange(2, ci + 1).setFormula(`=ARRAYFORMULA(IF(ISNUMBER(${lc}2:${lc}${N}), ${lc}2:${lc}${N}*${fxCol}2:${fxCol}${N}, IFERROR(1/0)))`);
  });
}

/* ------------------------------------------------------------------ */
/* Import log + triggers                                               */
/* ------------------------------------------------------------------ */

/** The Data tab is written only by the import; a person editing, sorting or deleting in it silently changes every report built from it (Rebuild reads the tab as it is). Warning-only protection: editors get a prompt, the script keeps full access. */
function protectDataTab_(sh) {
  try {
    (sh.getProtections ? sh.getProtections(SpreadsheetApp.ProtectionType.SHEET) : []).forEach(p => { try { p.remove(); } catch (e) {} });
    sh.protect().setDescription('Data tab — written by the import. Do not edit, sort or delete here: every report is built from it. To check a figure, copy the tab or use the Excel download.').setWarningOnly(true);
  } catch (e) { Logger.log('Data tab protection skipped: ' + e.message); }
}

function getOrCreateLogSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CFG.SHEETS.LOG);
  if (!sh) {
    sh = ss.insertSheet(CFG.SHEETS.LOG);
    sh.getRange(1, 1, 1, 12).setValues([['Imported at', 'By', 'Source', 'Rows', 'Missing columns', 'Dedupe key', 'Report run date', 'Number format detected', 'Changes vs previous (+added / −removed / ~changed)', 'Step timings', 'Background build', 'Build check']]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function logImport_(source, rows, missing, fileId, values, decimalSep, changes, timings) {
  const sh = getOrCreateLogSheet_();
  let key = '';
  if (fileId) { try { const f = DriveApp.getFileById(fileId); key = `${fileId}|${f.getLastUpdated().getTime()}`; } catch (e) {} }
  const runIdx = values[0].map(h => normalizeHeader_(h)).indexOf('report run date');
  const runDate = runIdx >= 0 && values[1] ? values[1][runIdx] : '';
  sh.appendRow([new Date(), Session.getActiveUser().getEmail() || 'unknown', source, rows, missing.join(', '), key, runDate, decimalSep === ',' ? 'DE (1.234,56)' : 'EN (1,234.56)', changes || '', timings || '']);
}

const NIGHTLY = { HOUR: 0, TZ: 'Europe/Berlin' };

/** Nightly import of the newest file in the Drive folder at 00:00 Europe/Berlin. */
function installDailyTrigger() {
  const cfg = getConfig();
  if (!cfg.driveFolderId) throw new Error('Set the Drive folder in ⚙ Settings first — the nightly job imports the newest file from that folder.');
  removeTriggers();
  ScriptApp.newTrigger('nightlyImport').timeBased().everyDays(1).atHour(NIGHTLY.HOUR).nearMinute(5).inTimezone(NIGHTLY.TZ).create();
  toast_(`Nightly import scheduled for ${String(NIGHTLY.HOUR).padStart(2, '0')}:00–${String(NIGHTLY.HOUR).padStart(2, '0')}:15 ${NIGHTLY.TZ}. Drop the AdBook+ export into the Drive folder before then.`);
}

function removeTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === 'importLatestFromDrive' || t.getHandlerFunction() === 'nightlyImport') ScriptApp.deleteTrigger(t);
  });
}

/** Trigger entry point: import, then email the outcome to the configured recipients. */
function nightlyImport() {
  const cfg = getConfig();
  const t0 = new Date();
  let subject, body;
  try {
    const res = importLatestFromDrive();                // returns undefined when nothing new
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const log = ss.getSheetByName(CFG.SHEETS.LOG);
    const last = log && log.getLastRow() > 1 ? log.getRange(log.getLastRow(), 1, 1, 9).getValues()[0] : null;
    if (!res) {
      subject = `${profile_().title} — nightly import: no new file`;
      body = `No new CSV/XLSX file was found in the Drive folder at ${fmtTs_(t0)}. Yesterday's data and comparison are unchanged.\n\nSheet: ${ss.getUrl()}`;
    } else {
      subject = `${profile_().title} — nightly import OK (${res.rows} rows)`;
      try { if (cfg.digest && cfg.digest.length) sendChangesDigest(); } catch (e) { Logger.log('Digest not sent: ' + e.message); }
      body = `Imported ${res.rows} rows at ${fmtTs_(t0)}.\n` +
        (last ? `Report run date: ${last[6] instanceof Date ? fmtTs_(last[6]) : last[6]}\nChanges vs previous: ${last[8] || '—'}\n` : '') +
        (res.missingColumns && res.missingColumns.length ? `\nNotes: ${res.missingColumns.join('; ')}\n` : '') +
        `\nSheet: ${ss.getUrl()}\nWeb app: ${webAppUrl_()}\n\nMarket files are refreshing in the background (see the "Market files" tab).`;
    }
  } catch (e) {
    subject = `${profile_().title} — nightly import FAILED`;
    body = `The nightly import failed at ${fmtTs_(t0)}:\n\n${e.message}\n\nCheck Apps Script → Executions for details. Sheet: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`;
  }
  notify_(cfg, subject, body);
}

function fmtTs_(d) { return Utilities.formatDate(d, NIGHTLY.TZ, 'd MMM yyyy HH:mm') + ' ' + NIGHTLY.TZ.split('/')[1]; }
function webAppUrl_() { try { return ScriptApp.getService().getUrl() || '(deploy the web app to get a link)'; } catch (e) { return ''; } }
function notify_(cfg, subject, body) {
  const to = (cfg.notify && cfg.notify.length) ? cfg.notify : [ownerEmail_() || Session.getEffectiveUser().getEmail()];
  try { MailApp.sendEmail({ to: to.join(','), subject, body }); } catch (e) { Logger.log('Notification failed: ' + e.message); }
}

let PROGRESS_T0_ = 0, PROGRESS_STEP_ = 0, PROGRESS_TOTAL_ = 0, PROGRESS_MUTE_ = false, PROGRESS_LAST_ = 0, PROGRESS_LOG_ = [], PROGRESS_NAME_ = '';
/** Start a progress sequence (shown as persistent toasts in the sheet). */
function progressStart_(total, title) { PROGRESS_T0_ = Date.now(); PROGRESS_LAST_ = PROGRESS_T0_; PROGRESS_LOG_ = []; PROGRESS_NAME_ = ''; PROGRESS_STEP_ = 0; PROGRESS_TOTAL_ = total; progress_(title || 'Starting…'); }
/** Show the next step. Toasts stay until replaced, so the user always sees what is happening. */
function progress_(msg, sub) {
  if (PROGRESS_MUTE_) return;                      // nested builds (market files) report via progressSub_ only
  const now = Date.now();
  if (PROGRESS_NAME_) PROGRESS_LOG_.push(`${PROGRESS_NAME_} ${Math.round((now - PROGRESS_LAST_) / 1000)}s`);
  PROGRESS_NAME_ = String(msg).replace(/…$/, '').slice(0, 28); PROGRESS_LAST_ = now;
  if (PROGRESS_TOTAL_) PROGRESS_STEP_++;
  const secs = PROGRESS_T0_ ? Math.round((Date.now() - PROGRESS_T0_) / 1000) : 0;
  const head = PROGRESS_TOTAL_ ? `Step ${Math.min(PROGRESS_STEP_, PROGRESS_TOTAL_)}/${PROGRESS_TOTAL_} · ${secs}s` : profile_().shortTitle;
  try { SpreadsheetApp.getActiveSpreadsheet().toast(msg + (sub ? `\n${sub}` : ''), head, -1); } catch (e) { Logger.log(`${head}: ${msg}`); }
}
/** Sub-progress without advancing the step counter (e.g. "market 3 of 6"). */
function progressSub_(msg) {
  const secs = PROGRESS_T0_ ? Math.round((Date.now() - PROGRESS_T0_) / 1000) : 0;
  try { SpreadsheetApp.getActiveSpreadsheet().toast(msg, `Step ${Math.min(PROGRESS_STEP_, PROGRESS_TOTAL_ || PROGRESS_STEP_)}/${PROGRESS_TOTAL_ || '?'} · ${secs}s`, -1); } catch (e) {}
}
/** "step 3s · step 12s · …" for the Import Log. */
function progressTimings_() { const now = Date.now(); const cur = PROGRESS_NAME_ ? [`${PROGRESS_NAME_} ${Math.round((now - PROGRESS_LAST_) / 1000)}s`] : []; return [...PROGRESS_LOG_, ...cur].join(' · '); }
function progressDone_(summary) {
  const secs = PROGRESS_T0_ ? Math.round((Date.now() - PROGRESS_T0_) / 1000) : 0;
  PROGRESS_TOTAL_ = 0; PROGRESS_STEP_ = 0;
  try { SpreadsheetApp.getActiveSpreadsheet().toast(`${summary} · finished in ${secs}s`, '✓ Done', 10); } catch (e) {}
}

function toast_(msg) {
  try { SpreadsheetApp.getActiveSpreadsheet().toast(msg, 'AdBook+ Revenue', 6); } catch (e) { Logger.log(msg); }
}

/* ===================== Dashboard ===================== */
/**
 * AdBook+ Revenue Review — In-sheet Dashboard
 * --------------------------------------------
 * "Pivots" holds live QUERY() summaries over the Data tab (they recalc automatically
 * whenever Data changes). "Dashboard" shows KPIs + charts built on those pivots.
 * Rebuild any time via menu → Rebuild dashboard.
 */

function buildDashboard(inImport) {
  if (inImport) return buildDashboardLocked_(true);            // caller already holds the lock
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10 * 60 * 1000)) throw new Error('Another import or rebuild is still running. Please wait for it to finish and try again.');
  try { return buildDashboardLocked_(false); } finally { lock.releaseLock(); }
}

function applyExchangeRates() {
  if (!isPrint_()) return buildDashboard();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10 * 60 * 1000)) throw new Error('Another import or rebuild is still running. Please wait for it to finish and try again.');
  try { CONFIG_CACHE_ = null; FX_CACHE_ = null; DATA_CACHE_ = null; progressStart_(3, 'Applying exchange rates…'); progress_('Re-stamping currency values in Data…'); restampFx_(SpreadsheetApp.getActiveSpreadsheet()); buildDashboardLocked_(false, true); } finally { lock.releaseLock(); }
}

function buildDashboardLocked_(inImport, nested) {
  CONFIG_CACHE_ = null; FX_CACHE_ = null; if (!nested) DATA_CACHE_ = null;   // always start from the current Settings / FX Rates
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (isPrint_()) {   // print master: cube now (web app), every tab in the background
    if (!inImport && !nested) progressStart_(2, 'Rebuilding reports…');
    progress_('Pre-computing the web cube…');
    buildPrintCube_(ss);
    progress_('Queuing Dashboard, Review, Regions, market tabs and Changes for the background build…');
    scheduleBuild_(BUILD.STEPS);
    progressDone_('Web app updated · sheet tabs refresh in the background (status on the Dashboard tab and in the Import Log)');
    return;
  }
  if (!inImport) progressStart_(3, 'Rebuilding reports…');
  progress_('Building Dashboard, Pivots and Review…');
  buildDashboardFor_(ss);
  if (getConfig().marketFiles) { progress_('Queuing market files for background refresh (see the "Market files" tab)…'); scheduleMarketFiles_(ss); }
  else if (!inImport) progress_('Market files are switched off in Settings — skipped.');
  if (!inImport) progressDone_('Dashboard, Review, Regions and market tabs rebuilt · market files refreshing in the background');
}

/** Builds every report tab inside the given spreadsheet (master or a market file). */
function buildDashboardFor_(ss) {
  const data = ss.getSheetByName(CFG.SHEETS.DATA);
  if (!data || data.getLastRow() < 2) throw new Error('No data yet — import a report first.');
  const cfg = getConfig();
  const headers = data.getRange(1, 1, 1, data.getLastColumn()).getValues()[0];
  const col = name => { const i = headers.indexOf(name); if (i < 0) throw new Error(`Column not found in Data: ${name}`); return i + 1; };
  const M = name => col(moneyCol_(headers, name));
  const kpiLabel = moneyCol_(headers, cfg.kpiCol);

  const C = {
    kpi: M(cfg.kpiCol), billed: M(CFG.BILLED_COL), billable: M(CFG.BILLABLE_COL), earned: M(CFG.EARNED_COL),
    region: col('Region'), period: col('Period'), client: col('Client Name'), agency: col('Agency Name'),
    rep: col('Sales Rep'), platform: col('(Drop) SSG Platform'), billStatus: col('Billing Status'),
    ioStatus: col('IO Status'), campaign: col('Campaign ID'), runDate: col('Report Run Date'),
    category: col(nicheCol_(headers)), orderSource: col('(Campaign) Order Source'),
    adjEarned: M('Adjusted Earned Blended Revenue'), proRata: M('Pro-rata Revenue'),
    fee: headers.indexOf('Fee Type') + 1,
  };

  DATA_RANGE_ = `A:${columnLetter_(data.getLastColumn())}`;
  PERIOD_COL_ = C.period;
  const pv = buildPivots_(ss, C, kpiLabel);
  if (isPrint_()) buildPrintDashboardSheet_(ss, pv, C, kpiLabel); else buildDashboardSheet_(ss, pv, C, kpiLabel);
  buildReviewPivot_(ss);
  progress_(isPrint_() ? 'Building the Regions tab (market tabs refresh in the background)…' : 'Building the Regions tab and one tab per market…');
  buildRegionReports_(ss);
  orderMasterTabs_(ss);
}

/* ------------------------------------------------------------------ */

let DATA_RANGE_ = CFG.DATA_RANGE; // overwritten with the real width of Data at build time

let PERIOD_COL_ = 0;   // Data column number of Period, for the year clause

function q_(select, where, groupBy, orderBy, limit, extra) {
  // Clause order required by QUERY: select, where, group by, pivot, order by, limit, label
  const rng = `{${CFG.SHEETS.DATA}!${DATA_RANGE_}}`;
  const years = getConfig().sheetYears;
  if (years.length && PERIOD_COL_) {
    const yc = '(' + years.map(y => `Col${PERIOD_COL_} starts with '${y}'`).join(' or ') + ')';
    where = where ? `${where} and ${yc}` : yc;
  }
  let s = `select ${select}`;
  if (where) s += ` where ${where}`;
  if (groupBy) s += ` group by ${groupBy}`;
  if (extra && /^pivot\b/i.test(extra)) s += ` ${extra}`;
  if (orderBy) s += ` order by ${orderBy}`;
  if (limit) s += ` limit ${limit}`;
  if (extra && !/^pivot\b/i.test(extra)) s += ` ${extra}`;
  return `=IFERROR(QUERY(${rng}, "${s}", 1), "No data")`;
}

function buildPivots_(ss, C, kpiName) {
  let sh = ss.getSheetByName(CFG.SHEETS.PIVOTS);
  if (!sh) sh = ss.insertSheet(CFG.SHEETS.PIVOTS);
  sh.clear();
  ensureColumns_(sh, Math.max(30, periodCount_(ss) + 2));

  const k = `Col${C.kpi}`, notNull = `Col${C.kpi} is not null`;
  const lbl = `label sum(${k}) '${kpiName}'`;
  const blocks = [
    { key: 'byMonth',   title: 'Revenue by month',        anchor: 'A1',  rows: 26,
      f: q_(`Col${C.period}, sum(${k})`, `${notNull} and Col${C.period} is not null`, `Col${C.period}`, `Col${C.period}`, 0, lbl) },
    { key: 'byRegion',  title: 'Revenue by region',       anchor: 'D1',  rows: 26,
      f: q_(`Col${C.region}, sum(${k})`, notNull, `Col${C.region}`, `sum(${k}) desc`, 0, lbl) },
    { key: 'byPlatform',title: 'Revenue by platform',     anchor: 'G1',  rows: 26,
      f: q_(`Col${C.platform}, sum(${k})`, notNull, `Col${C.platform}`, `sum(${k}) desc`, 0, lbl) },
    { key: 'topClients',title: 'Top 10 clients',          anchor: 'J1',  rows: 11,
      f: q_(`Col${C.client}, sum(${k})`, notNull, `Col${C.client}`, `sum(${k}) desc`, 10, lbl) },
    { key: 'topAgencies',title:'Top 10 agencies',         anchor: 'M1',  rows: 11,
      f: q_(`Col${C.agency}, sum(${k})`, notNull, `Col${C.agency}`, `sum(${k}) desc`, 10, lbl) },
    { key: 'byRep',     title: 'Revenue by sales rep',    anchor: 'P1',  rows: 26,
      f: q_(`Col${C.rep}, sum(${k})`, notNull, `Col${C.rep}`, `sum(${k}) desc`, 0, lbl) },
    { key: 'byBilling', title: 'Revenue by billing status', anchor: 'S1', rows: 11,
      f: q_(`Col${C.billStatus}, sum(${k})`, notNull, `Col${C.billStatus}`, `sum(${k}) desc`, 0, lbl) },
    { key: 'byIO',      title: 'Revenue by IO status',    anchor: 'V1',  rows: 11,
      f: q_(`Col${C.ioStatus}, sum(${k})`, notNull, `Col${C.ioStatus}`, `sum(${k}) desc`, 0, lbl) },
    { key: 'byCategory',title: 'Revenue by niche', anchor: 'Y1',  rows: 16,
      f: q_(`Col${C.category}, sum(${k})`, notNull, `Col${C.category}`, `sum(${k}) desc`, 0, lbl) },
    { key: 'regionMonth', title: 'Region × month', anchor: 'A30', rows: 26, wide: true, width: periodCount_(ss) + 1,
      f: q_(`Col${C.region}, sum(${k})`, `${notNull} and Col${C.period} is not null`, `Col${C.region}`, `Col${C.region}`, 0, `pivot Col${C.period}`) },
    { key: 'billedVsBlended', title: 'Billed vs blended by month', anchor: 'A60', rows: 26,
      f: q_(`Col${C.period}, sum(${k}), sum(Col${C.billed}), sum(Col${C.billable})`,
            `Col${C.period} is not null`, `Col${C.period}`, `Col${C.period}`, 0,
            `label sum(${k}) '${kpiName}', sum(Col${C.billed}) 'Actual Billed', sum(Col${C.billable}) 'Adjusted Billable'`) },
  ];

  const out = {};
  blocks.forEach(b => {
    const cell = sh.getRange(b.anchor);
    cell.setFormula(b.f);
    const r = cell.getRow(), c = cell.getColumn();
    const width = b.width || (b.key === 'billedVsBlended' ? 4 : 2);
    out[b.key] = { range: sh.getRange(r, c, b.rows, width), title: b.title };
    sh.getRange(r, c, b.rows, width).setNumberFormat(getConfig().numberFormat);
    sh.getRange(r, c, 1, width).setFontWeight('bold').setBackground('#f3f5f1');
  });
  sh.setColumnWidths(1, 28, 150);
  return out;
}

/* ------------------------------------------------------------------ */

function buildDashboardSheet_(ss, pv, C, kpiName) {
  let sh = ss.getSheetByName(CFG.SHEETS.DASH);
  if (!sh) sh = ss.insertSheet(CFG.SHEETS.DASH, 0);
  resetSheet_(sh);
  ensureColumns_(sh, 14);
  sh.setColumnWidth(1, 170); sh.setColumnWidths(2, 13, 110);

  const sd = scopedData_(ss);
  const headers = sd.headers;
  const split = computeRegionSplit_(headers, sd.rows);
  const T = split.totals, P = split.periods, N = split.niches;
  const cfg = getConfig();
  const cur = currencyOf_(headers);
  const D = CFG.SHEETS.DATA, L = n => columnLetter_(n), rng = n => `${D}!${L(n)}2:${L(n)}`;

  // Title
  let row = 1;
  sh.getRange(row, 1).setValue(`${profile_().title} — ${yearLabel_()}`).setFontSize(20).setFontWeight('bold'); row++;
  sh.getRange(row, 1).setFormula(`="Report run "&TEXT(MAX(${rng(C.runDate)}),"d mmm yyyy")&"  ·  ${sd.rows.length} line items  ·  all figures in ${cur}  ·  generated "&TEXT(NOW(),"d mmm yyyy HH:mm")`).setFontColor('#5f6b63');
  if (BILLED_FALLBACK_) { row++; sh.getRange(row, 1).setValue('Note: "Billed revenue" is using AdBook\'s Actual Billed Amount because this Data tab predates the Billing Status logic — re-import the report to switch.').setFontColor('#a53a2f'); }
  row += 2;

  // KPI cards (live formulas)
  // Live SUMIF when Data has the Fee Type column; otherwise the value computed from Position Path at build time
  const cardRows = [
    [[kpiName, T.kpi, '#1e3a5f', cfg.numberFormat],
     ['Billed (status complete)', T.billed, '#b8933f', cfg.numberFormat],
     ['Adjusted billable', T.billable, '#1b2430', cfg.numberFormat],
     ['Billed ÷ blended', pct0_(T.billed, T.kpi), '#1b2430', '0.0%'],
     ['Campaigns', T.campaigns, '#1b2430', '#,##0'],
     ['Clients', T.clients, '#1b2430', '#,##0']],
    [['Talent fee internal — blended', T.feeInternal, '#1e3a5f', cfg.numberFormat],
     ['Talent fee internal — billed', T.feeInternalBilled, '#b8933f', cfg.numberFormat],
     ['Talent fee external — blended', T.feeExternal, '#1e3a5f', cfg.numberFormat],
     ['Talent fee external — billed', T.feeExternalBilled, '#b8933f', cfg.numberFormat],
     ['Regions', split.regions.length, '#1b2430', '#,##0'],
     ['Line items', sd.rows.length, '#1b2430', '#,##0']],
  ];
  cardRows.forEach((cards, ri) => {
    const r0 = row + ri * 4;
    cards.forEach((kp, i) => {
      const c = 1 + i * 2;
      sh.getRange(r0, c, 3, 2).setBackground('#ffffff').setBorder(true, true, true, true, false, false, '#d9ddd6', SpreadsheetApp.BorderStyle.SOLID);
      sh.getRange(r0, c, 1, 2).merge().setValue(kp[0]).setFontColor('#5f6b63').setFontSize(10).setVerticalAlignment('bottom');
      const cell = sh.getRange(r0 + 1, c, 2, 2).merge();
      if (typeof kp[1] === 'string' && kp[1].startsWith('=')) cell.setFormula(kp[1]); else cell.setValue(kp[1]);
      cell.setFontSize(ri ? 16 : 20).setFontWeight('bold').setFontColor(kp[2]).setVerticalAlignment('top').setNumberFormat(kp[3]);
    });
  });
  row += 8;

  // Highlights (static, rebuilt on every import / apply)
  const pct = (a, b) => b ? a / b : 0;
  const topN = o => Object.keys(o).sort((a, b) => o[b] - o[a])[0] || '';
  const best = P.length ? P.reduce((a, b) => (T.byPeriod[b] || 0) > (T.byPeriod[a] || 0) ? b : a) : '';
  const lastP = P[P.length - 1], prevP = P[P.length - 2];
  const mom = prevP && T.byPeriod[prevP] ? (T.byPeriod[lastP] - T.byPeriod[prevP]) / T.byPeriod[prevP] : '';
  const hl = [
    ['Largest market', split.regions[0] ? split.regions[0].name : '', split.regions[0] ? split.regions[0].kpi : 0, split.regions[0] ? pct(split.regions[0].kpi, T.kpi) : 0],
    ['Second market', split.regions[1] ? split.regions[1].name : '', split.regions[1] ? split.regions[1].kpi : 0, split.regions[1] ? pct(split.regions[1].kpi, T.kpi) : 0],
    ['Top niche', topN(T.byNiche), T.byNiche[topN(T.byNiche)] || 0, pct(T.byNiche[topN(T.byNiche)] || 0, T.kpi)],
    ['Largest client', topN(T.byClient), T.byClient[topN(T.byClient)] || 0, pct(T.byClient[topN(T.byClient)] || 0, T.kpi)],
    ['Strongest month', best ? split.monthName(best) : '', T.byPeriod[best] || 0, pct(T.byPeriod[best] || 0, T.kpi)],
    ['Latest month vs prior', lastP ? split.monthName(lastP) : '', T.byPeriod[lastP] || 0, mom],
  ];
  const t1 = row;
  row = writeBlock_(sh, row, 'Highlights', ['', 'Who / when', kpiName, 'Share / change'], hl, { money: [3], pct: [4] });

  // Revenue by year
  row = writeBlock_(sh, row, 'Revenue by year', ['Year', kpiName, 'Billed (complete)', 'Adjusted billable', 'Billed ÷ blended', 'Fee internal', 'Fee external', 'Campaigns'],
    yearTable_(headers, sd.rows), { money: [2, 3, 4, 6, 7], pct: [5], int: [8], totalRow: true });

  // Fee type split
  const F = Object.keys(T.byFee).sort((a, b) => T.byFee[b] - T.byFee[a]);
  const headF = ['Fee type (last segment of Position Path)', kpiName, 'Billed (status complete)', 'Billed ÷ blended', 'Share'];
  const rowsF = F.map(k => [k, T.byFee[k], T.byFeeBilled[k] || 0, pct(T.byFeeBilled[k] || 0, T.byFee[k]), pct(T.byFee[k], T.kpi)]);
  rowsF.push(['Total', T.kpi, T.billed, pct(T.billed, T.kpi), 1]);
  row = writeBlock_(sh, row, 'Revenue by fee type', headF, rowsF, { money: [2, 3], pct: [4, 5], totalRow: true });

  // Region split
  const head2 = ['Region', kpiName, 'Billed revenue', 'Fee internal', 'Fee external', 'US talent fees', 'Billed ÷ blended', 'Share', 'Campaigns', 'Top niche'];
  const rows2 = split.regions.map(r => [r.name, r.kpi, r.billed, r.feeInternal, r.feeExternal, r.feeUs, pct(r.billed, r.kpi), pct(r.kpi, T.kpi), r.campaigns, topN(r.byNiche)]);
  rows2.push(['Total', T.kpi, T.billed, T.feeInternal, T.feeExternal, T.feeUs, pct(T.billed, T.kpi), 1, T.campaigns, topN(T.byNiche)]);
  row = writeBlock_(sh, row, 'Revenue by region', head2, rows2, { money: [2, 3, 4, 5, 6], pct: [7, 8], int: [9], totalRow: true });
  // US fee breakdown (only when US lines exist)
  const usKeys = Object.keys(T.byUsFee || {});
  if (usKeys.length) {
    const rowsUs = usKeys.sort((a, b) => T.byUsFee[b] - T.byUsFee[a]).map(k => [k, T.byUsFee[k], T.byUsFeeBilled[k] || 0, pct(T.byUsFeeBilled[k] || 0, T.byUsFee[k]), pct(T.byUsFee[k], T.feeUs)]);
    rowsUs.push(['Total', T.feeUs, T.feeUsBilled, pct(T.feeUsBilled, T.feeUs), 1]);
    row = writeBlock_(sh, row, `US talent fees (${cfg.usMarket})`, ['Fee type', kpiName, 'Billed (complete)', 'Billed ÷ blended', 'Share of US fees'], rowsUs, { money: [2, 3], pct: [4, 5], totalRow: true });
  }

  // Region × month
  const head3 = ['Region', ...P.map(split.monthName), 'Total'];
  const rows3 = split.regions.map(r => [r.name, ...P.map(p => r.byPeriod[p] || 0), r.kpi]);
  rows3.push(['Total', ...P.map(p => T.byPeriod[p] || 0), T.kpi]);
  row = writeBlock_(sh, row, `Region × month — ${kpiName}`, head3, rows3, { money: range_(2, P.length + 2), totalRow: true });

  // Niche split
  const head4 = ['Niche (SSG Category)', kpiName, 'Billed revenue', 'Billed ÷ blended', 'Share', 'Campaigns'];
  const rows4 = N.map(k => [k, T.byNiche[k] || 0, T.nicheBilled[k] || 0, pct(T.nicheBilled[k] || 0, T.byNiche[k] || 0), pct(T.byNiche[k] || 0, T.kpi), T.nicheCampaigns[k] || 0]).sort((a, b) => b[1] - a[1]);
  rows4.push(['Total', T.kpi, T.billed, pct(T.billed, T.kpi), 1, T.campaigns]);
  row = writeBlock_(sh, row, 'Revenue by niche', head4, rows4, { money: [2, 3], pct: [4, 5], int: [6], totalRow: true });

  // Charts (live, from the Pivots tab)
  row = placeCharts_(sh, row, [
    { type: Charts.ChartType.COLUMN, range: pv.byMonth.range, title: `${kpiName} by month` },
    { type: Charts.ChartType.BAR, range: pv.byRegion.range, title: 'Revenue by region' },
    { type: Charts.ChartType.LINE, range: pv.billedVsBlended.range, title: 'Blended vs billed (complete) vs billable by month' },
    { type: Charts.ChartType.PIE, range: pv.byPlatform.range, title: 'Platform mix', options: { pieHole: 0.45 } },
    { type: Charts.ChartType.BAR, range: pv.topClients.range, title: 'Top 10 clients' },
    { type: Charts.ChartType.BAR, range: pv.byRep.range, title: 'Revenue by sales rep' },
    { type: Charts.ChartType.PIE, range: pv.byBilling.range, title: 'Billing status', options: { pieHole: 0.45 } },
    { type: Charts.ChartType.PIE, range: pv.byIO.range, title: 'IO status', options: { pieHole: 0.45 } },
  ], ss.getId && ss.getId() !== SpreadsheetApp.getActiveSpreadsheet().getId() ? 'detail' : 'dashboard');   // market files: charts only when "all"
  ss.setActiveSheet(sh);
}
/** Puts the master's tabs in presentation order and hides the working tabs. */
function pct0_(a, b) { return b ? a / b : 0; }

/** Year | KPI | billed | billable | billed÷blended | fee int | fee ext | campaigns, plus a total row. */
function yearTable_(headers, rows) {
  const idx = n => headers.indexOf(n), cfg = getConfig();
  const iP = idx('Period'), iK = idx(moneyCol_(headers, cfg.kpiCol)), iB = idx(moneyCol_(headers, CFG.BILLED_COL)), iBl = idx(moneyCol_(headers, CFG.BILLABLE_COL));
  const iF = idx('Fee Type'), iPath = idx(CFG.REGION_SOURCE_COL), iC = idx('Campaign ID');
  const n = v => typeof v === 'number' ? v : 0;
  const y = {};
  rows.forEach(r => { const yr = String(r[iP] || '').slice(0, 4); if (!/^\d{4}$/.test(yr)) return;
    const o = y[yr] = y[yr] || { k: 0, b: 0, bl: 0, fi: 0, fe: 0, c: new Set() };
    o.k += n(r[iK]); o.b += n(r[iB]); o.bl += n(r[iBl]); if (r[iC] !== '') o.c.add(String(r[iC]));
    const fee = iF >= 0 && r[iF] ? String(r[iF]) : deriveFeeType_(iPath >= 0 ? r[iPath] : '');
    const cls = classifyFee_(String(r[idx('Region')] || ''), fee); if (cls.kind === 'internal') o.fi += n(r[iK]); else if (cls.kind === 'external') o.fe += n(r[iK]); });
  const out = Object.keys(y).sort().map(yr => { const o = y[yr]; return [yr, o.k, o.b, o.bl, pct0_(o.b, o.k), o.fi, o.fe, o.c.size]; });
  const t = out.reduce((a, r) => { a[1] += r[1]; a[2] += r[2]; a[3] += r[3]; a[5] += r[5]; a[6] += r[6]; a[7] += r[7]; return a; }, ['Total', 0, 0, 0, 0, 0, 0, 0]);
  t[4] = pct0_(t[2], t[1]); out.push(t);
  return out;
}

function orderMasterTabs_(ss) {
  const names = [CFG.SHEETS.DASH, REGIONS.SHEET, REVIEW.SHEET, CHG.SHEET];
  ss.getSheets().map(s => s.getName()).filter(n => n.startsWith(REGIONS.PREFIX)).sort().forEach(n => names.push(n));
  names.push(MARKET.LINKS_SHEET, ACCESS.USAGE, NOTES.SHEET, CFG.FX_SHEET, CFG.SHEETS.CONFIG, CFG.SHEETS.RAW, CFG.SHEETS.DATA, CFG.SHEETS.LOG, CFG.SHEETS.PIVOTS, CHG.PREV_SHEET, ACCESS.SHEET);
  let pos = 1;
  names.forEach(n => { const sh = ss.getSheetByName(n); if (sh) { ss.setActiveSheet(sh); ss.moveActiveSheet(pos++); } });
  const piv = ss.getSheetByName(CFG.SHEETS.PIVOTS); if (piv) piv.hideSheet();
  const prev = ss.getSheetByName(CHG.PREV_SHEET); if (prev) prev.hideSheet();
  const acc = ss.getSheetByName(ACCESS.SHEET); if (acc) acc.hideSheet();
  [CUBE.SHEET, CUBE.LEAVES_SHEET, CUBE.ACCOUNTS_SHEET].forEach(n => { const c = ss.getSheetByName(n); if (c) c.hideSheet(); });
  const dash = ss.getSheetByName(CFG.SHEETS.DASH); if (dash) ss.setActiveSheet(dash);
}

/** Grows a sheet so it has at least n columns / rows (new sheets default to 26 × 1000). */
function ensureColumns_(sh, n) {
  const max = sh.getMaxColumns();
  if (max < n) sh.insertColumnsAfter(max, n - max);
}
function ensureRows_(sh, n) {
  const max = sh.getMaxRows();
  if (max < n) sh.insertRowsAfter(max, n - max);
}

/** Number of distinct Period values in Data (used to size month-wise tables). */
function periodCount_(ss) {
  const d = ss.getSheetByName(CFG.SHEETS.DATA);
  const h = d.getRange(1, 1, 1, d.getLastColumn()).getValues()[0];
  const i = h.indexOf('Period'); if (i < 0 || d.getLastRow() < 2) return 12;
  const vals = d.getRange(2, i + 1, d.getLastRow() - 1, 1).getValues().map(r => String(r[0])).filter(Boolean);
  return Math.max(1, new Set(vals).size);
}

function columnLetter_(n) {
  let s = '';
  while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

/* ===================== Review ===================== */
/**
 * AdBook+ Revenue Review — "Review" pivot
 * ----------------------------------------
 * Rows:    the profile's review dimensions (Talent: IO Status → Job Code → Drop ID → Fee Type → Campaign Name;
 *          Print: WD Platform → Brand → Path 2 → Book → Page Cat → Position Path → Campaign ID),
 *          with a "… gesamt" subtotal per first-level value and a Grand Total
 * Columns: Year → Month (only the months present in the data, in calendar order)
 * Measure: the profile's review measure (Talent: Adjusted Blended Revenue; Print: Adjusted Earned Blended Revenue)
 *
 * buildReviewPivot_() is called from buildDashboard(); computeReviewPivot_() is shared with the web app and Excel.
 */

const REVIEW = {
  SHEET: 'Review',
  SUBTOTAL_SUFFIX: ' gesamt',
  PRINT_ROW_CAP: 3000,
  GRAND_LABEL: 'Grand Total',
};

const MONTH_NAMES_ = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/**
 * Computes the pivot from rows already filtered by the caller.
 * @param {Array} headers  Data header row
 * @param {Array<Array>} rows  Data rows (filtered or not)
 * @return {{years:Array<{year:string, periods:string[]}>, periods:string[], groups:Array, grand:Object, grandTotal:number, measure:string, dims:string[]}}
 *   groups[i] = { io: <first-level value>, rows: [{ dims: [v1..vN], cells: {period: value}, total }], subtotal, subtotalTotal }
 */
function computeReviewPivot_(headers, rows) {
  const idx = n => headers.indexOf(n);
  let measure = moneyCol_(headers, reviewMeasure_()), iM = idx(measure);
  if (iM < 0) { measure = moneyCol_(headers, getConfig().kpiCol); iM = idx(measure); }   // fall back to the headline KPI
  const iP = idx('Period');
  const dims = reviewDims_();
  const dimIdx = dims.map(d => idx(d.col));
  const iPath = idx(CFG.REGION_SOURCE_COL);
  if (iM < 0 || iP < 0) throw new Error(`Review pivot needs "${measure}" and "Period" columns in Data.`);

  const periods = new Set();
  const tree = {};   // dim1 -> dim2 -> … -> {period: value}
  const s = v => (v === null || v === undefined) ? '' : String(v);
  const valueOf = (row, d) => {
    const i = dimIdx[d];
    if (dims[d].col === 'Fee Type' && (i < 0 || !s(row[i]))) return deriveFeeType_(iPath >= 0 ? row[iPath] : '');   // legacy Data without the column
    return i < 0 ? '(blank)' : (s(row[i]) || '(blank)');
  };
  for (const row of rows) {
    const v = typeof row[iM] === 'number' ? row[iM] : 0;
    const p = s(row[iP]); if (!p) continue;
    periods.add(p);
    let node = tree;
    for (let d = 0; d < dims.length; d++) { const k = valueOf(row, d); node = node[k] || (node[k] = {}); }
    node[p] = (node[p] || 0) + v;
  }

  const periodList = Array.from(periods).sort();
  const years = [];
  periodList.forEach(p => {
    const y = p.slice(0, 4);
    let yr = years.find(x => x.year === y);
    if (!yr) { yr = { year: y, periods: [] }; years.push(yr); }
    yr.periods.push(p);
  });

  const sumInto = (target, src) => { Object.keys(src).forEach(k => { target[k] = (target[k] || 0) + src[k]; }); };
  const total = o => periodList.reduce((a, p) => a + (o[p] || 0), 0);
  const sortKeys = (o, d) => Object.keys(o).sort(d === 2 && dims[d] && dims[d].col === 'Drop ID' ? (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }) : undefined);

  const groups = [];
  const grand = {};
  Object.keys(tree).sort().forEach(first => {
    const g = { io: first, rows: [], subtotal: {} };
    const walk = (node, d, path) => {
      if (d === dims.length) { g.rows.push({ dims: path.slice(), cells: node, total: total(node), job: path[1], drop: path[2], fee: path[3], campaign: path[4] }); sumInto(g.subtotal, node); return; }
      sortKeys(node, d).forEach(k => walk(node[k], d + 1, path.concat(k)));
    };
    sortKeys(tree[first], 1).forEach(k => walk(tree[first][k], 2, [first, k]));
    if (dims.length === 1) { g.rows.push({ dims: [first], cells: tree[first], total: total(tree[first]) }); sumInto(g.subtotal, tree[first]); }
    g.subtotalTotal = total(g.subtotal);
    sumInto(grand, g.subtotal);
    groups.push(g);
  });

  return { years, periods: periodList, groups, grand, grandTotal: total(grand), measure, dims: dims.map(d => d.label),
           monthName: periodList.reduce((m, p) => { m[p] = MONTH_NAMES_[parseInt(p.slice(5, 7), 10) - 1]; return m; }, {}) };
}

/** Writes the pivot to the "Review" sheet in the requested layout. */
function buildReviewPivot_(ss) {
  const sd = scopedData_(ss);
  const pv = computeReviewPivot_(sd.headers, excludeHouseAds_(sd.headers, sd.rows));
  let sh = ss.getSheetByName(REVIEW.SHEET);
  if (!sh) sh = ss.insertSheet(REVIEW.SHEET, 1);
  resetSheet_(sh);
  let note = '';
  if (isPrint_()) {   // print: every drop is a detail row — cap the sheet, subtotals/totals stay complete; the full pivot is in the Excel download
    const total = pv.groups.reduce((a, g) => a + g.rows.length, 0);
    if (total > REVIEW.PRINT_ROW_CAP) { let n = 0; pv.groups.forEach(g => { g.rows = g.rows.filter(() => n++ < REVIEW.PRINT_ROW_CAP); }); note = ` — first ${REVIEW.PRINT_ROW_CAP} of ${total} detail rows (subtotals complete; full pivot in the Excel download)`; }
  }
  writeReviewTable_(sh, pv, 1, { freeze: true, title: `Sum of ${pv.measure} — ${yearLabel_()}${note}` });
  return pv;
}

/**
 * Writes a review pivot block starting at startRow, column A. Returns the next free row.
 * Layout: title row, year band, dimension/month header, detail rows, "<first level> gesamt" subtotals, Grand Total.
 */
function writeReviewTable_(sh, pv, startRow, opts) {
  opts = opts || {};
  const nDims = pv.dims.length, nP = pv.periods.length, width = nDims + nP + 1;
  ensureColumns_(sh, width);
  const out = [];
  const r1 = new Array(width).fill(''); r1[0] = opts.title || `Sum of ${pv.measure}`; r1[nDims] = 'Year'; r1[nDims + 1] = 'Month'; out.push(r1);
  const r2 = new Array(width).fill('');
  let c = nDims; pv.years.forEach(y => { r2[c] = y.year; c += y.periods.length; });
  r2[width - 1] = REVIEW.GRAND_LABEL; out.push(r2);
  out.push([...pv.dims, ...pv.periods.map(p => pv.monthName[p]), '']);
  const cellsToRow = (o, tot) => [...pv.periods.map(p => o[p] || 0), tot];
  const blanks = n => new Array(n).fill('');
  const subtotalRows = [];
  pv.groups.forEach(g => {
    g.rows.forEach((row, i) => out.push([i === 0 ? g.io : '', ...row.dims.slice(1), ...blanks(nDims - row.dims.length), ...cellsToRow(row.cells, row.total)]));
    out.push([`${g.io}${REVIEW.SUBTOTAL_SUFFIX}`, ...blanks(nDims - 1), ...cellsToRow(g.subtotal, g.subtotalTotal)]);
    subtotalRows.push(startRow + out.length - 1);
  });
  out.push([REVIEW.GRAND_LABEL, ...blanks(nDims - 1), ...cellsToRow(pv.grand, pv.grandTotal)]);
  const grandRow = startRow + out.length - 1;

  ensureRows_(sh, startRow + out.length + 2);
  sh.getRange(startRow, 1, out.length, width).setNumberFormat('General').setValues(out);
  sh.getRange(startRow, 1, 3, width).setFontWeight('bold').setBackground('#f3f5f1');
  sh.getRange(startRow, 1).setFontSize(12);
  c = nDims + 1;
  pv.years.forEach(y => { if (y.periods.length > 1) sh.getRange(startRow + 1, c, 1, y.periods.length).merge(); sh.getRange(startRow + 1, c).setHorizontalAlignment('center'); c += y.periods.length; });
  if (out.length > 3) sh.getRange(startRow + 3, nDims + 1, out.length - 3, nP + 1).setNumberFormat(moneyFmt_());
  sh.getRange(startRow + 2, 1, 1, width).setBorder(false, false, true, false, false, false, '#1e3a5f', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  subtotalRows.forEach(r => sh.getRange(r, 1, 1, width).setFontWeight('bold').setBackground('#e8ece5'));
  sh.getRange(grandRow, 1, 1, width).setFontWeight('bold').setBackground('#1e3a5f').setFontColor('#ffffff');
  sh.getRange(startRow, nDims + 1, out.length, nP + 1).setHorizontalAlignment('right');
  if (opts.freeze) {
    sh.setFrozenRows(startRow + 2); sh.setFrozenColumns(nDims);
    const widths = profile_().reviewWidths || [];
    for (let i = 0; i < nDims; i++) sh.setColumnWidth(i + 1, widths[i] || 140);
    if (nP) sh.setColumnWidths(nDims + 1, nP + 1, 105);
  }
  const dataRows = out.length - 3;
  if (dataRows > 1) sh.getRange(startRow + 3, 1, dataRows, width).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false).setFirstRowColor('#ffffff').setSecondRowColor('#f6f7f4');
  subtotalRows.forEach(r => sh.getRange(r, 1, 1, width).setBackground('#e8ece5'));
  sh.getRange(grandRow, 1, 1, width).setBackground('#1e3a5f').setFontColor('#ffffff');
  return startRow + out.length + 2;
}

/* ===================== Regions ===================== */
/**
 * AdBook+ Revenue Review — Region reports
 * ----------------------------------------
 * Region  = text before the first "|" in Position Path (e.g. "CN Spain")
 * Niche   = (Campaign) SSG Category
 *
 * Builds:
 *   "Regions"            consolidated split: region × KPIs, region × month, region × niche (+ charts)
 *   "Region · <name>"    one tab per region: KPI strip, niche split, niche × month, monthly trend,
 *                        Review pivot for that region, top clients / reps / platforms (+ charts)
 */

const CHART_W = 600, CHART_H = 320;   // every chart is the same size — keeps grids tidy

const REGIONS = {
  SHEET: 'Regions',
  PREFIX: 'Region · ',
  NICHE_COL: '(Campaign) SSG Category',   // legacy; nicheCol_() picks the derived "Niche" column when present
  FONT: 'Roboto',
  PCT_FMT: '0.0%',
  HEAD_BG: '#f3f5f1', SUB_BG: '#e8ece5', TOTAL_BG: '#1e3a5f',
  PALETTE: ['#1e3a5f', '#b8933f', '#6b7f99', '#a89f91', '#c26a4a', '#6b5b95', '#4f7f8c', '#9a9a9a', '#d19a66', '#3d4f63'],
};

/* ------------------------------------------------------------------ */
/* Shared aggregation (used by Sheets tabs and the web app)            */
/* ------------------------------------------------------------------ */

/**
 * @param {Array} headers Data header row
 * @param {Array<Array>} rows Data rows
 * @return {Object} { periods, regions:[{name, totals, byPeriod, byNiche, nichePeriod, byClient, byRep, byPlatform, rows}], niches, totals }
 */
function computeRegionSplit_(headers, rows) {
  const cfg = getConfig();
  const idx = n => headers.indexOf(n);
  const I = { kpi: idx(moneyCol_(headers, cfg.kpiCol)), billed: idx(moneyCol_(headers, CFG.BILLED_COL)), billable: idx(moneyCol_(headers, CFG.BILLABLE_COL)),
              region: idx('Region'), period: idx('Period'), niche: idx(nicheCol_(headers)), cat: idx(CFG.NICHE_SRC_EU), cname: idx('Campaign Name'),
              client: idx('Client Name'), rep: idx('Sales Rep'), platform: idx('(Drop) SSG Platform'), campaign: idx('Campaign ID'), fee: idx('Fee Type'), path: idx(CFG.REGION_SOURCE_COL) };
  const s = v => (v === null || v === undefined) ? '' : String(v);
  const n = v => (typeof v === 'number' ? v : 0);
  const bump = (o, k, v) => { k = k || '(blank)'; o[k] = (o[k] || 0) + v; };
  const canonPlatform = makeCanon_([cfg.blankPlatform]);
  const newAgg = name => ({ name, kpi: 0, billed: 0, billable: 0, feeInternal: 0, feeExternal: 0, feeInternalBilled: 0, feeExternalBilled: 0, feeUs: 0, feeUsBilled: 0, byUsFee: {}, byUsFeeBilled: {}, byFee: {}, byFeeBilled: {}, campaigns: new Set(), clients: new Set(),
                            byPeriod: {}, byNiche: {}, nicheBilled: {}, nicheCampaigns: {}, nichePeriod: {}, byClient: {}, byRep: {}, byPlatform: {}, rows: [],
                            P: newBucket_(), byBrandB: {}, byGroupB: {}, byBookB: {}, byAdSizeB: {}, byBrandGroupB: {}, byPeriodB: {}, byFamilyB: {}, byFamilyPathB: {}, houseAds: newBucket_() });
  const regions = {}, periods = new Set(), niches = new Set();
  const all = newAgg('All regions');
  const print = headers.indexOf('Pages') >= 0 && isPrint_();
  const PI = print ? printIdx_(headers) : null;

  for (const row of rows) {
    const reg = s(row[I.region]) || CFG.REGION_FALLBACK, per = s(row[I.period]);
    if (print) {
      // Print: buckets (yield numerators/denominators, pages) per region / brand / page-cat group; house ads kept apart when the setting says so
      const pb = rowBucket_(row, PI, 1);
      const r0 = regions[reg] || (regions[reg] = newAgg(reg));
      if (pb.hs && cfg.houseExclude) { addBucket_(r0.houseAds, pb); addBucket_(all.houseAds, pb); r0.rows.push(row); continue; }
      const brand = s(row[I.niche]) || '(blank)', grp = s(row[PI.group]) || CFG.PAGECAT_UNCLASSIFIED, fam = PI.family >= 0 ? (s(row[PI.family]) || brand) : brand;
      if (PI.path2 >= 0) { const pp = [fam, s(row[PI.path2]) || '(blank)', s(row[PI.book]) || '(blank)', s(row[PI.pageCat]) || CFG.PAGECAT_DEFAULT]; for (let L = 1; L <= 4; L++) bumpB_(all.byFamilyPathB, pp.slice(0, L).join('\u0001'), pb); }   // "the same element across all markets"
      [r0, all].forEach(a => { addBucket_(a.P, pb); bumpB_(a.byFamilyB, fam, pb); bumpB_(a.byBrandB, brand, pb); bumpB_(a.byGroupB, grp, pb); bumpB_(a.byBookB, s(row[PI.book]), pb); bumpB_(a.byAdSizeB, s(row[PI.adSize]), pb); bumpB_(a.byBrandGroupB, `${brand}|${grp}`, pb); bumpB_(a.byPeriodB, per, pb); });
    }
    const niche = headers[I.niche] === 'Niche' ? (s(row[I.niche]) || '(blank)') : deriveNiche_(reg, I.cat >= 0 ? row[I.cat] : '', I.cname >= 0 ? row[I.cname] : '');
    const v = n(row[I.kpi]), b = n(row[I.billed]), bl = n(row[I.billable]);
    const fee = I.fee >= 0 && s(row[I.fee]) ? s(row[I.fee]) : deriveFeeType_(I.path >= 0 ? row[I.path] : '');   // falls back to Position Path
    const cls = classifyFee_(reg, fee);
    const isInt = cls.kind === 'internal', isExt = cls.kind === 'external', isUs = cls.kind === 'us';
    if (per) periods.add(per); niches.add(niche);
    const r = regions[reg] || (regions[reg] = newAgg(reg));
    [r, all].forEach(a => {
      a.kpi += v; a.billed += b; a.billable += bl; bump(a.byFee, fee, v); bump(a.byFeeBilled, fee, b);
      if (isInt) { a.feeInternal += v; a.feeInternalBilled += b; } if (isExt) { a.feeExternal += v; a.feeExternalBilled += b; }
      if (isUs) { a.feeUs += v; a.feeUsBilled += b; bump(a.byUsFee, cls.usFee, v); bump(a.byUsFeeBilled, cls.usFee, b); }
      if (row[I.campaign] !== '') a.campaigns.add(s(row[I.campaign]));
      if (row[I.client] !== '') a.clients.add(s(row[I.client]));
      bump(a.byPeriod, per, v); bump(a.byNiche, niche, v); bump(a.nicheBilled, niche, b);
      (a.nicheCampaigns[niche] = a.nicheCampaigns[niche] || new Set()).add(s(row[I.campaign]));
      if (!a.nichePeriod[niche]) a.nichePeriod[niche] = {}; bump(a.nichePeriod[niche], per, v);
      bump(a.byClient, s(row[I.client]), v); bump(a.byRep, s(row[I.rep]), v); bump(a.byPlatform, canonPlatform(row[I.platform]) || cfg.blankPlatform, v);
    });
    r.rows.push(row);
  }
  const finish = a => ({ name: a.name, kpi: a.kpi, billed: a.billed, billable: a.billable, feeInternal: a.feeInternal, feeExternal: a.feeExternal,
    feeInternalBilled: a.feeInternalBilled, feeExternalBilled: a.feeExternalBilled, feeUs: a.feeUs, feeUsBilled: a.feeUsBilled, byUsFee: a.byUsFee, byUsFeeBilled: a.byUsFeeBilled,
    byFee: a.byFee, byFeeBilled: a.byFeeBilled, campaigns: a.campaigns.size, clients: a.clients.size,
    byPeriod: a.byPeriod, byNiche: a.byNiche, nicheBilled: a.nicheBilled, nichePeriod: a.nichePeriod,
    nicheCampaigns: Object.keys(a.nicheCampaigns).reduce((o, k) => { o[k] = a.nicheCampaigns[k].size; return o; }, {}),
    byClient: a.byClient, byRep: a.byRep, byPlatform: a.byPlatform, rows: a.rows,
    P: a.P, byBrandB: a.byBrandB, byGroupB: a.byGroupB, byBookB: a.byBookB, byAdSizeB: a.byAdSizeB, byBrandGroupB: a.byBrandGroupB, byPeriodB: a.byPeriodB, byFamilyB: a.byFamilyB, byFamilyPathB: a.byFamilyPathB, houseAds: a.houseAds });
  const list = Object.values(regions).map(finish).sort((x, y) => y.kpi - x.kpi);
  return { periods: Array.from(periods).sort(), niches: Array.from(niches).sort(), regions: list, totals: finish(all), kpiName: moneyCol_(headers, cfg.kpiCol), print,
           monthName: p => MONTH_NAMES_[parseInt(p.slice(5, 7), 10) - 1] + ' ' + p.slice(2, 4) };
}

/* ------------------------------------------------------------------ */
/* Sheets builders                                                     */
/* ------------------------------------------------------------------ */

function buildRegionReports_(ss) {
  const sd = scopedData_(ss);
  const headers = sd.headers;
  const split = computeRegionSplit_(headers, sd.rows);

  buildRegionsTab_(ss, split);
  const keep = new Set([REGIONS.SHEET]);
  if (split.print && ss.getId() === SpreadsheetApp.getActiveSpreadsheet().getId() && !PROGRESS_MUTE_ && !REGION_TABS_INLINE_) { scheduleRegionTabs_(ss, split.regions.map(r => r.name)); return; }   // print master: one tab per market in the background
  split.regions.forEach((r, i) => {
    if (!PROGRESS_MUTE_) progressSub_(`Market tab ${i + 1} of ${split.regions.length}: ${r.name}`);
    const share = split.totals.kpi ? r.kpi / split.totals.kpi : 0;
    const conv = convertRowsForMarket_(headers, r.rows, r.name);
    if (conv.factor === 1) { keep.add(buildRegionTab_(ss, split, r, headers, share)); return; }
    const sp2 = computeRegionSplit_(conv.headers, conv.rows);          // same rows, market currency
    keep.add(buildRegionTab_(ss, sp2, sp2.regions[0], conv.headers, share));
  });
  // remove tabs for regions that no longer exist in the data
  ss.getSheets().forEach(sh => { const nm = sh.getName(); if (nm.startsWith(REGIONS.PREFIX) && !keep.has(nm)) ss.deleteSheet(sh); });
}

let REGION_TABS_INLINE_ = false;   // worker sets this so buildRegionTab_ runs inline

/** Print master: queue the per-market tabs and build them in a background worker so the import stays short. */
function scheduleRegionTabs_(master, names) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('regionTabs:queue', JSON.stringify(names));
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'continueRegionTabs').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('continueRegionTabs').timeBased().after(30 * 1000).create();
  // placeholder note on existing tabs so nobody reads stale figures
  names.forEach(n => { const sh = master.getSheetByName(regionSheetName_(n)); if (sh) sh.getRange(1, 2).setValue('⟳ refreshing in the background…').setFontColor('#a53a2f'); });
}

/** Worker: builds queued market tabs for up to ~20 minutes, re-schedules itself if any remain. */
function continueRegionTabs() {
  const master = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();
  const queue = JSON.parse(props.getProperty('regionTabs:queue') || '[]');
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'continueRegionTabs').forEach(t => ScriptApp.deleteTrigger(t));
  if (!queue.length) return;
  const lock = LockService.getScriptLock(); if (!lock.tryLock(5 * 60 * 1000)) { ScriptApp.newTrigger('continueRegionTabs').timeBased().after(60 * 1000).create(); return; }
  try {
    CONFIG_CACHE_ = null; FX_CACHE_ = null;
    const sd = scopedData_(master), headers = sd.headers;
    const split = computeRegionSplit_(headers, sd.rows);
    const started = Date.now();
    REGION_TABS_INLINE_ = true;
    while (queue.length && Date.now() - started < 20 * 60 * 1000) {
      const name = queue.shift();
      const r = split.regions.find(x => x.name === name); if (!r) continue;
      const share = split.totals.kpi ? r.kpi / split.totals.kpi : 0;
      const conv = convertRowsForMarket_(headers, r.rows, r.name);
      if (conv.factor === 1) buildRegionTab_(master, split, r, headers, share);
      else { const sp2 = computeRegionSplit_(conv.headers, conv.rows); buildRegionTab_(master, sp2, sp2.regions[0], conv.headers, share); }
      props.setProperty('regionTabs:queue', JSON.stringify(queue));
    }
    REGION_TABS_INLINE_ = false;
    // remove tabs for markets no longer in the data; order tabs
    const keep = new Set(split.regions.map(r => regionSheetName_(r.name)));
    master.getSheets().forEach(sh => { const nm = sh.getName(); if (nm.startsWith(REGIONS.PREFIX) && !keep.has(nm)) master.deleteSheet(sh); });
    orderMasterTabs_(master);
  } finally { lock.releaseLock(); }
  if (queue.length) ScriptApp.newTrigger('continueRegionTabs').timeBased().after(30 * 1000).create();
}

function regionSheetName_(name) {
  return (REGIONS.PREFIX + String(name).replace(/[\[\]\*\?\/\\:]/g, ' ')).slice(0, 95);
}

/** Consolidated "Regions" tab. */
function buildRegionsTab_(ss, split) {
  let sh = ss.getSheetByName(REGIONS.SHEET);
  if (!sh) sh = ss.insertSheet(REGIONS.SHEET, 1);
  resetSheet_(sh);
  if (split.print) return buildPrintRegionsTab_(sh, split);
  const P = split.periods, N = split.niches, T = split.totals;
  ensureColumns_(sh, Math.max(12, P.length + 3, N.length + 3));

  sh.setColumnWidth(1, 200); sh.setColumnWidths(2, Math.max(P.length, N.length) + 2, 110);
  let row = 1;
  sh.getRange(row, 1).setValue(`Revenue by region — ${split.kpiName} — ${yearLabel_()}`).setFontSize(18).setFontWeight('bold'); row += 1;
  sh.getRange(row, 1).setValue(`Consolidated in ${getConfig().reportingCurrency} · ${split.regions.length} regions · ${N.length} niches · ${P.length} months`).setFontColor('#5f6b63'); row += 2;

  // 1. Region split table
  const head1 = ['Region', split.kpiName, 'Billed revenue', 'Adjusted billable', 'Billed ÷ blended', 'Fee internal', 'Fee external', 'US talent fees', 'Share of total', 'Campaigns', 'Clients', 'Top niche'];
  const rows1 = split.regions.map(r => [r.name, r.kpi, r.billed, r.billable, r.kpi ? r.billed / r.kpi : 0, r.feeInternal, r.feeExternal, r.feeUs, T.kpi ? r.kpi / T.kpi : 0, r.campaigns, r.clients, topKey_(r.byNiche)]);
  rows1.push(['Total', T.kpi, T.billed, T.billable, T.kpi ? T.billed / T.kpi : 0, T.feeInternal, T.feeExternal, T.feeUs, 1, T.campaigns, T.clients, topKey_(T.byNiche)]);
  const t1 = { start: row };
  row = writeBlock_(sh, row, 'Consolidated split by region', head1, rows1, { money: [2, 3, 4, 6, 7, 8], pct: [5, 9], int: [10, 11], totalRow: true });

  // 1b. Region × fee type
  const F = Object.keys(T.byFee).sort((a, b) => (T.byFee[b] || 0) - (T.byFee[a] || 0));
  const head1b = ['Region', ...F, 'Total'];
  const rows1b = split.regions.map(r => [r.name, ...F.map(k => r.byFee[k] || 0), r.kpi]);
  rows1b.push(['Total', ...F.map(k => T.byFee[k] || 0), T.kpi]);
  row = writeBlock_(sh, row, `Region × fee type — ${split.kpiName}`, head1b, rows1b, { money: range_(2, F.length + 2), totalRow: true });

  // 2. Region × month
  const head2 = ['Region', ...P.map(split.monthName), 'Total'];
  const rows2 = split.regions.map(r => [r.name, ...P.map(p => r.byPeriod[p] || 0), r.kpi]);
  rows2.push(['Total', ...P.map(p => T.byPeriod[p] || 0), T.kpi]);
  const t2 = { start: row };
  row = writeBlock_(sh, row, `Region × month — ${split.kpiName}`, head2, rows2, { money: range_(2, P.length + 2), totalRow: true });

  // 3. Region × niche
  const head3 = ['Region', ...N, 'Total'];
  const rows3 = split.regions.map(r => [r.name, ...N.map(k => r.byNiche[k] || 0), r.kpi]);
  rows3.push(['Total', ...N.map(k => T.byNiche[k] || 0), T.kpi]);
  const t3 = { start: row };
  row = writeBlock_(sh, row, `Region × niche (SSG Category) — ${split.kpiName}`, head3, rows3, { money: range_(2, N.length + 2), totalRow: true });

  // 4. Niche × month (all regions)
  const head4 = ['Niche', ...P.map(split.monthName), 'Total'];
  const rows4 = N.map(k => [k, ...P.map(p => (T.nichePeriod[k] || {})[p] || 0), T.byNiche[k] || 0]);
  rows4.push(['Total', ...P.map(p => T.byPeriod[p] || 0), T.kpi]);
  row = writeBlock_(sh, row, `Niche × month — all regions`, head4, rows4, { money: range_(2, P.length + 2), totalRow: true });

  // Charts — placed below all tables so nothing overlaps
  const nReg = split.regions.length;
  row = placeCharts_(sh, row, [
    { type: Charts.ChartType.BAR, range: sh.getRange(t1.start + 1, 1, nReg + 1, 2), title: 'Revenue by region', options: { legend: { position: 'none' } } },
    { type: Charts.ChartType.COLUMN, range: sh.getRange(t2.start + 1, 1, nReg + 1, P.length + 1), title: 'Monthly revenue by region', options: { isStacked: true, legend: { position: 'right' } }, transpose: true },
    { type: Charts.ChartType.BAR, range: sh.getRange(t3.start + 1, 1, nReg + 1, N.length + 1), title: 'Niche mix by region', options: { isStacked: 'percent', legend: { position: 'right' } } },
    { type: Charts.ChartType.COLUMN, range: sh.getRange(t1.start + 1, 1, nReg + 1, 3), title: 'Blended vs billed by region', options: { legend: { position: 'bottom' } } },
  ], 'detail');

  sh.setFrozenRows(0);
}

/** One tab per region. Returns the sheet name. */
function buildRegionTab_(ss, split, r, headers, shareOfAll) {
  const name = regionSheetName_(r.name);
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  resetSheet_(sh);
  if (split.print) { buildPrintRegionTab_(sh, split, r, headers, shareOfAll); return name; }
  const P = split.periods.filter(p => r.byPeriod[p]);           // months this region has revenue in
  const N = split.niches.filter(k => r.byNiche[k]);            // niches present in this region
  const T = split.totals;
  ensureColumns_(sh, Math.max(12, P.length + 5));

  sh.setColumnWidth(1, 240); sh.setColumnWidths(2, Math.max(P.length, 11) + 2, 110);
  let row = 1;
  sh.getRange(row, 1).setValue(`${r.name} — ${yearLabel_()}`).setFontSize(20).setFontWeight('bold'); row += 1;
  const share = shareOfAll !== undefined ? shareOfAll : (T.kpi ? r.kpi / T.kpi : 0);
  sh.getRange(row, 1).setValue(`All figures in ${currencyOf_(headers)} · ${(100 * share).toFixed(1)}% of all regions · ${r.campaigns} campaigns · ${r.clients} clients`).setFontColor('#5f6b63'); row += 2;

  // KPI strip
  const nf = getConfig().numberFormat;
  const usFeeNames = getConfig().usFees;
  const feeRow = isUsMarket_(r.name)
    ? [...usFeeNames.slice(0, 3).flatMap(k => [[`${k} — blended`, r.byUsFee[k] || 0, '#1e3a5f', nf], [`${k} — billed`, r.byUsFeeBilled[k] || 0, '#b8933f', nf]])].slice(0, 6)
    : [['Talent fee internal — blended', r.feeInternal, '#1e3a5f', nf], ['Talent fee internal — billed', r.feeInternalBilled, '#b8933f', nf],
       ['Talent fee external — blended', r.feeExternal, '#1e3a5f', nf], ['Talent fee external — billed', r.feeExternalBilled, '#b8933f', nf],
       ['Fee internal share', r.kpi ? r.feeInternal / r.kpi : 0, '#1b2430', REGIONS.PCT_FMT], ['Top niche', topKey_(r.byNiche), '#1b2430', '@']];
  while (feeRow.length < 6) feeRow.push(['', '', '#1b2430', '@']);
  const kpiRows = [
    [[split.kpiName, r.kpi, '#1e3a5f', nf], ['Billed (status complete)', r.billed, '#b8933f', nf], ['Adjusted billable', r.billable, '#1b2430', nf],
     ['Billed ÷ blended', r.kpi ? r.billed / r.kpi : 0, '#1b2430', REGIONS.PCT_FMT], ['Campaigns', r.campaigns, '#1b2430', '#,##0'], ['Clients', r.clients, '#1b2430', '#,##0']],
    feeRow,
  ];
  kpiRows.forEach((cards, ri) => {
    const r0 = row + ri * 3;
    cards.forEach((k, i) => {
      const c = 1 + i * 2;
      sh.getRange(r0, c, 1, 2).merge().setValue(k[0]).setFontColor('#5f6b63').setFontSize(10);
      sh.getRange(r0 + 1, c, 1, 2).merge().setValue(k[1]).setFontSize(k[3] === '@' ? 12 : 18).setFontWeight('bold').setFontColor(k[2]).setNumberFormat(k[3]);
    });
    sh.getRange(r0, 1, 2, 12).setBackground(REGIONS.HEAD_BG).setBorder(true, true, true, true, false, false, '#d9ddd6', SpreadsheetApp.BorderStyle.SOLID);
  });
  row += 7;

  // Revenue by year (this market)
  row = writeBlock_(sh, row, 'Revenue by year', ['Year', split.kpiName, 'Billed (complete)', 'Adjusted billable', 'Billed ÷ blended', 'Fee internal', 'Fee external', 'Campaigns'],
    yearTable_(headers, r.rows), { money: [2, 3, 4, 6, 7], pct: [5], int: [8], totalRow: true });

  // Fee type split
  const FT = Object.keys(r.byFee).sort((a, b) => r.byFee[b] - r.byFee[a]);
  const headF = ['Fee type (last segment of Position Path)', split.kpiName, 'Billed (status complete)', 'Billed ÷ blended', 'Share of region'];
  const rowsF = FT.map(k => [k, r.byFee[k], r.byFeeBilled[k] || 0, r.byFee[k] ? (r.byFeeBilled[k] || 0) / r.byFee[k] : 0, r.kpi ? r.byFee[k] / r.kpi : 0]);
  rowsF.push(['Total', r.kpi, r.billed, r.kpi ? r.billed / r.kpi : 0, 1]);
  row = writeBlock_(sh, row, 'Fee type split', headF, rowsF, { money: [2, 3], pct: [4, 5], totalRow: true });

  // Niche split
  const head1 = ['Niche (SSG Category)', split.kpiName, 'Billed revenue', 'Billed ÷ blended', 'Share of region', 'Campaigns'];
  const rows1 = N.map(k => [k, r.byNiche[k], r.nicheBilled[k] || 0, r.byNiche[k] ? (r.nicheBilled[k] || 0) / r.byNiche[k] : 0, r.kpi ? r.byNiche[k] / r.kpi : 0, r.nicheCampaigns[k] || 0])
                 .sort((a, b) => b[1] - a[1]);
  rows1.push(['Total', r.kpi, r.billed, r.kpi ? r.billed / r.kpi : 0, 1, r.campaigns]);
  const t1 = { start: row };
  row = writeBlock_(sh, row, 'Niche split', head1, rows1, { money: [2, 3], pct: [4, 5], int: [6], totalRow: true });

  // Niche × month
  const head2 = ['Niche', ...P.map(split.monthName), 'Total'];
  const rows2 = N.map(k => [k, ...P.map(p => (r.nichePeriod[k] || {})[p] || 0), r.byNiche[k] || 0]).sort((a, b) => b[b.length - 1] - a[a.length - 1]);
  rows2.push(['Total', ...P.map(p => r.byPeriod[p] || 0), r.kpi]);
  const t2 = { start: row };
  row = writeBlock_(sh, row, `Niche × month — ${split.kpiName}`, head2, rows2, { money: range_(2, P.length + 2), totalRow: true });

  // Monthly trend
  const perBilled = {}; const perBillable = {};
  const iP = headers.indexOf('Period'), iB = headers.indexOf(moneyCol_(headers, CFG.BILLED_COL)), iBl = headers.indexOf(moneyCol_(headers, CFG.BILLABLE_COL));
  r.rows.forEach(x => { const p = String(x[iP] || ''); perBilled[p] = (perBilled[p] || 0) + (typeof x[iB] === 'number' ? x[iB] : 0); perBillable[p] = (perBillable[p] || 0) + (typeof x[iBl] === 'number' ? x[iBl] : 0); });
  const head3 = ['Month', split.kpiName, 'Billed revenue', 'Adjusted billable', 'Billed ÷ blended'];
  const rows3 = P.map(p => [split.monthName(p), r.byPeriod[p] || 0, perBilled[p] || 0, perBillable[p] || 0, r.byPeriod[p] ? (perBilled[p] || 0) / r.byPeriod[p] : 0]);
  rows3.push(['Total', r.kpi, r.billed, r.billable, r.kpi ? r.billed / r.kpi : 0]);
  const t3 = { start: row };
  row = writeBlock_(sh, row, 'Monthly trend', head3, rows3, { money: [2, 3, 4], pct: [5], totalRow: true });

  // Top clients / reps / platforms side by side
  const top = (o, n) => Object.keys(o).map(k => [k, o[k]]).sort((a, b) => b[1] - a[1]).slice(0, n);
  const tRow = row;
  row = Math.max(
    writeBlock_(sh, tRow, 'Top clients', ['Client', split.kpiName], top(r.byClient, 10), { money: [2] }, 1),
    writeBlock_(sh, tRow, 'Sales reps', ['Sales rep', split.kpiName], top(r.byRep, 10), { money: [2] }, 4),
    writeBlock_(sh, tRow, 'Platforms', ['Platform', split.kpiName], top(r.byPlatform, 10), { money: [2] }, 7));

  // Review pivot for this region (IO Status → Job Code → Campaign × month)
  const pv = computeReviewPivot_(headers, r.rows);
  row = writeReviewTable_(sh, pv, row + 1, { title: `Review — ${r.name} — sum of ${pv.measure}` });

  // Charts — placed below all tables so nothing overlaps
  row = placeCharts_(sh, row, [
    { type: Charts.ChartType.COLUMN, range: sh.getRange(t2.start + 1, 1, N.length + 1, P.length + 1), title: 'Monthly revenue by niche', options: { isStacked: true, legend: { position: 'right' } }, transpose: true },
    { type: Charts.ChartType.PIE, range: sh.getRange(t1.start + 1, 1, N.length + 1, 2), title: 'Niche share', options: { pieHole: 0.45 } },
    { type: Charts.ChartType.LINE, range: sh.getRange(t3.start + 1, 1, P.length + 1, 3), title: 'Blended vs billed by month', options: { legend: { position: 'bottom' } } },
    { type: Charts.ChartType.BAR, range: sh.getRange(tRow + 1, 1, Math.min(10, Object.keys(r.byClient).length) + 1, 2), title: 'Top clients', options: { legend: { position: 'none' } } },
  ], 'detail');

  return name;
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function topKey_(o) { let k = '', m = -Infinity; Object.keys(o).forEach(x => { if (o[x] > m) { m = o[x]; k = x; } }); return k; }
function range_(a, b) { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; }

/**
 * Writes a titled table. opts: money/pct/int = 1-based column indexes for number formats; totalRow = style last row.
 * col = starting column (default 1). Returns the next free row after the block.
 */
function writeBlock_(sh, row, title, head, rows, opts, col) {
  opts = opts || {}; col = col || 1;
  const w = head.length;
  ensureColumns_(sh, col + w - 1); ensureRows_(sh, row + rows.length + 3);
  sh.getRange(row, col).setValue(title).setFontWeight('bold').setFontSize(12).setFontColor('#1b2430');
  const header = sh.getRange(row + 1, col, 1, w);
  header.setValues([head]).setFontWeight('bold').setBackground('#e8ece5').setFontColor('#1b2430').setVerticalAlignment('middle')
        .setBorder(false, false, true, false, false, false, '#1e3a5f', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  if (w > 1) header.offset(0, 1, 1, w - 1).setHorizontalAlignment('right');
  if (rows.length) {
    const body = sh.getRange(row + 2, col, rows.length, w);
    body.setValues(rows).setVerticalAlignment('middle');
    body.offset(0, 1, rows.length, Math.max(w - 1, 1)).setHorizontalAlignment('right');
    (opts.money || []).forEach(c => sh.getRange(row + 2, col + c - 1, rows.length, 1).setNumberFormat(moneyFmt_()));
    (opts.pct || []).forEach(c => sh.getRange(row + 2, col + c - 1, rows.length, 1).setNumberFormat(REGIONS.PCT_FMT));
    (opts.int || []).forEach(c => sh.getRange(row + 2, col + c - 1, rows.length, 1).setNumberFormat('#,##0'));
    const dataRows = opts.totalRow ? rows.length - 1 : rows.length;
    if (dataRows > 1) sh.getRange(row + 2, col, dataRows, w).applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false)
      .setFirstRowColor('#ffffff').setSecondRowColor('#f6f7f4');
    if (opts.totalRow) sh.getRange(row + 1 + rows.length, col, 1, w).setFontWeight('bold').setBackground(REGIONS.TOTAL_BG).setFontColor('#ffffff');
  }
  return row + rows.length + 4;
}

/** Clears content, formats, charts and bandings; applies the report font and hides gridlines. */
function resetSheet_(sh) {
  sh.getCharts().forEach(c => sh.removeChart(c));
  sh.getBandings().forEach(b => b.remove());
  sh.clear(); sh.clearFormats();
  sh.setHiddenGridlines(true);
  sh.getRange(1, 1, sh.getMaxRows(), sh.getMaxColumns()).setFontFamily(REGIONS.FONT).setFontSize(10);
}

/**
 * Chart builder with the house style: white card, data labels on series, clean axes, percentage pie labels.
 * Returns the builder (caller inserts).
 */
function styledChart_(sh, type, range, title, anchorRow, anchorCol, o) {
  o = o || {};
  const nSeries = o.transpose ? Math.max(range.getNumRows() - 1, 1) : Math.max(range.getNumColumns() - 1, 1);
  const single = nSeries === 1;
  const b = sh.newChart().setChartType(type).addRange(range).setPosition(anchorRow, anchorCol, 0, 0)
    .setOption('title', title).setOption('width', o.width || CHART_W).setOption('height', o.height || CHART_H)
    .setOption('colors', REGIONS.PALETTE)
    .setOption('backgroundColor', '#ffffff')
    .setOption('fontName', REGIONS.FONT)
    .setOption('titleTextStyle', { fontSize: 13, bold: true, color: '#1b2430' })
    .setOption('legend', single ? { position: 'none' } : { position: 'right', textStyle: { fontSize: 10, color: '#5f6b63' } })
    .setOption('hAxis', { format: 'short', textStyle: { fontSize: 10, color: '#5f6b63' }, gridlines: { color: '#e6e9e2', count: 5 }, baselineColor: '#1b2430' })
    .setOption('vAxis', { format: 'short', textStyle: { fontSize: 10, color: '#5f6b63' }, gridlines: { color: '#e6e9e2', count: 5 }, minValue: 0 });
  if (type === Charts.ChartType.PIE) {
    b.setOption('pieSliceText', 'percentage').setOption('pieSliceTextStyle', { fontSize: 10, color: '#ffffff' })
     .setOption('legend', { position: 'right', textStyle: { fontSize: 10, color: '#5f6b63' } });
  } else if (single && (type === Charts.ChartType.BAR || type === Charts.ChartType.COLUMN)) {
    // value labels only on single-series bars, where they read cleanly
    b.setOption('series', { 0: { dataLabel: 'value' } }).setOption('annotations', { textStyle: { fontSize: 9, color: '#1b2430' } });
  }
  if (type === Charts.ChartType.LINE) b.setOption('lineWidth', 2).setOption('pointSize', 4).setOption('curveType', 'none');
  if (o.transpose) b.setTransposeRowsAndColumns(true).setNumHeaders(1);
  Object.keys(o.options || {}).forEach(k => b.setOption(k, o.options[k]));
  return b;
}

/**
 * Places charts in a 2-column grid starting at startRow (each 620×300 px ≈ 16 rows tall).
 * Returns the next free row below the grid.
 */
function placeCharts_(sh, startRow, specs, level) {
  // level: 'dashboard' (always unless charts=none) or 'detail' (only when charts=all)
  const mode = getConfig().charts;
  if (mode === 'none' || (mode !== 'all' && level === 'detail')) return startRow;
  // Work out which column starts ≥ CHART_W + 30px to the right, and how many rows cover CHART_H + 30px.
  let px = 0, col2 = 2;
  while (px < CHART_W + 30 && col2 <= sh.getMaxColumns()) { px += sh.getColumnWidth(col2 - 1); col2++; }
  ensureColumns_(sh, col2 + 6);
  const rowH = sh.getRowHeight(startRow) || 21;
  const rowsPer = Math.ceil((CHART_H + 30) / rowH);
  ensureRows_(sh, startRow + Math.ceil(specs.length / 2) * rowsPer + 2);
  sh.getRange(startRow, 1).setValue('Charts').setFontWeight('bold').setFontSize(12);
  specs.forEach((sp, i) => {
    const anchorRow = startRow + 1 + Math.floor(i / 2) * rowsPer, anchorCol = i % 2 === 0 ? 1 : col2;
    sh.insertChart(styledChart_(sh, sp.type, sp.range, sp.title, anchorRow, anchorCol, { transpose: sp.transpose, options: sp.options }).build());
  });
  return startRow + 1 + Math.ceil(specs.length / 2) * rowsPer + 1;
}

/* ===================== MarketFiles ===================== */
/**
 * AdBook+ Revenue Review — Market files
 * --------------------------------------
 * On every import (or via menu → Generate / refresh market files) one Google Sheet per region
 * is created or refreshed in the market files folder:
 *
 *     AdBook+ Revenue – <Region>
 *
 * Each file holds only that region's rows in "Data" and gets the full set of report tabs
 * (Dashboard, Pivots, Review, Regions, Region · <name>). Files are re-used across imports
 * (same file ID, so shared links keep working). Optional per-market sharing via Config.
 */

const MARKET = {
  NAME_PREFIX: 'AdBook+ Revenue – ',
  PROP_KEY: 'marketFile:',           // ScriptProperties key prefix → file id
  LINKS_SHEET: 'Market files',       // tab in the master listing file links
};

/* ------------------------------------------------------------------ */
/* Background refresh (used by imports so Process stays fast)          */
/* ------------------------------------------------------------------ */

/** Queue every market for a background refresh and schedule the worker to start in ~1 minute. */
function scheduleMarketFiles_(master) {
  const data = master.getSheetByName(CFG.SHEETS.DATA);
  if (!data || data.getLastRow() < 2) return;
  const sd = sheetData_(master);
  const iR = sd.headers.indexOf('Region');
  const regions = Array.from(new Set(sd.rows.map(r => String(r[iR] || CFG.REGION_FALLBACK)))).sort();
  const props = PropertiesService.getScriptProperties();
  props.setProperty('marketFiles:queue', JSON.stringify(regions));
  writeMarketLinks_(master, regions.map(r => ({ region: r, url: existingMarketUrl_(r), rows: '', queued: true })));
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'continueMarketFiles').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('continueMarketFiles').timeBased().after(60 * 1000).create();
}

/** Worker: refreshes queued markets for up to ~4 minutes, then re-schedules itself if any remain. */
function continueMarketFiles() {
  const master = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();
  const queue = JSON.parse(props.getProperty('marketFiles:queue') || '[]');
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'continueMarketFiles').forEach(t => ScriptApp.deleteTrigger(t));
  if (!queue.length) return;
  const cfg = getConfig();
  const folder = DriveApp.getFolderById(cfg.marketFolderId || cfg.driveFolderId);
  const sd = sheetData_(master);
  const iR = sd.headers.indexOf('Region');
  const started = Date.now();
  const done = [];
  while (queue.length && Date.now() - started < 4 * 60 * 1000) {
    const region = queue.shift();
    const rows = sd.rows.filter(r => String(r[iR] || CFG.REGION_FALLBACK) === region);
    try {
      const file = getOrCreateMarketFile_(folder, region, props);
      const ss = SpreadsheetApp.openById(file.getId());
      const conv = convertRowsForMarket_(sd.headers, rows, region);
      writeData_(conv.headers, conv.rows, ss);
      PROGRESS_MUTE_ = true; try { buildDashboardFor_(ss); } finally { PROGRESS_MUTE_ = false; }
      dropDefaultSheet_(ss); orderMarketTabs_(ss); shareMarketFile_(file, region, cfg);
      done.push({ region, url: file.getUrl(), rows: rows.length, currency: conv.currency });
    } catch (e) { done.push({ region, url: existingMarketUrl_(region), rows: rows.length, error: e.message }); }
    props.setProperty('marketFiles:queue', JSON.stringify(queue));
    updateMarketLinkRow_(master, done[done.length - 1]);
  }
  if (queue.length) ScriptApp.newTrigger('continueMarketFiles').timeBased().after(30 * 1000).create();
}

function existingMarketUrl_(region) {
  try { const id = PropertiesService.getScriptProperties().getProperty(MARKET.PROP_KEY + region); return id ? DriveApp.getFileById(id).getUrl() : ''; } catch (e) { return ''; }
}

/** Updates a single region row in the Market files tab (creates the tab/row if needed). */
function updateMarketLinkRow_(master, r) {
  let sh = master.getSheetByName(MARKET.LINKS_SHEET);
  if (!sh) { writeMarketLinks_(master, [r]); return; }
  const last = sh.getLastRow();
  const names = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(x => String(x[0])) : [];
  let i = names.indexOf(r.region);
  const row = [r.region, r.currency || '', r.rows, r.url ? `=HYPERLINK("${r.url}","${profile_().marketFilePrefix}${r.region}")` : '', new Date(), r.error ? `Error: ${r.error}` : 'Refreshed'];
  if (i < 0) { sh.appendRow(row); i = sh.getLastRow() - 2; } else sh.getRange(i + 2, 1, 1, 6).setValues([row]);
  sh.getRange(i + 2, 5).setNumberFormat('yyyy-mm-dd hh:mm');
}

/** Menu entry point. */
function generateMarketFiles() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  progressStart_(1, 'Creating / refreshing market files…');
  const made = buildMarketFiles_(ss);
  progressDone_(`${made.length} market file(s) refreshed`);
}

/**
 * @param {Spreadsheet} master
 * @return {Array<{region:string, url:string, rows:number}>}
 */
function buildMarketFiles_(master) {
  const cfg = getConfig();
  const folderId = cfg.marketFolderId || cfg.driveFolderId;
  if (!folderId) throw new Error('Set "Market files folder ID" (or "Drive folder ID") in the Config tab so market files have somewhere to live.');
  const folder = DriveApp.getFolderById(folderId);

  const data = master.getSheetByName(CFG.SHEETS.DATA);
  if (!data || data.getLastRow() < 2) return [];
  const sd = sheetData_(master);
  const headers = sd.headers;
  const iR = headers.indexOf('Region');
  const byRegion = {};
  sd.rows.forEach(r => { const k = String(r[iR] || CFG.REGION_FALLBACK); (byRegion[k] = byRegion[k] || []).push(r); });

  const props = PropertiesService.getScriptProperties();
  const results = [];
  const started = Date.now();

  const regionList = Object.keys(byRegion).sort();
  regionList.forEach((region, i) => {
    progressSub_(`Market file ${i + 1} of ${regionList.length}: ${region}`);
    // Guard the 6-minute execution limit: stop cleanly and report what was done.
    if (Date.now() - started > 4.5 * 60 * 1000) { results.push({ region, url: '', rows: byRegion[region].length, skipped: true }); return; }
    const file = getOrCreateMarketFile_(folder, region, props);
    const ss = SpreadsheetApp.openById(file.getId());
    const conv = convertRowsForMarket_(headers, byRegion[region], region);
    writeData_(conv.headers, conv.rows, ss);
    PROGRESS_MUTE_ = true;
    try { buildDashboardFor_(ss); } finally { PROGRESS_MUTE_ = false; }
    dropDefaultSheet_(ss);
    orderMarketTabs_(ss);
    shareMarketFile_(file, region, cfg);
    results.push({ region, url: file.getUrl(), rows: byRegion[region].length, currency: conv.currency });
  });

  writeMarketLinks_(master, results);
  return results;
}

function getOrCreateMarketFile_(folder, region, props) {
  const name = profile_().marketFilePrefix + region;
  const key = MARKET.PROP_KEY + region;
  const savedId = props.getProperty(key);
  if (savedId) {
    try { const f = DriveApp.getFileById(savedId); if (!f.isTrashed()) return f; } catch (e) { /* recreate below */ }
  }
  const existing = folder.getFilesByName(name);
  if (existing.hasNext()) { const f = existing.next(); props.setProperty(key, f.getId()); return f; }
  const created = SpreadsheetApp.create(name);
  const f = DriveApp.getFileById(created.getId());
  f.moveTo(folder);
  props.setProperty(key, f.getId());
  return f;
}

function dropDefaultSheet_(ss) {
  const sh = ss.getSheetByName('Sheet1') || ss.getSheetByName('Tabellenblatt1') || ss.getSheetByName('Hoja 1');
  if (sh && ss.getSheets().length > 1) ss.deleteSheet(sh);
}

function orderMarketTabs_(ss) {
  const order = [CFG.SHEETS.DASH, REVIEW.SHEET, REGIONS.SHEET];
  const sheets = ss.getSheets();
  const regionTab = sheets.find(s => s.getName().startsWith(REGIONS.PREFIX));
  const names = [...order, regionTab && regionTab.getName(), CFG.SHEETS.DATA, CFG.SHEETS.PIVOTS].filter(Boolean);
  names.forEach((n, i) => { const sh = ss.getSheetByName(n); if (sh) { ss.setActiveSheet(sh); ss.moveActiveSheet(i + 1); } });
  const dash = ss.getSheetByName(CFG.SHEETS.DASH); if (dash) ss.setActiveSheet(dash);
  const piv = ss.getSheetByName(CFG.SHEETS.PIVOTS); if (piv) piv.hideSheet();
}

function shareMarketFile_(file, region, cfg) {
  const emails = cfg.marketViewers[region.toLowerCase()];
  if (!emails || !emails.length) return;
  const current = new Set(file.getViewers().map(u => u.getEmail().toLowerCase()).concat(file.getEditors().map(u => u.getEmail().toLowerCase())));
  const toAdd = emails.filter(e => !current.has(e));
  if (toAdd.length) { try { file.addViewers(toAdd); } catch (e) { Logger.log(`Could not share ${file.getName()} with ${toAdd.join(', ')}: ${e.message}`); } }
}

/** Writes a "Market files" tab in the master with a link per region. */
function writeMarketLinks_(master, results) {
  let sh = master.getSheetByName(MARKET.LINKS_SHEET);
  if (!sh) sh = master.insertSheet(MARKET.LINKS_SHEET);
  sh.clear();
  const rows = [['Region', 'Currency', 'Rows', 'File', 'Refreshed', 'Status']];
  results.forEach(r => rows.push([
    r.region, r.currency || '', r.rows,
    r.url ? `=HYPERLINK("${r.url}","${profile_().marketFilePrefix}${r.region}")` : '',
    r.skipped || r.queued ? '' : new Date(),
    r.queued ? 'Queued — refreshing in the background (starts within a minute)' : r.skipped ? 'Skipped — execution time limit; run menu → Generate / refresh market files again' : 'Refreshed',
  ]));
  sh.getRange(1, 1, rows.length, 6).setValues(rows);
  sh.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#f3f5f1');
  if (rows.length > 1) sh.getRange(2, 5, rows.length - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm');
  sh.setColumnWidth(1, 200).setColumnWidth(4, 320).setColumnWidth(6, 420);
  sh.setFrozenRows(1);
}

/* ===================== Deck ===================== */
/**
 * AdBook+ Revenue Review — Leadership deck (Google Slides)
 * ---------------------------------------------------------
 * Menu → Export leadership deck. Creates "AdBook+ Revenue Review – <run date>" in the market files
 * folder (or the exports folder): title, executive summary, KPI cards, key charts (taken from the
 * Dashboard / Regions / country tabs), region table, niche table, one slide per market.
 */

const DECK = {
  INK: '#1b2430', MUTED: '#5f6b63', GREEN: '#1e3a5f', AMBER: '#b8933f', RULE: '#d9ddd6', SOFT: '#f3f5f1',
  FONT: 'Roboto',
};

function exportLeadershipDeck() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cfg = getConfig();
  const data = ss.getSheetByName(CFG.SHEETS.DATA);
  if (!data || data.getLastRow() < 2) throw new Error('Import a report first.');
  const sd = scopedData_(ss);
  const headers = sd.headers, rows = sd.rows;
  const split = computeRegionSplit_(headers, rows);
  const T = split.totals, cur = currencyOf_(headers);
  const iRun = headers.indexOf('Report Run Date');
  let runDate = null; rows.forEach(r => { const d = r[iRun]; if (d instanceof Date && (!runDate || d > runDate)) runDate = d; });
  const runStr = runDate ? Utilities.formatDate(runDate, Session.getScriptTimeZone(), 'd MMM yyyy') : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'd MMM yyyy');

  const pres = SlidesApp.create(`${profile_().title} – ${yearLabel_()} – ${runStr}`);
  const W = pres.getPageWidth(), H = pres.getPageHeight();
  const fmt = n => fmtMoney_(n, cfg.numberFormat);
  const pct = (a, b) => b ? (100 * a / b).toFixed(1) + '%' : '—';

  // ---- 1. Title
  let sl = pres.getSlides()[0];
  sl.getShapes().forEach(sh => sh.remove());
  band_(sl, W, H);
  text_(sl, profile_().title, 40, H * 0.32, W - 80, 60, { size: 36, bold: true, color: '#ffffff' });
  text_(sl, `${yearLabel_()}  ·  report run ${runStr}  ·  all figures in ${cur}  ·  ${split.regions.length} markets  ·  ${T.campaigns} campaigns`, 40, H * 0.32 + 66, W - 80, 30, { size: 14, color: '#d7e3de' });
  text_(sl, 'Prepared for leadership review', 40, H - 60, W - 80, 24, { size: 11, color: '#d7e3de' });

  // ---- 2. Executive summary
  sl = newSlide_(pres, 'Executive summary', `${cur} · report run ${runStr}`);
  const topN = o => Object.keys(o).sort((a, b) => o[b] - o[a]);
  const P = split.periods, best = P.length ? P.reduce((a, b) => (T.byPeriod[b] || 0) > (T.byPeriod[a] || 0) ? b : a) : '';
  const lastP = P[P.length - 1], prevP = P[P.length - 2];
  const bullets = [];
  bullets.push(`${fmt(T.kpi)} ${cfg.kpiCol.toLowerCase()} across ${split.regions.length} markets; ${fmt(T.billed)} actually billed (${pct(T.billed, T.kpi)}).`);
  if (split.regions[0]) bullets.push(`${split.regions[0].name} is the largest market at ${fmt(split.regions[0].kpi)} (${pct(split.regions[0].kpi, T.kpi)})${split.regions[1] ? `, followed by ${split.regions[1].name} (${pct(split.regions[1].kpi, T.kpi)})` : ''}.`);
  const lowBill = split.regions.filter(r => r.kpi > 0).sort((a, b) => a.billed / a.kpi - b.billed / b.kpi)[0];
  if (lowBill) bullets.push(`Lowest billing conversion: ${lowBill.name} at ${pct(lowBill.billed, lowBill.kpi)}.`);
  const nk = topN(T.byNiche); if (nk[0]) bullets.push(`Top niche is ${nk[0]} at ${fmt(T.byNiche[nk[0]])} (${pct(T.byNiche[nk[0]], T.kpi)})${nk[1] ? `; ${nk[1]} second at ${pct(T.byNiche[nk[1]], T.kpi)}` : ''}.`);
  if (best) bullets.push(`Strongest month: ${split.monthName(best)} at ${fmt(T.byPeriod[best])}.`);
  if (prevP && T.byPeriod[prevP]) { const ch = 100 * (T.byPeriod[lastP] - T.byPeriod[prevP]) / T.byPeriod[prevP]; bullets.push(`${split.monthName(lastP)} came in at ${fmt(T.byPeriod[lastP])}, ${ch >= 0 ? '+' : ''}${ch.toFixed(1)}% vs ${split.monthName(prevP)}.`); }
  const ck = topN(T.byClient); if (ck[0]) bullets.push(`Largest client: ${ck[0]} at ${fmt(T.byClient[ck[0]])} (${pct(T.byClient[ck[0]], T.kpi)}).`);
  bulletList_(sl, bullets, 40, 90, W - 80, H - 140);

  // ---- 3. KPI cards
  sl = newSlide_(pres, 'Key figures', `${cur}`);
  const cards = [
    [cfg.kpiCol, fmt(T.kpi), DECK.GREEN], ['Billed revenue (status complete)', fmt(T.billed), DECK.AMBER], ['Adjusted billable', fmt(T.billable), DECK.INK],
    ['Talent fee internal · blended / billed', `${fmt(T.feeInternal)} / ${fmt(T.feeInternalBilled)}`, DECK.INK],
    ['Talent fee external · blended / billed', `${fmt(T.feeExternal)} / ${fmt(T.feeExternalBilled)}`, DECK.INK],
    ['US talent fees · blended / billed', `${fmt(T.feeUs)} / ${fmt(T.feeUsBilled)}`, DECK.INK],
  ];
  const cw = (W - 80 - 5 * 12) / 3, ch = 90;
  cards.forEach((c, i) => {
    const x = 40 + (i % 3) * (cw + 12), y = 100 + Math.floor(i / 3) * (ch + 16);
    const box = sl.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, x, y, cw, ch);
    box.getFill().setSolidFill(DECK.SOFT); box.getBorder().setTransparent();
    text_(sl, c[0], x + 14, y + 10, cw - 28, 22, { size: 11, color: DECK.MUTED });
    text_(sl, c[1], x + 14, y + 34, cw - 28, 44, { size: 24, bold: true, color: c[2] });
  });

  // ---- 4. Charts from the Dashboard tab
  const dash = ss.getSheetByName(CFG.SHEETS.DASH);
  const regionsTab = ss.getSheetByName(REGIONS.SHEET);
  const chartSlides = [
    [dash, `${moneyCol_(headers, cfg.kpiCol)} by month`, 'Monthly trend', best ? `Peak in ${split.monthName(best)}; ${P.length} months in scope.` : ''],
    [regionsTab, 'Monthly revenue by region', 'Monthly trend by market', 'Stacked by market — consolidated in ' + cur],
    [dash, 'Revenue by region', 'Revenue by market', split.regions[0] ? `${split.regions[0].name} leads with ${pct(split.regions[0].kpi, T.kpi)} of total.` : ''],
    [regionsTab, 'Niche mix by region', 'Niche mix by market', 'Share of each market\'s revenue by SSG Category'],
    [dash, 'Blended vs billed vs billable by month', 'Blended vs billed', `${pct(T.billed, T.kpi)} of blended revenue is billed.`],
    [dash, 'Top 10 clients', 'Top clients', ck[0] ? `${ck[0]} is the largest client (${pct(T.byClient[ck[0]], T.kpi)}).` : ''],
  ];
  chartSlides.forEach(c => { const chart = findChart_(c[0], c[1]); if (chart) chartSlide_(pres, chart, c[2], c[3], W, H); });

  // ---- 5. Region table
  sl = newSlide_(pres, 'Consolidated split by market', cur);
  const rt = [['Market', cfg.kpiCol, 'Billed revenue', 'Billed ÷ blended', 'Share', 'Campaigns', 'Top niche']];
  split.regions.forEach(r => rt.push([r.name, fmt(r.kpi), fmt(r.billed), pct(r.billed, r.kpi), pct(r.kpi, T.kpi), String(r.campaigns), topN(r.byNiche)[0] || '']));
  rt.push(['Total', fmt(T.kpi), fmt(T.billed), pct(T.billed, T.kpi), '100%', String(T.campaigns), nk[0] || '']);
  table_(sl, rt, 40, 90, W - 80, { total: true });

  // ---- 6. Niche table
  sl = newSlide_(pres, 'Revenue by niche', `SSG Category (US: Campaign Name prefix) · ${cur}`);
  const nt = [['Niche', cfg.kpiCol, 'Billed revenue', 'Billed ÷ blended', 'Share', 'Campaigns']];
  nk.slice(0, 12).forEach(k => nt.push([k, fmt(T.byNiche[k]), fmt(T.nicheBilled[k] || 0), pct(T.nicheBilled[k] || 0, T.byNiche[k]), pct(T.byNiche[k], T.kpi), String(T.nicheCampaigns[k] || 0)]));
  nt.push(['Total', fmt(T.kpi), fmt(T.billed), pct(T.billed, T.kpi), '100%', String(T.campaigns)]);
  table_(sl, nt, 40, 90, W - 80, { total: true });

  // ---- 7. One slide per market (in its own currency)
  split.regions.forEach(r => {
    const conv = convertRowsForMarket_(headers, r.rows, r.name);
    const sp = conv.factor === 1 ? null : computeRegionSplit_(conv.headers, conv.rows);
    const R = sp ? sp.regions[0] : r, mcur = conv.currency;
    const mf = n => fmtMoney_(n, cfg.numberFormat);
    sl = newSlide_(pres, r.name, `${mcur} · ${pct(r.kpi, T.kpi)} of all markets · ${R.campaigns} campaigns · ${R.clients} clients`);
    const kp = [[cfg.kpiCol, mf(R.kpi), DECK.GREEN], ['Billed revenue', mf(R.billed), DECK.AMBER], ['Billed ÷ blended', pct(R.billed, R.kpi), DECK.INK]];
    const kw = (W / 2 - 60 - 2 * 10) / 3;
    kp.forEach((c, i) => {
      const x = 40 + i * (kw + 10), y = 90;
      const box = sl.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, x, y, kw, 64);
      box.getFill().setSolidFill(DECK.SOFT); box.getBorder().setTransparent();
      text_(sl, c[0], x + 10, y + 6, kw - 20, 18, { size: 9, color: DECK.MUTED });
      text_(sl, c[1], x + 10, y + 26, kw - 20, 32, { size: 16, bold: true, color: c[2] });
    });
    const niches = topN(R.byNiche).slice(0, 8);
    const mt = [['Niche', cfg.kpiCol, 'Share', 'Billed']];
    niches.forEach(k => mt.push([k, mf(R.byNiche[k]), pct(R.byNiche[k], R.kpi), pct(R.nicheBilled[k] || 0, R.byNiche[k])]));
    table_(sl, mt, 40, 168, W / 2 - 60, {});
    const rsh = ss.getSheetByName(regionSheetName_(r.name));
    const chart = rsh && (findChart_(rsh, 'Monthly revenue by niche') || rsh.getCharts()[0]);
    if (chart) sl.insertSheetsChartAsImage(chart, W / 2 + 10, 90, W / 2 - 50, (W / 2 - 50) * CHART_H / CHART_W);
  });

  // ---- 8. Closing
  sl = newSlide_(pres, 'Notes', '');
  bulletList_(sl, [
    `Source: AdBook+ export, report run ${runStr}; ${rows.length} line items.`,
    `Consolidated figures in ${cfg.reportingCurrency}; market slides in each market's reporting currency. Rates: FX Rates tab of the master workbook.`,
    `Region = text before the first "|" in Position Path. Niche = (Campaign) SSG Category; for ${cfg.usMarket} the text before the first "-" in Campaign Name.`,
    `Headline metric: ${cfg.kpiCol}. Billed revenue = Adjusted Billable Revenue of lines whose Billing Status is ${cfg.billedStatuses.join(' / ')}; "Billed ÷ blended" = billed revenue ÷ total ${cfg.kpiCol}.`,
  ], 40, 90, W - 80, H - 140);

  // Move next to the market files
  const folderId = cfg.marketFolderId || cfg.driveFolderId;
  if (folderId) { try { DriveApp.getFileById(pres.getId()).moveTo(DriveApp.getFolderById(folderId)); } catch (e) { /* leave in root */ } }
  const url = pres.getUrl();
  try { SpreadsheetApp.getUi().alert('Leadership deck created', url, SpreadsheetApp.getUi().ButtonSet.OK); } catch (e) { Logger.log(url); }
  return url;
}

/* ------------------------------------------------------------------ */
/* Slide helpers                                                       */
/* ------------------------------------------------------------------ */

function fmtMoney_(n, format) {
  n = typeof n === 'number' ? n : 0;
  const dec = format.includes('.00') ? 2 : 0;
  let s = Math.abs(n).toFixed(dec);
  if (format.includes(',')) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return n < 0 ? `(${s})` : s;
}

function band_(sl, W, H) {
  const bg = sl.insertShape(SlidesApp.ShapeType.RECTANGLE, 0, 0, W, H);
  bg.getFill().setSolidFill(DECK.GREEN); bg.getBorder().setTransparent(); bg.sendToBack();
}

function newSlide_(pres, title, subtitle) {
  const sl = pres.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  const W = pres.getPageWidth();
  text_(sl, title, 40, 28, W - 80, 36, { size: 22, bold: true, color: DECK.INK });
  if (subtitle) text_(sl, subtitle, 40, 60, W - 80, 20, { size: 11, color: DECK.MUTED });
  const rule = sl.insertLine(SlidesApp.LineCategory.STRAIGHT, 40, 84, W - 40, 84);
  rule.getLineFill().setSolidFill(DECK.INK); rule.setWeight(1.5);
  text_(sl, profile_().title, 40, pres.getPageHeight() - 26, 300, 16, { size: 8, color: DECK.MUTED });
  return sl;
}

function text_(sl, str, x, y, w, h, o) {
  const box = sl.insertTextBox(str, x, y, w, h);
  const t = box.getText().getTextStyle();
  t.setFontFamily(DECK.FONT).setFontSize(o.size || 12).setBold(!!o.bold).setForegroundColor(o.color || DECK.INK);
  box.getText().getParagraphStyle().setSpaceAbove(0).setSpaceBelow(0);
  return box;
}

function bulletList_(sl, items, x, y, w, h) {
  const box = sl.insertTextBox(items.join('\n'), x, y, w, h);
  const tr = box.getText();
  tr.getTextStyle().setFontFamily(DECK.FONT).setFontSize(14).setForegroundColor(DECK.INK);
  tr.getParagraphStyle().setSpaceBelow(8).setLineSpacing(115);
  try { tr.getListStyle().applyListPreset(SlidesApp.ListPreset.DISC_CIRCLE_SQUARE); } catch (e) {}
  return box;
}

function table_(sl, rows, x, y, w, o) {
  const nR = rows.length, nC = rows[0].length;
  const rowH = 20;
  const tbl = sl.insertTable(nR, nC, x, y, w, Math.min(rowH * nR, 300));
  rows.forEach((r, i) => r.forEach((v, j) => {
    const cell = tbl.getCell(i, j);
    cell.getText().setText(String(v == null ? '' : v));
    const st = cell.getText().getTextStyle();
    st.setFontFamily(DECK.FONT).setFontSize(9).setForegroundColor(DECK.INK);
    if (i === 0) { st.setBold(true); cell.getFill().setSolidFill('#e8ece5'); }
    else if (o.total && i === nR - 1) { st.setBold(true).setForegroundColor('#ffffff'); cell.getFill().setSolidFill(DECK.GREEN); }
    else cell.getFill().setSolidFill(i % 2 ? '#ffffff' : '#f6f7f4');
    cell.getText().getParagraphStyle().setParagraphAlignment(j === 0 ? SlidesApp.ParagraphAlignment.START : SlidesApp.ParagraphAlignment.END);
  }));
  return tbl;
}

function findChart_(sh, title) {
  if (!sh) return null;
  return sh.getCharts().find(c => { try { return String(c.getOptions().get('title')) === title; } catch (e) { return false; } }) || null;
}

function chartSlide_(pres, chart, title, takeaway, W, H) {
  const sl = newSlide_(pres, title, '');
  const cw = W - 80, chh = Math.min(H - 150, cw * CHART_H / CHART_W);
  sl.insertSheetsChartAsImage(chart, 40, 92, cw, chh);
  if (takeaway) text_(sl, takeaway, 40, 92 + chh + 8, cw, 22, { size: 12, bold: true, color: DECK.GREEN });
}

/* ===================== Changes ===================== */
/**
 * Talent Revenue Review — Changes since the previous import
 * ----------------------------------------------------------
 * snapshotData_()  copies Data → "Data (previous)" (hidden) before an import replaces it.
 * computeChanges_() diffs "Data (previous)" against Data on a per-line key.
 * buildChangesTab_() writes the "Changes" tab; exportExcel adds the same as a tab.
 */

const CHG = {
  PREV_SHEET: 'Data (previous)',
  SHEET: 'Changes',
  // fields compared per line (local-currency money columns + statuses + descriptors)
  // Profile-aware: see chgMoney_() / chgText_() / chgDesc_() below (Talent lists unchanged)
  MONEY: ['Adjusted Blended Revenue', 'Adjusted Billable Revenue', 'Actual Billed Amount'],
  TEXT: ['Billing Status', 'IO Status', 'Campaign Name', 'Client Name', 'Sales Rep', 'Region', 'Fee Type', 'Niche', '(Campaign) SSG Category', 'Start Date', 'End Date'],
  DESC: ['Region', 'Period', 'Fee Type', 'IO Status', 'Billing Status', '(Drop) Job Code (limit 6 characters)', 'Drop ID', 'Campaign ID', 'Campaign Name', 'Client Name'],
  PRINT_TEXT: ['Billing Status', 'IO Status', 'Campaign Name', 'Client Name', 'Sales Rep', 'Region', 'Fee Type', 'Niche', 'Book', 'Page Cat', 'Page Cat Group', 'Pages', 'Issue Label', 'Start Date', 'End Date'],
  PRINT_DESC: ['Region', 'Period', 'Niche', 'Book', 'Page Cat', 'Fee Type', 'IO Status', 'Drop ID', 'Campaign ID', 'Campaign Name', 'Client Name'],
};
function chgMoney_() { return profile_().changeMoney || CHG.MONEY; }
function chgText_() { return isPrint_() ? CHG.PRINT_TEXT : CHG.TEXT; }
function chgDesc_() { return isPrint_() ? CHG.PRINT_DESC : CHG.DESC; }
function chgKpi_() { return profile_().kpiCol; }
/** Columns kept in the snapshot and read for the comparison. */
function changeColumns_() {
  return Array.from(new Set(['Report Run Date', 'Drop ID', 'Period', 'Campaign ID', CFG.REGION_SOURCE_COL, 'Region', 'FX Currency', 'Billed Revenue', chgKpi_(), ...chgMoney_(), ...chgText_(), ...chgDesc_()]));
}

/** Fingerprint of a dataset: report run date + row count + rounded revenue total. */
function dataFingerprint_(headers, rows) {
  const iR = headers.indexOf('Report Run Date'), iK = headers.indexOf(chgKpi_());
  let run = '', sum = 0;
  rows.forEach(r => { const d = r[iR]; if (d instanceof Date) { const t = d.getTime(); if (!run || t > run) run = t; } else if (d && !run) run = String(d); sum += typeof r[iK] === 'number' ? r[iK] : 0; });
  return `${run}|${rows.length}|${Math.round(sum)}`;
}

/**
 * Keep a copy of the current Data before it is overwritten — unless the incoming dataset is the
 * same report (same fingerprint), in which case the existing snapshot is kept so re-processing a
 * file never destroys the previous-vs-current comparison.
 */
function snapshotData_(ss, incomingHeaders, incomingRows) {
  const data = ss.getSheetByName(CFG.SHEETS.DATA);
  if (!data || dataRowCount_(data) < 1) return false;
  const cur = readColumns_(data, changeColumns_());          // compact: only the columns the comparison uses
  if (incomingHeaders && incomingRows) {
    if (dataFingerprint_(cur.headers, cur.rows) === dataFingerprint_(incomingHeaders, incomingRows)) {
      progressSub_('Same report as the current Data — keeping the existing "Data (previous)" snapshot');
      return false;
    }
  }
  let prev = ss.getSheetByName(CHG.PREV_SHEET);
  if (!prev) prev = ss.insertSheet(CHG.PREV_SHEET);
  prev.clearContents();
  const values = [cur.headers, ...cur.rows];
  ensureColumns_(prev, values[0].length); ensureRows_(prev, values.length);
  const extra = prev.getMaxRows() - values.length; if (extra > 0) prev.deleteRows(values.length + 1, extra);
  const iPer = cur.headers.indexOf('Period');
  if (iPer >= 0 && values.length > 1) prev.getRange(2, iPer + 1, values.length - 1, 1).setNumberFormat('@');   // keep "2026-01" as text
  prev.getRange(1, 1, values.length, values[0].length).setValues(values);
  prev.hideSheet();
  return true;
}

/** Period as text "YYYY-MM" whether the cell holds text, a Date (Sheets auto-conversion) or "YYYY-MM-DD". */
function normPeriod_(v) {
  if (v instanceof Date && !isNaN(v)) return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}`;
  const t = String(v === null || v === undefined ? '' : v).trim();
  const m = t.match(/^(\d{4})-(\d{2})/); return m ? `${m[1]}-${m[2]}` : t;
}

/** Line key: Drop ID + Period, falling back to Campaign ID + Position Path + Period. */
function lineKey_(row, I) {
  const s = v => (v === null || v === undefined) ? '' : String(v).trim();
  const drop = s(row[I.drop]), per = normPeriod_(row[I.period]);
  if (drop) return `${drop}|${per}`;
  return `${s(row[I.campaign])}|${s(row[I.path])}|${per}`;
}

/**
 * @param {Spreadsheet} ss
 * @param {string=} region   optional market restriction
 * @param {number=} factor   display multiplier from the reporting currency (1 = reporting currency)
 * @param {string=} curLabel display currency code
 * @return {Object|null} null when there is no previous snapshot
 *
 * All money is converted to the reporting currency with the CURRENT FX rates (both sides), so the
 * figures tie to the KPI cards and a rate edit is never reported as a data change.
 * Change detection itself is done on local (as-exported) values.
 */
function computeChanges_(ss, region, factor, curLabel) {
  factor = factor || 1;
  const cfg = getConfig();
  curLabel = curLabel || cfg.reportingCurrency;
  const prev = ss.getSheetByName(CHG.PREV_SHEET), data = ss.getSheetByName(CFG.SHEETS.DATA);
  if (!prev || dataRowCount_(prev) < 1 || !data || dataRowCount_(data) < 1) return null;
  const cols = changeColumns_();
  const Pr = readColumns_(prev, cols), Nr = readColumns_(data, cols);
  const P = [Pr.headers, ...Pr.rows], N = [Nr.headers, ...Nr.rows];
  const ph = P[0], nh = N[0];
  const ix = (h, n) => h.indexOf(n);
  const mk = h => ({ drop: ix(h, 'Drop ID'), period: ix(h, 'Period'), campaign: ix(h, 'Campaign ID'), path: ix(h, CFG.REGION_SOURCE_COL), region: ix(h, 'Region'),
                     cur: ix(h, 'FX Currency'), kpi: ix(h, chgKpi_()), bill: ix(h, 'Billed Revenue') });
  const pI = mk(ph), nI = mk(nh);
  const s = v => (v === null || v === undefined) ? '' : (v instanceof Date ? ymd_(v) : (typeof v === 'string' ? v.trim() : String(v)));
  const num = v => (typeof v === 'number' ? v : 0);
  const keep = (row, I) => !region || s(row[I.region]) === region;
  // local → display: × (1 unit of row currency = ? reporting) × display factor, using today's rates
  const conv = (row, I, v) => { const c = I.cur >= 0 ? (s(row[I.cur]) || cfg.reportingCurrency) : cfg.reportingCurrency; return v * fxRate_(c) * factor; };

  const pm = {}; P.slice(1).forEach(r => { if (keep(r, pI)) pm[lineKey_(r, pI)] = r; });
  const nm = {}; N.slice(1).forEach(r => { if (keep(r, nI)) nm[lineKey_(r, nI)] = r; });

  const DESC = chgDesc_(), MONEY = chgMoney_(), TEXT = chgText_(), KPI = chgKpi_();
  const desc = (row, h) => DESC.map(c => { const i = ix(h, c); return i < 0 ? '' : (c === 'Period' ? normPeriod_(row[i]) : s(row[i])); });
  const money = (row, h, I) => MONEY.map(c => { const i = ix(h, c); return i >= 0 ? conv(row, I, num(row[i])) : 0; });

  const added = [], removed = [], changed = [];
  const tot = { prevKpi: 0, newKpi: 0, prevBill: 0, newBill: 0, prevLines: 0, newLines: 0, byRegion: {}, byMonth: {}, byRegionMonth: {} };
  const cell = (o, k) => (o[k] = o[k] || { prevKpi: 0, newKpi: 0, prevBill: 0, newBill: 0, added: 0, removed: 0, changed: 0 });
  const acc = (row, I, side) => {
    const reg = s(row[I.region]) || CFG.REGION_FALLBACK, per = normPeriod_(row[I.period]) || '(no month)';
    const k = conv(row, I, num(row[I.kpi])), b = conv(row, I, num(row[I.bill]));
    tot[side + 'Kpi'] += k; tot[side + 'Bill'] += b; tot[side + 'Lines']++;
    [cell(tot.byRegion, reg), cell(tot.byMonth, per), cell(tot.byRegionMonth, reg + '|' + per)].forEach(o => { o[side + 'Kpi'] += k; o[side + 'Bill'] += b; });
    return { reg, per, k };
  };
  const bumpDelta = (reg, per, kind, v) => [cell(tot.byRegion, reg), cell(tot.byMonth, per), cell(tot.byRegionMonth, reg + '|' + per)].forEach(o => { o[kind] += v; });

  Object.keys(pm).forEach(k => acc(pm[k], pI, 'prev'));
  Object.keys(nm).forEach(k => acc(nm[k], nI, 'new'));

  Object.keys(nm).forEach(k => {
    const n = nm[k], p = pm[k];
    const reg = s(n[nI.region]) || CFG.REGION_FALLBACK, per = normPeriod_(n[nI.period]) || '(no month)';
    if (!p) { added.push([...desc(n, nh), ...money(n, nh, nI)]); bumpDelta(reg, per, 'added', conv(n, nI, num(n[nI.kpi]))); return; }
    const d = desc(n, nh);
    MONEY.forEach(c => {
      const ip = ix(ph, c), inn = ix(nh, c); if (ip < 0 || inn < 0) return;
      const a = num(p[ip]), b = num(n[inn]);
      if (Math.abs(a - b) > 0.005) { const A = conv(p, pI, a), B = conv(n, nI, b); changed.push([...d, c, A, B, B - A, a ? (B - A) / A : '']); if (c === KPI) bumpDelta(reg, per, 'changed', B - A); }
    });
    TEXT.forEach(c => { const ip = ix(ph, c), inn = ix(nh, c); if (ip < 0 || inn < 0) return; const a = s(p[ip]), b = s(n[inn]); if (a !== b) changed.push([...d, c, a, b, '', '']); });
  });
  Object.keys(pm).forEach(k => { if (!nm[k]) { const p = pm[k]; removed.push([...desc(p, ph), ...money(p, ph, pI)]); bumpDelta(s(p[pI.region]) || CFG.REGION_FALLBACK, normPeriod_(p[pI.period]) || '(no month)', 'removed', -conv(p, pI, num(p[pI.kpi]))); } });

  const sortKey = r => r.slice(0, 8).join('|');
  added.sort((a, b) => sortKey(a).localeCompare(sortKey(b))); removed.sort((a, b) => sortKey(a).localeCompare(sortKey(b))); changed.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  return { added, removed, changed, tot, currency: curLabel, prevRun: lastRunDate_(P, ph), newRun: lastRunDate_(N, nh), desc: DESC, money: MONEY, kpi: KPI };
}

function lastRunDate_(values, headers) {
  const i = headers.indexOf('Report Run Date'); if (i < 0) return '';
  let d = null; values.slice(1).forEach(r => { const v = r[i]; if (v instanceof Date && (!d || v > d)) d = v; });
  return d ? Utilities.formatDate(d, Session.getScriptTimeZone(), 'd MMM yyyy') : '';
}

/** Writes the change tables into a sheet starting at startRow. Returns next free row. */
function writeChangesBlocks_(sh, ch, startRow, opts) {
  opts = opts || {};
  let row = startRow;
  const t = ch.tot, cur = ch.currency;
  const pc = (d, base) => base ? d / base : '';
  sh.getRange(row, 1).setValue(opts.title || `Changes since previous import`).setFontSize(16).setFontWeight('bold'); row++;
  sh.getRange(row, 1).setValue(`Previous report run ${ch.prevRun || '—'}  →  current report run ${ch.newRun || '—'}${opts.scope ? '  ·  ' + opts.scope : ''}  ·  all amounts in ${cur} at current exchange rates`).setFontColor('#5f6b63'); row += 2;

  // Summary
  const sum = [
    [ch.kpi || 'Adjusted Blended Revenue', t.prevKpi, t.newKpi, t.newKpi - t.prevKpi, pc(t.newKpi - t.prevKpi, t.prevKpi)],
    ['Billed (status complete → Adjusted Billable)', t.prevBill, t.newBill, t.newBill - t.prevBill, pc(t.newBill - t.prevBill, t.prevBill)],
    ['Lines', t.prevLines, t.newLines, t.newLines - t.prevLines, pc(t.newLines - t.prevLines, t.prevLines)],
    ['Added lines', '', ch.added.length, '', ''], ['Removed lines', '', ch.removed.length, '', ''], ['Changed values', '', ch.changed.length, '', ''],
  ];
  row = writeBlock_(sh, row, 'Summary', ['', 'Previous', 'Current', 'Change', 'Change %'], sum, { money: [2, 3, 4], pct: [5] });
  sh.getRange(row - sum.length - 2 + 2, 2, 4, 3).setNumberFormat('#,##0');   // line counts as integers

  // By market with reconciliation: Δ = added + removed + changed
  const mk = (label, o) => [label, o.prevKpi, o.newKpi, o.newKpi - o.prevKpi, pc(o.newKpi - o.prevKpi, o.prevKpi), o.added, o.removed, o.changed, o.prevBill, o.newBill, o.newBill - o.prevBill, pc(o.newBill - o.prevBill, o.prevBill)];
  const sumCells = keys => keys.reduce((a, k) => { const o = t.byRegion[k]; ['prevKpi','newKpi','prevBill','newBill','added','removed','changed'].forEach(f => a[f] += o[f]); return a; }, { prevKpi: 0, newKpi: 0, prevBill: 0, newBill: 0, added: 0, removed: 0, changed: 0 });
  const regions = Object.keys(t.byRegion).sort();
  const br = regions.map(r => mk(r, t.byRegion[r])); br.push(mk('Total', sumCells(regions)));
  const headM = ['Market', `Blended — previous`, 'Blended — current', 'Δ blended', 'Δ %', 'of which added lines', 'of which removed lines', 'of which changed values', 'Billed — previous', 'Billed — current', 'Δ billed', 'Δ %'];
  row = writeBlock_(sh, row, `Change by market (${cur})`, headM, br, { money: [2, 3, 4, 6, 7, 8, 9, 10, 11], pct: [5, 12], totalRow: true });

  // By month
  const months = Object.keys(t.byMonth).sort();
  const bm = months.map(m => mk(monthLabel_(m), t.byMonth[m]));
  const tm = months.reduce((a, k) => { const o = t.byMonth[k]; ['prevKpi','newKpi','prevBill','newBill','added','removed','changed'].forEach(f => a[f] += o[f]); return a; }, { prevKpi: 0, newKpi: 0, prevBill: 0, newBill: 0, added: 0, removed: 0, changed: 0 });
  bm.push(mk('Total', tm));
  row = writeBlock_(sh, row, `Change by month (${cur})`, ['Month', ...headM.slice(1)], bm, { money: [2, 3, 4, 6, 7, 8, 9, 10, 11], pct: [5, 12], totalRow: true });

  // Market × month Δ matrix (blended) with %
  const hx = ['Market \\ Month', ...months.map(monthLabel_), 'Total Δ', 'Total Δ %'];
  const rx = regions.map(r => { const o = t.byRegion[r]; return [r, ...months.map(m => { const c = t.byRegionMonth[r + '|' + m]; return c ? c.newKpi - c.prevKpi : 0; }), o.newKpi - o.prevKpi, pc(o.newKpi - o.prevKpi, o.prevKpi)]; });
  rx.push(['Total', ...months.map(m => t.byMonth[m].newKpi - t.byMonth[m].prevKpi), tm.newKpi - tm.prevKpi, pc(tm.newKpi - tm.prevKpi, tm.prevKpi)]);
  row = writeBlock_(sh, row, `Δ blended by market × month (${cur})`, hx, rx, { money: range_(2, months.length + 2), pct: [months.length + 3], totalRow: true });

  const CAP = opts.cap || 2000;
  const capped = (list) => list.length > CAP ? list.slice(0, CAP) : list;
  const note = (list) => list.length > CAP ? ` — first ${CAP} of ${list.length} shown; full list in the Excel download` : '';
  const DESC = ch.desc || CHG.DESC, MONEY = ch.money || CHG.MONEY, nD = DESC.length;
  const H = [...DESC, ...MONEY.map(c => `${c} (${cur})`)];
  row = writeBlock_(sh, row, `Added lines (${ch.added.length})${note(ch.added)}`, H, ch.added.length ? capped(ch.added) : [['— none —', ...new Array(H.length - 1).fill('')]], { money: range_(nD + 1, nD + MONEY.length) });
  row = writeBlock_(sh, row, `Removed lines (${ch.removed.length})${note(ch.removed)}`, H, ch.removed.length ? capped(ch.removed) : [['— none —', ...new Array(H.length - 1).fill('')]], { money: range_(nD + 1, nD + MONEY.length) });
  const HC = [...DESC, 'Field', `Previous`, `Current`, `Δ (${cur})`, 'Δ %'];
  row = writeBlock_(sh, row, `Changed values (${ch.changed.length})${note(ch.changed)} — amounts in ${cur}, text fields as exported`, HC, ch.changed.length ? capped(ch.changed) : [['— none —', ...new Array(HC.length - 1).fill('')]], { money: [nD + 2, nD + 3, nD + 4], pct: [nD + 5] });
  sh.setColumnWidths(1, HC.length, 120); sh.setColumnWidth(9, 260); sh.setColumnWidth(10, 180);
  return row;
}
function monthLabel_(p) { return /^\d{4}-\d{2}$/.test(p) ? MONTH_NAMES_[parseInt(p.slice(5, 7), 10) - 1].slice(0, 3) + ' ' + p.slice(0, 4) : p; }

/** Master "Changes" tab. */
function buildChangesTab_(ss) {
  let sh = ss.getSheetByName(CHG.SHEET);
  if (!sh) sh = ss.insertSheet(CHG.SHEET);
  resetSheet_(sh);
  progressSub_('Changes: reading both datasets and comparing…');
  const ch = computeChanges_(ss);
  progressSub_('Changes: writing the tab…');
  if (!ch) { sh.getRange(1, 1).setValue('Changes since previous import').setFontSize(16).setFontWeight('bold');
             sh.getRange(2, 1).setValue('First import — nothing to compare yet. From the next import onward this tab lists added, removed and changed lines.').setFontColor('#5f6b63'); return null; }
  writeChangesBlocks_(sh, ch, 1, {});
  sh.setFrozenRows(0);
  return ch;
}

/* ===================== ExportExcel ===================== */
/**
 * Talent Revenue Review — Excel export from the web app
 * ------------------------------------------------------
 * exportExcel(filters) builds a temporary Google Sheet with formatted tabs for the current
 * filtered view, converts it to .xlsx through Google's own export endpoint, deletes the temp
 * file and returns the bytes (base64) to the browser for download. Nothing leaves the domain.
 */

const XLS = { TMP_PREFIX: 'tmp_talent_revenue_export_' };

function exportExcel(filters) {
  filters = filters || {};
  const who = (Session.getActiveUser().getEmail() || '').toLowerCase();
  const cfg = getConfig();
  if (!isReviewer_(who, cfg)) throw new Error('Not authorised.');

  const master = SpreadsheetApp.getActiveSpreadsheet();
  const data = master.getSheetByName(CFG.SHEETS.DATA);
  if (!data || data.getLastRow() < 2) throw new Error('No data to export.');
  if (isPrint_()) return exportExcelPrint_(master, data, filters, who, cfg);
  const values = data.getRange(1, 1, dataRowCount_(data) + 1, data.getLastColumn()).getValues();
  const headers = values[0];
  const ctx = currencyContext_(headers, filters);                       // { marketCur, factor, convHeaders, convRows }
  const kept = ctx.convRows(applyFilters_(headers, values.slice(1), filters));
  if (!kept.length) throw new Error('No rows match the current filters.');
  const H = ctx.convHeaders;

  const split = computeRegionSplit_(H, kept);
  const T = split.totals, cur = ctx.marketCur, kpiName = moneyCol_(H, cfg.kpiCol);
  const review = computeReviewPivot_(H, kept);
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HHmm');
  const scope = Object.keys(filters).filter(k => filters[k] && k !== 'currency').map(k => `${k}=${filters[k]}`).join(', ') || 'all';

  const ss = SpreadsheetApp.create(`${XLS.TMP_PREFIX}${stamp}`);
  const first = ss.getSheets()[0];
  const pct = (a, b) => b ? a / b : 0;
  const topN = o => Object.keys(o).sort((a, b) => o[b] - o[a]);

  // ---- Summary
  let sh = ss.insertSheet('Summary'); resetSheet_(sh); sh.setColumnWidth(1, 300); sh.setColumnWidths(2, 6, 140);
  let row = 1;
  sh.getRange(row, 1).setValue(profile_().title).setFontSize(18).setFontWeight('bold'); row++;
  sh.getRange(row, 1).setValue(`Exported ${stamp} · filters: ${scope} · all figures in ${cur}`).setFontColor('#5f6b63'); row += 2;
  const kp = [
    [kpiName, T.kpi], ['Billed (Billing Status complete → Adjusted Billable Revenue)', T.billed], ['Adjusted billable', T.billable],
    ['Billed ÷ blended', pct(T.billed, T.kpi)],
    ['Talent fee internal — blended', T.feeInternal], ['Talent fee internal — billed', T.feeInternalBilled],
    ['Talent fee external — blended', T.feeExternal], ['Talent fee external — billed', T.feeExternalBilled],
    ['US talent fees — blended', T.feeUs], ['US talent fees — billed', T.feeUsBilled],
    ['Campaigns', T.campaigns], ['Clients', T.clients], ['Markets', split.regions.length], ['Line items', kept.length],
  ];
  row = writeBlock_(sh, row, 'Key figures', ['Metric', 'Value'], kp, {});
  kp.forEach((k, i) => { const c = sh.getRange(row - kp.length - 2 + i, 2); c.setNumberFormat(i === 3 ? '0.0%' : i >= 10 ? '#,##0' : moneyFmt_()); });

  // ---- Monthly
  sh = ss.insertSheet('Monthly'); resetSheet_(sh); sh.setColumnWidth(1, 120); sh.setColumnWidths(2, 8, 140);
  const mt = monthlyTable_(H, kept, cfg);
  writeBlock_(sh, 1, `By month — ${cur}`, ['Month', kpiName, 'Billed (complete)', 'Adjusted billable', 'Billed ÷ blended', 'Fee internal', 'Fee external', 'vs prior month'],
    mt, { money: [2, 3, 4, 6, 7], pct: [5, 8], totalRow: true });

  // ---- Markets
  sh = ss.insertSheet('Markets'); resetSheet_(sh); sh.setColumnWidth(1, 160); sh.setColumnWidths(2, 12, 130);
  const P = split.periods, N = split.niches;
  const r1 = split.regions.map(r => [r.name, r.kpi, r.billed, pct(r.billed, r.kpi), r.feeInternal, r.feeExternal, pct(r.kpi, T.kpi), r.campaigns, r.clients, topN(r.byNiche)[0] || '']);
  r1.push(['Total', T.kpi, T.billed, pct(T.billed, T.kpi), T.feeInternal, T.feeExternal, 1, T.campaigns, T.clients, topN(T.byNiche)[0] || '']);
  row = writeBlock_(sh, 1, `Consolidated split by market — ${cur}`, ['Market', kpiName, 'Billed (complete)', 'Billed ÷ blended', 'Fee internal', 'Fee external', 'Share', 'Campaigns', 'Clients', 'Top niche'],
    r1, { money: [2, 3, 5, 6], pct: [4, 7], int: [8, 9], totalRow: true });
  const r2 = split.regions.map(r => [r.name, ...P.map(p => r.byPeriod[p] || 0), r.kpi]); r2.push(['Total', ...P.map(p => T.byPeriod[p] || 0), T.kpi]);
  row = writeBlock_(sh, row, 'Market × month', ['Market', ...P.map(split.monthName), 'Total'], r2, { money: range_(2, P.length + 2), totalRow: true });
  const r3 = split.regions.map(r => [r.name, ...N.map(k => r.byNiche[k] || 0), r.kpi]); r3.push(['Total', ...N.map(k => T.byNiche[k] || 0), T.kpi]);
  writeBlock_(sh, row, 'Market × niche', ['Market', ...N, 'Total'], r3, { money: range_(2, N.length + 2), totalRow: true });

  // ---- Fee types
  sh = ss.insertSheet('Fee types'); resetSheet_(sh); sh.setColumnWidth(1, 260); sh.setColumnWidths(2, 8, 140);
  const F = topN(T.byFee);
  const rf = F.map(k => [k, T.byFee[k], T.byFeeBilled[k] || 0, pct(T.byFeeBilled[k] || 0, T.byFee[k]), pct(T.byFee[k], T.kpi)]); rf.push(['Total', T.kpi, T.billed, pct(T.billed, T.kpi), 1]);
  row = writeBlock_(sh, 1, 'Fee type (last segment of Position Path)', ['Fee type', kpiName, 'Billed (complete)', 'Billed ÷ blended', 'Share'], rf, { money: [2, 3], pct: [4, 5], totalRow: true });
  const rfm = split.regions.map(r => [r.name, ...F.map(k => r.byFee[k] || 0), r.kpi]); rfm.push(['Total', ...F.map(k => T.byFee[k] || 0), T.kpi]);
  row = writeBlock_(sh, row, 'Market × fee type', ['Market', ...F, 'Total'], rfm, { money: range_(2, F.length + 2), totalRow: true });
  const usKeys = Object.keys(T.byUsFee || {});
  if (usKeys.length) {
    const ru = usKeys.sort((a, b) => T.byUsFee[b] - T.byUsFee[a]).map(k => [k, T.byUsFee[k], T.byUsFeeBilled[k] || 0, pct(T.byUsFeeBilled[k] || 0, T.byUsFee[k]), pct(T.byUsFee[k], T.feeUs)]);
    ru.push(['Total', T.feeUs, T.feeUsBilled, pct(T.feeUsBilled, T.feeUs), 1]);
    writeBlock_(sh, row, `US talent fees (${cfg.usMarket})`, ['Fee type', kpiName, 'Billed (complete)', 'Billed ÷ blended', 'Share of US fees'], ru, { money: [2, 3], pct: [4, 5], totalRow: true });
  }

  // ---- Niches
  sh = ss.insertSheet('Niches'); resetSheet_(sh); sh.setColumnWidth(1, 220); sh.setColumnWidths(2, 14, 130);
  const rn = topN(T.byNiche).map(k => [k, T.byNiche[k], T.nicheBilled[k] || 0, pct(T.nicheBilled[k] || 0, T.byNiche[k]), pct(T.byNiche[k], T.kpi), T.nicheCampaigns[k] || 0]);
  rn.push(['Total', T.kpi, T.billed, pct(T.billed, T.kpi), 1, T.campaigns]);
  row = writeBlock_(sh, 1, 'Niche (SSG Category; US: Campaign Name prefix)', ['Niche', kpiName, 'Billed (complete)', 'Billed ÷ blended', 'Share', 'Campaigns'], rn, { money: [2, 3], pct: [4, 5], int: [6], totalRow: true });
  const rnm = topN(T.byNiche).map(k => [k, ...P.map(p => (T.nichePeriod[k] || {})[p] || 0), T.byNiche[k]]); rnm.push(['Total', ...P.map(p => T.byPeriod[p] || 0), T.kpi]);
  writeBlock_(sh, row, 'Niche × month', ['Niche', ...P.map(split.monthName), 'Total'], rnm, { money: range_(2, P.length + 2), totalRow: true });

  // ---- Review pivot
  sh = ss.insertSheet('Review'); resetSheet_(sh);
  writeReviewTable_(sh, review, 1, { freeze: true, title: `Sum of ${review.measure} — ${scope}` });

  // ---- Top campaigns + Detail
  sh = ss.insertSheet('Top campaigns'); resetSheet_(sh); sh.setColumnWidth(1, 90).setColumnWidth(2, 300).setColumnWidth(3, 180); sh.setColumnWidths(4, 6, 140);
  const camp = campaignTable_(H, kept, cfg);
  writeBlock_(sh, 1, `Campaigns by ${kpiName}`, ['Campaign ID', 'Campaign', 'Client', 'Market', 'Sales rep', 'IO status', kpiName, 'Billed (complete)'], camp, { money: [7, 8] });

  sh = ss.insertSheet('Detail'); resetSheet_(sh);
  const cols = ['Region', 'Period', 'Fee Type', 'IO Status', 'Billing Status', '(Drop) Job Code (limit 6 characters)', 'Drop ID', 'Campaign ID', 'Campaign Name',
    'Client Name', 'Agency Name', 'Sales Rep', 'Niche', '(Campaign) SSG Category', '(Drop) SSG Platform', 'Position Path', 'FX Currency', 'FX Rate',
    kpiName, moneyCol_(H, CFG.BILLED_COL), moneyCol_(H, CFG.BILLABLE_COL), moneyCol_(H, CFG.ADBOOK_BILLED_COL)];
  const ci = cols.map(c => H.indexOf(c));
  const det = kept.map(r => ci.map(i => i >= 0 ? r[i] : ''));
  writeBlock_(sh, 1, `Line items — ${det.length} rows`, cols, det, { money: [18, 19, 20, 21] });
  sh.setFrozenRows(2); sh.setColumnWidths(1, cols.length, 130); sh.setColumnWidth(9, 280); sh.setColumnWidth(15, 320);

  // ---- Changes since previous import (whole dataset, or the selected market)
  const ch = computeChanges_(master, filters.region || '', ctx.factor, ctx.marketCur);
  sh = ss.insertSheet('Changes'); resetSheet_(sh);
  if (ch) writeChangesBlocks_(sh, ch, 1, { scope: filters.region ? `market ${filters.region}` : 'all markets', cap: 100000 });
  else { sh.getRange(1, 1).setValue('Changes since previous import').setFontSize(16).setFontWeight('bold'); sh.getRange(2, 1).setValue('No previous import to compare with.').setFontColor('#5f6b63'); }

  ss.deleteSheet(first);
  ss.setActiveSheet(ss.getSheetByName('Summary')); ss.moveActiveSheet(1);
  SpreadsheetApp.flush();

  // ---- Convert to .xlsx via Google's export endpoint, then delete the temp sheet
  const url = `https://docs.google.com/spreadsheets/d/${ss.getId()}/export?format=xlsx`;
  const resp = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpErrors: true });
  try { DriveApp.getFileById(ss.getId()).setTrashed(true); } catch (e) {}
  if (resp.getResponseCode() !== 200) throw new Error('Export failed (' + resp.getResponseCode() + ').');
  const name = `${profile_().title} ${stamp}${filters.region ? ' – ' + filters.region : ''}.xlsx`;
  logAccess_(who, 'download', Object.keys(filters).filter(k => filters[k]).map(k => `${k}=${filters[k]}`).join(', ') || 'all');
  return { name, base64: Utilities.base64Encode(resp.getContent()) };
}

/* ------------------------------------------------------------------ */
/* Shared filter / currency helpers (also used by getDashboardData)    */
/* ------------------------------------------------------------------ */

/** Rows that pass every filter. Region filter included. */
function applyFilters_(headers, rows, filters) {
  const idx = n => headers.indexOf(n);
  const I = { region: idx('Region'), period: idx('Period'), platform: idx('(Drop) SSG Platform'), io: idx('IO Status'), bs: idx('Billing Status'),
              rep: idx('Sales Rep'), client: idx('Client Name'), cat: idx(nicheCol_(headers)), catEu: idx(CFG.NICHE_SRC_EU), cname: idx('Campaign Name'), fee: idx('Fee Type'), path: idx(CFG.REGION_SOURCE_COL) };
  const s = v => (v === null || v === undefined) ? '' : String(v);
  return rows.filter(row => {
    const period = s(row[I.period]);
    if (filters.region && s(row[I.region]) !== filters.region) return false;
    if (filters.period && period !== filters.period) return false;
    if (filters.year && !period.startsWith(filters.year)) return false;
    if (filters.platform && s(row[I.platform]) !== filters.platform) return false;
    if (filters.ioStatus && s(row[I.io]) !== filters.ioStatus) return false;
    if (filters.billingStatus && s(row[I.bs]) !== filters.billingStatus) return false;
    if (filters.rep && s(row[I.rep]) !== filters.rep) return false;
    if (filters.client && s(row[I.client]) !== filters.client) return false;
    if (filters.niche) { const n = headers[I.cat] === 'Niche' ? s(row[I.cat]) : deriveNiche_(s(row[I.region]), I.catEu >= 0 ? row[I.catEu] : '', I.cname >= 0 ? row[I.cname] : ''); if (n !== filters.niche) return false; }
    if (filters.feeType) { const fee = I.fee >= 0 && s(row[I.fee]) ? s(row[I.fee]) : deriveFeeType_(I.path >= 0 ? row[I.path] : ''); if (fee !== filters.feeType) return false; }
    return true;
  });
}

/** Currency handling for a request: explicit "Show in" > selected market's currency > reporting currency. */
function currencyContext_(headers, filters) {
  const cfg = getConfig();
  const marketCur = (filters.currency || '').toUpperCase() || (filters.region ? marketCurrency_(filters.region) : cfg.reportingCurrency);
  const factor = marketCur === cfg.reportingCurrency ? 1 : 1 / fxRate_(marketCur);
  const suffix = ` (${cfg.reportingCurrency})`;
  const convIdx = headers.map((h, i) => String(h).endsWith(suffix) ? i : -1).filter(i => i >= 0);
  const convHeaders = factor === 1 ? headers : headers.map(h => String(h).endsWith(suffix) ? String(h).slice(0, -suffix.length) + ` (${marketCur})` : h);
  const convRows = rs => factor === 1 ? rs : rs.map(r => { const c = r.slice(); convIdx.forEach(i => { if (typeof c[i] === 'number') c[i] *= factor; }); return c; });
  return { marketCur, factor, convHeaders, convRows };
}

/** Month | KPI | billed | billable | billed÷blended | fee int | fee ext | MoM. Last row = total. */
function monthlyTable_(H, rows, cfg) {
  const idx = n => H.indexOf(n);
  const iP = idx('Period'), iK = idx(moneyCol_(H, cfg.kpiCol)), iB = idx(moneyCol_(H, CFG.BILLED_COL)), iBl = idx(moneyCol_(H, CFG.BILLABLE_COL)), iF = idx('Fee Type'), iPath = idx(CFG.REGION_SOURCE_COL), iReg = idx('Region');
  const n = v => typeof v === 'number' ? v : 0;
  const m = {};
  rows.forEach(r => { const p = String(r[iP] || ''); if (!p) return; const o = m[p] = m[p] || { k: 0, b: 0, bl: 0, fi: 0, fe: 0 };
    o.k += n(r[iK]); o.b += n(r[iB]); o.bl += n(r[iBl]);
    const fee = iF >= 0 && r[iF] ? String(r[iF]) : deriveFeeType_(iPath >= 0 ? r[iPath] : '');
    const cls = classifyFee_(String(r[iReg] || ''), fee); if (cls.kind === 'internal') o.fi += n(r[iK]); else if (cls.kind === 'external') o.fe += n(r[iK]); });
  const periods = Object.keys(m).sort();
  const name = p => MONTH_NAMES_[parseInt(p.slice(5, 7), 10) - 1] + ' ' + p.slice(0, 4);
  const out = periods.map((p, i) => { const o = m[p], prev = i ? m[periods[i - 1]].k : 0;
    return [name(p), o.k, o.b, o.bl, o.k ? o.b / o.k : 0, o.fi, o.fe, prev ? (o.k - prev) / prev : '']; });
  const t = periods.reduce((a, p) => { const o = m[p]; a.k += o.k; a.b += o.b; a.bl += o.bl; a.fi += o.fi; a.fe += o.fe; return a; }, { k: 0, b: 0, bl: 0, fi: 0, fe: 0 });
  out.push(['Total', t.k, t.b, t.bl, t.k ? t.b / t.k : 0, t.fi, t.fe, '']);
  return out;
}

/** Campaign rows sorted by KPI desc. */
function campaignTable_(H, rows, cfg) {
  const idx = n => H.indexOf(n);
  const iId = idx('Campaign ID'), iN = idx('Campaign Name'), iC = idx('Client Name'), iR = idx('Region'), iRep = idx('Sales Rep'), iIO = idx('IO Status');
  const iK = idx(moneyCol_(H, cfg.kpiCol)), iB = idx(moneyCol_(H, CFG.BILLED_COL));
  const n = v => typeof v === 'number' ? v : 0, s = v => (v === null || v === undefined) ? '' : String(v);
  const m = {};
  rows.forEach(r => { const k = s(r[iId]); const o = m[k] = m[k] || [k, s(r[iN]), s(r[iC]), s(r[iR]), s(r[iRep]), s(r[iIO]), 0, 0]; o[6] += n(r[iK]); o[7] += n(r[iB]); });
  return Object.values(m).sort((a, b) => b[6] - a[6]);
}

/* ===================== Digest ===================== */
/**
 * Talent Revenue Review — Changes digest email
 * ---------------------------------------------
 * sendChangesDigest()  — menu: send the digest for the current comparison now.
 * Also sent automatically after a successful nightly import (see nightlyImport).
 * Recipients: Settings → "Digest recipients". HTML with inline styles (works in Gmail/Outlook).
 */

const DIGEST = { INK: '#14161a', MUTED: '#6b6f76', NAVY: '#1e3a5f', GOLD: '#b8933f', RED: '#a13a2b', SOFT: '#f4f2ec', RULE: '#dcd8cf', TOP_N: 10, TOP_N_SUMMARY: 5, MAX_BYTES: 95000 };

function sendChangesDigest() {
  const cfg = getConfig();
  const to = cfg.digest && cfg.digest.length ? cfg.digest : null;
  if (!to) throw new Error('Add at least one address under ⚙ Settings → "Digest recipients" first.');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sd = scopedData_(ss);
  const split = computeRegionSplit_(sd.headers, sd.rows);
  const ch = computeChanges_(ss, '');                          // null on the first import — the report part still goes out
  let mode = cfg.digestMode, html = buildDigestHtml_(ch, cfg, ss, split, sd, mode);
  if (mode === 'full' && html.length > DIGEST.MAX_BYTES) { mode = 'summary'; html = buildDigestHtml_(ch, cfg, ss, split, sd, mode); }   // Gmail clips ~100 KB
  const runStr = ch && ch.newRun ? ch.newRun : Utilities.formatDate(new Date(), NIGHTLY.TZ, 'd MMM yyyy');
  const subject = `${profile_().title} — daily report ${runStr}${ch ? ` · changes vs ${ch.prevRun || 'previous'}` : ''}`;
  MailApp.sendEmail({ to: to.join(','), subject, htmlBody: html, body: digestPlainText_(ch, split), name: profile_().title });
  try { toast_(`Digest sent to ${to.length} recipient(s).`); } catch (e) {}
  return to.length;
}

/* ------------------------------------------------------------------ */

function buildDigestHtml_(ch, cfg, ss, split, sd, mode) {
  const full = mode === 'full';
  const topLines = full ? DIGEST.TOP_N : DIGEST.TOP_N_SUMMARY;
  const T = split.totals, cur = currencyOf_(sd.headers);
  const fmt = n => fmtMoney_(n, cfg.numberFormat);
  const fmtM = n => { const a = Math.abs(n); const s = n < 0 ? '−' : ''; if (a >= 1e6) return s + (a / 1e6).toFixed(2) + 'M'; if (a >= 1e3) return s + (a / 1e3).toFixed(1) + 'K'; return s + a.toFixed(0); };
  const pct = (a, b) => b ? (100 * a / b).toFixed(1) + '%' : '—';
  const spct = (a, b) => b ? ((100 * a / b >= 0 ? '+' : '') + (100 * a / b).toFixed(1) + '%') : '—';
  const signed = v => (v < 0 ? '−' : '+') + fmt(Math.abs(v));
  const col = v => v > 0 ? DIGEST.NAVY : v < 0 ? DIGEST.RED : DIGEST.MUTED;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const webUrl = webAppUrl_(), sheetUrl = ss.getUrl();
  const topN = o => Object.keys(o).sort((a, b) => o[b] - o[a]);

  const tile = (label, value, sub, color) => `
    <td width="33%" valign="top" style="padding:6px">
      <div style="border:1px solid ${DIGEST.RULE};border-top:3px solid ${color || DIGEST.RULE};background:#fff;padding:12px 14px">
        <div style="font:11px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${DIGEST.MUTED}">${esc(label)}</div>
        <div style="font:22px Georgia,serif;color:${DIGEST.INK};margin-top:4px">${value}</div>
        ${sub ? `<div style="font:12px Arial,sans-serif;color:${DIGEST.MUTED};margin-top:3px">${sub}</div>` : ''}
      </div></td>`;
  const th = (s, right) => `<th style="font:11px Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:${DIGEST.INK};background:${DIGEST.SOFT};padding:7px 9px;text-align:${right ? 'right' : 'left'};border-bottom:1px solid ${DIGEST.RULE}">${esc(s)}</th>`;
  const td = (s, right, color, bold) => `<td style="font:13px Arial,sans-serif;color:${color || DIGEST.INK};padding:7px 9px;text-align:${right ? 'right' : 'left'};border-bottom:1px solid #eeece6;${bold ? 'font-weight:bold' : ''}">${s}</td>`;
  const h2 = (t, sub) => `<h2 style="font:20px Georgia,serif;color:${DIGEST.INK};margin:26px 0 10px;padding-top:12px;border-top:2px solid ${DIGEST.INK}">${esc(t)}${sub ? ` <span style="font:12px Arial,sans-serif;color:${DIGEST.MUTED}">${esc(sub)}</span>` : ''}</h2>`;
  const h3 = (t, sub) => `<h3 style="font:16px Georgia,serif;color:${DIGEST.INK};margin:18px 0 8px">${esc(t)}${sub ? ` <span style="font:12px Arial,sans-serif;color:${DIGEST.MUTED}">${sub}</span>` : ''}</h3>`;
  const tbl = (heads, rows, rightFrom, totalRow) => `<table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:#fff;border:1px solid ${DIGEST.RULE}">
      <tr>${heads.map((h, i) => th(h, i >= rightFrom)).join('')}</tr>
      ${rows.map((r, ri) => `<tr>${r.map((v, i) => td(v, i >= rightFrom, null, totalRow && ri === rows.length - 1)).join('')}</tr>`).join('')}</table>`;

  // ---- Executive summary
  const P = split.periods, best = P.length ? P.reduce((a, b) => (T.byPeriod[b] || 0) > (T.byPeriod[a] || 0) ? b : a) : '';
  const lastP = P[P.length - 1], prevP = P[P.length - 2];
  const bullets = [];
  bullets.push(`<b>${fmt(T.kpi)} ${esc(cur)}</b> ${esc(cfg.kpiCol.toLowerCase())} across ${split.regions.length} markets; <b>${fmt(T.billed)}</b> billed (${pct(T.billed, T.kpi)}).`);
  if (split.regions[0]) bullets.push(`<b>${esc(split.regions[0].name)}</b> is the largest market at ${fmt(split.regions[0].kpi)} (${pct(split.regions[0].kpi, T.kpi)})${split.regions[1] ? `, then ${esc(split.regions[1].name)} (${pct(split.regions[1].kpi, T.kpi)})` : ''}.`);
  bullets.push(`Talent fee internal <b>${fmt(T.feeInternal)}</b> blended / ${fmt(T.feeInternalBilled)} billed; external <b>${fmt(T.feeExternal)}</b> blended / ${fmt(T.feeExternalBilled)} billed${T.feeUs ? `; US talent fees <b>${fmt(T.feeUs)}</b> blended / ${fmt(T.feeUsBilled)} billed` : ''}.`);
  const nk = topN(T.byNiche); if (nk[0]) bullets.push(`Top niche <b>${esc(nk[0])}</b> at ${fmt(T.byNiche[nk[0]])} (${pct(T.byNiche[nk[0]], T.kpi)}).`);
  if (best) bullets.push(`Strongest month <b>${esc(split.monthName(best))}</b> at ${fmt(T.byPeriod[best])}.`);
  if (prevP && T.byPeriod[prevP]) { const c = 100 * (T.byPeriod[lastP] - T.byPeriod[prevP]) / T.byPeriod[prevP]; bullets.push(`${esc(split.monthName(lastP))} at ${fmt(T.byPeriod[lastP])}, <b style="color:${col(c)}">${c >= 0 ? '+' : ''}${c.toFixed(1)}%</b> vs ${esc(split.monthName(prevP))}.`); }
  const ck = topN(T.byClient); if (ck[0]) bullets.push(`Largest client <b>${esc(ck[0])}</b> at ${fmt(T.byClient[ck[0]])} (${pct(T.byClient[ck[0]], T.kpi)}).`);
  if (ch) { const dk = ch.tot.newKpi - ch.tot.prevKpi; bullets.push(`Since the previous report: <b style="color:${col(dk)}">${signed(dk)}</b> blended (${spct(dk, ch.tot.prevKpi)}), ${ch.added.length} lines added, ${ch.removed.length} removed, ${ch.changed.length} values changed.`); }

  // ---- Report tables
  const mkt = split.regions.map(r => [esc(r.name), fmt(r.kpi), fmt(r.billed), pct(r.billed, r.kpi), isUsMarket_(r.name) ? `US ${fmt(r.feeUs)}` : fmt(r.feeInternal), isUsMarket_(r.name) ? '—' : fmt(r.feeExternal), pct(r.kpi, T.kpi), String(r.campaigns)]);
  mkt.push(['Total', fmt(T.kpi), fmt(T.billed), pct(T.billed, T.kpi), fmt(T.feeInternal), fmt(T.feeExternal), '100%', String(T.campaigns)]);
  const monthly = monthlyTable_(sd.headers, sd.rows, cfg).map((r, i, arr) => [esc(r[0]), fmt(r[1]), fmt(r[2]), r[1] ? pct(r[2], r[1]) : '—', fmt(r[5]), fmt(r[6]), r[7] === '' ? '—' : spct(r[7], 1)]);
  const fees = topN(T.byFee).map(k => [esc(k), fmt(T.byFee[k]), fmt(T.byFeeBilled[k] || 0), pct(T.byFeeBilled[k] || 0, T.byFee[k]), pct(T.byFee[k], T.kpi)]);
  fees.push(['Total', fmt(T.kpi), fmt(T.billed), pct(T.billed, T.kpi), '100%']);
  const niches = nk.slice(0, 8).map(k => [esc(k), fmt(T.byNiche[k]), fmt(T.nicheBilled[k] || 0), pct(T.byNiche[k], T.kpi), String(T.nicheCampaigns[k] || 0)]);
  const clients = ck.slice(0, 8).map(k => [esc(k), fmt(T.byClient[k]), pct(T.byClient[k], T.kpi)]);

  // ---- Changes block (optional)
  let changesHtml = '';
  if (ch) {
    const t = ch.tot, dk = t.newKpi - t.prevKpi, db = t.newBill - t.prevBill;
    const rowHtml = (label, o, bold) => { const d = o.newKpi - o.prevKpi, b = o.newBill - o.prevBill; return `<tr>${td(esc(label), false, null, bold)}${td(fmt(o.prevKpi), true)}${td(fmt(o.newKpi), true, null, bold)}${td(signed(d), true, col(d), bold)}${td(spct(d, o.prevKpi), true, col(d))}${td(fmt(o.newBill), true)}${td(signed(b), true, col(b))}</tr>`; };
    const sumRows = keys => keys.reduce((a, k) => { const o = t.byRegion[k] || t.byMonth[k]; ['prevKpi', 'newKpi', 'prevBill', 'newBill'].forEach(f => a[f] += o[f]); return a; }, { prevKpi: 0, newKpi: 0, prevBill: 0, newBill: 0 });
    const regions = Object.keys(t.byRegion).sort((a, b) => Math.abs(t.byRegion[b].newKpi - t.byRegion[b].prevKpi) - Math.abs(t.byRegion[a].newKpi - t.byRegion[a].prevKpi));
    const months = Object.keys(t.byMonth).filter(m => (t.byMonth[m].newKpi - t.byMonth[m].prevKpi) !== 0).sort();
    const ctable = (first, keys, src, labelFn) => `<table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:#fff;border:1px solid ${DIGEST.RULE}">
        <tr>${th(first)}${th('Blended — prev', true)}${th('Blended — now', true)}${th('Δ', true)}${th('Δ %', true)}${th('Billed — now', true)}${th('Δ billed', true)}</tr>
        ${keys.map(k => rowHtml(labelFn(k), src[k])).join('')}${rowHtml('Total', sumRows(keys), true)}</table>`;
    const lines = (title, cols, rows, moneyFrom) => rows.length ? `${h3(title, rows.length > topLines ? `top ${topLines} of ${rows.length} — full list in the dashboard` : String(rows.length))}
      <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:#fff;border:1px solid ${DIGEST.RULE}">
        <tr>${cols.map((c, i) => th(c, i >= moneyFrom)).join('')}</tr>
        ${rows.slice(0, topLines).map(r => `<tr>${r.map((v, i) => td(typeof v === 'number' ? (cols[i] === 'Δ' ? signed(v) : fmt(v)) : esc(v), i >= moneyFrom, cols[i] === 'Δ' && typeof v === 'number' ? col(v) : null)).join('')}</tr>`).join('')}</table>` : '';
    const pick = (r, idx) => idx.map(i => r[i]);
    const addIdx = [0, 1, 2, 3, 8, 9, 10], chgIdx = [0, 1, 8, 10, 11, 12, 13];
    const addCols = ['Market', 'Month', 'Fee type', 'IO status', 'Campaign', 'Client', `Blended (${cur})`], chgCols = ['Market', 'Month', 'Campaign', 'Field', 'Previous', 'Current', 'Δ'];
    const chgRows = ch.changed.slice().sort((a, b) => Math.abs(typeof b[13] === 'number' ? b[13] : 0) - Math.abs(typeof a[13] === 'number' ? a[13] : 0));
    changesHtml = `${h2('Changes since the previous report', `${ch.prevRun || '—'} → ${ch.newRun || '—'}`)}
      <table cellpadding="0" cellspacing="0" width="100%"><tr>
        ${tile('Blended revenue', `${fmtM(t.prevKpi)} → ${fmtM(t.newKpi)}`, `<b style="color:${col(dk)}">${signed(dk)}</b> · ${spct(dk, t.prevKpi)}`, DIGEST.NAVY)}
        ${tile('Billed (complete)', `${fmtM(t.prevBill)} → ${fmtM(t.newBill)}`, `<b style="color:${col(db)}">${signed(db)}</b> · ${spct(db, t.prevBill)}`, DIGEST.GOLD)}
        ${tile('Lines', `${t.prevLines} → ${t.newLines}`, `<b>${ch.added.length}</b> added · <b>${ch.removed.length}</b> removed · <b>${ch.changed.length}</b> changed values`)}
      </tr></table>
      ${h3('Change by market')}${ctable('Market', regions, t.byRegion, k => k)}
      ${full && months.length ? h3('Change by month', 'months that moved') + ctable('Month', months, t.byMonth, monthLabel_) : ''}
      ${lines('Added lines', addCols, ch.added.map(r => pick(r, addIdx)), 6)}
      ${lines('Removed lines', addCols, ch.removed.map(r => pick(r, addIdx)), 6)}
      ${lines('Changed values', chgCols, chgRows.map(r => pick(r, chgIdx)), 4)}`;
  } else {
    changesHtml = `${h2('Changes since the previous report')}<div style="font:13px Arial,sans-serif;color:${DIGEST.MUTED}">First import — the comparison starts with the next report.</div>`;
  }

  const runDate = ch && ch.newRun ? ch.newRun : Utilities.formatDate(new Date(), NIGHTLY.TZ, 'd MMM yyyy');
  return `
  <div style="background:${DIGEST.SOFT};padding:24px 0">
  <table cellpadding="0" cellspacing="0" width="760" align="center" style="max-width:760px;width:100%">
    <tr><td style="background:#0b0c0e;padding:18px 24px">
      <div style="font:20px Georgia,serif;letter-spacing:.22em;text-transform:uppercase;color:#fff">${cfg.brandName || (isPrint_() ? "" : "Condé Nast")}</div>
      <div style="font:24px Georgia,serif;color:#fff;margin-top:6px">${profile_().title} — daily report</div>
      <div style="font:12px Arial,sans-serif;color:#b9bcc2;margin-top:6px">Report run <b style="color:#fff">${esc(runDate)}</b> · ${esc(yearLabel_())} · ${sd.rows.length} line items · all amounts in ${esc(cur)}</div>
    </td></tr>
    <tr><td style="padding:16px 24px 0">
      <div style="background:#fff;border:1px solid ${DIGEST.RULE};border-top:3px solid ${DIGEST.GOLD};padding:14px 18px">
        <div style="font:16px Georgia,serif;color:${DIGEST.INK};margin-bottom:6px">Executive summary</div>
        <ul style="margin:0;padding-left:18px;font:13px/1.5 Arial,sans-serif;color:${DIGEST.INK}">${bullets.map(b => `<li style="margin-bottom:4px">${b}</li>`).join('')}</ul>
      </div>
    </td></tr>
    <tr><td style="padding:10px 18px 0">
      <table cellpadding="0" cellspacing="0" width="100%"><tr>
        ${tile(cfg.kpiCol, fmt(T.kpi), `${esc(cur)} · ${split.regions.length} markets`, DIGEST.NAVY)}
        ${tile('Billed (status complete)', fmt(T.billed), `${pct(T.billed, T.kpi)} of blended`, DIGEST.GOLD)}
        ${tile('Adjusted billable', fmt(T.billable), '')}
      </tr><tr>
        ${tile('Talent fee internal', fmt(T.feeInternal), `billed <b style="color:${DIGEST.GOLD}">${fmt(T.feeInternalBilled)}</b> · ${pct(T.feeInternal, T.kpi)} share`)}
        ${tile('Talent fee external', fmt(T.feeExternal), `billed <b style="color:${DIGEST.GOLD}">${fmt(T.feeExternalBilled)}</b> · ${pct(T.feeExternal, T.kpi)} share`)}
        ${T.feeUs ? tile('US talent fees', fmt(T.feeUs), `billed <b style="color:${DIGEST.GOLD}">${fmt(T.feeUsBilled)}</b> · ${Object.keys(T.byUsFee).sort((a, b) => T.byUsFee[b] - T.byUsFee[a]).map(k => `${esc(k)} ${fmtM(T.byUsFee[k])}`).join(' · ')}`) : tile('Campaigns · clients', `${T.campaigns} · ${T.clients}`, `${sd.rows.length} line items`)}
      </tr></table>
    </td></tr>
    <tr><td style="padding:10px 24px 0">
      <table cellpadding="0" cellspacing="0"><tr>
        ${webUrl ? `<td style="padding-right:10px"><a href="${webUrl}" style="display:inline-block;background:#0b0c0e;color:#fff;font:14px Arial,sans-serif;padding:10px 16px;text-decoration:none;border-radius:4px">Open the dashboard</a></td>` : ''}
        <td><a href="${sheetUrl}" style="display:inline-block;background:#fff;color:${DIGEST.INK};font:14px Arial,sans-serif;padding:9px 16px;text-decoration:none;border:1px solid ${DIGEST.RULE};border-radius:4px">Open the sheet</a></td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:6px 24px 0">
      ${h2('Markets')}${tbl(['Market', cfg.kpiCol, 'Billed', 'Billed ÷ blended', 'Fee internal', 'Fee external', 'Share', 'Campaigns'], mkt, 1, true)}
      ${full ? h2('By month') + tbl(['Month', cfg.kpiCol, 'Billed', 'Billed ÷ blended', 'Fee internal', 'Fee external', 'vs prior month'], monthly, 1, true) : ''}
      ${full ? h2('Fee types', 'last segment of Position Path') + tbl(['Fee type', cfg.kpiCol, 'Billed', 'Billed ÷ blended', 'Share'], fees, 1, true) : ''}
      ${full ? h2('Niches', 'SSG Category · US: Campaign Name prefix — top 8') + tbl(['Niche', cfg.kpiCol, 'Billed', 'Share', 'Campaigns'], niches, 1, false) : ''}
      ${full ? h2('Top clients') + tbl(['Client', cfg.kpiCol, 'Share'], clients, 1, false) : ''}
      ${changesHtml}
      ${full ? '' : `<div style="font:12px Arial,sans-serif;color:${DIGEST.MUTED};margin-top:14px">Months, fee types, niches, clients and the full change lists are in the dashboard.</div>`}
    </td></tr>
    <tr><td style="padding:22px 24px 24px;font:11px Arial,sans-serif;color:${DIGEST.MUTED}">
      Confidential — internal use only. Generated automatically from the AdBook+ export; billed = Adjusted Billable Revenue of lines with Billing Status ${esc(cfg.billedStatuses.join(' / '))}; figures in ${esc(cur)} at the rates in the FX Rates tab. Reply to this email to reach the report owner.
    </td></tr>
  </table></div>`;
}

function digestPlainText_(ch, split) {
  const T = split.totals;
  let s = `${profile_().title} — daily report\nBlended: ${Math.round(T.kpi)} · Billed: ${Math.round(T.billed)} · Fee internal: ${Math.round(T.feeInternal)} · Fee external: ${Math.round(T.feeExternal)}\n`;
  if (ch) { const t = ch.tot; s += `Changes vs ${ch.prevRun || 'previous'}: blended ${Math.round(t.newKpi - t.prevKpi)}, added ${ch.added.length}, removed ${ch.removed.length}, changed ${ch.changed.length}\n`; }
  return s + `Dashboard: ${webAppUrl_()}`;
}

/* ===================== Access ===================== */
/**
 * Talent Revenue Review — Access log & usage report
 * --------------------------------------------------
 * logAccess_()   called by doGet (page open) and exportExcel (download): appends to the hidden "Access Log" tab.
 * buildUsageReport()  menu: writes the "Usage" tab — by person and by day.
 */

const ACCESS = { SHEET: 'Access Log', USAGE: 'Usage' };

function logAccess_(email, action, detail) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(ACCESS.SHEET);
    if (!sh) {
      sh = ss.insertSheet(ACCESS.SHEET);
      sh.getRange(1, 1, 1, 4).setValues([['When', 'Who', 'Action', 'Detail']]).setFontWeight('bold');
      sh.setFrozenRows(1); sh.hideSheet();
    }
    const lock = LockService.getScriptLock();
    if (lock.tryLock(3000)) { try { sh.appendRow([new Date(), email || '(unknown)', action, detail || '']); } finally { lock.releaseLock(); } }
  } catch (e) { Logger.log('access log: ' + e.message); }
}

/** Counts for the web-app header (no names). */
function trafficSummary_() {
  try {
    const log = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ACCESS.SHEET);
    if (!log || log.getLastRow() < 2) return { people: 0, opens: 0, people7: 0, opens7: 0, downloads: 0 };
    const rows = log.getRange(2, 1, log.getLastRow() - 1, 3).getValues();
    const cutoff = Date.now() - 7 * 86400000;
    const all = new Set(), last7 = new Set(); let opens = 0, opens7 = 0, downloads = 0;
    rows.forEach(r => { if (!(r[0] instanceof Date)) return; const u = String(r[1]).toLowerCase(); const isOpen = r[2] !== 'download';
      if (isOpen) { opens++; all.add(u); if (r[0].getTime() >= cutoff) { opens7++; last7.add(u); } } else downloads++; });
    return { people: all.size, opens, people7: last7.size, opens7, downloads };
  } catch (e) { return null; }
}

/** Menu: summarise the access log into the "Usage" tab. */
function buildUsageReport() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const log = ss.getSheetByName(ACCESS.SHEET);
  let sh = ss.getSheetByName(ACCESS.USAGE);
  if (!sh) sh = ss.insertSheet(ACCESS.USAGE);
  resetSheet_(sh);
  sh.getRange(1, 1).setValue('Web app usage').setFontSize(18).setFontWeight('bold');
  if (!log || log.getLastRow() < 2) { sh.getRange(2, 1).setValue('No visits recorded yet. Logging starts with this version — every page open and Excel download is recorded from now on.').setFontColor('#5f6b63'); toast_('No visits recorded yet.'); return; }
  const rows = log.getRange(2, 1, log.getLastRow() - 1, 4).getValues().filter(r => r[0] instanceof Date);
  const tz = NIGHTLY.TZ;
  const day = d => Utilities.formatDate(d, tz, 'yyyy-MM-dd');
  const fmt = d => Utilities.formatDate(d, tz, 'd MMM yyyy HH:mm');

  // by person
  const P = {};
  rows.forEach(r => { const u = String(r[1]).toLowerCase(); const o = P[u] = P[u] || { visits: 0, downloads: 0, first: r[0], last: r[0], days: new Set() };
    if (r[2] === 'download') o.downloads++; else o.visits++;
    if (r[0] < o.first) o.first = r[0]; if (r[0] > o.last) o.last = r[0]; o.days.add(day(r[0])); });
  const byPerson = Object.keys(P).sort((a, b) => P[b].visits - P[a].visits).map(u => [u, P[u].visits, P[u].downloads, P[u].days.size, fmt(P[u].first), fmt(P[u].last)]);
  // by day
  const D = {};
  rows.forEach(r => { const k = day(r[0]); const o = D[k] = D[k] || { visits: 0, downloads: 0, users: new Set() }; if (r[2] === 'download') o.downloads++; else o.visits++; o.users.add(String(r[1]).toLowerCase()); });
  const byDay = Object.keys(D).sort().reverse().map(k => [k, D[k].visits, D[k].downloads, D[k].users.size, Array.from(D[k].users).sort().join(', ')]);

  const first = rows.reduce((a, r) => r[0] < a ? r[0] : a, rows[0][0]);
  sh.getRange(2, 1).setValue(`${rows.length} events since ${fmt(first)} · ${Object.keys(P).length} distinct people · times in ${tz}`).setFontColor('#5f6b63');
  let row = 4;
  row = writeBlock_(sh, row, 'By person', ['Person', 'Page opens', 'Excel downloads', 'Active days', 'First seen', 'Last seen'], byPerson, { int: [2, 3, 4] });
  row = writeBlock_(sh, row, 'By day', ['Day', 'Page opens', 'Excel downloads', 'Unique people', 'Who'], byDay, { int: [2, 3, 4] });
  sh.setColumnWidth(1, 260); sh.setColumnWidths(2, 4, 130); sh.setColumnWidth(5, 160); sh.setColumnWidth(6, 160);
  ss.setActiveSheet(sh);
  toast_(`Usage report: ${Object.keys(P).length} people, ${rows.length} events.`);
}

/* ===================== Print ===================== */
/**
 * Print Yield Review — profile-specific logic
 * --------------------------------------------
 * Derivations at import (Book, Page Cat, Page Cat Group, Pages, Insert, Gross Earned …),
 * the bucket aggregation shared by the web app, the Sheets tabs and the Excel export,
 * the hierarchical Yield table, the Focus list and the page-share tables, and the Method text.
 *
 * Yield is always a ratio of two sums, so every bucket carries the numerator and all three
 * denominators; the viewer picks the basis and the ratio is computed where it is displayed.
 *   k   Adjusted Earned Blended Revenue (headline, "earned")
 *   g   Gross Earned Blended Revenue (derived — see Method)
 *   rce Rate Card Earned        = Current Rate Card Price × earned fraction
 *   arce Adjusted Rate Card Earned = (Drop) Adjusted Rate Card × earned fraction
 *   rc / arc raw rate-card sums (as the AdBook pivot shows them), pg pages, n drops, ins inserts,
 *   b billed revenue, hs house-ad lines, neg drops priced below the adjusted rate card
 */

const PRINT = {
  BASES: { gross: 'Gross (tier price, before discounts & commission)', ratecard: 'Rate card (list price)' },
  BASIS_SHORT: { gross: 'vs Gross', ratecard: 'vs Rate Card', adjratecard: 'vs Adjusted Rate Card' },
  FOCUS_MIN_PAGES: 4,       // a cell needs at least this many pages to be a focus candidate
  FOCUS_TOP: 8,
  YIELD_LEAF_CAP: 3000,     // leaf rows sent to the browser for the hierarchical yield table
  REVIEW_ROW_CAP: 3000,     // detail rows of the Review pivot sent to the browser (full pivot in Excel / the Review tab)
  NO_RATE_CARD: '(no rate card)',   // Discount Band of drops whose rate card text carries no price — in earned and pages, not in yield
};

/* ------------------------------------------------------------------ */
/* Import-time derivations                                             */
/* ------------------------------------------------------------------ */

/** Normalises an ad size for the factor table: "Double Page Spread - 2nd" → "double page spread". */
function adSizeKey_(adSize) { return String(adSize || '').trim().toLowerCase().replace(/\s*-\s*\d+(st|nd|rd|th)$/, '').replace(/\s+/g, ' '); }

/**
 * Page factor for an ad size. Gatefolds take Actual Space when it is 2, 4 or 6 panels.
 * Returns { pages, note } — note is '' or a reason the import log should carry.
 */
function pageFactor_(adSize, actualSpace, cfg) {
  const key = adSizeKey_(adSize);
  if (!key) return { pages: 0, note: 'no ad size' };
  if (cfg.insertSizes.includes(key)) return { pages: 0, note: '' };
  const f = cfg.pageFactors[key];
  const sp = typeof actualSpace === 'number' ? actualSpace : NaN;
  if (/gatefold/.test(key)) { if ([2, 4, 6].includes(sp)) return { pages: sp, note: '' }; return { pages: f === undefined ? 4 : f, note: '' }; }
  if (f !== undefined) return { pages: f, note: f === 0 ? 'zero-page size' : '' };
  if (!isNaN(sp) && sp > 0 && sp <= 8) return { pages: sp, note: 'unknown ad size — Actual Space used' };
  return { pages: 0, note: 'unknown ad size' };
}

/** Page Cat Group for a line: Insert / House Ad first, then the configured pattern table, else Unclassified. */
function classifyPageCat_(pageCat, book, adSize, cfg) {
  const key = adSizeKey_(adSize);
  if (/insert/i.test(book || '') || cfg.insertSizes.includes(key)) return CFG.GROUP_INSERT;
  const pc = String(pageCat || '').trim();
  for (const g of cfg.pageCatGroups) if (g.re.test(pc)) return g.group;
  if (!pc || pc.toLowerCase() === CFG.PAGECAT_DEFAULT.toLowerCase()) return CFG.GROUP_STANDARD;
  if (cfg.termPattern && cfg.termPattern.test(pc)) return CFG.GROUP_STANDARD;
  return CFG.PAGECAT_UNCLASSIFIED;
}

/**
 * All print-derived values for one export row, in the order of PROFILES.print.derived after 'Billed Revenue':
 * Book, Page Cat, Page Cat Group, Commercial Term, Qualifier, Pages, Insert, Insert Weight (g), Insert Pages,
 * Earned Fraction, Gross Earned Blended Revenue, Rate Card Earned, Adjusted Rate Card Earned, Space Check, Issue Label
 * @param {Object} x { path4, path5, path6, adSize, printPage, actualSpace, adjBlended, adjEarned, commission, disc1, disc2, discContract, rateCard, adjRateCard, issue, issueNo, issueYear, coverDate }
 */
/** Discount-depth band label for a negotiated discount share (0..1), from the configured upper limits. */
function discountBand_(depth, bands) {
  const pct = Math.max(0, Math.round(depth * 1000) / 10);
  let lo = 0;
  for (const up of bands) { if (pct < up) return `${lo}–${up}%`; lo = up; }
  return `${lo}%+`;
}

function derivePrintFields_(x, cfg, canonBook, canonCat) {
  const s = v => (v === null || v === undefined) ? '' : String(v).trim();
  const n = v => (typeof v === 'number' && !isNaN(v)) ? v : 0;
  const book = canonBook(s(x.path4)) || '(none)';
  const pageCat = canonCat(s(x.path5)) || CFG.PAGECAT_DEFAULT;
  const term = cfg.termPattern && cfg.termPattern.test(pageCat) ? pageCat : '';
  const group = classifyPageCat_(pageCat, book, x.adSize, cfg);
  const qual = s(x.path6);
  const isInsert = group === CFG.GROUP_INSERT;
  const pf = pageFactor_(x.adSize, x.actualSpace, cfg);
  let pages = isInsert ? 0 : pf.pages;
  if (cfg.regionalProrata && !isInsert) { const m = pageCat.match(/(\d+)\s*percent/i); if (m) pages = pages * (+m[1]) / 100; }
  const wm = qual.match(/(\d+(?:[.,]\d+)?)\s*g$/i), pm = qual.match(/(\d+)\s*-?\s*pages?/i);
  const insW = isInsert && wm ? Number(wm[1].replace(',', '.')) : '';
  const insP = isInsert ? (pm ? +pm[1] : (/postcard/i.test(qual) ? 1 : '')) : '';
  // earned fraction: share of the drop that has run (print: normally 0 or 1 per issue)
  const adjB = n(x.adjBlended), adjE = n(x.adjEarned);
  let frac = adjB ? adjE / adjB : (adjE ? 1 : 0);
  if (!isFinite(frac)) frac = 0; frac = Math.max(0, Math.min(frac, 1.5));
  // Gross: from AdBook's "(Drop) Rate Card Pricing" waterfall (agreed definition) — gross = tier price = AdjustedRateCard + contract + client + commission,
  // pricing-policy tiers (Settings, default 0 and 5) sit between the rate card price and gross. Falls back to the discount columns when the text carries no rate card.
  const rc = parseRateCardPricing_(x.rcPricing);
  let grossFull = 0, rcPrice = n(x.rateCard), arcFull = n(x.adjRateCard), contrAmt = 0, cliAmt = 0, commAmt = 0, source = 'none';
  if (rc) {
    const cls = rc.items.map(it => rcClass_(it, cfg));
    const sum = c => rc.items.reduce((a, it, i) => a + (cls[i] === c ? it.amt : 0), 0);     // discounts are negative amounts
    const pol = sum('policy'), co = sum('contr'), cl = sum('cli'), cm = sum('comm');
    const arcTxt = rc.arc !== null ? rc.arc : (rc.price !== null ? rc.price + pol + co + cl + cm : null);
    if (rc.price !== null && rc.arc !== null && Math.abs(rc.price + pol + co + cl + cm - rc.arc) > 0.05) RC_MISMATCH_++;
    arcFull = arcTxt;
    rcPrice = rc.price !== null ? rc.price : (rc.custom !== null ? rc.custom : arcTxt - pol - co - cl - cm);
    contrAmt = -co; cliAmt = -cl; commAmt = cfg.grossIncludesCommission ? -cm : 0;
    grossFull = arcTxt + contrAmt + cliAmt + commAmt;
    source = 'rate card text';
  } else {
    const disc = Math.abs(n(x.disc1)) + Math.abs(n(x.disc2)) + Math.abs(n(x.discContract));
    let c = cfg.grossIncludesCommission ? n(x.commission) : 0;
    if (disc || c) {
      grossFull = adjB + disc;
      if (cfg.commissionMode === 'percent') { const p = Math.abs(c) > 1 ? Math.abs(c) / 100 : Math.abs(c); if (p > 0 && p < 1) grossFull = grossFull / (1 - p); c = grossFull - adjB - disc; }
      else grossFull += Math.abs(c);
      contrAmt = Math.abs(n(x.discContract)); cliAmt = Math.abs(n(x.disc1)) + Math.abs(n(x.disc2)); commAmt = Math.abs(c);
      source = 'discount columns';
    } else if (n(x.initialRateCard) > 0 || n(x.rateCard) > 0) {
      // markets whose positions carry no rate card in AdBook (text N/A, columns empty) but do have a list price:
      // gross = the list price (Initial Rate Card Price, else Current); the whole gap to the actual price shows as off-card change
      grossFull = n(x.initialRateCard) > 0 ? n(x.initialRateCard) : n(x.rateCard);
      rcPrice = grossFull; arcFull = grossFull;
      source = 'rate card column';
    }
  }
  const priced = source !== 'none' && grossFull > 0;
  const gross = priced ? frac * grossFull : 0;
  const rce = priced ? frac * (rcPrice || grossFull) : 0, arce = priced ? frac * arcFull : 0;
  const pricedEarned = priced ? adjE : 0;
  // bridge amounts on the earned basis: rate card → policy tiers → gross → contract → client → commission → structured net → off-card change → net earned
  const contrE = frac * contrAmt, clientE = frac * cliAmt, commE = frac * commAmt;
  const tierE = priced ? rce - gross : 0;
  const depth = priced ? Math.max(0, Math.min(1, 1 - adjB / grossFull)) : 0;   // negotiated discount depth of the drop (gross → net)
  const band = priced ? discountBand_(depth, cfg.discountBands) : PRINT.NO_RATE_CARD;
  const channel = x.agency ? 'Agency' : 'Direct';
  // Actual Space validation
  const sp = x.actualSpace;
  let check = '';
  if (isInsert) check = (typeof sp === 'number' && sp > 8) ? `insert qty ${sp}` : '';
  else if (sp === '' || sp === null || sp === undefined) check = 'blank';
  else if (typeof sp !== 'number') check = `text "${sp}"`;
  else if (Math.abs(sp - pages) > 0.01) check = `mismatch (${sp} vs ${pages})`;
  if (pf.note && !isInsert) check = check ? `${check}; ${pf.note}` : pf.note;
  // Issue label: "<Issue> (No. 7 / 2026)" or cover month
  let issue = s(x.issue);
  if (!issue) { const d = x.coverDate instanceof Date ? x.coverDate : null; if (d) issue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')} cover`; }
  const no = s(x.issueNo), yr = s(x.issueYear);
  if (no) issue = `${issue ? issue + ' · ' : ''}No. ${no}${yr ? ' / ' + yr : ''}`;
  return [book, pageCat, group, term, qual, pages, isInsert ? 'Yes' : 'No', insW, insP, frac, gross, rce, arce, check, issue || '(no issue)', commE, contrE, clientE, tierE, band, channel, pricedEarned, source, brandFamily_(x.parentSite, x.brand, cfg)];
}

/**
 * Brand family — the title across markets (Vogue, GQ, AD …), for the brand-vs-its-own-family benchmark.
 * Source: "(Drop) Parent Site" in AdBook's convention "XX - Brand" (ME - Vogue, DE - Vogue, UK - GQ): the text after the market prefix.
 * Fallbacks: a Parent Site without the prefix is used as is; a blank Parent Site falls back to the Brand (Path 3) with the market word removed.
 * Settings "Brand family overrides" (Family = regex) win over everything, matched on the Parent Site and the Brand.
 */
function brandFamily_(parentSite, brand, cfg) {
  const ps = String(parentSite === null || parentSite === undefined ? '' : parentSite).trim(), br = String(brand === null || brand === undefined ? '' : brand).trim();
  for (const o of (cfg.brandFamilies || [])) { if (o.re.test(ps) || o.re.test(br)) return o.group; }
  if (ps) { const m = ps.match(/^[A-Za-z]{2,3}\s*-\s*(.+)$/); return (m ? m[1] : ps).trim() || '(blank)'; }
  if (!br) return '(blank)';
  const stripped = br.replace(/\b(Germany|Deutschland|Britain|British|UK|España|Espana|Spain|Italia|Italy|France|ME|Middle East|Arabia|India|Japan|China|Taiwan|Mexico|México|Brasil|Brazil|US|USA|Australia|Korea|Portugal|Polska|Poland|Türkiye|Turkey|Nederland|Netherlands|Greece|Thailand|Singapore|Hong Kong|Russia)\b/gi, '').replace(/\s{2,}/g, ' ').trim();
  return stripped || br;
}

/* ------------------------------------------------------------------ */
/* Rate card text                                                      */
/* ------------------------------------------------------------------ */

let RC_UNKNOWN_ = {}, RC_MISMATCH_ = 0;   // import diagnostics for the Import Log

/** Number inside the rate card text: "106,760.67", "106.760,67", "- 283.6769", "N/A" → null. */
function rcNum_(t) {
  t = String(t === null || t === undefined ? '' : t).trim();
  if (!t || /^n\/?a$/i.test(t)) return null;
  const neg = /^-/.test(t);
  t = t.replace(/[^\d.,]/g, '');
  const lc = t.lastIndexOf(','), ld = t.lastIndexOf('.');
  t = lc > ld ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
  const v = parseFloat(t);
  return isNaN(v) ? null : (neg ? -v : v);
}

/**
 * Parses AdBook's "(Drop) Rate Card Pricing" text:
 *   [Rate Card Name: X] [Rate Card Price: 124,500.00] {Tier 2 [Discount - Contract: - 90,262.50]} {Tier 99 [Agy Commission (DE): - 5,135.63]} [AdjustedRateCard: 29,101.88] …
 * Returns null when the drop carries no rate card (price and AdjustedRateCard both N/A or absent).
 * Labels differ by market (Discount - Contract / Remise exceptionnelle / …); the tier number is AdBook's structure and is what the classification uses.
 */
function parseRateCardPricing_(str) {
  const s = String(str === null || str === undefined ? '' : str);
  if (!s) return null;
  const grab = re => { const m = s.match(re); return m ? rcNum_(m[1]) : null; };
  const price = grab(/\[Rate Card Price:\s*([^\]]*)\]/i), arc = grab(/\[AdjustedRateCard:\s*([^\]]*)\]/i), custom = grab(/\[Custom Rate Card:\s*([^\]]*)\]/i);
  if (price === null && arc === null) return null;
  const items = [];
  const reTier = /\{\s*Tier\s*(\d+)\s*((?:\[[^\]]*\]\s*)+)\}/g; let g;
  while ((g = reTier.exec(s))) {
    const tier = parseInt(g[1], 10); const reItem = /\[([^\]:]+):\s*([+-]?)\s*([\d.,]+)\s*\]/g; let h;
    while ((h = reItem.exec(g[2]))) { const v = rcNum_(h[3]); if (v !== null) items.push({ tier, label: h[1].trim(), amt: h[2] === '-' ? -v : v }); }
  }
  return { price, arc, custom, items, name: (s.match(/\[Rate Card Name:\s*([^\]]*)\]/) || [0, ''])[1].trim() };
}

/** policy (rate-card adjustment, between list price and gross) · contr · cli · comm — by AdBook tier, label keywords as a fallback. */
function rcClass_(it, cfg) {
  if (cfg.policyTiers.indexOf(it.tier) >= 0) return 'policy';
  const l = it.label.toLowerCase();
  if (it.tier === 99 || /commission|professionnelle|agency|agentur/.test(l)) return 'comm';
  if (it.tier === 2 || /contract|exceptionnelle|forfaitaire|vertrag/.test(l)) return 'contr';
  if (it.tier === 3 || it.tier === 4 || /client|mandat|gressif|volume|taux|kunde/.test(l)) return 'cli';
  const k = `Tier ${it.tier} ${it.label}`; RC_UNKNOWN_[k] = (RC_UNKNOWN_[k] || 0) + 1;
  return 'contr';
}

/* ------------------------------------------------------------------ */
/* Aggregation                                                         */
/* ------------------------------------------------------------------ */

function newBucket_() { return { k: 0, g: 0, rc: 0, rce: 0, arc: 0, arce: 0, pg: 0, n: 0, ins: 0, b: 0, hs: 0, neg: 0, comm: 0, contr: 0, cli: 0, tier: 0, kp: 0, pgp: 0 }; }
function addBucket_(B, v) { B.k += v.k; B.g += v.g; B.rc += v.rc; B.rce += v.rce; B.arc += v.arc; B.arce += v.arce; B.pg += v.pg; B.n += v.n; B.ins += v.ins; B.b += v.b; B.hs += v.hs; B.neg += v.neg; B.comm += v.comm || 0; B.contr += v.contr || 0; B.cli += v.cli || 0; B.tier += v.tier || 0; B.kp += v.kp || 0; B.pgp += v.pgp || 0; }
function bumpB_(o, key, v) { key = key || '(blank)'; addBucket_(o[key] || (o[key] = newBucket_()), v); }

/** Column indexes the print aggregation needs (headers may be in any currency). */
function printIdx_(headers) {
  const idx = n => headers.indexOf(n), mc = n => idx(moneyCol_(headers, n));
  return {
    k: mc('Adjusted Earned Blended Revenue'), g: mc('Gross Earned Blended Revenue'), rc: mc('Current Rate Card Price'), rce: mc('Rate Card Earned'), arc: mc('(Drop) Adjusted Rate Card'), arce: mc('Adjusted Rate Card Earned'),
    price: mc('Price'), billed: mc(CFG.BILLED_COL), billable: mc(CFG.BILLABLE_COL),
    pages: idx('Pages'), insert: idx('Insert'), group: idx('Page Cat Group'), pageCat: idx('Page Cat'), book: idx('Book'), term: idx('Commercial Term'), qual: idx('Qualifier'),
    region: idx('Region'), period: idx('Period'), brand: idx('Niche'), adSize: idx('Fee Type'), printPage: idx(CFG.PRINT_PAGE_COL), issue: idx('Issue Label'),
    client: idx('Client Name'), agency: idx('Agency Name'), rep: idx('Sales Rep'), io: idx('IO Status'), bs: idx('Billing Status'), campaign: idx('Campaign ID'), campaignName: idx('Campaign Name'),
    path2: idx('Path 2'), path4: idx('Path 4'), path: idx(CFG.REGION_SOURCE_COL), platform: idx('(Drop) WD Platform'), drop: idx('Drop ID'), check: idx('Space Check'), frac: idx('Earned Fraction'),
    runDate: idx('Report Run Date'), rcName: idx('Current Rate Card Name'), rcType: idx('Current Rate Card Price Type'), insW: idx('Insert Weight (g)'), insP: idx('Insert Pages'),
    comm: mc('Commission Earned'), contr: mc('Contract Discount Earned'), cli: mc('Client Discount Earned'), tier: mc('Tier Adjustment Earned'), band: idx('Discount Band'), channel: idx('Channel'),
    kp: mc('Priced Earned'), source: idx('Rate Card Source'), family: idx('Brand Family'),
  };
}

/** Bucket values for one row (× factor for currency display). */
function rowBucket_(row, I, factor) {
  const num = i => (i >= 0 && typeof row[i] === 'number') ? row[i] * factor : 0;
  const raw = i => (i >= 0 && typeof row[i] === 'number') ? row[i] : 0;
  const isIns = I.insert >= 0 && String(row[I.insert]) === 'Yes';
  const isHouse = I.group >= 0 && String(row[I.group]) === CFG.GROUP_HOUSE;
  const price = raw(I.price), arc = raw(I.arc);
  return { k: num(I.k), g: num(I.g), rc: num(I.rc), rce: num(I.rce), arc: num(I.arc), arce: num(I.arce), pg: raw(I.pages), n: 1, ins: isIns ? 1 : 0, b: num(I.billed), hs: isHouse ? 1 : 0,
           neg: (arc > 0 && price > 0 && price < arc - 0.5) ? 1 : 0, comm: num(I.comm), contr: num(I.contr), cli: num(I.cli), tier: num(I.tier), kp: num(I.kp), pgp: (I.source >= 0 && row[I.source] && String(row[I.source]) !== 'none') ? raw(I.pages) : 0 };   // pages of drops that carry a rate card
}

/** Rows without house ads (when the setting excludes them) — used so pivots tie to the KPI tiles. */
function excludeHouseAds_(headers, rows) {
  if (!isPrint_() || !getConfig().houseExclude) return rows;
  const i = headers.indexOf('Page Cat Group'); if (i < 0) return rows;
  return rows.filter(r => String(r[i]) !== CFG.GROUP_HOUSE);
}

/** Yield of a bucket for a basis. */
function yieldOf_(B, basis) { const d = basis === 'ratecard' ? B.rce : basis === 'adjratecard' ? B.arce : B.g; return d ? (B.kp !== undefined ? B.kp : B.k) / d : 0; }   // yield on priced drops only
function denomOf_(B, basis) { return basis === 'ratecard' ? B.rce : basis === 'adjratecard' ? B.arce : B.g; }

/**
 * Full print aggregation of a row set. House ads are excluded from everything except `houseAds` when the setting says so.
 * @return {Object} totals + keyed bucket maps + yield tree
 */
function aggregatePrint_(headers, rows, factor, opts) {
  opts = opts || {}; factor = factor || 1;
  const cfg = getConfig(), I = printIdx_(headers);
  const s = v => (v === null || v === undefined) ? '' : String(v);
  const A = {
    total: newBucket_(), houseAds: newBucket_(), campaigns: new Set(), clients: new Set(), drops: new Set(),
    byMonth: {}, byMonthRegion: {}, byRegion: {}, byBrand: {}, byBook: {}, byGroup: {}, byPageCat: {}, byAdSize: {}, byPrintPage: {}, byIssue: {}, byRegionIssue: {},
    byRegionBrand: {}, byRegionGroup: {}, byRegionBrandGroup: {}, byBrandGroup: {}, byFamily: {}, byFamilyRegion: {}, brandFamily: {}, byClient: {}, byAgency: {}, byRep: {}, byIO: {}, byBilling: {}, byRcType: {}, byPlatform: {}, byTerm: {},
    byCampaign: {}, checks: {}, unclassified: {}, brandMonth: {}, groupMonth: {}, byBand: {}, byChannel: {},
  };
  const dims = reviewDims_().map(d => headers.indexOf(d.col));
  const tree = { children: {}, B: newBucket_(), leaves: 0 };
  let runDate = null;
  for (const row of rows) {
    const v = rowBucket_(row, I, factor);
    const region = s(row[I.region]) || CFG.REGION_FALLBACK, period = s(row[I.period]), brand = s(row[I.brand]) || '(blank)', group = s(row[I.group]) || CFG.PAGECAT_UNCLASSIFIED;
    const rd = I.runDate >= 0 ? row[I.runDate] : null; if (rd instanceof Date && (!runDate || rd > runDate)) runDate = rd;
    if (v.hs && cfg.houseExclude) { addBucket_(A.houseAds, v); continue; }
    addBucket_(A.total, v);
    if (I.campaign >= 0 && row[I.campaign] !== '') A.campaigns.add(s(row[I.campaign]));
    if (I.client >= 0 && row[I.client] !== '') A.clients.add(s(row[I.client]));
    if (I.drop >= 0 && row[I.drop] !== '') A.drops.add(s(row[I.drop]));
    bumpB_(A.byMonth, period, v); bumpB_(A.byMonthRegion[period] = A.byMonthRegion[period] || {}, region, v);
    bumpB_(A.byRegion, region, v); bumpB_(A.byBrand, brand, v); bumpB_(A.byBook, s(row[I.book]), v); bumpB_(A.byGroup, group, v); bumpB_(A.byPageCat, s(row[I.pageCat]), v);
    bumpB_(A.byAdSize, s(row[I.adSize]), v); bumpB_(A.byPrintPage, s(row[I.printPage]), v); bumpB_(A.byIssue, s(row[I.issue]), v);
    bumpB_(A.byRegionIssue[region] = A.byRegionIssue[region] || {}, s(row[I.issue]), v);
    const family = I.family >= 0 ? (s(row[I.family]) || brand) : brand; bumpB_(A.byFamily, family, v); bumpB_(A.byFamilyRegion, `${family}|${region}`, v); A.brandFamily[brand] = family;
    bumpB_(A.byRegionBrand, `${region}|${brand}`, v); bumpB_(A.byRegionGroup, `${region}|${group}`, v); bumpB_(A.byRegionBrandGroup, `${region}|${brand}|${group}`, v); bumpB_(A.byBrandGroup, `${brand}|${group}`, v);
    bumpB_(A.brandMonth[brand] = A.brandMonth[brand] || {}, period, v); bumpB_(A.groupMonth[group] = A.groupMonth[group] || {}, period, v);
    bumpB_(A.byClient, s(row[I.client]), v); bumpB_(A.byAgency, s(row[I.agency]), v); bumpB_(A.byRep, s(row[I.rep]), v); bumpB_(A.byIO, s(row[I.io]), v); bumpB_(A.byBilling, s(row[I.bs]), v);
    bumpB_(A.byRcType, s(row[I.rcType]), v); bumpB_(A.byPlatform, s(row[I.platform]), v); if (I.band >= 0) bumpB_(A.byBand, s(row[I.band]), v); if (I.channel >= 0) bumpB_(A.byChannel, s(row[I.channel]), v); if (I.term >= 0 && s(row[I.term])) bumpB_(A.byTerm, s(row[I.term]), v);
    const chk = I.check >= 0 ? s(row[I.check]) : ''; if (chk) { const kind = chk.split(' ')[0].replace(/[;(]/g, ''); A.checks[kind] = (A.checks[kind] || 0) + 1; }
    if (group === CFG.PAGECAT_UNCLASSIFIED) { const pc = s(row[I.pageCat]); A.unclassified[pc] = (A.unclassified[pc] || 0) + 1; }
    const ck = s(row[I.campaign]);
    if (!A.byCampaign[ck]) A.byCampaign[ck] = { id: ck, name: s(row[I.campaignName]), client: s(row[I.client]), region, brand, rep: s(row[I.rep]), io: s(row[I.io]), B: newBucket_() };
    addBucket_(A.byCampaign[ck].B, v);
    // yield tree
    if (!opts.noTree) {
      let node = tree; addBucket_(node.B, v);
      for (let d = 0; d < dims.length; d++) {
        const key = dims[d] >= 0 ? (s(row[dims[d]]) || '(blank)') : '(n/a)';
        node = node.children[key] || (node.children[key] = { children: {}, B: newBucket_(), byReg: {} });
        addBucket_(node.B, v); bumpB_(node.byReg, region, v);   // per-market split → benchmark against each market's own average yield
        if (d >= 1) node.family = family;                          // Brand level and below: benchmark = the brand family's all-market average
      }
      tree.leaves++;
    }
  }
  A.runDate = runDate; A.tree = tree; A.dims = reviewDims_().map(d => d.label);
  return A;
}

/** Benchmark yield for a tree node: the markets' average yields weighted by the node's denominator in each market (so a row spanning markets is compared with its own mix of markets). */
function marketBenchmark_(node, byRegion, basis) {
  if (!node.byReg || !byRegion) return null;
  let den = 0, acc = 0;
  Object.keys(node.byReg).forEach(m => { const d = denomOf_(node.byReg[m], basis); const M = byRegion[m]; if (d > 0 && M && denomOf_(M, basis) > 0) { den += d; acc += d * yieldOf_(M, basis); } });
  return den ? acc / den : null;
}

/** Flattens the yield tree to rows [{level, label, path, B, isLeaf}] in depth-first order (sorted by earned desc). */
function flattenYieldTree_(tree, maxLeaves) {
  const out = []; let leaves = 0;
  const walk = (node, level, pathArr) => {
    const keys = Object.keys(node.children).sort((a, b) => node.children[b].B.k - node.children[a].B.k);
    for (const k of keys) {
      const ch = node.children[k], isLeaf = !Object.keys(ch.children).length;
      if (isLeaf) { leaves++; if (maxLeaves && leaves > maxLeaves) continue; }
      out.push({ level, label: k, path: pathArr.concat(k).join(' › '), labels: pathArr.concat(k), B: ch.B, isLeaf, node: ch, parent: node });
      if (!isLeaf) walk(ch, level + 1, pathArr.concat(k));
    }
  };
  walk(tree, 0, []);
  return { rows: out, leaves: tree.leaves, capped: maxLeaves && tree.leaves > maxLeaves };
}

/** Serialises bucket maps into sorted arrays for the browser: [{name, ...bucket}]. */
function bucketList_(o, limit) { return Object.keys(o).map(k => Object.assign({ name: k }, o[k])).sort((a, b) => b.k - a.k).slice(0, limit || 100000); }

/**
 * Focus candidates: region × brand × group cells with enough pages, compared with the market's own yield at the given basis.
 * gap = (market yield − cell yield) × cell denominator = revenue the cell would have earned at the market average.
 */
function focusList_(A, basis, top) {
  const out = [];
  Object.keys(A.byRegionBrandGroup).forEach(key => {
    const [region, brand, group] = key.split('|'); const B = A.byRegionBrandGroup[key];
    if (group === CFG.GROUP_INSERT || group === CFG.GROUP_HOUSE) return;
    if (B.pg < PRINT.FOCUS_MIN_PAGES) return;
    const R = A.byRegion[region]; if (!R) return;
    const y = yieldOf_(B, basis), my = yieldOf_(R, basis), den = denomOf_(B, basis);
    if (!den) return;
    out.push({ region, brand, group, pages: B.pg, earned: B.k, yield: y, marketYield: my, gap: (my - y) * den, revPerPage: B.pg ? B.k / B.pg : 0, drops: B.n });
  });
  const low = out.filter(x => x.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, top || PRINT.FOCUS_TOP);
  const high = out.filter(x => x.gap < 0).sort((a, b) => a.gap - b.gap).slice(0, top || PRINT.FOCUS_TOP);
  return { below: low, above: high };
}

/**
 * Period comparisons from month buckets: MoM, QoQ, YoY. Buckets are additive, so quarters and years are sums of months.
 * @param {Object} byMonth  { 'YYYY-MM': bucket }
 * @param {string} runPeriod 'YYYY-MM' of the report run (months after it have not earned yet and are excluded from "latest")
 * @return {{months:Array, quarters:Array, years:Array, runPeriod:string}}
 *   months[i]   = { period, B, prev (prior month B|null), yoy (same month prior year B|null) }
 *   quarters[i] = { q: 'YYYY-Qn', B, prev, yoy, months: n }
 *   years[i]    = { y, B, prev, ytdPrev (prior year, same months as this year has up to the run month), months: n }
 */
function periodComparisons_(byMonth, runPeriod) {
  const periods = Object.keys(byMonth).filter(p => /^\d{4}-\d{2}$/.test(p)).sort();
  const get = p => byMonth[p] || null;
  const shift = (p, years) => `${+p.slice(0, 4) - years}${p.slice(4)}`;
  const prevMonth = p => { const y = +p.slice(0, 4), m = +p.slice(5, 7); return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`; };
  const months = periods.map(p => ({ period: p, B: get(p), prev: get(prevMonth(p)), yoy: get(shift(p, 1)) }));
  const qOf = p => `${p.slice(0, 4)}-Q${Math.floor((+p.slice(5, 7) - 1) / 3) + 1}`;
  const Q = {}, QN = {}; periods.forEach(p => { const q = qOf(p); addBucket_(Q[q] || (Q[q] = newBucket_()), byMonth[p]); QN[q] = (QN[q] || 0) + 1; });
  const qKeys = Object.keys(Q).sort();
  const prevQ = q => { const y = +q.slice(0, 4), n = +q.slice(6); return n === 1 ? `${y - 1}-Q4` : `${y}-Q${n - 1}`; };
  const quarters = qKeys.map(q => ({ q, B: Q[q], prev: Q[prevQ(q)] || null, yoy: Q[`${+q.slice(0, 4) - 1}${q.slice(4)}`] || null, months: QN[q] }));
  const Yr = {}, YM = {}; periods.forEach(p => { const y = p.slice(0, 4); addBucket_(Yr[y] || (Yr[y] = newBucket_()), byMonth[p]); (YM[y] = YM[y] || []).push(p.slice(5, 7)); });
  const years = Object.keys(Yr).sort().map(y => {
    const prev = Yr[String(+y - 1)] || null;
    let ytdPrev = null;
    if (prev) { ytdPrev = newBucket_(); YM[y].forEach(mm => { const b = byMonth[`${+y - 1}-${mm}`]; if (b) addBucket_(ytdPrev, b); }); }
    return { y, B: Yr[y], prev, ytdPrev, months: YM[y].length };
  });
  return { months, quarters, years, runPeriod: runPeriod || '' };
}

/** Human-readable Method text (shared by web app, Excel and Sheets). */
function methodLines_(cfg) {
  cfg = cfg || getConfig();
  return [
    ['Earned (headline)', 'Adjusted Earned Blended Revenue, as exported by AdBook — the net revenue recognised for drops whose issue has run.'],
    ['Earned fraction', 'Adjusted Earned Blended Revenue ÷ Adjusted Blended Revenue per drop (0 when the issue has not run, 1 when it has). Used to put rate cards on the same earned basis.'],
    ['Gross earned', `Read per drop from AdBook's "(Drop) Rate Card Pricing" waterfall: Gross = AdjustedRateCard + contract discounts (Tier 2) + client discounts (Tier 3/4)${cfg.grossIncludesCommission ? ' + agency commission (Tier 99)' : ''}, × earned fraction. Pricing-policy tiers (Settings: ${cfg.policyTiers.join(', ')} — rate-card adjustments and Special) sit between the list price and gross and are not part of yield. Example: 124,500 list → − 90,262.50 contract → − 5,135.63 commission → 29,101.88 AdjustedRateCard ⇒ gross 124,500; 111,600 list → − 24,462 Tier 0 → gross 87,138 → … → 24,664.41. Labels differ by market (Discount - Contract, Remise exceptionnelle, …); the tier number decides. Drops whose text has no rate card (N/A) fall back to the discount columns, then to the list price column (Initial Rate Card Price — gross = list, the gap to the actual price is the off-card change), else they count in earned and pages but not in yield — the Import Log and the "Priced coverage" figure say how many.`],
    ['Money bridge', 'Rate card → − policy tiers (rate-card adjustment, Special) → Gross → − contract discounts → − client discounts → − agency commission → structured net (AdjustedRateCard) → ± off-card change (actual price vs the rate-card structure) → Net earned. Every step is on the earned basis and the steps always add up to the rate card.'],
    ['Where the bridge takes its prices', 'Every step of the money bridge is an AdBook amount from the drop\'s rate card text or a difference of two: Rate card = [Rate Card Price]; Policy tiers = Tier 0 / Tier 5; Gross = AdjustedRateCard + contract + client + commission; Contract / Client / Commission = Tier 2 / 3-4 / 99; Structured net = AdjustedRateCard; Off-card change = Adjusted Blended Revenue (the booked price) − AdjustedRateCard; Net earned = Adjusted Earned Blended Revenue. All × earned fraction. The export\'s "Price" column is not used. Nothing is estimated, so the steps always add up.'],
    ['Price · volume · mix', 'Why net revenue moved between two periods, in five lines that add up to the change: Volume = Δ pages × last period\'s average revenue per page; Mix = pages moving between page categories at last period\'s category prices; Rate = the gross (tier) price per page moved (pricing policy); Discount = the share of gross kept moved (negotiation); Price (no rate card) = revenue per page on positions without a rate card, where rate and discount cannot be separated; Inserts & other = non-page revenue. "Price" in the PVM is revenue per page (net ÷ pages) — pages are the volume unit of print.'],
    ['Reading the page', 'Every figure can be clicked: the panel shows its definition, the formula, the numbers behind it, a reading written from those numbers and what would change it. The market scorecard\'s reading opens the full analysis (rule, bridge in both periods, PVM, brands vs their family).'],
    ['Discount depth', '1 − net ÷ gross per drop (negotiated discount incl. commission), grouped into bands from Settings (default 0–25 / 25–50 / 50–70 / 70 %+).'],
    ['Yield vs Gross (default)', 'Priced earned ÷ Gross earned — what sales kept after everything negotiated beyond rate-card policy. Only drops with a rate card enter the ratio (numerator and denominator alike).'],
    ['Yield vs Rate Card', 'Earned ÷ (Current Rate Card Price × earned fraction) — total discounting including the structural tier.'],
    ['Yield vs Adjusted Rate Card', 'Earned ÷ ((Drop) Adjusted Rate Card × earned fraction) — negotiation beyond the tier price.'],
    ['Discount', '1 − yield at the selected basis.'],
    ['Pages', 'Page factor of (Drop) Print Ad Size (Settings table; gatefolds use Actual Space when it is 2/4/6). Inserts (Loose, Bound-In, Tip-On, *Inserts book) count 0 pages and are reported separately. (Drop) Actual Space is kept as a validation column only (Space Check).'],
    ['Revenue per page', 'Earned ÷ pages, on page-based positions only (inserts excluded).'],
    ['Page share', 'Pages of a category ÷ all pages in the same market / brand; shown next to the revenue share so categories that take pages but under-deliver stand out.'],
    ['Focus list', 'Market × brand × page category cells with ≥ 4 pages, ranked by (market yield − cell yield) × cell denominator = revenue recoverable at the market\'s own average yield.'],
    ['Page Cat / Group', `Page Cat = Path 5 (blank → Standard). Page Cat Group = the Settings pattern table (Cover, Premium spread, Editorial adjacency, Standard, Regional split, Negotiated placement, Advertorial, Insert, House Ad); commercial terms (1–4 Campaign, Special Rates …) → Standard. ${cfg.houseExclude ? 'House ads are excluded from yield and revenue per page.' : 'House ads are included.'}`],
    ['Market / Brand / Book', 'Market = first segment of Position Path (Path 1). Brand = Path 3. Book = Path 4 (*Mainbook, *Inserts, Supplement, named supplements).'],
  ];
}

/* ===================== PrintSheets ===================== */
/**
 * Print Yield Review — Google Sheets tabs (Dashboard, Regions, one tab per market)
 * ---------------------------------------------------------------------------------
 * Built from computeRegionSplit_() buckets (P, byBrandB, byGroupB …) at the default yield basis from Settings.
 * Live switching between bases happens in the web app; the sheets carry the leadership default.
 */

const PSHEET = { NAVY: '#1e3a5f', GOLD: '#b8933f', INK: '#1b2430' };

function yieldBasisLabel_(basis) { return PRINT.BASIS_SHORT[basis] || PRINT.BASIS_SHORT.gross; }

/** Market rows for the yield table: name | earned | gross | yield | rate card | adj. rate card | yield vs RC | yield vs ARC | pages | rev/page | drops | inserts | share. */
function marketYieldRows_(split, basis) {
  const T = split.totals.P;
  const row = (name, B) => [name, B.k, B.g, yieldOf_(B, basis), B.rc, B.arc, yieldOf_(B, 'ratecard'), yieldOf_(B, 'adjratecard'), B.pg, B.pg ? B.k / B.pg : 0, B.n, B.ins, T.k ? B.k / T.k : 0];
  const rows = split.regions.slice().sort((a, b) => b.P.k - a.P.k).map(r => row(r.name, r.P));
  rows.push(row('Total', T)); rows[rows.length - 1][12] = 1;
  return rows;
}
const MARKET_YIELD_HEAD_ = basis => ['Market', 'Earned', 'Gross earned', `Yield ${yieldBasisLabel_(basis)}`, 'Rate card (sum)', 'Adj. rate card (sum)', 'Yield vs rate card', 'Yield vs adj. rate card', 'Pages', 'Revenue / page', 'Drops', 'Inserts', 'Share of earned'];
const MARKET_YIELD_FMT_ = { money: [2, 3, 5, 6, 10], pct: [4, 7, 8, 13], int: [11, 12], totalRow: true };

/** Generic bucket table: name | earned | gross | yield | pages | page share | earned share | rev/page | drops. */
function bucketRows_(map, total, basis, labelTotal) {
  const keys = Object.keys(map).sort((a, b) => map[b].k - map[a].k);
  const row = (name, B) => [name, B.k, B.g, yieldOf_(B, basis), B.pg, total.pg ? B.pg / total.pg : 0, total.k ? B.k / total.k : 0, B.pg ? B.k / B.pg : 0, B.n];
  const rows = keys.map(k => row(k, map[k]));
  rows.push(row(labelTotal || 'Total', total)); const t = rows[rows.length - 1]; t[5] = 1; t[6] = 1;
  return rows;
}
const BUCKET_HEAD_ = (first, basis) => [first, 'Earned', 'Gross earned', `Yield ${yieldBasisLabel_(basis)}`, 'Pages', 'Page share', 'Earned share', 'Revenue / page', 'Drops'];
const BUCKET_FMT_ = { money: [2, 3, 8], pct: [4, 6, 7], int: [9], totalRow: true };

/** Yield-table rows (hierarchical, indented) in the agreed layout: Drops | Pages | Earned | Gross | Yield | Rate card | Rev/page | Discount. */
function yieldTableRows_(tree, basis, maxLeaves, byRegion, byFamily, byFamilyPath) {
  const flat = flattenYieldTree_(tree, maxLeaves);
  const yOf = B => B && denomOf_(B, basis) > 0 ? yieldOf_(B, basis) : null;
  // three reference points per row (see YIELD_TABLE_NOTE_)
  const groupAvg = r => r.parent === tree ? marketBenchmark_(r.node, byRegion, basis) : yOf(r.parent.B);
  const sameAcross = r => { if (!byFamilyPath || !r.node.family || r.level < 1 || r.level > 4) return null; const key = [r.node.family].concat(r.labels.slice(2, r.level + 1)).join('\u0001'); return yOf(byFamilyPath[key]); };
  const brandAvg = r => r.node.family && byFamily ? yOf(byFamily[r.node.family]) : null;
  const line = (label, B, g, sa, ba) => { const y = yOf(B), d = denomOf_(B, basis);
    const vs = ref => (y !== null && ref !== null) ? y - ref : '';
    return [label, B.n, B.pg, B.k, B.g, y === null ? '' : y, B.rc, B.pg ? B.k / B.pg : 0, y === null ? '' : 1 - y,
      g === null ? '' : g, vs(g), sa === null ? '' : sa, vs(sa), ba === null ? '' : ba, vs(ba), (y !== null && g !== null) ? (y - g) * d : '']; };
  const rows = flat.rows.map(r => line(`${'      '.repeat(r.level)}${r.label}`, r.B, groupAvg(r), sameAcross(r), brandAvg(r)));
  rows.push(line('Grand Total', tree.B, null, null, null));
  return { rows, capped: flat.capped, leaves: flat.leaves };
}
const YIELD_TABLE_HEAD_ = (dims, basis) => [dims.join(' › '), 'Drops', 'Pages', 'Earned', 'Gross earned', `Yield ${yieldBasisLabel_(basis)}`, 'Rate card (sum)', 'Revenue / page', 'Discount',
  'Group avg', 'vs group (pt)', 'Same across markets', 'vs same (pt)', 'Brand avg (all markets)', 'vs brand (pt)', 'vs group (earned)'];
const YIELD_TABLE_NOTE_ = 'Group avg = the row above (its market for the top level) · Same across markets = this element (brand family / Path 2 / book / page cat) in all markets · Brand avg = the brand family across all markets';
const YIELD_TABLE_FMT_ = { money: [4, 5, 7, 8, 16], pct: [6, 9, 10, 11, 12, 13, 14, 15], int: [2], totalRow: true };

/** Market × group yield matrix rows (+ pages in a second matrix). */
function regionGroupMatrix_(split, groups, basis, field) {
  const T = split.totals;
  const cell = (B) => !B ? '' : field === 'pages' ? B.pg : field === 'share' ? 0 : yieldOf_(B, basis);
  const rows = split.regions.map(r => [r.name, ...groups.map(g => { const B = r.byGroupB[g]; if (!B) return ''; return field === 'pages' ? B.pg : field === 'share' ? (r.P.pg ? B.pg / r.P.pg : 0) : yieldOf_(B, basis); }), field === 'pages' ? r.P.pg : field === 'share' ? 1 : yieldOf_(r.P, basis)]);
  rows.push(['All markets', ...groups.map(g => { const B = T.byGroupB[g]; if (!B) return ''; return field === 'pages' ? B.pg : field === 'share' ? (T.P.pg ? B.pg / T.P.pg : 0) : yieldOf_(B, basis); }), field === 'pages' ? T.P.pg : field === 'share' ? 1 : yieldOf_(T.P, basis)]);
  return rows;
}

/** MoM / QoQ / YoY tables for Sheets and Excel. Returns the next free row. */
function writePeriodBlocks_(sh, row, pc, basis, cur) {
  const bl = yieldBasisLabel_(basis);
  const pct = (a, b) => b ? (a - b) / b : '';
  const ppt = (a, b) => (a !== '' && b !== '') ? a - b : '';
  const line = (label, B, ref, refLabel) => { const y = yieldOf_(B, basis), ry = ref ? yieldOf_(ref, basis) : '';
    return [label, B.k, ref ? ref.k : '', ref ? pct(B.k, ref.k) : '', y, ry, ppt(y, ry), B.pg, ref ? ref.pg : '', ref ? pct(B.pg, ref.pg) : '', B.pg ? B.k / B.pg : 0, ref && ref.pg ? ref.k / ref.pg : '']; };
  const head = ref => ['Period', 'Earned', `Earned ${ref}`, 'Δ earned', `Yield ${bl}`, `Yield ${ref}`, 'Δ yield (pts)', 'Pages', `Pages ${ref}`, 'Δ pages', 'Revenue / page', `Rev / page ${ref}`];
  const fmt = { money: [2, 3, 11, 12], pct: [4, 5, 6, 7, 10], int: [8, 9] };
  const mn = p => MONTH_NAMES_[parseInt(p.slice(5, 7), 10) - 1].slice(0, 3) + ' ' + p.slice(0, 4);
  const mom = pc.months.map(m => line(mn(m.period), m.B, m.prev, 'prior month'));
  row = writeBlock_(sh, row, `Month over month — ${cur}`, head('prior month'), mom.length ? mom : [['— no months —', ...new Array(11).fill('')]], fmt);
  const yoyM = pc.months.filter(m => m.yoy).map(m => line(mn(m.period), m.B, m.yoy, 'same month prior year'));
  row = writeBlock_(sh, row, `Month vs same month prior year — ${cur}`, head('prior year'), yoyM.length ? yoyM : [['— no prior-year months in the data —', ...new Array(11).fill('')]], fmt);
  const qoq = pc.quarters.map(q => line(`${q.q}${q.months < 3 ? ` (${q.months} mo)` : ''}`, q.B, q.prev, 'prior quarter'));
  row = writeBlock_(sh, row, `Quarter over quarter — ${cur}`, head('prior quarter'), qoq.length ? qoq : [['— no quarters —', ...new Array(11).fill('')]], fmt);
  const qyoy = pc.quarters.filter(q => q.yoy).map(q => line(q.q, q.B, q.yoy, 'same quarter prior year'));
  row = writeBlock_(sh, row, `Quarter vs same quarter prior year — ${cur}`, head('prior year'), qyoy.length ? qyoy : [['— no prior-year quarters in the data —', ...new Array(11).fill('')]], fmt);
  const yoy = pc.years.map(y => line(`${y.y}${y.months < 12 ? ` (${y.months} mo)` : ''}`, y.B, y.prev, 'prior year'));
  row = writeBlock_(sh, row, `Year over year — full prior year — ${cur}`, head('prior year'), yoy.length ? yoy : [['— no years —', ...new Array(11).fill('')]], fmt);
  const ytd = pc.years.filter(y => y.ytdPrev).map(y => line(`${y.y} vs ${+y.y - 1} (same ${y.months} months)`, y.B, y.ytdPrev, 'prior year, same months'));
  row = writeBlock_(sh, row, `Year over year — like for like (same months) — ${cur}`, head('prior yr same months'), ytd.length ? ytd : [['— needs two years in the data —', ...new Array(11).fill('')]], fmt);
  return row;
}

/* ------------------------------------------------------------------ */
/* Dashboard tab                                                       */
/* ------------------------------------------------------------------ */

function buildPrintDashboardSheet_(ss, pv, C, kpiName) {
  let sh = ss.getSheetByName(CFG.SHEETS.DASH);
  if (!sh) sh = ss.insertSheet(CFG.SHEETS.DASH, 0);
  resetSheet_(sh);
  ensureColumns_(sh, 16);
  sh.setColumnWidth(1, 220); sh.setColumnWidths(2, 15, 110);
  const cfg = getConfig(), basis = cfg.yieldBasis;
  const sd = scopedData_(ss), headers = sd.headers;
  const split = computeRegionSplit_(headers, sd.rows);
  const T = split.totals, B = T.P, cur = currencyOf_(headers);
  const D = CFG.SHEETS.DATA, L = n => columnLetter_(n), rng = n => `${D}!${L(n)}2:${L(n)}`;
  const y = yieldOf_(B, basis), nf = cfg.numberFormat;

  let row = 1;
  sh.getRange(row, 1).setValue(`${profile_().title} — ${yearLabel_()}`).setFontSize(20).setFontWeight('bold'); row++;
  sh.getRange(row, 1).setFormula(`="Report run "&TEXT(MAX(${rng(C.runDate)}),"d mmm yyyy")&"  ·  ${sd.rows.length} line items  ·  ${scopeLabel_()}  ·  all figures in ${cur}  ·  yield ${yieldBasisLabel_(basis)}  ·  generated "&TEXT(NOW(),"d mmm yyyy HH:mm")${cfg.creditLine ? `&"  ·  ${cfg.creditLine.replace(/"/g, '""')}"` : ''}`).setFontColor('#5f6b63').setFontStyle('italic');
  row += 3;   // row 3: background status · row 4: build check (written after the cards)

  const cards = [
    [['Adjusted earned blended revenue', B.k, PSHEET.NAVY, nf], [`Yield ${yieldBasisLabel_(basis)}`, y, PSHEET.NAVY, '0.0%'], ['Gross earned', B.g, PSHEET.INK, nf],
     ['Pages', B.pg, PSHEET.INK, '#,##0.0'], ['Revenue per page', B.pg ? B.k / B.pg : 0, PSHEET.GOLD, nf], ['Discount vs basis', 1 - y, PSHEET.INK, '0.0%']],
    [['Yield vs rate card', yieldOf_(B, 'ratecard'), PSHEET.INK, '0.0%'], ['Priced coverage (earned with a rate card)', B.k ? B.kp / B.k : 0, PSHEET.INK, '0.0%'], ['Drops', B.n, PSHEET.INK, '#,##0'],
     ['Inserts', B.ins, PSHEET.INK, '#,##0'], ['Campaigns', T.campaigns, PSHEET.INK, '#,##0'], ['Markets', split.regions.length, PSHEET.INK, '#,##0']],
  ];
  cards.forEach((cs, ri) => {
    const r0 = row + ri * 4;
    cs.forEach((kp, i) => {
      const c = 1 + i * 2;
      sh.getRange(r0, c, 3, 2).setBackground('#ffffff').setBorder(true, true, true, true, false, false, '#d9ddd6', SpreadsheetApp.BorderStyle.SOLID);
      sh.getRange(r0, c, 1, 2).merge().setValue(kp[0]).setFontColor('#5f6b63').setFontSize(10).setVerticalAlignment('bottom');
      sh.getRange(r0 + 1, c, 2, 2).merge().setValue(kp[1]).setFontSize(ri ? 16 : 20).setFontWeight('bold').setFontColor(kp[2]).setVerticalAlignment('top').setNumberFormat(kp[3]);
    });
  });
  row += 8;

  // Highlights
  const bestM = split.regions.filter(r => r.P.g).sort((a, b) => yieldOf_(b.P, basis) - yieldOf_(a.P, basis));
  const groups = Object.keys(T.byGroupB).sort((a, b) => T.byGroupB[b].pg - T.byGroupB[a].pg);
  const focus = focusList_({ byRegionBrandGroup: regionBrandGroup_(split), byRegion: split.regions.reduce((o, r) => { o[r.name] = r.P; return o; }, {}) }, basis, 5);
  const hl = [
    ['Highest-yield market', bestM[0] ? bestM[0].name : '', bestM[0] ? yieldOf_(bestM[0].P, basis) : 0, bestM[0] ? bestM[0].P.pg : 0],
    ['Lowest-yield market', bestM.length ? bestM[bestM.length - 1].name : '', bestM.length ? yieldOf_(bestM[bestM.length - 1].P, basis) : 0, bestM.length ? bestM[bestM.length - 1].P.pg : 0],
    ['Largest page category', groups[0] || '', groups[0] ? yieldOf_(T.byGroupB[groups[0]], basis) : 0, groups[0] ? T.byGroupB[groups[0]].pg : 0],
    ['Top focus cell', focus.below[0] ? `${focus.below[0].region} · ${focus.below[0].brand} · ${focus.below[0].group}` : '—', focus.below[0] ? focus.below[0].yield : 0, focus.below[0] ? focus.below[0].pages : 0],
    ['House ads (excluded)', cfg.houseExclude ? `${T.houseAds.n} lines` : 'included', 0, T.houseAds.pg],
  ];
  row = writeBlock_(sh, row, 'Highlights', ['', 'Who / what', `Yield ${yieldBasisLabel_(basis)}`, 'Pages'], hl, { pct: [3], int: [4] });

  // Markets
  row = writeBlock_(sh, row, `Yield by market — ${cur}`, MARKET_YIELD_HEAD_(basis), marketYieldRows_(split, basis), MARKET_YIELD_FMT_);
  // Focus list
  const fRows = focus.below.map(f => [f.region, f.brand, f.group, f.pages, f.earned, f.yield, f.marketYield, f.gap, f.revPerPage]);
  if (fRows.length) row = writeBlock_(sh, row, `Focus list — cells below their market's yield (${yieldBasisLabel_(basis)}), ranked by recoverable revenue`, ['Market', 'Brand', 'Page category', 'Pages', 'Earned', 'Cell yield', 'Market yield', 'Recoverable at market yield', 'Revenue / page'], fRows, { money: [5, 8, 9], pct: [6, 7], int: [4] });
  // Page categories
  row = writeBlock_(sh, row, 'Page categories — all markets', BUCKET_HEAD_('Page category', basis), bucketRows_(T.byGroupB, B, basis), BUCKET_FMT_);
  row = writeBlock_(sh, row, `Market × page category — yield ${yieldBasisLabel_(basis)}`, ['Market', ...groups, 'All'], regionGroupMatrix_(split, groups, basis, 'yield'), { pct: range_(2, groups.length + 2), totalRow: true });
  row = writeBlock_(sh, row, 'Market × page category — page share', ['Market', ...groups, 'All'], regionGroupMatrix_(split, groups, basis, 'share'), { pct: range_(2, groups.length + 2), totalRow: true });
  // Brands
  row = writeBlock_(sh, row, 'Brands — all markets', BUCKET_HEAD_('Brand', basis), bucketRows_(T.byBrandB, B, basis), BUCKET_FMT_);
  // Ad sizes / books
  row = writeBlock_(sh, row, 'Ad sizes', BUCKET_HEAD_('Ad size', basis), bucketRows_(T.byAdSizeB, B, basis), BUCKET_FMT_);
  row = writeBlock_(sh, row, 'Books (Path 4)', BUCKET_HEAD_('Book', basis), bucketRows_(T.byBookB, B, basis), BUCKET_FMT_);
  // Monthly
  const P = split.periods;
  const mrows = P.map(p => { const M = T.byPeriodB[p] || newBucket_(); return [split.monthName(p), M.k, M.g, yieldOf_(M, basis), M.pg, M.pg ? M.k / M.pg : 0, M.n]; });
  mrows.push(['Total', B.k, B.g, y, B.pg, B.pg ? B.k / B.pg : 0, B.n]);
  row = writeBlock_(sh, row, 'Month by month', ['Month', 'Earned', 'Gross earned', `Yield ${yieldBasisLabel_(basis)}`, 'Pages', 'Revenue / page', 'Drops'], mrows, { money: [2, 3, 6], pct: [4], int: [7], totalRow: true });
  // MoM / QoQ / YoY
  row = writePeriodBlocks_(sh, row, periodComparisons_(T.byPeriodB, ''), basis, cur);
  // Method
  row = writeBlock_(sh, row, 'How the numbers are built', ['Term', 'Definition'], methodLines_(cfg), {});
  sh.setColumnWidth(2, 110);

  row = placeCharts_(sh, row, [
    { type: Charts.ChartType.COLUMN, range: pv.byMonth.range, title: `${kpiName} by month` },
    { type: Charts.ChartType.BAR, range: pv.byRegion.range, title: 'Earned revenue by market' },
    { type: Charts.ChartType.PIE, range: pv.byCategory.range, title: 'Brand mix', options: { pieHole: 0.45 } },
    { type: Charts.ChartType.BAR, range: pv.topClients.range, title: 'Top 10 clients' },
  ], ss.getId && ss.getId() !== SpreadsheetApp.getActiveSpreadsheet().getId() ? 'detail' : 'dashboard');
  ss.setActiveSheet(sh);
}

/** region|brand|group → bucket, from a split (for the focus list in Sheets). */
function regionBrandGroup_(split) {
  const o = {};
  split.regions.forEach(r => Object.keys(r.byBrandGroupB).forEach(k => { o[`${r.name}|${k}`] = r.byBrandGroupB[k]; }));
  return o;
}

/* ------------------------------------------------------------------ */
/* Regions tab                                                         */
/* ------------------------------------------------------------------ */

function buildPrintRegionsTab_(sh, split) {
  const cfg = getConfig(), basis = cfg.yieldBasis;
  const P = split.periods, T = split.totals, N = split.niches;
  const groups = Object.keys(T.byGroupB).sort((a, b) => T.byGroupB[b].pg - T.byGroupB[a].pg);
  ensureColumns_(sh, Math.max(14, P.length + 3, N.length + 3, groups.length + 3));
  sh.setColumnWidth(1, 200); sh.setColumnWidths(2, Math.max(P.length, N.length, groups.length) + 2, 110);
  let row = 1;
  sh.getRange(row, 1).setValue(`Print yield by market — ${yearLabel_()}`).setFontSize(18).setFontWeight('bold'); row += 1;
  sh.getRange(row, 1).setValue(`Consolidated in ${cfg.reportingCurrency} · ${scopeLabel_()} · yield ${yieldBasisLabel_(basis)} · ${split.regions.length} markets · ${N.length} brands · ${P.length} months`).setFontColor('#5f6b63'); row += 2;

  const t1 = { start: row };
  row = writeBlock_(sh, row, 'Yield by market', MARKET_YIELD_HEAD_(basis), marketYieldRows_(split, basis), MARKET_YIELD_FMT_);
  row = writeBlock_(sh, row, `Market × page category — yield ${yieldBasisLabel_(basis)}`, ['Market', ...groups, 'All'], regionGroupMatrix_(split, groups, basis, 'yield'), { pct: range_(2, groups.length + 2), totalRow: true });
  const t2 = { start: row };
  row = writeBlock_(sh, row, 'Market × page category — pages', ['Market', ...groups, 'All'], regionGroupMatrix_(split, groups, basis, 'pages'), { int: range_(2, groups.length + 2), totalRow: true });
  row = writeBlock_(sh, row, 'Market × page category — page share', ['Market', ...groups, 'All'], regionGroupMatrix_(split, groups, basis, 'share'), { pct: range_(2, groups.length + 2), totalRow: true });
  // Market × brand earned
  const rows3 = split.regions.map(r => [r.name, ...N.map(k => (r.byBrandB[k] || {}).k || 0), r.P.k]); rows3.push(['Total', ...N.map(k => (T.byBrandB[k] || {}).k || 0), T.P.k]);
  row = writeBlock_(sh, row, 'Market × brand — earned', ['Market', ...N, 'Total'], rows3, { money: range_(2, N.length + 2), totalRow: true });
  const rows3b = split.regions.map(r => [r.name, ...N.map(k => r.byBrandB[k] ? yieldOf_(r.byBrandB[k], basis) : ''), yieldOf_(r.P, basis)]); rows3b.push(['All markets', ...N.map(k => T.byBrandB[k] ? yieldOf_(T.byBrandB[k], basis) : ''), yieldOf_(T.P, basis)]);
  row = writeBlock_(sh, row, `Market × brand — yield ${yieldBasisLabel_(basis)}`, ['Market', ...N, 'All'], rows3b, { pct: range_(2, N.length + 2), totalRow: true });
  // Brand family × market — the brand against itself across markets
  const fams = Object.keys(T.byFamilyB).sort((a, b) => T.byFamilyB[b].k - T.byFamilyB[a].k);
  const famRows = fams.map(f => [f, ...split.regions.map(r => r.byFamilyB[f] && denomOf_(r.byFamilyB[f], basis) > 0 ? yieldOf_(r.byFamilyB[f], basis) : ''), denomOf_(T.byFamilyB[f], basis) > 0 ? yieldOf_(T.byFamilyB[f], basis) : '']);
  famRows.push(['All brands', ...split.regions.map(r => denomOf_(r.P, basis) > 0 ? yieldOf_(r.P, basis) : ''), denomOf_(T.P, basis) > 0 ? yieldOf_(T.P, basis) : '']);
  row = writeBlock_(sh, row, `Brand family × market — yield ${yieldBasisLabel_(basis)} · each market's title against the same title's average across all markets (last column)`, ['Brand family', ...split.regions.map(r => r.name), 'All markets'], famRows, { pct: range_(2, split.regions.length + 2), totalRow: true });
  const famGap = fams.map(f => [f, ...split.regions.map(r => r.byFamilyB[f] && denomOf_(r.byFamilyB[f], basis) > 0 && denomOf_(T.byFamilyB[f], basis) > 0 ? yieldOf_(r.byFamilyB[f], basis) - yieldOf_(T.byFamilyB[f], basis) : ''), '']);
  row = writeBlock_(sh, row, 'Brand family × market — points vs the family average (negative = below the brand elsewhere)', ['Brand family', ...split.regions.map(r => r.name), ''], famGap, { pct: range_(2, split.regions.length + 1) });
  // Market × month
  const rows2 = split.regions.map(r => [r.name, ...P.map(p => (r.byPeriodB[p] || {}).k || 0), r.P.k]); rows2.push(['Total', ...P.map(p => (T.byPeriodB[p] || {}).k || 0), T.P.k]);
  const t4 = { start: row };
  row = writeBlock_(sh, row, 'Market × month — earned', ['Market', ...P.map(split.monthName), 'Total'], rows2, { money: range_(2, P.length + 2), totalRow: true });
  const rows2b = split.regions.map(r => [r.name, ...P.map(p => r.byPeriodB[p] ? yieldOf_(r.byPeriodB[p], basis) : ''), yieldOf_(r.P, basis)]); rows2b.push(['All markets', ...P.map(p => T.byPeriodB[p] ? yieldOf_(T.byPeriodB[p], basis) : ''), yieldOf_(T.P, basis)]);
  row = writeBlock_(sh, row, `Market × month — yield ${yieldBasisLabel_(basis)}`, ['Market', ...P.map(split.monthName), 'All'], rows2b, { pct: range_(2, P.length + 2), totalRow: true });

  const nReg = split.regions.length;
  row = placeCharts_(sh, row, [
    { type: Charts.ChartType.BAR, range: sh.getRange(t1.start + 1, 1, nReg + 1, 2), title: 'Earned revenue by market', options: { legend: { position: 'none' } } },
    { type: Charts.ChartType.COLUMN, range: sh.getRange(t2.start + 1, 1, nReg + 1, groups.length + 1), title: 'Pages by page category and market', options: { isStacked: true, legend: { position: 'right' } }, transpose: true },
    { type: Charts.ChartType.COLUMN, range: sh.getRange(t4.start + 1, 1, nReg + 1, P.length + 1), title: 'Monthly earned revenue by market', options: { isStacked: true, legend: { position: 'right' } }, transpose: true },
  ], 'detail');
  sh.setFrozenRows(0);
}

/* ------------------------------------------------------------------ */
/* One tab per market                                                  */
/* ------------------------------------------------------------------ */

function buildPrintRegionTab_(sh, split, r, headers, shareOfAll) {
  const cfg = getConfig(), basis = cfg.yieldBasis, nf = cfg.numberFormat;
  const P = split.periods.filter(p => r.byPeriodB[p]);
  const T = split.totals, B = r.P;
  ensureColumns_(sh, Math.max(14, P.length + 5));
  sh.setColumnWidth(1, 240); sh.setColumnWidths(2, Math.max(P.length, 12) + 2, 110);
  let row = 1;
  sh.getRange(row, 1).setValue(`${r.name} — ${yearLabel_()}`).setFontSize(20).setFontWeight('bold'); row += 1;
  const share = shareOfAll !== undefined ? shareOfAll : (T.P.k ? B.k / T.P.k : 0);
  sh.getRange(row, 1).setValue(`All figures in ${currencyOf_(headers)} · ${scopeLabel_()} · yield ${yieldBasisLabel_(basis)} · ${(100 * share).toFixed(1)}% of all markets · ${r.campaigns} campaigns · ${r.clients} clients`).setFontColor('#5f6b63'); row += 2;

  const y = yieldOf_(B, basis);
  const kpiRows = [
    [['Adjusted earned blended revenue', B.k, PSHEET.NAVY, nf], [`Yield ${yieldBasisLabel_(basis)}`, y, PSHEET.NAVY, '0.0%'], ['Gross earned', B.g, PSHEET.INK, nf], ['Pages', B.pg, PSHEET.INK, '#,##0.0'], ['Revenue per page', B.pg ? B.k / B.pg : 0, PSHEET.GOLD, nf], ['Drops', B.n, PSHEET.INK, '#,##0']],
    [['Yield vs rate card', yieldOf_(B, 'ratecard'), PSHEET.INK, '0.0%'], ['Priced coverage (earned with a rate card)', B.k ? B.kp / B.k : 0, PSHEET.INK, '0.0%'], ['Inserts', B.ins, PSHEET.INK, '#,##0'], ['Priced below adj. rate card', B.neg, PSHEET.INK, '#,##0'], ['Billed revenue', B.b, PSHEET.GOLD, nf], ['Top brand', topKey_(Object.keys(r.byBrandB).reduce((o, k) => { o[k] = r.byBrandB[k].k; return o; }, {})), PSHEET.INK, '@']],
  ];
  kpiRows.forEach((cards, ri) => {
    const r0 = row + ri * 3;
    cards.forEach((k, i) => {
      const c = 1 + i * 2;
      sh.getRange(r0, c, 1, 2).merge().setValue(k[0]).setFontColor('#5f6b63').setFontSize(10);
      sh.getRange(r0 + 1, c, 1, 2).merge().setValue(k[1]).setFontSize(k[3] === '@' ? 12 : 18).setFontWeight('bold').setFontColor(k[2]).setNumberFormat(k[3]);
    });
    sh.getRange(r0, 1, 2, 12).setBackground(REGIONS.HEAD_BG).setBorder(true, true, true, true, false, false, '#d9ddd6', SpreadsheetApp.BorderStyle.SOLID);
  });
  row += 7;

  const t1 = { start: row };
  row = writeBlock_(sh, row, 'Brands', BUCKET_HEAD_('Brand', basis), bucketRows_(r.byBrandB, B, basis), BUCKET_FMT_);
  const t2 = { start: row };
  row = writeBlock_(sh, row, 'Page categories', BUCKET_HEAD_('Page category', basis), bucketRows_(r.byGroupB, B, basis), BUCKET_FMT_);
  // Brand × page category yield + pages
  const groups = Object.keys(r.byGroupB).sort((a, b) => r.byGroupB[b].pg - r.byGroupB[a].pg);
  const brands = Object.keys(r.byBrandB).sort((a, b) => r.byBrandB[b].k - r.byBrandB[a].k);
  const bg = (b, g) => r.byBrandGroupB[`${b}|${g}`];
  const yRows = brands.map(b => [b, ...groups.map(g => bg(b, g) ? yieldOf_(bg(b, g), basis) : ''), yieldOf_(r.byBrandB[b], basis)]); yRows.push(['All brands', ...groups.map(g => yieldOf_(r.byGroupB[g], basis)), y]);
  row = writeBlock_(sh, row, `Brand × page category — yield ${yieldBasisLabel_(basis)}`, ['Brand', ...groups, 'All'], yRows, { pct: range_(2, groups.length + 2), totalRow: true });
  const pRows = brands.map(b => [b, ...groups.map(g => bg(b, g) ? bg(b, g).pg : ''), r.byBrandB[b].pg]); pRows.push(['All brands', ...groups.map(g => r.byGroupB[g].pg), B.pg]);
  row = writeBlock_(sh, row, 'Brand × page category — pages', ['Brand', ...groups, 'All'], pRows, { int: range_(2, groups.length + 2), totalRow: true });
  // Markets without a rate card: revenue per page vs the priced markets, per brand × page category (a proxy, not a yield)
  if (B.k && (B.kp || 0) / B.k < 0.5) {
    const priced = split.regions.filter(x => x.P.k && (x.P.kp || 0) / x.P.k >= 0.5);
    const bench = {}; priced.forEach(x => Object.keys(x.byGroupB).forEach(g => { if (g !== CFG.GROUP_INSERT && g !== CFG.GROUP_HOUSE) bumpB_(bench, g, x.byGroupB[g]); }));
    const bAll = Object.values(bench).reduce((a, b) => { addBucket_(a, b); return a; }, newBucket_());
    const groups = Object.keys(bench).sort((a, b) => bench[b].pg - bench[a].pg);
    const brands = Object.keys(r.byBrandB).sort((a, b) => r.byBrandB[b].k - r.byBrandB[a].k);
    const rpp = X => X && X.pg ? X.k / X.pg : 0;
    const idxRows = brands.map(bn => { const own = r.byBrandB[bn]; return [bn, ...groups.map(g => { const c = r.byBrandGroupB[`${bn}|${g}`]; return c && c.pg && bench[g].pg ? rpp(c) / rpp(bench[g]) : ''; }), own.pg && bAll.pg ? rpp(own) / rpp(bAll) : '']; });
    idxRows.push(['Priced markets · revenue per page', ...groups.map(g => rpp(bench[g])), rpp(bAll)]);
    const r0 = row;
    row = writeBlock_(sh, row, `No rate card in AdBook for ${r.name} (${(100 * (B.kp || 0) / B.k).toFixed(0)}% of earned priced) — revenue per page as % of the priced markets, by brand × page category (100% = parity; a proxy, not a yield)`, ['Brand', ...groups, 'All pages'], idxRows, { pct: range_(2, groups.length + 2), totalRow: true });
    sh.getRange(r0 + 1 + idxRows.length, 2, 1, groups.length + 1).setNumberFormat(moneyFmt_());   // benchmark row is money, not %
  }
  // Focus for this market
  const focus = focusList_({ byRegionBrandGroup: Object.keys(r.byBrandGroupB).reduce((o, k) => { o[`${r.name}|${k}`] = r.byBrandGroupB[k]; return o; }, {}), byRegion: { [r.name]: B } }, basis, 8);
  const fRows = focus.below.map(f => [f.brand, f.group, f.pages, f.earned, f.yield, f.marketYield, f.gap, f.revPerPage]);
  if (fRows.length) row = writeBlock_(sh, row, `Focus list — below the market yield, ranked by recoverable revenue`, ['Brand', 'Page category', 'Pages', 'Earned', 'Cell yield', 'Market yield', 'Recoverable', 'Revenue / page'], fRows, { money: [4, 7, 8], pct: [5, 6], int: [3] });
  row = writeBlock_(sh, row, 'Ad sizes', BUCKET_HEAD_('Ad size', basis), bucketRows_(r.byAdSizeB, B, basis), BUCKET_FMT_);
  // Monthly
  const mrows = P.map(p => { const M = r.byPeriodB[p]; return [split.monthName(p), M.k, M.g, yieldOf_(M, basis), M.pg, M.pg ? M.k / M.pg : 0, M.n]; });
  mrows.push(['Total', B.k, B.g, y, B.pg, B.pg ? B.k / B.pg : 0, B.n]);
  const t3 = { start: row };
  row = writeBlock_(sh, row, 'Month by month', ['Month', 'Earned', 'Gross earned', `Yield ${yieldBasisLabel_(basis)}`, 'Pages', 'Revenue / page', 'Drops'], mrows, { money: [2, 3, 6], pct: [4], int: [7], totalRow: true });
  // Yield table (agreed drill order) for this market
  const A = aggregatePrint_(headers, r.rows, 1, {});
  const yt = yieldTableRows_(A.tree, basis, 600, A.byRegion, T.byFamilyB, T.byFamilyPathB);
  row = writeBlock_(sh, row, `Yield table — ${A.dims.join(' › ')} · ${YIELD_TABLE_NOTE_}${yt.capped ? ` (first 600 of ${yt.leaves} detail rows — full table and the Review pivot in the Excel download)` : ''}`, YIELD_TABLE_HEAD_(A.dims, basis), yt.rows, YIELD_TABLE_FMT_);

  row = placeCharts_(sh, row, [
    { type: Charts.ChartType.BAR, range: sh.getRange(t1.start + 1, 1, brands.length + 1, 2), title: 'Earned by brand', options: { legend: { position: 'none' } } },
    { type: Charts.ChartType.PIE, range: sh.getRange(t2.start + 1, 1, groups.length + 1, 2), title: 'Earned by page category', options: { pieHole: 0.45 } },
    { type: Charts.ChartType.LINE, range: sh.getRange(t3.start + 1, 1, P.length + 1, 2), title: 'Earned by month', options: { legend: { position: 'none' } } },
  ], 'detail');
}

/* ===================== PrintWeb ===================== */
/**
 * Print Yield Review — web-app payload and Excel export
 * ------------------------------------------------------
 * getPrintDashboardData(filters) is called by getDashboardData() when the profile is print.
 * exportExcelPrint_() is called by exportExcel() likewise.
 */

/** Filter definitions for the print profile: UI key → Data column. */
function printFilterDefs_() {
  return [
    { key: 'region', col: 'Region', label: 'Market' }, { key: 'year', col: 'Period', label: 'Year', prefix: true }, { key: 'period', col: 'Period', label: 'Month' },
    { key: 'book', col: 'Book', label: 'Book' }, { key: 'brand', col: 'Niche', label: 'Brand' }, { key: 'group', col: 'Page Cat Group', label: 'Page category' },
    { key: 'pageCat', col: 'Page Cat', label: 'Page Cat (Path 5)' }, { key: 'adSize', col: 'Fee Type', label: 'Ad size' }, { key: 'issue', col: 'Issue Label', label: 'Issue' },
    { key: 'ioStatus', col: 'IO Status', label: 'IO status' }, { key: 'billingStatus', col: 'Billing Status', label: 'Billing' }, { key: 'rep', col: 'Sales Rep', label: 'Sales rep' },
    { key: 'client', col: 'Client Name', label: 'Client' }, { key: 'platform', col: '(Drop) WD Platform', label: 'WD Platform' },
  ];
}

/** Resolves the IO Status default: undefined/null → Settings default (if present in the data); '' → all. */
function resolvePrintFilters_(filters, ioValues) {
  const f = Object.assign({}, filters || {});
  const cfg = getConfig();
  if (f.ioStatus === undefined || f.ioStatus === null) f.ioStatus = (cfg.defaultIoStatus && ioValues.some(v => v.toLowerCase() === cfg.defaultIoStatus.toLowerCase())) ? ioValues.find(v => v.toLowerCase() === cfg.defaultIoStatus.toLowerCase()) : '';
  return f;
}

/** Rows that pass every print filter. */
function applyPrintFilters_(headers, rows, f) {
  const defs = printFilterDefs_().map(d => Object.assign({ i: headers.indexOf(d.col) }, d)).filter(d => f[d.key] && d.i >= 0);
  if (!defs.length) return rows;
  const s = v => (v === null || v === undefined) ? '' : String(v);
  return rows.filter(row => defs.every(d => d.prefix ? s(row[d.i]).startsWith(f[d.key]) : s(row[d.i]) === f[d.key]));
}

function r2(x) { return Math.round((x || 0) * 100) / 100; }
function r3(x) { return Math.round((x || 0) * 1000) / 1000; }
/** Rounded copy of a bucket for the browser payload. */
function slimB_(B) { return { k: r2(B.k), g: r2(B.g), rc: r2(B.rc), rce: r2(B.rce), arc: r2(B.arc), arce: r2(B.arce), pg: r3(B.pg), n: B.n, ins: B.ins, b: r2(B.b), hs: B.hs, neg: B.neg, kp: r2(B.kp || 0), comm: r2(B.comm || 0), contr: r2(B.contr || 0), cli: r2(B.cli || 0), tier: r2(B.tier || 0) }; }

function getPrintDashboardData(filters) {
  const cfg = getConfig();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CFG.SHEETS.DATA);
  if (!sh || sh.getLastRow() < 2) return { empty: true, profile: 'print', meta: {} };
  const rc = readColumns_(sh, webColumns_());
  const headers = rc.headers, all = rc.rows;
  const idx = n => headers.indexOf(n), s = v => (v === null || v === undefined) ? '' : String(v);
  const iIO = idx('IO Status'), iReg = idx('Region');
  const ioValues = Array.from(new Set(all.map(r => s(r[iIO])).filter(Boolean))).sort();
  const f = resolvePrintFilters_(filters, ioValues);

  const ctx = currencyContext_(headers, f);
  const H = ctx.convHeaders;
  // options: from rows in the selected market (all markets when none)
  const inRegion = f.region ? all.filter(r => s(r[iReg]) === f.region) : all;
  const options = {};
  printFilterDefs_().forEach(d => {
    const i = idx(d.col); if (i < 0) { options[d.key] = []; return; }
    const src = d.key === 'region' ? all : inRegion;
    let vals = Array.from(new Set(src.map(r => s(r[i])).filter(Boolean))).sort();
    if (d.key === 'year') vals = Array.from(new Set(vals.filter(p => /^\d{4}-\d{2}$/.test(p)).map(p => p.slice(0, 4)))).sort();
    if (d.key === 'period') vals = vals.filter(p => /^\d{4}-\d{2}$/.test(p) && (!f.year || p.startsWith(f.year)));
    options[d.key] = vals;
  });

  const kept = ctx.convRows(applyPrintFilters_(headers, all, f));
  const fNoRegion = Object.assign({}, f, { region: '' });
  const keptAnyRegion = ctx.convRows(applyPrintFilters_(headers, all, fNoRegion));
  const A = aggregatePrint_(H, kept, 1, {});
  const AR = aggregatePrint_(H, keptAnyRegion, 1, { noTree: true });   // for the market cards when one market is selected
  const noPeriodRows = kept.filter(r => !s(r[idx('Period')])).length;
  const list = (o, n) => bucketList_(o, n).map(x => Object.assign({ name: x.name }, slimB_(x)));
  const nested = o => Object.keys(o).reduce((out, k) => { out[k] = slimB_(o[k]); return out; }, {});
  const nested2 = o => Object.keys(o).reduce((out, k) => { out[k] = nested(o[k]); return out; }, {});
  const yt = flattenYieldTree_(A.tree, PRINT.YIELD_LEAF_CAP);
  // compact rows for the browser: [level, label, k, g, rc, rce, arc, arce, pg, n, ins, isLeaf]
  const ytRows = yt.rows.map(r => [r.level, r.label, r2(r.B.k), r2(r.B.g), r2(r.B.rc), r2(r.B.rce), r2(r.B.arc), r2(r.B.arce), r3(r.B.pg), r.B.n, r.B.ins, r.isLeaf ? 1 : 0]);

  return {
    profile: 'print', empty: A.total.n === 0 && A.houseAds.n === 0,
    title: profile_().title, kpiName: moneyCol_(H, cfg.kpiCol), currency: ctx.marketCur, reportingCurrency: cfg.reportingCurrency, currencies: fxCurrencies_(),
    logo: /^data:image\//.test(cfg.logo || '') ? cfg.logo : '', billedStatuses: cfg.billedStatuses, traffic: trafficSummary_(), numberFormat: cfg.numberFormat,
    basis: cfg.yieldBasis, bases: PRINT.BASES, basisShort: PRINT.BASIS_SHORT, houseExclude: cfg.houseExclude, grossIncludesCommission: cfg.grossIncludesCommission,
    applied: { ioStatus: f.ioStatus }, filterDefs: printFilterDefs_().map(d => ({ key: d.key, label: d.label })),
    meta: {
      runDate: A.runDate ? Utilities.formatDate(A.runDate, Session.getScriptTimeZone(), 'd MMM yyyy') : '',
      runPeriod: A.runDate ? `${A.runDate.getFullYear()}-${String(A.runDate.getMonth() + 1).padStart(2, '0')}` : '',
      rows: kept.length, campaigns: A.campaigns.size, clients: A.clients.size, drops: A.drops.size, noPeriodRows,
      generated: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'd MMM yyyy HH:mm'),
    },
    totals: slimB_(A.total), houseAds: slimB_(A.houseAds),
    months: Object.keys(A.byMonth).filter(p => /^\d{4}-\d{2}$/.test(p)).sort().map(p => ({ period: p, B: slimB_(A.byMonth[p]), byRegion: nested(A.byMonthRegion[p] || {}) })),
    regions: Object.keys(AR.byRegion).sort((a, b) => AR.byRegion[b].k - AR.byRegion[a].k),
    byRegion: list(AR.byRegion), byRegionSel: list(A.byRegion), byBrand: list(A.byBrand), byBook: list(A.byBook), byGroup: list(A.byGroup), byPageCat: list(A.byPageCat, 60), byAdSize: list(A.byAdSize), byPrintPage: list(A.byPrintPage, 40),
    byIssue: list(A.byIssue, 60), byClient: list(A.byClient, 15), byAgency: list(A.byAgency, 12), byRep: list(A.byRep, 15), byIO: list(A.byIO), byBilling: list(A.byBilling), byRcType: list(A.byRcType), byPlatform: list(A.byPlatform), byTerm: list(A.byTerm),
    regionBrand: nested(AR.byRegionBrand), regionGroup: nested(AR.byRegionGroup), regionBrandGroup: nested(AR.byRegionBrandGroup), brandGroup: nested(A.byBrandGroup),
    brandMonth: nested2(A.brandMonth), groupMonth: nested2(A.groupMonth), regionIssue: nested2(AR.byRegionIssue),
    yieldTable: { dims: A.dims, rows: ytRows, leaves: yt.leaves, capped: !!yt.capped, cap: PRINT.YIELD_LEAF_CAP },
    periods: slimPeriods_(periodComparisons_(A.byMonth, A.runDate ? `${A.runDate.getFullYear()}-${String(A.runDate.getMonth() + 1).padStart(2, '0')}` : '')),
    topCampaigns: Object.values(A.byCampaign).sort((a, b) => b.B.k - a.B.k).slice(0, 25).map(c => Object.assign({}, c, { B: slimB_(c.B) })),
    checks: A.checks, unclassified: A.unclassified, method: methodLines_(cfg),
    review: roundReview_(computeReviewPivot_(H, excludeHouseAds_(H, kept))),
    options,
  };
}

/** Rounded period comparisons for the browser. */
function slimPeriods_(pc) {
  const sb = B => B ? slimB_(B) : null;
  return { runPeriod: pc.runPeriod,
    months: pc.months.map(m => ({ period: m.period, B: sb(m.B), prev: sb(m.prev), yoy: sb(m.yoy) })),
    quarters: pc.quarters.map(q => ({ q: q.q, months: q.months, B: sb(q.B), prev: sb(q.prev), yoy: sb(q.yoy) })),
    years: pc.years.map(y => ({ y: y.y, months: y.months, B: sb(y.B), prev: sb(y.prev), ytdPrev: sb(y.ytdPrev) })) };
}

/** Rounds pivot cells to cents so the payload stays small. */
function roundReview_(pv) {
  const rnd = o => { Object.keys(o).forEach(k => { o[k] = r2(o[k]); }); return o; };
  let n = 0; pv.totalRows = pv.groups.reduce((a, g) => a + g.rows.length, 0);
  pv.groups.forEach(g => { g.rows = g.rows.filter(() => n++ < PRINT.REVIEW_ROW_CAP); g.rows.forEach(r => { rnd(r.cells); r.total = r2(r.total); delete r.job; delete r.drop; delete r.fee; delete r.campaign; }); rnd(g.subtotal); g.subtotalTotal = r2(g.subtotalTotal); });
  pv.capped = pv.totalRows > PRINT.REVIEW_ROW_CAP; pv.cap = PRINT.REVIEW_ROW_CAP;
  rnd(pv.grand); pv.grandTotal = r2(pv.grandTotal);
  return pv;
}

/* ------------------------------------------------------------------ */
/* Excel                                                               */
/* ------------------------------------------------------------------ */

function exportExcelPrint_(master, data, filters, who, cfg) {
  const values = data.getRange(1, 1, dataRowCount_(data) + 1, data.getLastColumn()).getValues();
  const headers = values[0];
  const s = v => (v === null || v === undefined) ? '' : String(v);
  const iIO = headers.indexOf('IO Status');
  const f = resolvePrintFilters_(filters, Array.from(new Set(values.slice(1).map(r => s(r[iIO])).filter(Boolean))));
  const basis = ['gross', 'ratecard', 'adjratecard'].includes(f.yieldBasis) ? f.yieldBasis : cfg.yieldBasis;
  const ctx = currencyContext_(headers, f);
  const kept = ctx.convRows(applyPrintFilters_(headers, values.slice(1), f));
  if (!kept.length) throw new Error('No rows match the current filters.');
  // brand-family benchmark: the same filters without the Market filter, so a brand is compared with itself across all markets
  const H = ctx.convHeaders, cur = ctx.marketCur;
  const famTot = f.region ? computeRegionSplit_(H, ctx.convRows(applyPrintFilters_(headers, values.slice(1), Object.assign({}, f, { region: '' })))).totals : null;   // brand family across ALL markets even when a market is filtered
  const split = computeRegionSplit_(H, kept);
  const A = aggregatePrint_(H, kept, 1, {});
  const T = split.totals, B = T.P;
  const review = computeReviewPivot_(H, excludeHouseAds_(H, kept));
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HHmm');
  const scope = Object.keys(f).filter(k => f[k] && k !== 'currency' && k !== 'yieldBasis').map(k => `${k}=${f[k]}`).join(', ') || 'all';
  const bl = yieldBasisLabel_(basis);

  const ss = SpreadsheetApp.create(`${XLS.TMP_PREFIX}${stamp}`);
  const first = ss.getSheets()[0];
  let sh, row;

  // Summary
  sh = ss.insertSheet('Summary'); resetSheet_(sh); sh.setColumnWidth(1, 320); sh.setColumnWidths(2, 6, 140);
  row = 1;
  sh.getRange(row, 1).setValue(profile_().title).setFontSize(18).setFontWeight('bold'); row++;
  sh.getRange(row, 1).setValue(`Exported ${stamp} · filters: ${scope} · all figures in ${cur} · yield basis: ${PRINT.BASES[basis]}${cfg.creditLine ? ' · ' + cfg.creditLine : ''}`).setFontColor('#5f6b63').setFontStyle('italic'); row += 2;
  const y = yieldOf_(B, basis);
  const kp = [
    ['Adjusted earned blended revenue', B.k], ['Earned on drops with a rate card (priced)', B.kp], ['Priced coverage (share of earned)', B.k ? B.kp / B.k : 0], ['Gross earned blended revenue', B.g], [`Yield ${bl}`, y], ['Discount vs basis', 1 - y],
    ['Yield vs current rate card', yieldOf_(B, 'ratecard')], ['Yield vs adjusted rate card', yieldOf_(B, 'adjratecard')],
    ['Current rate card (sum, as exported)', B.rc], ['Adjusted rate card (sum, as exported)', B.arc], ['Billed revenue', B.b],
    ['Pages', B.pg], ['Revenue per page', B.pg ? B.k / B.pg : 0], ['Drops', B.n], ['Inserts', B.ins], ['Drops priced below adjusted rate card', B.neg],
    ['Campaigns', T.campaigns], ['Clients', T.clients], ['Markets', split.regions.length], ['Line items', kept.length], ['House-ad lines excluded', cfg.houseExclude ? T.houseAds.n : 0],
  ];
  row = writeBlock_(sh, row, 'Key figures', ['Metric', 'Value'], kp, {});
  const fmts = [moneyFmt_(), moneyFmt_(), '0.0%', moneyFmt_(), '0.0%', '0.0%', '0.0%', '0.0%', moneyFmt_(), moneyFmt_(), moneyFmt_(), '#,##0.0', moneyFmt_(), '#,##0', '#,##0', '#,##0', '#,##0', '#,##0', '#,##0', '#,##0', '#,##0'];
  kp.forEach((k, i) => sh.getRange(row - kp.length - 2 + i, 2).setNumberFormat(fmts[i]));
  const br = [['Rate card (earned basis)', B.rce, 1], ['− Policy tiers (rate-card adjustment, Special)', -B.tier, B.rce ? B.tier / B.rce : 0], ['= Gross (tier price)', B.g, B.rce ? B.g / B.rce : 0], ['− Contract discounts', -B.contr, B.rce ? B.contr / B.rce : 0], ['− Client discounts', -B.cli, B.rce ? B.cli / B.rce : 0], ['− Agency commission', -B.comm, B.rce ? B.comm / B.rce : 0], ['= Structured net (AdjustedRateCard)', B.g - B.contr - B.cli - B.comm, B.rce ? (B.g - B.contr - B.cli - B.comm) / B.rce : 0], ['± Off-card change (actual price vs structure)', B.kp - (B.g - B.contr - B.cli - B.comm), B.rce ? (B.kp - (B.g - B.contr - B.cli - B.comm)) / B.rce : 0], ['= Net earned on priced drops', B.kp, B.rce ? B.kp / B.rce : 0], ['+ Earned on drops without a rate card', B.k - B.kp, 0], ['= Net earned', B.k, 0]];
  row = writeBlock_(sh, row, 'The money bridge', ['Step', cur, '% of rate card'], br, { money: [2], pct: [3] });
  const bands = Object.keys(A.byBand || {}).sort((a, b) => parseFloat(a) - parseFloat(b));
  if (bands.length) row = writeBlock_(sh, row, 'Discount depth (1 − net ÷ gross per drop)', ['Band', 'Drops', 'Pages', 'Net', 'Share of net', `Yield ${bl}`, 'Revenue / page'], bands.map(k => { const Bb = A.byBand[k]; return [k, Bb.n, Bb.pg, Bb.k, B.k ? Bb.k / B.k : 0, yieldOf_(Bb, basis), Bb.pg ? Bb.k / Bb.pg : 0]; }), { money: [4, 7], pct: [5, 6], int: [2] });
  row = writeBlock_(sh, row, 'How the numbers are built (Method)', ['Term', 'Definition'], methodLines_(cfg), {});
  sh.getRange(row - methodLines_(cfg).length - 2, 2, methodLines_(cfg).length, 1).setWrap(true); sh.setColumnWidth(2, 700);

  // Monthly
  sh = ss.insertSheet('Monthly'); resetSheet_(sh); sh.setColumnWidth(1, 120); sh.setColumnWidths(2, 8, 140);
  const P = split.periods;
  const mrows = P.map((p, i) => { const M = T.byPeriodB[p] || newBucket_(), prev = i ? (T.byPeriodB[P[i - 1]] || newBucket_()).k : 0; return [split.monthName(p), M.k, M.g, yieldOf_(M, basis), M.pg, M.pg ? M.k / M.pg : 0, M.n, prev ? (M.k - prev) / prev : '']; });
  mrows.push(['Total', B.k, B.g, y, B.pg, B.pg ? B.k / B.pg : 0, B.n, '']);
  writeBlock_(sh, 1, `By month — ${cur}`, ['Month', 'Earned', 'Gross earned', `Yield ${bl}`, 'Pages', 'Revenue / page', 'Drops', 'vs prior month'], mrows, { money: [2, 3, 6], pct: [4, 8], int: [7], totalRow: true });

  // Periods: MoM / QoQ / YoY
  sh = ss.insertSheet('Periods'); resetSheet_(sh); sh.setColumnWidth(1, 140); sh.setColumnWidths(2, 12, 125);
  row = writePeriodBlocks_(sh, 1, periodComparisons_(A.byMonth, A.runDate ? `${A.runDate.getFullYear()}-${String(A.runDate.getMonth() + 1).padStart(2, '0')}` : ''), basis, cur);

  // Markets
  sh = ss.insertSheet('Markets'); resetSheet_(sh); sh.setColumnWidth(1, 160); sh.setColumnWidths(2, 14, 125);
  const groups = Object.keys(T.byGroupB).sort((a, b) => T.byGroupB[b].pg - T.byGroupB[a].pg), N = split.niches;
  row = writeBlock_(sh, 1, `Yield by market — ${cur}`, MARKET_YIELD_HEAD_(basis), marketYieldRows_(split, basis), MARKET_YIELD_FMT_);
  const rows2 = split.regions.map(r => [r.name, ...P.map(p => (r.byPeriodB[p] || {}).k || 0), r.P.k]); rows2.push(['Total', ...P.map(p => (T.byPeriodB[p] || {}).k || 0), B.k]);
  row = writeBlock_(sh, row, 'Market × month — earned', ['Market', ...P.map(split.monthName), 'Total'], rows2, { money: range_(2, P.length + 2), totalRow: true });
  const rows3 = split.regions.map(r => [r.name, ...N.map(k => (r.byBrandB[k] || {}).k || 0), r.P.k]); rows3.push(['Total', ...N.map(k => (T.byBrandB[k] || {}).k || 0), B.k]);
  row = writeBlock_(sh, row, 'Market × brand — earned', ['Market', ...N, 'Total'], rows3, { money: range_(2, N.length + 2), totalRow: true });
  const rows3b = split.regions.map(r => [r.name, ...N.map(k => r.byBrandB[k] ? yieldOf_(r.byBrandB[k], basis) : ''), yieldOf_(r.P, basis)]); rows3b.push(['All', ...N.map(k => T.byBrandB[k] ? yieldOf_(T.byBrandB[k], basis) : ''), y]);
  writeBlock_(sh, row, `Market × brand — yield ${bl}`, ['Market', ...N, 'All'], rows3b, { pct: range_(2, N.length + 2), totalRow: true });

  // Focus
  sh = ss.insertSheet('Focus'); resetSheet_(sh); sh.setColumnWidth(1, 150); sh.setColumnWidth(2, 180); sh.setColumnWidth(3, 170); sh.setColumnWidths(4, 10, 130);
  const focus = focusList_(A, basis, 25);
  const fRow = x => [x.region, x.brand, x.group, x.pages, x.drops, x.earned, x.yield, x.marketYield, x.gap, x.revPerPage];
  const fHead = ['Market', 'Brand', 'Page category', 'Pages', 'Drops', 'Earned', `Cell yield ${bl}`, 'Market yield', 'Gap vs market yield', 'Revenue / page'];
  row = writeBlock_(sh, 1, 'Below market yield — where to focus (ranked by recoverable revenue)', fHead, focus.below.length ? focus.below.map(fRow) : [['— none —', '', '', '', '', '', '', '', '', '']], { money: [6, 9, 10], pct: [7, 8], int: [4, 5] });
  row = writeBlock_(sh, row, 'Above market yield — where it works (ranked)', fHead, focus.above.length ? focus.above.map(fRow) : [['— none —', '', '', '', '', '', '', '', '', '']], { money: [6, 9, 10], pct: [7, 8], int: [4, 5] });
  const cells = Object.keys(A.byRegionBrandGroup).sort((a, b) => A.byRegionBrandGroup[b].pg - A.byRegionBrandGroup[a].pg).map(k => { const [r, b, g] = k.split('|'); const C = A.byRegionBrandGroup[k]; const R = A.byRegion[r]; return [r, b, g, C.pg, C.n, C.k, C.g, yieldOf_(C, basis), R ? yieldOf_(R, basis) : '', R ? (yieldOf_(R, basis) - yieldOf_(C, basis)) * denomOf_(C, basis) : '', C.pg ? C.k / C.pg : 0, R && R.pg ? C.pg / R.pg : 0]; });
  writeBlock_(sh, row, 'All market × brand × page-category cells', ['Market', 'Brand', 'Page category', 'Pages', 'Drops', 'Earned', 'Gross earned', `Yield ${bl}`, 'Market yield', 'Gap', 'Revenue / page', 'Page share in market'], cells, { money: [6, 7, 10, 11], pct: [8, 9, 12], int: [4, 5] });

  // Page categories
  sh = ss.insertSheet('Page categories'); resetSheet_(sh); sh.setColumnWidth(1, 200); sh.setColumnWidths(2, 14, 125);
  row = writeBlock_(sh, 1, 'Page category groups — all markets', BUCKET_HEAD_('Page category', basis), bucketRows_(T.byGroupB, B, basis), BUCKET_FMT_);
  row = writeBlock_(sh, row, `Market × page category — yield ${bl}`, ['Market', ...groups, 'All'], regionGroupMatrix_(split, groups, basis, 'yield'), { pct: range_(2, groups.length + 2), totalRow: true });
  row = writeBlock_(sh, row, 'Market × page category — pages', ['Market', ...groups, 'All'], regionGroupMatrix_(split, groups, basis, 'pages'), { int: range_(2, groups.length + 2), totalRow: true });
  row = writeBlock_(sh, row, 'Market × page category — page share', ['Market', ...groups, 'All'], regionGroupMatrix_(split, groups, basis, 'share'), { pct: range_(2, groups.length + 2), totalRow: true });
  row = writeBlock_(sh, row, 'Page Cat (Path 5, raw)', BUCKET_HEAD_('Page Cat', basis), bucketRows_(A.byPageCat, B, basis), BUCKET_FMT_);
  writeBlock_(sh, row, 'Print Page (AdBook placement, validation)', BUCKET_HEAD_('Print Page', basis), bucketRows_(A.byPrintPage, B, basis), BUCKET_FMT_);

  // Brands, Ad sizes, Books, Issues
  sh = ss.insertSheet('Brands'); resetSheet_(sh); sh.setColumnWidth(1, 220); sh.setColumnWidths(2, 14, 125);
  row = writeBlock_(sh, 1, 'Brands — all markets', BUCKET_HEAD_('Brand', basis), bucketRows_(T.byBrandB, B, basis), BUCKET_FMT_);
  const bgRows = N.map(b => [b, ...groups.map(g => T.byBrandGroupB[`${b}|${g}`] ? yieldOf_(T.byBrandGroupB[`${b}|${g}`], basis) : ''), T.byBrandB[b] ? yieldOf_(T.byBrandB[b], basis) : '']);
  row = writeBlock_(sh, row, `Brand × page category — yield ${bl}`, ['Brand', ...groups, 'All'], bgRows, { pct: range_(2, groups.length + 2) });
  const bgP = N.map(b => [b, ...groups.map(g => T.byBrandGroupB[`${b}|${g}`] ? T.byBrandGroupB[`${b}|${g}`].pg : ''), T.byBrandB[b] ? T.byBrandB[b].pg : '']);
  writeBlock_(sh, row, 'Brand × page category — pages', ['Brand', ...groups, 'All'], bgP, { int: range_(2, groups.length + 2) });
  sh = ss.insertSheet('Ad sizes & books'); resetSheet_(sh); sh.setColumnWidth(1, 220); sh.setColumnWidths(2, 10, 125);
  row = writeBlock_(sh, 1, 'Ad sizes', BUCKET_HEAD_('Ad size', basis), bucketRows_(T.byAdSizeB, B, basis), BUCKET_FMT_);
  row = writeBlock_(sh, row, 'Books (Path 4)', BUCKET_HEAD_('Book', basis), bucketRows_(T.byBookB, B, basis), BUCKET_FMT_);
  row = writeBlock_(sh, row, 'Issues', BUCKET_HEAD_('Issue', basis), bucketRows_(A.byIssue, B, basis), BUCKET_FMT_);
  writeBlock_(sh, row, 'Rate card price types', BUCKET_HEAD_('Price type', basis), bucketRows_(A.byRcType, B, basis), BUCKET_FMT_);

  // Yield table
  sh = ss.insertSheet('Yield table'); resetSheet_(sh); sh.setColumnWidth(1, 420); sh.setColumnWidths(2, 16, 118);
  const yt = yieldTableRows_(A.tree, basis, 20000, A.byRegion, (famTot || T).byFamilyB, (famTot || T).byFamilyPathB);
  writeBlock_(sh, 1, `Yield table — ${A.dims.join(' › ')} · ${YIELD_TABLE_NOTE_}${yt.capped ? ` (first 20 000 of ${yt.leaves} detail rows)` : ''}`, YIELD_TABLE_HEAD_(A.dims, basis), yt.rows, YIELD_TABLE_FMT_);
  sh.setFrozenRows(2);

  // Review pivot
  sh = ss.insertSheet('Review'); resetSheet_(sh);
  writeReviewTable_(sh, review, 1, { freeze: true, title: `Sum of ${review.measure} — ${scope}` });

  // Top campaigns
  sh = ss.insertSheet('Top campaigns'); resetSheet_(sh); sh.setColumnWidth(1, 90).setColumnWidth(2, 300).setColumnWidth(3, 180); sh.setColumnWidths(4, 8, 130);
  const camp = Object.values(A.byCampaign).sort((a, b) => b.B.k - a.B.k).map(c => [c.id, c.name, c.client, c.region, c.brand, c.rep, c.io, c.B.k, c.B.g, yieldOf_(c.B, basis), c.B.pg, c.B.n]);
  writeBlock_(sh, 1, 'Campaigns by earned revenue', ['Campaign ID', 'Campaign', 'Client', 'Market', 'Brand', 'Sales rep', 'IO status', 'Earned', 'Gross earned', `Yield ${bl}`, 'Pages', 'Drops'], camp, { money: [8, 9], pct: [10], int: [12] });

  // Detail
  sh = ss.insertSheet('Detail'); resetSheet_(sh);
  const cols = ['Region', 'Period', 'Issue Label', 'IO Status', 'Billing Status', 'Drop ID', 'Campaign ID', 'Campaign Name', 'Client Name', 'Agency Name', 'Sales Rep', 'Niche', 'Book', 'Page Cat', 'Page Cat Group', 'Commercial Term', 'Qualifier',
    'Fee Type', CFG.PRINT_PAGE_COL, 'Pages', CFG.ACTUAL_SPACE_COL, 'Space Check', 'Insert', 'Earned Fraction', 'Position Path', 'FX Currency', 'FX Rate',
    moneyCol_(H, 'Adjusted Earned Blended Revenue'), moneyCol_(H, 'Gross Earned Blended Revenue'), moneyCol_(H, 'Current Rate Card Price'), moneyCol_(H, '(Drop) Adjusted Rate Card'), moneyCol_(H, 'Price'), moneyCol_(H, CFG.BILLED_COL)];
  const ci = cols.map(c => H.indexOf(c));
  const det = kept.map(r => ci.map(i => i >= 0 ? r[i] : ''));
  const labels = cols.map(c => c === 'Niche' ? 'Brand' : c === 'Fee Type' ? 'Ad size' : c);
  writeBlock_(sh, 1, `Line items — ${det.length} rows`, labels, det, { money: [28, 29, 30, 31, 32, 33] });
  sh.setFrozenRows(2); sh.setColumnWidths(1, cols.length, 130); sh.setColumnWidth(8, 280); sh.setColumnWidth(25, 360);

  // Changes
  const ch = computeChanges_(master, f.region || '', ctx.factor, ctx.marketCur);
  sh = ss.insertSheet('Changes'); resetSheet_(sh);
  if (ch) writeChangesBlocks_(sh, ch, 1, { scope: f.region ? `market ${f.region}` : 'all markets', cap: 100000 });
  else { sh.getRange(1, 1).setValue('Changes since previous import').setFontSize(16).setFontWeight('bold'); sh.getRange(2, 1).setValue('No previous import to compare with.').setFontColor('#5f6b63'); }

  ss.deleteSheet(first);
  ss.setActiveSheet(ss.getSheetByName('Summary')); ss.moveActiveSheet(1);
  SpreadsheetApp.flush();
  const url = `https://docs.google.com/spreadsheets/d/${ss.getId()}/export?format=xlsx`;
  const resp = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpErrors: true });
  try { DriveApp.getFileById(ss.getId()).setTrashed(true); } catch (e) {}
  if (resp.getResponseCode() !== 200) throw new Error('Export failed (' + resp.getResponseCode() + ').');
  const name = `${profile_().title} ${stamp}${f.region ? ' – ' + f.region : ''} – yield ${bl.replace('vs ', 'vs ')}.xlsx`;
  logAccess_(who, 'download', scope);
  return { name, base64: Utilities.base64Encode(resp.getContent()) };
}

/* ===================== PrintCube ===================== */
/**
 * Print Yield Review — pre-computed cube for the web page
 * --------------------------------------------------------
 * The leadership page never reads the Data tab. At every import / rebuild the master aggregates Data into a
 * compact cube (one bucket per platform × IO status × market × brand × Path 2 × book × Page Cat × group × month)
 * and stores it as JSON in a hidden tab. The page loads the cube in a couple of seconds and every filter,
 * the yield basis and the currency switch work on it in the browser. Row-level detail (Position Path ›
 * Campaign ID) is stored separately and fetched only when a Page Cat row of the yield table is expanded.
 */

const CUBE = { SHEET: 'Web Cube', LEAVES_SHEET: 'Web Leaves', ACCOUNTS_SHEET: 'Web Accounts', ACC_DIMS: ['io', 'region', 'brand', 'channel', 'client', 'agency', 'year', 'group'], CHUNK: 45000, DIMS: ['platform', 'io', 'region', 'brand', 'path2', 'book', 'pageCat', 'group', 'period', 'band', 'channel'] };

/** Writes a JSON string into a hidden tab as 45k-character chunks (one per cell, column A). */
function writeJsonSheet_(ss, name, json) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  sh.clearContents();
  const chunks = [];
  for (let i = 0; i < json.length; i += CUBE.CHUNK) chunks.push([json.slice(i, i + CUBE.CHUNK)]);
  if (!chunks.length) chunks.push(['']);
  ensureRows_(sh, chunks.length + 1);
  sh.getRange(1, 1, chunks.length, 1).setNumberFormat('@').setValues(chunks);
  sh.hideSheet();
  return chunks.length;
}
function readJsonSheet_(ss, name) {
  const sh = ss.getSheetByName(name);
  if (!sh || sh.getLastRow() < 1) return '';
  return sh.getRange(1, 1, sh.getLastRow(), 1).getValues().map(r => String(r[0] || '')).join('');
}

/** Builds and stores the cube + leaves from the Data tab (master only). Called at the end of buildDashboardFor_. */
function buildPrintCube_(ss) {
  const cfg = getConfig();
  const all = allData_(ss);
  const headers = all.headers, rows = all.rows;
  const I = printIdx_(headers);
  const idx = c => headers.indexOf(c);
  const iPath = idx(CFG.REGION_SOURCE_COL), iCamp = idx('Campaign ID'), iPlat = idx('(Drop) WD Platform'), iP2 = idx('Path 2'), iRun = idx('Report Run Date');
  const s = v => (v === null || v === undefined) ? '' : String(v);
  const cube = {}, leaves = {}, house = newBucket_(), acc = {};
  const iClient = idx('Client Name'), iAgency = idx('Agency Name');
  let runDate = null; const ioValues = new Set(), currencies = new Set(); const iFxCur = idx('FX Currency');
  const famCount = {};   // brand → { family: count } → dominant family per brand (meta.brandFamily)
  for (const row of rows) {
    const v = rowBucket_(row, I, 1);                      // converted (reporting-currency) twins via moneyCol_
    const rd = iRun >= 0 ? row[iRun] : null; if (rd instanceof Date && (!runDate || rd > runDate)) runDate = rd;
    const io = s(row[I.io]); ioValues.add(io); if (iFxCur >= 0 && row[iFxCur]) currencies.add(String(row[iFxCur]).toUpperCase());
    if (I.family >= 0) { const bn = s(row[I.brand]) || '(blank)', fm = s(row[I.family]) || bn; const o = famCount[bn] || (famCount[bn] = {}); o[fm] = (o[fm] || 0) + 1; }
    if (v.hs && cfg.houseExclude) { addBucket_(house, v); continue; }
    const key = [s(row[iPlat]) || '(blank)', io || '(blank)', s(row[I.region]) || CFG.REGION_FALLBACK, s(row[I.brand]) || '(blank)', s(row[iP2]) || '(blank)', s(row[I.book]) || '(blank)', s(row[I.pageCat]) || CFG.PAGECAT_DEFAULT, s(row[I.group]) || CFG.PAGECAT_UNCLASSIFIED, s(row[I.period]) || '', s(row[I.band]) || PRINT.NO_RATE_CARD, s(row[I.channel]) || 'Direct'].join('\u0001');
    addBucket_(cube[key] || (cube[key] = newBucket_()), v);
    // accounts cube: who gets the discount (advertiser × agency), per market / brand / channel / year / page-cat group
    const ak = [io || '(blank)', s(row[I.region]) || CFG.REGION_FALLBACK, s(row[I.brand]) || '(blank)', s(row[I.channel]) || 'Direct', s(row[iClient]) || '(blank)', s(row[iAgency]) || cfg.blankAgency, String(s(row[I.period])).slice(0, 4), s(row[I.group]) || CFG.PAGECAT_UNCLASSIFIED].join('\u0001');
    addBucket_(acc[ak] || (acc[ak] = newBucket_()), v);
    // leaves: Position Path › Campaign ID under the Page Cat node, per IO status and month
    const kp = key.split('\u0001'); const lk = [kp[0], kp[2], kp[3], kp[4], kp[5], kp[6]].join('\u0001');
    const lkey = `${s(row[iPath])}\u0001${s(row[iCamp]) || '(blank)'}\u0001${s(row[I.period])}\u0001${io}`;
    const L = leaves[lk] || (leaves[lk] = {});
    addBucket_(L[lkey] || (L[lkey] = newBucket_()), v);
  }
  const pack = B => [r2(B.k), r2(B.g), r2(B.rc), r2(B.rce), r2(B.arc), r2(B.arce), r3(B.pg), B.n, B.ins, r2(B.b), B.neg, r2(B.comm), r2(B.contr), r2(B.cli), r2(B.tier), r2(B.kp), r3(B.pgp)];
  // dictionary-encode the dimension values (strings repeat on every cell): rows carry indexes, meta.dict the values
  const dict = CUBE.DIMS.map(() => []), dictIx = CUBE.DIMS.map(() => ({}));
  const enc = (d, v) => { if (dictIx[d][v] === undefined) { dictIx[d][v] = dict[d].length; dict[d].push(v); } return dictIx[d][v]; };
  const rowsOut = Object.keys(cube).map(k => k.split('\u0001').map((v, d) => enc(d, v)).concat(pack(cube[k])));
  const fx = {}; fxCurrencies_().forEach(c => { fx[c] = fxRate_(c); });
  const meta = {
    built: new Date().toISOString(), runDate: runDate ? Utilities.formatDate(runDate, Session.getScriptTimeZone(), 'd MMM yyyy') : '',
    runPeriod: runDate ? `${runDate.getFullYear()}-${String(runDate.getMonth() + 1).padStart(2, '0')}` : '',
    rows: rows.length, reportingCurrency: cfg.reportingCurrency, fx, basis: cfg.yieldBasis, bases: PRINT.BASES, basisShort: PRINT.BASIS_SHORT,
    defaultIo: cfg.defaultIoStatus, marketCurrencies: cfg.marketCurrencies, houseExclude: cfg.houseExclude, grossIncludesCommission: cfg.grossIncludesCommission, houseAds: pack(house), policyTiers: cfg.policyTiers,
    currencies: Array.from(currencies).sort(), dims: CUBE.DIMS, dict, fields: ['k', 'g', 'rc', 'rce', 'arc', 'arce', 'pg', 'n', 'ins', 'b', 'neg', 'comm', 'contr', 'cli', 'tier', 'kp', 'pgp'], bands: cfg.discountBands, brandName: cfg.brandName, method: methodLines_(cfg), yieldDims: reviewDims_().map(d => d.label),
    logo: /^data:image\//.test(cfg.logo || '') ? cfg.logo : '', numberFormat: cfg.numberFormat, title: profile_().title, billedStatuses: cfg.billedStatuses,
    brandFamily: Object.keys(famCount).reduce((o, bn) => { const f = famCount[bn]; o[bn] = Object.keys(f).sort((a, b) => f[b] - f[a])[0]; return o; }, {}),
  };
  const leavesOut = {}; Object.keys(leaves).forEach(k => { leavesOut[k] = Object.keys(leaves[k]).map(lk => lk.split('\u0001').concat(pack(leaves[k][lk]))); });
  const c1 = writeJsonSheet_(ss, CUBE.SHEET, JSON.stringify({ meta, rows: rowsOut }));
  const c2 = writeJsonSheet_(ss, CUBE.LEAVES_SHEET, JSON.stringify(leavesOut));
  const adict = CUBE.ACC_DIMS.map(() => []), adictIx = CUBE.ACC_DIMS.map(() => ({}));
  const aenc = (d, v) => { if (adictIx[d][v] === undefined) { adictIx[d][v] = adict[d].length; adict[d].push(v); } return adictIx[d][v]; };
  const accRows = Object.keys(acc).map(k => k.split('\u0001').map((v, d) => aenc(d, v)).concat(pack(acc[k])));
  writeJsonSheet_(ss, CUBE.ACCOUNTS_SHEET, JSON.stringify({ dims: CUBE.ACC_DIMS, dict: adict, fields: meta.fields, rows: accRows }));
  CacheService.getScriptCache().removeAll(['print_cube']);
  return { cells: rowsOut.length, chunks: c1 + c2 };
}

/** Cube meta (dict, currencies, run date) without parsing the rows — for Settings and status. */
function cubeMeta_(ss) {
  const json = readJsonSheet_(ss, CUBE.SHEET); if (!json) return null;
  try { const i = json.indexOf('"rows":'); return JSON.parse(json.slice(0, i).replace(/,\s*$/, '') + '}').meta; } catch (e) { try { return JSON.parse(json).meta; } catch (e2) { return null; } }
}

/** Web app: the cube as a JSON string (parsed in the browser). Traffic is logged by doGet. */
function getPrintCube() {
  const who = (Session.getActiveUser().getEmail() || '').toLowerCase();
  const cfg = getConfig();
  if (!isReviewer_(who, cfg)) throw new Error('Not authorised.');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let json = readJsonSheet_(ss, CUBE.SHEET);
  if (!json) { buildPrintCube_(ss); json = readJsonSheet_(ss, CUBE.SHEET); }
  const t = trafficSummary_();
  return json.replace(/^\{/, `{"traffic":${JSON.stringify(t)},`);
}

/** Web app: the accounts cube (advertiser × agency), loaded when the Accounts section is opened. */
function getAccountsCube() {
  const who = (Session.getActiveUser().getEmail() || '').toLowerCase();
  if (!isReviewer_(who, getConfig())) throw new Error('Not authorised.');
  return readJsonSheet_(SpreadsheetApp.getActiveSpreadsheet(), CUBE.ACCOUNTS_SHEET) || '';
}

/** Web app: Position Path › Campaign ID detail for one Page Cat node. nodeKey = platform|region|brand|path2|book|pageCat; each leaf = [positionPath, campaignId, period, io, ...fields]. */
function getYieldLeaves(nodeKey) {
  const who = (Session.getActiveUser().getEmail() || '').toLowerCase();
  if (!isReviewer_(who, getConfig())) throw new Error('Not authorised.');
  const json = readJsonSheet_(SpreadsheetApp.getActiveSpreadsheet(), CUBE.LEAVES_SHEET);
  if (!json) return [];
  const all = JSON.parse(json);
  return all[String(nodeKey).split('|').join('\u0001')] || [];
}

/* ===================== PrintBuild ===================== */
/**
 * Print Yield Review — short import + background build chain
 * ------------------------------------------------------------
 * The import run does only what the web page needs: parse → derive → Data (values, incl. currency twins)
 * → FX Rates → web cube → Import Log. Everything else (Pivots + Dashboard, Review, Regions, market tabs,
 * Changes, market files) runs afterwards as separate short executions driven by a trigger, one step per
 * run, each re-scheduling the next. No single execution comes near the Apps Script limit, and a step that
 * fails is logged and skipped rather than blocking the rest.
 */

const BUILD = { PROP: 'printBuild:queue', STATUS_PROP: 'printBuild:status', STEPS: ['pivots', 'review', 'regions', 'changes', 'marketfiles'] };

/** In-memory copy of the Data tab for the current execution (print profile; values, no formulas). */
let DATA_CACHE_ = null;

/** Currency twins as VALUES (print): rate per row and "<col> (CUR)" columns computed in JS from the FX matrix. */
function stampFxValues_(headers, rows, cfg) {
  const iCur = headers.indexOf('FX Currency'), iRate = headers.indexOf('FX Rate');
  const twins = fxDerivedColumns_().map(name => ({ ci: headers.indexOf(name), li: headers.indexOf(name.replace(/ \([A-Z]{3}\)$/, '')) })).filter(t => t.ci >= 0 && t.li >= 0);
  FX_CACHE_ = null;
  const rateOf = {};
  for (const r of rows) {
    const cur = String(r[iCur] || cfg.reportingCurrency).toUpperCase();
    const rate = rateOf[cur] !== undefined ? rateOf[cur] : (rateOf[cur] = fxRate_(cur));
    if (iRate >= 0) r[iRate] = rate;
    for (const t of twins) { const v = r[t.li]; r[t.ci] = (typeof v === 'number') ? v * rate : ''; }
  }
}

/** Re-stamps the twins from the current FX Rates tab (menu "Apply exchange rates" in the print profile). */
function restampFx_(ss) {
  const sh = ss.getSheetByName(CFG.SHEETS.DATA);
  const n = dataRowCount_(sh); if (!n) return;
  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  const iCur = headers.indexOf('FX Currency'), iRate = headers.indexOf('FX Rate');
  const twinIdx = fxDerivedColumns_().map(name => ({ ci: headers.indexOf(name), li: headers.indexOf(name.replace(/ \([A-Z]{3}\)$/, '')) })).filter(t => t.ci >= 0 && t.li >= 0);
  const need = Array.from(new Set([iCur, ...twinIdx.map(t => t.li)])).filter(i => i >= 0);
  const cols = {}; need.forEach(i => { cols[i] = sh.getRange(2, i + 1, n, 1).getValues().map(r => r[0]); });
  FX_CACHE_ = null; const cfg = getConfig(), rateOf = {};
  const rateCol = [], twinCols = twinIdx.map(() => []);
  for (let k = 0; k < n; k++) {
    const cur = String(cols[iCur][k] || cfg.reportingCurrency).toUpperCase();
    const rate = rateOf[cur] !== undefined ? rateOf[cur] : (rateOf[cur] = fxRate_(cur));
    rateCol.push([rate]);
    twinIdx.forEach((t, j) => { const v = cols[t.li][k]; twinCols[j].push([(typeof v === 'number') ? v * rate : '']); });
  }
  if (iRate >= 0) sh.getRange(2, iRate + 1, n, 1).setValues(rateCol);
  twinIdx.forEach((t, j) => sh.getRange(2, t.ci + 1, n, 1).setValues(twinCols[j]));
  DATA_CACHE_ = null;
}

/* ------------------------------------------------------------------ */
/* Background chain                                                    */
/* ------------------------------------------------------------------ */

function scheduleBuild_(steps) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty(BUILD.PROP, JSON.stringify(steps));
  props.setProperty(BUILD.STATUS_PROP, JSON.stringify({ started: new Date().toISOString(), done: [], failed: [], pending: steps.slice() }));
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'continueBuild').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('continueBuild').timeBased().after(20 * 1000).create();
}

/** Worker: one step per execution, then re-schedules itself while steps remain. */
function continueBuild() {
  const props = PropertiesService.getScriptProperties();
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'continueBuild').forEach(t => ScriptApp.deleteTrigger(t));
  const queue = JSON.parse(props.getProperty(BUILD.PROP) || '[]');
  if (!queue.length) return;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30 * 1000)) { ScriptApp.newTrigger('continueBuild').timeBased().after(60 * 1000).create(); return; }
  const step = queue.shift();
  const status = JSON.parse(props.getProperty(BUILD.STATUS_PROP) || '{"done":[],"failed":[],"pending":[]}');
  try {
    CONFIG_CACHE_ = null; FX_CACHE_ = null; DATA_CACHE_ = null;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    PROGRESS_MUTE_ = true;
    runBuildStep_(ss, step);
    status.done.push(step);
  } catch (e) {
    status.failed.push(`${step}: ${e.message}`);
  } finally {
    PROGRESS_MUTE_ = false;
    status.pending = queue.slice();
    props.setProperty(BUILD.PROP, JSON.stringify(queue));
    props.setProperty(BUILD.STATUS_PROP, JSON.stringify(status));
    writeBuildStatus_(status);
    lock.releaseLock();
  }
  if (queue.length) ScriptApp.newTrigger('continueBuild').timeBased().after(15 * 1000).create();
}

function runBuildStep_(ss, step) {
  const cfg = getConfig();
  switch (step) {
    case 'pivots': { const sd = scopedData_(ss); buildPrintPivotsAndDashboard_(ss, sd); writeBuildCheck_(ss); break; }
    case 'review': buildReviewPivot_(ss); break;
    case 'regions': buildRegionReports_(ss); orderMasterTabs_(ss); break;   // Regions tab now; one tab per market via its own worker
    case 'changes': buildChangesTab_(ss); orderMasterTabs_(ss); break;
    case 'marketfiles': if (cfg.marketFiles) scheduleMarketFiles_(ss); break;
    default: throw new Error('unknown step ' + step);
  }
}

/**
 * Build check: a plain column sum over the Data tab (no aggregation code) next to what the Dashboard card shows, so a Rebuild and an
 * import can be compared as numbers: rows · rows in scope · house ads · Σ earned (all / in scope / in scope excl. house ads) · card.
 */
function buildCheck_(ss) {
  const cfg = getConfig(); const all = allData_(ss); const h = all.headers;
  const iK = h.indexOf(moneyCol_(h, cfg.kpiCol)), iIO = h.indexOf('IO Status'), iG = h.indexOf('Page Cat Group');
  const want = (cfg.defaultIoStatus || '').trim().toLowerCase();
  let n = 0, nScope = 0, nHouse = 0, kAll = 0, kScope = 0, kScopeNoHouse = 0;
  for (const r of all.rows) {
    const k = typeof r[iK] === 'number' ? r[iK] : 0; n++; kAll += k;
    if (want && String(r[iIO]).trim().toLowerCase() !== want) continue;
    nScope++; kScope += k;
    if (cfg.houseExclude && iG >= 0 && String(r[iG]) === CFG.GROUP_HOUSE) { nHouse++; continue; }
    kScopeNoHouse += k;
  }
  return { n, nScope, nHouse, kAll, kScope, kScopeNoHouse, scope: want ? cfg.defaultIoStatus : 'all IO statuses', houseExclude: cfg.houseExclude };
}
function writeBuildCheck_(ss) {
  try {
    const c = buildCheck_(ss), f = v => Math.round(v).toLocaleString('en-US');
    const dash = ss.getSheetByName(CFG.SHEETS.DASH); let card = null;
    if (dash) { const v = dash.getRange(1, 1, 12, 12).getValues(); for (let r = 0; r < v.length && card === null; r++) for (let cc = 0; cc < v[r].length; cc++) if (v[r][cc] === 'Adjusted earned blended revenue') { card = v[r + 1][cc]; break; } }
    const ok = card !== null && typeof card === 'number' && Math.abs(card - c.kScopeNoHouse) < 1;
    const txt = `Build check ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'd MMM HH:mm')}: Data ${f(c.n)} rows · ${f(c.nScope)} in scope (${c.scope}) · ${f(c.nHouse)} house ads${c.houseExclude ? ' excluded' : ''} · Σ earned all ${f(c.kAll)} · in scope ${f(c.kScope)} · in scope excl. house ads ${f(c.kScopeNoHouse)} · Dashboard card ${card === null ? 'n/a' : f(card)} ${ok ? '✓' : '✗ MISMATCH'}`;
    const log = ss.getSheetByName(CFG.SHEETS.LOG); if (log && log.getLastRow() > 1) { if (String(log.getRange(1, 12).getValue()) !== 'Build check') log.getRange(1, 12).setValue('Build check').setFontWeight('bold'); log.getRange(log.getLastRow(), 12).setValue(txt); }
    if (dash) dash.getRange(4, 1).setValue(txt).setFontColor(ok ? '#5f6b63' : '#a53a2f').setFontSize(9);
    PropertiesService.getScriptProperties().setProperty('printBuild:check', txt);
  } catch (e) { Logger.log('build check skipped: ' + e.message); }
}

/** Status line on the Dashboard tab (row 3) and in the Import Log's last row. */
function writeBuildStatus_(status) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const txt = `Background build: done ${status.done.join(', ') || '—'}${status.pending.length ? ` · pending ${status.pending.join(', ')}` : ' · complete'}${status.failed.length ? ` · FAILED ${status.failed.join(' | ')}` : ''}`;
  try { const log = ss.getSheetByName(CFG.SHEETS.LOG); if (log && log.getLastRow() > 1) log.getRange(log.getLastRow(), 11).setValue(txt); } catch (e) {}
  try { const dash = ss.getSheetByName(CFG.SHEETS.DASH); if (dash) dash.getRange(3, 1).setValue(status.pending.length ? txt : '').setFontColor('#a53a2f'); } catch (e) {}
}

/** Print: Pivots as static values + Dashboard tab, from in-memory rows (no QUERY formulas over the Data tab). */
function buildPrintPivotsAndDashboard_(ss, sd) {
  const headers = sd.headers, rows = sd.rows;
  const A = aggregatePrint_(headers, rows, 1, { noTree: true });
  let sh = ss.getSheetByName(CFG.SHEETS.PIVOTS);
  if (!sh) sh = ss.insertSheet(CFG.SHEETS.PIVOTS);
  sh.clear();
  const periods = Object.keys(A.byMonth).filter(p => /^\d{4}-\d{2}$/.test(p)).sort();
  ensureColumns_(sh, Math.max(30, periods.length + 2));
  const kpiName = moneyCol_(headers, getConfig().kpiCol);
  const list = (o, limit) => Object.keys(o).sort((a, b) => o[b].k - o[a].k).slice(0, limit || 1000).map(k => [k, r2(o[k].k)]);
  const blocks = [
    { key: 'byMonth', title: 'Net earned by month', anchor: 'A1', head: ['Period', kpiName], rows: periods.map(p => [p, r2(A.byMonth[p].k)]) },
    { key: 'byRegion', title: 'Net earned by market', anchor: 'D1', head: ['Market', kpiName], rows: list(A.byRegion) },
    { key: 'byPlatform', title: 'Net earned by book', anchor: 'G1', head: ['Book', kpiName], rows: list(A.byBook) },
    { key: 'topClients', title: 'Top 10 clients', anchor: 'J1', head: ['Client', kpiName], rows: list(A.byClient, 10) },
    { key: 'topAgencies', title: 'Top 10 agencies', anchor: 'M1', head: ['Agency', kpiName], rows: list(A.byAgency, 10) },
    { key: 'byRep', title: 'Net earned by sales rep', anchor: 'P1', head: ['Sales rep', kpiName], rows: list(A.byRep) },
    { key: 'byBilling', title: 'Net earned by billing status', anchor: 'S1', head: ['Billing status', kpiName], rows: list(A.byBilling) },
    { key: 'byIO', title: 'Net earned by IO status', anchor: 'V1', head: ['IO status', kpiName], rows: list(A.byIO) },
    { key: 'byCategory', title: 'Net earned by brand', anchor: 'Y1', head: ['Brand', kpiName], rows: list(A.byBrand) },
    { key: 'regionMonth', title: 'Market × month', anchor: 'A30', head: ['Market', ...periods], rows: Object.keys(A.byRegion).sort().map(r => [r, ...periods.map(p => r2(((A.byMonthRegion[p] || {})[r] || { k: 0 }).k))]) },
    { key: 'billedVsBlended', title: 'Net vs gross vs rate card by month', anchor: 'A60', head: ['Period', kpiName, 'Gross earned', 'Rate card (earned)'], rows: periods.map(p => [p, r2(A.byMonth[p].k), r2(A.byMonth[p].g), r2(A.byMonth[p].rce)]) },
  ];
  const out = {};
  blocks.forEach(b => {
    const cell = sh.getRange(b.anchor), r = cell.getRow(), c = cell.getColumn(), w = b.head.length, body = b.rows.length ? b.rows : [new Array(w).fill('')];
    sh.getRange(r, c, 1, w).setValues([b.head]).setFontWeight('bold').setBackground('#f3f5f1');
    sh.getRange(r + 1, c, body.length, w).setValues(body);
    sh.getRange(r, c, body.length + 1, w).setNumberFormat(getConfig().numberFormat);
    out[b.key] = { range: sh.getRange(r, c, body.length + 1, w), title: b.title };
  });
  sh.setColumnWidths(1, 28, 150);
  const data = ss.getSheetByName(CFG.SHEETS.DATA);
  const C = { runDate: headers.indexOf('Report Run Date') + 1 };
  buildPrintDashboardSheet_(ss, out, C, kpiName);
}

/** Current background status for the Settings sidebar / menu. */
function buildStatus_() { try { return JSON.parse(PropertiesService.getScriptProperties().getProperty(BUILD.STATUS_PROP) || 'null'); } catch (e) { return null; } }

/* ===================== Notes ===================== */
/**
 * Print Yield Review — reviewer notes on the web page
 * ----------------------------------------------------
 * Notes are rows in the "Notes" tab of this workbook (so they are covered by the sheet's sharing and never leave Google).
 * A note is attached to an anchor: the figure it was written on (a market reading, a brand-in-market cell, an account, …)
 * or a section. Reviewers (Settings → Reviewers) can read, add, resolve and reopen; a note can be deleted by its author or the owner.
 */

const NOTES = { SHEET: 'Notes', HEAD: ['ID', 'Created', 'Author', 'Anchor', 'Label', 'Note', 'Status', 'Resolved by', 'Resolved at'], MAX_LEN: 2000, MAX_NOTES: 5000 };

function notesSheet_(ss) {
  let sh = ss.getSheetByName(NOTES.SHEET);
  if (!sh) {
    sh = ss.insertSheet(NOTES.SHEET);
    sh.getRange(1, 1, 1, NOTES.HEAD.length).setValues([NOTES.HEAD]).setFontWeight('bold');
    sh.setFrozenRows(1); sh.setColumnWidth(6, 420);
  }
  return sh;
}
function notesAll_(ss) {
  const sh = notesSheet_(ss); const n = sh.getLastRow() - 1; if (n < 1) return [];
  const v = sh.getRange(2, 1, n, NOTES.HEAD.length).getValues();
  const fmt = d => d instanceof Date ? Utilities.formatDate(d, Session.getScriptTimeZone(), 'd MMM yyyy HH:mm') : String(d || '');
  return v.filter(r => r[0]).map((r, i) => ({ id: String(r[0]), created: fmt(r[1]), author: String(r[2] || ''), anchor: String(r[3] || ''), label: String(r[4] || ''), text: String(r[5] || ''), status: String(r[6] || 'open'), resolvedBy: String(r[7] || ''), resolvedAt: fmt(r[8]), row: i + 2 }));
}
function noteUser_() {
  const who = (Session.getActiveUser().getEmail() || '').toLowerCase();
  if (!isReviewer_(who, getConfig())) throw new Error('Not authorised.');
  if (!who) throw new Error('Sign in with your work account to write notes.');
  return who;
}

/** Web app: all notes (open first, newest first). */
function getNotes() {
  noteUser_();
  const all = notesAll_(SpreadsheetApp.getActiveSpreadsheet());
  return JSON.stringify({ owner: ownerEmail_(), notes: all.sort((a, b) => (a.status === b.status ? 0 : a.status === 'open' ? -1 : 1) || b.row - a.row).map(n => { const o = Object.assign({}, n); delete o.row; return o; }) });
}

/** Web app: add a note on an anchor. Returns the refreshed list. */
function addNote(anchor, label, text) {
  const who = noteUser_();
  text = String(text || '').trim(); anchor = String(anchor || '').trim().slice(0, 300); label = String(label || '').trim().slice(0, 300);
  if (!text) throw new Error('The note is empty.');
  if (text.length > NOTES.MAX_LEN) throw new Error(`Notes are limited to ${NOTES.MAX_LEN} characters.`);
  const lock = LockService.getScriptLock(); lock.waitLock(20 * 1000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet(), sh = notesSheet_(ss);
    if (sh.getLastRow() - 1 >= NOTES.MAX_NOTES) throw new Error('The Notes tab is full — archive old notes first.');
    const id = Utilities.getUuid().slice(0, 8);
    sh.appendRow([id, new Date(), who, anchor, label, text, 'open', '', '']);
    sh.getRange(sh.getLastRow(), 2).setNumberFormat('yyyy-mm-dd HH:mm');
    try { logAccess_(who, 'note', anchor); } catch (e) {}
  } finally { lock.releaseLock(); }
  return getNotes();
}

/** Web app: resolve / reopen a note (any reviewer) or delete it (author or owner). Returns the refreshed list. */
function setNoteStatus(id, action) {
  const who = noteUser_();
  const lock = LockService.getScriptLock(); lock.waitLock(20 * 1000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet(), sh = notesSheet_(ss);
    const n = notesAll_(ss).find(x => x.id === String(id)); if (!n) throw new Error('Note not found (it may have been deleted).');
    if (action === 'delete') { if (n.author !== who && who !== ownerEmail_()) throw new Error('Only the author or the sheet owner can delete a note.'); sh.deleteRow(n.row); }
    else if (action === 'resolve') sh.getRange(n.row, 7, 1, 3).setValues([['resolved', who, new Date()]]);
    else if (action === 'reopen') sh.getRange(n.row, 7, 1, 3).setValues([['open', '', '']]);
    else throw new Error('Unknown action.');
  } finally { lock.releaseLock(); }
  return getNotes();
}

/* ===================== WebApp ===================== */
/**
 * AdBook+ Revenue Review — Web App
 * ---------------------------------
 * Deploy → New deployment → Web app
 *   Execute as: Me            (reviewers never need edit access to the sheet)
 *   Who has access: Anyone within <your domain>   (never "Anyone")
 * Access is additionally gated by the reviewer / uploader lists in the Config tab.
 * The UI is self-contained: no external scripts, fonts, or CDNs are loaded.
 */

function doGet() {
  const who = (Session.getActiveUser().getEmail() || '').toLowerCase();
  const cfg = getConfig();
  if (!isReviewer_(who, cfg)) {
    return HtmlService.createHtmlOutput(
      `<div style="font:15px/1.5 system-ui;padding:40px;max-width:520px">
         <h2 style="margin:0 0 8px">Access not granted</h2>
         <p>${who ? `<b>${who}</b> isn't on the reviewer list for this report.` : 'Sign in with your work account to open this report.'}
         Ask the sheet owner to add you in the Config tab.</p></div>`
    ).setTitle(profile_().title);
  }
  logAccess_(who, 'open', '');
  const t = HtmlService.createTemplateFromFile('ReviewApp');
  t.userEmail = who;
  t.canUpload = isUploader_(who, cfg);
  t.profile = profile_().key;
  t.title = profile_().title;
  t.brandName = cfg.brandName || (profile_().key === 'talent' ? 'Condé Nast' : '');
  t.creditLine = isPrint_() ? (cfg.creditLine || '') : '';
  return t.evaluate()
    .setTitle(profile_().title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function isReviewer_(email, cfg) {
  if (!cfg.reviewers.length) return true;            // domain restriction is enforced by the deployment
  return cfg.reviewers.includes(email) || cfg.uploaders.includes(email) || email === ownerEmail_();
}

function isUploader_(email, cfg) {
  if (email && email === ownerEmail_()) return true;
  return cfg.uploaders.includes(email);
}

function ownerEmail_() {
  try { return (SpreadsheetApp.getActiveSpreadsheet().getOwner().getEmail() || '').toLowerCase(); } catch (e) { return ''; }
}

/* ------------------------------------------------------------------ */
/* Data for the UI                                                     */
/* ------------------------------------------------------------------ */

/**
 * @param {Object} filters {region, period, year, platform, ioStatus, billingStatus, rep, client} — each '' or a value
 * @return {Object} aggregates + filter options + meta
 */
function getDashboardData(filters) {
  filters = filters || {};
  const cfg = getConfig();
  if (isPrint_()) return getPrintDashboardData(filters);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CFG.SHEETS.DATA);
  if (!sh || sh.getLastRow() < 2) return { empty: true, meta: {} };

  const rc = readColumns_(sh, webColumns_());
  const values = [rc.headers, ...rc.rows];
  const headers = values[0];
  const idx = name => headers.indexOf(name);
  // When one region is selected, report it in its own market currency (e.g. GBP for the UK).
  // Currency: explicit "Show in" choice wins; else the selected market's currency; else the reporting currency.
  const marketCur = (filters.currency || '').toUpperCase() || (filters.region ? marketCurrency_(filters.region) : cfg.reportingCurrency);
  const factor = marketCur === cfg.reportingCurrency ? 1 : 1 / fxRate_(marketCur);
  const relabel = hs => hs.map(h => String(h).endsWith(` (${cfg.reportingCurrency})`) ? String(h).slice(0, -(cfg.reportingCurrency.length + 3)) + ` (${marketCur})` : h);
  const convHeaders = factor === 1 ? headers : relabel(headers);
  const convRows = rs => factor === 1 ? rs : rs.map(r => { const c = r.slice(); headers.forEach((h, i) => { if (String(h).endsWith(` (${cfg.reportingCurrency})`) && typeof c[i] === 'number') c[i] *= factor; }); return c; });
  const mc = n => idx(moneyCol_(headers, n));
  const I = {
    kpi: mc(cfg.kpiCol), billed: mc(CFG.BILLED_COL), billable: mc(CFG.BILLABLE_COL), earned: mc(CFG.EARNED_COL),
    region: idx('Region'), period: idx('Period'), client: idx('Client Name'), agency: idx('Agency Name'),
    rep: idx('Sales Rep'), platform: idx('(Drop) SSG Platform'), billStatus: idx('Billing Status'),
    ioStatus: idx('IO Status'), campaign: idx('Campaign ID'), campaignName: idx('Campaign Name'),
    runDate: idx('Report Run Date'), category: idx(nicheCol_(headers)), catEu: idx(CFG.NICHE_SRC_EU), cname: idx('Campaign Name'),
    strategy: idx('SSG Account Strategy'), orderSource: idx('(Campaign) Order Source'),
    adjEarned: mc('Adjusted Earned Blended Revenue'), proRata: mc('Pro-rata Revenue'), adbookBilled: mc(CFG.ADBOOK_BILLED_COL),
    fee: idx('Fee Type'), dropId: idx('Drop ID'), path: idx(CFG.REGION_SOURCE_COL),
  };
  const kept = [], keptAnyRegion = [];
  const canonAgency = makeCanon_([cfg.blankAgency]), canonPlatform = makeCanon_([cfg.blankPlatform]);   // keptAnyRegion = all filters except region (for the regions overview)

  const opts = { region: new Set(), period: new Set(), platform: new Set(), ioStatus: new Set(), billingStatus: new Set(), rep: new Set(), niche: new Set(), feeType: new Set() };
  const str = v => (v === null || v === undefined) ? '' : String(v);
  const num = v => (typeof v === 'number' ? v * factor : 0);   // factor converts to the market currency when a region is selected

  const agg = {
    total: 0, billed: 0, billable: 0, earned: 0, adjEarned: 0, proRata: 0, adbookBilled: 0, feeInternal: 0, feeExternal: 0, feeInternalBilled: 0, feeExternalBilled: 0, feeUs: 0, feeUsBilled: 0, byUsFee: {}, byUsFeeBilled: {}, rows: 0,
    campaigns: new Set(), clients: new Set(),
    byMonth: {}, byMonthRegion: {}, byRegion: {}, byPlatform: {}, byClient: {}, byAgency: {},
    byRep: {}, byBilling: {}, byIO: {}, byCategory: {}, byStrategy: {}, byOrderSource: {}, byFeeType: {}, byFeeBilled: {},
    byCampaign: {},
  };
  const bump = (o, k, v) => { k = k || '(blank)'; o[k] = (o[k] || 0) + v; };

  let runDate = null;
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const region = str(row[I.region]), period = str(row[I.period]), platform = canonPlatform(row[I.platform]) || cfg.blankPlatform;
    const agency = canonAgency(row[I.agency]) || cfg.blankAgency;
    const io = str(row[I.ioStatus]), bs = str(row[I.billStatus]), rep = str(row[I.rep]);
    opts.region.add(region); opts.period.add(period); opts.platform.add(platform);
    const niche = headers[I.category] === 'Niche' ? str(row[I.category]) : deriveNiche_(region, I.catEu >= 0 ? row[I.catEu] : '', I.cname >= 0 ? row[I.cname] : '');
    const inRegion = !filters.region || region === filters.region;
    if (inRegion) { opts.ioStatus.add(io); opts.billingStatus.add(bs); opts.rep.add(rep); opts.niche.add(niche); }
    const fee = I.fee >= 0 && str(row[I.fee]) ? str(row[I.fee]) : deriveFeeType_(I.path >= 0 ? row[I.path] : ''); if (inRegion) opts.feeType.add(fee);
    const rd = row[I.runDate]; if (rd instanceof Date && (!runDate || rd > runDate)) runDate = rd;

    if (filters.period && period !== filters.period) continue;
    if (filters.year && !period.startsWith(filters.year)) continue;
    if (filters.platform && platform !== filters.platform) continue;
    if (filters.ioStatus && io !== filters.ioStatus) continue;
    if (filters.billingStatus && bs !== filters.billingStatus) continue;
    if (filters.rep && rep !== filters.rep) continue;
    if (filters.client && str(row[I.client]) !== filters.client) continue;
    if (filters.niche && niche !== filters.niche) continue;
    if (filters.feeType && fee !== filters.feeType) continue;
    keptAnyRegion.push(row);
    if (filters.region && region !== filters.region) continue;

    kept.push(row);
    const v = num(row[I.kpi]);
    agg.rows++; agg.total += v; agg.billed += num(row[I.billed]); agg.billable += num(row[I.billable]); agg.earned += num(row[I.earned]);
    agg.adjEarned += num(row[I.adjEarned]); agg.proRata += num(row[I.proRata]); agg.adbookBilled += num(row[I.adbookBilled]);
    const bv = num(row[I.billed]);
    bump(agg.byFeeType, fee, v); bump(agg.byFeeBilled, fee, bv);
    const cls = classifyFee_(region, fee);
    if (cls.kind === 'internal') { agg.feeInternal += v; agg.feeInternalBilled += bv; } else if (cls.kind === 'external') { agg.feeExternal += v; agg.feeExternalBilled += bv; }
    else if (cls.kind === 'us') { agg.feeUs += v; agg.feeUsBilled += bv; bump(agg.byUsFee, cls.usFee, v); bump(agg.byUsFeeBilled, cls.usFee, bv); }
    if (row[I.campaign] !== '') agg.campaigns.add(str(row[I.campaign]));
    if (row[I.client] !== '') agg.clients.add(str(row[I.client]));
    bump(agg.byMonth, period, v);
    if (!agg.byMonthRegion[period]) agg.byMonthRegion[period] = {};
    bump(agg.byMonthRegion[period], region, v);
    bump(agg.byRegion, region, v); bump(agg.byPlatform, platform, v);
    bump(agg.byClient, str(row[I.client]), v); bump(agg.byAgency, agency, v);
    bump(agg.byRep, rep, v); bump(agg.byBilling, bs, v); bump(agg.byIO, io, v);
    bump(agg.byCategory, niche, v); bump(agg.byStrategy, str(row[I.strategy]), v);
    bump(agg.byOrderSource, str(row[I.orderSource]), v);
    const ck = str(row[I.campaign]);
    if (!agg.byCampaign[ck]) agg.byCampaign[ck] = { id: ck, name: str(row[I.campaignName]), client: str(row[I.client]), region, rep, io, kpi: 0, billed: 0 };
    agg.byCampaign[ck].kpi += v; agg.byCampaign[ck].billed += num(row[I.billed]);
  }

  const sortDesc = (o, limit) => Object.keys(o).map(k => [k, o[k]]).sort((a, b) => b[1] - a[1]).slice(0, limit || 1000);
  const sortedPeriods = Object.keys(agg.byMonth).filter(p => /^\d{4}-\d{2}$/.test(p)).sort();
  const noPeriodRows = agg.byMonth['(blank)'] !== undefined ? kept.filter(r => !str(r[I.period])).length : 0;
  const regions = sortDesc(agg.byRegion).map(x => x[0]);
  const list = s => Array.from(s).filter(Boolean).sort();

  return {
    empty: agg.rows === 0,
    kpiName: moneyCol_(convHeaders, cfg.kpiCol),
    currency: marketCur,
    reportingCurrency: cfg.reportingCurrency,
    currencies: fxCurrencies_(),
    logo: /^data:image\//.test(cfg.logo || '') ? cfg.logo : '',
    billedStatuses: cfg.billedStatuses,
    traffic: trafficSummary_(),
    numberFormat: cfg.numberFormat,
    meta: {
      runDate: runDate ? Utilities.formatDate(runDate, Session.getScriptTimeZone(), 'd MMM yyyy') : '',
      rows: agg.rows, campaigns: agg.campaigns.size, clients: agg.clients.size, noPeriodRows,
      generated: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'd MMM yyyy HH:mm'),
    },
    totals: { kpi: agg.total, billed: agg.billed, billable: agg.billable, earned: agg.earned, adjEarned: agg.adjEarned, proRata: agg.proRata, adbookBilled: agg.adbookBilled, feeInternal: agg.feeInternal, feeExternal: agg.feeExternal, feeInternalBilled: agg.feeInternalBilled, feeExternalBilled: agg.feeExternalBilled, feeUs: agg.feeUs, feeUsBilled: agg.feeUsBilled,
              regions: Object.keys(agg.byRegion).length, reps: Object.keys(agg.byRep).length },
    review: computeReviewPivot_(convHeaders, convRows(kept)),
    regionSplit: slimSplit_(computeRegionSplit_(convHeaders, convRows(keptAnyRegion))),   // consolidated, in the chosen currency
    nicheSplit: slimSplit_(computeRegionSplit_(convHeaders, convRows(kept))).totals,
    months: sortedPeriods.map(p => ({ period: p, total: agg.byMonth[p], byRegion: agg.byMonthRegion[p] || {} })),
    regions,
    byRegion: sortDesc(agg.byRegion),
    byPlatform: sortDesc(agg.byPlatform),
    topClients: sortDesc(agg.byClient, 12),
    topAgencies: sortDesc(agg.byAgency, 12),
    byRep: sortDesc(agg.byRep, 15),
    byBilling: sortDesc(agg.byBilling),
    byIO: sortDesc(agg.byIO),
    byCategory: sortDesc(agg.byCategory, 12),
    byStrategy: sortDesc(agg.byStrategy, 10),
    byOrderSource: sortDesc(agg.byOrderSource),
    byFeeType: sortDesc(agg.byFeeType),
    feeSplit: sortDesc(agg.byFeeType).map(x => ({ name: x[0], kpi: x[1], billed: agg.byFeeBilled[x[0]] || 0 })),
    usFees: cfg.usFees.map(k => ({ name: k, kpi: agg.byUsFee[k] || 0, billed: agg.byUsFeeBilled[k] || 0 })).concat(agg.byUsFee[CFG.US_FEE_OTHER] ? [{ name: CFG.US_FEE_OTHER, kpi: agg.byUsFee[CFG.US_FEE_OTHER], billed: agg.byUsFeeBilled[CFG.US_FEE_OTHER] || 0 }] : []),
    usMarket: cfg.usMarket, isUsView: !!filters.region && isUsMarket_(filters.region),
    topCampaigns: Object.values(agg.byCampaign).sort((a, b) => b.kpi - a.kpi).slice(0, 25),
    options: {
      region: list(opts.region), period: list(opts.period).filter(p => /^\d{4}-\d{2}$/.test(p)),
      year: Array.from(new Set(list(opts.period).filter(p => /^\d{4}-\d{2}$/.test(p)).map(p => p.slice(0, 4)))).sort(),
      platform: list(opts.platform), ioStatus: list(opts.ioStatus), billingStatus: list(opts.billingStatus), rep: list(opts.rep), niche: list(opts.niche), feeType: list(opts.feeType),
    },
  };
}

/** Separate endpoint: change summary for the current filters (loaded after the main page renders). */
function getChangesData(filters) {
  filters = filters || {};
  const who = (Session.getActiveUser().getEmail() || '').toLowerCase();
  const cfg = getConfig();
  if (!isReviewer_(who, cfg)) throw new Error('Not authorised.');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = ss.getSheetByName(CFG.SHEETS.DATA);
  if (!data || data.getLastRow() < 2) return null;
  const headers = data.getRange(1, 1, 1, data.getLastColumn()).getValues()[0];
  const ctx = currencyContext_(headers, filters);
  try { return slimChanges_(computeChanges_(ss, filters.region || '', ctx.factor, ctx.marketCur)); }
  catch (e) { return { error: e.message }; }
}

/** Change summary for the browser: lists capped so the payload stays small. */
function slimChanges_(ch) {
  if (!ch) return null;
  const CAP = 300;
  return {
    prevRun: ch.prevRun, newRun: ch.newRun, tot: ch.tot, currency: ch.currency,
    columns: [...(ch.desc || CHG.DESC), ...(ch.money || CHG.MONEY).map(c => `${c} (${ch.currency})`)], changedColumns: [...(ch.desc || CHG.DESC), 'Field', 'Previous', 'Current', 'Δ', 'Δ %'], descCount: (ch.desc || CHG.DESC).length, kpi: ch.kpi,
    added: ch.added.slice(0, CAP), removed: ch.removed.slice(0, CAP), changed: ch.changed.slice(0, CAP),
    counts: { added: ch.added.length, removed: ch.removed.length, changed: ch.changed.length }, cap: CAP,
  };
}

/** Currencies available in the FX matrix (reporting currency first). */
function fxCurrencies_() {
  const cfg = getConfig();
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CFG.FX_SHEET);
  const out = [cfg.reportingCurrency];
  if (sh) Object.keys(readFxToBase_(sh, cfg.reportingCurrency)).forEach(c => { if (!out.includes(c)) out.push(c); });
  return out;
}

/** Drops raw rows and function fields so the split can be serialised to the browser. */
function slimSplit_(sp) {
  const slim = a => ({ name: a.name, kpi: a.kpi, billed: a.billed, billable: a.billable, campaigns: a.campaigns, clients: a.clients,
    byPeriod: a.byPeriod, byNiche: a.byNiche, nicheBilled: a.nicheBilled, nichePeriod: a.nichePeriod, nicheCampaigns: a.nicheCampaigns });
  return { periods: sp.periods, niches: sp.niches, regions: sp.regions.map(slim), totals: slim(sp.totals), kpiName: sp.kpiName };
}

/* ------------------------------------------------------------------ */
/* Upload from the web app (path 3)                                    */
/* ------------------------------------------------------------------ */

/**
 * @param {{name:string, mime:string, base64:string}} payload
 */
function uploadReport(payload) {
  const who = (Session.getActiveUser().getEmail() || '').toLowerCase();
  const cfg = getConfig();
  if (!isUploader_(who, cfg)) throw new Error('You are not on the uploader list. Ask the sheet owner to add you in the Config tab.');
  if (!payload || !payload.base64) throw new Error('No file received.');
  const bytes = Utilities.base64Decode(payload.base64);
  const blob = Utilities.newBlob(bytes, payload.mime || 'application/octet-stream', payload.name || 'upload.csv');
  const values = parseFileBlob_(blob, payload.name);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const res = processRowsLocked_(values, `Web upload by ${who}: ${payload.name}`, '');
    return { ok: true, rows: res.rows, missing: res.missingColumns };
  } finally { lock.releaseLock(); }
}

/** Lets the HTML template include partials if you split the UI later. */
function include_(name) { return HtmlService.createHtmlOutputFromFile(name).getContent(); }

