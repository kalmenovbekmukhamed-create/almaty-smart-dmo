"""
fetch_districts.py
──────────────────────────────────────────────────────────────
Download Almaty's 8 administrative district boundaries from
OpenStreetMap (Nominatim) and save as `almaty_districts.geojson`.

USAGE:
    python fetch_districts.py
or call fetch_all() from main.py's MAP tab via the button.

Nominatim usage policy:
    - max 1 req/sec  → we sleep 1.1s between calls
    - User-Agent header required
"""

from __future__ import annotations

import json
import time
from pathlib import Path

import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT    = "almaty-dmo-terminal/0.1 (research)"
GEOJSON_PATH  = Path(__file__).parent / "almaty_districts.geojson"

# Canonical name → list of OSM query variants to try in order.
# Russian first (most common in OSM for Almaty), Kazakh as fallback.
DISTRICT_QUERIES: list[tuple[str, list[str]]] = [
    ("Alatau",    ["Алатауский район, Алматы, Казахстан",
                   "Алатау ауданы, Алматы"]),
    ("Almaly",    ["Алмалинский район, Алматы, Казахстан",
                   "Алмалы ауданы, Алматы"]),
    ("Auezov",    ["Ауэзовский район, Алматы, Казахстан",
                   "Әуезов ауданы, Алматы"]),
    ("Bostandyk", ["Бостандыкский район, Алматы, Казахстан",
                   "Бостандық ауданы, Алматы"]),
    ("Jetysu",    ["Жетысуский район, Алматы, Казахстан",
                   "Жетісу ауданы, Алматы"]),
    ("Medeu",     ["Медеуский район, Алматы, Казахстан",
                   "Медеу ауданы, Алматы"]),
    ("Nauryzbai", ["Наурызбайский район, Алматы, Казахстан",
                   "Наурызбай ауданы, Алматы"]),
    ("Turksib",   ["Турксибский район, Алматы, Казахстан",
                   "Түрксіб ауданы, Алматы"]),
]


# ──────────────────────────────────────────────────────────────
def _query_nominatim(q: str) -> dict | None:
    """Single Nominatim search. Returns the first hit with a polygon, else None."""
    r = requests.get(
        NOMINATIM_URL,
        params={
            "q": q,
            "format": "json",
            "polygon_geojson": 1,
            "limit": 3,
            "addressdetails": 0,
        },
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    r.raise_for_status()
    for hit in r.json():
        geom = hit.get("geojson")
        if geom and geom.get("type") in ("Polygon", "MultiPolygon"):
            return {
                "display_name": hit.get("display_name", ""),
                "geometry": geom,
                "osm_id": hit.get("osm_id"),
            }
    return None


def fetch_all(progress_cb=None) -> dict:
    """
    Fetch every district. Optional progress_cb(name: str, ok: bool) is
    called once per district — used by the Streamlit progress bar.
    Returns: {features, missing, path}
    """
    features = []
    missing  = []

    for canon, queries in DISTRICT_QUERIES:
        hit = None
        for q in queries:
            try:
                hit = _query_nominatim(q)
            except requests.RequestException:
                hit = None
            if hit:
                break
            time.sleep(1.1)            # rate limit between fallback attempts

        if hit is None:
            missing.append(canon)
            if progress_cb:
                progress_cb(canon, False)
            time.sleep(1.1)
            continue

        features.append({
            "type": "Feature",
            "properties": {
                "name":     canon,
                "osm_name": hit["display_name"],
                "osm_id":   hit.get("osm_id"),
            },
            "geometry": hit["geometry"],
        })
        if progress_cb:
            progress_cb(canon, True)
        time.sleep(1.1)

    fc = {"type": "FeatureCollection", "features": features}
    GEOJSON_PATH.write_text(
        json.dumps(fc, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return {"features": features, "missing": missing, "path": str(GEOJSON_PATH)}


# ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("[ DMO·FETCH ] Almaty district boundaries · OpenStreetMap")
    print("─" * 60)

    def _cb(name, ok):
        print(f"  {'[ OK ]' if ok else '[ ?? ]'}  {name}")

    out = fetch_all(progress_cb=_cb)

    print("─" * 60)
    print(f"saved → {out['path']}")
    print(f"districts found: {len(out['features'])}/8")
    if out["missing"]:
        print(f"missing: {', '.join(out['missing'])}")
        print("  (try editing DISTRICT_QUERIES with alternative spellings)")
