import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useSupabaseStatus } from '../../hooks/useSupabase';

export function SupabaseBanner() {
  const { isConfigured } = useSupabaseStatus();

  if (isConfigured) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-800 mb-1">
            Supabase no está configurado
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            La aplicación está usando datos de ejemplo. Para conectar a la base de datos real:
          </p>
          <ol className="text-sm text-yellow-700 space-y-1 mb-3 list-decimal list-inside">
            <li>Crea un proyecto en Supabase</li>
            <li>Ejecuta los scripts SQL (schema.sql, functions.sql, seed.sql)</li>
            <li>Copia tus credenciales en .env.local</li>
            <li>Reinicia el servidor (pnpm dev)</li>
          </ol>
          <div className="flex gap-3">
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
            >
              Ir a Supabase
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="/CONFIGURACION_COMPLETA.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
            >
              Ver guía completa
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
