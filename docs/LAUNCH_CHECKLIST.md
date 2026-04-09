# Launch Checklist

## Secrets and environment
- [ ] `DATABASE_URL` points to the production database
- [ ] `NEXTAUTH_URL` matches the live HTTPS domain
- [ ] `NEXTAUTH_SECRET` is a long random secret
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are production values
- [ ] Run `npm run preflight`

## OAuth and domain
- [ ] Google OAuth callback includes `/api/auth/callback/google`
- [ ] Production domain is using HTTPS
- [ ] Sign-in and sign-out work on the live domain
- [ ] Gmail sync works with the production OAuth app

## Monitoring and operations
- [ ] `/api/health` returns `200 OK`
- [ ] Server logs are captured by the hosting platform
- [ ] Database backups are enabled
- [ ] Recovery access to the database is documented

## Final go/no-go checks
- [ ] `npm run build && npx eslint . --max-warnings=0`
- [ ] `npm audit --omit=dev` reviewed
- [ ] Core flows tested: dashboard, applications, review, companies, resumes
- [ ] One full sign-in and Gmail review flow tested end-to-end
