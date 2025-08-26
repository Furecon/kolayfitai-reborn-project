
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { ArrowLeft, HelpCircle, Search, Smartphone, Brain, Calculator, CreditCard, Shield } from 'lucide-react'

interface FAQPageProps {
  onBack: () => void
}

export function FAQPage({ onBack }: FAQPageProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const faqData = {
    general: [
      {
        q: "KolayfitAi nasıl çalışır?",
        a: "KolayfitAi, yapay zeka teknolojisi kullanarak yemek fotoğraflarınızı analiz eder, kalori ve besin değerlerini hesaplar. Kişisel profilinize göre beslenme önerileri sunar ve günlük hedeflerinizi takip etmenize yardımcı olur."
      },
      {
        q: "Hesap nasıl oluşturabilirim?",
        a: "Ana sayfada 'Kayıt Ol' butonuna tıklayarak e-posta adresiniz ve şifrenizle hesap oluşturabilirsiniz. Alternatif olarak Google hesabınızla da giriş yapabilirsiniz."
      },
      {
        q: "Profilimi nasıl ayarlarım?",
        a: "İlk girişte karşınıza çıkan adım adım kurulum rehberini takip edin. Yaş, cinsiyet, boy, kilo, aktivite seviyesi ve hedeflerinizi girin. Bu bilgiler kişiselleştirilmiş öneriler için gereklidir."
      },
      {
        q: "Verilerim güvende mi?",
        a: "Evet! Tüm verileriniz SSL şifreleme ile korunur. Kişisel bilgilerinizi üçüncü taraflarla paylaşmıyoruz ve KVKK uyumlu çalışıyoruz."
      }
    ],
    nutrition: [
      {
        q: "Kalori hedefim nasıl belirleniyor?",
        a: "Kalori hedefiniz Mifflin-St Jeor denklemi kullanılarak hesaplanır. Bazal metabolizma hızınız + aktivite seviyeniz + hedefinize göre enerji farkı = günlük kalori hedefiniz. Detaylı açıklama için 'Kaynaklar' bölümünü inceleyin."
      },
      {
        q: "Makro besin hedefleri nasıl belirleniyor?",
        a: "Protein, karbonhidrat ve yağ hedefleriniz, toplam kalori hedefinizin belirli yüzdelerine göre hesaplanır: Protein %20-25, Karbonhidrat %45-50, Yağ %25-30 oranlarında dağıtılır."
      },
      {
        q: "Yemek fotoğrafı çekme ipuçları nelerdir?",
        a: "• İyi ışıklandırma kullanın\n• Yemeği tam olarak çerçeveleyin\n• Net ve yakın çekim yapın\n• Tabağın tamamını görünür hale getirin\n• Karışık yemeklerde malzemeleri belirtin"
      },
      {
        q: "Manuel besin girişi yapabilir miyim?",
        a: "Evet! Fotoğraf çekemediğiniz durumlarda manuel olarak yemek ekleyebilirsiniz. Kamera ekranında 'Manuel Giriş' seçeneğini kullanın."
      }
    ],
    ai: [
      {
        q: "AI fotoğraf analizi ne kadar doğru?",
        a: "AI analizimiz %85-90 doğruluk oranına sahiptir. Sonuçları her zaman kontrol edebilir ve gerektiğinde düzenleyebilirsiniz. Karışık yemeklerde daha detaylı bilgi vermeniz doğruluğu artırır."
      },
      {
        q: "AI önerileri nasıl kişiselleştiriliyor?",
        a: "AI, profiliniz (yaş, kilo, hedef), beslenme geçmişiniz, tercihleriniz ve güncel ihtiyaçlarınızı analiz ederek size özel öneriler sunar. Zamanla daha da kişiselleşir."
      },
      {
        q: "AI asistana nasıl soru sorabilirim?",
        a: "Sağ alt köşedeki yeşil mesaj butonuna tıklayarak AI asistanla konuşabilirsiniz. Beslenme, kalori, yemek tarifleri hakkında sorular sorabilirsiniz."
      },
      {
        q: "Fotoğraflarım saklanıyor mu?",
        a: "Hayır! Fotoğraflarınız sadece analiz için kullanılır ve hemen silinir. Sistemimizde fotoğraf arşivi tutulmaz."
      }
    ],
    technical: [
      {
        q: "Uygulamaya giriş yapamıyorum",
        a: "• Şifrenizi kontrol edin\n• İnternet bağlantınızı kontrol edin\n• 'Şifremi Unuttum' seçeneğini kullanın\n• Farklı tarayıcı deneyin\n• Çerezleri temizleyin"
      },
      {
        q: "Verilerim senkronize olmuyor",
        a: "• İnternet bağlantınızı kontrol edin\n• Uygulamayı yeniden başlatın\n• Çıkış yapıp tekrar giriş yapın\n• Tarayıcı önbelleğini temizleyin"
      },
      {
        q: "Kamera çalışmıyor",
        a: "• Tarayıcı kamera izinlerini kontrol edin\n• Başka uygulamaların kamerayı kullanmadığından emin olun\n• Sayfayı yenileyin\n• Farklı tarayıcı deneyin"
      },
      {
        q: "Mobil cihazda sorun yaşıyorum",
        a: "KolayfitAi web tabanlı bir uygulamadır. En iyi deneyim için güncel Chrome, Safari veya Firefox tarayıcılarını kullanın."
      }
    ],
    subscription: [
      {
        q: "Premium özellikler nelerdir?",
        a: "Şu anda tüm özellikler ücretsizdir! Premium özellikler yakında eklenecek: Gelişmiş AI önerileri, beslenme koçluğu, detaylı raporlar ve daha fazlası."
      },
      {
        q: "Ücretlendirme nasıl olacak?",
        a: "Premium planımız henüz aktif değil. Kullanıcılarımızı bilgilendirmek için e-posta listesine kayıt olabilirsiniz."
      },
      {
        q: "Abonelik iptali nasıl yapılır?",
        a: "Premium plan aktifleştiğinde, hesap ayarlarınızdan aboneliğinizi istediğiniz zaman iptal edebileceksiniz."
      }
    ],
    security: [
      {
        q: "Hesabımı nasıl güvende tutarım?",
        a: "• Güçlü şifre kullanın\n• Şifrenizi düzenli değiştirin\n• Hesabınızı başkalarıyla paylaşmayın\n• Şüpheli aktivite fark ederseniz hemen şifrenizi değiştirin"
      },
      {
        q: "Verilerimi silebilir miyim?",
        a: "Evet! KVKK haklarınız kapsamında verilerinizin silinmesini talep edebilirsiniz. İletişim sayfasından bizimle iletişime geçin."
      },
      {
        q: "Hesabımı tamamen silebilir miyim?",
        a: "Profil ayarlarından hesabınızı kalıcı olarak silebilirsiniz. Bu işlem geri alınamaz ve tüm verileriniz silinir."
      }
    ]
  }

  const filterFAQs = (faqs: typeof faqData.general) => {
    if (!searchTerm) return faqs
    return faqs.filter(faq => 
      faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="p-4 max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <HelpCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Sık Sorulan Sorular</CardTitle>
            <p className="text-gray-600 mt-2">
              KolayfitAi kullanımı hakkında en çok merak edilen sorular ve cevapları
            </p>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Sorular içinde ara..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="general" className="text-xs">
                  <Smartphone className="h-3 w-3 mr-1" />
                  Genel
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="text-xs">
                  <Calculator className="h-3 w-3 mr-1" />
                  Beslenme
                </TabsTrigger>
                <TabsTrigger value="ai" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  AI
                </TabsTrigger>
                <TabsTrigger value="technical" className="text-xs">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Teknik
                </TabsTrigger>
                <TabsTrigger value="subscription" className="text-xs">
                  <CreditCard className="h-3 w-3 mr-1" />
                  Abonelik
                </TabsTrigger>
                <TabsTrigger value="security" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Güvenlik
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-6">
                <Accordion type="single" collapsible>
                  {filterFAQs(faqData.general).map((faq, index) => (
                    <AccordionItem key={index} value={`general-${index}`}>
                      <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                      <AccordionContent className="whitespace-pre-line">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="nutrition" className="mt-6">
                <Accordion type="single" collapsible>
                  {filterFAQs(faqData.nutrition).map((faq, index) => (
                    <AccordionItem key={index} value={`nutrition-${index}`}>
                      <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                      <AccordionContent className="whitespace-pre-line">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="ai" className="mt-6">
                <Accordion type="single" collapsible>
                  {filterFAQs(faqData.ai).map((faq, index) => (
                    <AccordionItem key={index} value={`ai-${index}`}>
                      <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                      <AccordionContent className="whitespace-pre-line">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="technical" className="mt-6">
                <Accordion type="single" collapsible>
                  {filterFAQs(faqData.technical).map((faq, index) => (
                    <AccordionItem key={index} value={`technical-${index}`}>
                      <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                      <AccordionContent className="whitespace-pre-line">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="subscription" className="mt-6">
                <Accordion type="single" collapsible>
                  {filterFAQs(faqData.subscription).map((faq, index) => (
                    <AccordionItem key={index} value={`subscription-${index}`}>
                      <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                      <AccordionContent className="whitespace-pre-line">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="security" className="mt-6">
                <Accordion type="single" collapsible>
                  {filterFAQs(faqData.security).map((faq, index) => (
                    <AccordionItem key={index} value={`security-${index}`}>
                      <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                      <AccordionContent className="whitespace-pre-line">{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Sorunuz burada yok mu?</h3>
              <p className="text-blue-700 text-sm mb-3">
                Aradığınız cevabı bulamadınız mı? Bizimle iletişime geçin, size yardımcı olalım.
              </p>
              <Button 
                onClick={() => onBack()} 
                variant="outline" 
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                İletişime Geç
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
