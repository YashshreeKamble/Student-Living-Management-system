# Arbor House PG

## Run the app

Install dependencies:

```powershell
npm.cmd install
```

Set one password for the initial accounts in the current PowerShell session:

```powershell
$env:SEED_PASSWORD = "change-this-before-use"
npm.cmd start
```

Open http://localhost:3000. The server creates `arbor-house.sqlite` on first start.

Initial account:

- Admin: `demo@admin.in`
- Password: the value supplied through `SEED_PASSWORD`

Residents are added by the admin after setup. No sample resident accounts or notices are created.

Passwords are stored as bcrypt hashes. Login sessions use an HttpOnly cookie and are stored in SQLite. Change the seed password before using this outside local development, and replace the seeded accounts with real users before production.
