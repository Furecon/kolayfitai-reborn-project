import { LegalLayout } from './LegalLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Gizlilik Politikası">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 mb-6">
            <p className="text-sm text-muted-foreground">
              Son güncelleme tarihi: 01.01.2024
            </p>
            <p>
              KolayfitAi olarak, kişisel verilerinizin güvenliği ve gizliliği bizim için son derece önemlidir. 
              Bu gizlilik politikası, uygulamamızı kullanırken kişisel bilgilerinizin nasıl toplandığını, 
              kullanıldığını ve korunduğunu açıklar.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="data-collection" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                1. Topladığımız Bilgiler
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Kişisel Bilgiler:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Ad, soyad ve e-posta adresi</li>
                    <li>Yaş, cinsiyet, boy ve kilo bilgileri</li>
                    <li>Aktivite seviyesi ve hedef bilgileri</li>
                    <li>Beslenme alışkanlıkları ve tercihleri</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Teknik Bilgiler:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Cihaz bilgileri ve işletim sistemi</li>
                    <li>IP adresi ve konum bilgileri</li>
                    <li>Uygulama kullanım istatistikleri</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-usage" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                2. Bilgilerin Kullanımı
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p>Topladığımız bilgileri şu amaçlarla kullanırız:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>Kişiselleştirilmiş beslenme planları oluşturmak</li>
                  <li>Kalori hesaplamaları yapmak</li>
                  <li>Uygulama performansını iyileştirmek</li>
                  <li>Müşteri destek hizmeti sağlamak</li>
                  <li>Yasal yükümlülükleri yerine getirmek</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-sharing" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                3. Bilgi Paylaşımı
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p>Kişisel verilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmayız:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>Açık rızanız olması durumunda</li>
                  <li>Yasal zorunluluklar gereği</li>
                  <li>Hizmet sağlayıcılarımızla (veri güvenliği sözleşmeleri dahilinde)</li>
                  <li>Anonim ve toplu istatistiksel veriler</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-security" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                4. Veri Güvenliği
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p>Verilerinizin güvenliği için aldığımız önlemler:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>SSL şifrelemesi ile veri aktarımı</li>
                  <li>Güvenli sunucu altyapısı</li>
                  <li>Düzenli güvenlik denetimleri</li>
                  <li>Sınırlı personel erişimi</li>
                  <li>Düzenli veri yedekleme</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="user-rights" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                5. Kullanıcı Hakları
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p>KVKK kapsamındaki haklarınız:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                  <li>İşlenen veriler hakkında bilgi talep etme</li>
                  <li>Verilerin düzeltilmesini isteme</li>
                  <li>Verilerin silinmesini talep etme</li>
                  <li>İşleme faaliyetlerine itiraz etme</li>
                </ul>
                <p className="mt-3">
                  Bu haklarınızı kullanmak için <strong>info@kolayfitai.com</strong> adresine başvurabilirsiniz.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contact" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                6. İletişim
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p>Gizlilik politikası ile ilgili sorularınız için:</p>
                <div className="mt-2 space-y-1">
                  <p><strong>E-posta:</strong> info@kolayfitai.com</p>
                  <p><strong>Veri Sorumlusu:</strong> KolayfitAi</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </LegalLayout>
  )
}