import { format, parseISO } from 'date-fns';

export const parseFechaTiempo = (fecha: string) => {
    try {
      const date = parseISO(fecha); // Convierte de "2025-06-09T10:20:00-05:00" a objeto Date
      return format(date, "yyyy-MM-dd'T'HH:mm"); // Formato requerido por <input type="datetime-local">
    } catch (error) {
      return ''; // En caso de error, devuelve cadena vacía
    }
  };