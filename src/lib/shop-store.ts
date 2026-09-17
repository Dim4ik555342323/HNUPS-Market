import { defaultProducts, type Product } from "@/data/products";

export type Role = "admin" | "user";
export type User = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
};
export type CartLine = { id: number; qty: number };
export type OrderItem = { name: string; qty: number; price: number };
export type Order = {
  id: string;
  user: string;
  userName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  city: string;
  address: string;
  payment: string;
  paymentDetails?: string;
  date: string;
};
export type Notif = {
  id: string;
  orderId: string;
  text: string;
  date: string;
  read: boolean;
};

const K = {
  products: "atb.products",
  users: "atb.users",
  session: "atb.session",
  carts: "atb.carts",
  orders: "atb.orders",
  notifs: "atb.notifs",
};

const defaultUsers: User[] = [
  {
    name: "Адміністратор",
    email: "admin@atb.com",
    phone: "0000000000",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Тестовий Покупець",
    email: "user@atb.com",
    phone: "0501234567",
    password: "123456",
    role: "user",
  },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getProducts: (): Product[] => read<Product[]>(K.products, defaultProducts),
  setProducts: (p: Product[]) => write(K.products, p),
  getUsers: (): User[] => read<User[]>(K.users, defaultUsers),
  setUsers: (u: User[]) => write(K.users, u),
  getSession: (): string | null => read<string | null>(K.session, null),
  setSession: (email: string | null) => write(K.session, email),
  getCarts: (): Record<string, CartLine[]> => read<Record<string, CartLine[]>>(K.carts, {}),
  setCarts: (c: Record<string, CartLine[]>) => write(K.carts, c),
  getOrders: (): Order[] => read<Order[]>(K.orders, []),
  setOrders: (o: Order[]) => write(K.orders, o),
  getNotifs: (): Notif[] => read<Notif[]>(K.notifs, []),
  setNotifs: (n: Notif[]) => write(K.notifs, n),
  seed() {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(K.products)) write(K.products, defaultProducts);
    if (!localStorage.getItem(K.users)) write(K.users, defaultUsers);
    if (!localStorage.getItem(K.orders)) write(K.orders, []);
    if (!localStorage.getItem(K.carts)) write(K.carts, {});
    if (!localStorage.getItem(K.notifs)) write(K.notifs, []);
  },
};

export const PROMO_CODES: Record<string, number> = {
  "HNUPS-2026": 10,
  "HNUPS-VIP": 15,
  "HNUPS-5": 5,
};

export const CRYPTO_MIN = 500;

export const priceOf = (p: Product) => (p.discountPrice != null ? p.discountPrice : p.price);
export const uah = (n: number) => `${n.toFixed(2)} ₴`;
export type { Product };
