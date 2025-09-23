import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface LegalLayoutProps {
  title: string
  children: React.ReactNode
}

export function LegalLayout({ title, children }: LegalLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <img 
              src="/lovable-uploads/0ded84b0-5b4f-411e-bb63-649e8fb48126.png" 
              alt="KolayfitAi" 
              className="h-12 mx-auto"
            />
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          </div>
          
          <div className="prose prose-sm max-w-none text-muted-foreground">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}