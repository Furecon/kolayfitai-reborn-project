import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Camera, BarChart3, Target } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-300 via-green-300 to-yellow-200 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 md:left-20 w-24 md:w-32 h-24 md:h-32">
          <svg viewBox="0 0 100 100" className="text-green-700 animate-pulse">
            <path d="M50,10 L30,40 L10,30 L30,50 L20,70 L50,60 L80,70 L70,50 L90,30 L70,40 Z" fill="currentColor" opacity="0.3"/>
          </svg>
        </div>
        <div className="absolute top-1/4 right-5 md:right-10 w-32 md:w-48 h-32 md:h-48">
          <svg viewBox="0 0 100 100" className="text-green-600 animate-bounce" style={{ animationDuration: '3s' }}>
            <ellipse cx="50" cy="30" rx="25" ry="12" fill="currentColor" opacity="0.2"/>
            <path d="M35,30 Q30,50 28,70 M50,30 L50,75 M65,30 Q70,50 72,70" stroke="currentColor" strokeWidth="2.5" fill="none"/>
            <ellipse cx="28" cy="70" rx="4" ry="8" fill="currentColor" opacity="0.3"/>
            <ellipse cx="50" cy="75" rx="4" ry="8" fill="currentColor" opacity="0.3"/>
            <ellipse cx="72" cy="70" rx="4" ry="8" fill="currentColor" opacity="0.3"/>
          </svg>
        </div>
        <div className="absolute bottom-20 left-1/4 w-28 h-28 opacity-50">
          <svg viewBox="0 0 100 100" className="text-yellow-600">
            <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.2"/>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8 relative z-10">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-12 max-w-6xl w-full">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div className="order-2 md:order-1 space-y-6">
                <div className="flex justify-center md:justify-start">
                  <img
                    src="/lovable-uploads/0ded84b0-5b4f-411e-bb63-649e8fb48126.png"
                    alt="KolayfitAi"
                    className="h-16 md:h-20"
                  />
                </div>

                <div className="text-center md:text-left">
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                    Fotoğrafını Çek,
                    <br />
                    <span className="text-green-600">Değerleri Anında Gör</span>
                  </h1>

                  <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                    Sağlıklı beslenmek, metabolizmanızın düzenli çalışmasına yardımcı olur.
                    KolayfitAi ile her öğününüzü takip edin, hedeflerinize ulaşın.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center md:text-left">
                    Hemen İndirin!
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                    <a
                      href="https://play.google.com/store/apps/details?id=com.kolayfit.app&pcampaignid=web_share"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block transform hover:scale-105 transition-all duration-300"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                        alt="Google Play'den İndirin"
                        className="h-12 md:h-14 mx-auto"
                      />
                    </a>

                    <div className="relative inline-block">
                      <img
                        src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                        alt="App Store'dan İndirin"
                        className="h-12 md:h-14 mx-auto opacity-40"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg transform -rotate-12">
                          Yakında!
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-gray-500 italic text-center md:text-left">
                    iOS sürümü çok yakında yayında!
                  </p>
                </div>

                <div className="pt-4 border-t flex justify-center md:justify-start">
                  <Button
                    onClick={() => navigate('/app')}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-base hover:bg-green-50 hover:border-green-500 transition-all"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Web Uygulamasını Kullan
                  </Button>
                </div>
              </div>

              <div className="order-1 md:order-2 flex justify-center">
                <div className="relative w-64 md:w-72">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-cyan-400/30 rounded-[3rem] transform rotate-6 blur-xl"></div>
                  <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-[2.2rem] md:rounded-[2.5rem] p-2 shadow-2xl transform hover:scale-105 transition-all duration-500">
                    <div className="bg-white rounded-[1.8rem] md:rounded-[2.2rem] overflow-hidden">
                      <div className="relative">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 md:w-32 h-5 md:h-6 bg-black rounded-b-3xl z-10"></div>
                        <img
                          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=800&fit=crop&q=80"
                          alt="Yemek Analizi"
                          className="w-full h-[520px] md:h-[580px] object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                          <div className="absolute bottom-4 md:bottom-6 left-4 right-4 md:left-6 md:right-6 space-y-3 md:space-y-4">
                            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 md:p-4 shadow-xl">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs md:text-sm font-semibold text-gray-700">AI Doğruluk Oranı:</span>
                                <span className="text-xl md:text-2xl font-bold text-green-600">%90</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: '90%' }}></div>
                              </div>
                            </div>

                            <div className="bg-blue-50/95 backdrop-blur-md rounded-2xl p-3 md:p-4 shadow-lg">
                              <div className="flex items-start gap-2">
                                <span className="text-lg md:text-xl">💡</span>
                                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                                  Yemeğinizi daha dengeli hale getirmek için sebze miktarını artırabilirsiniz.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-green-50 to-cyan-50 p-4 md:p-6 rounded-2xl border border-green-100 hover:shadow-lg transition-shadow">
                <Camera className="w-10 h-10 md:w-12 md:h-12 text-green-600 mb-3" />
                <h3 className="font-bold text-base md:text-lg mb-2 text-gray-800">Fotoğraf Çek</h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">Yemeğinizin fotoğrafını çekin, AI anında analiz etsin</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-cyan-50 p-4 md:p-6 rounded-2xl border border-green-100 hover:shadow-lg transition-shadow">
                <BarChart3 className="w-10 h-10 md:w-12 md:h-12 text-green-600 mb-3" />
                <h3 className="font-bold text-base md:text-lg mb-2 text-gray-800">AI Analizi</h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">Kalori, protein, karbonhidrat ve yağ değerlerini öğrenin</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-cyan-50 p-4 md:p-6 rounded-2xl border border-green-100 hover:shadow-lg transition-shadow">
                <Target className="w-10 h-10 md:w-12 md:h-12 text-green-600 mb-3" />
                <h3 className="font-bold text-base md:text-lg mb-2 text-gray-800">Takip Et</h3>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">Günlük kalori ve makro hedeflerinizi kolayca takip edin</p>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-8 text-center text-gray-800">
            <p className="text-xs md:text-sm font-medium">
              <a href="/legal/privacy" className="hover:underline hover:text-green-700 transition-colors">Gizlilik Politikası</a>
              {' • '}
              <a href="/legal/terms" className="hover:underline hover:text-green-700 transition-colors">Kullanım Koşulları</a>
              {' • '}
              <a href="/legal/contact" className="hover:underline hover:text-green-700 transition-colors">İletişim</a>
            </p>
            <p className="text-xs mt-2 opacity-70">© 2025 KolayfitAi. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
