export interface imagePalette {
  vibrant?: { background?: string };
  dominant?: { background?: string };
}

export interface imageMeta {
  aspectRatio?: number;
  lqip?: string;
  palette?: imagePalette;
}

export interface beverageThumb {
  title: string;
  currentSlug: string;
  labelImage: any;
  can: string;
  category?: string;
  style?: string;
  percentage?: number;
  bgColor?: string;
  backgroundImage?: any;
  labelMeta?: imageMeta;
}

export interface beverageLink {
  title: string;
  currentSlug: string;
  can: string;
  bgColor?: string;
  palette?: imagePalette;
}

export interface beverage {
  title: string;
  currentSlug: string;
  labelImage: any;
  /** Horizontal position of the label's front, in percent (0-100). */
  labelFront?: number;
  labelMeta?: imageMeta;
  description: any;
  ingredients: any;
  can: string;
  percentage?: number;
  style?: string;
  category: string;
  link?: string;
  bgColor?: string;
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
