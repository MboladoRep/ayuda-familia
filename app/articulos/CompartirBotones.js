'use client';
import { useState, useEffect } from 'react';

export default function CompartirBotones({ titulo }) {
  const [url, setUrl] = useState('');
  const [copiado, setCopiado] = useState(false);

  // Este código se ejecuta SOLO en el navegador (cliente)
  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const compartir = () => {
    if (navigator.share) {
      navigator.share({ title: titulo, url: url });
    } else {
      navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  // Preparamos los textos para los enlaces
  const textoWhatsApp = encodeURIComponent(titulo + " " + url);
  const textoTwitter = encodeURIComponent(titulo);

  return (
    <div className="flex gap-2 border-t pt-4 flex-wrap">
      <button 
        onClick={compartir} 
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 px-4 rounded-full transition"
      >
        {copiado ? '✅ ¡Copiado!' : '📎 Copiar Enlace'}
      </button>
      
      {/* Solo mostramos los enlaces si tenemos la URL (evita errores de hidratación) */}
      {url && (
        <>
          <a 
            href={`https://twitter.com/intent/tweet?text=${textoTwitter}&url=${encodeURIComponent(url)}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-semibold py-2 px-4 rounded-full transition"
          >
            🐦 Twitter
          </a>
          
          <a 
            href={`https://wa.me/?text=${textoWhatsApp}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-green-100 hover:bg-green-200 text-green-700 text-sm font-semibold py-2 px-4 rounded-full transition"
          >
            📲 WhatsApp
          </a>
        </>
      )}
    </div>
  );
}
