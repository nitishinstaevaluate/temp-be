export const MODEL = ['FCFE', 'FCFF', 'Relative_Valuation', 'Excess_Earnings', 'CTM', 'NAV','ruleElevenUa'];

export const INCOME_APPROACH = ['FCFE','FCFF'];
export const NET_ASSET_VALUE_APPROACH = ['NAV'];
export const MARKET_PRICE_APPROACH = ['Relative_Valuation','CTM'];
    
export const METHODS_AND_APPROACHES = ['DCF','NAV','MULTI_MODEL','CCM','CTM','ruleElevenUa']
export const mainLogo=` data:image/jpg;base64,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`;

export const RELATIVE_PREFERENCE_RATIO = ['Industry Based','Company Based'];

// export const GET_YEAR = /\b2\d{3}(-\d{2})?\b/;
export const GET_YEAR = /\b2\d{3}(-\d{2})?\b|\b[a-zA-Z]{1,10}\d{1,4}\b/;

export const GET_DATE_MONTH_YEAR_FORMAT = /^(0[1-9]|[12][0-9]|3[01])[-/.](0[1-9]|1[0-2])[-/.](\d{4}|\d{2})$/;

export const MATCH_YEAR = /\d+(?=\D|$)/g;

export const GET_MULTIPLIER_UNITS = {
    absolute:1,
    Hundreds:100,
    Thousands:1000,
    Lakhs:100000,
    Millions:1000000,
    Crores:10000000
}
export const REPORTING_UNIT = {
    ABSOLUTE:'absolute',
    HUNDRED:'Hundreds',
    THOUSAND:'Thousands',
    LAKH:'Lakhs',
    MILLION:'Millions',
    CRORE:'Crores'
}

export const ALPHA={
  companySize:'Company Size',
  marketPosition:'Market Position',
  liquidityFactor:'Liquidity Factor',
  competition:'Competition',
  qualitativeFactor:'Qualitative Factor'
}

export const REPORT_PURPOSE={
  companiesAct:'Companies Act, 2013',
  ita1961:'Income Tax Act, 1961',
  fema:'Foreign Exchange Management Act',
  sebiRegulations:'SEBI Regulations'
}

export const NATURE_OF_INSTRUMENT = {
    equityShares:"Equity Shares",
    equitySharesAndCcps:"Equity Shares & Compulsorily Convertible Preference Shares",
    ccps:"Compulsorily Convertible Preference Shares",
    ccds:"Compulsorily Convertible Debentures",
    ocds:"Optionally Convertible Debentures",
    ocrps:"Optionally Convertible Redeemable Preference Shares",
    rps:"Redeemable Preference Shares",
    safe:"Simple Agreement for Future Equity",
    convertibleNotes:"Convertible Notes",
}

export const PURPOSE_OF_REPORT_AND_SECTION = {
  companiesAct:[
    "62 - Preferential Issue of Further Shares",
    "42 - Private Placement",
    "54 - Issue of Sweat Equity Shares",
    "230 - Compromise or Arrangements",
    "232 - Mergers & Amalgamation",
    "236 - Purchase of Minority Interest"
  ],
  ita1961:[
    "56(2)(x) - Tax on sum/property received without consideration",
    "56(2)(viib) - Issue of Shares by a Closely Held Company to residents",
    "50CA - Special Consideration for Full Value of consideration for transfer of shares other than quoted shares",
    "50B - Slump Sale"
  ],
  fema:[

  ],
  sebiRegulations:[
    "87C(1)(ii) - SEBI (Listing Obligations and Disclosure Requirements Regulations), 2015",
    "158(6)(b) - SEBI (Issue of Capital and Disclosure Requirements) Regulations, 2018",
    "163(3) - SEBI (Issue of Capital and Disclosure Requirements) Regulations, 2018",
    "165 - SEBI (Issue of Capital and Disclosure Requirements) Regulations, 2018"
  ]
}
export const CAPITAL_STRUCTURE_TYPE = {
    Industry_Based:"Industry Based",
    Company_Based:"Company Based",
    Target_Based:"Target Based"
}

export const ASSESSMENT_DATA = [
    {
    "lineEntry": {
        particulars : "Operating Assets",
        sysCode:3001,
        header:true,
        rowNumber:2
        }
    },
    {
      "lineEntry": {
          particulars : "Trade Receivables",
          sysCode:3002,
          rowNumber:3
          }
    },
    {
      "lineEntry": {
          particulars : "Unbilled Revenues",
          sysCode:3003,
          rowNumber:4
          }
    },
    {
      "lineEntry": {
          particulars : "Inventories",
          sysCode:3004,
          rowNumber:5
          }
    },
    {
      "lineEntry": {
          particulars : "Advances",
          sysCode:3005,
          rowNumber:6
          }
    },
    {
      "lineEntry": { // This object block is not in use [redundant]
          particulars : "Short Term Investments",
          sysCode:3006,
          rowNumber:7
          }
    },
    {
      "lineEntry": {
          particulars : "Other Current Assets",
          sysCode:3007,
          rowNumber:8
          }
    },
    {
      "lineEntry": {
          particulars : "Non Current Assets",
          sysCode:3008,
          rowNumber:9
          }
    },
    {
      "lineEntry": {
          particulars : "Other Operating Assets",
          sysCode:3009,
          editable:true,
          subHeader:true,
          rowNumber:10
          }
    },
    {
      "lineEntry": {
          particulars : "Total",
          sysCode:3010,
          dependent:[3003,3004,3005,3006,3007,3008,3009,3010],
          formula:"SUM(currentOne3:currentOne10)",
          rowNumber:11
          }
    },
    {
      "lineEntry": {
          particulars : "Operating Liabilities",
          sysCode:3011,
          header:true,
          rowNumber:13
          }
    },
    {
      "lineEntry": {
          particulars : "Trade Payables",
          sysCode:3012,
          rowNumber:14
          }
    },
    {
      "lineEntry": {
          particulars : "Employee Payables",
          sysCode:3013,
          rowNumber:15
          }
    },
    {
      "lineEntry": {
          particulars : "LC Payables",
          sysCode:3014,
          rowNumber:16
          }
    },
    {
      "lineEntry": {
          particulars : "Other Current Liablities",
          sysCode:3015,
          rowNumber:17
          }
    },
    {
      "lineEntry": {
          particulars : "Short Term Provisions",
          sysCode:3016,
          rowNumber:18
          }
    },
    {
      "lineEntry": {
          particulars : "Long Term Provisions",
          sysCode:3017,
          rowNumber:19
          }
    },
    {
      "lineEntry": {
          particulars : "Other Operating Liabilities",
          sysCode:3018,
          editable:true,
          subHeader:true,
          rowNumber:20
          }
    },
    {
      "lineEntry": {
          particulars : "Total",
          sysCode:3019,
          dependent:[3014,3015,3016,3017,3018,3019,3020],
          formula:"SUM(currentOne14:currentOne20)",
          rowNumber:21
          }
    },
    {
      "lineEntry": {
          particulars : "Net Operating Assets",
          sysCode:3020,
          dependent:[3009,3018,3019],
          rowNumber:23,
          }
    },
    {
      "lineEntry": {
          particulars : "Change in NCA",
          sysCode:3021,
          dependent:[3009,3018,3020],
          rowNumber:24,
          }
    }
  ]

  export const BALANCE_SHEET = [
    {
    "lineEntry": {
        particulars : "EQUITY AND LIABILITIES",
        sysCode:2001,
        header:true,
        rowNumber:4
        }
    },
    {
      "lineEntry": {
          particulars : "Shareholders' Funds",
          sysCode:2002,
          header:true,
          editable:false,
          formula:"currentOne7+currentOne8+currentOne9+currentOne10+currentOne11+currentOne12+currentOne13+currentOne14+currentOne15+currentOne16+currentOne17+currentOne18+currentOne19+currentOne20+currentOne21+currentOne22",
          dependent:[2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,
                    2013,2014,2015,2016,2017],
          rowNumber:6
          }
    },
    {
      "lineEntry": {
          particulars : "Equity Share Capital",
          sysCode:2003,
          editable:true,      
          rowNumber:7
          }
    },
    {
      "lineEntry": {
          particulars : "Preference Share Capital",
          sysCode:2004,
          editable:true,
          rowNumber:8
          }
    },
    {
      "lineEntry": {
          particulars : "Other Equity",
          sysCode:2005,
          editable:true,
          rowNumber:9
          }
    },
    {
      "lineEntry": {
          particulars : "Share Premium",
          sysCode:2006,
          editable:true,
          rowNumber:10
          }
    },
    {
      "lineEntry": {
          particulars : "Reserves and Surplus",
          sysCode:2007,
          editable:true,
          rowNumber:11
          }
    },
    {
      "lineEntry": {
          particulars : "Revaluation Reserve",
          sysCode:2008,
          editable:true,
          rowNumber:12
          }
    },
    {
      "lineEntry": {
          particulars : "Capital Reserve",
          sysCode:2009,
          editable:true,
          rowNumber:13
          }
    },
    {
      "lineEntry": {
          particulars : "Capital Redemption Reserve",
          sysCode:2010,
          editable:true,
          rowNumber:14
          }
    },
    {
      "lineEntry": {
          particulars : "Debenture Redemption Reserve",
          sysCode:2011,
          editable:true,
          rowNumber:15
          }
    },
    {
      "lineEntry": {
          particulars : "Share Based Payment reserve",
          sysCode:2012,
          editable:true,
          rowNumber:16
          }
    },
    {
      "lineEntry": {
          particulars : "Defined benefit obligation reserve",
          sysCode:2012,
          editable:true,
          rowNumber:17
          }
    },
    {
      "lineEntry": {
          particulars : "Other Comprehensive lncome",
          sysCode:2013,
          editable:true,
          rowNumber:18
          }
    },

    {
      "lineEntry": {
          particulars : "Non-Controlling Interests",
          sysCode:2014,
          editable:true,
          rowNumber:19
          }
    },
    {
      "lineEntry": {
          particulars : "",
          sysCode:2015,
          editable:true,
          rowNumber:20,
          flaggedOff:true,
          }
    },
    {
      "lineEntry": {
          particulars : "Share Warrants",
          sysCode:2016,
          editable:true,
          rowNumber:21
          }
    },
    {
      "lineEntry": {
          particulars : "Share Application Money Pending Allotment",
          sysCode:2017,
          editable:true,
          rowNumber:22
          }
    },
    {
      "lineEntry": {
          particulars : "Non Current Liabilities",
          sysCode:2018,
          header:true,
          editable:false,
          dependent:[2019,2020,2021,2022,2023,2024,2025,2026],
          formula:"currentOne25+currentOne26+currentOne27+currentOne28+currentOne29+currentOne30+currentOne31+currentOne32",
          rowNumber:24
          }
    },
    {
      "lineEntry": {
          particulars : "Deferred Tax Liability",
          sysCode:2019,
          editable:true,
          rowNumber:25
          }
    },
    {
      "lineEntry": {
          particulars : "Other Unsecured Loans",
          sysCode:2020,
          editable:true,
          rowNumber:26
          }
    },
    {
      "lineEntry": {
          particulars : "Long Term Borrowings",
          sysCode:2021,
          editable:true,
          rowNumber:27
          }
    },
    {
      "lineEntry": {
          particulars : "Liability component of CCD's",
          sysCode:2022,
          editable:true,
          rowNumber:28
          }
    },
    {
      "lineEntry": {
          particulars : "Long-Term Provisions",
          sysCode:2023,
          editable:true,
          rowNumber:29
          }
    },
    {
      "lineEntry": {
          particulars : "Purchase consideration payable",
          sysCode:2024,
          editable:true,
          rowNumber:30
          }
    },
    {
      "lineEntry": {
          particulars : "Deferred Govt Grant",
          sysCode:2025,
          editable:true,
          rowNumber:31
          }
    },
    {
      "lineEntry": {
          particulars : "",
          sysCode:2026,
          editable:true,
          rowNumber:32,
          flaggedOff:true,
          }
    },
    {
      "lineEntry": {
          particulars : "Current Liabilities",
          sysCode:2027,
          header:true,
          editable:false,
          dependent:[2028,2029,2030,2031,2032,2033,2034],
          formula:"currentOne34+currentOne35+currentOne36+currentOne37+currentOne38+currentOne39+currentOne40",
          rowNumber:33
          }
    },
    {
      "lineEntry": {
          particulars : "Trade Payables",
          sysCode:2028,
          editable:true,
          rowNumber:34
          }
    },

    {
      "lineEntry": {
          particulars : "Employee Payables",
          sysCode:2029,
          editable:true,
          rowNumber:35
          }
    },
    {
      "lineEntry": {
          particulars : "Short Term Borrowings",
          sysCode:2030,
          editable:true,
          rowNumber:36
          }
    },
    {
      "lineEntry": {
          particulars : "LC Payables",
          sysCode:2031,
          editable:true,
          rowNumber:37
          }
    },
    {
      "lineEntry": {
          particulars : "Other Current Liabilities",
          sysCode:2032,
          editable:true,
          rowNumber:38
          }
    },
    {
      "lineEntry": {
          particulars : "Short Term Provisions",
          sysCode:2033,
          editable:true,
          rowNumber:39
          }
    },
    {
      "lineEntry": {
          particulars : "Inter-Co",
          sysCode:2034,
          editable:true,
          rowNumber:40
          }
    },
    {
      "lineEntry": {
          particulars : "TOTAL",
          sysCode:2035,
          editable:false,
          dependent:[2028,2029,2030,2031,2032,2033,2034,2019,2020,2021,2022,2023,2024,2025,2026,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,
            2013,2014,2015,2016,2017],
          formula:"currentOne34+currentOne35+currentOne36+currentOne37+currentOne38+currentOne39+currentOne40+currentOne25+currentOne26+currentOne27+currentOne28+currentOne29+currentOne30+currentOne31+currentOne32+currentOne7+currentOne8+currentOne9+currentOne10+currentOne11+currentOne12+currentOne13+currentOne14+currentOne15+currentOne16+currentOne17+currentOne18+currentOne19+currentOne20+currentOne21+currentOne22",
          subHeader:true,
          rowNumber:41
          }
    },
    {
      "lineEntry": {
          particulars : "ASSETS",
          sysCode:2036,
          editable:false,
          header:true,
          rowNumber:43
          }
    },
    {
      "lineEntry": {
          particulars : "Non-Current Assets",
          sysCode:2037,
          editable:false,
          header:true,
          dependent:[2040,2041,2042,2043,2044,2045,2047,2048,2049,2050,2051],
          formula:"currentOne48+currentOne49+currentOne50+currentOne51+currentOne52+currentOne53+currentOne55+currentOne56+currentOne57+currentOne58+currentOne59",
          rowNumber:45
          }
    },

    {
      "lineEntry": {
          particulars : "Fixed Assets(Gross)",
          sysCode:2038,
          editable:false,
          subHeader:true,
          dependent:[2040,2041,2042,2043,2044,2045],
          formula:"currentOne48+currentOne49+currentOne50+currentOne51+currentOne52+currentOne53",
          rowNumber:46
          }
    },
    {
      "lineEntry": {
          particulars : "Net Fixed Assets",
          sysCode:2039,
          editable:false,
          header:true,
          rowNumber:47
          }
    },
    {
      "lineEntry": {
          particulars : "---Tangible Assets",
          sysCode:2040,
          editable:true,
          subHeader:true,
          rowNumber:48
          }
    },
    {
      "lineEntry": {
          particulars : "---Intangible Assets",
          sysCode:2041,
          editable:true,
          subHeader:true,
          rowNumber:49
          }
    },
    {
      "lineEntry": {
          particulars : "---Capital Work in Progress",
          sysCode:2042,
          editable:true,
          subHeader:true,
          rowNumber:50
          }
    },
    {
      "lineEntry": {
          particulars : "---Pre Operative Expenses",
          sysCode:2043,
          editable:true,
          subHeader:true,
          rowNumber:51
          }
    },
    {
      "lineEntry": {
          particulars : "---Capital Advances",
          sysCode:2044,
          editable:true,
          subHeader:true,
          rowNumber:52
          }
    },
    {
      "lineEntry": {
          particulars : "---Capital Liabilities",
          sysCode:2045,
          editable:true,
          subHeader:true,
          rowNumber:53
          }
    },
    {
      "lineEntry": {
          particulars : "",
          sysCode:2046,
          editable:true,
          subHeader:true,
          rowNumber:54,
          flaggedOff:true
          }
    },
    {
      "lineEntry": {
          particulars : "Goodwill ",
          sysCode:2047,
          editable:true,
          subHeader:true,
          rowNumber:55
          }
    },
    {
      "lineEntry": {
          particulars : "Non-current Investment ",
          sysCode:2048,
          editable:true,
          subHeader:true,
          rowNumber:56
          }
    },
    {
      "lineEntry": {
          particulars : "Inter-Co-Inv",
          sysCode:2049,
          editable:true,
          subHeader:true,
          rowNumber:57
          }
    },
    {
      "lineEntry": {
          particulars : "Other Non Current Assets",
          sysCode:2050,
          editable:true,
          subHeader:true,
          rowNumber:58
          }
    },
    {
      "lineEntry": {
          particulars : "Deferred Tax Assets",
          sysCode:2051,
          editable:true,
          subHeader:true,
          rowNumber:59
          }
    },
    {
      "lineEntry": {
          particulars : "",
          sysCode:2052,
          editable:true,
          subHeader:true,
          rowNumber:60,
          flaggedOff:true
          }
    },
    {
      "lineEntry": {
          particulars : "Current Assets, Loans & Advances",
          sysCode:2053,
          editable:false,
          dependent:[2054,2055,2056,2057,2058,2059,2060,2061],
          formula:"currentOne62+currentOne63+currentOne64+currentOne65+currentOne66+currentOne67+currentOne68+currentOne69",
          rowNumber:61
          }
    },
    {
      "lineEntry": {
          particulars : "Cash and Cash Equivalents",
          sysCode:2054,
          editable:true,
          rowNumber:62
          }
    },
    {
      "lineEntry": {
          particulars : "Bank Balances",
          sysCode:2055,
          editable:true,
          rowNumber:63
          }
    },
    {
      "lineEntry": {
          particulars : "Trade Receivables",
          sysCode:2056,
          editable:true,
          rowNumber:64
          }
    },
    {
      "lineEntry": {
          particulars : "Unbilled Revenues",
          sysCode:2057,
          editable:true,
          rowNumber:65
          }
    },
    {
      "lineEntry": {
          particulars : "Inventories",
          sysCode:2058,
          editable:true,
          rowNumber:66
          }
    },
    {
      "lineEntry": {
          particulars : "Advances",
          sysCode:2059,
          editable:true,
          rowNumber:67
          }
    },
    {
      "lineEntry": {
          particulars : "Short Term Investments",
          sysCode:2060,
          editable:true,
          rowNumber:68
          }
    },
    {
      "lineEntry": {
          particulars : "Other Current Assets",
          sysCode:2061,
          editable:true,
          rowNumber:69
          }
    },
    {
      "lineEntry": {
          particulars : "-",
          sysCode:2062,
          editable:true,
          rowNumber:70,
          flaggedOff:true
          }
    },
    {
      "lineEntry": {
          particulars : "-",
          sysCode:2063,
          editable:true,
          rowNumber:71,
          flaggedOff:true
          }
    },

    {
      "lineEntry": {
          particulars : "TOTAL",
          sysCode:2064,
          editable:false,
          header:true,
          dependent:[2038,2047,2048,2049,2050,2051,2054,2055,2056,2057,2058,2059,2060,2061],
          formula:"currentOne48+currentOne49+currentOne50+currentOne51+currentOne52+currentOne53+currentOne55+currentOne56+currentOne57+currentOne58+currentOne59+currentOne62+currentOne63+currentOne64+currentOne65+currentOne66+currentOne67+currentOne68+currentOne69",
          rowNumber:72
          }
    }
  ]

  export const PROFIT_LOSS = [
    {
    "lineEntry": {
        particulars : "Revenue from Operations",
        sysCode:1001,
        header:true,
        rowNumber:5
        }
    },
    {
      "lineEntry": {
          particulars : "Income From Operation",
          sysCode:1002,
          editable:true,
          rowNumber:7
          }
    },
    {
      "lineEntry": {
          particulars : "other operating income",
          sysCode:1003,
          editable:true,
          rowNumber:8
          }
    },
    {
      "lineEntry": {
          particulars : "Revenue from Operations",
          sysCode:1004,
          editable:false,
          subHeader:true,
          dependent:[1002,1003],
          formula:"currentOne7+currentOne8",
          rowNumber:9
          }
    },
    {
      "lineEntry": {
          particulars : "EXPENSES",
          sysCode:1005,
          header:true,
          rowNumber:11
          }
    },
    {
      "lineEntry": {
          particulars : "Cost of Material Consumed",
          sysCode:1006,
          editable:true,
          rowNumber:13
          }
    },
    {
      "lineEntry": {
          particulars : "Purchase of Stock in Trade",
          sysCode:1007,
          editable:true,
          rowNumber:14
          }
    },
    {
      "lineEntry": {
          particulars : "Change in Inventory",
          sysCode:1008,
          editable:true,
          rowNumber:15
          }
    },
    {
      "lineEntry": {
          particulars : "Employee Benefit Expenses",
          sysCode:1009,
          editable:true,
          rowNumber:16
          }
    },
    {
      "lineEntry": {
          particulars : "Power & Fuel",
          sysCode:1010,
          editable:true,
          rowNumber:17
          }
    },
    {
      "lineEntry": {
          particulars : "Labour Charges",
          sysCode:1011,
          editable:true,
          rowNumber:18
          }
    },
    {
      "lineEntry": {
          particulars : "Selling & Administrative Overhead",
          sysCode:1012,
          editable:true,
          rowNumber:19
          }
    },
    {
      "lineEntry": {
          particulars : "(D)",
          sysCode:1013,
          editable:true,
          subHeader:true,
          rowNumber:20
          }
    },
    {
      "lineEntry": {
          particulars : "(E)",
          sysCode:1014,
          editable:true,
          subHeader:true,
          rowNumber:21
          }
    },
    {
      "lineEntry": {
          particulars : "(F)",
          sysCode:1015,
          editable:true,
          subHeader:true,
          rowNumber:22
          }
    },
    {
      "lineEntry": {
          particulars : "Total (A+B+C+D+E+F)",
          sysCode:1016,
          editable:false,
          dependent:[1009,1010,1011,1012,1013,1014,1015],
          formula:"currentOne16+currentOne17+currentOne18+currentOne19+currentOne20+currentOne21+currentOne22",
          rowNumber:23
          }
    },
    {
      "lineEntry": {
          particulars : "Earnings before exceptional items, extraordinary items, interest, tax, depreciation and amortisation (EBITDA)",
          sysCode:1017,
          header:true,
          editable:false,
          dependent:[1002,1003,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015],
          formula:"currentOne7+currentOne8-currentOne13-currentOne14-currentOne15-currentOne16-currentOne17-currentOne18-currentOne19-currentOne20-currentOne21-currentOne22", //wrong formula
          rowNumber:25
          }
    },
    {
      "lineEntry": {
          particulars : "Less: Depreciation & Amortization",
          sysCode:1018,
          editable:true,
          rowNumber:26
          }
    },

    {
      "lineEntry": {
          particulars : "EBIT",
          sysCode:1019,
          editable:false,
          dependent:[1002,1003,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1018],
          formula:"currentOne7+currentOne8-currentOne13-currentOne14-currentOne15-currentOne16+currentOne17+currentOne18+currentOne19+currentOne20+currentOne21+currentOne22-currentOne26",
          rowNumber:27
          }
    },
    {
      "lineEntry": {
          particulars : "Less: Finance Costs",
          sysCode:1020,
          editable:true,
          rowNumber:28
          }
    },
    {
      "lineEntry": {
          particulars : "Add: Other Income",
          sysCode:1021,
          editable:true,
          rowNumber:29
          }
    },
    {
      "lineEntry": {
          particulars : "Profit / (Loss) before exceptional and extraordinary items and tax ",
          sysCode:1022,
          editable:false,
          dependent:[1002,1003,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1018,1020,1021],
          formula:"currentOne7+currentOne8-currentOne13-currentOne14-currentOne15-currentOne16+currentOne17+currentOne18+currentOne19+currentOne20+currentOne21+currentOne22-currentOne26-currentOne28+currentOne29",
          rowNumber:30
          }
    },
    {
      "lineEntry": {
          particulars : "Exceptional Items",
          sysCode:1023,
          editable:true,
          rowNumber:31
          }
    },
    {
      "lineEntry": {
          particulars : "Profit / (Loss) before extraordinary items and tax  ",
          sysCode:1024,
          editable:false,
          dependent:[1002,1003,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1018,1020,1021,1023],
          formula:"currentOne7+currentOne8-currentOne13-currentOne14-currentOne15-currentOne16+currentOne17+currentOne18+currentOne19+currentOne20+currentOne21+currentOne22-currentOne26-currentOne28+currentOne29+currentOne31",
          rowNumber:32
          }
    },
    {
      "lineEntry": {
          particulars : "Extraordinary items",
          sysCode:1025,
          editable:true,
          rowNumber:33
          }
    },
    {
      "lineEntry": {
          particulars : "Profit / (Loss) before tax ",
          sysCode:1026,
          editable:false,
          dependent:[1002,1003,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1018,1020,1021,1023,1025],
          formula:"currentOne7+currentOne8-currentOne13-currentOne14-currentOne15-currentOne16+currentOne17+currentOne18+currentOne19+currentOne20+currentOne21+currentOne22-currentOne26-currentOne28+currentOne29+currentOne31+currentOne33",
          rowNumber:34
          }
    },
    {
      "lineEntry": {
          particulars : "Tax expense:",
          sysCode:1027,
          editable:false,
          dependent:[1028,1029,1030,1031,1032],
          formula:"currentOne36+currentOne37+currentOne38+currentOne39+currentOne40",
          rowNumber:35
          }
    },
    {
      "lineEntry": {
          particulars : "(a) Current tax expense for current year",
          sysCode:1028,
          editable:true,
          subHeader:true,
          rowNumber:36
          }
    },
    {
      "lineEntry": {
          particulars : "(b) (Less): MAT credit (where applicable)",
          sysCode:1029,
          editable:true,
          subHeader:true,
          rowNumber:37
          }
    },
    {
      "lineEntry": {
          particulars : "(c) Current tax expense relating to prior years",
          sysCode:1030,
          editable:true,
          subHeader:true,
          rowNumber:38
          }
    },
    {
      "lineEntry": {
          particulars : "(d) Net current tax expense ",
          sysCode:1031,
          editable:true,
          subHeader:true,
          rowNumber:39
          }
    },
    {
      "lineEntry": {
          particulars : "(e) Deferred tax",
          sysCode:1032,
          editable:true,
          subHeader:true,
          rowNumber:40
          }
    },
    {
      "lineEntry": {
          particulars : "Profit / (Loss) from continuing operations ",
          sysCode:1033,
          editable:false,
          header:true,
          dependent:[1002,1003,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1018,1020,1021,1023,1025,1028,1029,1030,1031,1032],
          formula:"currentOne7+currentOne8-currentOne13-currentOne14-currentOne15-currentOne16+currentOne17+currentOne18+currentOne19+currentOne20+currentOne21+currentOne22-currentOne26-currentOne28+currentOne29+currentOne31+currentOne33-currentOne36-currentOne37-currentOne38-currentOne39-currentOne40",
          rowNumber:42
          }
    },
    {
      "lineEntry": {
          particulars : "DISCONTINUING OPERATIONS",
          sysCode:1034,
          editable:false,
          header:true,
          dependent:[1035,1036,1037,1038,1039],
          formula:"currentOne45+currentOne46+currentOne48+currentOne49+currentOne50",
          rowNumber:44
          }
    },
    {
      "lineEntry": {
          particulars : "Profit / (Loss) from discontinuing operations (before tax)",
          sysCode:1035,
          editable:true,
          rowNumber:45
          }
    },
    {
      "lineEntry": {
          particulars : "Gain / (Loss) on disposal of assets / settlement of liabilities attributable to the discontinuing operations",
          sysCode:1036,
          editable:true,
          rowNumber:46
          }
    },
    {
      "lineEntry": {
          particulars : "Add / (Less): Tax expense of discontinuing operations",
          sysCode:1037,
          editable:true,
          rowNumber:48
          }
    },
    {
      "lineEntry": {
          particulars : "(a) on ordinary activities attributable to the discontinuing operations",
          sysCode:1038,
          editable:true,
          rowNumber:49
          }
    },

    {
      "lineEntry": {
          particulars : "(b) on gain / (loss) on disposal of assets / settlement of liabilities",
          sysCode:1039,
          editable:true,
          rowNumber:50
          }
    },
    {
      "lineEntry": {
          particulars : "Profit / (Loss) from discontinuing operations net of tax",
          sysCode:1040,
          header:true,
          editable:false,
          dependent:[1002, 1003, 1004, 1006, 1007, 1008, 1010, 1011, 1012, 1013, 1014, 1015, 1018, 1020, 1021, 1023, 1025, 1028, 1029, 1030, 1031, 1032, 1035, 1036, 1037, 1038, 1039],
          formula:"currentOne7 + currentOne8 - (currentOne17+currentOne18+currentOne19+currentOne20+currentOne21+currentOne22) - currentOne13 - currentOne14 - currentOne15 - currentOne26 - currentOne28 + currentOne29 - currentOne31 - currentOne33 - (currentOne36 + currentOne37 + currentOne38 + currentOne39 + currentOne40) - (currentOne45 + currentOne46+ currentOne47+currentOne48 +currentOne49 +currentOne50)",
          rowNumber:52
          }
    },
    {
      "lineEntry": {
          particulars : "Profit / (Loss) for the year",
          sysCode:1041,
          header:true,
          editable:true,
          dependent:[1002,1003,1006,1007,1008,1009,1010,1011,1012,1013,1014,1015,1018,1020,1021,1023,1025,1028,1029,1030,1031,1032,1040],
          formula:"currentOne7+currentOne8-currentOne13-currentOne14-currentOne15-currentOne16+currentOne17+currentOne18+currentOne19+currentOne20+currentOne21+currentOne22-currentOne26-currentOne28+currentOne29+currentOne31+currentOne33-currentOne36-currentOne37-currentOne38-currentOne39-currentOne40+currentOne52",
          rowNumber:54
          }
    },
    {
      "lineEntry": {
          particulars : "Minority Interest ",
          sysCode:1042,
          editable:true,
          rowNumber:55
          }
    },
    {
      "lineEntry": {
          particulars : "Share in profit of Associates",
          sysCode:1043,
          editable:true,
          rowNumber:56
          }
    },
    {
      "lineEntry": {
          particulars : "Net Profit after minority interests",
          sysCode:1044,
          editable:true,
          rowNumber:57
          }
    },
    {
      "lineEntry": {
          particulars : "Earning per Share(EPS)",
          sysCode:1045,
          editable:false,
          rowNumber:58,
          flaggedOff:true
          }
    }
  ]

  export const RULE_ELEVEN_UA = [
    {
      "lineEntry": {
          particulars : "Assets",
          sysCode:4001,
          editable:false,
          header:true,
          rowNumber:2
      }
    },
    {
      "lineEntry": {
        particulars : "Non-current Assets",
        sysCode:4002,
        editable:false,
        header:true,
        rowNumber:3
      },
    },
    {
      "lineEntry": {
        particulars : "Tangible Assets",
        sysCode:4003,
        editable:true,
        rowNumber:4
      }
    },
    {
      "lineEntry": {
        particulars : "- Immovable Property",
        sysCode:4004,
        editable:true,
        subHeader:true,
        rowNumber:5
      }
    },
    {
      "lineEntry": {
        particulars : "- Jewellery",
        sysCode:4005,
        editable:true,
        subHeader:true,
        rowNumber:6
      }
    },
    {
      "lineEntry": {
        particulars : "- Artistic Work",
        sysCode:4006,
        editable:true,
        subHeader:true,
        rowNumber:7
      }
    },
    {
      "lineEntry": {
        particulars : "-Shares & Securities",
        sysCode:4007,
        editable:true,
        subHeader:true,
        rowNumber:8
      }
    },
    {
      "lineEntry": {
        particulars : "- Other Tangible Assets",
        sysCode:4008,
        editable:true,
        subHeader:true,
        rowNumber:9
      }
    },
    {
      "lineEntry": {
        particulars : "Intangible Assets",
        sysCode:4009,
        editable:true,
        rowNumber:10
      }
    },
    {
      "lineEntry": {
        particulars : "Right of use assets",
        sysCode:4010,
        editable:true,
        rowNumber:11
      }
    },
    {
      "lineEntry": {
        particulars : "Investments",
        sysCode:4011,
        editable:false,
        rowNumber:12
      }
    },
    {
      "lineEntry": {
        particulars : "- Investments in Share & Securities",
        sysCode:4012,
        editable:true,
        subHeader:true,
        rowNumber:13
      }
    },
    {
      "lineEntry": {
        particulars : "- Other Investments",
        sysCode:4013,
        editable:true,
        subHeader:true,
        rowNumber:14
      }
    },
    {
      "lineEntry": {
        particulars : "Financial Assets",
        sysCode:4014,
        editable:true,
        rowNumber:16
      }
    },
    {
      "lineEntry": {
        particulars : "Income Tax Assets (Net)",
        sysCode:4015,
        editable:true,
        rowNumber:17
      }
    },
    {
      "lineEntry": {
        particulars : "- Advance Tax",
        sysCode:4016,
        editable:true,
        subHeader:true,
        rowNumber:18
      }
    },
    {
      "lineEntry": {
        particulars : "- Income Tax Refund",
        sysCode:4017,
        editable:true,
        subHeader:true,
        rowNumber:19
      }
    },
    {
      "lineEntry": {
        particulars : "Deferred Tax Assets (Net)",
        sysCode:4018,
        editable:true,
        rowNumber:20
      }
    },
    {
      "lineEntry": {
        particulars : "Other non-current assets",
        sysCode:4019,
        editable:true,
        rowNumber:21
      }
    },
    {
      "lineEntry": {
        particulars : "Current Assets",
        sysCode:4020,
        editable:false,
        header:true,
        rowNumber:23
      }
    },
    {
      "lineEntry": {
        particulars : "Financial Assets ",
        sysCode:4021,
        editable:true,
        rowNumber:24
      }
    },
    {
      "lineEntry": {
        particulars : "Current Investments",
        sysCode:4022,
        editable:true,
        rowNumber:25
      }
    },
    {
      "lineEntry": {
        particulars : "- Investments in Share & Securities ",
        sysCode:4023,
        editable:true,
        subHeader:true,
        rowNumber:26
      }
    },
    {
      "lineEntry": {
        particulars : "- Other Investments ",
        sysCode:4024,
        editable:true,
        subHeader:true,
        rowNumber:27
      }
    },
    {
      "lineEntry": {
        particulars : "Trade Receivables",
        sysCode:4025,
        editable:true,
        rowNumber:28
      }
    },
    {
      "lineEntry": {
        particulars : "Cash & Cash Equivalents",
        sysCode:4026,
        editable:true,
        rowNumber:29
      }
    },
    {
      "lineEntry": {
        particulars : "Bank balances other than above",
        sysCode:4027,
        editable:true,
        rowNumber:30
      }
    },
    {
      "lineEntry": {
        particulars : "Loans",
        sysCode:4028,
        editable:true,
        rowNumber:31
      }
    },
    {
      "lineEntry": {
        particulars : "Other Financial assets",
        sysCode:4029,
        editable:true,
        rowNumber:32
      }
    },
    {
      "lineEntry": {
        particulars : "Unbilled work in progress (contract assets)",
        sysCode:4030,
        editable:true,
        rowNumber:33
      }
    },
    {
      "lineEntry": {
        particulars : "Other Current Assets",
        sysCode:4031,
        editable:true,
        rowNumber:34
      }
    },
    {
      "lineEntry": {
        particulars : "- TDS Receivable",
        sysCode:4032,
        editable:true,
        subHeader:true,
        rowNumber:35
      }
    },
    {
      "lineEntry": {
        particulars : "- Advance Tax Paid",
        sysCode:4033,
        editable:true,
        subHeader:true,
        rowNumber:36
      }
    },
    {
      "lineEntry": {
        particulars : "- Preliminary Expenses",
        sysCode:4034,
        editable:true,
        subHeader:true,
        rowNumber:37
      }
    },
    {
      "lineEntry": {
        particulars : "- Pre-operative Expenses",
        sysCode:4035,
        editable:true,
        subHeader:true,
        rowNumber:38
      }
    },
    {
      "lineEntry": {
        particulars : "- Other Miscellaneous Expenses",
        sysCode:4036,
        editable:true,
        subHeader:true,
        rowNumber:39
      }
    },
    {
      "lineEntry": {
        particulars : "Total Assets",
        sysCode:4037,
        editable:false,
        rowNumber:41,
        dependent:[4004,4005,4006,4007,4008,4009,4010,4011,4012,4013,4014,4015,4016,4017,4018,4019,4021,4022,4023,4024,4025,4026,4027,4028,4029,4030,4031,4032,4033,4034,4035,4036],
        formula:'currentOne5+currentOne6+currentOne7+currentOne8+currentOne9+currentOne10+currentOne11+currentOne12+currentOne13+currentOne14+currentOne16+currentOne17+currentOne18+currentOne19+currentOne20+currentOne21+currentOne24+currentOne25+currentOne26+currentOne27+currentOne28+currentOne29+currentOne30+currentOne31+currentOne32+currentOne33+currentOne34+currentOne35+currentOne36+currentOne37+currentOne38+currentOne39',
        header:true
      }
    },
    {
      "lineEntry": {
        particulars : "Equity & Liabilities",
        sysCode:4038,
        editable:false,
        header:true,
        rowNumber:43,
      }
    },
    {
      "lineEntry": {
        particulars : "Equity",
        sysCode:4039,
        header:true,
        editable:false,
        rowNumber:44
      }
    },
    {
      "lineEntry": {
        particulars : "Share Capital",
        sysCode:4040,
        editable:true,
        rowNumber:45
      }
    },
    {
      "lineEntry": {
        particulars : "Reserve & Surplus",
        sysCode:4041,
        editable:true,
        rowNumber:46
      }
    },
    {
      "lineEntry": {
        particulars : "Amount Set Apart for payment of Dividends",
        sysCode:4042,
        editable:true,
        rowNumber:47
      }
    },
    {
      "lineEntry": {
        particulars : "Non-Current Liabilities",
        sysCode:4043,
        editable:false,
        header:true,
        rowNumber:49
      }
    },
    {
      "lineEntry": {
        particulars : "Financial Liabilities",
        sysCode:4044,
        editable:true,
        rowNumber:50
      }
    },
    {
      "lineEntry": {
        particulars : "- Borrowings",
        sysCode:4045,
        editable:true,
        subHeader:true,
        rowNumber:51
      }
    },
    {
      "lineEntry": {
        particulars : "- Lease Liabilities",
        sysCode:4046,
        editable:true,
        subHeader:true,
        rowNumber:52
      }
    },
    {
      "lineEntry": {
        particulars : "Provisions",
        sysCode:4047,
        editable:true,
        rowNumber:53
      }
    },
    {
      "lineEntry": {
        particulars : "- Provision for Taxation",
        sysCode:4048,
        editable:true,
        subHeader:true,
        rowNumber:54
      }
    },
    {
      "lineEntry": {
        particulars : "- Other Provisions",
        sysCode:4049,
        editable:true,
        subHeader:true,
        rowNumber:55
      }
    },
    {
      "lineEntry": {
        particulars : "Deferred Tax Liabilites (net)",
        sysCode:4050,
        editable:true,
        rowNumber:56
      }
    },
    {
      "lineEntry": {
        particulars : "Other non-current liabilities",
        sysCode:4051,
        editable:true,
        rowNumber:57
      }
    },
    {
      "lineEntry": {
        particulars : "Current Liabilities",
        sysCode:4052,
        editable:false,
        header:true,
        rowNumber:59
      }
    },
    {
      "lineEntry": {
        particulars : "Financial Liabilities ",
        sysCode:4053,
        editable:true,
        rowNumber:60
      }
    },
    {
      "lineEntry": {
        particulars : "- Borrowings ",
        sysCode:4054,
        editable:true,
        subHeader:true,
        rowNumber:61
      }
    },
    {
      "lineEntry": {
        particulars : "- Lease Liabilities ",
        sysCode:4055,
        editable:true,
        subHeader:true,
        rowNumber:62
      }
    },
    {
      "lineEntry": {
        particulars : "- Trade Payables",
        sysCode:4056,
        editable:true,
        subHeader:true,
        rowNumber:63
      }
    },
    {
      "lineEntry": {
        particulars : "- Other financial liabilities",
        sysCode:4057,
        editable:true,
        subHeader:true,
        rowNumber:64
      }
    },
    {
      "lineEntry": {
        particulars : "Provisions ",
        sysCode:4058,
        editable:true,
        rowNumber:65
      }
    },
    {
      "lineEntry": {
        particulars : "Current Tax liabilities",
        sysCode:4059,
        editable:true,
        rowNumber:66
      }
    },
    {
      "lineEntry": {
        particulars : "Other Current liabilities",
        sysCode:4060,
        editable:true,
        rowNumber:67
      }
    },
    {
      "lineEntry": {
        particulars : "Total Equity & Liabilities",
        sysCode:4061,
        editable:false,
        header:true,
        rowNumber:69,
        dependent:[4040,4041,4042,4044,4045,4046,4047,4048,4049,4050,4051,4053,4054,4055,4056,4057,4058,4059,4060],
        formula:'currentOne45+currentOne46+currentOne47+currentOne50+currentOne51+currentOne52+currentOne53+currentOne54+currentOne55+currentOne56+currentOne57+currentOne60+currentOne61+currentOne62+currentOne63+currentOne64+currentOne65+currentOne66+currentOne67'
      }
    }
  ]
  

//   export const ASSESSMENT_SHEET_DATA=[ // keep this for reference,once assessment table is implemented remove
//     {
//         "Particulars": "Operating Assets",
//         "2022-23": null,
//         "2023-24": null,
//         "2024-25": null
//     },
//     {
//         "Particulars": "Trade Recievables",
//         "2022-23": 61.3,
//         "2023-24": 103,
//         "2024-25": 40
//     },
//     {
//         "Particulars": "Unbilled Revenues",
//         "2022-23": 61.3,
//         "2023-24": 103,
//         "2024-25": 40
//     },
//     {
//         "Particulars": "Inventories",
//         "2022-23": 61.3,
//         "2023-24": 103,
//         "2024-25": 40
//     },
//     {
//         "Particulars": "Advances",
//         "2022-23": 61.3,
//         "2023-24": 103,
//         "2024-25": 40
//     },
//     {
//         "Particulars": "Short Term Investments",
//         "2022-23": 61.3,
//         "2023-24": 103,
//         "2024-25": 40
//     },
//     {
//         "Particulars": "Other Current Assets",
//         "2022-23": "",
//         "2023-24": "",
//         "2024-25": ""
//     },
//     {
//         "Particulars": "Non Current Assets",
//         "2022-23": 61.3,
//         "2023-24": 103,
//         "2024-25": 40
//     },
//     {
//         "Particulars": "Other Operating Assets",
//         "2022-23": 61.3,
//         "2023-24": 103,
//         "2024-25": 40
//     },
//     {
//         "Particulars": "Total",
//         "2022-23": 61.3,
//         "2023-24": 103,
//         "2024-25": 40
//     },
//     {
//         "Particulars": "  "
//     },
//     {
//         "Particulars": "Operating Liabilities",
//         "2022-23": null,
//         "2023-24": null,
//         "2024-25": null
//     },
//     {
//         "Particulars": "Trade Payables",
//         "2022-23": 61.3,
//         "2023-24": 103,
//         "2024-25": 40
//     },
//     {
//         "Particulars": "Employee Payables",
//         "2022-23": 61.3,
//         "2023-24": 103,
//         "2024-25": 40
//     },
//     {
//         "Particulars": "LC Payables",
//         "2022-23": 61.3,
//         "2023-24": 103,
//         "2024-25": 40
//     },
//     {
//         "Particulars": "Other Current Liablities",
//         "2022-23": "",
//         "2023-24": "",
//         "2024-25": ""
//     },
//     {
//         "Particulars": "Short Term Provisions",
//         "2022-23": 61.3,
//         "2023-24": 103,
//         "2024-25": 40
//     },
//     {
//         "Particulars": "Long Term Provisions",
//         "2022-23": 61.3,
//         "2023-24": 103,
//         "2024-25": 40
//     },
//     {
//         "Particulars": "Other Operating Liabilities",
//         "2022-23": 61.3,
//         "2023-24": 103,
//         "2024-25": 40
//     },
//     {
//         "Particulars": "Total",
//         "2022-23": 61.3,
//         "2023-24": 103,
//         "2024-25": 40
//     }
// ]

export const  AWS_STAGING = {
  PROD:'prod'
}
export const DOCUMENT_UPLOAD_TYPE = {
  FINANCIAL_EXCEL: 'ifin-financial-sheet',
  VALUATION_REPORT: 'ifin-reports'
}

export const XML_FORMAT = /<("[^"]*"|'[^']*'|[^'">])*>/;

export const REPORT_LINE_ITEM = ['PAT','Depn. and Amortn.','Other Non Cash items','Change in NCA','Change in Borrowings','Add/Less: Deferred Tax Assets(Net)','Net Cash Flow','Change in fixed assets','FCFE','Discounting Period','Discounting Factor','Present Value of FCFF','Present Value of FCFE','Sum of Discounted Cash Flows','Add: Cash & Cash Equivalents','Add: Surplus Assets/Investments','Add/Less: Other Adjustments(if any)','No. of Shares','FCFF','Add: Interest Adjusted Taxes','Particulars','Less: Debt as on Date','No. of o/s Shares','Add:Stub Period Adjustment'];

export const BETA_SUB_TYPE = ['meanBeta', 'medianBeta'];

export const BETA_TYPE = ['levered', 'unlevered', 'market_beta'];

export const FINANCIAL_BASIS_TYPE = ['audited', 'managementCertified'];

export const REPORT_BETA_TYPES = {
  levered: 'Relevered Beta',
  unlevered: 'Unlevered Beta',
  market_beta: 'Market Beta',
  stock_beta:'Stock Beta'
}

export const MNEMONIC_ENUMS = {
  IQ_CUSTOM_BETA: 'IQ_CUSTOM_BETA',
  IQ_PBV: 'IQ_PBV',
  IQ_TEV_EBITDA: 'IQ_TEV_EBITDA',
  IQ_PRICE_SALES_CS: 'IQ_PRICE_SALES_CS',
  IQ_PRICE_SALES: 'IQ_PRICE_SALES',
  IQ_PE_EXCL_FWD_CIQ_COL: 'IQ_PE_EXCL_FWD_CIQ_COL',
  IQ_PE_EXCL_FWD_REUT: 'IQ_PE_EXCL_FWD_REUT',
  IQ_PE_EXCL_FWD_THOM: 'IQ_PE_EXCL_FWD_THOM',
  IQ_RISK_FREE_RATE_CS: 'IQ_RISK_FREE_RATE_CS',
  IQ_CURRENT_PORT: 'IQ_CURRENT_PORT',
  IQ_ST_DEBT: 'IQ_ST_DEBT',
  IQ_FIN_DIV_DEBT_CURRENT: 'IQ_FIN_DIV_DEBT_CURRENT',
  IQ_CURRENT_PORTION_LEASE_LIABILITIES: 'IQ_CURRENT_PORTION_LEASE_LIABILITIES',
  IQ_LT_DEBT: 'IQ_LT_DEBT',
  IQ_CAPITAL_LEASES: 'IQ_CAPITAL_LEASES',
  IQ_FIN_DIV_DEBT_LT: 'IQ_FIN_DIV_DEBT_LT',
  IQ_LT_PORTION_LEASE_LIABILITIES: 'IQ_LT_PORTION_LEASE_LIABILITIES',
  IQ_PREF_EQUITY: 'IQ_PREF_EQUITY',
  IQ_DILUT_WEIGHT: 'IQ_DILUT_WEIGHT',
  IQ_LASTSALEPRICE: 'IQ_LASTSALEPRICE',
  IQ_PE_NORMALIZED: 'IQ_PE_NORMALIZED',
  IQ_CLOSEPRICE: 'IQ_CLOSEPRICE',
  IQ_SHARESOUTSTANDING: 'IQ_SHARESOUTSTANDING',
  IQ_MARKETCAP: 'IQ_MARKETCAP',
  IQ_CASH_EQUIV: 'IQ_CASH_EQUIV',
  IQ_SECURED_DEBT: 'IQ_SECURED_DEBT',
  IQ_TEV: 'IQ_TEV',
  IQ_TOTAL_REV_AS_REPORTED: 'IQ_TOTAL_REV_AS_REPORTED',
  IQ_VOLUME: 'IQ_VOLUME',
  IQ_VWAP: 'IQ_VWAP',
  IQ_BETA: 'IQ_BETA',
  IQ_BETA_5YR: 'IQ_BETA_5YR'
}

export const MNEMONICS_ARRAY = [
  MNEMONIC_ENUMS.IQ_CURRENT_PORT,
  MNEMONIC_ENUMS.IQ_ST_DEBT,
  MNEMONIC_ENUMS.IQ_FIN_DIV_DEBT_CURRENT,
  MNEMONIC_ENUMS.IQ_CURRENT_PORTION_LEASE_LIABILITIES,
  MNEMONIC_ENUMS.IQ_LT_DEBT,
  MNEMONIC_ENUMS.IQ_CAPITAL_LEASES,
  MNEMONIC_ENUMS.IQ_FIN_DIV_DEBT_LT,
  MNEMONIC_ENUMS.IQ_LT_PORTION_LEASE_LIABILITIES,
  MNEMONIC_ENUMS.IQ_PREF_EQUITY,
  MNEMONIC_ENUMS.IQ_DILUT_WEIGHT,
  MNEMONIC_ENUMS.IQ_CLOSEPRICE,
  MNEMONIC_ENUMS.IQ_BETA  //for 5 yr beta calculation
];

export const MNEMONICS_ARRAY_2 = [
  MNEMONIC_ENUMS.IQ_PE_NORMALIZED,
  MNEMONIC_ENUMS.IQ_TEV_EBITDA,
  MNEMONIC_ENUMS.IQ_PRICE_SALES,
  MNEMONIC_ENUMS.IQ_PBV
];

export const MNEMONICS_ARRAY_3 = [
  MNEMONIC_ENUMS.IQ_CLOSEPRICE,
  MNEMONIC_ENUMS.IQ_SHARESOUTSTANDING,
  MNEMONIC_ENUMS.IQ_MARKETCAP,
  MNEMONIC_ENUMS.IQ_CASH_EQUIV,
  MNEMONIC_ENUMS.IQ_SECURED_DEBT,
  MNEMONIC_ENUMS.IQ_TEV,
  MNEMONIC_ENUMS.IQ_TOTAL_REV_AS_REPORTED
]

export const MNEMONICS_ARRAY_4 = [
  MNEMONIC_ENUMS.IQ_VWAP,
  MNEMONIC_ENUMS.IQ_VOLUME
]

export const MNEMONICS_ARRAY_5 = [
  MNEMONIC_ENUMS.IQ_BETA
]

export const RATIO_TYPE = ['Company Based', 'Industry Based']