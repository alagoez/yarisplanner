import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Ayarlar eksikse null kalır; App bunu yakalayıp kurulum ekranı gösterir.
// implicit akış: e-postadaki onay / şifre yenileme bağlantısı başka bir tarayıcıda
// (ör. iPhone'da uygulama yerine Safari'de) açılsa da çalışır.
export const supabase = url && key ? createClient(url, key, { auth: { flowType: 'implicit' } }) : null
