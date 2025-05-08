export interface Competitor {
    competitor: string;
    logo: string;
    sectors: string[];
    description: string;
    website: string;
}

export interface CompanyCompetitors {
    date: string;
    company: string;
    competitors: Competitor[];
}