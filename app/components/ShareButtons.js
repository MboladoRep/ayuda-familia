// app/components/ShareButtons.js
// ✅ 'use client' solo donde se necesita (navigator, window)
// ✅ Link de WhatsApp seguro — construye la URL en el cliente

'use client';

export default function ShareButtons({ titulo }) {
  const compartir = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: titulo, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('¡Enlace copiado!');
    }
  };

 const whatsappUrl = () => {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  return `https://wa.me/?text=${encodeURIComponent(titulo + ' ' + url)}`;
};

  return (
    <div className="flex flex-wrap gap-2 border-t pt-4">
      <button
        onClick={compartir}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 px-4 rounded-full"
      >
        📎 Copiar enlace
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(titulo)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-semibold py-2 px-4 rounded-full"
      >
        🐦 Twitter
      </a>
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-100 hover:bg-green-200 text-green-700 text-sm font-semibold py-2 px-4 rounded-full"
      >
        📲 WhatsApp
      </a>
    </div>
  );
}
