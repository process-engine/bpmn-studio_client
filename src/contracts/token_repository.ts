export interface ITokenRepository {
  getToken(): string;
  setToken(token: string): void;
}
