export interface IHeaders {
  [index: string]: string;
}
export interface IOptions {
  method: string;
  headers: IHeaders;
  keepAlive?: boolean;
}
