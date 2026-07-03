export type Language = "pt" | "en" | "es";
export type Theme = "light" | "dark";

export interface CheeseBreadItem {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  price: number;
  points: number;
  image: string;
  category: "classic" | "special" | "filled";
  rating: number;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  cheeseBreadType: string;
  userAvatar?: string;
}

export interface Bakery {
  id: string;
  name: string;
  address: string;
  distance: number; // in km
  rating: number;
  reviewsCount: number;
  reviews: Review[];
  hours: string;
  phone: string;
  lat: number; // coordinate representation
  lng: number; // coordinate representation
}

export type OrderStatus = "pending" | "preparing" | "ready" | "picked_up";

export interface OrderItem {
  item: CheeseBreadItem;
  quantity: number;
}

export interface Order {
  id: string;
  code: string;
  bakery: Bakery;
  items: OrderItem[];
  pickupTime: string;
  status: OrderStatus;
  total: number;
  paymentMethod: "pix" | "card" | "applepay";
  paymentStatus: "pending" | "paid";
  pointsEarned: number;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  pointsAwarded: number;
  unlocked: boolean;
  unlockedAt?: string;
  icon: string;
}

export interface UserLoyalty {
  points: number;
  level: number;
  nextLevelPoints: number;
  totalBreadsEaten: number;
  achievements: Achievement[];
}

export interface UsageMetric {
  month: string;
  pointsEarned: number;
  breadsEaten: number;
  co2Saved: number; // in kg (from choosing local pickup instead of delivery!)
  amountSpent: number;
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  content: string;
  timestamp: string;
}
