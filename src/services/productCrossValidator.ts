import type { ApiProduct, ProductDiscrepancy, UiProduct } from '../types/product';
import { namesLikelyMatch } from '../utils/text';
import { pricesClose } from '../utils/price';

export type CrossValidationResult = {
  matchedCount: number;
  discrepancies: ProductDiscrepancy[];
};

export class ProductCrossValidator {
  validate(uiProducts: UiProduct[], apiProducts: ApiProduct[]): CrossValidationResult {
    const apiById = new Map(apiProducts.map((product) => [product.productId, product]));
    const discrepancies: ProductDiscrepancy[] = [];
    let matchedCount = 0;

    for (const ui of uiProducts) {
      const api = apiById.get(ui.productId);
      if (!api) {
        discrepancies.push({
          productId: ui.productId,
          uiName: ui.name,
          uiPrice: ui.price,
          reason: 'Product ID from UI not found in intercepted PLP response',
        });
        continue;
      }

      matchedCount += 1;

      if (!namesLikelyMatch(ui.name, api.title)) {
        discrepancies.push({
          productId: ui.productId,
          uiName: ui.name,
          apiTitle: api.title,
          uiPrice: ui.price,
          apiPrice: api.price,
          reason: 'Title mismatch between UI and API',
        });
      }

      if (!Number.isNaN(api.price) && !pricesClose(ui.price, api.price, 0.05)) {
        discrepancies.push({
          productId: ui.productId,
          uiName: ui.name,
          apiTitle: api.title,
          uiPrice: ui.price,
          apiPrice: api.price,
          reason: 'Price mismatch between UI and API',
        });
      }
    }

    return { matchedCount, discrepancies };
  }
}
