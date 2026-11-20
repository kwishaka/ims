# IMS Portal

An inventory management and customer ordering demo built with React and Vite. The app is in the [`ims-react/`](./ims-react/) folder.

## Features

- Browse products and place customer orders with live stock availability.
- Record stock movements and manage product details.
- Give employees, managers, and customer-service staff role-specific dashboards.
- Review customer support requests.
- Register employee accounts.

## Run locally

Requirements: Node.js and npm.
```powershell
cd ims-react
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Build

Run these commands from the `ims-react/` folder:

```powershell
npm run build
npm run preview
```

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Manager | `manager@imsportal.rw` | `manager123` |
| Employee | `jean.claude@example.com` | `stock123` |
| Customer service | `support@imsportal.rw` | `support123` |

## Demo data

This project currently uses simulated authentication and browser storage rather than a backend database. Accounts created in the app and changes to products, stock movements, orders, and support tickets are stored in the browser. Clearing browser storage resets this demo data. Orders are not processed through a payment gateway.

Product photo sources and license information are listed in [`ims-react/public/images/SOURCES.txt`](./ims-react/public/images/SOURCES.txt).
