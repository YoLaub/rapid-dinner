import { describe, it, expect } from 'vitest';
import {
  STORAGE_KEY,
  addItem,
  buildCatalog,
  cartTotalCents,
  changeQuantity,
  clearCart,
  emptyCart,
  lineId,
  loadCart,
  saveCart,
  serializeCart,
} from './cart.js';
import menu from '../data/menu.json';

const catalog = buildCatalog([
  {
    id: 'chauds',
    name: 'Sandwichs chauds',
    items: [
      { name: 'Kebab (halal)', price: 10.5, priceFrites: 11 },
      { name: 'Omelette', price: 7.5, priceFrites: 8 },
    ],
  },
  { id: 'boissons', name: 'Boissons', items: [{ name: 'Cola 33cl', price: 2 }, { name: 'Cola 33cl', price: 2.5 }] },
]);

const memoryStorage = (initial = {}) => {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => void (data[key] = String(value)),
    removeItem: (key) => void delete data[key],
  };
};

describe('buildCatalog', () => {
  it('turns "price / priceFrites" into two sizes, and a single price into one', () => {
    expect(catalog['chauds/kebab-halal'].prices).toEqual([
      { label: 'Seul', cents: 1050 },
      { label: 'Avec frites', cents: 1100 },
    ]);
    expect(catalog['boissons/cola-33cl'].prices).toEqual([{ cents: 200 }]);
  });

  it('keeps keys unique when two items share a name', () => {
    expect(Object.keys(catalog)).toContain('boissons/cola-33cl-2');
  });

  it('converts decimals to integer cents without float drift', () => {
    const c = buildCatalog([{ id: 'x', name: 'X', items: [{ name: 'A', price: 0.1 + 0.2 }] }]);
    expect(c['x/a'].prices[0].cents).toBe(30);
  });

  it('covers every item of the real menu', () => {
    const real = buildCatalog(menu.categories);
    const count = menu.categories.reduce((n, c) => n + c.items.length, 0);
    expect(Object.keys(real)).toHaveLength(count);
  });
});

describe('addItem', () => {
  it('adds a line, and merges the same size into a quantity', () => {
    let cart = addItem(emptyCart(), { itemKey: 'chauds/omelette', variant: 'Seul' }, catalog);
    cart = addItem(cart, { itemKey: 'chauds/omelette', variant: 'Seul' }, catalog);
    expect(cart.lines).toEqual([{ itemKey: 'chauds/omelette', variant: 'Seul', quantity: 2 }]);
  });

  it('keeps two sizes of the same item on separate lines', () => {
    let cart = addItem(emptyCart(), { itemKey: 'chauds/omelette', variant: 'Seul' }, catalog);
    cart = addItem(cart, { itemKey: 'chauds/omelette', variant: 'Avec frites' }, catalog);
    expect(cart.lines).toHaveLength(2);
  });

  it('accepts a single-price item without a size', () => {
    const cart = addItem(emptyCart(), { itemKey: 'boissons/cola-33cl' }, catalog);
    expect(cart.lines[0].quantity).toBe(1);
  });

  it('returns the same cart for an unknown item or size', () => {
    const cart = emptyCart();
    expect(addItem(cart, { itemKey: 'nope/nope' }, catalog)).toBe(cart);
    expect(addItem(cart, { itemKey: 'chauds/omelette', variant: 'XL' }, catalog)).toBe(cart);
    expect(addItem(cart, { itemKey: 'chauds/omelette' }, catalog)).toBe(cart);
  });

  it('does not mutate the previous cart', () => {
    const cart = emptyCart();
    addItem(cart, { itemKey: 'boissons/cola-33cl' }, catalog);
    expect(cart.lines).toEqual([]);
  });
});

describe('changeQuantity', () => {
  const base = addItem(emptyCart(), { itemKey: 'chauds/omelette', variant: 'Seul' }, catalog);
  const id = lineId(base.lines[0]);

  it('increases and decreases', () => {
    expect(changeQuantity(base, id, 1).lines[0].quantity).toBe(2);
    expect(changeQuantity(changeQuantity(base, id, 1), id, -1).lines[0].quantity).toBe(1);
  });

  it('removes the line at zero', () => {
    expect(changeQuantity(base, id, -1).lines).toEqual([]);
  });

  it('caps the quantity at 99 and ignores unknown ids', () => {
    expect(changeQuantity(base, id, 500).lines[0].quantity).toBe(99);
    expect(changeQuantity(base, 'ghost', 1)).toBe(base);
  });
});

describe('cartTotalCents', () => {
  it('sums quantity x price in cents', () => {
    let cart = addItem(emptyCart(), { itemKey: 'chauds/kebab-halal', variant: 'Avec frites' }, catalog);
    cart = changeQuantity(cart, lineId(cart.lines[0]), 1);
    cart = addItem(cart, { itemKey: 'boissons/cola-33cl' }, catalog);
    expect(cartTotalCents(cart, catalog)).toBe(2 * 1100 + 200);
  });

  it('is 0 for an empty cart and ignores lines whose item left the menu', () => {
    expect(cartTotalCents(emptyCart(), catalog)).toBe(0);
    expect(cartTotalCents({ lines: [{ itemKey: 'gone/x', quantity: 3 }] }, catalog)).toBe(0);
  });
});

describe('clearCart', () => {
  it('gives an empty cart', () => {
    expect(clearCart().lines).toEqual([]);
  });
});

describe('serializeCart', () => {
  it('writes a readable order to read out on the phone', () => {
    let cart = addItem(emptyCart(), { itemKey: 'chauds/kebab-halal', variant: 'Avec frites' }, catalog);
    cart = addItem(cart, { itemKey: 'boissons/cola-33cl' }, catalog);
    const text = serializeCart(cart, catalog);
    const lines = text.split('\n');
    expect(lines[0]).toBe('Ma commande :');
    expect(lines[1]).toContain('1 x Kebab (halal) (Avec frites)');
    expect(lines[2]).toContain('1 x Cola 33cl');
    expect(lines.at(-1)).toMatch(/^Total estimé : 13[,.]00/);
  });

  it('is empty for an empty cart', () => {
    expect(serializeCart(emptyCart(), catalog)).toBe('');
  });
});

describe('persistence', () => {
  it('saves and reloads the same cart', () => {
    const storage = memoryStorage();
    const cart = addItem(emptyCart(), { itemKey: 'chauds/omelette', variant: 'Seul' }, catalog);
    saveCart(storage, cart);
    expect(loadCart(storage, catalog)).toEqual(cart);
  });

  it('removes the key when the cart is emptied', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{"lines":[]}' });
    saveCart(storage, emptyCart());
    expect(STORAGE_KEY in storage.data).toBe(false);
  });

  it('starts empty on corrupted JSON, wrong shape, or missing storage', () => {
    expect(loadCart(memoryStorage({ [STORAGE_KEY]: '{oops' }), catalog)).toEqual(emptyCart());
    expect(loadCart(memoryStorage({ [STORAGE_KEY]: '{"lines":42}' }), catalog)).toEqual(emptyCart());
    expect(loadCart(undefined, catalog)).toEqual(emptyCart());
  });

  it('keeps valid lines and drops invalid ones (unknown item, bad size, bad quantity)', () => {
    const stored = {
      lines: [
        { itemKey: 'chauds/omelette', variant: 'Seul', quantity: 2 },
        { itemKey: 'gone/x', quantity: 1 },
        { itemKey: 'chauds/omelette', variant: 'XL', quantity: 1 },
        { itemKey: 'boissons/cola-33cl', quantity: -4 },
        'garbage',
      ],
    };
    const cart = loadCart(memoryStorage({ [STORAGE_KEY]: JSON.stringify(stored) }), catalog);
    expect(cart.lines).toEqual([{ itemKey: 'chauds/omelette', variant: 'Seul', quantity: 2 }]);
  });

  it('never throws when storage throws', () => {
    const broken = {
      getItem() { throw new Error('blocked'); },
      setItem() { throw new Error('quota'); },
      removeItem() { throw new Error('blocked'); },
    };
    expect(loadCart(broken, catalog)).toEqual(emptyCart());
    expect(() => saveCart(broken, emptyCart())).not.toThrow();
    expect(() => saveCart(broken, addItem(emptyCart(), { itemKey: 'boissons/cola-33cl' }, catalog))).not.toThrow();
  });
});
