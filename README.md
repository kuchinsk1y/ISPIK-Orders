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
### 🛠️ Wkład:
- **Architektura i refaktoryzacja**: 2025
- **Rozwój Frontendu**: React 18 + Vite
- **Integracja Backendu**: Google Apps Script
- **Design UI/UX**: TailwindCSS + DaisyUI

---

## 📄 Licencja

Projekt prywatny. Wszelkie prawa zastrzeżone.

---

**Made with ❤️ using React + Vite**

- **Tymur Kuchynskyi**
- **Vitalii Vykhrystiuk**
