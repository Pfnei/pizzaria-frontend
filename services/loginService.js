import { http } from "./httpClient.js";
import { CBaseCrudService } from "./baseCrudService.js";

class CLoginService extends CBaseCrudService {
  constructor() {
    super("/auth/login", http); 
  }

  async login(email, password) {
    return this.create({ email, password });
  }
}

export const loginService = new CLoginService();
