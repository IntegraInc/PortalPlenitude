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

// ✅ Nova interface para produtos
export interface Product {
  productCode: string;
  barcode: number;
  description: string;
  family: string;
  basePrice: number;
  availableStock: number;
  physicalStock: number;
  minStock: number;
  lastPurchaseDate: string;
  weightedAveragePrice: number;
  purchaseSuggestion: number;
  quantityToBuy: number;
  totalSales: number;
  average6Months: number;
  monthlySales: {
    month: string;
    total: number;
  }[];
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: Product[];
}
