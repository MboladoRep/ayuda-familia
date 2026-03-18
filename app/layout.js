import './globals.css'

export const metadata = {
  title: 'Familia Ayuda | Tu red de apoyo en la crianza',
  description: 'Encuentra guías, consejos y recursos cerca de ti para resolver problemas de sueño, rabietas y educación. Asistente de IA incluido.',
  openGraph: {
    title: 'Familia Ayuda | Crianza y Educación',
    description: 'Soluciones rápidas y mapa de recursos para familias.',
    url: 'https://ayuda-familia.vercel.app', // Asegúrate que esta sea tu URL real de Vercel
    siteName: 'Familia Ayuda',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
