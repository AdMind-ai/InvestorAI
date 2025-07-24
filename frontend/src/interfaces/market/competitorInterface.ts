export interface Competitor {
    competitor: string;
    logo?: string;
    sectors?: string[];
    description?: string;
    website?: string;
    stock_symbol?: string;
}

export interface CompanyCompetitors {
    date: string;
    company: string;
    competitors: Competitor[];
}