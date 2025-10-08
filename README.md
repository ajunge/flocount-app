# Counter App

A simple, responsive counter app built with Next.js, React, and Tailwind CSS. Features 4 names with individual counters that can be incremented or decremented.

## Features

- 🎯 Individual counters for 4 people
- ➕ Increment/decrement buttons
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
3. Vercel will automatically detect Next.js and configure the build settings
4. Click "Deploy"

Alternatively, install the Vercel CLI:

```bash
npm i -g vercel
vercel
```

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
