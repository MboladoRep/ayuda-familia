import { createClient } from '@supabase/supabase-js';
import CompartirBotones from './CompartirBotones';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const revalidate = 0;

export default async function ArticulosPage() {
  // Intentamos obtener los datos
  const { data: articulos, error } = await supabase
    .from('articulos')
    .select('*')
    .order('created_at', { ascending: false });

  // Si hay un error de conexión o de la base de datos
  if (error) {
    console.error("Error cargando artículos:", error);
    return (
      <main className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-4">⚠️ Error de Conexión</h1>
            <p className="mb-4">Lo sentimos, no hemos podido cargar los artículos en este momento.</p>
            <p className="text-sm text-red-600 mb-4">Por favor, revisa tu conexión a internet o inténtalo de nuevo más tarde.</p>
            <Link href="/" className="text-blue-600 underline font-semibold">Volver al Inicio</Link>
          </div>
        </div>
      </main>
    );
  }

  // Renderizado normal si todo va bien
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 text-blue-600 hover:underline text-sm font-semibold">
            &larr; Volver a la página principal
          </Link>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">📖 Rincón de la Familia</h1>
          <p className="text-gray-600">Consejos y reflexiones para el día a día.</p>
        </div>

        <div className="space-y-6">
          {(!articulos || articulos.length === 0) && (
            <div className="text-center text-gray-400 py-10 bg-white rounded-xl shadow">
              Aún no hay artículos publicados.
            </div>
          )}

          {articulos?.map((art) => (
            <article key={art.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group">
              <Link href={`/articulos/${art.id}`}>
                {art.imagen_url && (
                  <img src={art.imagen_url} alt={art.titulo} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">{art.titulo}</h2>
                  <p className="text-gray-600 text-sm line-clamp-3">{art.contenido}</p>
                  <span className="inline-block mt-4 text-blue-600 font-semibold text-sm">Leer más / Escuchar &rarr;</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
        
        <div className="text-center mt-10">
           <Link href="/" className="text-blue-600 hover:underline font-semibold">
              &larr; Volver al Inicio
           </Link>
        </div>
      </div>
    </main>
  );
}
