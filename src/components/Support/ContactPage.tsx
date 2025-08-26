
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ContactPageProps {
  onBack: () => void
}

export function ContactPage({ onBack }: ContactPageProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !message) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm alanları doldurun.",
        variant: "destructive"
      })
      return
    }

    // Create mailto link
    const subject = encodeURIComponent(`KolayfitAi Destek Talebi - ${name}`)
    const body = encodeURIComponent(`
Gönderen: ${name}
Email: ${email}

Mesaj:
${message}
    `)
    
    window.location.href = `mailto:info@kolayfitai.com?subject=${subject}&body=${body}`
    
    toast({
      title: "İletişim Formu Hazırlandı",
      description: "Email uygulamanız açılacak. Mesajınızı gönderebilirsiniz.",
    })
    
    // Reset form
    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 px-4 py-4 bg-white">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri
        </Button>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">İletişim ve Destek</CardTitle>
            <p className="text-gray-600 mt-2">
              Size nasıl yardımcı olabiliriz? Sorularınızı, önerilerinizi veya karşılaştığınız sorunları bizimle paylaşın.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Adınız</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Adınızı girin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Adresiniz</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@ornek.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="message">Mesajınız</Label>
                <textarea
                  id="message"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Lütfen sorununuzu veya önerinizi detaylı olarak açıklayın..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                İletişim Kur
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Doğrudan İletişim</h3>
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:info@kolayfitai.com" className="hover:text-green-600">
                  info@kolayfitai.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
