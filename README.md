# FoodBridge — Evaluation-I

FoodBridge is a React + Vite frontend prototype for connecting surplus-food providers with NGOs/shelters.

## Tech used
- React
- Vite
- JavaScript / ES6+
- CSS3
- React Router
- Browser localStorage

## Evaluation-I scope
This version intentionally focuses on the topics available before Project Based Evaluation-I in the FEE-II course handout: HTML/CSS/responsive design, JavaScript/ES6+, forms, browser storage, React components/props/state/hooks, reusable UI, lifting/controlled state concepts, and React Router including dynamic routes, protected routes and a 404 page.

## Run locally
1. Install Node.js (LTS recommended).
2. Open this folder in VS Code.
3. Open the terminal in the project folder.
4. Run:

```bash
npm install
npm run dev
```

5. Open the localhost URL shown by Vite.

## Important for the academic project
This is an Evaluation-I foundation. Do not add Redux/Zustand, Context API, REST CRUD, Jest, React Testing Library, lazy loading, code splitting, or deployment configuration until the corresponding evaluation covers those topics.

## Main demo flows
### NGO
Home → Find Food → Donation Details → Request Donation → NGO Dashboard

### Provider
Home → Get Started → Provider → Provider Dashboard → Post Donation → listing appears in My Donations

## Folder structure
```text
src/
├── components/
├── data/
├── hooks/
├── pages/
├── utils/
├── App.jsx
├── main.jsx
└── styles.css
```
