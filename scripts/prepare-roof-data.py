"""Compact an Overture GeoJSON sequence into local 0.01-degree tiles.
Usage: python3 scripts/prepare-roof-data.py SOURCE.geojsonseq
Refresh source with the documented overturemaps command in docs/roofline-quoting.md.
"""
import json
import gzip
import math
import sys
from collections import defaultdict
from pathlib import Path

output = Path(__file__).resolve().parents[1] / 'public' / 'roof-data'
output.mkdir(parents=True, exist_ok=True)
tiles = defaultdict(list)
count = 0
sources = set()
for line in Path(sys.argv[1]).open():
    feature = json.loads(line.lstrip('\x1e'))
    geom = feature.get('geometry') or {}
    props = feature.get('properties') or {}
    if props.get('is_underground'):
        continue
    polygons = [geom['coordinates']] if geom.get('type') == 'Polygon' else geom.get('coordinates', []) if geom.get('type') == 'MultiPolygon' else []
    for n, polygon in enumerate(polygons):
        ring = [[round(p[0], 7), round(p[1], 7)] for p in polygon[0]]
        if ring[0] == ring[-1]:
            ring.pop()
        if len(ring) < 3:
            continue
        lon = [p[0] for p in ring]
        lat = [p[1] for p in ring]
        # Restrict to the documented regional extract even if upstream changes.
        if max(lon) < -118.26 or min(lon) > -117.75 or max(lat) < 33.55 or min(lat) > 33.91:
            continue
        item = {'id': f"{props['id']}:{n}", 'ring': ring}
        for x in range(math.floor(min(lon) * 100), math.floor(max(lon) * 100) + 1):
            for y in range(math.floor(min(lat) * 100), math.floor(max(lat) * 100) + 1):
                tiles[f'{x}_{y}'].append(item)
        count += 1
    for source in props.get('sources', []):
        sources.add(source.get('dataset', 'Unknown'))
for key, buildings in tiles.items():
    encoded = json.dumps(buildings, separators=(',', ':')).encode()
    (output / f'{key}.json.gz').write_bytes(gzip.compress(encoded, compresslevel=9, mtime=0))
    # Remove only a superseded generated tile, never other public assets.
    (output / f'{key}.json').unlink(missing_ok=True)
(output / 'index.json').write_text(json.dumps({'release': '2026-09-23.1', 'bbox': [-118.26, 33.55, -117.75, 33.91], 'buildings': count, 'tiles': sorted(tiles), 'license': 'ODbL-1.0', 'sources': sorted(sources)}, separators=(',', ':')))
print(f'Prepared {count:,} polygons in {len(tiles)} tiles. Sources: {sorted(sources)}')
