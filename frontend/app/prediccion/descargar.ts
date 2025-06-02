import * as XLSX from 'xlsx';

export function descargarExcel(data: any[], nombreArchivo: string = "requisiciones.xlsx") {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Requisiciones");
  XLSX.writeFile(workbook, nombreArchivo);
}
