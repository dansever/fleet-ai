export interface ResponseEnvelope<T> {
  data: T;
  success: boolean;
  message: string;
}
