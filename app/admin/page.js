'use client';
import { useState } from 'react';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [acceso, setAcceso] = useState(false); // "1234" es la clave por defecto
  const [estado, setEstado] = useState('');

  const generarArticulo = async () => {
    setEstado('Generando artículo con IA... (esto puede tardar 10 segundos)');
    
    try {
      const res = await fetch('/api/generar-articulo', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setEstado(`✅ ¡Artículo creado! Título: "${data.articulo.titulo}"`);
      } else {
        setEstado('❌ Error: ' + (data.error || 'Desconocido'));
      }
    } catch (e) {
      setEstado('❌ Error de conexión');
    }
  };

  // Pantalla de Login simple
  if (!acceso) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <h1 className="text-xl font-bold mb-4">🔒 Zona de Administrador</h1>
          <input 
            type="password" 
            placeholder="Introduce la clave" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          <button 
            onClick={() => password === '1234' ? setAcceso(true) : alert('Clave incorrecta')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Entrar
          </button>
        </div>
      </main>
    );
  }

  // Panel de Admin
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Panel de Generación IA</h1>
          
          <button 
            onClick={generarArticulo}
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition mb-4"
          >
            ✨ Generar Nuevo Artículo Automático
          </button>

          <div className="mt-4 p-4 bg-gray-50 rounded border min-h-[50px] text-gray-700">
            {estado || 'Listo para generar...'}
          </div>
          
          <div className="mt-6 text-xs text-gray-400 text-center">
            Los artículos generados aparecerán en la pestaña "Blog".
          </div>
        </div>
      </div>
    </main>
  );
}
