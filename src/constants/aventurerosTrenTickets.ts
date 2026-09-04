import type { AventurerosTrenSubmode } from '../types';

export type AventurerosTrenTicket = {
  origin: string;
  destination: string;
  points: number;
};

/** Nombres de ciudad tal como salen en las cartas, más alias de búsqueda. */
const CITY_ALIASES: Record<string, readonly string[]> = {
  Amsterdam: ['amsterdam', 'ámsterdam'],
  Angora: ['ankara', 'ángora'],
  Athina: ['atenas', 'athens'],
  Berlin: ['berlín'],
  Bruxelles: ['bruselas', 'brussels'],
  Bucuresti: ['bucarest', 'bucharest'],
  Cadiz: ['cádiz'],
  Constantinople: ['constantinopla', 'estambul', 'istanbul'],
  Danzig: ['gdansk'],
  Edinburgh: ['edimburgo'],
  Kharkov: ['járkov', 'jarkov', 'kharkiv'],
  Kyiv: ['kiev'],
  København: ['copenhague', 'copenhagen'],
  'Los Angeles': ['los ángeles'],
  London: ['londres'],
  Marseille: ['marsella'],
  Moskva: ['moscú', 'moscu', 'moscow'],
  München: ['múnich', 'munich', 'munchen'],
  'New Orleans': ['nueva orleans'],
  'New York': ['nueva york'],
  Paris: ['parís'],
  Petrograd: ['petrogrado'],
  Roma: ['rome'],
  'Sault St. Marie': ['sault sainte marie', 'sault ste marie'],
  Sevastopol: ['sebastopol'],
  Smyrna: ['esmirna'],
  Sofia: ['sofía'],
  Stockholm: ['estocolmo'],
  Venezia: ['venecia', 'venice'],
  Wien: ['viena', 'vienna'],
  Wilno: ['vilna', 'vilnius'],
  Warszawa: ['varsovia', 'warsaw'],
  Zürich: ['zurich', 'zúrich'],
};

export const AVENTUREROS_TREN_TICKETS: Record<
  AventurerosTrenSubmode,
  readonly AventurerosTrenTicket[]
> = {
  base: [
    { origin: 'Boston', destination: 'Miami', points: 12 },
    { origin: 'Calgary', destination: 'Phoenix', points: 13 },
    { origin: 'Calgary', destination: 'Salt Lake City', points: 7 },
    { origin: 'Chicago', destination: 'New Orleans', points: 7 },
    { origin: 'Chicago', destination: 'Santa Fe', points: 9 },
    { origin: 'Dallas', destination: 'New York', points: 11 },
    { origin: 'Denver', destination: 'El Paso', points: 4 },
    { origin: 'Denver', destination: 'Pittsburgh', points: 11 },
    { origin: 'Duluth', destination: 'El Paso', points: 10 },
    { origin: 'Duluth', destination: 'Houston', points: 8 },
    { origin: 'Helena', destination: 'Los Angeles', points: 8 },
    { origin: 'Kansas City', destination: 'Houston', points: 5 },
    { origin: 'Los Angeles', destination: 'Chicago', points: 16 },
    { origin: 'Los Angeles', destination: 'Miami', points: 20 },
    { origin: 'Los Angeles', destination: 'New York', points: 21 },
    { origin: 'Montreal', destination: 'Atlanta', points: 9 },
    { origin: 'Montreal', destination: 'New Orleans', points: 13 },
    { origin: 'New York', destination: 'Atlanta', points: 6 },
    { origin: 'Portland', destination: 'Nashville', points: 17 },
    { origin: 'Portland', destination: 'Phoenix', points: 11 },
    { origin: 'San Francisco', destination: 'Atlanta', points: 17 },
    { origin: 'Sault St. Marie', destination: 'Nashville', points: 8 },
    { origin: 'Sault St. Marie', destination: 'Oklahoma City', points: 9 },
    { origin: 'Seattle', destination: 'Los Angeles', points: 9 },
    { origin: 'Seattle', destination: 'New York', points: 22 },
    { origin: 'Toronto', destination: 'Miami', points: 10 },
    { origin: 'Vancouver', destination: 'Montreal', points: 20 },
    { origin: 'Vancouver', destination: 'Santa Fe', points: 13 },
    { origin: 'Winnipeg', destination: 'Houston', points: 12 },
    { origin: 'Winnipeg', destination: 'Little Rock', points: 11 },
  ],
  europa: [
    { origin: 'Amsterdam', destination: 'Pamplona', points: 7 },
    { origin: 'Amsterdam', destination: 'Wilno', points: 12 },
    { origin: 'Angora', destination: 'Kharkov', points: 10 },
    { origin: 'Athina', destination: 'Angora', points: 5 },
    { origin: 'Athina', destination: 'Wilno', points: 11 },
    { origin: 'Barcelona', destination: 'Bruxelles', points: 8 },
    { origin: 'Barcelona', destination: 'München', points: 8 },
    { origin: 'Berlin', destination: 'Bucuresti', points: 8 },
    { origin: 'Berlin', destination: 'Moskva', points: 12 },
    { origin: 'Berlin', destination: 'Roma', points: 9 },
    { origin: 'Brest', destination: 'Marseille', points: 7 },
    { origin: 'Brest', destination: 'Petrograd', points: 20 },
    { origin: 'Brest', destination: 'Venezia', points: 8 },
    { origin: 'Bruxelles', destination: 'Danzig', points: 9 },
    { origin: 'Budapest', destination: 'Sofia', points: 5 },
    { origin: 'Cadiz', destination: 'Stockholm', points: 21 },
    { origin: 'Edinburgh', destination: 'Athina', points: 21 },
    { origin: 'Edinburgh', destination: 'Paris', points: 7 },
    { origin: 'Essen', destination: 'Kyiv', points: 10 },
    { origin: 'Frankfurt', destination: 'København', points: 5 },
    { origin: 'Frankfurt', destination: 'Smolensk', points: 13 },
    { origin: 'København', destination: 'Erzurum', points: 21 },
    { origin: 'Kyiv', destination: 'Petrograd', points: 6 },
    { origin: 'Kyiv', destination: 'Sochi', points: 8 },
    { origin: 'Lisboa', destination: 'Danzig', points: 20 },
    { origin: 'London', destination: 'Berlin', points: 7 },
    { origin: 'London', destination: 'Wien', points: 10 },
    { origin: 'Madrid', destination: 'Dieppe', points: 8 },
    { origin: 'Madrid', destination: 'Zürich', points: 8 },
    { origin: 'Marseille', destination: 'Essen', points: 8 },
    { origin: 'Palermo', destination: 'Constantinople', points: 8 },
    { origin: 'Palermo', destination: 'Moskva', points: 20 },
    { origin: 'Paris', destination: 'Wien', points: 8 },
    { origin: 'Paris', destination: 'Zagreb', points: 7 },
    { origin: 'Riga', destination: 'Bucuresti', points: 10 },
    { origin: 'Roma', destination: 'Smyrna', points: 8 },
    { origin: 'Rostov', destination: 'Erzurum', points: 5 },
    { origin: 'Sarajevo', destination: 'Sevastopol', points: 8 },
    { origin: 'Smolensk', destination: 'Rostov', points: 8 },
    { origin: 'Sofia', destination: 'Smyrna', points: 5 },
    { origin: 'Stockholm', destination: 'Wien', points: 11 },
    { origin: 'Venezia', destination: 'Constantinople', points: 10 },
    { origin: 'Warszawa', destination: 'Smolensk', points: 6 },
    { origin: 'Zagreb', destination: 'Brindisi', points: 6 },
    { origin: 'Zürich', destination: 'Brindisi', points: 6 },
    { origin: 'Zürich', destination: 'Budapest', points: 6 },
  ],
};

export function getDestinationTickets(
  submode: AventurerosTrenSubmode,
): readonly AventurerosTrenTicket[] {
  return AVENTUREROS_TREN_TICKETS[submode];
}

export function normalizeTicketText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function getTicketKey(ticket: {
  origin: string;
  destination: string;
}): string {
  const a = normalizeTicketText(ticket.origin);
  const b = normalizeTicketText(ticket.destination);
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function citySearchBlob(city: string): string {
  const aliases = CITY_ALIASES[city] ?? [];
  return [city, ...aliases].map(normalizeTicketText).join(' ');
}

function ticketSearchHaystack(ticket: AventurerosTrenTicket): string {
  return [
    citySearchBlob(ticket.origin),
    citySearchBlob(ticket.destination),
    String(ticket.points),
  ].join(' ');
}

export function filterDestinationTickets(
  tickets: readonly AventurerosTrenTicket[],
  query: string,
): AventurerosTrenTicket[] {
  const words = normalizeTicketText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...tickets];
  return tickets.filter((ticket) => {
    const haystack = ticketSearchHaystack(ticket);
    return words.every((word) => haystack.includes(word));
  });
}

export function findDestinationTicket(
  tickets: readonly AventurerosTrenTicket[],
  origin: string,
  destination: string,
): AventurerosTrenTicket | undefined {
  const originKey = normalizeTicketText(origin);
  const destinationKey = normalizeTicketText(destination);
  if (!originKey || !destinationKey) return undefined;
  return tickets.find((ticket) => {
    const ticketOrigin = normalizeTicketText(ticket.origin);
    const ticketDestination = normalizeTicketText(ticket.destination);
    return (
      (ticketOrigin === originKey && ticketDestination === destinationKey) ||
      (ticketOrigin === destinationKey && ticketDestination === originKey)
    );
  });
}

export function formatTicketLabel(ticket: {
  origin: string;
  destination: string;
}): string {
  return `${ticket.origin} → ${ticket.destination}`;
}
