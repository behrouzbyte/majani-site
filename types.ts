
export enum ItemCondition {
  NEW = 'نو',
  ALMOST_NEW = 'در حد نو',
  USED = 'کارکرده',
  HEAVILY_USED = 'نیاز به تعمیر'
}

export enum Category {
  HOME = 'خانه و آشپزخانه',
  ELECTRONICS = 'کالای دیجیتال',
  CLOTHING = 'پوشاک',
  BOOKS = 'کتاب و لوازم تحریر',
  SPORTS = 'ورزش و سرگرمی',
  KIDS = 'کودک و نوزاد',
  VEHICLES = 'وسایل نقلیه',
  OTHERS = 'سایر'
}

export enum Gender {
  MALE = 'مرد',
  FEMALE = 'زن',
  RATHER_NOT_SAY = 'ترجیح می‌دهم نگویم'
}

export interface User {
  id: string;
  name: string; // نام و نام خانوادگی
  phone: string;
  passwordHash?: string; // در محیط واقعی هش شده ذخیره می‌شود
  city: string;
  province?: string;
  avatar: string;
  email?: string;
  gender?: Gender;
  birthDate?: string;
  address?: string; // آدرس کوتاه
  bio?: string;
  joinedDate: string;
  lastActive: string;
  donatedCount: number;
  receivedCount: number;
  trustScore: number; // امتیاز اعتماد 0 تا 100
  isAdmin?: boolean;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Item {
  id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  category: Category;
  condition: ItemCondition;
  location: Location;
  city: string;
  createdAt: string;
  status: 'AVAILABLE' | 'RESERVED' | 'GIVEN';
  views: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  itemId: string;
  participants: string[]; // [sellerId, buyerId]
  messages: ChatMessage[];
  lastMessage: string;
  lastUpdated: number;
}

export type AppView = 'AUTH' | 'HOME' | 'SEARCH' | 'POST_ITEM' | 'ITEM_DETAIL' | 'CHAT_LIST' | 'CHAT_DETAIL' | 'PROFILE' | 'MAP' | 'ADMIN' | 'RECENT_VIEWS';
export type AuthStage = 'PHONE_ENTRY' | 'OTP_VERIFY' | 'REGISTER_FORM' | 'LOGIN_PASSWORD';