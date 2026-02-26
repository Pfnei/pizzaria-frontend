import { http } from "./httpClient.js";
import { CBaseCrudService } from "./baseCrudService.js";

class CUserService extends CBaseCrudService {
  constructor() {
    super("/users", http); // Basis-Path + HttpClient
  }

  async getMe() {
    return await this.http.get(`${this.basePath}/me`);
  }

}

export const userService = new CUserService();
