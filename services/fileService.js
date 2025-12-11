import { http } from "./httpClient.js";
import { CBaseCrudService } from "./baseCrudService.js";

class CFileService extends CBaseCrudService {
  constructor() {
    super("/files", http);
  }

  async uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append("file", file);

    return await this.http.post(
      `${this.basePath}/profilepicture`,
      formData
    );
  }

  async downloadProfilePicture(filename) {
    const encoded = encodeURIComponent(filename);

    // httpClient erkennt Blob automatisch, wenn Content-Type kein JSON ist
    return await this.http.get(
      `${this.basePath}/profile/${encoded}`
    );
  }
}

export const fileService = new CFileService();
