// services/orderService.js (nur zur Einordnung)
import { http } from "./httpClient.js";
import { CBaseCrudService } from "./baseCrudService.js";

class COrderService extends CBaseCrudService {
  constructor() {
    super("/orders", http);
  }

//   async getMyOrders() {
//     return await this.http.get("/orders/my");
//   }
}

export const orderService = new COrderService();
