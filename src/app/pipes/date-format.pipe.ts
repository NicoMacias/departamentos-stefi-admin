import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    const date = new Date(value); // Convertir el valor en un objeto Date
    const day = date.getUTCDate().toString().padStart(2, '0'); // Obtener día
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Obtener mes (agregar +1 porque los meses comienzan desde 0)
    const year = date.getUTCFullYear(); // Obtener año

    // Retornar en formato dd/mm/yyyy
    return `${day}/${month}/${year}`;
  }
}
