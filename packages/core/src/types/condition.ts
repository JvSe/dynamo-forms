export type Operator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "isEmpty"
  | "isNotEmpty";

export type ConditionRule = {
  campo: string;
  operador: Operator;
  valor: any;
};

export type Condition = {
  action: "show" | "hide";
  tipo: "AND" | "OR";
  regras: ConditionRule[];
};
