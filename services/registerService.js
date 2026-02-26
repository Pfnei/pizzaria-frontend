import { http } from "./httpClient.js";
import { CBaseCrudService } from "./baseCrudService.js";

class CRegisterService extends CBaseCrudService {
  constructor() {
    super("/auth/register", http); // Basis-Path + HttpClient
  }

  async register(payload) {
    return this.create(payload);
  }
}

export const registerService = new CRegisterService();
