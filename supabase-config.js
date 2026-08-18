// Kopi Boy live database configuration.
// Create a Supabase project, then paste your Project URL and Publishable Key here.
// Never put a service_role key in this file.
window.KOPI_SUPABASE_URL = "PASTE_YOUR_SUPABASE_URL_HERE";
window.KOPI_SUPABASE_KEY = "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE";
window.KOPI_SUPABASE_READY = false;
if (window.supabase && !window.KOPI_SUPABASE_URL.includes("PASTE_")) {
  window.supabase = window.supabase.createClient(window.KOPI_SUPABASE_URL, window.KOPI_SUPABASE_KEY);
  window.KOPI_SUPABASE_READY = true;
}
