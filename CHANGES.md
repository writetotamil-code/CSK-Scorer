# Cricket Scorer PWA - Bug Fixes Applied

## Version: 1.1 (Fixed)
**Date:** March 7, 2026

---

## Critical Bug Fixes

### ✅ Fix #1: PWA Installation on iPhone Safari (CRITICAL)

**Problem:** When using "Add to Home Screen" on iPhone Safari, the PWA showed "Not Found" error on launch. This happened because:
- Manifest.json referenced `cricket_scorer.html` 
- Service worker cached `cricket_scorer.html`
- Actual filename was `index.html`
- Result: 404 error when launching PWA

**Solution:** Fixed file references in both manifest and service worker:

#### manifest.json Changes:
```json
// BEFORE:
"start_url": "./cricket_scorer.html"

// AFTER:
"start_url": "/"
```

Also fixed theme colors to match app design:
```json
"background_color": "#0d1f3c",  // Changed from #1a3d10
"theme_color": "#0d1f3c"         // Changed from #1a3d10
```

#### sw.js Changes:
```javascript
// BEFORE:
const CACHE = 'cricket-scorer-v1';
const ASSETS = ['./cricket_scorer.html'];

// AFTER:
const CACHE = 'cricket-scorer-v2';
const ASSETS = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'
];
```

**Impact:** 
- PWA now launches correctly from iPhone home screen
- Offline functionality improved (fonts cached)
- Works on all iOS devices (iPhone, iPad)
- Cache version bumped to force update

---

### ✅ Fix #2: Match Now Ends When Target is Reached

**Problem:** Previously, when chasing a target in the 2nd innings, the match would continue even after reaching the target score. Teams could score 150 while chasing 120, and the scorer had to manually end the match.

**Solution:** Added automatic target-reached detection in two places:

#### Location 1: `score()` function (Line ~851)
```javascript
// Check if target reached (2nd innings win)
if(S.target && S.runs >= S.target){
  renderAll();updateBattingCard();save();endOver(true);endMatch();return;
}
```

This check runs after every legal ball (dots, 1s, 2s, 3s, 4s, 6s, byes).

#### Location 2: `scoreExtras()` function (Line ~690)
```javascript
// Check if target reached (2nd innings win)
if(S.target && S.runs >= S.target){
  renderAll();updateBattingCard();save();endOver(true);endMatch();return;
}
```

This check runs after every wide or no-ball (with or without additional runs).

**Impact:** 
- Match instantly ends when target is reached
- Works regardless of how the winning runs are scored (boundary, single, wide, no-ball, etc.)
- Preserves exact score and overs at moment of victory

---

### ✅ Enhancement: Victory Margin Display

**Problem:** When a team won by chasing a target, the completion screen just showed the final score (e.g., "120/3") without celebrating the victory or showing the margin.

**Solution:** Enhanced the `endMatch()` function (Line ~930) to detect target chases and display victory information prominently.

#### Before:
```
Final Score: 120/3
in 8.2 overs · RR: 14.40
```

#### After:
```
🏆 WON BY 7 WICKETS
120/3 in 8.2 overs · 10 balls left
```

**Code Added:**
```javascript
if(S.target && S.runs >= S.target){
  const wicketsLeft = S.maxWickets - S.wickets;
  const ballsLeft = (S.maxOvers - ov) * S.bpo - S.legalBalls;
  finalScoreText = `🏆 WON BY ${wicketsLeft} WICKET${wicketsLeft !== 1 ? 'S' : ''}`;
  finalMetaText = `${S.runs}/${S.wickets} in ${bl>0?ov+'.'+bl:ov} overs · ${ballsLeft} ball${ballsLeft !== 1 ? 's' : ''} left`;
}
```

**Impact:**
- Clear victory celebration message
- Shows wickets remaining (standard cricket terminology)
- Shows balls remaining for context
- Maintains full score details in metadata line

---

## Testing Performed

All scenarios tested and working correctly:

- ✅ Target reached via single (1 run)
- ✅ Target reached via boundary (4 or 6)
- ✅ Target reached via wide
- ✅ Target reached via no-ball
- ✅ Target reached via byes
- ✅ Target reached on exact last ball
- ✅ Target reached with wickets in hand
- ✅ Victory margin displayed correctly
- ✅ Match still ends when all wickets fall
- ✅ Match still ends when all overs complete
- ✅ History view still shows win/loss correctly
- ✅ No breaking changes to existing functionality

---

## Files Modified

### manifest.json
**Changes:**
1. Fixed `start_url` from `"./cricket_scorer.html"` to `"/"` 
2. Updated theme colors to match app design (`#0d1f3c`)

### sw.js (Service Worker)
**Changes:**
1. Updated cache name from `v1` to `v2`
2. Fixed cached assets to include `/` and `/index.html` instead of `cricket_scorer.html`
3. Added Google Fonts to cache for offline support
4. Added error handling for cache failures

### index.html
**Total lines changed:** ~20 lines
**Sections modified:**
1. `scoreExtras()` function - Added target-reached check (lines ~690)
2. `score()` function - Added target-reached check (lines ~851)
3. `endMatch()` function - Enhanced victory display (lines ~930-947)

### worker.js
**No changes needed** - CloudFlare Worker remains unchanged

---

## Deployment Instructions

1. **Backup Current Version**
   - Save your current files
   - Note: This update is backward compatible but requires all 3 files

2. **Upload ALL Modified Files** (IMPORTANT!)
   - Upload new `index.html`
   - Upload new `manifest.json` 
   - Upload new `sw.js`
   - Keep `worker.js` as-is (no changes)

3. **Clear Cache** (CRITICAL for PWA fix!)
   - Users should fully close the app (swipe away)
   - Re-add to home screen (remove old PWA first if needed)
   - Service worker v2 will auto-update on next launch
   
4. **iPhone Users - Special Instructions**
   If users previously added the broken PWA:
   - Long-press the app icon on home screen
   - Tap "Remove App" 
   - Visit site in Safari again
   - Tap Share → "Add to Home Screen" again
   - Now it will work correctly!

5. **Test**
   - Open in Safari on iPhone
   - Tap Share → "Add to Home Screen"
   - Launch from home screen icon
   - Should open correctly (not 404)
   - Start a match with target and verify auto-end works

---

## Known Limitations (Unchanged)

These items were not addressed in this update:

- ⚠️ **Manual innings transition:** Still requires scorer to manually reset between innings
- ⚠️ **No target validation:** Can still set target below current score (no error)
- ⚠️ **No automatic target setting:** Scorer must manually enter first innings total + 1

These could be addressed in future updates if needed.

---

## Backward Compatibility

✅ **Fully backward compatible**
- Existing matches will continue working
- No data migration needed
- No changes to state structure
- History from old version displays correctly

---

## Support

If you encounter any issues after deployment:

1. Check browser console for JavaScript errors
2. Verify the file was uploaded correctly
3. Clear browser cache completely
4. Test in incognito/private browsing mode
5. Check that CloudFlare Worker is still functioning

---

## Future Enhancements (Not Included)

Consider for next version:
- Automatic innings transition button
- Target validation with warnings
- Duckworth-Lewis support for rain-affected matches
- Enhanced victory animations/celebrations
- Automatic target calculation (+1 from first innings)

---

**Version History:**
- v1.0 - Original release
- v1.1 - Fixed target-reached bug, enhanced victory display (THIS VERSION)
