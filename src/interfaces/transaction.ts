export interface Transaction {
  id: string;
  inputs: Input[];
  outputs: Output[];
}

export interface Input {
  address: string;
}

export interface Output {
  address: string;
  value: number;
}
