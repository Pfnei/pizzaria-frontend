
import { http } from "./httpClient.js";
import { CBaseCrudService } from "./baseCrudService.js";

class COrderService extends CBaseCrudService {
  constructor() {
    super("/orders", http);
  }

  async getMyOrders() {
    return await this.http.get(`${this.basePath}/mine`);
  }

}

export const orderService = new COrderService();
