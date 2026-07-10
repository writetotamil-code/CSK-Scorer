# PWA Installation Troubleshooting Guide

## iPhone Safari "Not Found" Error - SOLVED ✅

### What Was The Problem?

When users tapped "Add to Home Screen" in Safari and then launched the app, they got a "Not Found" or 404 error.

**Root Cause:**
- The `manifest.json` file pointed to `cricket_scorer.html`
- The service worker cached `cricket_scorer.html`
- But the actual file was named `index.html`
- When PWA launched, it tried to load a file that didn't exist

### The Fix

**3 files were updated to fix this:**

1. **manifest.json**
   - Changed: `"start_url": "./cricket_scorer.html"`
   - To: `"start_url": "/"`
   - Also fixed theme colors to match app

2. **sw.js** 
   - Changed: `const ASSETS = ['./cricket_scorer.html']`
   - To: `const ASSETS = ['/', '/index.html', ...]`
   - Bumped cache version to v2

3. **index.html**
   - No changes needed for PWA fix
   - (Separate bug fixes for scoring logic)

---

## Deployment Checklist

### Server Files
- [ ] Upload new `index.html`
- [ ] Upload new `manifest.json`
- [ ] Upload new `sw.js`
- [ ] Keep `worker.js` as-is
- [ ] Verify all files uploaded successfully

### File Structure Should Be:
```
your-domain.com/
├── index.html          ← Main app
├── manifest.json       ← PWA manifest
├── sw.js              ← Service worker
├── worker.js          ← Cloudflare Worker (optional, for sync)
├── icon-192.png       ← PWA icon (you need to create these)
└── icon-512.png       ← PWA icon (you need to create these)
```

---

## Testing on iPhone

### Fresh Installation Test:
1. Open Safari on iPhone
2. Navigate to your domain
3. Tap share button (square with arrow)
4. Tap "Add to Home Screen"
5. Name it and tap "Add"
6. **Close Safari completely**
7. Tap the new home screen icon
8. Should load correctly with no errors ✅

### If You Still Get 404:

**Check #1: File Names**
```bash
# SSH into your server and verify:
ls -la

# You should see:
# index.html (not cricket_scorer.html)
# manifest.json
# sw.js
```

**Check #2: Manifest is Valid**
```bash
# View the manifest:
cat manifest.json

# Should contain:
# "start_url": "/"
# NOT "start_url": "./cricket_scorer.html"
```

**Check #3: Service Worker Cache**
```bash
# View service worker:
cat sw.js

# Should contain:
# const CACHE = 'cricket-scorer-v2';
# const ASSETS = ['/', '/index.html', ...];
```

**Check #4: Clear iOS Cache**
On iPhone:
1. Settings → Safari
2. Tap "Clear History and Website Data"
3. Confirm
4. Try installing PWA again

---

## Fixing Existing Installations

### For Users Who Already Installed the Broken PWA:

**Method 1: Remove and Re-add**
1. Long-press the app icon on home screen
2. Tap "Remove App"
3. Confirm removal
4. Open Safari and visit the site
5. Add to home screen again
6. Should work now ✅

**Method 2: Force Refresh** (May not always work)
1. Open the PWA from home screen
2. Pull down from top to refresh
3. Service worker should update automatically
4. Close app and reopen

---

## Common Issues & Solutions

### Issue: "Page Not Found" or blank screen
**Solution:** 
- Check that `index.html` exists on server
- Verify `start_url` in manifest.json is `/`
- Clear Safari cache and reinstall PWA

### Issue: App loads but looks broken
**Solution:**
- Check that fonts are loading (may need network first time)
- Verify CloudFlare is not blocking resources
- Check browser console for errors

### Issue: "This site cannot be reached"
**Solution:**
- Check your domain/hosting is working
- Verify CloudFlare DNS is configured correctly
- Test in regular Safari first before adding to home screen

### Issue: App works in Safari but not as PWA
**Solution:**
- This was the original bug - fixed by new files
- Make sure you uploaded ALL 3 files (index.html, manifest.json, sw.js)
- Remove old PWA and reinstall

---

## Verifying The Fix

### Test in Browser DevTools (Desktop):

1. Open Chrome DevTools
2. Go to Application tab
3. Click "Manifest" - should show:
   - `start_url: /`
   - Name: Cricket Scorer
   - Theme color: #0d1f3c

4. Click "Service Workers" - should show:
   - Status: Activated and running
   - Cache: cricket-scorer-v2

5. Click "Cache Storage" → cricket-scorer-v2:
   - Should see: `/`, `index.html`, fonts URL

### Test on iPhone (Real Device):

The only true test is on actual iPhone:
1. Remove old PWA if exists
2. Visit site in Safari
3. Add to home screen
4. Launch from icon
5. Should work without errors ✅

---

## Still Having Issues?

1. **Double-check file upload:** Re-upload all 3 files
2. **Check file permissions:** Files should be readable (644)
3. **Clear ALL caches:** Server cache, CloudFlare cache, browser cache
4. **Test in incognito:** Open Safari in Private mode and test
5. **Check CloudFlare settings:** Make sure it's not caching old files

---

## Technical Details

### Why `start_url: "/"` Works Better

**Before (broken):**
```json
"start_url": "./cricket_scorer.html"
```
- Relative path that may resolve incorrectly
- File doesn't exist (404 error)
- PWA can't launch

**After (fixed):**
```json
"start_url": "/"
```
- Absolute path to site root
- Server serves `index.html` by default
- PWA launches correctly ✅

### Service Worker Asset Caching

**Before (broken):**
```javascript
const ASSETS = ['./cricket_scorer.html'];
```
- Tries to cache non-existent file
- Cache fails silently
- Offline mode broken

**After (fixed):**
```javascript
const ASSETS = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?...'
];
```
- Caches actual files that exist
- Includes fonts for offline use
- Offline mode works ✅

---

## Success Indicators

You'll know it's working when:

✅ PWA installs without errors
✅ Launches from home screen successfully  
✅ Shows correct app name and icon
✅ Works offline after first load
✅ Displays splash screen with correct colors
✅ No "Not Found" errors anywhere

---

## Support Contacts

If issues persist after following this guide:
1. Check server error logs
2. Check browser console for errors
3. Verify CloudFlare settings
4. Test with a fresh iOS device

Version: 1.1
Last Updated: March 7, 2026
