export interface ResponseInterface<T = unknown> {
    type: string;
    data: T;
}

export default ResponseInterface;