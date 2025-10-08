# Asistencia - Counter App

A simple, responsive counter app built with Next.js, React, and Tailwind CSS. Features 4 names with individual counters that can be incremented or decremented, with persistent storage across devices.

## Features

- 🎯 Individual counters for 4 people
- ➕ Increment/decrement buttons
- 💾 Persistent storage using Vercel KV (Redis) - data syncs across all devices
- 📱 PWA support - install on iPhone/Android as native app
- 📱 Fully responsive design (mobile-friendly)
- 🎨 Clean, modern UI with Tailwind CSS
- ⚡ Built with Next.js 15 and React 18

## Getting Started

### Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

The easiest way to deploy this Next.js app is to use [Vercel](https://vercel.com):

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository to Vercel
3. **Create a Vercel KV database**:
   - Go to your Vercel project dashboard
   - Navigate to "Storage" tab
   - Click "Create Database" → "KV"
   - Follow the prompts to create your KV store
   - Environment variables will be automatically added to your project
4. Vercel will automatically detect Next.js and configure the build settings
5. Click "Deploy"

Alternatively, install the Vercel CLI:

```bash
npm i -g vercel
vercel
```

### Storage Behavior

**Local Development:**
- Uses browser localStorage
- Data persists per browser only
- No cross-browser/device sync

**Production (Vercel with KV database):**
- Uses Vercel KV (Redis)
- Data syncs across ALL browsers and devices
- Persistent centralized storage

### Setting Up Cross-Browser Sync (Production)

To enable data sync across all browsers and devices on production:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project
2. Navigate to **Storage** tab
3. Click **Upstash** → Select **Redis** → Click **Create**
4. Name your database (e.g., "asistencia-storage")
5. Click **Create**
6. Vercel will automatically add these environment variables:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
7. Your app will automatically redeploy with cross-device sync enabled!

## Customization

To change the names, edit the `people` state in `app/page.tsx`:

```typescript
const [people, setPeople] = useState<Person[]>([
  { name: 'Alice', count: 0 },
  { name: 'Bob', count: 0 },
  { name: 'Charlie', count: 0 },
  { name: 'Diana', count: 0 },
]);
```
