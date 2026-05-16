Design a complete web application UI for "SGB – Sistema de Gestión Bibliotecaria" 
(Library Management System). The system has TWO distinct user roles with 
completely different views:

---

🔐 AUTHENTICATION LOGIC:
- Login screen is shared for both roles.
- If the email ends in an institutional domain like "@edu.co", "@edu.co.com", 
  or similar educational/institutional patterns → redirect to ADMIN VIEW.
- Any other email format → redirect to USER VIEW.
- Include fields: Email, Password, "Iniciar sesión" button, and a 
  "¿Olvidaste tu contraseña?" link.

---

👤 USER VIEW (Lector / Usuario):
Pages to design:

1. HOME / DASHBOARD
   - Welcome banner with user name
   - Quick stats: active loans, pending reservations, overdue alerts (mora)
   - Search bar for catalog
   - Sections: "Mis préstamos activos", "Mis reservas", "Libros disponibles"

2. CATALOG PAGE
   - Grid of book cards showing: cover image placeholder, title, author, 
     availability badge (Disponible / Prestado / Reservado)
   - Filter bar: by category, availability, type (préstamo / venta)
   - Each card has two CTA buttons: "Solicitar préstamo" and "Comprar"

3. LOAN REQUEST MODAL / PAGE
   - Book details
   - Loan type selector: Express (1–3 days), Semanal (7 days), Mensual (30 days)
   - Due date auto-calculated and displayed
   - Confirm button — disabled if user has active mora or has reached loan limit

4. MY LOANS PAGE
   - Table/list of active and past loans
   - Columns: Book title, loan type, start date, due date, status 
     (Active / Overdue / Returned)
   - Overdue loans highlighted in red with mora amount displayed
   - "Ver historial" toggle

5. RESERVATIONS PAGE
   - List of current reservations with queue position
   - Status: "En espera (#2 en cola)", "Disponible – recoge antes del [fecha]"
   - Cancel reservation button

6. BOOK PURCHASE PAGE
   - Only shows books flagged for sale (independent inventory from loans)
   - Quantity selector
   - Total price
   - "Comprar" button (no payment gateway — just registers the transaction)
   - Confirmation screen after purchase

7. NOTIFICATIONS PANEL (sidebar or bell icon dropdown)
   - List of system messages: mora alerts, reservation available, 
     purchase confirmed, loan due soon

8. USER PROFILE
   - Name, email, ID
   - Change password form
   - Loan history summary

---

🛠️ ADMIN VIEW (Bibliotecario / Administrador):
Pages to design:

1. ADMIN DASHBOARD
   - KPI cards: Total active loans, overdue loans today, books in catalog, 
     books sold this month, pending reservations
   - Recent activity feed
   - Quick action buttons: "Registrar devolución", "Agregar libro", "Ver reportes"

2. CATALOG MANAGEMENT
   - Full table of all books with columns: ID, Title, Author, Category, 
     Loan stock, Sale stock, Status
   - "Agregar libro" button → opens form modal with fields: title, author, 
     category, ISBN, loan quantity, sale quantity, price (for sale books)
   - Edit and Delete actions per row
   - Admin can update prices and mora rates here

3. LOANS MANAGEMENT
   - Table of all active loans across all users
   - Columns: User name, email, book title, loan type, due date, status, mora amount
   - Overdue rows highlighted
   - "Registrar devolución" button per row → opens modal to confirm return 
     and charge any mora

4. RETURNS & MORA PANEL
   - Process a return: search user by email or ID, see active loans, 
     mark as returned, display mora amount, confirm charge
   - Mora tariff configuration panel (admin-only): set price per overdue day

5. RESERVATIONS QUEUE
   - View all waitlists per book
   - See queue order, notify next in line, manually remove from queue

6. SALES MANAGEMENT
   - Table of all book purchase transactions
   - Columns: Date, User, Book, Quantity, Total
   - Sale inventory stock levels shown separately from loan inventory

7. REPORTS PAGE
   - Date range selector
   - Report types (tabs or cards):
     • Préstamos por período
     • Libros más solicitados
     • Usuarios con mora activa
     • Inventario actual (préstamo vs. venta)
     • Ingresos por ventas
   - Each report shows a simple data table + a bar or line chart
   - Export button (CSV / PDF — UI only)

8. USER MANAGEMENT
   - List of registered users
   - Columns: Name, Email, Registration date, Active loans, Mora status
   - View user detail / block user action

---

🎨 DESIGN SYSTEM & STYLE:
- Style: Clean, modern, professional. Academic/library feel.
- Primary color: Deep navy blue (#1A3A5C) or dark teal (#0D5C63)
- Accent color: Warm amber (#E8A020) for CTAs and alerts
- Error/Mora: Red (#D32F2F)
- Success: Green (#388E3C)
- Background: Light gray (#F5F7FA), white cards
- Typography: Inter or Poppins — headings bold, body regular
- Components needed: 
  • Nav sidebar (admin) / top navbar (user)
  • Book cards
  • Data tables with pagination
  • Status badges (Disponible, Prestado, Vencido, En cola)
  • Modal overlays for forms
  • Toast notifications
  • KPI stat cards
  • Date picker
  • Role-based navigation (completely different nav items per role)
- Responsive: Design for desktop (1440px) with mobile breakpoint (375px)
- Language: Spanish (all labels, buttons, and copy in Spanish)

---

📐 PAGES SUMMARY TO DESIGN:
SHARED: Login screen
USER (8 pages): Dashboard, Catalog, Loan Request, My Loans, 
                 Reservations, Purchase, Notifications, Profile
ADMIN (8 pages): Dashboard, Catalog Management, Loans Management, 
                 Returns & Mora, Reservations Queue, Sales, Reports, 
                 User Management

Total: 17 screens minimum. Include hover states for interactive elements 
and at least one filled/active state per data table.