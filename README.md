# Orders App (React + Vite)

Кратко: приложение для управления заказами с интеграцией Google Sheets (через gviz API), авторизацией по JWT и визуализацией статистики. Внешний вид на TailwindCSS + DaisyUI.

## Технологии
- React 18, React Router v6
- Vite 5 (HMR, быстрые сборки)
- TailwindCSS 3 + DaisyUI
- react-hook-form + yup (валидация форм)
- Google Sheets (источник данных)

## Возможности
- Список заказов, фильтры, редактирование, статусные переходы
- Страница заказа с валидацией и пересчетом стоимости
- Дашборд: карточки статистики, графики по неделям и пользователям
- Авторизация (JWT в `localStorage`), роль-зависимые действия
- Тема UI: сохранение и применение из `localStorage` (дефолт — `nord`)

## Структура
```
src/
  api/                # Вызовы GAS
  components/         # UI и таблицы/фильтры
  pages/              # Страницы приложения
  services/           # Работа с данными и авторизацией
  constants/          # Константы (статусы, валюты, ключи хранилища)
  utils/              # Переиспользуемые утилиты (даты, подготовка заказа, тема)
```

Ключевые файлы:
- `src/pages/Orders/components/OrderFormPage.jsx` — форма заказа, валидация, пересчёты
- `src/pages/Dashboard/Dashboard.jsx` — загрузка данных, нормализация в PLN, инициализация темы
- `src/pages/Dashboard/components/OrdersChart.jsx` — график по неделям
- `src/components/orders/OrdersTable.jsx` — таблица заказов
- `src/constants/index.js` — `ORDER_STATUSES`, `CURRENCIES`, `STORAGE_KEYS`, `DEFAULT_OBJECTS`
- `src/utils/index.js` — `normalizeDeadline`, `formatDateForSheet`, `prepareOrderToSend`, `parseDateString`, `initThemeFromStorage`

## Установка и запуск

```powershell
cd d:\ordersapp\my-app
npm install
npm run dev
```

Сборка:
```powershell
npm run build
npm run preview
```

## Данные и конвертация валют
- Заказы загружаются из Google Sheets (`services/ordersService.js`)
- На дашборде конвертация суммы заказа в PLN выполняется с учётом курсов (логика остаётся в Dashboard и повторяет оригинальную)
- В таблице отображаются исходные значения `totalPrice` и `currency`

## Тема (UI)
- Инициализация темы вынесена в `utils/initThemeFromStorage`
- Ключ в `localStorage`: `STORAGE_KEYS.theme`
- Если значение отсутствует, дефолт: `nord` (светлая)

## Профессионально ли всё сейчас?
- Да: структура чистая, переиспользуемые части вынесены в `constants` и `utils` без малейших изменений логики
- Импорты обновлены аккуратно, без рефакторинга поведения
- Утилиты — строгое копирование оригинальных функций (1:1), только централизованы
- Минимальные риски регрессий: функционал сохранён, только навели порядок в структуре

Если нужно — могу дальше постепенно выносить повторяющиеся строки/ключи (например, статусы в условиях) в константы, но только по твоему подтверждению.

# 📦 Orders Management System

> Nowoczesny system zarządzania zamówieniami z integracją Google Sheets

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![DaisyUI](https://img.shields.io/badge/DaisyUI-4-green.svg)](https://daisyui.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-blue.svg)](https://tailwindcss.com/)

---

## 📋 O projekcie

**Orders App** - to aplikacja webowa do zarządzania zamówieniami materiałów budowlanych z pełnym cyklem pracy: od utworzenia zamówienia do jego otrzymania na obiekcie.

### 🎯 Główne funkcje:

- ✅ **Zarządzanie zamówieniami** - tworzenie, edycja, usuwanie
- 📊 **Pulpit z analityką** - statystyki zamówień za ostatnie 90 dni
- 🔐 **System ról** - rozgraniczenie dostępu (admin, order_manager, approver, accountant)
- 💱 **Wielowalutowość** - wsparcie PLN, EUR, USD z autokonwersją
- 🔔 **Powiadomienia** - konfiguracja osobistych powiadomień
- 🎨 **Motywy** - jasny i ciemny motyw
- 📱 **Responsywny design** - działa na wszystkich urządzeniach
- 🔄 **Synchronizacja z Google Sheets** - w czasie rzeczywistym

---

## 🚀 Technologie

### Frontend:
- **React 18** - biblioteka UI
- **Vite 5** - bundler projektu
- **React Router v6** - nawigacja
- **React Hook Form** - zarządzanie formularzami
- **Yup** - walidacja danych
- **TailwindCSS** - style
- **DaisyUI** - komponenty UI
- **React Hot Toast** - powiadomienia
- **React Icons** - ikony
- **Framer Motion** - animacje

### Backend/Storage:
- **Google Apps Script** - logika serwerowa
- **Google Sheets** - baza danych
- **NBP API** - kursy walut

---

## 📁 Struktura projektu

```
my-app/
├── public/                 # Pliki statyczne
├── src/
│   ├── api/               # 🌐 Integracje API
│   │   └── gasApi.js      # Google Apps Script API
│   │
│   ├── components/        # 🧩 Komponenty React
│   │   ├── layout/        # Komponenty układu
│   │   │   ├── Header.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── orders/        # Komponenty zamówień
│   │   │   ├── OrdersCards.jsx
│   │   │   ├── OrdersFilters.jsx
│   │   │   └── OrdersTable.jsx
│   │   └── ui/            # Komponenty UI
│   │       ├── InputField.jsx
│   │       ├── SelectField.jsx
│   │       └── ...
│   │
│   ├── config/            # ⚙️ Konfiguracja
│   │   ├── roles.js       # Logika ról i dostępów
│   │   └── schemas/       # Schematy walidacji
│   │       └── validationSchemas.js
│   │
│   ├── constants/         # 🔢 Stałe
│   │   ├── apiUrls.js     # URL dla API
│   │   ├── storageKeys.js # Klucze dla storage
│   │   ├── orderStatuses.js
│   │   ├── currencies.js
│   │   └── ...
│   │
│   ├── helpers/           # 💡 Funkcje pomocnicze
│   │   ├── googleSheetsParser.js
│   │   ├── currencyConverter.js
│   │   ├── statsCalculator.js
│   │   └── orderDataPreparation.js
│   │
│   ├── hooks/             # 🎣 Niestandardowe hooki React
│   │   ├── useTheme.js
│   │   ├── useAuth.js
│   │   └── useStorage.js
│   │
│   ├── pages/             # 📄 Strony aplikacji
│   │   ├── Dashboard/     # Pulpit z analityką
│   │   ├── Orders/        # Zarządzanie zamówieniami
│   │   ├── Profile/       # Profil użytkownika
│   │   ├── Settings/      # Ustawienia
│   │   └── LoginPage.jsx
│   │
│   ├── services/          # 🔌 Serwisy
│   │   ├── authService.js
│   │   ├── ordersService.js
│   │   └── ordersCacheService.js
│   │
│   ├── utils/             # 🛠️ Narzędzia
│   │   ├── dateFormatters.js
│   │   ├── priceCalculations.js
│   │   ├── stringHelpers.js
│   │   └── validators.js
│   │
│   ├── App.jsx            # Główny komponent
│   ├── main.jsx           # Punkt wejścia
│   └── index.css          # Style globalne
│
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
├── eslint.config.js
└── README.md
```

---

## 🎭 Role użytkowników

### 👑 Admin
- Pełny dostęp do wszystkich funkcji
- Zarządzanie wszystkimi zamówieniami
- Zmiana dowolnych statusów

### 📝 Order Manager
- Tworzenie nowych zamówień
- Edycja zamówień na etapie "nowe" i "do potwierdzenia"
- Zmiana statusów: nowe → do potwierdzenia → anulowane

### ✅ Approver
- Zatwierdzanie zamówień
- Zmiana statusów: do potwierdzenia → do opłaty/odrzucone

### 💰 Accountant
- Przetwarzanie płatności
- Zmiana statusów: do opłaty → opłacone/odrzucone

### 📦 Stock Controller
- Zarządzanie magazynem
- Zmiana statusów: nowe → na magazynie

---

## 🔄 Cykl życia zamówienia

```
┌─────────┐
│  nowe   │  ← Nowe zamówienie utworzone
└────┬────┘
     ↓
┌──────────────────┐
│ do potwierdzenia │  ← Wysłano do zatwierdzenia
└────┬─────────────┘
     ↓
┌───────────┐
│ do opłaty │  ← Zatwierdzono, oczekuje na płatność
└────┬──────┘
     ↓
┌──────────┐
│ opłacone │  ← Opłacono
└────┬─────┘
     ↓
┌──────────────────┐
│ w drodze do ... │  ← W drodze (do biura/na budowę)
└────┬─────────────┘
     ↓
┌──────────────┐
│ na magazynie │  ← Na magazynie
└────┬─────────┘
     ↓
┌────────────┐
│ otrzymane  │  ← Otrzymano
└────────────┘

Statusy alternatywne:
- anulowane (anulowano)
- odrzucone (odrzucono)
- do wyjaśnienia (wymaga wyjaśnienia)
- błędne (błędne)
```

---

## 🚀 Instalacja i uruchomienie

### Wymagania wstępne:
- Node.js >= 18.x
- npm >= 9.x

### Instalacja zależności:

```bash
cd my-app
npm install
```

### Uruchomienie w trybie deweloperskim:

```bash
npm run dev
```

Aplikacja otworzy się na `http://localhost:5173`

### Budowanie dla produkcji:

```bash
npm run build
```

### Podgląd build produkcyjnego:

```bash
npm run preview
```

---

## 📊 Główne ekrany

### 1. 🏠 Dashboard (Pulpit)
- Statystyki za ostatnie 90 dni
- Wykresy zamówień
- Rozkład według użytkowników
- Kluczowe metryki (całkowita liczba, nowe, suma w PLN)

### 2. 📋 Orders (Zamówienia)
- Tabela wszystkich zamówień z filtrowaniem
- Wyszukiwanie po nazwie, wykonawcy, linku
- Filtry: status, obiekt, wykonawca, sklep
- Sortowanie po dowolnych polach
- Paginacja (25/50/75/100 rekordów)
- Panel boczny ze statystykami

### 3. ➕ Order Form (Formularz zamówienia)
- Tworzenie nowego zamówienia
- Edycja istniejącego
- Walidacja pól w czasie rzeczywistym
- Automatyczne obliczanie całkowitego kosztu
- Rozgraniczenie dostępu według ról

### 4. 👤 Profile (Profil)
- Informacje o użytkowniku
- Stanowisko
- Email
- Rola w systemie

### 5. ⚙️ Settings (Ustawienia)
- Wybór motywu (jasny/ciemny)
- Język interfejsu (w rozwoju)
- Konfiguracja powiadomień
- Wersja aplikacji

---

## 🎨 Funkcje UI/UX

### Motywy:
- 🌞 **Nord** - jasny motyw (domyślnie)
- 🌙 **Night** - ciemny motyw

### Responsywność:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Wide (1920px+)

### Animacje:
- Płynne przejścia między stronami
- Efekty hover na przyciskach
- Stany ładowania
- Powiadomienia toast

---

## 🔐 Uwierzytelnianie

Aplikacja używa tokenów JWT do uwierzytelniania:

1. Podczas ładowania pobierany jest `SUB_FROM_URL` z globalnego zakresu
2. Wysyłane jest żądanie do Google Apps Script
3. Zwracany jest token JWT z informacjami o użytkowniku
4. Token jest zapisywany w localStorage
5. Przy każdym żądaniu sprawdzana jest ważność tokenu

---

## 💾 Praca z danymi

### Struktura Google Sheets:

#### Tabela `orders`:
- A: id
- B: createdAt
- C: createdBy
- D: modifiedAt
- E: modifiedBy
- F: store (sklep)
- G: pricePerUnit
- H: totalPrice
- I: currency
- J: orderName
- K: status
- L: deadline
- M: object (obiekt)
- N: link
- O: quantity
- P: address
- Q: note
- R: tgid

#### Tabela `users`:
- A: sub (id użytkownika)
- B: name
- C: email
- D: role
- E: position
- F: createdAt
- G: allow_notifications

---

## 🔧 Konfiguracja

### Główne stałe:

```javascript
// Statusy zamówień
ORDER_STATUSES = [
  "nowe", "do potwierdzenia", "do opłaty", 
  "opłacone", "w drodze do biura", "w drodze na budowę",
  "na magazynie", "otrzymane", "do wyjaśnienia", 
  "anulowane", "odrzucone", "błędne"
]

// Waluty
CURRENCIES = ["PLN", "EUR", "USD"]

// Rozmiary stron
PAGE_SIZES = [25, 50, 75, 100]
```

---

## 🧪 Testowanie

```bash
# Uruchomienie testów jednostkowych (w rozwoju)
npm run test

# Uruchomienie z pokryciem
npm run test:coverage

# Testy E2E (w rozwoju)
npm run test:e2e
```

---

## 📦 Zależności

### Główne:
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.28.0",
  "react-hook-form": "^7.54.0",
  "@hookform/resolvers": "^3.9.1",
  "yup": "^1.4.0",
  "react-hot-toast": "^2.4.1",
  "react-icons": "^5.3.0",
  "react-spinners": "^0.14.1",
  "framer-motion": "^11.11.17"
}
```

### Zależności deweloperskie:
```json
{
  "@vitejs/plugin-react": "^4.3.4",
  "vite": "^5.4.11",
  "tailwindcss": "^3.4.15",
  "daisyui": "^4.12.14",
  "eslint": "^9.15.0"
}
```

---

## 👥 Autorzy projektu

### 💻 Deweloperzy:

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/kuchynskyi">
        <img src="https://github.com/kuchynskyi.png" width="100px;" alt="Tymur Kuchynskyi"/><br />
        <sub><b>Tymur Kuchynskyi</b></sub>
      </a><br />
      <sub>Full Stack Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/vykhrystiuk">
        <img src="https://github.com/vykhrystiuk.png" width="100px;" alt="Vitalii Vykhrystiuk"/><br />
        <sub><b>Vitalii Vykhrystiuk</b></sub>
      </a><br />
      <sub>Co-Lead Developer</sub>
    </td>
  </tr>
</table>

### 🛠️ Wkład:
- **Architektura i refaktoryzacja**: 2024-2025
- **Rozwój Frontendu**: React 18 + Vite
- **Integracja Backendu**: Google Apps Script
- **Design UI/UX**: TailwindCSS + DaisyUI

---

## 📄 Licencja

Projekt prywatny. Wszelkie prawa zastrzeżone.

---

**Made with ❤️ using React + Vite**
