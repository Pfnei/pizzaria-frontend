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
}

export const userService = new CUserService();
