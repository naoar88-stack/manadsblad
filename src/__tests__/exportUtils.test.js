/**
 * exportUtils — enhetstester för rena hjälpfunktioner
 * OBS: html2canvas och jsPDF mockas — testerna kör i Node/jsdom.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';

// ── Mocka tunga beroenden som inte fungerar i jsdom ──
vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: () => 'data:image/png;base64,MOCK',
    width: 1200,
    height: 800,
  }),
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    addImage: vi.fn(),
    save: vi.fn(),
    internal: { pageSize: { getWidth: () => 297, getHeight: () => 210 } },
  })),
}));

import { inlineExternalImages, buildFilename } from '../lib/exportUtils';

describe('buildFilename', () => {
  test('returnerar sträng med format och datum', () => {
    const name = buildFilename('png', 'a4-landscape', 2026, 4);
    expect(name).toMatch(/\.png$/);
    expect(name).toContain('2026');
  });

  test('byter ut mellanslag mot bindestreck', () => {
    const name = buildFilename('pdf', 'a4-portrait', 2026, 0);
    expect(name).not.toContain(' ');
  });
});

describe('inlineExternalImages', () => {
  beforeEach(() => {
    // Enkel jsdom-stub: fetch returnerar en tom blob
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob([''], { type: 'image/png' })),
    });
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.FileReader = class {
      readAsDataURL() { this.onload({ target: { result: 'data:image/png;base64,MOCK' } }); }
    };
  });

  test('returnerar ett DOM-element (klonat)', async () => {
    const el = document.createElement('div');
    const img = document.createElement('img');
    img.src = 'https://example.com/foto.png';
    el.appendChild(img);
    const result = await inlineExternalImages(el);
    expect(result).toBeInstanceOf(HTMLElement);
  });

  test('lämnar data:-URL:er oförändrade', async () => {
    const el = document.createElement('div');
    const img = document.createElement('img');
    img.src = 'data:image/png;base64,ABC';
    el.appendChild(img);
    const result = await inlineExternalImages(el);
    const resultImg = result.querySelector('img');
    expect(resultImg.src).toBe('data:image/png;base64,ABC');
  });
});
