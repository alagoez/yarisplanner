# Asistanım

Kişisel asistan uygulaması: görevler, takvim, listeler ve hatırlatmalar. iPhone'da ana ekrana eklenen bir web uygulaması (PWA) olarak çalışır.

- Arayüz: React + Vite + TypeScript + Tailwind
- Giriş ve veri: Supabase
- Yayın: Vercel
- Yedek: mevcut sunucuda gecelik `pg_dump`

## Bilgisayarda çalıştırma

1. `.env.local` dosyasındaki `VITE_SUPABASE_PUBLISHABLE_KEY` satırına Supabase panelindeki **publishable** anahtarı yapıştır (Connect → Framework). `secret` / `service_role` anahtarı bu dosyaya **girmez**.
2. Çalıştır:

   ```bash
   npm install
   npm run dev
   ```

3. Tarayıcıda `http://localhost:5173` adresini aç.

İkonları değiştirmek için `scripts/generate-icons.mjs` içindeki tasarımı düzenleyip `node scripts/generate-icons.mjs` çalıştır.

## Supabase ayarları

Supabase panelinde, **Authentication** bölümünde:

- **URL Configuration → Site URL**: Vercel adresi (ör. `https://asistanim.vercel.app`). Geliştirme için **Redirect URLs** listesine `http://localhost:5173` ekle.
- **Sign In / Providers → Email**: şifre en az 8 karakter olsun.
- Arkadaşın hesabını açtıktan sonra **Allow new users to sign up** ayarını kapat. Böylece adresi bilen başka biri hesap açamaz.

## Vercel'e yayınlama

1. Bu klasörü bir GitHub deposuna yükle.
2. Vercel'de **Add New → Project** ile depoyu seç. Framework olarak Vite otomatik algılanır.
3. **Environment Variables** bölümüne `.env.local` içindeki iki değeri ekle: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. **Deploy**. Çıkan adresi Supabase'deki Site URL'e yaz.

## iPhone'a kurulum

1. Safari'de uygulamanın adresini aç.
2. Paylaş düğmesi → **Ana Ekrana Ekle**.
3. Ana ekrandaki **Asistanım** ikonundan aç. Bildirimler (Faz 1) yalnızca bu şekilde açıldığında çalışır ve iOS 16.4 veya üstü gerekir.

## Gecelik yedek (sunucu)

`scripts/backup-db.sh`, `public` şemasını sıkıştırılmış SQL olarak yedekler ve 30 günden eski yedekleri siler.

1. Sunucuya PostgreSQL istemcisini kur. `pg_dump` sürümü, Supabase'in Postgres sürümüyle aynı ya da daha yeni olmalı (Supabase panelinde **Settings → Infrastructure**).
2. Bağlantı adresini Supabase panelinde **Connect → Direct → Session pooler** bölümünden al.
3. Sunucuda ayar dosyasını oluştur ve yalnızca kendin okuyabilecek şekilde kilitle:

   ```bash
   echo "SUPABASE_DB_URL='postgresql://postgres.xxxx:ŞİFRE@aws-0-xx.pooler.supabase.com:5432/postgres'" > ~/.asistanim-yedek.env
   chmod 600 ~/.asistanim-yedek.env
   ```

4. Betiği sunucuya kopyala, çalıştırılabilir yap ve bir kez elle dene:

   ```bash
   chmod +x ~/backup-db.sh
   ~/backup-db.sh
   ```

5. Her gece 03:00'te çalışması için `crontab -e` ile şu satırı ekle:

   ```
   0 3 * * * $HOME/backup-db.sh >> $HOME/asistanim-yedek.log 2>&1
   ```

Geri yüklemek için: `gunzip -c asistanim-TARİH.sql.gz | psql "$SUPABASE_DB_URL"`
