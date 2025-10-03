// types/contracts.ts
export type ContractTerm = {
  key: string;
  value: {
    type: string; // "string", "number", etc.
    value: string | number | boolean;
  };
  section?: string;
  source?: {
    page?: number;
    span?: [number, number];
    snippet?: string;
  };
};

export type ContractTerms = ContractTerm[];

export type ExtractedContractData = {
  terms: ContractTerm[];
};
