export interface DatatableProps<TData, TValue> {
  data: any[];
  recordsTotal: number;
  recordsFiltered: number;
  globalFilter?: string;
}