"""ALMATY SMART DMO TERMINAL - PhD tourism movement prototype."""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st


st.set_page_config(
    page_title="ALMATY · TOURISM MOVEMENT LAB",
    page_icon="◤",
    layout="wide",
    initial_sidebar_state="expanded",
)

ALMATY_DISTRICTS = [
    "Alatau",
    "Almaly",
    "Auezov",
    "Bostandyk",
    "Jetysu",
    "Medeu",
    "Nauryzbai",
    "Turksib",
]
DISTRICT_INDEX = {d: i for i, d in enumerate(ALMATY_DISTRICTS)}
GEOJSON_PATH = Path(__file__).parent / "almaty_districts.geojson"

PRESSURE_METRICS = [
    "tourist_arrivals",
    "overnight_stays",
    "avg_spend_usd",
    "tourism_pressure_index",
    "sustainability_score",
]
GOOD_VARS = {"avg_spend_usd", "sustainability_score"}
PREDICTOR_POOL = [
    "hotel_occupancy_rate",
    "event_intensity",
    "transport_access_score",
    "weather_comfort_index",
    "avg_spend_usd",
]


def inject_css(path: str | Path = "style.css") -> None:
    css_path = Path(path)
    if css_path.exists():
        st.markdown(
            f"<style>{css_path.read_text(encoding='utf-8')}</style>",
            unsafe_allow_html=True,
        )
    else:
        st.warning(f"[ STYLESHEET MISSING ] :: {css_path.resolve()}")


@st.cache_data(show_spinner=False)
def load_geojson() -> dict | None:
    if not GEOJSON_PATH.exists():
        return None
    return json.loads(GEOJSON_PATH.read_text(encoding="utf-8"))


@st.cache_data(show_spinner=False)
def generate_tourism_panel(seed: int = 77) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    years = np.arange(2018, 2026)
    months = np.arange(1, 13)
    segments = ["domestic", "international"]
    purposes = ["leisure", "business", "medical", "education"]

    district_weights = {
        "Almaly": 1.28,
        "Medeu": 1.24,
        "Bostandyk": 1.2,
        "Auezov": 1.01,
        "Turksib": 0.95,
        "Jetysu": 0.92,
        "Alatau": 0.85,
        "Nauryzbai": 0.88,
    }
    purpose_weights = {"leisure": 1.0, "business": 0.86, "medical": 0.42, "education": 0.35}
    segment_weights = {"domestic": 1.0, "international": 0.56}

    rows: list[dict] = []
    for district in ALMATY_DISTRICTS:
        dist_w = district_weights[district]
        for year in years:
            post_recovery = 0.86 + 0.035 * (year - years.min())
            for month in months:
                seasonal = 1.0 + 0.34 * np.sin((month - 1) / 12 * 2 * np.pi - 0.8)
                weather = np.clip(0.5 + 0.45 * np.sin((month - 2) / 12 * 2 * np.pi), 0, 1)
                event_intensity = np.clip(rng.normal(55 + 24 * seasonal, 8), 5, 100)
                transport_access = np.clip(
                    48 + 6.5 * DISTRICT_INDEX[district] + rng.normal(0, 3),
                    20,
                    98,
                )
                for seg in segments:
                    seg_w = segment_weights[seg]
                    for purpose in purposes:
                        p_w = purpose_weights[purpose]
                        arrivals = (
                            850
                            * dist_w
                            * post_recovery
                            * seasonal
                            * seg_w
                            * p_w
                            * rng.uniform(0.75, 1.18)
                        )
                        arrivals = max(15.0, arrivals)
                        nights = arrivals * (1.6 + 0.75 * rng.random())
                        spend = (
                            (78 if seg == "domestic" else 142)
                            * (1.0 + 0.18 * weather)
                            * (1.0 + 0.0022 * event_intensity)
                            * rng.uniform(0.83, 1.2)
                        )
                        occupancy = np.clip(
                            44 + 0.03 * arrivals + 12 * seasonal + rng.normal(0, 5),
                            20,
                            99,
                        )
                        pressure = np.clip(
                            0.38
                            + arrivals / 2200
                            + (occupancy / 100) * 0.42
                            - weather * 0.22
                            + rng.normal(0, 0.07),
                            0,
                            2.2,
                        )
                        sustainability = np.clip(
                            0.72
                            - 0.21 * pressure
                            + 0.16 * weather
                            + (transport_access / 100) * 0.18
                            + rng.normal(0, 0.05),
                            0.05,
                            0.97,
                        )
                        rows.append(
                            {
                                "district": district,
                                "year": year,
                                "month": month,
                                "segment": seg,
                                "purpose": purpose,
                                "tourist_arrivals": round(arrivals),
                                "overnight_stays": round(nights),
                                "avg_spend_usd": round(spend, 2),
                                "hotel_occupancy_rate": round(occupancy, 2),
                                "event_intensity": round(event_intensity, 2),
                                "weather_comfort_index": round(weather, 3),
                                "transport_access_score": round(transport_access, 2),
                                "tourism_pressure_index": round(pressure, 3),
                                "sustainability_score": round(sustainability, 3),
                            }
                        )
    return pd.DataFrame(rows)


@st.cache_data(show_spinner=False)
def generate_od_flows(seed: int = 29) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    years = np.arange(2021, 2026)
    months = np.arange(1, 13)
    rows: list[dict] = []
    for year in years:
        for month in months:
            season = 1.0 + 0.3 * np.sin((month - 1) / 12 * 2 * np.pi - 0.8)
            for origin in ALMATY_DISTRICTS:
                for destination in ALMATY_DISTRICTS:
                    if origin == destination:
                        continue
                    attractiveness = 0.95 + DISTRICT_INDEX[destination] / 14
                    friction = 0.9 + abs(DISTRICT_INDEX[origin] - DISTRICT_INDEX[destination]) / 8
                    trips = 135 * season * attractiveness / friction * rng.uniform(0.62, 1.45)
                    rows.append(
                        {
                            "year": year,
                            "month": month,
                            "origin": origin,
                            "destination": destination,
                            "trips": round(max(10.0, trips)),
                        }
                    )
    return pd.DataFrame(rows)


@st.cache_data(show_spinner=False)
def load_tourist_places() -> pd.DataFrame:
    places = [
        ("Kok-Tobe", "Attraction", "Medeu", 43.2338, 76.9767, "Hilltop landmark with city panoramas and family rides.", 92, 64, 84, 96),
        ("Medeu", "Sport", "Medeu", 43.1574, 77.0594, "High-mountain skating and event complex.", 88, 58, 76, 90),
        ("Shymbulak", "Nature", "Medeu", 43.1286, 77.0812, "Major ski resort and alpine recreation zone.", 95, 61, 83, 94),
        ("Green Bazaar", "Market", "Almaly", 43.2637, 76.9459, "Historic market for food culture and local trade.", 86, 79, 89, 66),
        ("Arbat", "Entertainment", "Almaly", 43.2621, 76.9444, "Pedestrian street with cafes and performers.", 80, 55, 77, 88),
        ("Central Park", "Park", "Medeu", 43.2694, 76.9888, "Urban leisure park with lakeside activity.", 78, 63, 74, 79),
        ("Panfilov Park", "Park", "Almaly", 43.2586, 76.9537, "Iconic green core around heritage landmarks.", 82, 60, 78, 84),
        ("Zenkov Cathedral", "Culture", "Almaly", 43.2584, 76.9548, "Architectural heritage cathedral in city center.", 74, 52, 71, 77),
        ("Mega Alma-Ata", "Mall", "Bostandyk", 43.2015, 76.8921, "Large shopping and leisure center.", 77, 50, 72, 86),
        ("Esentai Mall", "Mall", "Bostandyk", 43.2183, 76.9275, "Premium retail destination with mixed-use complex.", 73, 48, 70, 82),
        ("Dostyk Plaza", "Mall", "Medeu", 43.2332, 76.9566, "Upscale commercial and entertainment node.", 76, 46, 71, 85),
        ("Republic Square", "Attraction", "Almaly", 43.2399, 76.9452, "Civic and ceremonial urban space.", 70, 49, 67, 74),
        ("Botanical Garden", "Nature", "Bostandyk", 43.2187, 76.9134, "Green infrastructure and recreation landscape.", 69, 56, 72, 62),
        ("First President Park", "Park", "Bostandyk", 43.1902, 76.8918, "Large park framing southern tourism corridors.", 71, 54, 69, 68),
        ("Almaty Museum", "Museum", "Almaly", 43.2424, 76.9419, "City history exhibitions and public education hub.", 63, 45, 64, 61),
        ("Abay Opera House", "Culture", "Almaly", 43.2434, 76.9455, "Performing arts venue with evening peaks.", 75, 31, 58, 92),
        ("Kazakh Museum of Arts", "Museum", "Almaly", 43.2388, 76.9265, "National fine arts collection and exhibitions.", 66, 42, 65, 70),
        ("Almaty Arena", "Event Venue", "Alatau", 43.2662, 76.8389, "Sports concerts and city-scale events.", 72, 30, 60, 93),
        ("Halyk Arena", "Event Venue", "Turksib", 43.3423, 77.0001, "Competition arena and event destination.", 68, 28, 57, 88),
        ("Airport", "Transport", "Turksib", 43.3521, 77.0405, "Primary gateway for international arrivals.", 91, 82, 76, 69),
        ("Railway Station 2", "Transport", "Turksib", 43.2714, 76.9398, "Major intercity rail access point.", 79, 75, 71, 63),
        ("Atakent", "Event Venue", "Bostandyk", 43.2252, 76.9091, "Expo and business event campus.", 74, 41, 73, 82),
        ("Family Park", "Entertainment", "Auezov", 43.2249, 76.8436, "Amusement and family recreation cluster.", 67, 52, 70, 73),
        ("Terrenkur", "Nature", "Medeu", 43.2251, 76.9886, "Linear green route for active urban tourism.", 62, 59, 66, 54),
        ("Park of 28 Panfilov Guardsmen", "Park", "Almaly", 43.2589, 76.9544, "Historic memorial park with high footfall.", 81, 62, 79, 83),
    ]
    cols = [
        "name",
        "category",
        "district",
        "latitude",
        "longitude",
        "description",
        "tourist_intensity_score",
        "morning_score",
        "afternoon_score",
        "evening_score",
    ]
    return pd.DataFrame(places, columns=cols)


inject_css()
panel_df = generate_tourism_panel()
od_df = generate_od_flows()
places_df = load_tourist_places()

with st.sidebar:
    st.markdown("### ◤ TOURISM MOBILITY · CONTROL")
    st.caption("ALMATY PHD PROTOTYPE // v0.2.0")
    st.markdown("---")

    selected_districts = st.multiselect(
        "DISTRICT FILTER",
        options=ALMATY_DISTRICTS,
        default=ALMATY_DISTRICTS,
    )
    year_min, year_max = int(panel_df["year"].min()), int(panel_df["year"].max())
    year_range = st.slider(
        "TIME HORIZON",
        min_value=year_min,
        max_value=year_max,
        value=(year_min, year_max),
    )
    selected_segments = st.multiselect(
        "VISITOR SEGMENT",
        options=sorted(panel_df["segment"].unique()),
        default=sorted(panel_df["segment"].unique()),
    )
    selected_purposes = st.multiselect(
        "TRAVEL PURPOSE",
        options=sorted(panel_df["purpose"].unique()),
        default=sorted(panel_df["purpose"].unique()),
    )

    st.markdown("---")
    st.markdown("#### Hypothesis Sandbox")
    target_var = st.selectbox(
        "DEPENDENT VARIABLE",
        options=["tourism_pressure_index", "sustainability_score", "avg_spend_usd"],
    )
    predictors = st.multiselect(
        "PREDICTORS",
        options=[p for p in PREDICTOR_POOL if p != target_var],
        default=["hotel_occupancy_rate", "event_intensity", "weather_comfort_index"],
    )
    model_kind = st.radio(
        "MODEL",
        options=["OLS", "Panel-FE", "Bayesian"],
        horizontal=True,
    )
    scenario_horizon = st.slider("SCENARIO HORIZON (YEARS)", 1, 10, 4)
    shock_event_boost = st.slider("EVENT CALENDAR BOOST (%)", 0, 60, 15)
    shock_mobility_upgrade = st.slider("MOBILITY UPGRADE (%)", 0, 50, 12)
    run_clicked = st.button("▶ RUN PROTOTYPE QUERY", use_container_width=True)

mask = (
    panel_df["district"].isin(selected_districts)
    & panel_df["year"].between(year_range[0], year_range[1])
    & panel_df["segment"].isin(selected_segments)
    & panel_df["purpose"].isin(selected_purposes)
)
view = panel_df.loc[mask].copy()
latest_year = int(view["year"].max())
latest = view[view["year"] == latest_year]
prev = view[view["year"] == latest_year - 1]


def delta_pct(cur: float, prev_val: float) -> str:
    if np.isnan(prev_val) or prev_val == 0:
        return ""
    return f"{(cur - prev_val) / prev_val:+.2%}"


now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
st.markdown(
    f"""
    <div class="terminal-header">
        <span class="ticker">◤ ALMATY TOURISM MOVEMENT LAB · {target_var.upper()} · {model_kind.upper()}</span>
        <span class="status">SYS · ONLINE · {now_str}</span>
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown("# ALMATY TOURISM MOVEMENT PROTOTYPE")
st.markdown(
    "<span style='color:#888;font-size:0.78rem;letter-spacing:0.1em;'>"
    "PHD WORKBENCH · SPATIOTEMPORAL TOURIST FLOWS · DISTRICT PRESSURE MODELLING · "
    "<span class='blink'>READY</span>"
    "</span>",
    unsafe_allow_html=True,
)

st.markdown(
    f"""
    <div class="data-strip">
        <span>ARRIVALS <b>{latest['tourist_arrivals'].sum():,.0f}</b></span>
        <span>NIGHTS <b>{latest['overnight_stays'].sum():,.0f}</b></span>
        <span>AVG SPEND <b>${latest['avg_spend_usd'].mean():.1f}</b></span>
        <span>PRESSURE <b class="neg">{latest['tourism_pressure_index'].mean():.3f}</b></span>
        <span>SUSTAINABILITY <b>{latest['sustainability_score'].mean():.3f}</b></span>
        <span>N <b>{len(view):,}</b></span>
    </div>
    """,
    unsafe_allow_html=True,
)

c1, c2, c3, c4 = st.columns(4)
with c1:
    st.metric(
        "ANNUAL ARRIVALS",
        f"{latest['tourist_arrivals'].sum():,.0f}",
        delta_pct(latest["tourist_arrivals"].sum(), prev["tourist_arrivals"].sum()),
    )
with c2:
    st.metric(
        "MEAN PRESSURE INDEX",
        f"{latest['tourism_pressure_index'].mean():.3f}",
        delta_pct(
            latest["tourism_pressure_index"].mean(),
            prev["tourism_pressure_index"].mean(),
        ),
    )
with c3:
    st.metric(
        "SUSTAINABILITY SCORE",
        f"{latest['sustainability_score'].mean():.3f}",
        delta_pct(latest["sustainability_score"].mean(), prev["sustainability_score"].mean()),
    )
with c4:
    stressed_share = (latest["tourism_pressure_index"] > 1.0).mean()
    st.metric("HIGH-PRESSURE SHARE", f"{stressed_share * 100:.1f}%", f"{stressed_share:.0%} rows")

st.markdown("---")

tab_overview, tab_map, tab_tourist_map, tab_movement, tab_methods, tab_scenario, tab_log = st.tabs(
    [
        "◢ OVERVIEW",
        "◢ DISTRICT MAP",
        "◢ TOURIST MAP",
        "◢ MOVEMENT FLOWS",
        "◢ METHODS",
        "◢ SCENARIO LAB",
        "◢ LOG",
    ]
)

with tab_overview:
    st.markdown("### MONTHLY ARRIVALS BY DISTRICT")
    ts = (
        view.groupby(["year", "month", "district"], as_index=False)["tourist_arrivals"]
        .sum()
        .sort_values(["year", "month"])
    )
    ts["period"] = pd.to_datetime(
        ts["year"].astype(str) + "-" + ts["month"].astype(str).str.zfill(2) + "-01"
    )
    fig_ts = px.line(ts, x="period", y="tourist_arrivals", color="district", markers=False)
    fig_ts.update_layout(height=330, paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
    st.plotly_chart(fig_ts, use_container_width=True)

    st.markdown("### PRESSURE VS SUSTAINABILITY")
    scatter_df = (
        view.groupby("district", as_index=False)
        .agg(
            tourism_pressure_index=("tourism_pressure_index", "mean"),
            sustainability_score=("sustainability_score", "mean"),
            tourist_arrivals=("tourist_arrivals", "sum"),
        )
    )
    fig_scatter = px.scatter(
        scatter_df,
        x="tourism_pressure_index",
        y="sustainability_score",
        size="tourist_arrivals",
        color="district",
        hover_name="district",
    )
    fig_scatter.update_layout(
        height=320,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
    )
    st.plotly_chart(fig_scatter, use_container_width=True)
    st.dataframe(view, use_container_width=True, height=280)

with tab_map:
    geojson = load_geojson()
    if geojson is None or not geojson.get("features"):
        st.warning("[ DISTRICT GEOJSON :: NOT INITIALISED ]")
        st.markdown("Boundary file not found. Use `fetch_districts.py` to load Almaty districts.")
    else:
        names_in_gj = {f["properties"]["name"] for f in geojson["features"]}
        st.caption(f"GEOJSON READY · {len(names_in_gj)}/8 DISTRICTS")
        map_year = st.slider("MAP YEAR", year_min, year_max, latest_year, key="map_year")
        map_metric = st.selectbox("MAP METRIC", PRESSURE_METRICS, index=3)
        annual = (
            panel_df[panel_df["year"] == map_year]
            .groupby("district", as_index=False)[map_metric]
            .mean()
        )
        annual["district"] = pd.Categorical(annual["district"], categories=ALMATY_DISTRICTS)

        scale = (
            [[0.0, "#0D0D0D"], [0.45, "#003311"], [0.75, "#008F24"], [1.0, "#00FF41"]]
            if map_metric in GOOD_VARS
            else [[0.0, "#0D0D0D"], [0.45, "#3A0207"], [0.75, "#8B0610"], [1.0, "#E50914"]]
        )
        fig = px.choropleth_mapbox(
            annual,
            geojson=geojson,
            locations="district",
            featureidkey="properties.name",
            color=map_metric,
            color_continuous_scale=scale,
            mapbox_style="carto-darkmatter",
            center={"lat": 43.25, "lon": 76.92},
            zoom=9.4,
            opacity=0.8,
        )
        fig.update_layout(
            margin=dict(l=0, r=0, t=0, b=0),
            height=520,
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
        )
        st.plotly_chart(fig, use_container_width=True)

with tab_tourist_map:
    st.markdown("### INTERACTIVE TOURIST MAP · ALMATY")
    map_geojson = load_geojson()
    if map_geojson is None or not map_geojson.get("features"):
        st.warning("[ DISTRICT GEOJSON :: NOT INITIALISED ]")
        st.markdown("Boundary file not found. Use `fetch_districts.py` to load Almaty districts.")
    else:
        col_f1, col_f2, col_f3, col_f4 = st.columns([1, 1, 1, 1])
        with col_f1:
            place_category = st.multiselect(
                "CATEGORY FILTER",
                sorted(places_df["category"].unique()),
                default=sorted(places_df["category"].unique()),
                key="tourist_category_filter",
            )
        with col_f2:
            time_of_day = st.selectbox(
                "TIME OF DAY",
                ["Morning", "Afternoon", "Evening", "All day"],
                index=3,
                key="tourist_time_filter",
            )
        with col_f3:
            district_filter = st.multiselect(
                "DISTRICT FILTER",
                ALMATY_DISTRICTS,
                default=ALMATY_DISTRICTS,
                key="tourist_district_filter",
            )
        with col_f4:
            selected_map_year = st.slider(
                "FLOW INDEX YEAR",
                min_value=year_min,
                max_value=year_max,
                value=latest_year,
                key="tourist_map_year",
            )

        filtered_places = places_df[
            places_df["category"].isin(place_category)
            & places_df["district"].isin(district_filter)
        ].copy()
        tod_col = {
            "Morning": "morning_score",
            "Afternoon": "afternoon_score",
            "Evening": "evening_score",
            "All day": "tourist_intensity_score",
        }[time_of_day]
        filtered_places["active_score"] = filtered_places[tod_col]

        annual_flow = (
            panel_df[panel_df["year"] == selected_map_year]
            .groupby("district", as_index=False)["tourist_arrivals"]
            .sum()
        )
        annual_flow["tourism_flow_index"] = (
            annual_flow["tourist_arrivals"] / annual_flow["tourist_arrivals"].max() * 100
        ).round(1)
        district_detail = annual_flow.merge(
            filtered_places.groupby("district", as_index=False).agg(
                places=("name", "count"),
                mean_intensity=("active_score", "mean"),
            ),
            on="district",
            how="left",
        )
        district_detail["mean_intensity"] = district_detail["mean_intensity"].fillna(0).round(1)
        district_detail["places"] = district_detail["places"].fillna(0).astype(int)

        district_layer = district_detail[["district", "tourism_flow_index", "places", "mean_intensity"]]
        district_map_fig = px.choropleth_mapbox(
            district_layer,
            geojson=map_geojson,
            locations="district",
            featureidkey="properties.name",
            color="tourism_flow_index",
            color_continuous_scale=[[0, "#0D0D0D"], [0.45, "#3A0207"], [0.75, "#8B0610"], [1, "#E50914"]],
            mapbox_style="carto-darkmatter",
            center={"lat": 43.25, "lon": 76.92},
            zoom=9.45,
            opacity=0.44,
            custom_data=["district", "tourism_flow_index", "places", "mean_intensity"],
        )
        district_map_fig.update_traces(
            hovertemplate=(
                "<b>%{customdata[0]}</b><br>"
                "Flow index: %{customdata[1]:.1f}<br>"
                "Places: %{customdata[2]}<br>"
                "Active score: %{customdata[3]:.1f}<extra></extra>"
            )
        )

        points_fig = px.scatter_mapbox(
            filtered_places,
            lat="latitude",
            lon="longitude",
            size="tourist_intensity_score",
            color="category",
            hover_name="name",
            hover_data={
                "district": True,
                "description": True,
                "tourist_intensity_score": True,
                "active_score": True,
                "latitude": False,
                "longitude": False,
            },
            size_max=24,
            zoom=9.45,
            center={"lat": 43.25, "lon": 76.92},
        )

        for tr in points_fig.data:
            district_map_fig.add_trace(tr)

        heat_fig = px.density_mapbox(
            filtered_places,
            lat="latitude",
            lon="longitude",
            z="active_score",
            radius=22,
            center={"lat": 43.25, "lon": 76.92},
            zoom=9.45,
            mapbox_style="carto-darkmatter",
            opacity=0.32,
        )
        for tr in heat_fig.data:
            district_map_fig.add_trace(tr)

        district_map_fig.update_layout(
            height=580,
            margin=dict(l=0, r=0, t=0, b=0),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            legend=dict(orientation="h", yanchor="bottom", y=0.01, x=0.01),
        )

        st.caption(
            "District layer is clickable (lasso/point select). If click capture is unavailable in your Streamlit version, use the district selector below."
        )
        selected_district = st.selectbox(
            "SELECT DISTRICT (MANUAL OR CLICK FALLBACK)",
            options=ALMATY_DISTRICTS,
            index=ALMATY_DISTRICTS.index(selected_districts[0]) if selected_districts else 0,
            key="tourist_map_district_select",
        )
        selection = st.plotly_chart(
            district_map_fig,
            use_container_width=True,
            key="tourist_map_chart",
            on_select="rerun",
            selection_mode="points",
        )
        selected_points = None
        if selection is not None:
            if isinstance(selection, dict):
                selected_points = selection.get("selection", {}).get("points")
            else:
                selected_points = getattr(getattr(selection, "selection", None), "points", None)
        if selected_points:
            pt = selected_points[0]
            custom = pt.get("customdata")
            if custom and custom[0] in ALMATY_DISTRICTS:
                selected_district = custom[0]
                st.session_state["tourist_map_district_select"] = selected_district

        district_places = filtered_places[filtered_places["district"] == selected_district].copy()
        district_flow = annual_flow.loc[annual_flow["district"] == selected_district, "tourism_flow_index"]
        district_flow_idx = float(district_flow.iloc[0]) if not district_flow.empty else 0.0

        attractions = district_places[
            district_places["category"].isin(["Attraction", "Nature", "Park", "Culture", "Museum", "Market"])
        ]["name"].tolist()
        events = district_places[district_places["category"].isin(["Event Venue", "Sport"])]["name"].tolist()
        entertainment = district_places[
            district_places["category"].isin(["Entertainment", "Mall", "Transport"])
        ]["name"].tolist()

        c_a, c_b = st.columns([1.2, 1.8])
        with c_a:
            st.markdown(f"### DISTRICT PROFILE · {selected_district.upper()}")
            st.metric("TOURISM FLOW INDEX", f"{district_flow_idx:.1f}")
            st.markdown(f"**Main attractions:** {', '.join(attractions[:6]) if attractions else 'No points in current filter'}")
            st.markdown(f"**Events:** {', '.join(events[:6]) if events else 'No points in current filter'}")
            st.markdown(
                f"**Entertainment places:** {', '.join(entertainment[:6]) if entertainment else 'No points in current filter'}"
            )
            st.markdown(
                "Research interpretation: this district shows the interaction between place concentration "
                "and temporal demand peaks; compare flow index with active scores to identify pressure corridors."
            )
        with c_b:
            st.markdown("### FILTERED TOURIST PLACES")
            st.dataframe(
                district_places[
                    [
                        "name",
                        "category",
                        "district",
                        "tourist_intensity_score",
                        "morning_score",
                        "afternoon_score",
                        "evening_score",
                        "description",
                    ]
                ].sort_values("tourist_intensity_score", ascending=False),
                use_container_width=True,
                height=300,
            )

        st.markdown("### ALL FILTERED PLACES")
        st.dataframe(
            filtered_places[
                [
                    "name",
                    "category",
                    "district",
                    "latitude",
                    "longitude",
                    "description",
                    "tourist_intensity_score",
                    "morning_score",
                    "afternoon_score",
                    "evening_score",
                ]
            ].sort_values(["district", "tourist_intensity_score"], ascending=[True, False]),
            use_container_width=True,
            height=320,
        )
        st.info(
            "This map visualizes tourist concentration and movement patterns in Almaty by combining district "
            "flow intensity with point-level attractions, events, entertainment, and time-of-day demand signals."
        )

with tab_movement:
    st.markdown("### ORIGIN-DESTINATION MATRIX")
    od_mask = od_df["year"].between(year_range[0], min(year_range[1], int(od_df["year"].max())))
    od_view = od_df[od_mask].copy()
    matrix = (
        od_view.groupby(["origin", "destination"])["trips"]
        .sum()
        .reset_index()
        .pivot(index="origin", columns="destination", values="trips")
        .fillna(0)
    )
    fig_hm = px.imshow(matrix, color_continuous_scale="reds", aspect="auto")
    fig_hm.update_layout(height=420, paper_bgcolor="rgba(0,0,0,0)")
    st.plotly_chart(fig_hm, use_container_width=True)

    st.markdown("### TOP DISTRICT FLOWS")
    top_flows = (
        od_view.groupby(["origin", "destination"], as_index=False)["trips"]
        .sum()
        .sort_values("trips", ascending=False)
        .head(15)
    )
    st.dataframe(top_flows, use_container_width=True, height=340)

with tab_methods:
    st.markdown("### MODEL SPECIFICATION")
    x = view[predictors].astype(float).to_numpy()
    y = view[target_var].astype(float).to_numpy()
    x = np.column_stack([np.ones(len(x)), x])
    beta = np.linalg.pinv(x.T @ x) @ (x.T @ y)
    pred = x @ beta
    r2 = 1 - ((y - pred) ** 2).sum() / ((y - y.mean()) ** 2).sum()

    coef_df = pd.DataFrame(
        {"term": ["intercept", *predictors], "coefficient": beta.round(5)}
    )
    st.code(
        f"{target_var} ~ " + " + ".join(predictors)
        + f"\n# estimator = {model_kind}"
        + f"\n# n_obs = {len(view):,}"
        + f"\n# in-app pseudo-R2 = {r2:.4f}",
        language="r",
    )
    st.dataframe(coef_df, use_container_width=True, height=220)
    st.info(
        "Prototype OLS is a placeholder for your formal PhD model stack "
        "(Panel FE / hierarchical Bayes / causal identification)."
    )

with tab_scenario:
    st.markdown("### POLICY SHOCK SIMULATION")
    annual_latest = panel_df[panel_df["year"] == latest_year].copy()
    baseline = annual_latest.groupby("district", as_index=False).agg(
        arrivals=("tourist_arrivals", "sum"),
        pressure=("tourism_pressure_index", "mean"),
        sustainability=("sustainability_score", "mean"),
    )
    scenario = baseline.copy()
    growth = 1 + (shock_event_boost * 0.004 + shock_mobility_upgrade * 0.003)
    scenario["arrivals"] = scenario["arrivals"] * (growth ** scenario_horizon)
    scenario["pressure"] = np.clip(
        scenario["pressure"] + scenario_horizon * (shock_event_boost / 100) * 0.08, 0, 2.3
    )
    scenario["sustainability"] = np.clip(
        scenario["sustainability"]
        + scenario_horizon * (shock_mobility_upgrade / 100) * 0.06
        - scenario_horizon * (shock_event_boost / 100) * 0.03,
        0,
        1,
    )
    compare = baseline.merge(
        scenario, on="district", suffixes=("_baseline", "_scenario")
    )
    st.dataframe(compare, use_container_width=True, height=310)

    fig_compare = go.Figure()
    fig_compare.add_bar(
        name="Baseline arrivals", x=compare["district"], y=compare["arrivals_baseline"]
    )
    fig_compare.add_bar(
        name="Scenario arrivals", x=compare["district"], y=compare["arrivals_scenario"]
    )
    fig_compare.update_layout(
        barmode="group",
        height=360,
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
    )
    st.plotly_chart(fig_compare, use_container_width=True)

with tab_log:
    gj_check = load_geojson()
    geo_status = "READY" if (gj_check and gj_check.get("features")) else "MISSING"
    log_lines = [
        f"{datetime.utcnow().strftime('%H:%M:%S')}  BOOT      tourism movement lab initialised",
        f"{datetime.utcnow().strftime('%H:%M:%S')}  PANEL     rows={len(panel_df):,} years={panel_df['year'].nunique()}",
        f"{datetime.utcnow().strftime('%H:%M:%S')}  OD        pairs={len(od_df):,}",
        f"{datetime.utcnow().strftime('%H:%M:%S')}  GEOJSON   {geo_status}",
        f"{datetime.utcnow().strftime('%H:%M:%S')}  FILTER    {len(view):,}/{len(panel_df):,} in scope",
        f"{datetime.utcnow().strftime('%H:%M:%S')}  STATE     {'RUN' if run_clicked else 'IDLE'}",
    ]
    st.code("\n".join(log_lines), language="text")

st.markdown(
    "<div style='margin-top:2rem;border-top:1px dashed #2A2A2A;"
    "padding-top:0.6rem;color:#444;font-size:0.65rem;letter-spacing:0.2em;"
    "text-transform:uppercase;text-align:right;'>"
    "ALMATY TOURISM MOVEMENT LAB // BUILD 0.2.0-PHD // RESEARCH PROTOTYPE"
    "</div>",
    unsafe_allow_html=True,
)
