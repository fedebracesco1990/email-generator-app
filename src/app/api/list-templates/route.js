import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // headers, sections o footers
    
    if (!type || !['headers', 'sections', 'footers'].includes(type)) {
      return NextResponse.json({ error: 'Tipo de template no válido' }, { status: 400 });
    }
    
    const templatesDir = path.join(process.cwd(), 'public/emails', type);
    
    // Leer archivos en el directorio
    const files = fs.readdirSync(templatesDir);
    
    // Filtrar solo archivos HTML y quitar la extensión
    const templates = files
      .filter(file => file.endsWith('.html'))
      .map(file => file.replace('.html', ''));
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error al listar templates:', error);
    return NextResponse.json(
      { error: `No se pudieron listar los templates: ${error.message}` }, 
      { status: 500 }
    );
  }
}
