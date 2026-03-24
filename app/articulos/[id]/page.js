import { createClient } from '@supabase/supabase-js';
import AudioPlayer from '../../components/AudioPlayer';
import CompartirBotones from '../CompartirBotones'; // Importamos el componente de compartir
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// CONFIGURACIÓN SEO PARA WHATSAPP/REDES SOCIALES
export async function generateMetadata({ params }) {
  const { data: articulo } = await supabase
    .from('articulos')
    .select('*')
    .eq('id', params.id)
    .single();

  return {
    title: articulo?.titulo || 'Artículo',
    description: articulo?.contenido?.substring(0, 150),
    openGraph: {
      title: articulo?.titulo,
      description: articulo?.contenido?.substring(0, 150),
      images: [articulo?.imagen_url],
      type: 'article',
    },
  };
}

// PÁGINA DEL ARTÍCULO
export default async function PaginaArticulo({ params }) {
  const { data: articulo } = await supabase
    .from('articulos')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!articulo) {
    return (
      <main className="min-h-screen p-8 text-center">
        <p>Artículo no encontrado.</p>
        <Link href="/articulos" className="text-blue-600 underline">Volver al blog</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <article className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* ENCABEZADO */}
        <div className="p-6 border-b bg-blue-50">
          <Link href="/articulos" className="text-blue-600 text-sm hover:underline mb-2 block">
            &larr; Volver al listado
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{articulo.titulo}</h1>
          <p className="text-xs text-gray-400">
            Publicado: {new Date(articulo.created_at).toLocaleDateString('es-ES')}
          </p>
        </div>

        {/* IMAGEN */}
        {articulo.imagen_url && (
          <img 
            src={articulo.imagen_url} 
            alt={articulo.titulo} 
            className="w-full h-64 object-cover md:h-96" 
          />
        )}

        {/* CONTENIDO, AUDIO Y COMPARTIR */}
        <div className="p-8">
          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line mb-8">
            {articulo.contenido}
          </p>

          {/* BOTÓN DE AUDIO */}
          <AudioPlayer text={articulo.contenido} />

          {/* BOTONES DE COMPARTIR */}
          <div className="mt-6">
            <CompartirBotones titulo={articulo.titulo} />
          </div>
        </div>
      </article>
    </main>
  );
}
