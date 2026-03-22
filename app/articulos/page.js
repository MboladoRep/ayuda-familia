'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ArticulosPage() {
  const [articulos, setArticulos] = useState([]);

  useEffect(() => {
    cargarArticulos();
  }, []);

  const cargarArticulos = async () => {
    const { data } = await supabase.from('articulos').select('*').order('created_at', { ascending: false });
    if (data) setArticulos(data);
  };

  const compartir = (titulo) => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: titulo, url: url });
    } else {
      navigator.clipboard.writeText(url);
      alert("¡Enlace copiado!");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">📚 Blog de la Familia</h1>
          <p className="text-gray-600">Consejos generados por inteligencia artificial para tu día a día.</p>
        </div>

        <div className="space-y-6">
          {articulos.map((art) => (
            <div key={art.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              {art.imagen_url && (
                <img src={art.imagen_url} alt={art.titulo} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{art.titulo}</h2>
                <p className="text-gray-600 text-sm mb-4 whitespace-pre-line">{art.contenido}</p>
                
                <div className="flex gap-2 border-t pt-4">
                  <button onClick={() => compartir(art.titulo)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 px-4 rounded-full">📎 Copiar</button>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(art.titulo)}`} target="_blank" className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-semibold py-2 px-4 rounded-full">🐦 Twitter</a>
                  <a href={`https://wa.me/?text=${encodeURIComponent(art.titulo + ' ' + window.location.href)}`} target="_blank" className="bg-green-100 hover:bg-green-200 text-green-700 text-sm font-semibold py-2 px-4 rounded-full">📲 WhatsApp</a>
                </div>
              </div>
            </div>
          ))}
          
          {articulos.length === 0 && (
            <div className="text-center text-gray-400 py-10">
              Aún no hay artículos. ¡Vuelve pronto!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
