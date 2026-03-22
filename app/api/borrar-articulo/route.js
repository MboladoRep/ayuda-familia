import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
  try {
    // Leemos el ID que enviamos desde el panel
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
    }

    // Ejecutamos el borrado en Supabase
    const { error } = await supabase
      .from('articulos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error servidor:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
