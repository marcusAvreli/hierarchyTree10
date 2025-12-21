export interface CardField {
  key: string;               // the property key from the data
  label?: string;            // optional display label
  format?: (value: any) => string; // optional formatting function
}
