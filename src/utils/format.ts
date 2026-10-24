export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d) + ' WIB';
  } catch {
    return dateStr;
  }
}

export function calculatePoints(total: number, nilaiPerPoin: number): number {
  if (!nilaiPerPoin || nilaiPerPoin <= 0) return 0;
  return Math.floor(total / nilaiPerPoin);
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'Menunggu':
      return {
        bg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
        label: 'Menunggu Konfirmasi'
      };
    case 'Diproses':
      return {
        bg: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300',
        label: 'Sedang Disiapkan'
      };
    case 'Selesai':
      return {
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
        label: 'Pesanan Selesai'
      };
    case 'Dibatalkan':
      return {
        bg: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300',
        label: 'Dibatalkan'
      };
    default:
      return {
        bg: 'bg-stone-100 text-stone-800 border-stone-300',
        label: status
      };
  }
}

export function getDirectImageUrl(url?: unknown): string {
  if (!url) return '';
  const trimmed = String(url).trim();
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    const fileId = match[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return trimmed;
}

