import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  store,
  priceOf,
  uah,
  PROMO_CODES,
  CRYPTO_MIN,
  type Product,
  type User,
  type CartLine,
  type Order,
  type Notif,
} from "@/lib/shop-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ХНУПС Маркет — онлайн-супермаркет" },
      {
        name: "description",
        content:
          "Онлайн-супермаркет ХНУПС: каталог товарів, акційні ціни, кошик, QR-знижки та швидке оформлення доставки.",
      },
      { property: "og:title", content: "ХНУПС Маркет — онлайн-супермаркет" },
      {
        property: "og:description",
        content: "Каталог товарів ХНУПС, акції, кошик, персональні QR-знижки та доставка.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type Screen = "catalog" | "product" | "cart" | "checkout" | "history" | "qr" | "admin";

const inputCls =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10";
const btnPrimary =
  "inline-flex w-full items-center justify-center rounded-lg brand-bar px-4 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50";
const btnGhost =
  "inline-flex items-center justify-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition hover:bg-muted";

function App() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [screen, setScreen] = useState<Screen>("catalog");
  const [selected, setSelected] = useState<Product | null>(null);
  const [discount, setDiscount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    store.seed();
    const email = store.getSession();
    const u = email ? (store.getUsers().find((x) => x.email === email) ?? null) : null;
    setUser(u);
    setProducts(store.getProducts());
    setOrders(store.getOrders());
    setNotifs(store.getNotifs());
    if (u && u.role !== "admin") setCart(store.getCarts()[u.email] ?? []);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // адмін бачить нові покупки в реальному часі (в т.ч. з іншої вкладки)
  useEffect(() => {
    if (!user || user.role !== "admin") return;
    const tick = () => {
      const fresh = store.getNotifs();
      setNotifs((prev) => {
        if (fresh.length > prev.length) setToast("🔔 Нова покупка в магазині!");
        return fresh;
      });
      setOrders(store.getOrders());
    };
    const i = setInterval(tick, 1500);
    return () => clearInterval(i);
  }, [user]);

  const notify = (m: string) => setToast(m);

  const persistCart = (lines: CartLine[], email: string) => {
    const carts = store.getCarts();
    carts[email] = lines;
    store.setCarts(carts);
    setCart(lines);
  };

  const saveProducts = (list: Product[]) => {
    store.setProducts(list);
    setProducts(list);
  };

  const login = (u: User) => {
    store.setSession(u.email);
    setUser(u);
    setCart(u.role === "admin" ? [] : (store.getCarts()[u.email] ?? []));
    setScreen(u.role === "admin" ? "admin" : "catalog");
  };

  const logout = () => {
    store.setSession(null);
    setUser(null);
    setCart([]);
    setDiscount(0);
    setScreen("catalog");
  };

  const cartDetailed = useMemo(
    () =>
      cart
        .map((l) => ({ line: l, product: products.find((p) => p.id === l.id) }))
        .filter((x): x is { line: CartLine; product: Product } => !!x.product),
    [cart, products],
  );
  const subtotal = cartDetailed.reduce((s, x) => s + priceOf(x.product) * x.line.qty, 0);
  const total = Math.max(0, subtotal * (1 - discount / 100));
  const cartCount = cart.reduce((s, l) => s + l.qty, 0);

  const addToCart = (p: Product) => {
    if (!user) return;
    if (user.role === "admin") return notify("Адміністратор не може купувати товари");
    const existing = cart.find((l) => l.id === p.id);
    const next = existing
      ? cart.map((l) => (l.id === p.id ? { ...l, qty: l.qty + 1 } : l))
      : [...cart, { id: p.id, qty: 1 }];
    persistCart(next, user.email);
    notify(`«${p.name}» у кошику`);
  };

  const changeQty = (id: number, delta: number) => {
    if (!user) return;
    const next = cart
      .map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l))
      .filter((l) => l.qty > 0);
    persistCart(next, user.email);
  };

  const removeLine = (id: number) =>
    user &&
    persistCart(
      cart.filter((l) => l.id !== id),
      user.email,
    );

  const placeOrder = (city: string, address: string, payment: string, paymentDetails: string) => {
    if (!user || user.role === "admin") return;
    const order: Order = {
      id: `HNUPS-${Date.now()}`,
      user: user.email,
      userName: user.name,
      items: cartDetailed.map((x) => ({
        name: x.product.name,
        qty: x.line.qty,
        price: priceOf(x.product),
      })),
      subtotal,
      discount,
      total,
      city,
      address,
      payment,
      paymentDetails,
      date: new Date().toLocaleString("uk-UA"),
    };
    const next = [order, ...store.getOrders()];
    store.setOrders(next);
    setOrders(next);

    const notification: Notif = {
      id: `N-${Date.now()}`,
      orderId: order.id,
      text: `${user.name} щойно купив(ла) ${order.items.reduce((s, i) => s + i.qty, 0)} товар(ів) на ${uah(order.total)} · ${payment}`,
      date: order.date,
      read: false,
    };
    const nextNotifs = [notification, ...store.getNotifs()];
    store.setNotifs(nextNotifs);
    setNotifs(nextNotifs);

    persistCart([], user.email);
    setDiscount(0);
    setScreen("history");
    notify("Замовлення оформлено!");
  };

  const markNotifsRead = () => {
    const next = store.getNotifs().map((n) => ({ ...n, read: true }));
    store.setNotifs(next);
    setNotifs(next);
  };

  if (!ready) return <div className="min-h-screen bg-background" />;
  if (!user) return <AuthScreen onLogin={login} notify={notify} toast={toast} />;

  const isAdmin = user.role === "admin";
  const unread = notifs.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 brand-bar">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-highlight px-2 py-1 font-display text-sm font-extrabold text-highlight-foreground">
              ХНУПС
            </span>
            <h1 className="font-display text-lg font-bold">Маркет</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {isAdmin && (
              <button
                onClick={() => {
                  setScreen("admin");
                  markNotifsRead();
                }}
                className="relative rounded-lg bg-highlight px-3 py-1.5 font-semibold text-highlight-foreground"
              >
                🔔
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-sale px-1.5 text-[10px] font-bold text-sale-foreground">
                    {unread}
                  </span>
                )}
              </button>
            )}
            <span className="hidden opacity-90 sm:inline">{user.name}</span>
            <button
              onClick={logout}
              className="rounded-lg bg-sale px-3 py-1.5 text-sm font-semibold text-sale-foreground"
            >
              Вихід
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">
        {screen === "catalog" && (
          <Catalog
            products={products}
            canBuy={!isAdmin}
            onOpen={(p) => {
              setSelected(p);
              setScreen("product");
            }}
            onAdd={addToCart}
          />
        )}
        {screen === "product" && selected && (
          <Details
            product={selected}
            canBuy={!isAdmin}
            onBack={() => setScreen("catalog")}
            onAdd={addToCart}
          />
        )}
        {screen === "cart" && !isAdmin && (
          <Cart
            items={cartDetailed}
            subtotal={subtotal}
            discount={discount}
            total={total}
            onQty={changeQty}
            onRemove={removeLine}
            onCheckout={() => setScreen("checkout")}
          />
        )}
        {screen === "checkout" && !isAdmin && (
          <Checkout
            total={total}
            onSubmit={placeOrder}
            onBack={() => setScreen("cart")}
            notify={notify}
            empty={cart.length === 0}
          />
        )}
        {screen === "qr" && !isAdmin && (
          <QrScreen
            discount={discount}
            onApply={(code) => {
              const d = PROMO_CODES[code.trim().toUpperCase()];
              if (d) {
                setDiscount(d);
                notify(`Знижку ${d}% активовано`);
              } else notify("Невірний QR-код");
            }}
          />
        )}
        {screen === "history" &&
          (isAdmin ? (
            <History orders={orders} title="🧾 Історія покупок усіх користувачів" />
          ) : (
            <History orders={orders.filter((o) => o.user === user.email)} title="📜 Мої покупки" />
          ))}
        {screen === "admin" && isAdmin && (
          <Admin
            products={products}
            onSave={saveProducts}
            orders={orders}
            notifs={notifs}
            onReadNotifs={markNotifsRead}
            notify={notify}
          />
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-around px-2 py-2">
          <NavBtn
            icon="🏠"
            label="Головна"
            active={screen === "catalog" || screen === "product"}
            onClick={() => setScreen("catalog")}
          />
          <NavBtn
            icon="📜"
            label="Історія"
            active={screen === "history"}
            onClick={() => setScreen("history")}
          />
          {!isAdmin && (
            <NavBtn
              icon="🛒"
              label="Кошик"
              active={screen === "cart" || screen === "checkout"}
              badge={cartCount}
              onClick={() => setScreen("cart")}
            />
          )}
          {!isAdmin && (
            <NavBtn
              icon="📱"
              label="QR-код"
              active={screen === "qr"}
              onClick={() => setScreen("qr")}
            />
          )}
          {isAdmin && (
            <NavBtn
              icon="🛠️"
              label="Адмін"
              active={screen === "admin"}
              badge={unread}
              onClick={() => setScreen("admin")}
            />
          )}
        </div>
      </nav>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-[var(--shadow-pop)]">
          {toast}
        </div>
      )}
    </div>
  );
}

function NavBtn({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center px-3 py-1 text-[11px] font-medium transition ${
        active ? "text-brand" : "text-muted-foreground"
      }`}
    >
      <span className="text-xl">{icon}</span>
      {label}
      {!!badge && (
        <span className="absolute right-1 top-0 rounded-full bg-sale px-1.5 text-[10px] font-bold text-sale-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}

function AuthScreen({
  onLogin,
  notify,
  toast,
}: {
  onLogin: (u: User) => void;
  notify: (m: string) => void;
  toast: string | null;
}) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = store.getUsers();
    if (tab === "login") {
      const u = users.find(
        (x) =>
          x.email.toLowerCase() === form.email.trim().toLowerCase() && x.password === form.password,
      );
      if (!u) return notify("Невірний email або пароль");
      onLogin(u);
    } else {
      if (!form.name.trim() || !form.email.trim() || form.password.length < 6)
        return notify("Заповніть поля, пароль від 6 символів");
      if (form.password !== form.confirm) return notify("Паролі не збігаються");
      if (users.some((x) => x.email.toLowerCase() === form.email.trim().toLowerCase()))
        return notify("Такий email вже зареєстровано");
      const u: User = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: "user",
      };
      store.setUsers([...users, u]);
      onLogin(u);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md card-surface p-6">
        <div className="mb-5 text-center">
          <span className="inline-block rounded-lg bg-brand px-3 py-1.5 font-display text-xl font-extrabold text-brand-foreground">
            ХНУПС
          </span>
          <h1 className="mt-3 text-2xl font-bold">Вітаємо в ХНУПС Маркеті</h1>

          <p className="mt-1 text-sm text-muted-foreground">Увійдіть або створіть акаунт покупця</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg py-2 text-sm font-semibold transition ${
                tab === t
                  ? "bg-card text-brand shadow-[var(--shadow-card)]"
                  : "text-muted-foreground"
              }`}
            >
              {t === "login" ? "Вхід" : "Реєстрація"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {tab === "register" && (
            <>
              <input
                className={inputCls}
                placeholder="Ім'я"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="Телефон"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </>
          )}
          <input
            className={inputCls}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
          <input
            className={inputCls}
            type="password"
            placeholder="Пароль"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
          />
          {tab === "register" && (
            <input
              className={inputCls}
              type="password"
              placeholder="Підтвердіть пароль"
              value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)}
            />
          )}
          <button type="submit" className={btnPrimary}>
            {tab === "login" ? "Увійти" : "Зареєструватися"}
          </button>
        </form>

        <div className="mt-5 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Тестові дані:</p>
          <p>👤 Користувач: user@atb.com / 123456</p>
          <p>🔒 Адмін: admin@atb.com / admin123</p>
        </div>
      </div>
      {toast && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm text-background">
          {toast}
        </div>
      )}
    </div>
  );
}

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      className={`${inputCls} mb-4`}
      placeholder="Пошук за першою літерою назви…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function filterByFirstLetter(products: Product[], q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return products;
  return products.filter((p) => p.name.toLowerCase().startsWith(s));
}

function Catalog({
  products,
  canBuy,
  onOpen,
  onAdd,
}: {
  products: Product[];
  canBuy: boolean;
  onOpen: (p: Product) => void;
  onAdd: (p: Product) => void;
}) {
  const [q, setQ] = useState("");
  const list = filterByFirstLetter(products, q);
  return (
    <section>
      <div className="mb-4 rounded-2xl bg-highlight p-4 text-highlight-foreground shadow-[var(--shadow-card)]">
        <h2 className="font-display text-lg font-extrabold">🔥 Тижневі акції ХНУПС</h2>
        <p className="text-sm">Скануйте QR-код покупця та отримайте персональну знижку до 15%.</p>
      </div>
      <SearchBar value={q} onChange={setQ} />
      {list.length === 0 && <p className="text-sm text-muted-foreground">Нічого не знайдено.</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((p) => (
          <article key={p.id} className="relative flex flex-col card-surface p-3">
            {p.discountPrice != null && (
              <span className="absolute left-2 top-2 z-10 rounded-full bg-sale px-2 py-0.5 text-[11px] font-bold text-sale-foreground">
                АКЦІЯ
              </span>
            )}
            <button onClick={() => onOpen(p)} className="text-left">
              <img
                src={p.img}
                alt={p.name}
                loading="lazy"
                className="mb-2 h-28 w-full rounded-lg bg-muted object-cover"
              />
              <h3 className="min-h-10 text-sm font-semibold leading-tight">{p.name}</h3>
            </button>
            <div className="mt-2 flex items-baseline gap-2">
              {p.discountPrice != null && (
                <span className="text-xs text-muted-foreground line-through">{uah(p.price)}</span>
              )}
              <span
                className={`text-base font-extrabold ${p.discountPrice != null ? "text-sale" : "text-brand"}`}
              >
                {uah(priceOf(p))}
              </span>
            </div>
            {canBuy && (
              <button onClick={() => onAdd(p)} className={`${btnPrimary} mt-2`}>
                У кошик
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function Details({
  product,
  canBuy,
  onBack,
  onAdd,
}: {
  product: Product;
  canBuy: boolean;
  onBack: () => void;
  onAdd: (p: Product) => void;
}) {
  return (
    <section className="card-surface overflow-hidden">
      <img src={product.img} alt={product.name} className="h-64 w-full bg-muted object-cover" />
      <div className="space-y-2 p-4">
        <button onClick={onBack} className={btnGhost}>
          ← Назад
        </button>
        <h2 className="text-xl font-bold">{product.name}</h2>
        <div className="flex items-baseline gap-2">
          {product.discountPrice != null && (
            <span className="text-sm text-muted-foreground line-through">{uah(product.price)}</span>
          )}
          <span
            className={`text-2xl font-extrabold ${product.discountPrice != null ? "text-sale" : "text-brand"}`}
          >
            {uah(priceOf(product))}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{product.desc}</p>
        <ul className="text-sm text-muted-foreground">
          <li>Виробник: {product.producer}</li>
          <li>Країна: {product.country}</li>
          <li>Дата: {product.dateInfo}</li>
        </ul>
        {canBuy && (
          <button onClick={() => onAdd(product)} className={btnPrimary}>
            Додати в кошик
          </button>
        )}
      </div>
    </section>
  );
}

function Cart({
  items,
  subtotal,
  discount,
  total,
  onQty,
  onRemove,
  onCheckout,
}: {
  items: { line: CartLine; product: Product }[];
  subtotal: number;
  discount: number;
  total: number;
  onQty: (id: number, d: number) => void;
  onRemove: (id: number) => void;
  onCheckout: () => void;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-bold">🛒 Ваш кошик</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Кошик порожній.</p>
      ) : (
        <div className="space-y-2">
          {items.map(({ line, product }) => (
            <div key={line.id} className="flex items-center gap-3 card-surface p-3">
              <img
                src={product.img}
                alt={product.name}
                className="h-14 w-14 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">{product.name}</p>
                <p className="text-sm text-brand">{uah(priceOf(product) * line.qty)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => onQty(line.id, -1)} className={btnGhost}>
                  −
                </button>
                <span className="w-7 text-center text-sm font-semibold">{line.qty}</span>
                <button onClick={() => onQty(line.id, 1)} className={btnGhost}>
                  +
                </button>
                <button onClick={() => onRemove(line.id)} className={`${btnGhost} text-sale`}>
                  🗑
                </button>
              </div>
            </div>
          ))}
          <div className="card-surface space-y-1 p-4 text-right">
            <p className="text-sm text-muted-foreground">Сума: {uah(subtotal)}</p>
            {discount > 0 && <p className="text-sm text-sale">QR-знижка: −{discount}%</p>}
            <p className="text-xl font-extrabold">До сплати: {uah(total)}</p>
            <button onClick={onCheckout} className={`${btnPrimary} mt-2`}>
              Оформити замовлення
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

const CRYPTO_NETS: Record<string, { label: string; rate: number; hint: string }> = {
  BTC: { label: "Bitcoin (BTC)", rate: 2_800_000, hint: "bc1… або 1…/3…" },
  ETH: { label: "Ethereum (ETH)", rate: 155_000, hint: "0x…" },
  USDT: { label: "Tether USDT (TRC-20)", rate: 41.5, hint: "T…" },
};

function Checkout({
  total,
  onSubmit,
  onBack,
  notify,
  empty,
}: {
  total: number;
  onSubmit: (city: string, address: string, payment: string, paymentDetails: string) => void;
  onBack: () => void;
  notify: (m: string) => void;
  empty: boolean;
}) {
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("Готівка при отриманні");
  const [card, setCard] = useState({ number: "", exp: "", cvv: "", holder: "" });
  const [coin, setCoin] = useState<keyof typeof CRYPTO_NETS>("USDT");
  const [wallet, setWallet] = useState("");
  const setCardField = (k: string, v: string) => setCard((c) => ({ ...c, [k]: v }));

  const isCard = payment === "Банківська картка";
  const isCrypto = payment === "Криптовалюта";
  const cryptoBlocked = isCrypto && total < CRYPTO_MIN;
  const digits = card.number.replace(/\D/g, "");
  const coinAmount = (total / CRYPTO_NETS[coin]!.rate).toFixed(coin === "USDT" ? 2 : 6);

  const formatCard = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  const formatExp = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (empty) return notify("Кошик порожній");
    if (!city.trim() || !address.trim()) return notify("Вкажіть місто та адресу");
    if (cryptoBlocked) return notify(`Оплата криптою — від ${CRYPTO_MIN} ₴`);

    if (isCard) {
      if (digits.length !== 16) return notify("Номер картки має містити 16 цифр");
      const [mm, yy] = card.exp.split("/");
      if (!mm || !yy || yy.length !== 2 || +mm < 1 || +mm > 12)
        return notify("Термін дії у форматі ММ/РР");
      const now = new Date();
      const expDate = new Date(2000 + +yy, +mm, 0, 23, 59);
      if (expDate < now) return notify("Термін дії картки минув");
      if (!/^\d{3}$/.test(card.cvv)) return notify("CVV — 3 цифри");
      if (card.holder.trim().length < 3) return notify("Вкажіть ім'я власника картки");
      return onSubmit(
        city.trim(),
        address.trim(),
        payment,
        `Картка •••• ${digits.slice(-4)} · ${card.holder.trim().toUpperCase()}`,
      );
    }

    if (isCrypto) {
      const w = wallet.trim();
      if (w.length < 20) return notify("Вкажіть коректну адресу гаманця");
      if (coin === "ETH" && !w.startsWith("0x")) return notify("ETH-адреса починається з 0x");
      if (coin === "USDT" && !w.startsWith("T"))
        return notify("USDT (TRC-20) адреса починається з T");
      return onSubmit(
        city.trim(),
        address.trim(),
        `Криптовалюта (${coin})`,
        `${coinAmount} ${coin} · гаманець ${w.slice(0, 6)}…${w.slice(-4)}`,
      );
    }

    onSubmit(city.trim(), address.trim(), payment, "Оплата при отриманні");
  };

  return (
    <section className="card-surface p-4">
      <button onClick={onBack} className={`${btnGhost} mb-3`}>
        ← Назад до кошика
      </button>
      <h2 className="mb-3 text-xl font-bold">Оформлення замовлення</h2>
      <form onSubmit={submit} className="space-y-3">
        <input
          className={inputCls}
          placeholder="Місто"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="Адреса доставки"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <select className={inputCls} value={payment} onChange={(e) => setPayment(e.target.value)}>
          <option>Готівка при отриманні</option>
          <option>Банківська картка</option>
          <option>Криптовалюта</option>
        </select>

        {isCard && (
          <div className="space-y-3 rounded-xl bg-muted p-3">
            <p className="text-sm font-semibold">💳 Дані банківської картки</p>
            <input
              className={inputCls}
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              value={card.number}
              onChange={(e) => setCardField("number", formatCard(e.target.value))}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className={inputCls}
                inputMode="numeric"
                placeholder="ММ/РР"
                value={card.exp}
                onChange={(e) => setCardField("exp", formatExp(e.target.value))}
              />
              <input
                className={inputCls}
                inputMode="numeric"
                type="password"
                placeholder="CVV"
                value={card.cvv}
                onChange={(e) => setCardField("cvv", e.target.value.replace(/\D/g, "").slice(0, 3))}
              />
            </div>
            <input
              className={inputCls}
              placeholder="Ім'я власника (IVAN PETRENKO)"
              value={card.holder}
              onChange={(e) => setCardField("holder", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Платіж захищено 3-D Secure. Дані не передаються продавцю.
            </p>
          </div>
        )}

        {isCrypto && (
          <div className="space-y-3 rounded-xl bg-muted p-3">
            <p className="text-sm font-semibold">🪙 Оплата криптовалютою</p>
            <select
              className={inputCls}
              value={coin}
              onChange={(e) => setCoin(e.target.value as keyof typeof CRYPTO_NETS)}
            >
              {Object.entries(CRYPTO_NETS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
            <input
              className={inputCls}
              placeholder={`Адреса вашого гаманця (${CRYPTO_NETS[coin]!.hint})`}
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
            />
            {!cryptoBlocked && (
              <p className="text-sm">
                До переказу:{" "}
                <span className="font-extrabold text-brand">
                  {coinAmount} {coin}
                </span>
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Курс фіксується на 15 хвилин після підтвердження.
            </p>
          </div>
        )}

        {cryptoBlocked && (
          <p className="text-sm text-sale">Оплата криптовалютою доступна від {CRYPTO_MIN} ₴.</p>
        )}
        <p className="text-lg font-extrabold">До сплати: {uah(total)}</p>
        <button type="submit" className={btnPrimary}>
          Підтвердити замовлення
        </button>
      </form>
    </section>
  );
}

function QrScreen({ discount, onApply }: { discount: number; onApply: (code: string) => void }) {
  const [code, setCode] = useState("");
  return (
    <section className="card-surface p-5 text-center">
      <h2 className="text-xl font-bold">📱 Ваш QR-код покупця</h2>
      <div className="mx-auto my-4 grid h-40 w-40 grid-cols-8 gap-0.5 rounded-xl bg-card p-2 shadow-[var(--shadow-card)]">
        {Array.from({ length: 64 }).map((_, i) => (
          <span
            key={i}
            className={`rounded-[2px] ${(i * 7) % 3 === 0 ? "bg-brand" : "bg-muted"}`}
          />
        ))}
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        Введіть код зі сканера на касі, щоб активувати персональну знижку.
      </p>
      <div className="mx-auto flex max-w-sm gap-2">
        <input
          className={inputCls}
          placeholder="Напр. HNUPS-2026"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button onClick={() => onApply(code)} className={btnPrimary} style={{ width: "auto" }}>
          Активувати
        </button>
      </div>
      {discount > 0 && <p className="mt-3 font-semibold text-brand">Активна знижка: {discount}%</p>}
      <p className="mt-2 text-xs text-muted-foreground">
        Демо-коди: HNUPS-5, HNUPS-2026, HNUPS-VIP
      </p>
    </section>
  );
}

function History({ orders, title }: { orders: Order[]; title: string }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-bold">{title}</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">Покупок ще немає.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card-surface p-4">
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="font-semibold">
                  {o.userName} · {o.date}
                </span>
                <span className="font-extrabold text-brand">{uah(o.total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {o.city}, {o.address} · {o.payment}
                {o.paymentDetails ? ` · ${o.paymentDetails}` : ""}
                {o.discount > 0 ? ` · знижка ${o.discount}%` : ""}
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {o.items.map((i, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>
                      {i.name} × {i.qty}
                    </span>
                    <span>{uah(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const emptyForm = {
  name: "",
  price: "",
  discountPrice: "",
  desc: "",
  producer: "",
  country: "Україна",
  dateInfo: "",
  img: "",
};

function Admin({
  products,
  onSave,
  orders,
  notifs,
  onReadNotifs,
  notify,
}: {
  products: Product[];
  onSave: (p: Product[]) => void;
  orders: Order[];
  notifs: Notif[];
  onReadNotifs: () => void;
  notify: (m: string) => void;
}) {
  const [tab, setTab] = useState<"catalog" | "orders" | "notifs">("catalog");

  const [q, setQ] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sale, setSale] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const list = filterByFirstLetter(products, q);

  const reset = () => {
    setForm(emptyForm);
    setSale(false);
    setEditingId(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    if (!form.name.trim() || isNaN(price)) return notify("Вкажіть назву та ціну");
    const dp = sale ? parseFloat(form.discountPrice) : NaN;
    if (sale && (isNaN(dp) || dp >= price))
      return notify("Акційна ціна має бути меншою за звичайну");
    const base: Product = {
      id: editingId ?? Math.max(0, ...products.map((p) => p.id)) + 1,
      name: form.name.trim(),
      price,
      discountPrice: sale ? dp : null,
      desc: form.desc.trim(),
      producer: form.producer.trim(),
      country: form.country.trim(),
      dateInfo: form.dateInfo.trim(),
      img:
        form.img.trim() ||
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80",
    };
    onSave(editingId ? products.map((p) => (p.id === editingId ? base : p)) : [base, ...products]);
    notify(editingId ? "Товар оновлено" : "Товар додано");
    reset();
  };

  const edit = (p: Product) => {
    setEditingId(p.id);
    setSale(p.discountPrice != null);
    setForm({
      name: p.name,
      price: String(p.price),
      discountPrice: p.discountPrice != null ? String(p.discountPrice) : "",
      desc: p.desc,
      producer: p.producer,
      country: p.country,
      dateInfo: p.dateInfo,
      img: p.img,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = (id: number) => {
    onSave(products.filter((p) => p.id !== id));
    notify("Товар видалено");
    if (editingId === id) reset();
  };

  return (
    <section>
      <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
        {(["catalog", "orders", "notifs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              if (t === "notifs") onReadNotifs();
            }}
            className={`relative rounded-lg py-2 text-sm font-semibold transition ${
              tab === t ? "bg-card text-brand shadow-[var(--shadow-card)]" : "text-muted-foreground"
            }`}
          >
            {t === "catalog" ? "Каталог" : t === "orders" ? "Покупки" : "Сповіщення"}
            {t === "notifs" && notifs.some((n) => !n.read) && (
              <span className="absolute right-1 top-1 rounded-full bg-sale px-1.5 text-[10px] font-bold text-sale-foreground">
                {notifs.filter((n) => !n.read).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "notifs" ? (
        <div className="space-y-2">
          <h2 className="mb-3 text-xl font-bold">🔔 Сповіщення про покупки</h2>
          {notifs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Сповіщень ще немає.</p>
          ) : (
            notifs.map((n) => (
              <div key={n.id} className={`card-surface p-3 ${n.read ? "" : "border-brand"}`}>
                <p className="text-sm font-semibold">{n.text}</p>
                <p className="text-xs text-muted-foreground">
                  {n.date} · замовлення {n.orderId}
                </p>
              </div>
            ))
          )}
        </div>
      ) : tab === "orders" ? (
        <History orders={orders} title="🧾 Історія покупок усіх користувачів" />
      ) : (
        <>
          <form onSubmit={submit} className="mb-4 card-surface space-y-3 p-4">
            <h2 className="text-lg font-bold">
              {editingId ? "Редагування товару" : "Новий товар"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={inputCls}
                placeholder="Назва"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="Ціна, ₴"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="Виробник"
                value={form.producer}
                onChange={(e) => set("producer", e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="Країна"
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="Дата"
                value={form.dateInfo}
                onChange={(e) => set("dateInfo", e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="Посилання на фото"
                value={form.img}
                onChange={(e) => set("img", e.target.value)}
              />
            </div>
            <input
              className={inputCls}
              placeholder="Опис"
              value={form.desc}
              onChange={(e) => set("desc", e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={sale} onChange={(e) => setSale(e.target.checked)} />
              Акція
            </label>
            {sale && (
              <input
                className={inputCls}
                placeholder="Акційна ціна, ₴"
                value={form.discountPrice}
                onChange={(e) => set("discountPrice", e.target.value)}
              />
            )}
            <div className="flex gap-2">
              <button type="submit" className={btnPrimary}>
                {editingId ? "Зберегти" : "Додати товар"}
              </button>
              {editingId && (
                <button type="button" onClick={reset} className={btnGhost}>
                  Скасувати
                </button>
              )}
            </div>
          </form>

          <SearchBar value={q} onChange={setQ} />
          <div className="space-y-2">
            {list.map((p) => (
              <div key={p.id} className="flex items-center gap-3 card-surface p-3">
                <img src={p.img} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-sm">
                    {p.discountPrice != null && (
                      <span className="mr-2 text-muted-foreground line-through">
                        {uah(p.price)}
                      </span>
                    )}
                    <span
                      className={
                        p.discountPrice != null ? "font-bold text-sale" : "font-bold text-brand"
                      }
                    >
                      {uah(priceOf(p))}
                    </span>
                  </p>
                </div>
                <button onClick={() => edit(p)} className={btnGhost}>
                  ✏️
                </button>
                <button onClick={() => remove(p.id)} className={`${btnGhost} text-sale`}>
                  🗑
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
