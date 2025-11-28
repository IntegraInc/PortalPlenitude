export interface FiltersResponse {
 success: boolean;
 message: string;
 data: FiltersData;
}

export interface FiltersData {
 supplyer: Fornecedor[];
 paymentCondition: CondicaoPagamento[];
 paymentMethod: FormaPagamento[];
 family: Familia[];
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
 orderQuantity: number;
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
