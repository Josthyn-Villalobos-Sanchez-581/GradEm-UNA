// resources/js/services/curriculumService.ts
import axios, { AxiosError } from 'axios';

export type RespuestaGenerarCV = {
  ok: boolean;
  mensaje: string;
  rutaPublica: string;
};

// Helper de errores
function parseAxiosError(err: unknown): string {
  const ax = err as AxiosError<any>;
  if (ax?.response?.data?.message) return ax.response.data.message;
  if (ax?.response?.status) return `Error ${ax.response.status}`;
  return 'Error de red';
}

// Axios con cookies de sesión y CSRF
const api = axios.create({
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
});

// Inyecta CSRF en métodos que lo requieren
api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    config.headers = { ...config.headers, 'X-CSRF-TOKEN': token };
  }
  return config;
});

// ✅ SIN Ziggy: usa el path literal con slash inicial
export async function postGenerarCurriculum(payload: any): Promise<RespuestaGenerarCV> {
  try {
    const { data } = await api.post<RespuestaGenerarCV>('/api/curriculum/generate', payload);
    return data;
  } catch (err) {
    console.error('Error al generar CV:', err);
    alert(parseAxiosError(err) || 'No se pudo generar el currículum.');
    throw err;
  }
}
