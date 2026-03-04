# Philip Photography (Next.js)

This project uses Next.js with the App Router.

## Scripts

Run from the `philip-photography` folder:

```
npm install
npm run dev
```

Other scripts:

- `npm run build` – Production build
- `npm run start` – Run production server
- `npm run lint` – Lint project

## Project structure

- `app/` – Next.js routes, layouts, and UI components
- `src/` – Shared app logic (contexts, firebase services, hooks, utils)

Using `src/` with Next.js is valid. `app/` is required for App Router routes, while `src/` is optional and commonly used for non-route code organization.

## Environment variables (Firebase)

Create a `.env.local` file in the `philip-photography` folder with:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

Do not commit `.env.local`.
