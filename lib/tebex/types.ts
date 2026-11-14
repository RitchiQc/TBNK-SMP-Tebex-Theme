export type PackageType = "single" | "subscription" | "both";

export type PackageVariableType =
  | "dropdown"
  | "text"
  | "numeric"
  | "alpha"
  | "alphanumeric"
  | "username"
  | "email";

export interface AuthProvider {
  name: string;
  url: string;
}

export interface Webstore {
  name: string;
  description: string;
  logo: string | null;
  currency: string;
  lang: string;
  platformType: string;
  supportsUsernames: boolean;
  supportsGifting: boolean;
  disabled: boolean;
}

export interface PackageMedia {
  type: "image" | "video";
  url: string;
  name: string | null;
  primary: boolean;
  featured: boolean;
}

export interface PackageVariableOption {
  name: string;
  value: string;
}

export interface PackageVariable {
  /** Clé envoyée dans `variable_data` lors de l'ajout au panier. */
  identifier: string;
  type: PackageVariableType;
  options: PackageVariableOption[];
}

export interface Package {
  id: number;
  ident: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  media: PackageMedia[];
  type: PackageType;
  basePrice: number;
  /** Montant déduit de basePrice pour atteindre totalPrice. */
  discount: number;
  totalPrice: number;
  currency: string;
  expirationDate: string | null;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  variables: PackageVariable[];
  disableQuantity: boolean;
  disableGifting: boolean;
  order: number;
  featured: boolean;
  popular: boolean;
  /** Pourcentage de réduction calculé (0 si pas de promo). */
  discountPercent: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  displayType: "grid" | "list";
  order: number;
  tiered: boolean;
  packages: Package[];
}

export interface BasketPackageOption {
  name: string;
  value: string;
}

export interface BasketPackage {
  id: number;
  ident: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  type: PackageType;
  quantity: number;
  /** Prix de la ligne tel que retourné par Tebex (ou simulé en mode démo). */
  price: number;
  options: BasketPackageOption[];
  expiryPeriod?: string;
}

export interface Coupon {
  code: string;
}

export interface GiftCard {
  cardNumber: string;
}

export interface Basket {
  ident: string;
  username: string | null;
  currency: string;
  basePrice: number;
  salesTax: number;
  totalPrice: number;
  packages: BasketPackage[];
  coupons: Coupon[];
  giftcards: GiftCard[];
  creatorCode: string | null;
  checkoutUrl: string | null;
  isMock: boolean;
}

export interface StoreData {
  webstore: Webstore;
  categories: Category[];
  packages: Package[];
  isMock: boolean;
}

export interface ServerStatus {
  online: boolean;
  players: {
    online: number;
    max: number;
  };
  version: string | null;
  motd: string | null;
}

export interface DiscordStats {
  name: string;
  members: number;
  online: number;
  iconUrl: string | null;
  inviteUrl: string;
}
