'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
// Importamos el componente del mapa de forma dinámica para evitar errores de SSR
import dynamic from 'next/dynamic';

// Cargamos el mapa solo en el cliente (sin SSR)
const Mapa = dynamic(() => import('./components/Mapa'), { ssr: false });

export default function Home() {
  // Estados para el buscador
  const [edad, setEdad] = useState('');
  const [problema, setProblema] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Estados para el mapa y recursos
  const [recursos, setRecursos] = useState([]);
  const [verMapa, setVerMapa] = useState(false);

  // Cargar recursos del mapa al iniciar
  useEffect(() => {
    async function cargarRecursos() {
      const { data } = await supabase.from('recursos_mapa').select('*');
      if (data) setRecursos(data);
    }
    cargarRecursos();
  }, []);

  const buscarAyuda = async () => {
    if (!edad || !problema) {
      alert('Por favor, selecciona edad y problema');
      return;
    }
    setCargando(true);
    setResultado(null);

    let { data, error } = await supabase
      .from('guias')
      .select('*')
      .eq('edad', edad)
      .eq('problema', problema)
      .single();

    if (error) {
      setResultado({ consejo_gratis: "Aún no tenemos guía para esto, pero estamos trabajando." });
    } else {
      setResultado(data);
    }
    setCargando(false);
  };

  return (
    <main className="min-h-screen bg-blue-50">
      
      {/* --- SECCIÓN PRINCIPAL (BUSCADOR) --- */}
      <div className="flex flex-col items-center justify-center p-8 pt-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Familia Ayuda</h1>
          <p className="text-gray-600">Tu red de apoyo en la crianza</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mb-6">
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Edad del niño/a</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={edad} onChange={(e) => setEdad(e.target.value)}>
              <option value="">Selecciona una edad</option>
              <option value="0-3 años">0 - 3 años</option>
              <option value="3-6 años">3 - 6 años</option>
              <option value="6-12 años">6 - 12 años</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Problema actual</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={problema} onChange={(e) => setProblema(e.target.value)}>
              <option value="">Selecciona un problema</option>
              <option value="Rabieta">Rabietas</option>
              <option value="Sueño">Problemas de sueño</option>
              <option value="Estudios">Dificultades de estudio</option>
              <option value="Comer">No quiere comer</option>
            </select>
          </div>

          <button onClick={buscarAyuda} disabled={cargando} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400">
            {cargando ? 'Buscando...' : 'Pedir Ayuda'}
          </button>
        </div>

        {/* RESULTADO DEL BUSCADOR */}
        {resultado && (
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 border-green-500 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3">💡 Consejo Gratuito</h2>
            <p className="text-gray-700 mb-4 text-lg leading-relaxed">{resultado.consejo_gratis}</p>

            {resultado.stripe_link && (
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg mt-4">
                <h3 className="font-bold text-amber-900 mb-2">🚀 Guía Completa Disponible</h3>
                <p className="text-amber-800 mb-4 text-sm">
                  Producto recomendado: <strong>{resultado.producto_nombre}</strong>
                </p>
                <a href={resultado.stripe_link} target="_blank" rel="noopener noreferrer">
                  <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition">
                    Comprar Guía Premium
                  </button>
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- SECCIÓN MAPA DE RECURSOS --- */}
      <div className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">📍 Encuentra Ayuda Cerca de Ti</h2>
          <p className="text-gray-600 mb-6">Centros de atención temprana, psicólogos y asociaciones familiares.</p>
          
          <button onClick={() => setVerMapa(!verMapa)} className="mb-6 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg border">
            {verMapa ? 'Ocultar Mapa' : 'Ver Mapa de Recursos'}
          </button>

          {verMapa && (
            <div className="shadow-xl rounded-xl overflow-hidden border">
              <Mapa recursos={recursos} />
            </div>
          )}
        </div>
      </div>

      {/* --- SECCIÓN COMUNIDAD --- */}
      <div className="bg-blue-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">💬 Únete a la Comunidad</h2>
          <p className="text-blue-100 mb-8 text-lg">
            No estás solo/a. Conecta con otros padres que están pasando por lo mismo. Comparte experiencias y desahógate en un ambiente seguro.
          </p>
          {/* AQUÍ PONES EL ENLACE A TU GRUPO DE TELEGRAM O WHATSAPP */}
          <a href="https://t.me/tu_grupo_telegram" target="_blank" rel="noopener noreferrer">
            <button className="bg-white text-blue-900 font-bold py-4 px-8 rounded-full hover:bg-blue-100 transition text-lg shadow-lg">
              Unirse al Grupo de Apoyo
            </button>
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="py-8 text-center text-gray-500 text-sm bg-blue-50">
        <p>Hecho con ❤️ para las familias. Proyecto de ayuda comunitaria.</p>
      </footer>

    </main>
  );
}
