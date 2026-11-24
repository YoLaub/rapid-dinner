// A helper to prepare a phone order, not a shop: nothing is sent anywhere.
// The cart stores choices only (item key, size, quantity). Prices are always resolved
// from the current menu (the catalog), so a saved cart never shows stale prices.
// Shipped to the browser: no dependency.

export const STORAGE_KEY = 'panier:v1';
const MAX_QUANTITY = 99;
const NBSP = ' ';

const toCents = (amount) => Math.round(amount * 100);

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
const money = (cents) => euros.format(cents / 100);

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Orderable items by key. An item with `priceFrites` has two sizes ("Seul", "Avec frites").
 * @param {{id: string, name: string, items: {name: string, price: number, priceFrites?: number}[]}[]} categories
 */
export function buildCatalog(categories) {
  const catalog = {};
  for (const category of categories) {
    for (const item of category.items) {
      if (typeof item.price !== 'number') continue;
      const base = `${category.id}/${slugify(item.name)}`;
      let key = base;
      for (let n = 2; key in catalog; n += 1) key = `${base}-${n}`;
      catalog[key] = {
        key,
        categoryId: category.id,
        categoryName: category.name,
        name: item.name,
        prices:
          typeof item.priceFrites === 'number'
            ? [
                { label: 'Seul', cents: toCents(item.price) },
                { label: 'Avec frites', cents: toCents(item.priceFrites) },
              ]
            : [{ cents: toCents(item.price) }],
      };
    }
  }
  return catalog;
}

export const emptyCart = () => ({ lines: [] });
export const clearCart = emptyCart;

export const lineId = (line) => `${line.itemKey}|${line.variant ?? ''}`;

function resolvePrice(item, variant) {
  if (variant === undefined) return item.prices.length === 1 ? item.prices[0] : undefined;
  return item.prices.find((price) => price.label === variant);
}

function isValid(selection, catalog) {
  const item = catalog[selection.itemKey];
  return Boolean(item && resolvePrice(item, selection.variant));
}

function withLine(cart, line) {
  const id = lineId(line);
  const existing = cart.lines.find((candidate) => lineId(candidate) === id);
  if (!existing) return { lines: [...cart.lines, line] };
  return {
    lines: cart.lines.map((candidate) =>
      candidate === existing
        ? { ...candidate, quantity: Math.min(MAX_QUANTITY, candidate.quantity + line.quantity) }
        : candidate,
    ),
  };
}

/** Returns the same cart reference when the selection is not valid. */
export function addItem(cart, selection, catalog) {
  if (!isValid(selection, catalog)) return cart;
  const line = {
    itemKey: selection.itemKey,
    ...(selection.variant !== undefined ? { variant: selection.variant } : {}),
    quantity: 1,
  };
  return withLine(cart, line);
}

export function changeQuantity(cart, id, delta) {
  const target = cart.lines.find((line) => lineId(line) === id);
  if (!target) return cart;
  const quantity = Math.min(MAX_QUANTITY, target.quantity + delta);
  return {
    lines:
      quantity <= 0
        ? cart.lines.filter((line) => line !== target)
        : cart.lines.map((line) => (line === target ? { ...line, quantity } : line)),
  };
}

function unitCents(line, catalog) {
  const item = catalog[line.itemKey];
  return item && resolvePrice(item, line.variant)?.cents;
}

export function cartTotalCents(cart, catalog) {
  return cart.lines.reduce((sum, line) => sum + (unitCents(line, catalog) ?? 0) * line.quantity, 0);
}

/** Plain text to read out (or paste) when calling. Empty string for an empty cart. */
export function serializeCart(cart, catalog) {
  const rows = cart.lines.flatMap((line) => {
    const item = catalog[line.itemKey];
    const unit = unitCents(line, catalog);
    if (!item || unit === undefined) return [];
    const variant = line.variant ? ` (${line.variant})` : '';
    return [`${line.quantity} x ${item.name}${variant}${NBSP}: ${money(unit * line.quantity)}`];
  });
  if (rows.length === 0) return '';
  return [`Ma commande${NBSP}:`, ...rows, `Total estimé${NBSP}: ${money(cartTotalCents(cart, catalog))}`].join('\n');
}

function parseStoredLine(candidate) {
  if (typeof candidate !== 'object' || candidate === null) return undefined;
  const { itemKey, variant, quantity } = candidate;
  if (typeof itemKey !== 'string') return undefined;
  if (variant !== undefined && typeof variant !== 'string') return undefined;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return undefined;
  return { itemKey, ...(variant !== undefined ? { variant } : {}), quantity };
}

export function loadCart(storage, catalog) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return emptyCart();
    const lines = JSON.parse(raw)?.lines;
    if (!Array.isArray(lines)) return emptyCart();
    // One bad line must not wipe the others: validate line by line.
    return lines
      .flatMap((candidate) => parseStoredLine(candidate) ?? [])
      .filter((line) => isValid(line, catalog))
      .reduce((cart, line) => withLine(cart, line), emptyCart());
  } catch {
    return emptyCart();
  }
}

export function saveCart(storage, cart) {
  try {
    if (cart.lines.length === 0) storage?.removeItem(STORAGE_KEY);
    else storage?.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Storage refused (private mode, quota): the cart just stops being remembered.
  }
}
