export interface FiltersResponse {
  success: boolean;
  message: string;
  data: FiltersData;
}

export interface FiltersData {
  fornecedor: Fornecedor[];
  condicaoPagamento: CondicaoPagamento[];
  formaPagamento: FormaPagamento[];
  familia: Familia[];
}

export interface Fornecedor {
  codigo: string;
  nome: string;
}

export interface CondicaoPagamento {
  codigo: string;
  descricao: string;
}

export interface FormaPagamento {
  codigo: string;
  descricao: string;
}

export interface Familia {
  codigo: string;
  descricao: string;
}
