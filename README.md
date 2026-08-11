# BillFlow Dashboard

# Bill & Company Management Dashboard — Frontend Demo

Build a **modern, professional, fully functional frontend-only Bill & Company Management Dashboard**.

This is a client demo/prototype, so **do not build any backend, database, API, authentication server, MongoDB, Mongoose, or Express.js**.

Use **dummy/mock data + Zustand** for all application state.

The goal is to demonstrate the complete business flow and UI to the client. All CRUD operations should work on the frontend using Zustand/localStorage.

---

## 1. Technology Stack

Use:

* Next.js 14
* TypeScript
* Tailwind CSS
* shadcn/ui
* Zustand
* React Hook Form
* Zod
* Recharts
* Lucide React icons

Use clean, reusable and modular React components.

---

# 2. Application Purpose

The application is a **Bill Management System** where an admin can:

* Manage companies
* Add bills under companies
* Track pending bills
* Complete bills
* Record payment method
* Track completed bills
* View payment statistics
* Search and filter bills

A second user type, **Viewer**, should have read-only access.

---

# 3. User Roles

Implement two frontend demo roles.

## Admin

Admin has full access.

Admin can:

* View dashboard
* Add company
* Edit company
* Delete company
* View company
* Add bill
* Edit bill
* Delete bill
* Complete bill
* Select payment method
* Search bills
* Filter bills
* View bill details

## Viewer

Viewer has read-only access.

Viewer can:

* View dashboard
* View companies
* View bills
* Search bills
* Filter bills
* View bill details

Viewer cannot:

* Add company
* Edit company
* Delete company
* Add bill
* Edit bill
* Delete bill
* Complete bill
* Change payment method

Hide write/action buttons completely for Viewer users.

---

# 4. Demo Login

Create a simple frontend-only login page.

Do not create real authentication.

Use two predefined demo accounts.

### Admin

```text
Email: admin@example.com
Password: admin123
Role: ADMIN
```

### Viewer

```text
Email: viewer@example.com
Password: viewer123
Role: VIEWER
```

When the user logs in:

* Store the current user in Zustand
* Persist login state in localStorage
* Redirect to Dashboard
* Show the user's role in the header

Add a logout button.

---

# 5. Overall UI

Create a professional SaaS/admin dashboard.

Layout:

```text
┌─────────────────────────────────────────────┐
│ Sidebar          │ Header                   │
│                  │                          │
│ Dashboard        │                          │
│ Companies        │ Main Content             │
│ Bills            │                          │
│ Pending Bills    │                          │
│ Completed Bills  │                          │
│                  │                          │
└─────────────────────────────────────────────┘
```

### Sidebar

Menu items:

* Dashboard
* Companies
* Bills
* Pending Bills
* Completed Bills

Highlight the active page.

Admin sees all pages.

Viewer sees all read-only pages.

### Header

Include:

* Page title
* Notification icon
* User avatar
* User name
* User role
* Logout option

---

# 6. Dashboard

Create an attractive dashboard.

Display six summary cards.

### Card 1

**Total Bills**

Show total number of bills.

### Card 2

**Pending Bills**

Show number of pending bills.

### Card 3

**Completed Bills**

Show number of completed bills.

### Card 4

**Total Amount**

Show total amount of all bills.

### Card 5

**Pending Amount**

Show total amount from pending bills.

### Card 6

**Completed Amount**

Show total amount from completed bills.

All statistics must be calculated dynamically from Zustand data.

When a bill is added, deleted or completed, dashboard numbers must update automatically.

---

# 7. Dashboard Charts

Use Recharts.

Create:

### Bill Status Chart

Show:

* Pending
* Completed

Use a donut/pie chart.

### Monthly Bill Amount

Create a bar or line chart showing bill amounts by month.

### Payment Method

Create a chart showing completed bills grouped by:

* Cash
* Cheque
* Online

Charts must use the current Zustand data.

---

# 8. Companies Page

Create a professional Companies management page.

Top section:

```text
Companies
Manage all your companies

[Search companies]                    [+ Add Company]
```

Admin can see Add Company.

Viewer should not see the Add Company button.

---

# 9. Company Table

Display:

| Company Name | Phone Number | Total Bills | Pending Amount | Completed Amount | Actions |
| ------------ | ------------ | ----------: | -------------: | ---------------: | ------- |

Actions for Admin:

* View
* Edit
* Delete

Actions for Viewer:

* View only

Show appropriate empty state when there are no companies.

---

# 10. Add Company

When Admin clicks:

```text
+ Add Company
```

Open a modal.

Fields:

```text
Company Name *
Phone Number *
```

Validation:

* Company name required
* Phone number required
* Validate 10-digit Indian phone number

Buttons:

```text
Cancel
Add Company
```

After adding:

* Add company to Zustand
* Persist to localStorage
* Close modal
* Show success toast
* Update company list

Toast:

```text
Company added successfully.
```

---

# 11. Edit Company

Admin can edit:

* Company Name
* Phone Number

Open the same modal with existing data.

After saving:

* Update Zustand
* Persist to localStorage
* Show success toast

---

# 12. Delete Company

Admin can delete a company.

Before deleting show confirmation:

```text
Delete Company?

Are you sure you want to delete this company?
This action cannot be undone.
```

Buttons:

```text
Cancel
Delete
```

If the company has bills, show a warning:

```text
This company has existing bills.
Deleting the company may also affect its associated bills.
```

For this demo, prevent deleting a company that has bills and show an error toast.

---

# 13. Company Details

When clicking View, open a company details page.

Show:

### Company Information

```text
Company Name
Phone Number
Created Date
```

### Statistics

```text
Total Bills
Pending Bills
Completed Bills
Total Amount
Pending Amount
Completed Amount
```

### Company Bills

Show all bills belonging to that company.

Use the same bill table component.

---

# 14. Bills Page

Create the main Bills page.

Header:

```text
Bills
Manage and track all bills

[Search] [Filters]                  [+ Add Bill]
```

Admin sees Add Bill.

Viewer does not.

---

# 15. Bill Table

Create a professional responsive table.

Columns:

```text
Bill Name
Company
Bill Number
Invoice Number
Total Amount
Created Date
Due Date
Status
Payment Method
Actions
```

Example:

```text
Website Development
ABC Technologies
B-1001
INV-5001
₹75,000
01 Aug 2026
20 Aug 2026
PENDING
-
```

For completed bills:

```text
COMPLETED
ONLINE
```

---

# 16. Bill Status

Use clear badges.

Pending:

```text
PENDING
```

Completed:

```text
COMPLETED
```

If a bill is pending and the due date has passed:

```text
OVERDUE
```

Overdue should be visually different from normal pending.

---

# 17. Bill Actions

Admin action menu:

```text
View
Edit
Complete
Delete
```

Viewer action menu:

```text
View
```

Use a three-dot dropdown menu instead of showing many buttons.

---

# 18. Add Bill

Admin clicks:

```text
+ Add Bill
```

Open a modal or dedicated form page.

Fields:

```text
Company *
Bill Name *
Bill Number *
Invoice Number *
Total Amount *
Due Date *
```

Use proper form validation.

Rules:

* Company required
* Bill name required
* Bill number required
* Invoice number required
* Amount must be greater than 0
* Due date required

Automatically assign:

```text
Created Date = current date
Status = PENDING
Payment Method = null
```

After saving:

* Add bill to Zustand
* Save to localStorage
* Show success toast
* Close form
* Update dashboard
* Update company statistics

---

# 19. Edit Bill

Admin can edit pending bills.

Allow editing:

```text
Company
Bill Name
Bill Number
Invoice Number
Total Amount
Due Date
```

Completed bills should not be editable unless explicitly allowed.

For this demo, disable editing completed bills.

---

# 20. Complete Bill

This is an important workflow.

When Admin clicks:

```text
Complete
```

open a modal.

### Modal

Title:

```text
Complete Bill
```

Show bill information:

```text
Bill Name
Company
Bill Number
Invoice Number
Total Amount
Due Date
```

Then show:

```text
Select Payment Method
```

Radio buttons:

```text
○ Cash
○ Cheque
○ Online
```

Payment method is required.

Buttons:

```text
Cancel
Complete Bill
```

When Complete Bill is clicked:

```text
status = COMPLETED
paymentMethod = selected method
completedAt = current date/time
```

Update Zustand.

Persist to localStorage.

Show:

```text
Bill completed successfully.
```

Automatically update:

* Dashboard
* Pending Bills
* Completed Bills
* Company statistics
* Payment method chart

---

# 21. Delete Bill

Admin can delete bills.

Show confirmation modal:

```text
Delete Bill?

Are you sure you want to delete this bill?
This action cannot be undone.
```

Buttons:

```text
Cancel
Delete Bill
```

After deletion:

* Remove from Zustand
* Update localStorage
* Update dashboard
* Update company statistics
* Show success toast

---

# 22. Bill Details

When clicking View, show a detailed bill page or modal.

Display:

```text
Bill Name
Company
Bill Number
Invoice Number
Total Amount
Created Date
Due Date
Status
Payment Method
Completed Date
```

Create a clean invoice-like details layout.

For pending bills:

```text
Payment Method: Not Paid
```

For completed bills:

```text
Payment Method: Online
Completed Date: 05 Aug 2026
```

---

# 23. Pending Bills Page

Create a dedicated page containing only pending bills.

Display summary:

```text
Pending Bills: 12
Pending Amount: ₹4,50,000
```

Show bill table.

Admin can:

```text
View
Edit
Complete
Delete
```

Viewer can:

```text
View
```

---

# 24. Completed Bills Page

Create a dedicated Completed Bills page.

Display summary:

```text
Completed Bills: 18
Completed Amount: ₹8,75,000
```

Show:

```text
Bill Name
Company
Bill Number
Invoice Number
Total Amount
Created Date
Completed Date
Payment Method
```

Viewer can view only.

---

# 25. Search

Implement instant search.

Bills should be searchable by:

* Bill Name
* Company Name
* Bill Number
* Invoice Number

Companies should be searchable by:

* Company Name
* Phone Number

Search should update the table instantly.

---

# 26. Filters

Bills should support:

### Status

```text
All
Pending
Completed
Overdue
```

### Company

Dropdown containing all companies.

### Payment Method

```text
All
Cash
Cheque
Online
```

### Date

Allow filtering by:

```text
Created Date
Due Date
```

Allow combining multiple filters.

---

# 27. Sorting

Allow sorting by:

* Bill Name
* Company
* Amount
* Created Date
* Due Date
* Status

Default:

```text
Newest bills first
```

---

# 28. Pagination

Add pagination to bill and company tables.

Options:

```text
10
25
50
100
```

Display:

```text
Showing 1–10 of 30
```

Include:

* Previous
* Next
* Page numbers

---

# 29. Zustand State Management

Use Zustand as the main state management solution.

Create:

```text
store/
├── authStore.ts
├── companyStore.ts
└── billStore.ts
```

### authStore

```text
currentUser
isAuthenticated
login()
logout()
```

### companyStore

```text
companies
addCompany()
updateCompany()
deleteCompany()
getCompanyById()
```

### billStore

```text
bills
addBill()
updateBill()
deleteBill()
completeBill()
getBillById()
```

Create derived selectors/functions for:

```text
getPendingBills()
getCompletedBills()
getOverdueBills()
getTotalAmount()
getPendingAmount()
getCompletedAmount()
```

Do not hardcode dashboard numbers.

---

# 30. LocalStorage Persistence

Because this is a frontend-only demo, persist Zustand state using localStorage.

If the browser is refreshed:

* Companies should remain
* Bills should remain
* Completed status should remain
* Login state should remain

Create a simple "Reset Demo Data" option in the admin profile/menu.

When clicked, show confirmation and restore the original dummy dataset.

---

# 31. Mock Data

Create realistic demo data.

At least:

```text
6 companies
25 bills
```

Include:

* Pending bills
* Completed bills
* Overdue bills
* Cash payments
* Cheque payments
* Online payments

Use Indian company names and INR amounts.

Example companies:

```text
ABC Technologies Pvt Ltd
Shree Enterprises
Patel Industries
Nova Infotech
Global Traders
Darji Solutions
```

Use realistic amounts:

```text
₹12,500
₹25,000
₹48,500
₹75,000
₹1,20,000
₹2,50,000
```

---

# 32. TypeScript Types

Create clean types.

### User

```typescript
type UserRole = "ADMIN" | "VIEWER";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
```

### Company

```typescript
interface Company {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}
```

### Bill

```typescript
type BillStatus = "PENDING" | "COMPLETED";

type PaymentMethod = "CASH" | "CHEQUE" | "ONLINE";

interface Bill {
  id: string;
  companyId: string;
  name: string;
  billNumber: string;
  invoiceNumber: string;
  totalAmount: number;
  createdAt: string;
  dueDate: string;
  status: BillStatus;
  paymentMethod?: PaymentMethod;
  completedAt?: string;
}
```

---

# 33. Component Structure

Create reusable components.

Suggested structure:

```text
src/
├── app/
│   ├── login/
│   ├── dashboard/
│   ├── companies/
│   ├── companies/[id]/
│   ├── bills/
│   ├── bills/[id]/
│   ├── pending-bills/
│   └── completed-bills/
│
├── components/
│   ├── layout/
│   │   ├── Sidebar
│   │   ├── Header
│   │   └── DashboardLayout
│   │
│   ├── dashboard/
│   │   ├── StatCard
│   │   ├── BillStatusChart
│   │   ├── MonthlyBillChart
│   │   └── PaymentMethodChart
│   │
│   ├── companies/
│   │   ├── CompanyTable
│   │   ├── CompanyForm
│   │   └── CompanyDetails
│   │
│   ├── bills/
│   │   ├── BillTable
│   │   ├── BillForm
│   │   ├── BillDetails
│   │   ├── CompleteBillModal
│   │   └── DeleteBillDialog
│   │
│   └── common/
│       ├── EmptyState
│       ├── LoadingState
│       ├── ConfirmDialog
│       └── SearchInput
│
├── store/
│   ├── authStore.ts
│   ├── companyStore.ts
│   └── billStore.ts
│
├── types/
│   ├── user.ts
│   ├── company.ts
│   └── bill.ts
│
└── lib/
    ├── mockData.ts
    ├── permissions.ts
    └── utils.ts
```

---

# 34. Permission Handling

Create a simple permission helper.

Example:

```typescript
canAddCompany(user)
canEditCompany(user)
canDeleteCompany(user)

canAddBill(user)
canEditBill(user)
canDeleteBill(user)
canCompleteBill(user)
```

Only ADMIN should receive write permissions.

Do not rely only on hiding buttons. Also prevent the corresponding Zustand actions from being executed by Viewer users.

---

# 35. UI/UX

The UI should feel like a **real production SaaS dashboard**.

Design style:

* Modern
* Clean
* Professional
* Minimal
* Business-focused
* Good spacing
* Rounded cards
* Subtle borders
* Professional typography
* Clear status badges

Use Lucide icons.

Use responsive tables.

Use tooltips where helpful.

Use toast notifications for successful actions.

Use confirmation dialogs for destructive actions.

---

# 36. Responsive Design

The application must work on:

* Desktop
* Laptop
* Tablet
* Mobile

Mobile requirements:

* Sidebar becomes a drawer
* Tables become horizontally scrollable
* Forms become single-column
* Dashboard cards stack
* Modals fit within mobile screen
* Action menus remain easy to use

---

# 37. Empty States

Companies:

```text
No companies found.

Add your first company to start managing bills.
```

Bills:

```text
No bills found.

Add a bill to start tracking payments.
```

Pending:

```text
No pending bills.

You're all caught up!
```

Completed:

```text
No completed bills yet.
```

---

# 38. Loading & Error States

Even though this is a frontend demo, implement:

* Loading skeletons
* Empty states
* Error states
* Form validation messages
* Toast notifications

---

# 39. Important Business Rules

Implement these rules:

1. Every bill must belong to a company.

2. New bills always start as:

```text
PENDING
```

3. New bills do not have a payment method.

4. Only Admin can complete a bill.

5. Completing a bill requires selecting:

   * Cash
   * Cheque
   * Online

6. Completing a bill changes status to:

```text
COMPLETED
```

7. Completed bills cannot be completed again.

8. Completed bills cannot be edited.

9. Pending bills can be edited.

10. Pending bills can become overdue automatically when the due date passes.

11. Viewer users cannot perform any write action.

12. Dashboard statistics must always be calculated from current bill data.

13. Deleting a bill must immediately update all statistics.

14. Completing a bill must immediately update all statistics and charts.

---

# 40. Demo Experience

Make sure the client can experience the following flow:

### Login

Login as Admin.

### Dashboard

See:

```text
Total Bills
Pending Bills
Completed Bills
Total Amount
Pending Amount
Completed Amount
```

### Add Company

Add:

```text
ABC Technologies
9876543210
```

### Add Bill

Add:

```text
Website Development
B-1001
INV-5001
₹75,000
20 Aug 2026
```

The bill should appear as:

```text
PENDING
```

### Complete Bill

Click Complete.

Select:

```text
Online
```

Bill becomes:

```text
COMPLETED
```

Dashboard updates automatically.

### Viewer

Logout and login as:

```text
viewer@example.com
```

Viewer can see all information but cannot modify anything.

---

# 41. Final Requirement

This must be a **fully interactive frontend demo**, not static HTML/mock screens.

Everything should work using:

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
Zustand
localStorage
mock data
```

Do NOT implement:

* MongoDB
* Express
* Node backend
* API calls
* Mongoose
* Real authentication
* External database

Focus entirely on creating an excellent frontend experience and functional client demo.

The application should be polished enough that a client can review the complete workflow and provide feedback before backend development begins.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://company-bill.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a0ee0dd2-6fd1-411b-8b05-26b126ee347b).

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
