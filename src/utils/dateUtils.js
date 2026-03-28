export const CV_HOLIDAYS_2026 = [
  '2026-01-01', // Ano Novo
  '2026-01-13', // Dia da Liberdade
  '2026-01-20', // Heróis Nacionais
  '2026-04-03', // Sexta-feira Santa
  '2026-05-01', // Dia do Trabalhador
  '2026-07-05', // Independência
  '2026-08-15', // N.S da Graça
  '2026-11-01', // Todos os Santos
  '2026-12-25'  // Natal
];

export function getBusinessDays(startDateStr, endDateStr) {
  let count = 0;
  let curDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  
  if (curDate > endDate) return 0;
  
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    const dateStr = curDate.toISOString().split('T')[0];
    
    // 0 is Sunday, 6 is Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !CV_HOLIDAYS_2026.includes(dateStr)) {
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
}

export function formatPeriod(start, end) {
  const d1 = new Date(start);
  const d2 = new Date(end);
  const m1 = d1.toLocaleString('pt', { month: 'short', year: 'numeric' }).replace(' de ', ' ');
  if (start === end) return `${d1.getDate()} ${m1}`;
  return `${d1.getDate()}-${d2.getDate()} ${m1}`;
}
