import { http } from "./httpClient.js";
import { CBaseCrudService } from "./baseCrudService.js";

class CProductService extends CBaseCrudService {
  constructor() {
    super("/products", http); // Basis-Path + HttpClient
  }
    async getAllProducts() {
    return this.getAll();
  }
    // async updateProductStatus(productId, isActive) {
    // return this.update(productId, { isActive });
    // }
}

export const productService = new CProductService();