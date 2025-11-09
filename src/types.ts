
export interface Student {
  rowIndex: number;
  name: string;
  lastPaymentDate: string;
  phone?: string | null;
  parentName?: string | null;
}

export interface Batches {
  [key: string]: Student[];
}
