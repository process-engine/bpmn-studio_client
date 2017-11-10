import {Response} from 'node-fetch';

export interface IErrorResponse {
  error: any;
}

export interface HttpHeader {
  [header: string]: string;
}

export function isErrorResult(result: any | IErrorResponse): result is IErrorResponse {
  return result.error !== undefined;
}

export async function throwOnErrorResponse<TResult = any>(response: Response): Promise<TResult> {
  const result: TResult | IErrorResponse = await response.json();
  if (isErrorResult(result)) {
    throw new Error(result.error);
  }

  return result;
}
