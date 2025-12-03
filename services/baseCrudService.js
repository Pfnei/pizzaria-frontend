// services/baseCrudService.js
export class CBaseCrudService {
  constructor(basePath, httpClient) {
    this.basePath = basePath;  // z.B. "/users"
    this.http = httpClient;    // z.B. http-Singleton
  }

  async getAll(options) {
    const data = await this.http.get(this.basePath, options);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }

  async getById(id, options) {
    const encodedId = encodeURIComponent(String(id));
    return await this.http.get(`${this.basePath}/${encodedId}`, options);
  }

  async create(payload, options) {
    return await this.http.post(this.basePath, payload, options);
  }

  async update(id, payload, options) {
    const encodedId = encodeURIComponent(String(id));
    return await this.http.patch(`${this.basePath}/${encodedId}`, payload, options);
  }

  async delete(id, options) {
    const encodedId = encodeURIComponent(String(id));
    return await this.http.delete(`${this.basePath}/${encodedId}`, options);
  }
}
