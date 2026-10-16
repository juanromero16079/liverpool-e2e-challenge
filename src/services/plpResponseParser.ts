import type { ApiProduct } from '../types/product';

type PriceInfo = {
  promoPrice?: { price?: number; minPrice?: number; maxPrice?: number };
  salePrice?: number;
  listPrice?: { price?: number };
};

type PlpRecord = {
  productId: string;
  title: string;
  priceInfo?: PriceInfo;
};

type PlpSearchResponse = {
  data?: {
    records?: PlpRecord[];
  };
};

function resolveApiPrice(priceInfo?: PriceInfo): number {
  if (!priceInfo) return Number.NaN;
  const promo = priceInfo.promoPrice?.price ?? priceInfo.promoPrice?.minPrice;
  if (typeof promo === 'number') return promo;
  if (typeof priceInfo.salePrice === 'number') return priceInfo.salePrice;
  if (typeof priceInfo.listPrice?.price === 'number') return priceInfo.listPrice.price;
  return Number.NaN;
}

export function parsePlpSearchResponse(body: PlpSearchResponse): ApiProduct[] {
  const records = body.data?.records ?? [];
  return records.map((record) => ({
    productId: String(record.productId),
    title: record.title.trim(),
    price: resolveApiPrice(record.priceInfo),
  }));
}
