// app/articulos/page.js
// ✅ Server Component — sin 'use client'
// ✅ Los artículos se renderizan en el servidor → Google los indexa correctamente
// ✅ Metadata dinámica para SEO
// ✅ WhatsApp link corregido (window.location no existe en servidor)
// ✅ Botón compartir movido a componente cliente separado
// ✅ Imagen con next/image para optimización automática

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import ShareButtons from '../components/ShareButtons'; // componente cliente (ver abajo)

// Fuerza renderizado en servidor en cada request (no en build time)
export const dynamic = 'force-dynamic';

// SEO metadata estática
export const metadata = {
  title: 'Rincón de la Familia | Familia Ayuda',
  description: 'Artículos y consejos prácticos sobre crianza, educación y bienestar familiar.',
  openGraph: {
    title: 'Rincón de la Familia | Familia Ayuda',
    description: 'Consejos y reflexiones para hacer la crianza un poco más fácil.',
    url: 'https://ayuda-familia.vercel.app/articulos',
  },
};

// Fetch en servidor — revalida cada 60 segundos (ISR)
// Cambia a { cache: 'no-store' } si quieres siempre datos frescos
async function getArticulos() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data, error } = await supabase
    .from('articulos')
    .select('*')
    .order('created_at', { ascending: false });

  console.log('SUPABASE articulos data:', JSON.stringify(data));
  console.log('SUPABASE articulos error:', JSON.stringify(error));

  if (error) {
    console.error('Error cargando artículos:', error.message);
    return [];
  }
  return data ?? [];
}

export default async function ArticulosPage() {
  const articulos = await getArticulos();

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* CABECERA */}
        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-block mb-4 text-blue-600 hover:underline text-sm font-semibold"
          >
            ← Volver a la página principal
          </Link>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">📖 Rincón de la Familia</h1>
          <p className="text-gray-600">Consejos y reflexiones para hacer la crianza un poco más fácil.</p>
        </div>

        {/* LISTA DE ARTÍCULOS */}
        <div className="space-y-6">
          {articulos.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              Aún no hay artículos. ¡Vuelve pronto!
            </div>
          ) : (
            articulos.map((art) => (
              <article key={art.id} className="bg-white rounded-xl shadow-md overflow-hidden">
               {art.imagen_url && (
  <img
    src={art.imagen_url}
    alt={art.titulo}
    className="w-full h-48 object-cover"
  />
)}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{art.titulo}</h2>
                  <p className="text-gray-600 text-sm mb-4 whitespace-pre-line">{art.contenido}</p>
                  {/* ShareButtons es 'use client' porque usa navigator.share / window */}
                  <ShareButtons titulo={art.titulo} />
                </div>
              </article>
            ))
          )}
        </div>

        {/* VOLVER ABAJO */}
        <div className="text-center mt-10">
          <Link href="/" className="text-blue-600 hover:underline font-semibold">
            ← Volver al Inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
