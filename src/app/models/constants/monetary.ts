export const MONETARY_UI_CONFIG: Record<number | string, { icon: string, colorClass: string }> = {
  1: { icon: 'bi-bank', colorClass: 'text-primary-dark' }, // International reserves
  4: { icon: 'bi-cash-stack', colorClass: 'text-success' }, // Monetary base
  27: { icon: 'bi-graph-down-arrow', colorClass: 'text-danger' }, // Exchange rate / Inflation
  
  'default': { icon: 'bi-graph-up', colorClass: 'text-muted' }
};