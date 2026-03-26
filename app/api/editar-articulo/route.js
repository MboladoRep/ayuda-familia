import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    const { id, titulo, contenido, imagen_url } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
    }

    const { error } = await supabase
      .from('articulos')
      .update({ titulo, contenido, imagen_url })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
