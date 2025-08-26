
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Shield, FileText, Eye, Cookie, CreditCard } from 'lucide-react'

interface PoliciesPageProps {
  onBack: () => void
}

export function PoliciesPage({ onBack }: PoliciesPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">

      <div className="p-4 max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Politikalar ve Yasal Bilgiler</CardTitle>
            <p className="text-gray-600 mt-2">
              KolayfitAi kullanım şartları, gizlilik politikası ve yasal yükümlülüklerimiz
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="privacy" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="privacy" className="text-xs sm:text-sm">
                  <Eye className="h-3 w-3 mr-1" />
                  Gizlilik
                </TabsTrigger>
                <TabsTrigger value="terms" className="text-xs sm:text-sm">
                  <FileText className="h-3 w-3 mr-1" />
                  Kullanım
                </TabsTrigger>
                <TabsTrigger value="kvkk" className="text-xs sm:text-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  KVKK
                </TabsTrigger>
                <TabsTrigger value="cookies" className="text-xs sm:text-sm">
                  <Cookie className="h-3 w-3 mr-1" />
                  Çerez
                </TabsTrigger>
                <TabsTrigger value="refund" className="text-xs sm:text-sm">
                  <CreditCard className="h-3 w-3 mr-1" />
                  İade
                </TabsTrigger>
              </TabsList>

              <TabsContent value="privacy" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Gizlilik Politikası</h2>
                  <p className="text-sm text-gray-600 mb-4">Son güncelleme: 22 Temmuz 2025</p>
                  
                  <Accordion type="single" collapsible>
                    <AccordionItem value="data-collection">
                      <AccordionTrigger>Hangi Verileri Topluyoruz?</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <p><strong>Kişisel Bilgiler:</strong> Ad, e-posta adresi, yaş, cinsiyet, boy, kilo gibi profil bilgileri</p>
                          <p><strong>Beslenme Verileri:</strong> Günlük kalori alımı, makro besinler, öğün kayıtları</p>
                          <p><strong>Fotoğraf Verileri:</strong> Yemek fotoğrafları (sadece analiz için kullanılır, saklanmaz)</p>
                          <p><strong>Kullanım Verileri:</strong> Uygulama kullanım istatistikleri, tercihler</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="data-usage">
                      <AccordionTrigger>Verilerinizi Nasıl Kullanıyoruz?</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Kişiselleştirilmiş beslenme önerileri sunmak</li>
                          <li>Kalori ve makro besin hedeflerini hesaplamak</li>
                          <li>AI destekli yemek analizi yapmak</li>
                          <li>İlerleme takibi ve raporlama</li>
                          <li>Uygulama performansını iyileştirmek</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="data-sharing">
                      <AccordionTrigger>Veri Paylaşımı</AccordionTrigger>
                      <AccordionContent>
                        <p>Kişisel verilerinizi üçüncü taraflarla paylaşmıyoruz. Sadece şu durumlarda sınırlı paylaşım yapılır:</p>
                        <ul className="list-disc list-inside space-y-2 mt-2">
                          <li>Yasal zorunluluklar</li>
                          <li>Güvenlik tehditleri</li>
                          <li>Hizmet sağlayıcılar (şifrelenmiş veri)</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="data-security">
                      <AccordionTrigger>Veri Güvenliği</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <p>• SSL/TLS şifreleme ile veri koruması</p>
                          <p>• Düzenli güvenlik güncellemeleri</p>
                          <p>• Sınırlı erişim politikaları</p>
                          <p>• Otomatik yedekleme sistemleri</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </TabsContent>

              <TabsContent value="terms" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Kullanım Şartları</h2>
                  <p className="text-sm text-gray-600 mb-4">Son güncelleme: 22 Temmuz 2025</p>
                  
                  <Accordion type="single" collapsible>
                    <AccordionItem value="service-description">
                      <AccordionTrigger>Hizmet Açıklaması</AccordionTrigger>
                      <AccordionContent>
                        <p>KolayfitAi, yapay zeka destekli beslenme takip ve danışmanlık uygulamasıdır. Kullanıcılara kişiselleştirilmiş beslenme önerileri, kalori takibi ve sağlıklı yaşam koçluğu sunar.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="user-responsibilities">
                      <AccordionTrigger>Kullanıcı Sorumlulukları</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Doğru ve güncel bilgi sağlamak</li>
                          <li>Uygulamayı kötüye kullanmamak</li>
                          <li>Başkalarının haklarına saygı göstermek</li>
                          <li>Sağlık durumunuza uygun kullanım</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="medical-disclaimer">
                      <AccordionTrigger>Tıbbi Sorumluluk Reddi</AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <p className="font-semibold text-yellow-800">⚠️ Önemli Uyarı</p>
                          <p className="text-yellow-700 mt-2">KolayfitAi tıbbi tavsiye vermez. Sağlık sorunlarınız için mutlaka sağlık profesyonelinize danışın. Uygulama önerileri genel bilgi amaçlıdır.</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="intellectual-property">
                      <AccordionTrigger>Fikri Mülkiyet</AccordionTrigger>
                      <AccordionContent>
                        <p>KolayfitAi uygulaması, algoritmaları ve içerikleri telif hakkı ile korunmaktadır. İzinsiz kopyalama, dağıtım veya ticari kullanım yasaktır.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </TabsContent>

              <TabsContent value="kvkk" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">KVKK Uyumluluk Bildirimi</h2>
                  <p className="text-sm text-gray-600 mb-4">Kişisel Verilerin Korunması Kanunu kapsamında haklarınız</p>
                  
                  <Accordion type="single" collapsible>
                    <AccordionItem value="kvkk-rights">
                      <AccordionTrigger>KVKK Kapsamındaki Haklarınız</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                          <li>İşlenen verileriniz hakkında bilgi talep etme</li>
                          <li>İşleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                          <li>Yurt içinde/dışında aktarıldığı tarafları bilme</li>
                          <li>Eksik/yanlış işlenen verilerin düzeltilmesini isteme</li>
                          <li>Verilerin silinmesini/yok edilmesini talep etme</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="data-controller">
                      <AccordionTrigger>Veri Sorumlusu Bilgileri</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <p><strong>Veri Sorumlusu:</strong> KolayfitAi</p>
                          <p><strong>İletişim:</strong> info@kolayfitai.com</p>
                          <p><strong>Başvuru Yöntemi:</strong> E-posta veya yazılı başvuru</p>
                          <p><strong>Yanıt Süresi:</strong> 30 gün içinde</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="data-retention">
                      <AccordionTrigger>Veri Saklama Süreleri</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-2">
                          <li><strong>Profil Bilgileri:</strong> Hesap aktif olduğu sürece</li>
                          <li><strong>Beslenme Kayıtları:</strong> 2 yıl</li>
                          <li><strong>Kullanım Logları:</strong> 1 yıl</li>
                          <li><strong>Yemek Fotoğrafları:</strong> Analiz sonrası silinir</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </TabsContent>

              <TabsContent value="cookies" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Çerez Politikası</h2>
                  <p className="text-sm text-gray-600 mb-4">Web sitemizde kullanılan çerezler hakkında</p>
                  
                  <Accordion type="single" collapsible>
                    <AccordionItem value="what-are-cookies">
                      <AccordionTrigger>Çerez Nedir?</AccordionTrigger>
                      <AccordionContent>
                        <p>Çerezler, web sitelerini ziyaret ettiğinizde cihazınızda saklanan küçük metin dosyalarıdır. Bu dosyalar, site deneyiminizi iyileştirmek ve tercihlerinizi hatırlamak için kullanılır.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="cookie-types">
                      <AccordionTrigger>Kullandığımız Çerez Türleri</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <div>
                            <p className="font-semibold">Zorunlu Çerezler</p>
                            <p className="text-sm">Sitenin çalışması için gerekli çerezler</p>
                          </div>
                          <div>
                            <p className="font-semibold">Performans Çerezleri</p>
                            <p className="text-sm">Site performansını ölçmek için</p>
                          </div>
                          <div>
                            <p className="font-semibold">Fonksiyonel Çerezler</p>
                            <p className="text-sm">Tercihlerinizi hatırlamak için</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="cookie-control">
                      <AccordionTrigger>Çerez Kontrolü</AccordionTrigger>
                      <AccordionContent>
                        <p>Tarayıcınızın ayarlarından çerezleri kabul etmeme, silme veya uyarı alma seçeneklerini kullanabilirsiniz. Ancak bu durumda site işlevselliği etkilenebilir.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </TabsContent>

              <TabsContent value="refund" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">İptal ve İade Politikası</h2>
                  <p className="text-sm text-gray-600 mb-4">Premium özellikler için iptal ve iade koşulları</p>
                  
                  <Accordion type="single" collapsible>
                    <AccordionItem value="refund-conditions">
                      <AccordionTrigger>İade Koşulları</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Satın alımdan sonraki 14 gün içinde koşulsuz iade</li>
                          <li>Teknik sorunlar nedeniyle hizmet alamama durumu</li>
                          <li>Iade talebi e-posta ile iletilmelidir</li>
                          <li>İade süreci 5-10 iş günü sürer</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="cancellation">
                      <AccordionTrigger>Abonelik İptali</AccordionTrigger>
                      <AccordionContent>
                        <p>Aboneliğinizi istediğiniz zaman uygulama içinden veya hesap ayarlarından iptal edebilirsiniz. İptal sonrası mevcut dönem sonuna kadar hizmet devam eder.</p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="refund-process">
                      <AccordionTrigger>İade Süreci</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          <p>1. İade talebini info@kolayfitai.com adresine gönderin</p>
                          <p>2. Satın alma bilgilerinizi ekleyin</p>
                          <p>3. İade sebebini belirtin</p>
                          <p>4. 2 iş günü içinde onay alın</p>
                          <p>5. 5-10 iş günü içinde ödeme iade edilir</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
