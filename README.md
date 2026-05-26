# Nusuk App Demo

Interactive mobile app demo for a family financial literacy platform.

## What is included

- Child and Parent view toggles
- Clickable bottom navigation
- Lesson player with quiz and XP feedback
- Goal detail and contribution workflows
- Parent add-goal wizard
- Family member drill-downs
- Reward redemption flow

## Run locally

Open `index.html` in a browser, or run:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Firebase Hosting

This project is static and ready for Firebase Hosting. After selecting a Firebase project, add `.firebaserc`:

```json
{
  "projects": {
    "default": "YOUR_FIREBASE_PROJECT_ID"
  }
}
```

Then deploy:

```bash
firebase deploy --only hosting
```
