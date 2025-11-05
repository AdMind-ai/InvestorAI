export interface RelatedCompany {
    name: string;
    stock_symbol: string;
    website: string;
    sectors: string[];
    logo: string;
    description: string;
    kind: "competitor" | "client" | "fornitori";
}

export interface CompanyCompetitors {
    date: string;
    company: string;
    competitors: RelatedCompany[];
}