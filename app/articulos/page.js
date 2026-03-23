import { createClient } from '@supabase/supabase-js';
import CompartirBotones from './CompartirBotones';

// Conexión a Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Página de Servidor (Async) - Carga datos antes de mostrar nada
export default async function ArticulosPage() {
  // 1. Cargamos los artículos en el servidor
  const { data: articulos } = await supabase
    .from('articulos')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-8">
          <a href="/" className="inline-block mb-4 text-blue-600 hover:underline text-sm font-semibold">
            &larr; Volver a la página principal
          </a>
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
            <article key={art.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {art.imagen_url && (
                <img src={art.imagen_url} alt={art.titulo} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{art.titulo}</h2>
                <p className="text-gray-600 text-sm mb-4 whitespace-pre-line">{art.contenido}</p>
                
                {/* Usamos el componente cliente para los botones */}
                <CompartirBotones titulo={art.titulo} />
              </div>
            </article>
          ))}
        </div>
        
        <div className="text-center mt-10">
           <a href="/" className="text-blue-600 hover:underline font-semibold">
              &larr; Volver al Inicio
           </a>
        </div>
      </div>
    </main>
  );
}
