const SUPABASE_URL = 'https://fxlhezgwkvdmbwwvttrt.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_aA6MV2etwACD3KAtGIHiNg_tJZy3QQ2';

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);