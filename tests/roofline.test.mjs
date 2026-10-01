import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';

const moduleRequire = createRequire(import.meta.url);

// Exercise the production TypeScript modules without adding a test runtime.
function load(file, imports = {}) {
  const exports = {};
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  new Function('exports', 'require', js)(exports, (name) => imports[name] ?? moduleRequire(name));
  return exports;
}
const geo = load('lib/roofline.ts');
const config = load('lib/site.ts');
const { estimateLighting } = load('lib/pricing.ts', { '@/lib/site': config });
const { POST } = load('app/api/roof-location/route.ts', { '@/lib/roofline': geo, '@/lib/site': config });

test('closed footprint includes the final edge; open tracing does not', () => {
  const ring = [[0, 0], [0.0001, 0], [0.0001, 0.0001], [0, 0.0001]];
  assert.ok(Math.abs(geo.lengthFeet(ring, true) - 146.0886) < 0.01);
  assert.ok(Math.abs(geo.lengthFeet(ring) - 109.5665) < 0.01);
  assert.equal(geo.lengthFeet([]), 0);
  assert.equal(geo.lengthFeet([[0, 0]]), 0);
});

test('projection round trips and ground-scale view dimensions are correct', () => {
  const point = [-118.109366, 33.741591];
  const roundtrip = geo.unproject(geo.project(point));
  assert.ok(Math.abs(roundtrip[0] - point[0]) < 1e-9);
  assert.ok(Math.abs(roundtrip[1] - point[1]) < 1e-9);
  const bounds = geo.mapBounds(point, 240);
  const centerY = (bounds[1] + bounds[3]) / 2;
  assert.ok(Math.abs(geo.distance(geo.unproject([bounds[0], centerY]), geo.unproject([bounds[2], centerY])) - 240) < 0.1);
});

test('roofline and tree rates use feet and per-tree pricing', () => {
  assert.deepEqual(estimateLighting(150, 3), { min: 1500, max: 2550 });
  assert.deepEqual(estimateLighting(0, 4), { min: 400, max: 400 });
});

test('extract covers each service area with downloadable usable rings', () => {
  const index = JSON.parse(fs.readFileSync('public/roof-data/index.json', 'utf8'));
  const towns = [[-117.9298, 33.6189], [-118.1937, 33.7701], [-118.0718, 33.7164], [-118.1048, 33.7414], [-117.9992, 33.6595], [-117.8734, 33.5975], [-118.0648, 33.8583]];
  for (const point of towns) {
    const key = geo.tileKey(point);
    assert.ok(index.tiles.includes(key), `Missing tile ${key}`);
    const buildings = JSON.parse(zlib.gunzipSync(fs.readFileSync(`public/roof-data/${key}.json.gz`)));
    assert.ok(buildings.length > 0);
    assert.ok(buildings.every((b) => b.ring.length >= 3 && geo.lengthFeet(b.ring, true) > 0));
  }
});

test('address lookup rejects malformed input and cross-site requests', async () => {
  const request = (body, origin = 'https://holidaylightsoc.com') => new Request('https://holidaylightsoc.com/api/roof-location', { method: 'POST', headers: { origin }, body });
  assert.equal((await POST(request('{'))).status, 400);
  assert.equal((await POST(request('null'))).status, 400);
  assert.equal((await POST(request(JSON.stringify({ address: '500 Ocean Ave', city: 'Irvine' })))).status, 400);
  assert.equal((await POST(request('{}', 'https://example.com'))).status, 403);
});

test('address lookup handles no match, outside coverage, and upstream failure', async () => {
  const original = global.fetch;
  const request = () => new Request('https://holidaylightsoc.com/api/roof-location', { method: 'POST', body: JSON.stringify({ address: '500 Ocean Ave', city: 'Seal Beach' }) });
  try {
    global.fetch = async () => Response.json({ result: { addressMatches: [] } });
    assert.equal((await POST(request())).status, 404);
    global.fetch = async () => Response.json({ result: { addressMatches: [{ coordinates: { x: -122.4, y: 37.8 } }] } });
    assert.equal((await POST(request())).status, 404);
    global.fetch = async () => { throw new Error('Offline'); };
    assert.equal((await POST(request())).status, 503);
    global.fetch = async () => Response.json({ result: { addressMatches: [{ coordinates: { x: -118.109366, y: 33.741591 }, matchedAddress: '500 OCEAN AVE, SEAL BEACH, CA' }] } });
    const response = await POST(request());
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual((await response.json()).point, [-118.109366, 33.741591]);
  } finally { global.fetch = original; }
});


test('reference views use selected building coordinates in latitude-longitude order', () => {
  const building = { id: 'house', ring: [[-118.11, 33.74], [-118.109, 33.74], [-118.109, 33.741], [-118.11, 33.741]] };
  const center = geo.buildingCenter(building);
  assert.ok(Math.abs(center[0] + 118.1095) < 1e-9);
  assert.ok(Math.abs(center[1] - 33.7405) < 1e-9);
  const street = new URL(geo.googleMapsViewUrl(center, 'street'));
  const satellite = new URL(geo.googleMapsViewUrl(center, 'satellite'));
  assert.equal(street.searchParams.get('api'), '1');
  assert.equal(street.searchParams.get('map_action'), 'pano');
  assert.equal(street.searchParams.get('viewpoint'), `${center[1]},${center[0]}`);
  assert.equal(satellite.searchParams.get('center'), `${center[1]},${center[0]}`);
  assert.equal(satellite.searchParams.get('basemap'), 'satellite');
  assert.equal(street.searchParams.has('key'), false);
});
