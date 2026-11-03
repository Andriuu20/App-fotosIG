import assert from 'node:assert/strict';
import { test } from 'node:test';

import { goldenState, momentOf, suggestionsFor } from '../src/lib/suggestions.ts';

const at = (h: number, m = 0) => new Date(2026, 5, 15, h, m);

test('momentOf', () => {
  assert.equal(momentOf(at(8)), 'manana');
  assert.equal(momentOf(at(13)), 'mediodia');
  assert.equal(momentOf(at(19)), 'tarde');
  assert.equal(momentOf(at(23)), 'noche');
  assert.equal(momentOf(at(3)), 'noche');
});

test('hora dorada: ahora, pronto y fuera', () => {
  const sun = { goldenHourStart: at(20), sunset: at(21), sunrise: at(6), goldenHourEndMorning: at(7) };
  assert.equal(goldenState({ now: at(20, 30), ...sun }), 'tarde');
  assert.equal(goldenState({ now: at(19, 30), ...sun }), 'pronto');
  assert.equal(goldenState({ now: at(6, 30), ...sun }), 'manana');
  assert.equal(goldenState({ now: at(12), ...sun }), null);
  assert.equal(goldenState({ now: at(12) }), null);
});

test('la hora dorada va primero, salvo si llueve', () => {
  const sun = { goldenHourStart: at(20), sunset: at(21) };
  assert.equal(suggestionsFor({ now: at(20, 15), ...sun })[0].id, 'hora-dorada');
  assert.equal(suggestionsFor({ now: at(20, 15), weather: 'lluvia', ...sun })[0].id, 'reflejos');
});

test('siempre hay ideas del momento del día, sin repetir', () => {
  for (const h of [0, 8, 13, 19]) {
    const ideas = suggestionsFor({ now: at(h) });
    assert.ok(ideas.length >= 2);
    assert.equal(new Set(ideas.map((i) => i.id)).size, ideas.length);
    for (const i of ideas) assert.ok(i.tips.length > 0);
  }
});
