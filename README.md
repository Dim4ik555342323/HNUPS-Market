# ATB Mobile Shop

вот мене є коди зроби щоб таке було Ти — досвідчений Senior Full-Stack Web Developer. Твоє завдання — розробити повний, робочий та сучасний веб-застосунок (SPA - Single Page Application) у стилі мобільного додатка мережі супермаркетів "АТБ".

ТЕХНОЛОГІЇ:

- HTML5 (семантична верстка)

- CSS3 (сучасний UI/UX в стилі АТБ: темно-зелені/червоні/жовті акценти, адаптивність під мобільні пристрої та ПК, акуратні картки, модальні вікна)

- Vanilla JavaScript (ES6+, збереження даних через localStorage)

СТРУКТУРА ТА ЛОГІКА ДОДАТКА:

1. АВТОРИЗАЦІЯ ТА РЕЄСТРАЦІЯ (Auth System):

- Екран входу/реєстрації з можливістю вибору ролі або автоматичним визначенням (Адмін / Користувач).

- Форма реєстрації нового користувача (збереження даних у localStorage).

- Після успішного входу форма авторизації ПОВНІСТЮ ЗНИКАЄ, відкриваючи відповідний інтерфейс (Панель адміна або Кабінет користувача).

- Можливість виходу з акаунту (Logout).

2. ФУНКЦІОНАЛ ДЛЯ АДМІНІСТРАТОРА:

- Управління каталогом (CRUD): додавання нових товарів, редагування ціни, видалення товарів.

- Встановлення акцій: прапорець "Акція", стара ціна та нова акційна ціна з візуальним виділенням.

- Перегляд повного списку товарів та пошук за першою літерою назви (живий фільтр: ввів літеру — показує товари, що починаються на неї).

- Перегляд історії покупок усіх користувачів (хто, що і коли придбав).

3. ФУНКЦІОНАЛ ДЛЯ КОРИСТУВАЧА:

- Перегляд каталогу товарів з деталями (ціна, акційна ціна, фото/іконка).

- Пошук товарів за першою літерою (миттєва фільтрація).

- Інтерактивний кошик:

  - Додавання товару в кошик.

  - Зміна кількості товару (+ / -) безпосередньо в кошику з перерахунком суми.

  - Видалення з кошика.

- Сканер/Введення QR-коду для отримання знижки (симуляція персональної знижки АТБ).

- Оформлення замовлення (Checkout):

  - Поля: Місто, Адреса доставки.

  - Вибір способу оплати: Готівка, Банківська картка, Криптовалюта.

  - Обмеження для криптовалюти (наприклад, мінімальна сума замовлення для оплати криптою від 500 грн).

  - Підтвердження замовлення та збереження його в історію.

ВИМОГИ ДО КОДУ:

1. Надай весь код у трьох окремих блоках: HTML, CSS та JS (або один цілісний index.html з інтегрованими `<style>` та `<script>`).

2. Код має бути повністю робочим, без заглушок на кшталт "тут напишіть свій код".

3. Використовуй localStorage для збереження товарів, користувачів, кошика та історії замовлень, щоб дані не зникали при оновленні сторінки.

4. Додай дефолтні початкові дані (початковий список товарів АТБ та тестового адміна/користувача).

Згенеруй код зараз.* {
box-sizing: border-box;
margin: 0;
padding: 0;
font-family: 'Segoe UI', Arial, sans-serif;
}

body {
min-height: 100vh;
padding-bottom: 70px;
background-color: #f0f2f5;
background-image: url('https://th.bing.com/th/id/OIP.VvBC_sPgm0cb358j0O_hBQHaDe?w=350&h=164&c=7&r=0&o=7&pid=1.7&rm=3');
background-size: cover;
background-repeat: no-repeat;
background-position: center center;
background-attachment: fixed;
position: relative;
}

body::before {
content: '';
position: fixed;
top: 0;
left: 0;
right: 0;
bottom: 0;
background: rgba(255, 255, 255, 0.85);
backdrop-filter: blur(2px);
-webkit-backdrop-filter: blur(2px);
z-index: 0;
pointer-events: none;
}

body::after {
content: '';
position: fixed;
bottom: 0;
left: 0;
right: 0;
height: 60px;
background: linear-gradient(180deg, transparent, rgba(108, 92, 231, 0.05));
pointer-events: none;
z-index: 0;
}

.app-header {
position: sticky;
top: 0;
background: rgba(255, 255, 255, 0.92);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
display: flex;
justify-content: space-between;
align-items: center;
padding: 12px 20px;
box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);
z-index: 100;
border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.app-header h1 {
font-size: 20px;
font-weight: 700;
background: linear-gradient(135deg, #6c5ce7, #a29bfe, #fd79a8);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
}

.icon-btn {
background: rgba(108, 92, 231, 0.08);
border: none;
font-size: 20px;
cursor: pointer;
width: 40px;
height: 40px;
border-radius: 50%;
display: flex;
align-items: center;
justify-content: center;
transition: all 0.3s ease;
}

.icon-btn:hover {
background: rgba(108, 92, 231, 0.15);
transform: scale(1.05);
}

#logout-btn {
background: rgba(255, 107, 107, 0.1);
color: #e17055;
}

#logout-btn:hover {
background: rgba(255, 107, 107, 0.2);
}

.content {
max-width: 900px;
margin: 0 auto;
padding: 15px;
position: relative;
z-index: 1;
}

.screen {
display: none;
animation: fadeInUp 0.4s ease;
}

.screen.active {
display: block;
}

@keyframes fadeInUp {
from {
opacity: 0;
transform: translateY(20px);
}
to {
opacity: 1;
transform: translateY(0);
}
}

#login-screen {
display: flex;
align-items: center;
justify-content: center;
min-height: calc(100vh - 140px);
padding: 20px;
}

#login-screen input {
transition: all 0.3s ease;
}

#login-screen input:focus {
border-color: #6c5ce7;
box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.08);
}

#login-screen button:not(.nav-item):hover {
transform: translateY(-2px);
box-shadow: 0 6px 25px rgba(108, 92, 231, 0.4);
}

.product-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
gap: 15px;
}

.product-card {
position: relative;
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
border-radius: 16px;
padding: 12px;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
display: flex;
flex-direction: column;
justify-content: space-between;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
cursor: pointer;
border: 1px solid rgba(255, 255, 255, 0.6);
min-height: 280px;
}

.product-card:hover {
transform: translateY(-4px) scale(1.01);
box-shadow: 0 12px 40px rgba(108, 92, 231, 0.12);
background: rgba(255, 255, 255, 0.98);
border-color: rgba(108, 92, 231, 0.2);
}

.product-card img {
width: 100%;
height: 130px;
object-fit: cover;
border-radius: 10px;
margin-bottom: 10px;
background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.product-card h3 {
font-size: 14px;
color: #2d3436;
margin-bottom: 8px;
line-height: 1.3;
font-weight: 600;
}

.price-block {
display: flex;
flex-direction: column;
margin-bottom: 8px;
}

.old-price {
font-size: 12px;
color: #b2bec3;
text-decoration: line-through;
margin-right: 5px;
}

.price {
font-size: 16px;
font-weight: 700;
color: #e17055;
}

.discount-label {
position: absolute;
top: 10px;
left: 10px;
background: linear-gradient(135deg, #fd79a8, #e17055);
color: white;
font-size: 11px;
font-weight: 700;
padding: 4px 10px;
border-radius: 20px;
z-index: 2;
box-shadow: 0 2px 10px rgba(225, 112, 85, 0.3);
}

.primary-btn, .add-to-cart-btn {
width: 100%;
background: linear-gradient(135deg, #6c5ce7, #a29bfe);
color: white;
border: none;
padding: 10px;
border-radius: 10px;
font-weight: 600;
cursor: pointer;
transition: all 0.3s ease;
box-shadow: 0 4px 15px rgba(108, 92, 231, 0.25);
position: relative;
z-index: 1;
}

.primary-btn:hover, .add-to-cart-btn:hover {
transform: translateY(-2px);
box-shadow: 0 8px 25px rgba(108, 92, 231, 0.35);
background: linear-gradient(135deg, #5f3dc4, #845ef7);
}

.primary-btn:active, .add-to-cart-btn:active {
transform: translateY(0);
}

.add-to-cart-btn {
margin-top: 8px;
background: linear-gradient(135deg, #00b894, #00cec9);
box-shadow: 0 4px 15px rgba(0, 206, 201, 0.3);
}

.add-to-cart-btn:hover {
background: linear-gradient(135deg, #00a381, #00b894);
box-shadow: 0 8px 25px rgba(0, 206, 201, 0.4);
}

.search-bar {
display: flex;
gap: 10px;
margin-bottom: 15px;
}

.search-bar input {
flex: 1;
padding: 12px 16px;
border: 2px solid rgba(108, 92, 231, 0.1);
border-radius: 12px;
background: rgba(255, 255, 255, 0.92);
backdrop-filter: blur(10px);
font-size: 15px;
transition: all 0.3s ease;
}

.search-bar input:focus {
outline: none;
border-color: #6c5ce7;
box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.1);
background: white;
}

.back-btn {
background: rgba(108, 92, 231, 0.08);
border: none;
font-size: 16px;
color: #2d3436;
cursor: pointer;
width: 44px;
height: 44px;
border-radius: 12px;
transition: all 0.3s ease;
}

.back-btn:hover {
background: rgba(108, 92, 231, 0.15);
}

.bottom-nav {
position: fixed;
bottom: 0;
left: 0;
right: 0;
height: 65px;
background: rgba(255, 255, 255, 0.92);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border-top: 1px solid rgba(255, 255, 255, 0.3);
display: flex;
justify-content: space-around;
align-items: center;
z-index: 1000;
padding-bottom: env(safe-area-inset-bottom);
box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.04);
}

.nav-item {
background: none;
border: none;
display: flex;
flex-direction: column;
align-items: center;
color: #b2bec3;
cursor: pointer;
font-size: 11px;
position: relative;
padding: 4px 12px;
transition: all 0.3s ease;
}

.nav-item span {
font-size: 22px;
margin-bottom: 2px;
transition: transform 0.3s ease;
}

.nav-item:hover span {
transform: scale(1.1);
}

.nav-item.active {
color: #6c5ce7;
}

.nav-item.active span {
transform: scale(1.1);
}

.admin-nav {
color: #fd79a8 !important;
}

.admin-nav.active {
color: #e17055 !important;
}

.badge {
position: absolute;
top: -4px;
right: -4px;
background: linear-gradient(135deg, #fd79a8, #e17055);
color: white;
font-size: 10px;
font-weight: 700;
min-width: 18px;
height: 18px;
padding: 0 5px;
border-radius: 20px;
display: flex;
align-items: center;
justify-content: center;
box-shadow: 0 2px 8px rgba(225, 112, 85, 0.3);
}

.details-card {
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(10px);
padding: 20px;
border-radius: 16px;
box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
border: 1px solid rgba(255, 255, 255, 0.5);
}

.details-card img {
width: 100%;
max-height: 280px;
object-fit: cover;
border-radius: 12px;
background: linear-gradient(135deg, #f8f9fa, #e9ecef);
}

.details-card h2 {
margin: 15px 0 10px;
color: #2d3436;
}

.price-container {
margin-bottom: 15px;
}

.price-container .price {
font-size: 24px;
font-weight: 700;
}

.cart-item {
display: flex;
justify-content: space-between;
align-items: center;
background: rgba(255, 255, 255, 0.92);
backdrop-filter: blur(10px);
padding: 12px 15px;
border-radius: 12px;
margin-bottom: 8px;
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
border: 1px solid rgba(255, 255, 255, 0.5);
transition: all 0.3s ease;
}

.cart-item:hover {
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.qty-controls {
display: flex;
align-items: center;
gap: 6px;
}

.qty-btn {
width: 30px;
height: 30px;
border: 2px solid rgba(108, 92, 231, 0.1);
background: white;
border-radius: 8px;
cursor: pointer;
font-weight: 700;
font-size: 16px;
transition: all 0.2s ease;
display: flex;
align-items: center;
justify-content: center;
}

.qty-btn:hover {
background: rgba(108, 92, 231, 0.05);
border-color: #6c5ce7;
color: #6c5ce7;
}

.remove-btn {
background: none;
border: none;
cursor: pointer;
font-size: 16px;
margin-left: 4px;
padding: 4px 8px;
border-radius: 8px;
transition: all 0.2s ease;
}

.remove-btn:hover {
background: rgba(225, 112, 85, 0.1);
}

#promo-banner {
background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 40%, #fd79a8 100%) !important;
border: none !important;
padding: 16px 20px !important;
border-radius: 16px !important;
margin-bottom: 20px !important;
position: relative;
overflow: hidden;
box-shadow: 0 8px 30px rgba(108, 92, 231, 0.25) !important;
cursor: pointer;
transition: all 0.3s ease;
}

#promo-banner::before {
content: '🎉';
position: absolute;
top: -10px;
right: 10px;
font-size: 50px;
opacity: 0.3;
transform: rotate(15deg);
}

#promo-banner::after {
content: '';
position: absolute;
top: -50%;
right: -20%;
width: 200px;
height: 200px;
background: rgba(255, 255, 255, 0.08);
border-radius: 50%;
}

#promo-banner:hover {
transform: scale(1.02);
box-shadow: 0 12px 40px rgba(108, 92, 231, 0.35) !important;
}

#promo-banner h3 {
color: white !important;
font-size: 16px !important;
font-weight: 700;
letter-spacing: 0.5px;
position: relative;
z-index: 1;
}

#promo-banner p {
color: rgba(255, 255, 255, 0.9) !important;
font-size: 13px !important;
position: relative;
z-index: 1;
}

#toast-container {
position: fixed;
bottom: 80px;
right: 20px;
z-index: 9999;
display: flex;
flex-direction: column;
gap: 10px;
}

#toast-container div {
background: rgba(44, 62, 80, 0.95) !important;
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
}

#cart-list {
margin-bottom: 15px;
}

#cart-total {
font-size: 20px;
color: #2d3436;
margin-top: 15px;
text-align: right;
font-weight: 700;
}

select, input[type="text"], input[type="password"], input[type="email"], input[type="tel"] {
background: rgba(255, 255, 255, 0.92);
backdrop-filter: blur(10px);
border: 2px solid rgba(108, 92, 231, 0.1);
border-radius: 10px;
padding: 10px 14px;
transition: all 0.3s ease;
}

select:focus, input[type="text"]:focus, input[type="password"]:focus, input[type="email"]:focus, input[type="tel"]:focus {
outline: none;
border-color: #6c5ce7;
box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.08);
background: white;
}

#history-container > div {
background: rgba(255, 255, 255, 0.95) !important;
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.5) !important;
border-radius: 16px !important;
padding: 20px !important;
}

@media (max-width: 600px) {
.product-grid {
grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
gap: 12px;
}
.content {
padding: 10px;
}
.app-header h1 {
font-size: 18px;
}
#toast-container {
right: 10px;
left: 10px;
bottom: 75px;
}
#toast-container div {
max-width: 100% !important;
}
}

@media (max-width: 400px) {
.product-grid {
grid-template-columns: repeat(2, 1fr);
gap: 10px;
}
.product-card {
padding: 10px;
min-height: 240px;
}
.product-card img {
height: 100px;
}
.product-card h3 {
font-size: 12px;
}
.price {
font-size: 14px;
}
}

html {
scroll-behavior: smooth;
}

::-webkit-scrollbar {
width: 6px;
}

::-webkit-scrollbar-track {
background: rgba(108, 92, 231, 0.05);
}

::-webkit-scrollbar-thumb {
background: linear-gradient(135deg, #6c5ce7, #a29bfe);
border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
background: linear-gradient(135deg, #5f3dc4, #845ef7);
}

ХНУПС

            🚪
            🔍



















Вітаємо в ХНУПС

                    Вхід
                    Реєстрація










                        📧 Email







                        🔑 Пароль









                            Показати пароль




                    Увійти










                        👤 Ім'я







                        📧 Email







                        📱 Телефон







                        🔑 Пароль







                        ✅ Підтвердіть пароль




                    Зареєструватися









📋 Тестові дані для входу:

👤 Користувач: user@shop.com</span> / 123456

🔒 Адмін: admin@shop.com</span> / admin123

                ←















            ← Назад




















                Додати в кошик













🛒 Ваш кошик

Всього: 0.00 UAH

                Спосіб оплати:

                    Банківська картка
                    Apple / Google Pay
                    Криптовалюта
                    Готівка при отриманні














                            👁️















Оплата буде здійснена через ваш цифровий гаманець при підтвердженні.

                        USDT (TRC20)
                        USDT (BEP20)
                        Bitcoin (BTC)
                        Ethereum (ERC20)



                    Максимум 20 символів









Оплата кур'єру під час отримання товару.

            Оформити замовлення










📜 Мої покупки

📱 Ваш QR-код покупця

Скануйте код на касі для отримання персональних знижок

            🏠
            Головна


            📜
            Історія


            🛒
            Кошик
            0


            📱
            QR-код

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://atb-express-shopper.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4cdc04a2-afa7-4119-95d6-73ed33322871).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
