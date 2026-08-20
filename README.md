# Kopi Boy Customer App V1

Customer-only application.

- Shows only approved active cooks from Supabase.
- Displays each cook's published menu.
- Places real orders into `orders`.
- Shows PayNow/direct-to-cook messaging.
- Receives live order status updates.

The current Supabase schema should be the V9 schema already installed for this project.

Keep the existing configured `supabase-config.js` with the publishable key.


## Kopi Boy v1.1 changes
- Customer: area/postal-code food filtering and mandatory delivery address before ordering.
- Partner: first-time cook/rider compliance acknowledgement; optional SFA licence declaration for cooks.
- Management: acknowledgement/licence status visible during approval.
