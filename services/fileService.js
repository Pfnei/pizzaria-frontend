import { http } from "./httpClient.js";
import { CBaseCrudService } from "./baseCrudService.js";

class CFileService extends CBaseCrudService {
  constructor() {
    super("/files", http);
  }

  async uploadProfilePicture(userId,file) {
    const formData = new FormData();
    formData.append("file", file);

    const response =  await this.http.post(
      `${this.basePath}/profilepicture/${userId}`,
      formData
    );

    return response.data || null;
  }

 async downloadProfilePicture(userId) {
  const response = await this.http.get(`${this.basePath}/profile/${userId}`);

  return response;
}


    async uploadProductPicture(productId,file) {
        const formData = new FormData();
        formData.append("file", file);

        const response =  await this.http.post(
            `${this.basePath}/productpicture/${productId}`,
            formData
        );

        return response.data || null;
    }

    async downloadProductPicture(productId) {
        const response = await this.http.get(`${this.basePath}/product/${productId}`);

        return response;
    }


}

export const fileService = new CFileService();
