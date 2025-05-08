export interface Article {
    company: string;
    type: 'competitors' | 'sector';
    title: string;
    url: string;
    date_published: string;
    created_at: string;
}