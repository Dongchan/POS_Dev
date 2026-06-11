# PochaPOS

PochaPOS is a lightweight browser POS for a busy street-food stall workflow: take orders, identify guests without table numbers, track unserved orders, mark delivery complete, and review daily sales.

## Local Development

```bash
npm install
npm run dev
```

## Firebase

The app runs with `localStorage` when Firebase variables are empty. To enable Firestore sync, copy `.env.example` to `.env.local` and fill the Firebase web app values for the `PochaPOS` project.

## Deployment

Deploy the GitHub repository to Vercel under the `ChaNation` account and add the same Firebase environment variables in the Vercel project settings.
