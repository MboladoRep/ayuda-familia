import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Inicializamos Supabase para consulta en servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Componente de botones de compartir (Cliente) para evitar errores con 'window'
function CompartirBotones({ titulo, url }) {
  const compartir = () => {
    if (navigator.share) {
      navigator.share({ title: titulo, url: url });
    } else {
      navigator.clipboard.writeText(url);
      alert("¡Enlace copiado!");
    }
  };

  return (
    <div className="flex gap-2 border-t pt-4">
      <button onClick={compartir} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 px-4 rounded-full">📎 Copiar</button>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(titulo)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-semibold py-2 px-4 rounded-full">🐦 Twitter</a>
      <a href={`https://wa.me/?text=${encodeURIComponent(titulo + ' ' + url)}`} target="_blank" rel="noopener noreferrer" className="bg-green-100 hover:bg-green-200 text-green-700 text-sm font-semibold py-2 px-4 rounded-full">📲 WhatsApp</a>
    </div>
  );
}

// Página Principal (Servidor) - Asíncrona para esperar datos
export default async function ArticulosPage() {
  // 1. Obtenemos la URL actual de forma segura en el servidor
  const headersList = headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  // 2. Cargamos artículos en el servidor (SEO Friendly)
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
          <p className="text-gray-600">Consejos y reflexiones para hacer la crianza un poco más fácil.</p>
        </div>

        <div className="space-y-6">
          {/* Si no hay artículos, mostramos esto directamente en el HTML inicial */}
          {(!articulos || articulos.length === 0) && (
            <div className="text-center text-gray-400 py-10">
              Aún no hay artículos. ¡Vuelve pronto!
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
                {/* Pasamos la URL calculada a los botones */}
                <CompartirBotones titulo={art.titulo} url={`${baseUrl}/articulos`} />
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
