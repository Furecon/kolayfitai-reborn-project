
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, BookOpen } from 'lucide-react'

interface ResourcesPageProps {
  onBack: () => void
}

export function ResourcesPage({ onBack }: ResourcesPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="p-4 max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Neden Mifflin-St Jeor Denklemi?</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Kalori Hedefi Belirlemede KolayfitAi Yaklaşımı</h2>
                <p>
                  KolayfitAi'de, günlük kalori hedefinizi oluştururken temel aldığımız mantık oldukça nettir:
                </p>
                <div className="bg-green-50 p-4 rounded-lg my-4">
                  <p className="font-semibold text-center">
                    <strong>Bazal Metabolizma Hızınız (BMR) + Aktivite Seviyeniz + Hedefinize göre Enerji Farkı = Günlük Kalori Hedefiniz</strong>
                  </p>
                </div>
                <p>
                  Bu yaklaşım, ister kilo vermek, ister kas kazanmak ya da kilonuzu korumak isteyin, KolayfitAi'nin size özel öneriler sunmasına olanak tanır.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Bazal Metabolizma Hızı (BMR) Nedir?</h3>
                <p>
                  Bazal Metabolizma Hızı, vücudunuzun tam dinlenme halinde (örneğin tüm gün yatakta hiç hareket etmeden geçirdiğinizde) yaşam fonksiyonlarını sürdürebilmesi için ihtiyaç duyduğu minimum enerji miktarıdır. KolayfitAi, bu değeri bilimsel olarak kabul görmüş Mifflin-St Jeor denklemini kullanarak hesaplar.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Neden Mifflin-St Jeor Denklemi?</h3>
                <p>
                  Mifflin-St Jeor formülü, 1990 yılında geliştirildi ve günümüzde en doğru BMR hesaplama yöntemi olarak kabul ediliyor. Eski standart olan Harris-Benedict formülüne kıyasla %5'e kadar daha hassas sonuçlar verdiği araştırmalarda gösterilmiştir.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">KolayfitAi BMR Hesaplama Formülü:</h3>
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div>
                    <strong>Erkekler için:</strong><br />
                    <code className="bg-white px-2 py-1 rounded">BMR = (10 × kilo) + (6,25 × boy) – (5 × yaş) + 5</code>
                  </div>
                  <div>
                    <strong>Kadınlar için:</strong><br />
                    <code className="bg-white px-2 py-1 rounded">BMR = (10 × kilo) + (6,25 × boy) – (5 × yaş) – 161</code>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Kilo kilogram (kg), boy santimetre (cm) ve yaş yıl olarak alınır. Bu bilgiler sizin tarafınızdan girilen verilerle otomatik olarak hesaplanır.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Aktivite Faktörü Nasıl Belirleniyor?</h3>
                <p>
                  BMR yalnızca dinlenme halindeyken harcadığınız enerjiyi verir. Günlük hareketliliğinizi de hesaba katmak için bir aktivite faktörü kullanırız. KolayfitAi, aktivite seviyenizi kaydolduğunuzda belirttiğiniz bilgilere göre sınıflandırır ve aşağıdaki sabit katsayıları uygular:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Kadınlar:</strong> 1.33</p>
                  <p><strong>Erkekler:</strong> 1.36</p>
                </div>
                <p>
                  Buna ek olarak, KolayfitAi günlük yaşamın tüm saatlerini ayrı ayrı değerlendirerek daha hassas bir aktivite ortalaması belirler:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 my-4">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2 text-left">Aktivite Seviyesi</th>
                        <th className="border border-gray-300 p-2 text-left">Katsayı</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border border-gray-300 p-2">Düşük</td><td className="border border-gray-300 p-2">1.25</td></tr>
                      <tr><td className="border border-gray-300 p-2">Orta</td><td className="border border-gray-300 p-2">1.38</td></tr>
                      <tr><td className="border border-gray-300 p-2">Yüksek</td><td className="border border-gray-300 p-2">1.52</td></tr>
                      <tr><td className="border border-gray-300 p-2">Çok Yüksek</td><td className="border border-gray-300 p-2">1.65</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600">
                  <strong>Not:</strong> Uyku süresi için ortalama 8 saat varsayılır ve bu süre 0.95 katsayısıyla değerlendirilir.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Kalori Hedefine Enerji Farkı Nasıl Eklenir?</h3>
                <p>
                  KolayfitAi, hedefinize ulaşabilmeniz için kalori hedefinizi yalnızca aktivitenize göre değil, aynı zamanda hedef kilo farkınıza göre de düzenler. Bu fark artı (+) ise kilo almak, eksi (–) ise kilo vermek hedeflenir.
                </p>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Kilo Vermek İçin:</h4>
                    <p>Enerji açığı şu şekilde hesaplanır:</p>
                    <code className="bg-yellow-50 px-2 py-1 rounded block my-2">
                      (Kilo farkı × 1100) ÷ (Kilo farkı ÷ Haftalık hedef kilo kaybı)
                    </code>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Haftalık hedef: minimum 0.2 kg, maksimum 1 kg</li>
                      <li>0.2 kg kayıp → günlük ~220 kalori açığı</li>
                      <li>1 kg kayıp → günlük ~1100 kalori açığı</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900">Kilo Almak İçin:</h4>
                    <p>Enerji fazlası şu şekilde hesaplanır:</p>
                    <code className="bg-yellow-50 px-2 py-1 rounded block my-2">
                      (Kilo farkı × 770) ÷ (Kilo farkı ÷ Haftalık hedef kilo alımı)
                    </code>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Haftalık hedef: minimum 0.2 kg, maksimum 0.7 kg</li>
                      <li>0.2 kg alım → günlük ~220 kalori fazlası</li>
                      <li>0.7 kg alım → günlük ~770 kalori fazlası</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Özet Denklem:</h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-semibold text-center">
                    <strong>Günlük Kalori Hedefi = BMR × Aktivite Faktörü + Enerji Farkı</strong>
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Bilmeniz Gerekenler:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Haftalık 1 kg kilo kaybı için günlük ~1100 kalorilik bir açık gerekir. Bu, yaygın olarak kabul edilen bir referanstır ancak bireysel farklılıklar nedeniyle herkes için geçerli olmayabilir.</li>
                  <li>Vücudunuzun BMR altına düşen kalori alımları sağlıksızdır. KolayfitAi bu riski göz önünde bulundurarak önerilerini dengeli şekilde sunar.</li>
                  <li>Hesaplamalar bilimsel denklemlere dayalıdır ancak genetik, hormonlar, bağırsak florası gibi faktörler bu denklemlerde yer almaz.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Esneklik Sizinle</h3>
                <p>
                  KolayfitAi, kalori ve makro hedeflerinizi otomatik olarak önerse de, gelişmiş kullanıcılar için manuel ayarlama seçeneği sunar. Ancak bu tür değişiklikleri yalnızca bilgi sahibi kullanıcıların ya da bir sağlık profesyoneline danışanların yapmasını öneriyoruz.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Kaynaklar:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Harris JA, Benedict FG (1918). "A Biometric Study of Human Basal Metabolism." PNAS.</li>
                  <li>Roza AM, Shizgal HM (1984). "Resting energy requirements and body cell mass." Am J Clin Nutr.</li>
                  <li>Mifflin MD, St Jeor ST, et al. (1990). "A new predictive equation for resting energy expenditure in healthy individuals." Am J Clin Nutr.</li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
