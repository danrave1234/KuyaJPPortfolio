# Firebase Functions Setup Guide

## Step 1: Install Dependencies

```bash
cd functions
npm install
```

## Step 2: Build Functions

```bash
npm run build
```

## Step 3: Deploy Functions

```bash
# From the project root
firebase deploy --only functions
```

## Step 4: Update Frontend Configuration

1. Replace `your-project-id` in `src/firebase/api.js` with your actual Firebase project ID
2. The functions will be available at:
   - HTTP: `https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/getGalleryImages`
   - Callable: `getGalleryImagesCallable`

## Step 5: Test the API

```javascript
// Test in browser console
import { getGalleryImages } from './src/firebase/api.js';
getGalleryImages('gallery').then(console.log);
```

## Benefits

- **500 images = 1 request** instead of 500 requests
- **Server-side processing** - faster and more secure
- **Automatic caching** - Firebase Functions cache responses
- **Rate limiting protection** - server handles Firebase limits
- **Cost optimization** - fewer Firebase Storage API calls

## Monitoring

Check function logs:
```bash
firebase functions:log
```

## Local Development

```bash
firebase emulators:start --only functions
```

Then test at: `http://localhost:5001/YOUR-PROJECT-ID/us-central1/getGalleryImages`
