import './globals.css'

export const metadata = {
  title: 'Ayuda Familia',
  description: 'Ayuda para familias en la crianza',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
