export interface PaginationInterface<T = unknown> {
    count: number;
    next: string | null;
    previous: string | null
    results: T[]
}

export default PaginationInterface;