export interface beverageThumb {
    title: string;
    currentSlug: string; 
    labelImage: any;
    can: string;
    bgColor: string;
    backgroundImage: any;
}

export interface beverage {
    title: string;
    currentSlug: string; 
    labelImage: any;
    description: any;
    ingredients: any;
    can: string;
    percentage: number;
    style: string;
    category: string;
    link: string;
    bgColor: string;
    backgroundImage: any;
}

export interface aboutPage {
    title: string;
    ingress: string;
    heroImage: any;
    description: any;
}

export interface bookPage {
    title: string;
    ingress: string;
    heroImage: any;
    description: any;
}

export interface contactPage {
    title: string;
    ingress: string;
    heroImage: any;
    description: any;
}