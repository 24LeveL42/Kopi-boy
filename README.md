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
