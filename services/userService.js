// services/userService.js
import { http } from "./httpClient.js";
import { CBaseCrudService } from "./baseCrudService.js";

class CUserService extends CBaseCrudService {
  constructor() {
    super("/users", http); // Basis-Path + HttpClient
  }

  // 
  // we could add additoinal methods here then :)
  // async changePassword(id, newPassword) {
  //   const encodedId = encodeURIComponent(String(id));
  //   return await this.http.post(
  //     `${this.basePath}/${encodedId}/change-password`,
  //     { newPassword }
  //   );
  // }

  async getMe() {
    // Ruft GET /users/me auf
    return await this.http.get(`${this.basePath}/me`);
  }
}

export const userService = new CUserService();
