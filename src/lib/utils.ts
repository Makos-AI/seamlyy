export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatPrice(amount: number | string, currency: string = 'USD') {
  let val = Number(amount);
  const isNgn = currency === 'NGN';
  if (isNgn) {
    val = val * 1500;
  }
  return new Intl.NumberFormat(isNgn ? 'en-NG' : 'en-US', {
    style: 'currency',
    currency,
  }).format(val);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function resolveWalletPointer(pointer: string) {
  if (pointer.startsWith('$')) {
    return `https://${pointer.slice(1)}`;
  }
  return pointer;
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
