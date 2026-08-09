# Irish Salary Calculator - Deployment Checklist

## ✅ Code Setup Complete (Done by AI)

All code is ready. You just need to:

---

## 🔴 REQUIRED: Replace Placeholder IDs

### 1. `index.html` (line 11)
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID" crossorigin="anonymous"></script>
```
**Replace** `ca-pub-YOUR_PUBLISHER_ID` with your actual AdSense publisher ID (format: `ca-pub-1234567890123456`)

### 2. `src/App.tsx` (lines 7-10)
```tsx
const AD_CLIENT = 'ca-pub-YOUR_PUBLISHER_ID'
const AD_SLOT_TOP = 'YOUR_TOP_SLOT_ID'
const AD_SLOT_MIDDLE = 'YOUR_MIDDLE_SLOT_ID'
const AD_SLOT_BOTTOM = 'YOUR_BOTTOM_SLOT_ID'
```
**Replace all four** with your actual AdSense values from [AdSense Console → Ads → By ad unit](https://adsense.google.com/ads/units)

### 3. `public/robots.txt` (line 4)
```
Sitemap: https://YOUR_DOMAIN.com/sitemap.xml
```
**Replace** `YOUR_DOMAIN.com` with your actual domain (e.g., `salarycalc.ie`)

### 4. `public/sitemap.xml` (all URLs)
Replace `YOUR_DOMAIN.com` with your actual domain

### 5. `public/privacy.html` (line 7)
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID" crossorigin="anonymous"></script>
```
**Replace** with your publisher ID

---

## 🔴 REQUIRED: Get AdSense Account

1. Go to [adsense.google.com](https://adsense.google.com)
2. Sign up with your Google account
3. Add your site URL (after deployment)
4. Wait for approval (1-14 days)
5. Create 3 ad units:
   - **Top**: Responsive banner (728x90 or auto)
   - **Middle**: Responsive banner
   - **Bottom**: Responsive banner
6. Copy the `data-ad-client` (publisher ID) and `data-ad-slot` for each

---

## 🔴 REQUIRED: Deploy

### Option A: Vercel (Easiest)
```bash
cd ireland-salary-calculator
npm i -g vercel
vercel
```
- Follow prompts (auto-detects Vite)
- Add custom domain in Vercel dashboard
- Free SSL, global CDN, auto-deploys on git push

### Option B: Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option C: GitHub Pages
```bash
npm i -g gh-pages
npm run build && gh-pages -d dist
```
- Then enable Pages in repo Settings → Pages

---

## 🟡 RECOMMENDED: Post-Deploy

1. **Submit to Google Search Console**
   - Add property → Verify ownership
   - Submit `sitemap.xml`

2. **Add Custom Domain**
   - Buy domain (Namecheap, Cloudflare, Porkbun)
   - Add in Vercel/Netlify dashboard
   - Update AdSense with new domain

3. **Test Ads**
   - Visit your live site
   - Check browser console for AdSense errors
   - Use AdSense "Ad preview" tool

4. **Analytics (Optional)**
   - Add Google Analytics 4
   - Add to `index.html` head

---

## 📁 File Structure After Deploy

```
ireland-salary-calculator/
├── public/
│   ├── robots.txt          ← Update domain
│   ├── sitemap.xml         ← Update domain
│   ├── privacy.html        ← Update publisher ID
│   └── favicon.svg
├── src/
│   ├── App.tsx             ← Update 4 AdSense IDs
│   ├── components/
│   │   ├── AdSense.tsx
│   │   ├── CookieConsent.tsx
│   │   ├── Calculator.tsx
│   │   ├── Tools.tsx
│   │   ├── Results.tsx
│   │   └── Fields.tsx
│   ├── lib/
│   │   ├── tax.ts
│   │   └── format.ts
│   └── main.tsx
├── index.html              ← Update publisher ID
├── vercel.json
├── netlify.toml
├── deploy.bat
└── package.json
```

---

## 💰 Revenue Optimization Tips

| Tip | Impact |
|-----|--------|
| Add blog posts about Irish tax changes | High (SEO traffic) |
| Target "Irish tax calculator 2025" keywords | High |
| Mobile-friendly (already done) | Required |
| Fast loading (67KB JS gzipped) | Good |
| Cookie consent (already added) | Required for EU |
| Privacy policy (already added) | Required |

---

## 🆘 Troubleshooting

| Issue | Fix |
|-------|-----|
| Ads not showing | Wait 24-48h after AdSense approval; check console for errors |
| "Publisher ID invalid" | Ensure `ca-pub-` prefix is included |
| CORS errors | Use `crossorigin="anonymous"` on script tag (already done) |
| Build fails | Run `npm run build` locally first |
| Vercel 404 on refresh | `vercel.json` rewrites handle this (already configured) |

---

## 📞 Support

- **Vercel issues**: [vercel.com/support](https://vercel.com/support)
- **AdSense issues**: [AdSense Help](https://support.google.com/adsense)
- **Code issues**: Check GitHub repo

---

**Once you replace the 7 placeholder values and deploy, you're live!** 🎉