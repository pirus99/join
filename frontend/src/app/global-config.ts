export class GlobalConfig {
    static apiUrl: string = 'http://localhost:8000/';
    static apiEndpoint: string = 'api/v1/';
    static token: string | null = sessionStorage.getItem('authToken');
    static authHeader(): { [header: string]: string } {
        return {
            Authorization: `Token ${this.token}`
        };
    }
}