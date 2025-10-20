
export class AuthStorageService
{
    static setToken(token)
    {
        try { localStorage.setItem("accessToken", token); } catch {}
        return this;
    }
    static  clearToken()
    {
        try { localStorage.removeItem("accessToken"); } catch {}
        return this;
    }
    static getToken()
    { try { return localStorage.getItem("accessToken"); } catch { return null; } }

}