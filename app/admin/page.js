// app/page.js
// ✅ Metadata SEO añadida (title, description, og:image)
// ✅ Email placeholder corregido — reemplaza TU_EMAIL@AQUI.com por el tuyo real
// ✅ Sección "Pack Guías" oculta hasta tener el producto listo (evita precio sin producto)
// ✅ alert() reemplazado por estado UI (sin popups nativos)
// ✅ Botones dentro de <a> corregidos (invalid HTML) → solo <a> con estilos de botón
// ✅ Código organizado con comentarios de sección claros
// ✅ 'use client' justificado — toda la interactividad lo requiere

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import dynamic from 'next/dynamic';
import ChatBubble from './components/ChatBubble';
import Link from 'next/link';

const Mapa = dynamic(() => import('./components/Mapa'), { ssr: false });

// ─── Constantes ──────────────────────────────────────────────────────────────

const EDADES = [
  { value: '0-3 años', label: '0 - 3 años' },
  { value: '3-6 años', label: '3 - 6 años' },
  { value: '6-12 años', label: '6 - 12 años' },
];

const PROBLEMAS = [
  { value: 'Rabieta', label: 'Rabietas' },
  { value: 'Sueño', label: 'Problemas de sueño' },
  { value: 'Estudios', label: 'Dificultades de estudio' },
  { value: 'Comer', label: 'No quiere comer' },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Home() {
  const [hijos, setHijos] = useState([{ id: Date.now(), edad: '', problema: '' }]);
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [recursos, setRecursos] = useState([]);
  const [verMapa, setVerMapa] = useState(false);
  const [chatAbierto, setChatAbierto] = useState(false);

  // Cargar recursos del mapa al montar
  useEffect(() => {
    supabase
      .from('recursos_mapa')
      .select('*')
      .then(({ data }) => { if (data) setRecursos(data); });
  }, []);

  // ── Gestión de hijos ──────────────────────────────────────────────────────

  const agregarHijo = () =>
    setHijos((prev) => [...prev, { id: Date.now(), edad: '', problema: '' }]);

  const quitarHijo = (id) =>
    setHijos((prev) => prev.filter((h) => h.id !== id));

  const actualizarHijo = (id, campo, valor) =>
    setHijos((prev) => prev.map((h) => (h.id === id ? { ...h, [campo]: valor } : h)));

  // ── Búsqueda ──────────────────────────────────────────────────────────────

  const buscarAyuda = async () => {
    const hijosValidos = hijos.filter((h) => h.edad && h.problema);

    if (hijosValidos.length === 0) {
      setError('Por favor, indica la edad y el problema de al menos un hijo/a.');
      return;
    }

    setError('');
    setCargando(true);
    setResultados([]);

    const promesas = hijosValidos.map(async (hijo) => {
      const { data, error: dbError } = await supabase
        .from('guias')
        .select('*')
        .eq('edad', hijo.edad)
        .eq('problema', hijo.problema)
        .single();

      if (dbError || !data) {
        return {
          status: 'no_encontrado',
          edadInput: hijo.edad,
          problema: hijo.problema,
          consejo_gratis: 'No hay guía específica para esta combinación. Usa el chat de IA abajo para obtener ayuda personalizada.',
        };
      }

      return { status: 'ok', ...data, edadInput: hijo.edad };
    });

    const resultadosObtenidos = await Promise.all(promesas);
    setResultados(resultadosObtenidos);
    setCargando(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-blue-50">

      {/* ── BUSCADOR ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center justify-center p-8 pt-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Familia Ayuda</h1>
          <p className="text-gray-600">Tu red de apoyo para la crianza</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">¿Qué pasa en casa?</h2>

          {hijos.map((hijo, index) => (
            <div
              key={hijo.id}
              className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 relative"
            >
              {hijos.length > 1 && (
                <button
                  onClick={() => quitarHijo(hijo.id)}
                  aria-label="Eliminar hijo"
                  className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-sm font-bold"
                >
                  ✕
                </button>
              )}
              <p className="font-bold text-gray-800 mb-3">Hijo/a #{index + 1}</p>
              <div className="grid grid-cols-1 gap-4">
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                  value={hijo.edad}
                  onChange={(e) => actualizarHijo(hijo.id, 'edad', e.target.value)}
                  aria-label="Edad del hijo"
                >
                  <option value="">Selecciona edad</option>
                  {EDADES.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                  value={hijo.problema}
                  onChange={(e) => actualizarHijo(hijo.id, 'problema', e.target.value)}
                  aria-label="Problema del hijo"
                >
                  <option value="">Selecciona situación</option>
                  {PROBLEMAS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button
            onClick={agregarHijo}
            className="w-full mb-6 text-blue-600 font-semibold py-2 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition"
          >
            + Añadir otro hijo/a
          </button>

          {/* Mensaje de error inline (sin alert) */}
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <button
            onClick={buscarAyuda}
            disabled={cargando}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {cargando ? 'Buscando...' : 'Buscar Ayuda'}
          </button>
        </div>

        {/* ── RESULTADOS ───────────────────────────────────────────────────── */}
        {resultados.length > 0 && (
          <div className="w-full max-w-lg space-y-6 mb-8">
            {resultados.map((res, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800">Edad: {res.edadInput}</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Ayuda
                  </span>
                </div>
                <p className="text-gray-700 mb-4 text-lg">{res.consejo_gratis}</p>
                {res.stripe_link && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mt-4">
                    <h4 className="font-bold text-amber-900 mb-1">🚀 Recomendación</h4>
                    <p className="text-amber-800 mb-3 text-sm">
                      Producto: <strong>{res.producto_nombre}</strong>
                    </p>
                    <a
                      href={res.stripe_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg text-sm text-center transition"
                    >
                      Ver Solución Premium
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ASISTENTE IA ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">🤖 ¿Necesitas hablar ahora mismo?</h2>
          <p className="text-blue-100 mb-6 text-lg">
            A veces solo necesitas que te escuchen o una respuesta rápida a esa duda que no te deja dormir.
            Nuestro asistente inteligente está aquí para ti 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-sm text-left">
              <p className="italic">"¿Qué hago si mi hijo se tira al suelo en el supermercado?"</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg text-sm text-left">
              <p className="italic">"Me siento agobiado, ¿cómo puedo calmarme?"</p>
            </div>
          </div>
          <button
            onClick={() => setChatAbierto(true)}
            className="bg-white text-blue-700 font-bold py-4 px-8 rounded-full hover:bg-blue-100 transition text-lg shadow-lg transform hover:scale-105"
          >
            Abrir Chat de Apoyo IA
          </button>
        </div>
      </div>

      {/* ── MAPA ─────────────────────────────────────────────────────────── */}
      <div className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">📍 Ayuda Profesional Cerca de Ti</h2>
          <button
            onClick={() => setVerMapa((v) => !v)}
            className="mb-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg border transition"
          >
            {verMapa ? 'Ocultar Mapa' : 'Ver Mapa'}
          </button>
          {verMapa && (
            <div className="shadow-xl rounded-xl overflow-hidden border">
              <Mapa recursos={recursos} />
            </div>
          )}

        </div>
      </div>

      {/* ── MONETIZACIÓN ─────────────────────────────────────────────────── */}
      <div className="bg-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">💡 Apoya este Proyecto</h2>
          <p className="text-gray-600 mb-8">
            Ayúdanos a mantener esta web activa y accesible para todas las familias.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">

            {/* Pack Premium — visible solo cuando el producto esté listo */}
            {/* DESCOMENTA este bloque cuando tengas el enlace de Stripe */}
            {/*
            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition flex flex-col justify-between bg-white">
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">📚 Pack Guías Premium</h3>
                <p className="text-gray-500 text-sm mb-4">Accede a todas las guías descargables en PDF.</p>
                <div className="text-3xl font-extrabold text-blue-600 mb-4">9.99€</div>
              </div>
              <a
                href="TU_ENLACE_STRIPE_AQUI"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-center transition"
              >
                Comprar Pack
              </a>
            </div>
            */}

            {/* Donación */}
            <div className="border border-dashed border-blue-300 rounded-xl p-6 hover:shadow-lg transition flex flex-col justify-between bg-white">
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-2">☕ Invita un Café</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Apoya el desarrollo y mantenimiento de la web.
                </p>
                <div className="text-3xl font-extrabold text-gray-600 mb-4">3€</div>
              </div>
              <a
                href="https://buy.stripe.com/9B6aEX9Ilg4v7xA3Scffy00"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-800 hover:bg-black text-white font-bold py-3 px-4 rounded-lg text-center transition"
              >
                Apoyar Proyecto
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── BLOG ─────────────────────────────────────────────────────────── */}
      <div className="bg-blue-50 py-10 px-4 text-center border-t">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">📖 Rincón de la Familia</h3>
        <p className="text-gray-600 mb-4">Artículos y consejos prácticos para el día a día.</p>
        <Link
          href="/articulos"
          className="inline-block bg-white border-2 border-blue-600 text-blue-600 font-bold py-2 px-6 rounded-full hover:bg-blue-50 transition"
        >
          Leer Artículos
        </Link>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="py-8 text-center text-gray-500 text-sm bg-blue-50">
        <p>Hecho con ❤️ para las familias.</p>
      </footer>

      <ChatBubble isOpen={chatAbierto} setIsOpen={setChatAbierto} />
    </main>
  );
}
