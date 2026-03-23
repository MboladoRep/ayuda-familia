'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Ruta correcta: subimos dos niveles

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [acceso, setAcceso] = useState(false);
  const [estado, setEstado] = useState('');
  const [articulos, setArticulos] = useState([]);

  // Cargar artículos solo si tenemos acceso
  useEffect(() => {
    if (acceso) cargarArticulos();
  }, [acceso]);

  const cargarArticulos = async () => {
    const { data } = await supabase.from('articulos').select('*').order('created_at', { ascending: false });
    if (data) setArticulos(data);
  };

  const generarArticulo = async () => {
    setEstado('⏳ Generando artículo con IA...');
    try {
      const res = await fetch('/api/generar-articulo', { method: 'POST' });
      if (res.ok) {
        setEstado('✅ ¡Artículo creado correctamente!');
        cargarArticulos(); 
      } else {
        setEstado('❌ Error al generar el artículo.');
      }
    } catch (e) {
      setEstado('❌ Error de conexión con el servidor.');
    }
  };

  const borrarArticulo = async (id) => {
    if (!confirm("¿Seguro que quieres borrar este artículo? Esta acción no se puede deshacer.")) return;
    
    try {
      const res = await fetch('/api/borrar-articulo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        cargarArticulos(); 
      } else {
        alert("Hubo un error al borrar el artículo.");
      }
    } catch (e) {
      alert("Error de conexión.");
    }
  };

  // Pantalla de Login (Sencilla pero funcional)
  if (!acceso) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4">🔒 Acceso Administrador</h1>
          <input 
            type="password" 
            placeholder="Introduce la clave" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full mb-4 text-center text-black"
          />
          <button 
            onClick={() => password === '1234' ? setAcceso(true) : alert('Clave incorrecta')}
            className="bg-blue-600 text-white px-6 py-2 rounded w-full hover:bg-blue-700"
          >
            Entrar
          </button>
        </div>
      </main>
    );
  }

  // Panel de Administración Real
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
            <button onClick={() => setAcceso(false)} className="text-sm text-red-500 hover:underline">Cerrar Sesión</button>
          </div>
          
          <button 
            onClick={generarArticulo}
            className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition mr-4"
          >
            ✨ Crear Nuevo Artículo
          </button>
          <span className="text-sm text-gray-500 italic">{estado}</span>
        </div>

        {/* LISTA DE ARTÍCULOS EXISTENTES */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Artículos Publicados</h2>
          
          {articulos.length === 0 && <p className="text-gray-400 py-4">No hay artículos en la base de datos.</p>}
          
          <div className="space-y-4">
            {articulos.map((art) => (
              <div key={art.id} className="flex justify-between items-center border p-4 rounded-lg hover:bg-gray-50">
                <div>
                  <h3 className="font-semibold text-gray-800">{art.titulo}</h3>
                  <p className="text-xs text-gray-400">{new Date(art.created_at).toLocaleDateString('es-ES')}</p>
                </div>
                <button 
                  onClick={() => borrarArticulo(art.id)}
                  className="bg-red-100 hover:bg-red-500 hover:text-white text-red-600 text-sm font-bold py-1 px-3 rounded transition-colors"
                >
                  Borrar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
