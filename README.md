# Library Management System (LMS)

Angular 16 application for managing a library with **Librarian** and **Member** roles.

## Features

### Librarian
- Maintain database of books (add, view)
- Manage members and subscriptions (membership expiry)
- Approve/reject borrow, return, and extension requests
- Send reminder emails to users (simulated via Mail Log)
- Full history reports
- Mail log (simulated email tracking)

### Member
- Browse available books by category
- Request book borrowing
- Return books (submit return request)
- Request extension for borrowed books (subject to librarian approval)
- View history and reports
- Automatic fines for late returns (tracked in account)
- Email notifications for requests, approvals, reminders, fines (simulated)

### Flow
- Unique Request IDs: `LMS-YYYY-NNNN` (e.g. LMS-2025-0001)
- Simulated emails for booking requests, return requests, approvals, reminders, fines
- User onboarding → Approval → Borrow → Return flow
- Reminder scheduler (runs every minute in demo; checks due dates 2 days ahead)

## Run

```bash
cd angular-lms
npm install
ng serve
```

Open http://localhost:4200

## Demo Login

| Role     | Email              | Password     |
|----------|--------------------|--------------|
| Librarian| librarian@lms.com  | librarian123 |
| Member   | member@lms.com     | member123    |

## Data Storage

All data is stored in `localStorage`. Clear browser storage to reset.
