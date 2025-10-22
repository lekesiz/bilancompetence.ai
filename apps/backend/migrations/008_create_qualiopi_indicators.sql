-- Migration 008: Create Qualiopi Indicators Table
-- Date: 2025-10-23
-- Purpose: Create base table for 32 Qualiopi indicators
-- Status: NEW

-- ============================================================================
-- QUALIOPI_INDICATORS TABLE
-- ============================================================================
-- Stores the 32 Qualiopi certification indicators
CREATE TABLE IF NOT EXISTS qualiopi_indicators (
  id INT PRIMARY KEY,
  indicator_number INT NOT NULL UNIQUE CHECK (indicator_number >= 1 AND indicator_number <= 32),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  -- e.g., "Information", "Resources", "Access", "Implementation", "Results"
  focus_level VARCHAR(50),
  -- e.g., "CORE", "SECONDARY", "OPTIONAL"
  evidence_requirements TEXT,
  -- Guidelines on what evidence is needed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_qualiopi_indicators_number ON qualiopi_indicators(indicator_number);
CREATE INDEX IF NOT EXISTS idx_qualiopi_indicators_category ON qualiopi_indicators(category);
CREATE INDEX IF NOT EXISTS idx_qualiopi_indicators_focus ON qualiopi_indicators(focus_level);

-- Add comments
COMMENT ON TABLE qualiopi_indicators IS 'Stores the 32 Qualiopi certification indicators';
COMMENT ON COLUMN qualiopi_indicators.indicator_number IS 'Indicator number 1-32 as per Qualiopi specification';
COMMENT ON COLUMN qualiopi_indicators.focus_level IS 'CORE (1, 11, 22), SECONDARY, or OPTIONAL';

-- Insert the 32 Qualiopi indicators
INSERT INTO qualiopi_indicators (id, indicator_number, name, description, category, focus_level, evidence_requirements)
VALUES
(1, 1, 'Hizmetler Hakkında Bilgilendirme', 'Hizmetler hakkında tam ve doğru bilgilendirme yapılması', 'Information', 'CORE', 'Web sitesi, broşür, sözleşme, hizmet tanımı'),
(2, 2, 'Katılımcılar Tarafından Erişilebilirlik', 'Hizmetlere erişim kolaylığı ve engel çıkarılmaması', 'Access', 'SECONDARY', 'Erişilebilirlik politikası, katılımcı ifadeleri'),
(3, 3, 'Uyum Sağlama Mekanizmaları', 'Hizmetleri bireyin ihtiyaçlarına göre uyarlama', 'Implementation', 'SECONDARY', 'Uyarlama örnekleri, süreç dokümantasyonu'),
(4, 4, 'Yardımcı Hizmetler', 'Beslenme, ulaşım, bakım gibi yardımcı hizmetler sağlanması', 'Resources', 'SECONDARY', 'Hizmet sözleşmeleri, sağlayıcı listesi'),
(5, 5, 'Çevrimiçi Eğitim Kalitesi', 'Çevrimiçi hizmetlerin kalitesi ve uygulanması', 'Implementation', 'SECONDARY', 'Teknoloji altyapısı, eğitim materyalleri'),
(6, 6, 'Hizmet Sunan Personel Nitelikleri', 'Hizmet sunan personelin nitelik ve deneyimi', 'Resources', 'SECONDARY', 'Özgeçmiş, sertifikalar, eğitim geçmişi'),
(7, 7, 'Personel Geliştirme', 'Personel için sürekli gelişim ve eğitim', 'Resources', 'SECONDARY', 'Eğitim planları, kurs katılımı'),
(8, 8, 'Altyapı ve Ortam', 'Eğitim için uygun fiziksel veya sanal ortam', 'Resources', 'SECONDARY', 'Ortam açıklamaları, teknik altyapı'),
(9, 9, 'Öğrenme Materyalleri', 'Öğrenme materyallerinin kalitesi ve uygunluğu', 'Resources', 'SECONDARY', 'Materyal listesi, kalite kontrol'),
(10, 10, 'Katılımcı Bir Şey Olaşmışsa Bildirim', 'Katılımcı bırakırsa veya sorun olursa bildirim', 'Implementation', 'SECONDARY', 'Bildirim prosedürü, kayıtlar'),
(11, 11, 'Katılımcı Memnuniyeti Ölçümü', 'Katılımcı memnuniyetinin ölçülmesi ve analizi', 'Results', 'CORE', 'Anket formları, sonuçlar, analiz raporları'),
(12, 12, 'Hedefleri Belirtme ve Takip', 'Eğitim hedefleri belirlenir ve izlenir', 'Implementation', 'SECONDARY', 'Hedef tanımları, ilerleme raporları'),
(13, 13, 'Bilişsel Öğrenme Çıktıları', 'Bilişsel öğrenme hedeflerinin belirlenmesi', 'Implementation', 'SECONDARY', 'Öğrenme hedef dokümantasyonu'),
(14, 14, 'Davranışsal Öğrenme Çıktıları', 'Davranışsal öğrenme hedeflerinin belirlenmesi', 'Implementation', 'SECONDARY', 'Davranış hedef tanımları'),
(15, 15, 'Sosyal Öğrenme Çıktıları', 'Sosyal ve duygusal gelişim hedefleri', 'Implementation', 'SECONDARY', 'Sosyal hedef tanımları'),
(16, 16, 'Belge Yönetimi Sistemi', 'Belgeler yönetilen ve saklanan bir sistem', 'Implementation', 'SECONDARY', 'Belge yönetimi prosedürü'),
(17, 17, 'Belge Değerlendirmesi', 'Belgelerin düzenli olarak gözden geçirilmesi', 'Implementation', 'SECONDARY', 'İnceleme prosedürü, kayıtlar'),
(18, 18, 'Katılımcı İlerleme Takibi', 'Katılımcıların ilerlemesi düzenli takip', 'Implementation', 'SECONDARY', 'İzleme yöntemleri, raporlar'),
(19, 19, 'İş Sonuçları Ölçümü', 'İş sonuçlarının ölçülmesi ve takibi', 'Results', 'SECONDARY', 'Sonuç ölçüm metodolojisi, veriler'),
(20, 20, 'Mesleki Sonuçlar Ölçümü', 'Mesleki sonuçların ölçülmesi', 'Results', 'SECONDARY', 'Mesleki sonuç raporları'),
(21, 21, 'Sosyal Sonuçlar Ölçümü', 'Sosyal ve kişisel sonuçların ölçülmesi', 'Results', 'SECONDARY', 'Sosyal sonuç raporları'),
(22, 22, 'Belgeler ve Arşiv', 'Tüm belgeler düzgün arşivlenir ve saklanır', 'Implementation', 'CORE', 'Arşiv prosedürü, saklanma politikası'),
(23, 23, 'Geri Bildirim Sistemi', 'Katılımcılardan geri bildirim alınması', 'Implementation', 'SECONDARY', 'Geri bildirim mekanizması, sonuçlar'),
(24, 24, 'Dış Paydaş Geri Bildirimi', 'Dış paydaşlardan geri bildirim alınması', 'Implementation', 'SECONDARY', 'Paydaş geri bildirim formu'),
(25, 25, 'Müşterilik Sürecinin Analizi', 'Müşterilik sürecinin düzenli analizi', 'Implementation', 'SECONDARY', 'Analiz raporları'),
(26, 26, 'Teknoloji Yeterliliği', 'Hizmet sunumunda teknoloji yeterliliği', 'Resources', 'SECONDARY', 'Teknoloji envanteri, yeterlilik raporu'),
(27, 27, 'Eşitlik ve Ayrımcılık Karşıtlığı', 'Eşitlik ve ayrımcılıkla mücadele', 'Implementation', 'SECONDARY', 'Politika belgeleri, eğitim kayıtları'),
(28, 28, 'Engelli Katılımcılar', 'Engelli katılımcılar için uygulamalar', 'Implementation', 'SECONDARY', 'Erişilebilirlik raporları'),
(29, 29, 'Çevre Politikası', 'Çevre dostu hizmet sunumu', 'Implementation', 'SECONDARY', 'Çevre politikası, uygulamalar'),
(30, 30, 'Sosyal Sorumluluk', 'Sosyal sorumluluk projelerine katılım', 'Implementation', 'SECONDARY', 'Proje belgesi'),
(31, 31, 'Yaşadığı Yer Politikası', 'Yaşadığı yer fark etmeksizin hizmet', 'Implementation', 'SECONDARY', 'Hizmet kapsamı dokümantasyonu'),
(32, 32, 'Uluslararası Görevler', 'Uluslararası hizmet sunumu', 'Implementation', 'SECONDARY', 'Uluslararası proje örnekleri')
ON CONFLICT DO NOTHING;

