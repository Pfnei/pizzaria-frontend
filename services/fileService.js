import { http } from "./httpClient.js";
import { CBaseCrudService } from "./baseCrudService.js";

class CFileService extends CBaseCrudService {
  constructor() {
    super("/files", http);
  }

  async uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response =  await this.http.post(
      `${this.basePath}/profilepicture`,
      formData
    );

    return response.data || null;
  }

 async downloadProfilePicture() {
  const response = await this.http.get(`${this.basePath}/profile`);

  return response;
}
}

export const fileService = new CFileService();
