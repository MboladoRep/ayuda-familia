'use client';
import { useState } from 'react';

export default function CompartirBotones({ titulo }) {
  const [copiado, setCopiado] = useState(false);

  const compartir = () => {
    if (navigator.share) {
      navigator.share({ title: titulo, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  // Calculamos los enlaces solo en el cliente
  const textoWhatsApp = encodeURIComponent(titulo + " " + window.location.href);
  const textoTwitter = encodeURIComponent(titulo);

  return (
    <div className="flex gap-2 border-t pt-4 flex-wrap">
      <button 
        onClick={compartir} 
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 px-4 rounded-full transition"
      >
        {copiado ? '✅ ¡Copiado!' : '📎 Copiar Enlace'}
      </button>
      
      <a 
        href={`https://twitter.com/intent/tweet?text=${textoTwitter}`} 
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
    </div>
  );
}
