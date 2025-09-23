import { LegalLayout } from './LegalLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export function TermsOfService() {
  return (
    <LegalLayout title="Kullanım Şartları">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 mb-6">
            <p className="text-sm text-muted-foreground">
              Son güncelleme tarihi: 01.01.2024
            </p>
            <p>
              KolayfitAi uygulamasını kullanarak aşağıdaki şart ve koşulları kabul etmiş sayılırsınız. 
              Lütfen bu şartları dikkatlice okuyunuz.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="acceptance" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                1. Şartların Kabulü
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p>
                  KolayfitAi uygulamasına erişim sağlayarak veya uygulamayı kullanarak, 
                  bu kullanım şartlarını tam olarak okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz.
                </p>
                <p className="mt-3">
                  Bu şartları kabul etmiyorsanız, uygulamayı kullanmamanız gerekmektedir.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="service-description" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                2. Hizmet Tanımı
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-3">
                <p>KolayfitAi aşağıdaki hizmetleri sunar:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>AI destekli besin analizi ve kalori hesaplama</li>
                  <li>Kişiselleştirilmiş beslenme planları</li>
                  <li>Barkod tarama ile besin bilgisi sorgulama</li>
                  <li>Günlük kalori ve makro besin takibi</li>
                  <li>Beslenme önerileri ve rehberlik</li>
                </ul>
                <p className="mt-3">
                  <strong>Önemli:</strong> KolayfitAi tıbbi bir uygulama değildir ve sağlık danışmanlığı hizmeti vermez.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="user-obligations" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                3. Kullanıcı Yükümlülükleri
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p>Uygulamamızı kullanırken:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>Doğru ve güncel bilgiler sağlamanız gerekmektedir</li>
                  <li>Hesap güvenliğinizi korumak sizin sorumluluğunuzdadır</li>
                  <li>Uygulamayı yasalara aykırı amaçlarla kullanamazsınız</li>
                  <li>Diğer kullanıcıların haklarına saygı göstermelisiniz</li>
                  <li>Fikri mülkiyet haklarını ihlal edemezsiniz</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="medical-disclaimer" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                4. Tıbbi Sorumluluk Reddi
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-3">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="font-medium text-amber-800">⚠️ Önemli Uyarı</p>
                  <p className="text-amber-700 mt-2">
                    KolayfitAi bir sağlık uygulaması değildir ve tıbbi tavsiye vermez.
                  </p>
                </div>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Uygulama sadece genel bilgilendirme amaçlıdır</li>
                  <li>Sağlık sorunlarınız için mutlaka doktor veya diyetisyen ile görüşün</li>
                  <li>Özel beslenme ihtiyaçlarınız için uzman desteği alın</li>
                  <li>Hamilelik, hastalık durumlarında profesyonel destek şarttır</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="intellectual-property" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                5. Fikri Mülkiyet Hakları
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p>
                  KolayfitAi uygulaması, içeriği, tasarımı, algoritmaları ve tüm fikri mülkiyet hakları 
                  KolayfitAi'ye aittir.
                </p>
                <ul className="list-disc list-inside space-y-1 mt-3 ml-4">
                  <li>Uygulama içeriğini izinsiz kopyalayamazsınız</li>
                  <li>Ters mühendislik yapamazsınız</li>
                  <li>Ticari amaçlarla kullanamazsınız</li>
                  <li>Üçüncü taraflara dağıtamazsınız</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-accuracy" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                6. Veri Doğruluğu
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p>
                  Uygulamamızda sunulan besin değerleri ve kalori bilgileri mümkün olduğunca doğru 
                  olmaya çalışılsa da, %100 kesinlik garanti edilmez.
                </p>
                <ul className="list-disc list-inside space-y-1 mt-3 ml-4">
                  <li>Besin değerleri üretici bilgilerine dayanır</li>
                  <li>Pişirme yöntemleri değerleri etkileyebilir</li>
                  <li>Porsiyon ölçüleri tahminidir</li>
                  <li>Önemli durumlarda çapraz kontrol yapın</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="limitation-liability" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                7. Sorumluluk Sınırlaması
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p>
                  KolayfitAi, uygulamanın kullanımından doğabilecek doğrudan veya dolaylı zararlardan 
                  sorumlu tutulamaz.
                </p>
                <p className="mt-3">
                  Bu sınırlama şunları içerir ancak bunlarla sınırlı değildir:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>Veri kaybı veya bozulması</li>
                  <li>Hizmet kesintileri</li>
                  <li>Yanlış beslenme kararları</li>
                  <li>Sağlık problemleri</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="subscription" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                8. Abonelik ve Ödeme
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p>Premium özellikler için:</p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>Abonelik ücretleri peşin olarak alınır</li>
                  <li>Otomatik yenileme varsayılan olarak etkindir</li>
                  <li>İptal işlemi bir sonraki dönemden geçerlidir</li>
                  <li>İade koşulları ayrı politikada belirtilmiştir</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="termination" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                9. Hesap Feshi
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p>
                  Hesabınızı istediğiniz zaman silebilirsiniz. Ayrıca şu durumlarda hesabınız askıya alınabilir:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                  <li>Kullanım şartlarının ihlali</li>
                  <li>Sahte bilgi sağlanması</li>
                  <li>Yasadışı aktiviteler</li>
                  <li>Diğer kullanıcılara zarar verme</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="changes" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                10. Değişiklikler
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p>
                  Bu kullanım şartlarını istediğimiz zaman güncelleyebiliriz. 
                  Önemli değişiklikler uygulama içinde duyurulacaktır.
                </p>
                <p className="mt-3">
                  Güncellemelerden sonra uygulamayı kullanmaya devam etmeniz, 
                  yeni şartları kabul ettiğiniz anlamına gelir.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contact-terms" className="border rounded-lg px-4">
              <AccordionTrigger className="text-left">
                11. İletişim
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <p>Kullanım şartları ile ilgili sorularınız için:</p>
                <div className="mt-2 space-y-1">
                  <p><strong>E-posta:</strong> info@kolayfitai.com</p>
                  <p><strong>Şirket:</strong> KolayfitAi</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </LegalLayout>
  )
}