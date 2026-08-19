# Kopi Boy — Faithful Reference Prototype

This build was redesigned specifically to follow the supplied 8-screen reference:
- dark espresso/brown Kopi Boy theme
- cream content cards
- orange primary actions
- green rider/cook confirmation actions
- compact mobile-first layout
- customer, cook and rider flows
- direct PayNow-to-merchant and merchant-to-rider messaging
- clickable navigation

## Files
- index.html
- styles.css
- app.js

## GitHub
Upload the three files to the root of your repository.

## Netlify
Import the GitHub repository. No build command is required; publish directory is `/`.

## Note
This is a front-end prototype. PayNow, QR verification, rider location, authentication, databases and notifications are simulated. Food images use remote image URLs for the prototype.


## V3 — Two-way customer/cook test
Cook starts a test and receives a 6-digit code. Customer enters the code, places an order, Cook receives the NEW ORDER, and Accept/Decline is sent back to the Customer immediately. This uses PeerJS only for this temporary two-phone test; both phones must keep the page open. Production will later use authentication and a shared realtime backend.


## V4 — Official Kopi Boy Logo
The uploaded Kopi Boy logo is now included as `kopi-boy-logo.jpg`. The app also has a warm coffee-to-green gradient treatment around the branding area. The supplied artwork itself is kept unchanged.


## V5 — Fixed Cook Connection
The Cook Dashboard now visibly includes **Customer Connection → START COOK TEST**. This generates the 6-digit code. Customer enters that code, places an order, Cook receives it, and Accept/Decline is returned to the Customer. This remains a two-phone test only.


## V7 — LIVE Customer → Cook Orders
The test-code / PeerJS layer has been removed. The order path is now designed around a real shared database: Customer selects a cook → creates an `orders` row → Cook Dashboard subscribes to realtime inserts for that merchant → Cook accepts/declines → the order row updates → Customer sees the updated status.

### Required one-time setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase_schema.sql`.
3. In Supabase Data API settings, expose `merchants` and `orders` as needed.
4. In Supabase Realtime, ensure `orders` is included in the `supabase_realtime` publication.
5. Put your Supabase Project URL and **publishable/anon key** into `supabase-config.js`.
6. Upload all files to GitHub/Netlify.

The browser must never contain a `service_role` key. Supabase's current docs support browser initialization with the project URL + publishable key and Realtime Postgres Changes for live database events. See the official docs: https://supabase.com/docs/reference/javascript/initializing and https://supabase.com/docs/guides/realtime/postgres-changes.

### Important production hardening
V7 is the first real database-connected stage, but the SQL policies are intentionally broad to prove the workflow without login. Before public launch, we must add Supabase Auth and merchant/customer-specific Row Level Security so one merchant cannot read or modify another merchant's orders.


## V8 — Real Rider Workflow
This stage adds the third live role:

**Customer → Cook → Rider → Cook → Customer**

Flow:
1. Customer places order for a selected cook.
2. Cook receives the live order.
3. Cook accepts it.
4. Cook selects **Find Rider**; order becomes `looking_for_rider`.
5. Rider Dashboard receives the available delivery job.
6. Rider taps **Accept Delivery**.
7. Cook receives the rider assignment and rider name.
8. Cook can start cooking.
9. Cook marks food ready.
10. Rider sees the ready job and marks **I've Collected the Food**.
11. Order becomes `out_for_delivery`.
12. Rider marks **Delivered**.
13. Customer receives each status update through the live order subscription.

The database now records timestamps for placed, accepted, rider requested, rider accepted, cooking, ready, picked up, and delivered.

This is a live staging architecture, not the old PIN/test connection. It still uses broad no-login RLS policies for this development stage; proper customer/cook/rider authentication and role-specific RLS are required before public launch.
