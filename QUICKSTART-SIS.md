# Quick Start Guide - SIS Portal Support

## 🎉 What's New?
Your Rate My Professor extension now works on the **LACCD Student Portal** (SIS) in addition to the public guest search!

## 🚀 How to Test It Right Now

### Step 1: Reload the Extension ⚠️ IMPORTANT
1. Open Chrome and go to `chrome://extensions/`
2. Find "LACCD Rate My Professor"
3. Click the refresh/reload button 🔄
4. **This step is critical** - the extension won't work on new URLs until you reload it!

### Step 2: Log Into Your Student Portal
1. Go to https://csprd.laccd.edu
2. Log in with your student credentials
3. Navigate to **Manage Classes**

### Step 3: Try These Pages

#### Option A: View My Current Classes
1. Click **"View My Classes/Schedule"**
2. You'll see your enrolled classes (like CS 136, MATH 270, etc.)
3. Click on a class name to expand the details
4. **Look for:** 🔍 Search RMP buttons next to instructor names!

#### Option B: Search for Classes
1. Click **"Class Search and Enroll"**
2. Search for classes in any term
3. View class details
4. **Look for:** RMP buttons in the results

### Step 4: Check If It's Working

Open your browser console (press **F12**) and look for these messages:

```
✅ [LACCD RMP] System detected: SIS_PORTAL
✅ [LACCD RMP] Initializing extension for SIS_PORTAL...
✅ [LACCD RMP] [SIS] Found X professor elements
✅ [LACCD RMP] [SIS] Added professor: [Name]
```

## 🎯 What You Should See

### Before (Just the instructor name):
```
CS 136 Intro to Data Struct
Class# 19418 - Section S01 - LEC
Instructor: John Smith
```

### After (With RMP button):
```
CS 136 Intro to Data Struct
Class# 19418 - Section S01 - LEC
Instructor: John Smith 🔍 Search RMP
                       ↑ Click this!
```

## 💡 Pro Tips

1. **Be Patient:** The SIS portal takes 3-4 seconds to load fully. Wait a bit before refreshing.

2. **Expand Details:** Some pages don't show instructors until you click on class details. Try clicking class names!

3. **Check the Console:** If nothing appears, open console (F12) and look for error messages.

4. **Campus Detection:** The extension figures out which campus based on the room (e.g., "City-Online" → LA City College).

## ❓ Troubleshooting

### No buttons appear at all?

**FIRST: Did you reload the extension?** ⚠️
- Go to `chrome://extensions/`
- Find "LACCD Rate My Professor"
- Click the 🔄 refresh button
- Close and reopen all SIS portal tabs

**Still not working?**
- Wait 5 seconds and refresh the page
- Make sure the instructor isn't "TBA" or "Staff"  
- Click on class details to expand them
- Check if extension is enabled at `chrome://extensions/`
- Open console (F12) and look for `[LACCD RMP]` messages

### Wrong campus detected?
- The extension reads room info like "City-Online", "Southwest-Online"
- If room format is unexpected, it defaults to Pierce College
- Check console for campus detection messages

### Buttons appear but don't work?
- Make sure you're clicking the blue link
- Check if pop-up blocker is blocking RateMyProfessors
- Try right-click → "Open in new tab"

## 📊 What Gets Logged (in Console)

You'll see detailed logs like:
```
[LACCD RMP] System detected: SIS_PORTAL
[LACCD RMP] [SIS] Found 5 potential instructor spans
[LACCD RMP] [SIS] Checking span DERIVED_SSR_FL_SSR_INSTRNAME$0: "Smith, John"
[LACCD RMP] [SIS] Added professor: Smith, John
[LACCD RMP] Processing professor: Smith, John
[LACCD RMP] Using campus from Room column: LACC
[RMP] Generated URL for Los Angeles City College: https://www.ratemyprofessors.com/search/professors/2384?q=John%20Smith
```

## 🐛 Found a Bug?

Please note:
1. **What page** you were on (copy the URL)
2. **What you tried** (searching, clicking, etc.)
3. **Console messages** (screenshot or copy/paste)
4. **Expected vs actual** behavior

## ✅ Success Checklist

- [ ] Extension reloaded in Chrome
- [ ] Logged into student portal
- [ ] Visited "View My Classes/Schedule"
- [ ] Expanded class details
- [ ] Saw "🔍 Search RMP" buttons
- [ ] Clicked button and went to RateMyProfessors
- [ ] Checked console for debug logs

## 🎊 You're All Set!

The extension now works on both:
- ✅ Public guest search (no login needed)
- ✅ Student SIS portal (requires login)

Enjoy easier access to professor ratings! 🎓

