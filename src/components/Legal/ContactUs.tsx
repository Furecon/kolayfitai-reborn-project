import { LegalLayout } from './LegalLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, MessageCircle, Clock, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function ContactUs() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create mailto link with form data
    const subject = encodeURIComponent(`KolayfitAi İletişim: ${formData.subject}`)
    const body = encodeURIComponent(
      `Adı Soyadı: ${formData.name}\nE-posta: ${formData.email}\n\nMesaj:\n${formData.message}`
    )
    const mailtoLink = `mailto:info@kolayfitai.com?subject=${subject}&body=${body}`
    
    // Open email client
    window.location.href = mailtoLink
    
    // Show success toast
    toast({
      title: "Başarılı!",
      description: "E-posta istemciniz açıldı. Mesajınızı gönderebilirsiniz."
    })
    
    // Clear form
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <LegalLayout title="İletişim">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Contact Form */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <MessageCircle className="h-8 w-8 mx-auto text-primary" />
                <h2 className="text-xl font-semibold">Bizimle İletişime Geçin</h2>
                <p className="text-sm text-muted-foreground">
                  Sorularınız, önerileriniz veya destek taleplerınız için mesaj gönderebilirsiniz.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Adınız Soyadınız</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Adınızı ve soyadınızı girin"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta Adresiniz</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ornek@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Konu</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Mesaj konusu"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mesajınız</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Mesajınızı buraya yazın..."
                    rows={5}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Mesaj Gönder
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <Mail className="h-8 w-8 mx-auto text-primary" />
                  <h3 className="text-lg font-semibold">Direkt İletişim</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">E-posta</p>
                      <p className="text-sm text-muted-foreground">info@kolayfitai.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Yanıtlama Süresi</p>
                      <p className="text-sm text-muted-foreground">24-48 saat içinde</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Hizmet Alanı</p>
                      <p className="text-sm text-muted-foreground">Türkiye</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-center">Sık Sorulan Konular</h3>
                <div className="space-y-2">
                  <div className="p-2 bg-muted/30 rounded text-sm">
                    <strong>Teknik Destek:</strong> Uygulama kullanımı, hata bildirimleri
                  </div>
                  <div className="p-2 bg-muted/30 rounded text-sm">
                    <strong>Hesap İşlemleri:</strong> Şifre sıfırlama, hesap silme
                  </div>
                  <div className="p-2 bg-muted/30 rounded text-sm">
                    <strong>Abonelik:</strong> Premium özellikler, ödeme sorunları
                  </div>
                  <div className="p-2 bg-muted/30 rounded text-sm">
                    <strong>Geri Bildirim:</strong> Öneriler, şikayetler
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LegalLayout>
  )
}