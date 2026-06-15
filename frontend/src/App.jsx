import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Marker,
  Pane,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { categoryChips, places } from "./data";
import { districtContent, districtTheme } from "./districtData";
import { ambientOffsets, getFeatureCenter, hashString } from "./geo";
import { innovationProjects, smartTourismSystem } from "./innovationData";
import { LANGUAGES, translate } from "./i18n";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const almatyCenter = [43.2383, 76.9456];

const categoryColors = {
  Attractions: "#1f6feb",
  Nature: "#22a06b",
  Entertainment: "#8b5cf6",
  Food: "#ef4444",
  Shopping: "#f59e0b",
  Events: "#06b6d4",
};

const innovationIconMap = {
  Almaly: "🚁",
  Alatau: "🏺",
  Auezov: "🎡",
  Nauryzbai: "🌿",
  Bostandyk: "🦖",
  Medeu: "🏔️",
  Turksib: "✈️",
  Jetysu: "🛒",
};
const CURRENT_CORE_DISTRICTS = new Set(["Almaly", "Medeu", "Bostandyk"]);
const placeIconMap = {
  Attraction: "⭐",
  Attractions: "⭐",
  Nature: "🌿",
  Entertainment: "🎭",
  Food: "🍽️",
  Shopping: "🛍️",
  Events: "🎪",
  Culture: "🏛️",
  Sport: "⛸️",
  Transport: "✈️",
  Airport: "✈️",
  Innovation: "💡",
  Mountain: "🏔️",
  Family: "🎡",
  "Education/STEM": "🦖",
  Education: "🦖",
  STEM: "🦖",
  Market: "🛒",
};

const districtNameMap = {
  "Медеуский район": "Medeu",
  "Medeu District": "Medeu",
  "Алмалинский район": "Almaly",
  "Almaly District": "Almaly",
  "Бостандыкский район": "Bostandyk",
  "Bostandyk District": "Bostandyk",
  "Ауэзовский район": "Auezov",
  "Auezov District": "Auezov",
  "Алатауский район": "Alatau",
  "Alatau District": "Alatau",
  "Турксибский район": "Turksib",
  "Turksib District": "Turksib",
  "Жетысуский район": "Jetysu",
  "Jetysu District": "Jetysu",
  "Наурызбайский район": "Nauryzbai",
  "Nauryzbai District": "Nauryzbai",
};

const ambientPaths = [
  // Airport -> Almaly corridor (strong)
  { from: [43.3521, 77.0405], to: [43.3005, 76.995], type: "transit", density: 5, kind: "dot" },
  { from: [43.3005, 76.995], to: [43.262, 76.945], type: "transit", density: 5, kind: "visitor" },
  // Almaly -> Medeu (strong)
  { from: [43.262, 76.945], to: [43.248, 76.958], type: "walking", density: 4, kind: "walker" },
  { from: [43.248, 76.958], to: [43.2338, 76.9767], type: "walking", density: 4, kind: "ring" },
  { from: [43.2338, 76.9767], to: [43.189, 77.035], type: "mountain", density: 3, kind: "dot" },
  // Almaly -> Bostandyk (strong)
  { from: [43.2621, 76.9444], to: [43.233, 76.923], type: "food", density: 4, kind: "visitor" },
  { from: [43.233, 76.923], to: [43.215, 76.904], type: "event", density: 4, kind: "ring" },
  // Alatau <-> Auezov <-> Nauryzbai (medium)
  { from: [43.2662, 76.8389], to: [43.2249, 76.8436], type: "walking", density: 3, kind: "dot" },
  { from: [43.2249, 76.8436], to: [43.205, 76.865], type: "walking", density: 3, kind: "walker" },
  { from: [43.205, 76.865], to: [43.1902, 76.8918], type: "food", density: 3, kind: "visitor" },
  // Almaly walking/cultural corridor (strong micro loops)
  { from: [43.2586, 76.9537], to: [43.2637, 76.9459], type: "walking", density: 4, kind: "walker" },
  { from: [43.2637, 76.9459], to: [43.2434, 76.9455], type: "food", density: 4, kind: "dot" },
  { from: [43.2434, 76.9455], to: [43.2589, 76.9544], type: "event", density: 4, kind: "ring" },
];

const ambientTypeStyle = {
  walking: { icon: "•", color: "#64748b" },
  food: { icon: "◦", color: "#f97316" },
  event: { icon: "✦", color: "#8b5cf6" },
  mountain: { icon: "▴", color: "#10b981" },
  transit: { icon: "▪", color: "#06b6d4" },
};

const districtTextureIcons = {
  Almaly: ["🏛️", "🍽️", "🎭", "🚁"],
  Medeu: ["🏔️", "🌿", "⛸️", "🎪"],
  Bostandyk: ["🦖", "🛍️", "🎓", "☕"],
  Auezov: ["🎡", "👨‍👩‍👧", "🍿"],
  Alatau: ["🏺", "🌾", "🎪"],
  Turksib: ["✈️", "🚆", "🧭"],
  Jetysu: ["🛒", "🚶", "🍜"],
  Nauryzbai: ["🌿", "🥾", "🧺"],
};

function resolveDistrictKey(name) {
  return districtNameMap[name] || name;
}

function districtStyle(feature, selectedDistrict, fundedStrength = {}, routeDistrictSet = new Set(), liteMode = false) {
  const name = feature.properties?.name;
  const t = districtTheme[name];
  if (!t) {
    return {
      className: "city-dim",
      color: "#94a3b8",
      weight: liteMode ? 1.4 : 1,
      fillColor: "#cbd5e1",
      fillOpacity: 0.08,
      opacity: liteMode ? 0.66 : 0.5,
    };
  }
  const isSelected = name === selectedDistrict;
  const hasSelection = Boolean(selectedDistrict);
  const funded = fundedStrength[name] || 0;
  const boost = funded > 0 ? Math.min(0.18, funded * 0.22) : 0;
  const routeBoost = routeDistrictSet.has(name) ? 0.12 : 0;

  // On small screens the basemap reads thinner, so rayon borders need more
  // weight and ink to stay legible — lift stroke + fill in lite mode.
  if (!hasSelection) {
    return {
      className: "city-dim",
      color: t.color,
      weight: liteMode ? 1.8 : 1.15,
      fillColor: t.color,
      fillOpacity: (liteMode ? 0.17 : 0.1) + boost + routeBoost,
      opacity: liteMode ? 0.92 : 0.68,
    };
  }
  if (isSelected) {
    return {
      className: "city-dim",
      color: t.color,
      weight: liteMode ? 3 : 2.65,
      fillColor: t.color,
      fillOpacity: (liteMode ? 0.3 : 0.27) + boost + routeBoost,
      opacity: 0.98,
    };
  }
  return {
    className: "city-dim",
    color: "#a8b0b8",
    weight: liteMode ? 1.3 : 1,
    fillColor: "#94a3b8",
    fillOpacity: liteMode ? 0.06 : 0.042,
    opacity: liteMode ? 0.5 : 0.34,
  };
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function MapAutoFocus({ selectedDistrict, districtGeoJson }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedDistrict) {
      map.flyTo(almatyCenter, 10, { duration: 1.2 });
      return;
    }
    if (!districtGeoJson?.features) return;
    const feature = districtGeoJson.features.find(
      (f) => f.properties?.name === selectedDistrict
    );
    if (!feature) return;
    const layer = L.geoJSON(feature);
    map.fitBounds(layer.getBounds(), {
      animate: true,
      duration: 1.15,
      padding: [44, 44],
    });
  }, [map, selectedDistrict, districtGeoJson]);

  return null;
}

function RouteAutoFocus({ routePoints }) {
  const map = useMap();
  useEffect(() => {
    if (!routePoints || routePoints.length < 2) return;
    const bounds = L.latLngBounds(routePoints.map((p) => L.latLng(p[0], p[1])));
    if (!bounds.isValid()) return;
    map.flyToBounds(bounds, { padding: [42, 42], duration: 1.05 });
  }, [map, routePoints]);
  return null;
}

function DistrictLabel({ name, tag, position, selected, dim, theme }) {
  const t = theme || districtTheme[name];
  const border = selected ? `${t.color}` : `${t.color}55`;
  const shadow = `${t.glowColor}55`;
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "district-label-anchor",
        html: `<div class="district-label ${selected ? "district-label--active" : ""} ${dim ? "district-label--dim" : ""}" style="border-color:${border};background:${t.softColor};box-shadow:0 10px 32px ${shadow}"><span class="district-label__name">${escapeHtml(name)}</span><span class="district-label__tag" style="color:${t.labelColor}">${escapeHtml(tag ?? "")}</span></div>`,
        iconSize: [248, 58],
        iconAnchor: [124, 29],
      }),
    [name, tag, selected, dim, border, shadow, t.labelColor, t.softColor, t.glowColor]
  );

  return (
    <Marker position={position} icon={icon} interactive={false} zIndexOffset={selected ? 680 : 430} />
  );
}

function InnovationBadgeMarker({
  district,
  position,
  project,
  onSelect,
  isSelected,
  index,
  dimmed,
  intensity = 0,
}) {
  const icon = innovationIconMap[district] || "✨";
  const projectTypeShort = project.projectType.split("/")[0].trim();
  const badge = useMemo(
    () =>
      L.divIcon({
        className: "innovation-badge-anchor",
        html: `<button class="innovation-badge ${isSelected ? "innovation-badge--active" : ""} ${dimmed ? "innovation-badge--dimmed" : ""}" style="--badge-color:${project.themeColor};--badge-delay:${index * 90}ms;--badge-intensity:${Math.min(1, intensity)}"><div class="innovation-badge__head"><span class="innovation-badge__icon">${icon}</span><span class="innovation-badge__district">${escapeHtml(district)}</span></div><div class="innovation-badge__title">${escapeHtml(project.projectName)}</div><div class="innovation-badge__type">${escapeHtml(projectTypeShort)}</div></button>`,
        iconSize: [230, 92],
        iconAnchor: [115, 46],
      }),
    [
      dimmed,
      district,
      icon,
      index,
      intensity,
      isSelected,
      project.projectName,
      project.projectType,
      project.themeColor,
      projectTypeShort,
    ]
  );

  return (
    <Marker
      position={position}
      icon={badge}
      zIndexOffset={isSelected ? 920 : 860}
      eventHandlers={{ click: () => onSelect(district) }}
    />
  );
}

function PlaceIconMarker({ place, inFocus, selected, categoryColor, children }) {
  const emoji = placeIconMap[place.category] || "📍";
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "place-emoji-anchor",
        html: `<div class="place-emoji-pin ${inFocus ? "place-emoji-pin--focus" : "place-emoji-pin--faded"} ${
          selected ? "place-emoji-pin--selected" : ""
        }" style="--pin-color:${categoryColor}"><span class="place-emoji-pin__icon">${emoji}</span></div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      }),
    [categoryColor, emoji, inFocus, selected]
  );
  return (
    <Marker position={place.coordinates} icon={icon}>
      {children}
    </Marker>
  );
}

/** Optional card for attractions / lifestyle — shared layout */
function InsightCard({
  eyebrow,
  title,
  children,
  eyebrowMuted,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white/75 p-3 shadow-sm">
      <p className={`mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${eyebrowMuted ? "text-slate-400" : "text-slate-500"}`}>
        {eyebrow}
      </p>
      {title ? <h4 className="mb-1 text-sm font-semibold text-slate-900">{title}</h4> : null}
      <div className={`${title ? "mt-1" : "mt-0"} text-xs leading-relaxed text-slate-600`}>{children}</div>
    </div>
  );
}

export default function App() {
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState(categoryChips);
  const [timeSlot, setTimeSlot] = useState("Afternoon");
  const [districtGeoJson, setDistrictGeoJson] = useState(null);
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState("");
  const [layerState, setLayerState] = useState({
    places: true,
    events: true,
    innovation: false,
    movement: true,
  });
  const [scenarioModel, setScenarioModel] = useState("innovation");
  const [simOpen, setSimOpen] = useState(false);
  const [simRan, setSimRan] = useState(false);
  const [simAlloc, setSimAlloc] = useState({
    Almaly: 0,
    Alatau: 0,
    Auezov: 0,
    Nauryzbai: 0,
    Bostandyk: 0,
    Medeu: 0,
    Turksib: 0,
    Jetysu: 0,
  });
  const [simResults, setSimResults] = useState(null);
  const [routeOpen, setRouteOpen] = useState(false);
  const [routeProfile, setRouteProfile] = useState("Family weekend");
  const [activeRoute, setActiveRoute] = useState(null);
  const [routePhase, setRoutePhase] = useState(0);
  const [ambientPhase, setAmbientPhase] = useState(0);
  const [presentationMode, setPresentationMode] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [liteOverride, setLiteOverride] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState("en");
  // t("English text") → the chosen language, or English if not yet translated.
  const t = (s) => translate(lang, s);

  const intensityByDistrict = useMemo(() => {
    const out = {};
    Object.entries(districtContent).forEach(([k, v]) => {
      out[k] = v.tourismIntensity;
    });
    return out;
  }, []);
  const isLikelyMobileWebView = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    return /Android|iPhone|iPad|iPod|wv|Version\/\d+\.\d+.*Chrome/i.test(ua);
  }, []);
  const autoLiteMode = isSmallScreen || isLikelyMobileWebView;
  const liteMode = liteOverride === null ? autoLiteMode : liteOverride;

  useEffect(() => {
    let mounted = true;
    fetch("/almaty_districts.geojson")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setDistrictGeoJson(data);
        setGeoError("");
      })
      .catch(() => {
        if (!mounted) return;
        setGeoError("Could not load district boundaries");
      })
      .finally(() => {
        if (!mounted) return;
        setGeoLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    const onResize = () => setIsSmallScreen(window.innerWidth < 700);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const scoreKey = {
    Morning: "morning",
    Afternoon: "afternoon",
    Evening: "evening",
    Night: "evening",
  }[timeSlot];

  const selectedDistrictKey = selectedDistrict
    ? resolveDistrictKey(selectedDistrict)
    : null;
  const routeDefinitions = useMemo(
    () => ({
      "Family weekend": {
        routeName: "Family Leisure Arc",
        stops: ["Bostandyk", "Auezov", "Nauryzbai"],
        duration: "6-8 hours",
        bestTime: "Late morning to evening",
        why: "Builds western family circulation and tests polycentric demand outside the core.",
      },
      "Student/youth": {
        routeName: "Youth Culture Loop",
        stops: ["Bostandyk", "Almaly", "Medeu"],
        duration: "7 hours",
        bestTime: "Afternoon to night",
        why: "Connects youth hubs with central culture and mountain leisure.",
      },
      "Foreign visitor": {
        routeName: "First-Time Signature Route",
        stops: ["Airport", "Almaly", "Medeu", "Shymbulak"],
        duration: "1 full day",
        bestTime: "Morning arrival to sunset",
        why: "Converts first arrivals into high-value city + mountain exposure.",
      },
      "Transit visitor": {
        routeName: "Transit City Sampler",
        stops: ["Airport", "Almaly", "Green Bazaar", "Panfilov Park"],
        duration: "4-5 hours",
        bestTime: "Daytime layover",
        why: "Captures short layovers via low-friction food and heritage stops.",
      },
      "Eco tourist": {
        routeName: "Eco-Mountain Escape",
        stops: ["Nauryzbai", "Medeu", "Shymbulak"],
        duration: "8 hours",
        bestTime: "Morning to late afternoon",
        why: "Links eco-edge recreation with mountain assets and relieves center load.",
      },
      "Evening city visitor": {
        routeName: "Evening Light Route",
        stops: ["Almaly", "Arbat", "Kok-Tobe", "Medeu"],
        duration: "5-6 hours",
        bestTime: "After 17:00",
        why: "Strengthens evening economy corridors and scenic nightlife chain.",
      },
    }),
    []
  );
  const simTotal = useMemo(
    () => Object.values(simAlloc).reduce((a, b) => a + b, 0),
    [simAlloc]
  );
  const fundedStrength = useMemo(() => {
    if (!simRan || simTotal <= 0) return {};
    return Object.fromEntries(
      Object.entries(simAlloc).map(([k, v]) => [k, v / 100])
    );
  }, [simAlloc, simRan, simTotal]);

  const filteredPlaces = places.filter((place) => {
    const categoryMatch = selectedCategories.includes(place.category);
    const districtMatch = selectedDistrictKey
      ? place.district === selectedDistrictKey
      : true;
    return categoryMatch && districtMatch;
  });

  const districtLabelCenters = useMemo(() => {
    if (!districtGeoJson?.features) return [];
    return districtGeoJson.features
      .map((f) => {
        const name = f.properties?.name;
        const c = getFeatureCenter(f);
        if (!name || !c) return null;
        return { name, position: [c.lat, c.lng] };
      })
      .filter(Boolean);
  }, [districtGeoJson]);
  const districtCenterByKey = useMemo(
    () =>
      Object.fromEntries(
        districtLabelCenters.map((d) => [resolveDistrictKey(d.name), d.position])
      ),
    [districtLabelCenters]
  );
  const districtTextureMarkers = useMemo(() => {
    const out = [];
    Object.entries(districtCenterByKey).forEach(([district, center]) => {
      const icons = districtTextureIcons[district] || ["✨", "•"];
      const selected = selectedDistrictKey === district;
      const faded = Boolean(selectedDistrictKey && !selected);
      const spread = selected ? 0.02 : 0.014;
      const offsets = ambientOffsets(hashString(`texture-${district}`), Math.min(4, Math.max(2, icons.length)), spread);
      offsets.forEach((off, i) => {
        out.push({
          id: `texture-${district}-${i}`,
          district,
          icon: icons[i % icons.length],
          position: [center[0] + off[0], center[1] + off[1]],
          selected,
          faded,
          color: districtTheme[district]?.labelColor || "#475569",
        });
      });
    });
    return out;
  }, [districtCenterByKey, selectedDistrictKey]);
  const placeByName = useMemo(
    () => Object.fromEntries(places.map((p) => [p.name, p])),
    []
  );

  const ambientHotspots = useMemo(() => {
    if (!districtGeoJson?.features) return [];
    const out = [];
    const features = selectedDistrict
      ? districtGeoJson.features.filter((f) => f.properties?.name === selectedDistrict)
      : districtGeoJson.features;

    for (const f of features) {
      const districtName = f.properties?.name;
      const c = getFeatureCenter(f);
      if (!districtName || !c) continue;
      const intensity = intensityByDistrict[districtName] ?? 50;
      const seed = hashString(`${districtName}|ambient`);
      const count = selectedDistrict ? 8 : 4;
      const scale = selectedDistrict ? 0.009 + intensity / 15000 : 0.013 + intensity / 17000;
      const offsets = ambientOffsets(seed, count, scale);
      const t = districtTheme[districtName];
      offsets.forEach((off, idx) => {
        out.push({
          id: `${districtName}-amb-${idx}`,
          district: districtName,
          position: [c.lat + off[0], c.lng + off[1]],
          intensity,
          theme: t,
        });
      });
    }
    return out;
  }, [districtGeoJson, intensityByDistrict, selectedDistrict]);

  const storyRoutes = useMemo(() => {
    if (!selectedDistrictKey) return [];
    const c = districtLabelCenters.find(
      (d) => resolveDistrictKey(d.name) === selectedDistrictKey
    );
    const t = districtTheme[selectedDistrictKey];
    if (!c || !t) return [];
    const pts = places.filter((p) => p.district === selectedDistrictKey).slice(0, 3);
    return pts.map((p) => ({
      id: `${selectedDistrictKey}-route-${p.name}`,
      positions: [c.position, p.coordinates],
      color: t.glowColor,
    }));
  }, [districtLabelCenters, selectedDistrictKey]);

  const eventMarkers = useMemo(() => {
    if (!selectedDistrictKey) return [];
    const dc = districtContent[selectedDistrictKey];
    const center = districtLabelCenters.find(
      (d) => resolveDistrictKey(d.name) === selectedDistrictKey
    );
    const t = districtTheme[selectedDistrictKey];
    if (!dc?.events?.length || !center || !t) return [];
    return dc.events.map((ev, idx) => {
      const off = ambientOffsets(
        hashString(`${selectedDistrictKey}-ev-${ev.title}-${idx}`),
        1,
        0.015
      )[0];
      return {
        key: `${selectedDistrictKey}-evt-${idx}`,
        position: [center.position[0] + off[0], center.position[1] + off[1]],
        title: ev.title,
        color: t.glowColor,
      };
    });
  }, [districtLabelCenters, selectedDistrictKey]);

  const panelContent = selectedDistrictKey
    ? districtContent[selectedDistrictKey]
    : null;
  const panelTheme = selectedDistrictKey ? districtTheme[selectedDistrictKey] : null;
  const project = selectedDistrictKey
    ? innovationProjects[selectedDistrictKey]
    : null;

  const innovationCenters = useMemo(() => {
    return districtLabelCenters
      .map((d) => {
        const k = resolveDistrictKey(d.name);
        const p = innovationProjects[k];
        if (!p) return null;
        return {
          district: k,
          position: d.position,
          color: p.themeColor,
          projectName: p.projectName,
          projectType: p.projectType,
          visualMode: p.visualMode,
          project: p,
        };
      })
      .filter(Boolean);
  }, [districtLabelCenters]);

  const innovationRoutes = useMemo(() => {
    if (!layerState.innovation) return [];
    const c = Object.fromEntries(districtLabelCenters.map((d) => [d.name, d.position]));
    const routes = [];
    if (c.Turksib && c.Almaly && c.Medeu) {
      routes.push({
        id: "airport-center-medeu",
        label: "Airport -> Center -> Medeu",
        points: [c.Turksib, c.Almaly, c.Medeu],
        color: "#22c1dc",
      });
    }
    if (c.Alatau && c.Auezov && c.Nauryzbai) {
      routes.push({
        id: "west-polycenter",
        label: "West Polycenter Route",
        points: [c.Alatau, c.Auezov, c.Nauryzbai],
        color: "#f59e0b",
      });
    }
    if (c.Turksib && c.Jetysu && c.Almaly) {
      routes.push({
        id: "east-connector",
        label: "Eastern Gate Connector",
        points: [c.Turksib, c.Jetysu, c.Almaly],
        color: "#f43f5e",
      });
    }
    return routes;
  }, [districtLabelCenters, layerState.innovation]);
  const routeBoost = useMemo(() => {
    if (!simRan || simTotal <= 0) return {};
    return {
      "airport-center-medeu":
        (simAlloc.Turksib + simAlloc.Almaly + simAlloc.Medeu) / 100,
      "west-polycenter":
        (simAlloc.Alatau + simAlloc.Auezov + simAlloc.Nauryzbai) / 100,
      "east-connector":
        (simAlloc.Turksib + simAlloc.Jetysu + simAlloc.Almaly) / 100,
    };
  }, [simAlloc, simRan, simTotal]);
  const routeDistrictSet = useMemo(() => {
    if (!activeRoute?.districts?.length) return new Set();
    return new Set(activeRoute.districts);
  }, [activeRoute]);

  const movingRouteMarkers = useMemo(() => {
    if (!activeRoute?.points || activeRoute.points.length < 2) return [];
    const pts = activeRoute.points;
    const segmentLengths = [];
    let total = 0;
    for (let i = 0; i < pts.length - 1; i += 1) {
      const dx = pts[i + 1][0] - pts[i][0];
      const dy = pts[i + 1][1] - pts[i][1];
      const len = Math.sqrt(dx * dx + dy * dy);
      segmentLengths.push(len);
      total += len;
    }
    if (total <= 0) return [];
    const markers = [];
    const count = liteMode ? 2 : 4;
    for (let m = 0; m < count; m += 1) {
      const t = (routePhase + m / count) % 1;
      let dist = t * total;
      let idx = 0;
      while (idx < segmentLengths.length && dist > segmentLengths[idx]) {
        dist -= segmentLengths[idx];
        idx += 1;
      }
      if (idx >= segmentLengths.length) idx = segmentLengths.length - 1;
      const a = pts[idx];
      const b = pts[idx + 1];
      const segLen = segmentLengths[idx] || 1;
      const r = dist / segLen;
      markers.push([a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r]);
    }
    return markers;
  }, [activeRoute, liteMode, routePhase]);

  useEffect(() => {
    if (!activeRoute) return undefined;
    // lite mode steps the route in bigger, less frequent hops — same visual
    // drift, a third of the re-renders, so phones stay smooth.
    const step = liteMode ? 0.03 : 0.0125;
    const every = liteMode ? 220 : 80;
    const id = setInterval(() => setRoutePhase((p) => (p + step) % 1), every);
    return () => clearInterval(id);
  }, [activeRoute, liteMode]);

  useEffect(() => {
    // The ambient drift re-renders the whole map ~11x/sec. On mobile that's
    // the main source of jank and the motion is purely decorative — skip the
    // loop entirely in lite mode and let the markers rest in place.
    if (liteMode) return undefined;
    const id = setInterval(() => setAmbientPhase((p) => (p + 0.0045) % 1), 90);
    return () => clearInterval(id);
  }, [liteMode]);

  const ambientCityMarkers = useMemo(() => {
    const points = [];
    const strongAmbient = layerState.innovation || presentationMode;
    ambientPaths.forEach((path, pathIndex) => {
      const base = strongAmbient ? path.density + 1 : path.density;
      const perPath = liteMode ? Math.max(1, Math.round(base * 0.35)) : base;
      for (let i = 0; i < perPath; i += 1) {
        const phase = (ambientPhase + i / perPath + pathIndex * 0.073) % 1;
        const lat = path.from[0] + (path.to[0] - path.from[0]) * phase;
        const lng = path.from[1] + (path.to[1] - path.from[1]) * phase;
        points.push({
          id: `ambient-${pathIndex}-${i}`,
          position: [lat, lng],
          type: path.type,
          kind: path.kind,
        });
      }
    });
    return points;
  }, [ambientPhase, layerState.innovation, liteMode, presentationMode]);

  function resolveStop(stop) {
    if (placeByName[stop]) {
      const p = placeByName[stop];
      return { name: stop, point: p.coordinates, district: p.district };
    }
    if (stop === "Airport" && placeByName.Airport) {
      const p = placeByName.Airport;
      return { name: "Airport/Turksib", point: p.coordinates, district: p.district };
    }
    if (districtCenterByKey[stop]) {
      return { name: stop, point: districtCenterByKey[stop], district: stop };
    }
    return null;
  }

  function buildRoute() {
    const def = routeDefinitions[routeProfile];
    if (!def) return;
    const resolved = def.stops.map(resolveStop).filter(Boolean);
    if (resolved.length < 2) return;
    const districts = [...new Set(resolved.map((s) => s.district).filter(Boolean))];
    const innovationLinked = districts
      .filter((d) => innovationProjects[d])
      .map((d) => innovationProjects[d].projectName);
    setActiveRoute({
      profile: routeProfile,
      routeName: def.routeName,
      stops: resolved.map((s) => s.name),
      points: resolved.map((s) => s.point),
      duration: def.duration,
      bestTime: def.bestTime,
      districts,
      innovationLinked,
      why: def.why,
    });
    setRoutePhase(0);
    setRouteOpen(false);
  }

  useEffect(() => {
    if (!presentationMode) return;
    setLayerState((prev) => ({ ...prev, innovation: true }));
    if (!activeRoute) {
      setActiveRoute({
        profile: "Presentation route",
        routeName: "Airport -> Almaly -> Medeu",
        stops: ["Airport/Turksib", "Almaly", "Medeu"],
        points: [
          placeByName.Airport?.coordinates || [43.3521, 77.0405],
          districtCenterByKey.Almaly || [43.2515, 76.9455],
          districtCenterByKey.Medeu || [43.2338, 76.9767],
        ],
        duration: "4-6 hours",
        bestTime: "Day to evening",
        districts: ["Turksib", "Almaly", "Medeu"],
        innovationLinked: [
          innovationProjects.Turksib?.projectName,
          innovationProjects.Almaly?.projectName,
          innovationProjects.Medeu?.projectName,
        ].filter(Boolean),
        why: "Default corridor for demonstrating gateway-to-center-to-mountain innovation flow.",
      });
      setRoutePhase(0);
    }
  }, [activeRoute, districtCenterByKey.Almaly, districtCenterByKey.Medeu, placeByName.Airport?.coordinates, presentationMode]);

  function runBudgetScenario() {
    const west = simAlloc.Alatau + simAlloc.Auezov + simAlloc.Nauryzbai;
    const center = simAlloc.Almaly + simAlloc.Medeu + simAlloc.Bostandyk;
    const transit = simAlloc.Turksib + simAlloc.Jetysu;
    const values = Object.values(simAlloc);
    const mean = simTotal / 8;
    const variance =
      values.reduce((s, x) => s + (x - mean) * (x - mean), 0) / 8;
    const balanceRaw = Math.max(0, 100 - variance * 0.95);
    const flowBalance = Math.min(100, Math.round(balanceRaw));
    const centerReduction = Math.min(
      100,
      Math.round(west * 0.62 + transit * 0.16)
    );
    const avgStayGrowth = Math.min(
      100,
      Math.round((simAlloc.Almaly * 0.45 + simAlloc.Medeu * 0.58 + simAlloc.Bostandyk * 0.22) * 0.95)
    );
    const smePotential = Math.min(
      100,
      Math.round((west * 0.36 + center * 0.41 + transit * 0.28) * 0.88)
    );
    const innovationIndex = Math.min(
      100,
      Math.round(flowBalance * 0.28 + centerReduction * 0.18 + avgStayGrowth * 0.24 + smePotential * 0.3)
    );
    setSimResults({
      flowBalance,
      centerReduction,
      avgStayGrowth,
      smePotential,
      innovationIndex,
    });
    setSimRan(true);
  }

  function onDistrictEachFeature(feature, layer) {
    const districtName = feature.properties?.name;
    layer.on({
      click: () => setSelectedDistrict(districtName),
      mouseover: () => {
        const t = districtTheme[districtName];
        if (!t) return;
        layer.setStyle({
          fillOpacity: selectedDistrict === districtName ? 0.34 : 0.16,
        });
      },
      mouseout: () =>
        layer.setStyle(districtStyle(feature, selectedDistrict, fundedStrength, routeDistrictSet)),
    });
  }

  return (
    <main className={`app-shell ${liteMode ? "mobile-lite" : ""} time-${timeSlot.toLowerCase()} relative h-screen w-screen overflow-hidden bg-soft`}>
      <MapContainer
        center={almatyCenter}
        zoom={10}
        minZoom={9}
        maxZoom={16}
        zoomControl
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />

        {districtGeoJson?.features && (
          <Pane name="districts" style={{ zIndex: 410 }}>
            <GeoJSON
              data={districtGeoJson}
              style={(feature) =>
                districtStyle(feature, selectedDistrict, fundedStrength, routeDistrictSet, liteMode)
              }
              onEachFeature={onDistrictEachFeature}
            />
          </Pane>
        )}

        <Pane name="ambient" style={{ zIndex: 415 }}>
          {ambientHotspots.map((hot) => {
            const t = hot.theme;
            const glow = t?.glowColor ?? "#94a3b8";
            const isCurrentCore = CURRENT_CORE_DISTRICTS.has(resolveDistrictKey(hot.district));
            return (
              <CircleMarker
                key={hot.id}
                center={hot.position}
                radius={
                  scenarioModel === "current"
                    ? isCurrentCore
                      ? Math.max(6, hot.intensity / 17)
                      : Math.max(3, hot.intensity / 33)
                    : selectedDistrict
                    ? Math.max(6, hot.intensity / 15)
                    : Math.max(4, hot.intensity / 24)
                }
                pathOptions={{
                  className: layerState.innovation
                    ? "innovation-halo-pulse"
                    : selectedDistrict
                    ? "pulse-ring"
                    : "ambient-soft",
                  color: layerState.innovation ? hot.theme.color : glow,
                  fillColor: layerState.innovation ? hot.theme.glowColor : glow,
                  weight: selectedDistrict ? 1 : 0,
                  fillOpacity:
                    scenarioModel === "current"
                      ? isCurrentCore
                        ? 0.26
                        : 0.06
                      : layerState.innovation
                      ? 0.3
                      : selectedDistrict
                      ? 0.2
                      : 0.12,
                  opacity:
                    scenarioModel === "current"
                      ? isCurrentCore
                        ? 0.56
                        : 0.16
                      : layerState.innovation
                      ? 0.62
                      : selectedDistrict
                      ? 0.48
                      : 0.28,
                }}
              />
            );
          })}
        </Pane>

        {layerState.movement && (
          <Pane name="story-routes" style={{ zIndex: 418 }}>
            {storyRoutes.map((r) => (
              <Polyline
                key={r.id}
                positions={r.positions}
                pathOptions={{
                  className: "story-arc",
                  color:
                    timeSlot === "Evening"
                      ? "#f59e0b"
                      : timeSlot === "Night"
                      ? "#67e8f9"
                      : r.color,
                  weight: liteMode ? 1.2 : layerState.innovation ? 1.9 : 1.4,
                  opacity: liteMode ? 0.2 : layerState.innovation ? 0.44 : 0.28,
                }}
              />
            ))}
            {layerState.innovation &&
              innovationRoutes.map((r) => (
                <Polyline
                  key={r.id}
                  positions={r.points}
                  pathOptions={{
                    className: "innovation-route",
                    color:
                      timeSlot === "Evening"
                        ? "#fb923c"
                        : timeSlot === "Night"
                        ? "#22d3ee"
                        : r.color,
                    weight: liteMode ? 1.5 : 2.4,
                    opacity:
                      (liteMode ? 0.18 : scenarioModel === "innovation" ? 0.56 : 0.2) +
                      Math.min(0.24, (routeBoost[r.id] || 0) * 0.22),
                  }}
                >
                  <Tooltip direction="top" opacity={0.9}>
                    {r.label}
                  </Tooltip>
                </Polyline>
              ))}
          </Pane>
        )}

        <Pane name="ambient-city-life" style={{ zIndex: 420 }}>
          {/* district icons now show in lite mode too — kept static (no float
              loop) via CSS so mobile gains the detail without the animation cost */}
          {(
            <Pane name="district-textures" style={{ zIndex: 421 }}>
            {districtTextureMarkers.map((m, idx) => {
              const icon = L.divIcon({
                className: "district-texture-anchor",
                html: `<div class="district-texture-icon ${m.selected ? "district-texture-icon--selected" : ""} ${m.faded ? "district-texture-icon--faded" : ""}" style="--texture-color:${m.color};--texture-delay:${(idx % 6) * 120}ms">${m.icon}</div>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9],
              });
              return (
                <Marker
                  key={m.id}
                  position={m.position}
                  icon={icon}
                  interactive={false}
                />
              );
            })}
            </Pane>
          )}
          {!liteMode && [
            { district: "Almaly", pos: districtCenterByKey.Almaly },
            { district: "Medeu", pos: districtCenterByKey.Medeu },
            { district: "Bostandyk", pos: districtCenterByKey.Bostandyk },
            { district: "Turksib", pos: districtCenterByKey.Turksib },
            { district: "Alatau", pos: districtCenterByKey.Alatau },
          ]
            .filter((h) => h.pos)
            .map((h) => (
              <CircleMarker
                key={`ambient-hotspot-${h.district}`}
                center={h.pos}
                radius={
                  layerState.innovation || presentationMode ? 22 : 17
                }
                pathOptions={{
                  className: "ambient-hotspot-pulse",
                  color: "#64748b",
                  fillColor: "#94a3b8",
                  weight: 0.8,
                  fillOpacity:
                    layerState.innovation || presentationMode ? 0.14 : 0.08,
                  opacity:
                    layerState.innovation || presentationMode ? 0.34 : 0.2,
                }}
              />
            ))}
          {ambientCityMarkers.map((m) => {
            const style = ambientTypeStyle[m.type] || ambientTypeStyle.walking;
            const strong = layerState.innovation || presentationMode;
            const icon = L.divIcon({
              className: "ambient-city-anchor",
              html: `<div class="ambient-city-dot ambient-city-dot--${m.kind || "dot"} ${strong ? "ambient-city-dot--strong" : ""}" style="--ambient-color:${style.color}">${style.icon}</div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            });
            return <Marker key={m.id} position={m.position} icon={icon} interactive={false} />;
          })}
        </Pane>

        {activeRoute?.points?.length > 1 && (
          <Pane name="generated-route" style={{ zIndex: 419 }}>
            <Polyline
              positions={activeRoute.points}
              pathOptions={{
                className: "generated-route-line",
                color:
                  timeSlot === "Evening"
                    ? "#ea580c"
                    : timeSlot === "Night"
                    ? "#38bdf8"
                    : "#0f172a",
                weight: liteMode ? 2 : 3,
                opacity: liteMode ? 0.5 : 0.72,
              }}
            />
            {activeRoute.points.map((pt, i) => (
              <CircleMarker
                key={`route-stop-${i}`}
                center={pt}
                radius={8}
                pathOptions={{
                  className: "generated-route-stop",
                  color: "#0f172a",
                  fillColor: "#ffffff",
                  weight: 2,
                  fillOpacity: 0.95,
                  opacity: 0.9,
                }}
              />
            ))}
            {movingRouteMarkers.map((pt, i) => (
              <CircleMarker
                key={`route-moving-${i}`}
                center={pt}
                radius={5}
                pathOptions={{
                  className: "moving-tourist-dot",
                  color: "#1d4ed8",
                  fillColor: "#3b82f6",
                  fillOpacity: liteMode ? 0.72 : 0.9,
                  weight: 1.4,
                  opacity: liteMode ? 0.8 : 0.95,
                }}
              />
            ))}
            <RouteAutoFocus routePoints={activeRoute.points} />
          </Pane>
        )}

        {layerState.places && (
          <Pane name="intensity" style={{ zIndex: 425 }}>
            {filteredPlaces.map((place) => {
              const inFocus = !selectedDistrict || place.district === selectedDistrict;
              const currentCore = CURRENT_CORE_DISTRICTS.has(place.district);
              return (
                <CircleMarker
                  key={`heat-${place.name}`}
                  center={place.coordinates}
                  radius={Math.max(8, place[scoreKey] / (selectedDistrict ? 7.4 : 9.2))}
                  pathOptions={{
                    className: "pulse-ring",
                    fillColor: categoryColors[place.category],
                    color: categoryColors[place.category],
                    fillOpacity:
                      scenarioModel === "current"
                        ? currentCore
                          ? 0.14
                          : 0.03
                        : inFocus
                        ? selectedDistrict
                          ? 0.17
                          : 0.08
                        : 0.03,
                    opacity:
                      scenarioModel === "current"
                        ? currentCore
                          ? 0.18
                          : 0.05
                        : inFocus
                        ? selectedDistrict
                          ? 0.22
                          : 0.12
                        : 0.06,
                    weight: inFocus ? 1 : 0,
                  }}
                />
              );
            })}
          </Pane>
        )}

        <Pane name="district-labels" style={{ zIndex: 442 }}>
          {districtLabelCenters.map(({ name, position }) => (
            <DistrictLabel
              key={name}
              name={name}
              tag={districtContent[resolveDistrictKey(name)]?.tag}
              position={position}
              selected={resolveDistrictKey(name) === selectedDistrictKey}
              dim={Boolean(selectedDistrictKey && resolveDistrictKey(name) !== selectedDistrictKey)}
              theme={districtTheme[resolveDistrictKey(name)]}
            />
          ))}
        </Pane>

        {layerState.innovation && (
          <Pane name="innovation-nodes" style={{ zIndex: 446 }}>
            {innovationCenters.map((n) => {
              const focused = !selectedDistrict || n.district === selectedDistrict;
              return (
                <CircleMarker
                  key={`innovation-${n.district}`}
                  center={n.position}
                  radius={focused ? 13 : 8}
                  pathOptions={{
                    className: "innovation-node-pulse",
                    color: n.color,
                    fillColor: n.color,
                    weight: focused ? 2.4 : 1.4,
                    fillOpacity:
                      (focused ? 0.72 : 0.3) +
                      Math.min(0.18, (fundedStrength[n.district] || 0) * 0.2),
                    opacity: focused ? 1 : 0.62,
                  }}
                >
                  <Tooltip direction="top" opacity={0.9}>
                    <span>{n.projectName}</span>
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </Pane>
        )}

        {layerState.innovation && (
          <Pane name="innovation-badges" style={{ zIndex: 447 }}>
            {innovationCenters.map((n, idx) => (
              <InnovationBadgeMarker
                key={`innovation-badge-${n.district}`}
                district={n.district}
                position={n.position}
                project={n.project}
                isSelected={selectedDistrictKey === n.district}
                index={idx}
                onSelect={(district) => setSelectedDistrict(district)}
                dimmed={scenarioModel === "current" || liteMode}
                intensity={fundedStrength[n.district] || 0}
              />
            ))}
          </Pane>
        )}

        <Pane name="event-markers" style={{ zIndex: 445 }}>
          {layerState.events &&
            eventMarkers.map((ev) => (
            <CircleMarker
              key={ev.key}
              center={ev.position}
              radius={9}
              pathOptions={{
                className: "event-marker-pulse",
                color: ev.color,
                fillColor: ev.color,
                weight: 1.4,
                fillOpacity: 0.35,
                opacity: 0.85,
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.92} permanent={false}>
                {ev.title}
              </Tooltip>
            </CircleMarker>
            ))}
        </Pane>

        {layerState.places && (
          <Pane name="markers" style={{ zIndex: 448 }}>
          {filteredPlaces.map((place) => {
            const inFocus = !selectedDistrict || place.district === selectedDistrict;
            const currentCore = CURRENT_CORE_DISTRICTS.has(place.district);
            return (
              <PlaceIconMarker
                key={place.name}
                place={place}
                inFocus={scenarioModel === "current" ? currentCore : inFocus}
                selected={Boolean(selectedDistrict && inFocus)}
                categoryColor={categoryColors[place.category] || "#64748b"}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={0.94}>
                  {place.name}
                </Tooltip>
                <Popup className="place-popup" minWidth={250}>
                  <article className="space-y-2">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="h-32 w-full rounded-xl object-cover"
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-full bg-slate-100 px-2 py-1 font-medium">
                        {place.category}
                      </span>
                      <span className="text-slate-500">{place.district}</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{place.name}</h3>
                    <p className="text-sm text-slate-600">{place.description}</p>
                  </article>
                </Popup>
              </PlaceIconMarker>
            );
          })}
          </Pane>
        )}

        <MapAutoFocus
          selectedDistrict={selectedDistrict}
          districtGeoJson={districtGeoJson}
        />
      </MapContainer>

      <section className="pointer-events-none absolute left-6 top-6 z-[900] max-w-xl space-y-3">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium shadow-float backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-accent" />
            {t("Almaty Tourism Map")}
          </div>
          {/* EN / РУС / ҚАЗ — switches every UI label live */}
          <div className="inline-flex rounded-full bg-white/80 p-1 shadow-float backdrop-blur">
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLang(l.id)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                  lang === l.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pointer-events-auto rounded-2xl bg-white/76 p-2.5 shadow-float backdrop-blur">
          <div className="mb-2 flex flex-wrap gap-2">
            {[
              { id: "places", label: "Places" },
              { id: "events", label: "Events" },
              { id: "innovation", label: "Innovation Layer" },
              { id: "movement", label: "Movement" },
            ].map((layer) => {
              const active = layerState[layer.id];
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() =>
                    setLayerState((prev) => ({ ...prev, [layer.id]: !prev[layer.id] }))
                  }
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t(layer.label)}
                </button>
              );
            })}
          </div>
          <div className="mb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setLiteOverride((prev) => (prev === null ? !autoLiteMode : !prev))
              }
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                liteMode ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {t("Lite mode")} {liteMode ? t("ON") : t("OFF")}
            </button>
            {liteMode && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700"
              >
                {mobileMenuOpen ? t("Hide menu") : t("Show menu")}
              </button>
            )}
          </div>
          {!presentationMode && (!liteMode || mobileMenuOpen) && (
            <div className="mb-2 inline-flex rounded-full bg-slate-100 p-1">
            {[
              { id: "current", label: "Current Model" },
              { id: "innovation", label: "Innovation Model" },
            ].map((m) => {
              const active = scenarioModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setScenarioModel(m.id)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    active
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {t(m.label)}
                </button>
              );
            })}
            </div>
          )}
          <div className="mb-2">
            {!presentationMode && (
              <button
              type="button"
              onClick={() => setSimOpen(true)}
              className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:opacity-90"
            >
              {t("Budget Simulator")}
              </button>
            )}
            {!presentationMode && (
              <button
              type="button"
              onClick={() => setRouteOpen(true)}
              className="ml-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              {t("Generate Route")}
              </button>
            )}
            {!presentationMode && activeRoute && (
              <button
                type="button"
                onClick={() => setActiveRoute(null)}
                className="ml-2 rounded-full bg-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-300"
              >
                {t("Clear route")}
              </button>
            )}
            <button
              type="button"
              onClick={() => setPresentationMode((v) => !v)}
              className="ml-2 rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-indigo-500"
            >
              {presentationMode ? t("Exit Presentation") : t("Presentation Mode")}
            </button>
            <button
              type="button"
              onClick={() => setResearchOpen(true)}
              className="ml-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              {t("Research basis")}
            </button>
            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className="ml-2 rounded-full bg-transparent px-3 py-1.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200/70 transition hover:bg-white/70 hover:text-slate-700"
            >
              {t("Demo Script")}
            </button>
          </div>
          {!presentationMode && (!liteMode || mobileMenuOpen) && (
            <div className="mb-2 flex flex-wrap gap-2">
            {categoryChips.map((chip) => {
              const active = selectedCategories.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() =>
                    setSelectedCategories((prev) =>
                      active ? prev.filter((c) => c !== chip) : [...prev, chip]
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
            </div>
          )}
          {!presentationMode && (!liteMode || mobileMenuOpen) && (
            <div className="flex gap-2">
            {["Morning", "Afternoon", "Evening", "Night"].map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTimeSlot(slot)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  timeSlot === slot
                    ? "bg-accent text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t(slot)}
              </button>
            ))}
            </div>
          )}
        </div>
      </section>

      {presentationMode && (
        <>
          <section className="pointer-events-none absolute left-1/2 top-6 z-[912] w-[min(760px,92vw)] -translate-x-1/2 rounded-3xl bg-white/86 px-6 py-4 text-center shadow-float backdrop-blur">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              {t("Innovation Map of Almaty Tourism")}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {t("PhD prototype for smart tourism, polycentric development and visitor movement")}
            </p>
          </section>
          <section className="pointer-events-none absolute right-6 top-24 z-[912] w-[min(420px,90vw)] rounded-2xl bg-white/86 p-4 text-sm leading-relaxed text-slate-600 shadow-float backdrop-blur">
            The model visualizes how district-level tourism innovations can redistribute visitor
            flows, reduce pressure on the center, and support smart-destination development.
          </section>
        </>
      )}

      {geoLoading && (
        <section className="pointer-events-none absolute right-6 top-6 z-[900] rounded-2xl bg-white/88 px-4 py-3 text-sm text-slate-700 shadow-float backdrop-blur">
          {t("Loading Almaty district map...")}
        </section>
      )}
      {!!geoError && (
        <section className="pointer-events-none absolute right-6 top-6 z-[900] rounded-2xl bg-rose-50/95 px-4 py-3 text-sm text-rose-700 shadow-float backdrop-blur">
          {t("Could not load district boundaries")}
        </section>
      )}

      {selectedDistrict && panelContent && panelTheme && (
        <div className="pointer-events-none absolute left-1/2 top-[6.75rem] z-[905] w-[min(560px,90vw)] -translate-x-1/2 text-center">
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-full bg-white/80 px-4 py-2 text-xs font-normal leading-snug shadow-float backdrop-blur"
            style={{ color: panelTheme.labelColor }}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t("Movement story")} ·{" "}
            </span>
            <span style={{ borderBottom: `1px solid ${panelTheme.glowColor}66` }}>
              {panelContent.movementStory}
            </span>
          </motion.p>
        </div>
      )}

      {layerState.innovation && (
        <section className="pointer-events-none absolute right-6 top-24 z-[905] w-[min(360px,88vw)] rounded-2xl bg-white/86 p-4 shadow-float backdrop-blur">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            {t("Smart Tourism System")}
          </p>
          <div className="flex flex-wrap gap-2">
            {smartTourismSystem.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200/70 bg-slate-50/90 px-2.5 py-1 text-[10px] text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            This layer visualizes proposed innovation projects from the PhD research model.
            The data is prototype-based and should be validated with ticketing, telecom,
            transport, camera, transaction, and CRM data.
          </p>
        </section>
      )}

      <section className="pointer-events-none absolute right-6 bottom-6 z-[905] w-[min(420px,88vw)] rounded-2xl bg-white/82 px-4 py-3 text-[12px] text-slate-600 shadow-float backdrop-blur">
        {scenarioModel === "current"
          ? t("Current model: tourism is concentrated in the historical center and mountain corridor.")
          : t("Innovation model: district-level projects redistribute flows and create a polycentric smart tourism system.")}
      </section>

      {!selectedDistrict && (
        <section className="pointer-events-none absolute bottom-7 left-1/2 z-[900] max-w-md -translate-x-1/2 rounded-2xl bg-white/76 px-5 py-2.5 text-center text-[13px] leading-relaxed text-slate-600 shadow-float backdrop-blur">
          {t("Choose a district to reveal attractions, events, and visitor movement.")}
        </section>
      )}

      {activeRoute && (
        <section className="pointer-events-none absolute right-6 bottom-28 z-[906] w-[min(420px,90vw)] rounded-2xl bg-white/90 p-4 shadow-float backdrop-blur">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{t("Generated Route")}</p>
          <h4 className="mt-1 text-base font-semibold text-slate-900">{activeRoute.routeName}</h4>
          <p className="text-xs text-slate-500">{activeRoute.profile}</p>
          <p className="mt-2 text-sm text-slate-700">
            <span className="font-medium">{t("Stops:")}</span> {activeRoute.stops.join(" -> ")}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div><span className="font-medium">{t("Duration:")}</span> {activeRoute.duration}</div>
            <div><span className="font-medium">{t("Best time:")}</span> {activeRoute.bestTime}</div>
            <div className="col-span-2">
              <span className="font-medium">{t("Districts:")}</span> {activeRoute.districts.join(", ")}
            </div>
            <div className="col-span-2">
              <span className="font-medium">{t("Innovation projects:")}</span>{" "}
              {activeRoute.innovationLinked.length
                ? activeRoute.innovationLinked.join("; ")
                : t("No direct project mapping")}
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{activeRoute.why}</p>
        </section>
      )}

      <AnimatePresence>
        {demoOpen && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute bottom-4 left-1/2 z-[923] w-[min(680px,94vw)] -translate-x-1/2 rounded-3xl bg-white/[0.96] p-5 shadow-float backdrop-blur"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">{t("Demo Script (90 seconds)")}</h3>
              <button
                type="button"
                onClick={() => setDemoOpen(false)}
                className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {t("Close")}
              </button>
            </div>
            <ol className="space-y-2 pl-4 text-sm leading-relaxed text-slate-600 list-decimal">
              <li>
                Start with <span className="font-medium">Presentation Mode</span> and state that this is a PhD prototype for
                polycentric smart-tourism planning in Almaty.
              </li>
              <li>
                Turn on <span className="font-medium">Innovation Layer</span> and point to district project badges to explain
                district-level innovation logic.
              </li>
              <li>
                Switch <span className="font-medium">Current vs Innovation model</span> to show how flows move from core concentration
                toward west/east polycentric corridors.
              </li>
              <li>
                Click one district and summarize project details, expected effects, target segments, and KPIs from the panel.
              </li>
              <li>
                Open <span className="font-medium">Generate Route</span>, build one profile route, and show animated movement markers as
                scenario storytelling.
              </li>
              <li>
                End with <span className="font-medium">Budget Simulator</span> to demonstrate policy trade-offs and modeled indicator shifts.
              </li>
            </ol>
          </motion.section>
        )}
        {researchOpen && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute bottom-4 left-1/2 z-[922] w-[min(700px,94vw)] -translate-x-1/2 rounded-3xl bg-white/[0.96] p-5 shadow-float backdrop-blur"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">{t("Research basis")}</h3>
              <button
                type="button"
                onClick={() => setResearchOpen(false)}
                className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {t("Close")}
              </button>
            </div>
            <div className="space-y-2 text-sm leading-relaxed text-slate-600">
              <p>
                This interface is a PhD research prototype focused on district-level tourism
                innovation in Almaty.
              </p>
              <p>
                The Innovation Layer visualizes proposed innovation projects by district and their
                potential influence on visitor movement and destination structure.
              </p>
              <p>
                Current indicators in the interface are modeled prototype values rather than
                officially validated operational metrics.
              </p>
              <p>
                Real validation would require integrated data pipelines from ticketing, telecom,
                public transport, camera systems, transactions, event calendars, and CRM.
              </p>
              <p>
                The purpose is to demonstrate a smart-tourism decision-support model for
                polycentric development and more balanced citywide tourism flows.
              </p>
            </div>
          </motion.section>
        )}
        {routeOpen && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-auto absolute bottom-4 left-1/2 z-[921] w-[min(560px,94vw)] -translate-x-1/2 rounded-3xl bg-white/[0.95] p-4 shadow-float backdrop-blur"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">{t("Generate Route")}</h3>
              <button
                type="button"
                onClick={() => setRouteOpen(false)}
                className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {t("Close")}
              </button>
            </div>
            <select
              value={routeProfile}
              onChange={(e) => setRouteProfile(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              {Object.keys(routeDefinitions).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={buildRoute}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                {t("Build route")}
              </button>
              <span className="text-xs text-slate-500">{t("Profile-based itinerary prototype")}</span>
            </div>
          </motion.section>
        )}
        {simOpen && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.24 }}
            className="pointer-events-auto absolute bottom-4 left-1/2 z-[920] max-h-[min(80vh,calc(100vh-120px))] w-[min(980px,95vw)] -translate-x-1/2 overflow-y-auto rounded-3xl bg-white/[0.95] p-5 shadow-float backdrop-blur"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{t("Plan the City Budget")}</h3>
              <button
                type="button"
                onClick={() => setSimOpen(false)}
                className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {t("Close")}
              </button>
            </div>
            <p className="mb-3 text-sm text-slate-600">{t("Allocate 100 innovation points across district projects.")}</p>
            <div className="mb-3 text-xs font-semibold text-slate-700">
              {t("Total allocated:")} {simTotal}/100
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Almaly", "Almaly Drone Nights"],
                ["Alatau", "Alatau Boraldai Archaeopark / AgroHub"],
                ["Auezov", "Auezov Oyna Land"],
                ["Nauryzbai", "Nauryzbai Eco Recreation"],
                ["Bostandyk", "Bostandyk Dino-STEM Park"],
                ["Medeu", "Medeu Ethnoaul + Asia Dauysy"],
                ["Turksib", "Turksib Eastern Gate"],
                ["Jetysu", "Jetysu Market & Mobility Connector"],
              ].map(([k, label]) => {
                const remaining = 100 - (simTotal - simAlloc[k]);
                return (
                  <div key={k} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-3">
                    <div className="mb-1 text-xs font-semibold text-slate-700">{label}</div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, remaining)}
                      value={simAlloc[k]}
                      onChange={(e) =>
                        setSimAlloc((prev) => ({ ...prev, [k]: Number(e.target.value) }))
                      }
                      className="w-full"
                    />
                    <div className="text-xs text-slate-500">{simAlloc[k]} {t("pts")}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={runBudgetScenario}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                {t("Run Scenario")}
              </button>
              <span className="text-xs text-slate-500">{t("Prototype scoring model")}</span>
            </div>

            {simResults && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ["Tourist flow balance", simResults.flowBalance],
                  ["Center overload reduction", simResults.centerReduction],
                  ["Average stay growth", simResults.avgStayGrowth],
                  ["SME revenue potential", simResults.smePotential],
                  ["Innovation index", simResults.innovationIndex],
                ].map(([name, value]) => (
                  <div key={name} className="rounded-2xl border border-slate-200/70 bg-white p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{t(name)}</div>
                    <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.45 }}
                        className="h-1.5 rounded-full bg-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
              Prototype simulation: results are modeled indicators for research demonstration and require validation with ticketing, telecom, transport, transaction, and CRM data.
            </p>
          </motion.section>
        )}
        {selectedDistrict && panelContent && panelTheme && (
          <motion.section
            initial={{ y: 64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 64, opacity: 0 }}
            transition={{ duration: 0.34, ease: "easeOut" }}
            className="pointer-events-auto absolute bottom-6 left-1/2 z-[910] max-h-[min(78vh,calc(100vh-148px))] w-[min(960px,94vw)] -translate-x-1/2 overflow-y-auto rounded-3xl bg-white/[0.93] px-5 py-6 shadow-float backdrop-blur"
            style={{
              borderLeft: `6px solid ${panelTheme.color}`,
              boxShadow: `0 -8px 40px ${panelTheme.glowColor}18`,
            }}
          >
            <header className="mb-5 flex flex-col gap-2 border-b border-slate-200/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{t("District")}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {panelContent.name}
                  </h2>
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-sm"
                    style={{
                      background: panelTheme.softColor,
                      color: panelTheme.labelColor,
                      border: `1px solid ${panelTheme.color}33`,
                    }}
                  >
                    {panelContent.tag}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{panelTheme.categoryMood}</p>
              </div>
              <div className="flex flex-col items-start gap-1 sm:items-end">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {t("Tourism intensity")}
                </p>
                <p className="text-3xl font-semibold tracking-tight" style={{ color: panelTheme.color }}>
                  {panelContent.tourismIntensity}
                  <span className="ml-2 text-xs font-normal text-slate-500">{t("index")}</span>
                </p>
              </div>
            </header>

            <p className="mb-6 text-sm leading-relaxed text-slate-600">{panelContent.description}</p>

            {layerState.innovation && project && (
              <div
                className="mb-6 rounded-2xl border p-4"
                style={{
                  borderColor: `${project.themeColor}55`,
                  background: `${project.themeColor}12`,
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ background: `${project.themeColor}22`, color: project.themeColor }}
                  >
                    {t("PhD Innovation Layer")}
                  </span>
                  {project.badges.map((b) => (
                    <span
                      key={b}
                      className="rounded-full border border-slate-200/70 bg-white/80 px-2.5 py-1 text-[10px] text-slate-600"
                    >
                      {b}
                    </span>
                  ))}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{project.projectName}</h3>
                <p className="text-xs uppercase tracking-wide text-slate-500">{project.projectType}</p>
                <p className="mt-2 text-sm text-slate-700">{project.description}</p>
                <p className="mt-2 text-sm text-slate-700">
                  <span className="font-semibold">{t("Why it matters:")}</span> {project.whyItMatters}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <InsightCard eyebrow={t("Expected effects")}>
                    <ul className="list-disc pl-4">
                      {project.expectedEffects.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </InsightCard>
                  <InsightCard eyebrow={t("Target segments")}>
                    <ul className="list-disc pl-4">
                      {project.targetSegments.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </InsightCard>
                  <InsightCard eyebrow={t("KPIs")}>
                    <ul className="list-disc pl-4">
                      {project.kpis.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </InsightCard>
                  <InsightCard eyebrow={t("Innovation tools")}>
                    <ul className="list-disc pl-4">
                      {project.innovationTools.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </InsightCard>
                </div>
                <InsightCard eyebrow={t("Movement impact")} title="">
                  {project.movementImpact}
                </InsightCard>
              </div>
            )}

            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {panelContent.topAttractions.map((a) => (
                <InsightCard key={a.title} eyebrow={a.category} title={a.title}>
                  {a.blurb}
                </InsightCard>
              ))}
            </div>

            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t("Events this season")}
            </h3>
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              {panelContent.events.map((ev) => (
                <div
                  key={ev.title}
                  className="rounded-2xl border border-slate-200/60 bg-white/85 p-3"
                  style={{ boxShadow: `0 10px 24px ${panelTheme.glowColor}14` }}
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{
                        background: panelTheme.softColor,
                        color: panelTheme.labelColor,
                      }}
                    >
                      {ev.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{ev.visitors}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{ev.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{ev.blurb}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <section>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {t("Entertainment & culture")}
                </h3>
                <div className="space-y-2">
                  {panelContent.entertainment.map((item) => (
                    <InsightCard key={item.title} eyebrow={item.category} eyebrowMuted title={item.title}>
                      {item.blurb}
                    </InsightCard>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {t("Food & shopping lanes")}
                </h3>
                <div className="space-y-2">
                  {panelContent.foodShopping.map((item) => (
                    <InsightCard key={item.title} eyebrow={item.category} eyebrowMuted title={item.title}>
                      {item.blurb}
                    </InsightCard>
                  ))}
                </div>
              </section>
              <section className="space-y-4">
                <InsightCard eyebrow={t("Tourist movement insight")} eyebrowMuted={false}>
                  {panelContent.movementInsight}
                </InsightCard>
                <InsightCard eyebrow={t("Innovation opportunity")} eyebrowMuted>
                  {panelContent.innovationOpportunity}
                </InsightCard>
              </section>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDistrict(null)}
              className="mt-6 rounded-full px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:brightness-105"
              style={{ backgroundColor: panelTheme.color }}
            >
              {t("Back to city view")}
            </button>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
