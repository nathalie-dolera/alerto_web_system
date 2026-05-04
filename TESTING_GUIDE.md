# Quick Testing & Verification Guide

## ✅ What's Been Implemented

### 1. Route Guards (Proxy)
- **File created**: `proxy.ts` (project root)
- **Status**: ✅ Complete
- **Function**: Protects `/dashboard`, `/alarms`, `/devices`, `/users` routes
- **Public routes**: `/login`, `/forgot-password`, `/reset-password`
- **Note**: Uses Next.js 16+ proxy convention (replaces deprecated middleware.ts)

### 2. Dynamic Page Titles
- **Updated files**: 8 page files
- **Method**: Next.js Metadata API (server-side rendering)
- **Status**: ✅ Complete
- **Format**: All pages follow "Alerto | [Page Name]" pattern

## 🧪 How to Test

### Test 1: Verify Route Guards Work
```bash
# Start the dev server
npm run dev

# Open your browser and test:
# 1. Go to http://localhost:3000/dashboard (without logging in)
#    → Should redirect to /login
# 2. Go to http://localhost:3000/login
#    → Should show login page
# 3. Log in with valid admin credentials
#    → Should redirect to /dashboard automatically
# 4. Try to go to /login while logged in
#    → Should redirect to /dashboard
```

### Test 2: Verify Page Titles Update
```bash
# While running dev server:
# 1. Navigate to http://localhost:3000/login
#    → Browser tab should show "Alerto | Login"
# 2. Click through each page:
#    - /dashboard → "Alerto | Dashboard"
#    - /alarms → "Alerto | Alarms"
#    - /devices → "Alerto | Devices"
#    - /users → "Alerto | Users"
#    - /forgot-password → "Alerto | Forgot Password"
#    - /reset-password → "Alerto | Reset Password"

# 3. Check HTML source (Ctrl+U or Right-click → View Page Source)
#    → Look for <title>Alerto | [Page Name]</title> in <head>
```

### Test 3: Verify SEO Metadata
```bash
# In DevTools (F12):
# 1. Go to Elements/Inspector tab
# 2. Expand <head> section
# 3. You should see:
#    <title>Alerto | [Page Name]</title>
#    <meta name="description" content="...">
```

### Test 4: Test Token Expiration/Invalid Token
```bash
# 1. Open DevTools → Application/Storage → Cookies
# 2. Delete the "adminAuthToken" cookie
# 3. Try to access /dashboard
#    → Should redirect to /login
# 4. Log in again
#    → New token should be set
```

## 📋 Files Modified

| File | Change |
|------|--------|
| `proxy.ts` | **NEW** - Route protection proxy (replaces deprecated middleware.ts) |
| `app/layout.tsx` | Updated metadata with proper descriptions |
| `app/(web)/page.tsx` | Added Metadata, removed document.title |
| `app/(web)/alarms/page.tsx` | Added Metadata, removed document.title |
| `app/(web)/devices/page.tsx` | Added Metadata, removed document.title |
| `app/(web)/users/page.tsx` | Added Metadata, removed document.title |
| `app/forgot-password/page.tsx` | Added Metadata |
| `app/reset-password/page.tsx` | Added Metadata |

## 🔍 Verification Checklist

- [ ] No TypeScript errors in the IDE
- [ ] Dev server starts without errors (`npm run dev`)
- [ ] Can log in successfully
- [ ] Protected routes redirect to login when not authenticated
- [ ] Each page shows correct title in browser tab
- [ ] Page titles are visible in HTML `<head>` section
- [ ] Can navigate between authenticated pages without issues
- [ ] Logout redirects to login page
- [ ] Page titles update when navigating (check browser tab)

## ⚙️ Configuration

### Environment Variables Needed
```env
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### Middleware Configuration
- Runs on all routes except:
  - `/api/*` (API routes)
  - `/_next/static/*` (Next.js static files)
  - `/_next/image/*` (Image optimization)
  - `/favicon.ico`
  - Public folder files

## 🚀 Deployment Notes

When deploying to production:
1. Ensure `JWT_SECRET` environment variable is set
2. Ensure `NODE_ENV=production`
3. Verify proxy.ts is included in build (replaces deprecated middleware.ts)
4. Test route guards in production environment
5. Verify page titles render correctly (important for SEO)

## 📚 References

- See `IMPLEMENTATION_GUIDE.md` for detailed documentation
- [Next.js Proxy API](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Next.js Metadata API](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Migration from middleware to proxy](https://nextjs.org/docs/messages/middleware-to-proxy)

## 🆘 Troubleshooting

### Pages notproxy.ts exists in project root
- Restart dev server after updating proxy.tsoot
- Restart dev server after creating middleware
- Clear browser cache and cookies

### Page titles not updating
- Verify metadata export exists in page component
- Check browser's view-source to see HTML head
- Ensure "use client" is AFTER metadata export

### Token not being verified
- Check JWT_SECRET environment variable is set
- Verify token hasn't expired (1 day expiration)
- Check that adminAuthToken cookie is being sent

### Infinite redirect loop
- Clear proxy configuration
- Ensure login route is in PUBLIC_ROUTES

### "middleware is deprecated" warning
- This is expected - proxy.ts is the new convention
- Next.js will use proxy.ts instead of middleware.ts
- Ensure middleware.ts has been removed/renamed
- Ensure login route is in PUBLIC_ROUTES
