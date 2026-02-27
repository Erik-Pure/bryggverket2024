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

export interface beveragesPage {
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

export interface landingPage {
  title: string;
  ingress: string;
  aboutTitle: string;
  aboutIngress: string;
  aboutDesc: any;
  drinkTitle: string;
  drinkIngress: string;
  drinkDesc: any;
  eventTitle: string;
  eventIngress: string;
  eventDesc: any;
  merchTitle: string;
  merchIngress: string;
  merchDesc: any;
}

export interface employee {
  title: string;
  role: string;
  profilePicture: any;
}
