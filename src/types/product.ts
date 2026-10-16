export type UiProduct = {
  productId: string;
  name: string;
  price: number;
  priceDisplay: string;
};

export type ApiProduct = {
  productId: string;
  title: string;
  price: number;
};

export type ProductDiscrepancy = {
  productId: string;
  uiName: string;
  apiTitle?: string;
  uiPrice: number;
  apiPrice?: number;
  reason: string;
};
