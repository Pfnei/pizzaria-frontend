// services/registerService.js
import { http } from "./httpClient.js";
import { CBaseCrudService } from "./baseCrudService.js";

class CRegisterService extends CBaseCrudService {
  constructor() {
    super("/auth/register", http); // Basis-Path + HttpClient
  }

  async register(payload) {
    // POST /auth/register mit Body = payload
    return this.create(payload);
  }
}

export const registerService = new CRegisterService();
