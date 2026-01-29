-- Create UMKM table
CREATE TABLE IF NOT EXISTS umkm (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  jenis TEXT NOT NULL,
  kategori TEXT,
  alamat TEXT,
  lokasi TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  deskripsi TEXT,
  kontak TEXT,
  gambar TEXT,
  gambar_list JSONB DEFAULT '[]'::jsonb,
  video_list JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Wisata table
CREATE TABLE IF NOT EXISTS wisata (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL,
  deskripsi TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  foto TEXT,
  foto_list JSONB DEFAULT '[]'::jsonb,
  video_list JSONB DEFAULT '[]'::jsonb,
  jam_operasional TEXT,
  harga_tiket TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_settings table for storing passcodes
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin passcodes (hashed or plain - for demo using plain)
INSERT INTO admin_settings (setting_key, setting_value) 
VALUES ('umkm_passcode', 'admin123'), ('wisata_passcode', 'admin123')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample UMKM data
INSERT INTO umkm (nama, jenis, kategori, alamat, lokasi, lat, lng, deskripsi, kontak) VALUES
('Warung Makan Bu Siti', 'Kuliner', 'Makanan', 'Jl. Raya Sukorejo No. 12', 'Jl. Raya Sukorejo No. 12', -7.4186, 110.9758, 'Warung makan dengan menu masakan tradisional Jawa yang lezat', '081234567890'),
('Kerajinan Bambu Pak Agus', 'Kerajinan', 'Kerajinan', 'Dsn. Krajan, Sukorejo', 'Dsn. Krajan, Sukorejo', -7.4195, 110.977, 'Produksi kerajinan bambu seperti anyaman dan furniture', '082345678901'),
('Toko Sembako Berkah', 'Lainnya', 'Lainnya', 'Jl. Masjid Sukorejo', 'Jl. Masjid Sukorejo', -7.4175, 110.9745, 'Toko sembako lengkap dengan harga terjangkau', '083456789012')
ON CONFLICT DO NOTHING;

-- Insert sample Wisata data
INSERT INTO wisata (nama, kategori, deskripsi, lat, lng, jam_operasional, harga_tiket) VALUES
('Taman Desa Sukorejo', 'Alam', 'Taman hijau yang asri di tengah desa, cocok untuk bersantai bersama keluarga. Dilengkapi dengan area bermain anak dan gazebo untuk istirahat.', -7.5626, 110.8282, '06:00 - 18:00', 'Gratis')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE umkm ENABLE ROW LEVEL SECURITY;
ALTER TABLE wisata ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (anyone can view UMKM and Wisata)
CREATE POLICY "Allow public read access on umkm" ON umkm FOR SELECT USING (true);
CREATE POLICY "Allow public read access on wisata" ON wisata FOR SELECT USING (true);

-- Create policies for public write access (for admin operations via API)
CREATE POLICY "Allow public insert on umkm" ON umkm FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on umkm" ON umkm FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on umkm" ON umkm FOR DELETE USING (true);

CREATE POLICY "Allow public insert on wisata" ON wisata FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on wisata" ON wisata FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on wisata" ON wisata FOR DELETE USING (true);

-- Admin settings - read only for passcode verification
CREATE POLICY "Allow public read on admin_settings" ON admin_settings FOR SELECT USING (true);
CREATE POLICY "Allow public update on admin_settings" ON admin_settings FOR UPDATE USING (true);
