# 🚀 Deployment Guide - Project Tactician

## Quick Deploy to GitHub Pages

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `TFT` (or any name you prefer)
3. **Do NOT** initialize with README (we already have one)

### Step 2: Connect Your Local Repository

```bash
cd C:\Users\macho\OneDrive\Desktop\TFT

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/TFT.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to GitHub Pages

```bash
# Deploy the app (this will create and push to gh-pages branch)
npm run deploy
```

**That's it!** Your app will be live at:
```
https://YOUR_USERNAME.github.io/TFT/
```

---

## If You Want to Change the Repository Name

If you named your repo something other than "TFT", update `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/YOUR-REPO-NAME/', // Change this
})
```

Then rebuild and redeploy:
```bash
npm run build
npm run deploy
```

---

## Testing Locally Before Deploy

```bash
# Development mode (hot reload)
npm run dev
# Opens at http://localhost:5173

# Production build preview
npm run build
npm run preview
# Opens at http://localhost:4173
```

---

## Troubleshooting

### Issue: Deploy fails with "remote: Permission denied"
**Solution**: Make sure you've pushed to main branch first:
```bash
git push origin main
```

### Issue: GitHub Pages shows 404
**Solution**: 
1. Go to your repository Settings → Pages
2. Ensure source is set to "gh-pages" branch
3. Wait 2-3 minutes for deployment

### Issue: App loads but shows blank page
**Solution**: Check that `base` in `vite.config.ts` matches your repo name

### Issue: Camera doesn't work on deployed site
**Solution**: GitHub Pages uses HTTPS automatically, camera should work. If not, check browser permissions.

---

## Mobile Access

Once deployed, you can:
1. Open the URL on your phone's browser
2. Bookmark it for quick access
3. (Optional) Add to home screen for app-like experience

---

## Updating the App

Made changes? Redeploy easily:

```bash
# Make your changes...

# Commit
git add .
git commit -m "Your update message"
git push origin main

# Redeploy
npm run deploy
```

---

## 📱 Share Your App

Once deployed, share your TFT strategy companion:
- URL: `https://YOUR_USERNAME.github.io/TFT/`
- Works on any device with a web browser
- No installation required!

---

**Happy deploying! 🎉**
