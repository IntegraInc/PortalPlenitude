export interface FiltersResponse {
  success: boolean;
  message: string;
  data: FiltersData;
}
export interface TablePriceResponse {
  data: TablePriceData;
}

export interface TablePriceData {
  tablePrice: string[];
}

export interface FiltersData {
  supplyer: Fornecedor[];
  paymentCondition: CondicaoPagamento[];
  paymentMethod: FormaPagamento[];
  family: Familia[];
}

export interface TablePriceProduct {
  productCode: string;
  barcode: number;
  description: string;
  familyName: string;
  familyCode: string;
  category: string;
  lastPurchaseCost: string; // vem formatado "R$41,80"
  capPrice: number;
  capPercent: number;
  salePrice: number;
  markupPercent: number;
  marginPercent: number;
  suggestedPriceByMargin: number;
  suggestedPriceByMarkup: number;
  availableStock: number;
  lastPurchaseDate: string; // "dd/MM/yyyy"
}
export interface TablePriceProductsResponse {
  success: boolean;
  message: string;
  data: TablePriceProduct[];
}
export interface Fornecedor {
  code: string;
  name: string;
}

export interface CondicaoPagamento {
  code: string;
  name: string;
}

export interface FormaPagamento {
  code: string;
  name: string;
}

export interface Familia {
  code: string;
  name: string;
}

// ✅ Nova interface para produtos
export interface Product {
  familyName: string;
  familyCode: string;
  lastPurchaseCost: string;
  stockTurnover: number;
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
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
