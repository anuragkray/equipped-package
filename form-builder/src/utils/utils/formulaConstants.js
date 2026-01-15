export const IF_ELSE_SNIPPETS = [
  {
    label: 'If(${ } ${ }, "Yes", "No")',
    value: 'If(${ } ${ }, "Yes", "No")',
    display: 'If(${ } ${ }, "Yes", "No")',
    cursorOffset: 5, // after 'If(${' for easy typing
  },
];

export const ARITHMETIC_OPERATOR_SNIPPETS = [
  { label: '+', value: '+', display: '+ (Addition)', cursorOffset: 0 },
  { label: '-', value: '-', display: '- (Subtraction)', cursorOffset: 0 },
  { label: '*', value: '*', display: '* (Multiplication)', cursorOffset: 0 },
  { label: '/', value: '/', display: '/ (Division)', cursorOffset: 0 },
  { label: '%', value: '%', display: '% (Modulus)', cursorOffset: 0 },
  { label: '^', value: '^', display: '^ (Power)', cursorOffset: 0 },
];

export const COMPARISON_OPERATOR_SNIPPETS = [
  { label: '==', value: '==', display: '== (Equal)', cursorOffset: 0 },
  { label: '!=', value: '!=', display: '!= (Not equal)', cursorOffset: 0 },
  { label: '<', value: '<', display: '< (Less than)', cursorOffset: 0 },
  { label: '>', value: '>', display: '> (Greater than)', cursorOffset: 0 },
  { label: '<=', value: '<=', display: '<= (Less than or equal)', cursorOffset: 0 },
  { label: '>=', value: '>=', display: '>= (Greater than or equal)', cursorOffset: 0 },
];

export const MATH_FUNCTION_SNIPPETS = [
  { label: 'Abs', value: 'Abs()', display: 'Abs(x) (Absolute value)', cursorOffset: 4 },
  { label: 'Ceil', value: 'Ceil()', display: 'Ceil(x) (Round up)', cursorOffset: 5 },
  { label: 'Floor', value: 'Floor()', display: 'Floor(x) (Round down)', cursorOffset: 6 },
  { label: 'Round', value: 'Round()', display: 'Round(x, decimals) (Round to decimals)', cursorOffset: 6 },
  { label: 'Max', value: 'Max()', display: 'Max(a, b, ...) (Maximum of values)', cursorOffset: 4 },
  { label: 'Min', value: 'Min()', display: 'Min(a, b, ...) (Minimum of values)', cursorOffset: 4 },
  { label: 'Pow', value: 'Pow()', display: 'Pow(base, exp) (Power)', cursorOffset: 4 },
  { label: 'Sqrt', value: 'Sqrt()', display: 'Sqrt(x) (Square root)', cursorOffset: 5 },
  { label: 'Naturallog', value: 'Naturallog()', display: 'Naturallog(x) (Natural logarithm)', cursorOffset: 12 },
  { label: 'Base10log', value: 'Base10log()', display: 'Base10log(x) (Base 10 logarithm)', cursorOffset: 10 },
  { label: 'Average', value: 'Average()', display: 'Average(a, b, ...) (Arithmetic mean)', cursorOffset: 8 },
  { label: 'WeightedAverage', value: 'WeightedAverage()', display: 'WeightedAverage(values, weights) (Weighted mean)', cursorOffset: 17 },
];

export const DATE_FUNCTION_SNIPPETS = [
  { label: 'Now', value: 'Now()', display: 'Now() (Current date/time)', cursorOffset: 4 },
  { label: 'Adddate', value: 'Adddate()', display: 'Adddate(date, days) (Add days to date)', cursorOffset: 8 },
  { label: 'Subdate', value: 'Subdate()', display: 'Subdate(date, days) (Subtract days from date)', cursorOffset: 8 },
  { label: 'Dayofmonth', value: 'Dayofmonth()', display: 'Dayofmonth(date) (Day in month)', cursorOffset: 11 },
  { label: 'Month', value: 'Month()', display: 'Month(date) (Month number)', cursorOffset: 6 },
  { label: 'Year', value: 'Year()', display: 'Year(date) (Year)', cursorOffset: 5 },
  { label: 'Hour', value: 'Hour()', display: 'Hour(datetime) (Hour)', cursorOffset: 5 },
  { label: 'Minute', value: 'Minute()', display: 'Minute(datetime) (Minute)', cursorOffset: 7 },
  { label: 'Timestamp', value: 'Timestamp()', display: 'Timestamp(date) (Milliseconds since epoch)', cursorOffset: 10 },
  { label: 'FromTimestamp', value: 'FromTimestamp()', display: 'FromTimestamp(ms) (Convert timestamp to date)', cursorOffset: 14 },
  { label: 'Datecomp', value: 'Datecomp()', display: 'Datecomp(date1, date2) (Difference in ms)', cursorOffset: 9 },
  { label: 'DateBetween', value: 'DateBetween()', display: 'DateBetween(date, start, end) (Check if date is within range)', cursorOffset: 12 },
];

export const STRING_FUNCTION_SNIPPETS = [
  { label: 'Len', value: 'Len()', display: 'Len(str) (Length of string)', cursorOffset: 4 },
  { label: 'Find', value: 'Find()', display: 'Find(str, substr) (Index of substring)', cursorOffset: 5 },
  { label: 'Lower', value: 'Lower()', display: 'Lower(str) (Lowercase)', cursorOffset: 6 },
  { label: 'Upper', value: 'Upper()', display: 'Upper(str) (Uppercase)', cursorOffset: 6 },
  { label: 'Trim', value: 'Trim()', display: 'Trim(str) (Trim whitespace)', cursorOffset: 5 },
  { label: 'Concat', value: 'Concat()', display: 'Concat(a, b, ...) (Concatenate)', cursorOffset: 7 },
  { label: 'Substring', value: 'Substring()', display: 'Substring(str, start, len) (Extract substring)', cursorOffset: 10 },
  { label: 'Replace', value: 'Replace()', display: 'Replace(str, old, new) (Replace string)', cursorOffset: 8 },
  { label: 'Startswith', value: 'Startswith()', display: 'Startswith(str, prefix) (Check prefix)', cursorOffset: 11 },
  { label: 'Endswith', value: 'Endswith()', display: 'Endswith(str, suffix) (Check suffix)', cursorOffset: 9 },
  { label: 'Contains', value: 'Contains()', display: 'Contains(str, substr) (Check if contains)', cursorOffset: 9 },
  { label: 'CaseInsensitiveEquals', value: 'CaseInsensitiveEquals()', display: 'CaseInsensitiveEquals(a, b) (Case-insensitive equality)', cursorOffset: 23 },
  { label: 'IsEmpty', value: 'IsEmpty()', display: 'IsEmpty(str) (Check if empty or null)', cursorOffset: 8 },
];

export const CONVERSION_FUNCTION_SNIPPETS = [
  { label: 'Tonumber', value: 'Tonumber()', display: 'Tonumber(str) (Convert to number)', cursorOffset: 9 },
  { label: 'Tostring', value: 'Tostring()', display: 'Tostring(x) (Convert to string)', cursorOffset: 9 },
  { label: 'Newdate', value: 'Newdate()', display: 'Newdate(year, month, day) (Create new Date)', cursorOffset: 8 },
];

export const LOGIC_FUNCTION_SNIPPETS = [
  { label: 'And', value: 'And()', display: 'And(a, b, ...) (Logical AND)', cursorOffset: 4 },
  { label: 'Or', value: 'Or()', display: 'Or(a, b, ...) (Logical OR)', cursorOffset: 3 },
  { label: 'Not', value: 'Not()', display: 'Not(a) (Logical NOT)', cursorOffset: 4 },
];

export const FUNCTION_SNIPPETS = [
  ...MATH_FUNCTION_SNIPPETS,
  ...DATE_FUNCTION_SNIPPETS,
  ...STRING_FUNCTION_SNIPPETS,
  ...CONVERSION_FUNCTION_SNIPPETS,
  ...LOGIC_FUNCTION_SNIPPETS,
];
