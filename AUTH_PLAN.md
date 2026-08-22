# Kopi Boy Customer App — Authentication V1

Current: Google OAuth + Facebook OAuth with login overlay shown when no authenticated session exists.

Phone OTP UI is prepared but remains disabled until the SMS provider is configured. We will enable SMS OTP before public launch.

Provider secrets must be configured in Supabase, never committed to GitHub. Final role authorization will be enforced by Supabase/RLS.

No anonymous Supabase session is created by the customer app.
