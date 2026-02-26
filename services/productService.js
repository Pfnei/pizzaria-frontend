import { http } from "./httpClient.js";
import { CBaseCrudService } from "./baseCrudService.js";

class CProductService extends CBaseCrudService {
  constructor() {
    super("/products", http); // Basis-Path + HttpClient
  }
    async getAllProducts() {
    return this.getAll();
  }

  async updateProduct(productId, productData) {
    return this.update(productId, productData);
  }
}

export const productService = new CProductService();