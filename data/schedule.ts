import type { WeeklyClass } from '../types';

export const weeklySchedule: WeeklyClass[] = [
  // Terça-feira
  { day: 2, time: '08:00', name: 'Teclado A', teacher: 'Helicleiton' },
  { day: 2, time: '09:00', name: 'Musicalização Infantil A', teacher: 'Karla Silva' },
  { day: 2, time: '14:00', name: 'Teclado B', teacher: 'Helicleiton' },
  { day: 2, time: '15:00', name: 'Musicalização Infantil B', teacher: 'Karla Silva' },
  { day: 2, time: '16:00', name: 'Teclado C', teacher: 'Helicleiton' },
  { day: 2, time: '18:00', name: 'Teclado E', teacher: 'Helicleiton' },
  
  // Quinta-feira
  { day: 4, time: '08:00', name: 'Violão A', teacher: 'Helicleiton' },
  { day: 4, time: '14:00', name: 'Violão B', teacher: 'Helicleiton' },
  { day: 4, time: '15:00', name: 'Musicalização Infantil C', teacher: 'Karla Silva' },
  { day: 4, time: '18:00', name: 'Violão C', teacher: 'Helicleiton' },
  
  // Sábado
  { day: 6, time: '08:00 - 09:00', name: 'Técnica Vocal', teacher: 'Ayrton Soares' },
  { day: 6, time: '13:00', name: 'Teclado D', teacher: 'Helicleiton' },
  { day: 6, time: '14:00', name: 'Teclado F', teacher: 'Helicleiton' },
  { day: 6, time: '15:00', name: 'Musicalização Infantil D', teacher: 'Karla Silva' },
];

export const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];