# ClutchLab Release Checklist

Use this checklist after the page/component refactor is complete.

## 1. Local verification

Run from the project root:

```bash
npm run build
```

Expected result:

```text
tsc -b && vite build
```

The command should finish without TypeScript errors.

## 2. Git status

```bash
git status
```

Expected result after commit:

```text
nothing to commit, working tree clean
```

If files are still uncommitted:

```bash
git add -A
git commit -m "Stabilize refactored app architecture"
git push
```

## 3. Vercel deploy

Open the Vercel project and check the latest deployment.

Expected:

- Status is `Ready`
- Deployment points to the latest GitHub commit
- Production URL opens without a blank screen

Current production URL:

```text
https://clutchlab-olive.vercel.app/
```

## 4. Manual route check

Open these routes directly in the browser:

```text
/
 /players
 /players/zywoo
 /teams
 /teams/vitality
 /maps
 /maps/mirage
 /compare
 /team-compare
 /roster-builder
 /saved-rosters
 /roles
 /roles/awper
 /traits
 /builder
 /unknown-page
```

Expected:

- Every page opens without console errors
- `/builder` redirects to `/roster-builder`
- `/unknown-page` shows the Not Found page
- Header navigation remains visible on every page
- Active navigation state works
- No page reload is required during navigation

## 5. Roster Builder smoke test

1. Open `/roster-builder`
2. Add 5 players
3. Check that score/warnings update
4. Save the roster
5. Open `/saved-rosters`
6. Confirm the roster is visible
7. Reload the page
8. Confirm the roster is still visible

## 6. Compare pages smoke test

Player compare:

1. Open `/compare`
2. Select two players
3. Check that cards and metrics update

Team compare:

1. Open `/team-compare`
2. Select two teams
3. Check that comparison metrics update

## 7. Browser console check

Open DevTools → Console.

Expected:

- No red runtime errors
- No broken import/module errors
- No failed asset loads from the app itself
