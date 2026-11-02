# EuroBill XML — Geliştirici & Ajan Kuralları (AGENTS.md)

Bu doküman, **EuroBill XML — EU E-Invoice (XRechnung, ZUGFeRD, Factur-X & Peppol) Viewer & Generator** projesinde çalışan tüm yapay zeka ajanları ve geliştiriciler için temel mimari ve güvenlik kurallarını içerir.

## 1. Sıfır Ücretli Dış API Bağımlılığı (Client-Side First)
- Tüm XML ayrıştırma (parsing), doğrulama (validation) ve PDF oluşturma (generation) işlemleri **kullanıcının tarayıcısında (Client-Side)** gerçekleşmelidir.
- Harici bir ücretli SaaS veya üçüncü parti API'ye fatura verisi gönderilemez.
- XML dosyaları yerel JavaScript kütüphaneleri ve DOMParser ile işlenir; PDF'ler doğrudan istemcide `jspdf` / `html2canvas` veya tarayıcı yazdırma standartlarıyla üretilir.

## 2. %100 GDPR ve Veri Mahremiyeti Uyumu
- Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR / DSGVO) gereği, kullanıcının yüklediği veya oluşturduğu e-fatura içerikleri sunucuya iletilmez ve saklanmaz.
- Kullanıcı profil ayarları ve yerel fatura geçmişi yalnızca kullanıcının tarayıcısındaki `localStorage` üzerinde tutulur.
- Üretim ortamı için hazırlanan `supabase_schema.sql` dosyasında Multi-Tenant Row Level Security (RLS) kuralları uygulanmalıdır.

## 3. AB EN 16931 Standartlarına Katı Uyum
- Üretilen XML çıktıları Avrupa standardı **EN 16931-1:2017**, Almanya için **XRechnung 3.0 / ZUGFeRD 2.2**, Fransa için **Factur-X** ve AB geneli için **Peppol BIS Billing 3.0** UBL 2.1 şemalarına birebir uymalıdır.
- Zorunlu alanlar:
  - Satıcı & Alıcı Bilgileri (Ad, Adres, Vergi/KDV No, Leitweg-ID / SIRET / KvK / KBO)
  - KDV Kırılımları ve Vergi Oranları (DE %19/%7, FR %20/%10, BE/NL %21/%12/6 ve AB İçi Ters Vergilendirme %0 Reverse Charge - § 13b UStG)
  - Ödeme Bilgileri (IBAN, BIC, Zahlungsziel / Vade Tarihi)

## 4. Çok Dilli Arayüz (DE / EN / FR)
- Arayüz Almanca (DE), İngilizce (EN) ve Fransızca (FR) tam destek vermelidir.
- Fatura önizlemeleri ve indirme seçenekleri seçilen dile uygun terminolojiyle hazırlanmalıdır.

## 5. Dahili Tarayıcıda (Built-in Browser) Test Zorunluluğu
- Yapılan her özellik ve arayüz değişikliği yerel sunucuda (`npm run dev`) derlenip dahili tarayıcıda canlı olarak test edilmelidir.
- Test senaryoları:
  1. Dil seçici geçişleri (DE, EN, FR)
  2. Örnek Alman ve Fransız XML yükleme ve A4 PDF önizleme
  3. Fatura üretici form doğrulaması, XML ve PDF çıktıları
  4. 2 adet ücretsiz fatura limiti sonrası Abonelik Duvarı (Paywall Modal) tetiklenmesi
  5. Alman BGB § 312k / § 356a iptal ve cayma butonu kontrolü

