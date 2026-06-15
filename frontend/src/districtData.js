/** Visual identity per district — edit hex values here to customize colors. */
export const districtTheme = {
  Medeu: {
    color: "#047857",
    softColor: "rgba(209, 250, 229, 0.88)",
    glowColor: "#34d399",
    labelColor: "#065f46",
    categoryMood: "Alpine green / mountain tourism",
  },
  Almaly: {
    color: "#c2410c",
    softColor: "rgba(255, 237, 213, 0.9)",
    glowColor: "#fb923c",
    labelColor: "#9a3412",
    categoryMood: "Warm orange / culture & city walks",
  },
  Bostandyk: {
    color: "#1d4ed8",
    softColor: "rgba(219, 234, 254, 0.9)",
    glowColor: "#60a5fa",
    labelColor: "#1e3a8a",
    categoryMood: "Modern blue / youth & leisure",
  },
  Auezov: {
    color: "#6d28d9",
    softColor: "rgba(237, 233, 254, 0.92)",
    glowColor: "#a78bfa",
    labelColor: "#5b21b6",
    categoryMood: "Purple / family recreation",
  },
  Alatau: {
    color: "#b45309",
    softColor: "rgba(254, 243, 199, 0.92)",
    glowColor: "#fbbf24",
    labelColor: "#92400e",
    categoryMood: "Yellow-gold / new growth zone",
  },
  Turksib: {
    color: "#0e7490",
    softColor: "rgba(207, 250, 254, 0.9)",
    glowColor: "#22d3ee",
    labelColor: "#155e75",
    categoryMood: "Cyan / airport gateway",
  },
  Jetysu: {
    color: "#be123c",
    softColor: "rgba(255, 228, 230, 0.9)",
    glowColor: "#fb7185",
    labelColor: "#9f1239",
    categoryMood: "Red-coral / markets & mobility",
  },
  Nauryzbai: {
    color: "#0f766e",
    softColor: "rgba(204, 251, 246, 0.82)",
    glowColor: "#14b8a6",
    labelColor: "#115e59",
    categoryMood: "Teal / eco recreation",
  },
};

const card = (title, category, blurb) => ({ title, category, blurb });

/**
 * Rich district copy + card data. Edit text here for presentations.
 * tourismIntensity: narrative index 0–100 for the hero metric.
 */
export const districtContent = {
  Medeu: {
    name: "Medeu",
    tag: "Mountain tourism",
    description:
      "Medeu is where Almaty tilts toward the Zailiysky Alatau: cableways, ice rinks, and pine-scented trails shape the city’s alpine brand. Weekends bring a steady climb of visitors toward Kok-Tobe and Shymbulak, with demand tracking weather windows as much as the clock.",
    tourismIntensity: 94,
    movementStory: "Main visitor flow: city core → Medeu gateway → mountain venues (Kok-Tobe / Shymbulak corridor).",
    topAttractions: [
      card("Shymbulak", "Alpine resort", "High-country skiing and summer lifts anchor international expectations for Almaty."),
      card("Kok-Tobe", "City viewpoint", "Family cable-car trips stack sunset hours and slow rotation back toward dinner downtown."),
      card("Medeu rink", "Sport heritage", "World-known high-altitude skating draws both event tourism and casual photos."),
      card("Terrenkur trails", "Active tourism", "Locals and visitors mix on ridge walks that extend stay time beyond a single venue."),
    ],
    events: [
      {
        title: "Shymbulak Winter Fest",
        category: "Seasonal",
        blurb: "Lift-access concerts and snow sports demos draw regional visitors mid-season.",
        visitors: "~8.5k weekend",
      },
      {
        title: "Kok-Tobe Sunset Sessions",
        category: "Culture",
        blurb: "Acoustic sets at the ridge line — strong evening peak and social sharing.",
        visitors: "~3.2k / event",
      },
      {
        title: "Medeu Sport Weekend",
        category: "Sport",
        blurb: "Mass-participation races and family heats keep the basin busy before lunch.",
        visitors: "~5.1k combined",
      },
    ],
    entertainment: [
      card("Ridge lounges", "Evening", "Panorama terraces convert day-trippers into dinner spend."),
      card("Cable-car rhythm", "Experience", "Queue psychology matters: smoothing peaks protects both comfort and revenue."),
      card("Mountain retail", "Lifestyle", "Gear and souvenir clusters capture last-minute alpine spend."),
    ],
    foodShopping: [
      card("Resort dining decks", "Food", "High-line menus justified by views; demand follows clear-sky forecasts."),
      card("Slope-side cafes", "Food", "Fast warm meals for families between runs and hikes."),
      card("Outdoor gear shops", "Shopping", "Rentals and upgrades for visitors who pack light from Europe or Asia."),
    ],
    movementInsight:
      "Movement here is valley-shaped: morning departures cluster around transport headways, afternoon density peaks near lifts, and evening returns often drain toward Almaly and Bostandyk for dining. Weather shifts can double or halve same-day volume, so visitor management is as much about forecasts as about marketing.",
    innovationOpportunity:
      "Bundle predictive crowd signals (weather + events + hotel pickups) with dynamic shuttles and timed tickets. A single ‘mountain day’ itinerary API for hotels and DMOs could reduce congestion at the gate while increasing capture rate on F&B and experiences.",
  },

  Almaly: {
    name: "Almaly",
    tag: "Culture & city walks",
    description:
      "Almaly is the walkable heart where Soviet grids meet bazaar energy and wooden-church heritage. Short loops between Panfilov Park, the bazaar, and performance halls make it the default first day for many visitors. Evenings tilt toward opera, wine bars, and lit-up pedestrian pockets.",
    tourismIntensity: 91,
    movementStory: "Main visitor flow: Panfilov–Zenkov loop → Green Bazaar → Arbat / Abay evening spine.",
    topAttractions: [
      card("Green Bazaar", "Food heritage", "Tasting-led visits structure mid-morning footfall for domestic and regional tourists."),
      card("Zenkov Cathedral", "Heritage", "Photo-forward icon that anchors UNESCO-style narration in guidebooks."),
      card("Park of 28 Panfilov Guardsmen", "Memorial walk", "Shade trees and ceremonial space buffer heat and crowd waves."),
      card("Republic Square vista", "Civic landmark", "Arrival selfies and ceremonial views pull short detours off main axes."),
    ],
    events: [
      {
        title: "Arbat Street Music",
        category: "Street culture",
        blurb: "Busking permits and themed Fridays extend dwell on the walking strip.",
        visitors: "~1.8k eve.",
      },
      {
        title: "Green Bazaar Food Walk",
        category: "Culinary",
        blurb: "Guided tastings that stitch dairy, pickles, and sweets into one ticketed hour.",
        visitors: "~900 / wave",
      },
      {
        title: "Heritage Night Route",
        category: "Heritage",
        blurb: "Illuminated church-to-bazaar arcs with interpreters; spikes opera-adjacent spend.",
        visitors: "~1.2k / night",
      },
    ],
    entertainment: [
      card("Abay Opera House", "Performing arts", "High-culture anchors import regional tour groups on fixed schedules."),
      card("Street performers", "Public space", "Soft programming that lengthens spontaneous stops."),
      card("Lit Arbat corridors", "Night economy", "Café spillovers after theatre lets out."),
    ],
    foodShopping: [
      card("Bazaar tastings", "Food", "Snack-sized commerce that lowers risk for cautious international palates."),
      card("Wine & supper lanes", "Food", "Boutique dining near theatres captures post-show tables."),
      card("Souvenir ateliers", "Shopping", "Craft retail that competes with airport shops if stories are credible."),
    ],
    movementInsight:
      "Flows are orbital: visitors rarely cross Almaly linearly—they loop. Peaks bifurcate between late-morning markets and opera-adjacent evenings, with midday heat thinning open spaces. Connecting these loops to paid experiences (audio, food, curator) increases yield per square metre without widening streets.",
    innovationOpportunity:
      "Pilot a capped ‘heritage throughput’ pass with timed entries to key sights plus queue transparency. Pair with multilingual micro-grants for guides so visitor spending stays neighbourhood-bound rather than leaking to malls alone.",
  },

  Bostandyk: {
    name: "Bostandyk",
    tag: "Youth & leisure",
    description:
      "Bostandyk stacks universities, malls, expo floors, and large parks along a youthful east–west corridor. Domestic students and middle-class households mix with business travellers who want green space beside glass towers. Nights here behave like a softer Seoul pocket—cafés, cinemas, pop-ups.",
    tourismIntensity: 86,
    movementStory: "Main visitor flow: Mega / Esentai axis ↔ Botanical Garden weekends ↔ Atakent event pulses.",
    topAttractions: [
      card("Mega Alma-Ata", "Lifestyle mall", "One-stop evenings for suburban visitors who Uber in for movies and meals."),
      card("Esentai Mall", "Premium retail", "Regional fashion tourism and concierge-level dining."),
      card("Botanical Garden", "Urban nature", "Ticketed serenity that balances sensory load after retail."),
      card("First President Park", "Green corridor", "Long walks and jogging loops lengthen afternoon stays."),
    ],
    events: [
      {
        title: "Botanical Garden Weekend",
        category: "Family",
        blurb: "Eco markets and daylight concerts keep picnic blankets dense on warm Saturdays.",
        visitors: "~6.0k Sat.",
      },
      {
        title: "Esentai Art Pop-up",
        category: "Retail art",
        blurb: "Short-run installations that pull social traffic into wings with higher SKU value.",
        visitors: "~2.4k / run",
      },
      {
        title: "Student City Food Fest",
        category: "Food",
        blurb: "Campus-facing street food rotations with live DJ sets feeding night trade.",
        visitors: "~4.5k / weekend",
      },
    ],
    entertainment: [
      card("Late-night cinemas", "Leisure", "Domestic blockbuster flows extend parking revenue."),
      card("Esplanade lawns", "Social", "Pickup sports and picnics soften mall adjacency."),
      card("Mixed-use rooftops", "Nightlife", "Music venues experimenting with quieter acoustic rules."),
    ],
    foodShopping: [
      card("Asian fusion clusters", "Food", "Student-priced innovation that inbound tourists happily discover."),
      card("Flagship retail", "Shopping", "Brand tourism for Kazakh middle class and regional visitors."),
      card("Hypermarket pick-ups", "Shopping", "Packaged goods before airport runs from nearby Turksib."),
    ],
    movementInsight:
      "Trip chains dominate: mall → park → café returns. Evenings stretch longer than Almaly’s heritage circuit because parking and ride-hail are easier, but peaks still cluster around releases and weather. Conference spill from Atakent shows as predictable weekday lunch bulges.",
    innovationOpportunity:
      "Create a ‘south mobility pass’ bundling park entries, bike share, and evening ride-hail subsidies on high-AQI days to keep youth segments moving without gridlocking ring roads.",
  },

  Auezov: {
    name: "Auezov",
    tag: "Family recreation",
    description:
      "Auezov is where Almaty’s family routines live: apartment blocks, district malls, and calmer traffic invite repeat domestic visits. International tourists appear less often, but spend per family can be high when amusement and cinema align on weekends.",
    tourismIntensity: 72,
    movementStory: "Main visitor flow: neighbourhood centres → Family Park cluster → homebound evening rides.",
    topAttractions: [
      card("Family Park", "Amusement", "Rides and weekend concerts define the district’s tourism anchor."),
      card("District retail lakes", "Shopping", "Hypermarkets that catch car-based domestic tourism."),
      card("Community sports halls", "Active life", "Youth academies bring tournament travel on low profile."),
      card("Green connectors", "Urban fabric", "Linear parks that stitch housing to micro-transit."),
    ],
    events: [
      {
        title: "Family Park Weekend",
        category: "Family",
        blurb: "Character parades and ride bundles—strong Saturday noon arrival curve.",
        visitors: "~7.0k Sat.",
      },
      {
        title: "Community Cinema Night",
        category: "Culture",
        blurb: "Subtitled family films with food truck rows; builds repeat attendance.",
        visitors: "~1.1k / screen",
      },
      {
        title: "Local Food Fair",
        category: "Food",
        blurb: "Neighbourhood producers trial products before city centre placement.",
        visitors: "~2.0k / day",
      },
    ],
    entertainment: [
      card("Indoor play centres", "Kids", "Rain-day insurance for parents—long dwell, predictable spend."),
      card("Bowling & arcades", "Leisure", "Teen clusters that balance Family Park’s younger skew."),
      card("District theatres", "Culture", "Low-budget drama that still trains future hospitality staff."),
    ],
    foodShopping: [
      card("Mall food courts", "Food", "Safe choice sets for families with mixed dietary needs."),
      card("Neighbourhood bakeries", "Food", "Morning foot traffic that tourism rarely sees without local partners."),
      card("Value retail", "Shopping", "Price-sensitive capture that pairs with domestic road trips."),
    ],
    movementInsight:
      "Movement is intentionally short-radius: few cross-district hops except for Family Park nights. Spikes follow school calendars and weather more than international flight arrivals. Integrating with ride-hail pool lanes could reduce curbside chaos on closing hours.",
    innovationOpportunity:
      "Co-design ‘family night transit’ with discounted late buses from Family Park to metro spine—reduces private car pressure and unlocks secondary spend at late kitchens near stations.",
  },

  Alatau: {
    name: "Alatau",
    tag: "New growth zone",
    description:
      "Alatau’s westward fabric is stitching large-format venues to new residential waves. Arena nights and weekend sport inject spikes that feel unlike the daily cadence of central Almaty. Planners market it as open space for youth sport and brand events with room to breathe.",
    tourismIntensity: 78,
    movementStory: "Main visitor flow: ring-road access → arena / sport nodes → post-event food strips.",
    topAttractions: [
      card("Almaty Arena", "Major events", "Concert and ice events that import fly-in fans when routing allows."),
      card("Emerging boulevards", "Urban design", "Wide roads that will support night markets once retail matures."),
      card("District sport schools", "Training tourism", "Youth tournaments with parent chaperones filling hotels at city edge."),
      card("Western parkways", "Open space", "Car-friendly picnics awaiting better non-motorised links."),
    ],
    events: [
      {
        title: "New District Festival",
        category: "Community",
        blurb: "Showcases local makers to residents who might skip central crowds.",
        visitors: "~3.5k / day",
      },
      {
        title: "Innovation Market Day",
        category: "Tech / retail",
        blurb: "Hardware pop-ups beside sport demos—corporate sponsorship friendly.",
        visitors: "~1.9k curious",
      },
      {
        title: "Open-Air Youth Sports",
        category: "Sport",
        blurb: "Multi-court tournaments with sponsor villages and livestream feeds.",
        visitors: "~4.8k athletes+fans",
      },
    ],
    entertainment: [
      card("Arena concourses", "Hospitality", "Premium F&B experiments when event calendars align."),
      card("Surrounding food parks", "Night economy", "Grill clusters that catch cars after matches."),
      card("Outdoor LED art", "Place-making", "Low-cost spectacle while retail absorption catches up."),
    ],
    foodShopping: [
      card("Arena snack ecosystems", "Food", "High throughput lines trained for event peaks."),
      card("Roadside convenience", "Shopping", "Last-minute merchandise for arriving fans."),
      card("Drive-to casual dining", "Food", "Family chains with large lots—perfect for suburban convoys."),
    ],
    movementInsight:
      "Movement is episodic and car-heavy: arrivals bunch 90 minutes before doors, then disperse faster than Almaly loops. Transit integration remains the weak link—successful nights still look like rivers of headlights rather than synced trains.",
    innovationOpportunity:
      "Finance a reversible bus lane activated only on arena + concert nights, paired with bundled parking prices to fund green buffer planting—turns ‘event stress’ into a branded mobility story.",
  },

  Turksib: {
    name: "Turksib",
    tag: "Airport gateway",
    description:
      "Turksib is the handshake between Kazakhstan and the world for many visitors: jet bridges, midnight rail arrivals, and arena lights. Hospitality here wins or loses first impressions—long before someone sees mountain views.",
    tourismIntensity: 88,
    movementStory: "Main visitor flow: ALA arrivals → rail / taxi vectors → Almaly core or Medeu day-two.",
    topAttractions: [
      card("ALA international hub", "Gateway", "Visa desks, SIM sales, and meet-greets sculpt first-hour stress."),
      card("Railway Station 2", "Intercity", "Sleeper trains from Nur-Sultan carry budget cultural tourists."),
      card("Halyk Arena", "Events", "Secondary fly-to events that avoid downtown parking pain."),
      card("Transit retail strips", "Services", "Coffee and SIM cards as tourism infrastructure."),
    ],
    events: [
      {
        title: "Airport Welcome Route",
        category: "Hospitality",
        blurb: "Curated meet points for MICE groups and student exchanges—reduces chaos at exits.",
        visitors: "cohort-based",
      },
      {
        title: "Transit Food Market",
        category: "Food",
        blurb: "Night kitchen row for rail passengers hitting the city at odd hours.",
        visitors: "~1.4k / night",
      },
      {
        title: "City Gateway Expo",
        category: "Trade",
        blurb: "Compact travel trade shows feeding DMO storylines to regional buyers.",
        visitors: "~2.2k trade",
      },
    ],
    entertainment: [
      card("Arena concerts", "Music", "International acts testing Almaty demand before arena tours elsewhere."),
      card("Airport lounges", "Comfort", "Sleep pods and showers that convert layovers into city visits."),
      card("Late taxi culture", "Mobility", "Informal knowledge economy—quality varies, reputation matters."),
    ],
    foodShopping: [
      card("24h chain dining", "Food", "Predictable calories for jet-lagged stomachs."),
      card("Duty-free showcase", "Shopping", "Local brand slots that double as marketing for city retail."),
      card("Grab-and-go retail", "Shopping", "SIM, water, adaptors—low margin but high necessity."),
    ],
    movementInsight:
      "Flows are forked: air passengers split between immediate city pull and hotel shuttles, while rail passengers often surface near evening dining peaks. Latency at kerbside harms NPS more than any museum queue—digital queueing and geofenced ride zones could shift sentiment fast.",
    innovationOpportunity:
      "Deploy a single QR ‘arrival story’ with live queue times, fair taxi bands, and music cues—funded by premium lounge partners—so the first 20 minutes feels designed, not improvised.",
  },

  Jetysu: {
    name: "Jetysu",
    tag: "Markets & mobility",
    description:
      "Jetysu hums with everyday commerce feeding the rest of Almaty: produce, household goods, and mid-rise living. Tourism overlaps with local life—visitors seeking ‘real city’ textures show up mainly through guided market experiences or logistic layovers.",
    tourismIntensity: 68,
    movementStory: "Main visitor flow: market mornings → midday transfers → outbound routes to greener districts.",
    topAttractions: [
      card("District bazaars", "Everyday culture", "Texture-rich visits for photo essays and culinary research."),
      card("Mid-rise residential fabric", "Urban fieldwork", "Academic tourism studies housing stock and migration."),
      card("Connector arterials", "Mobility", "Bus pulse points that explain peak crowding mathematically."),
      card("Hidden music clubs", "Night", "Under-radar scenes that travel by word of mouth."),
    ],
    events: [
      {
        title: "Local Market Route",
        category: "Guided",
        blurb: "Small-group tours with vendor profit-sharing—reduces tourist unease about bargaining.",
        visitors: "~350 / group",
      },
      {
        title: "Mobility Hub Fair",
        category: "Policy",
        blurb: "Showcases e-bikes and shuttles where residents actually transfer.",
        visitors: "~1.6k curious",
      },
      {
        title: "Street Food Weekend",
        category: "Food",
        blurb: "Temporary stalls with hygiene badges—weekend lunch bell curve.",
        visitors: "~3.1k / day",
      },
    ],
    entertainment: [
      card("Neighbourhood tea houses", "Social", "Slow conversations that explain local politics and kinship."),
      card("Pickup sports pitches", "Play", "Youth energy that contrasts with heritage tourism elsewhere."),
      card("Warehouse sales", "Retail", "Flash events that spill into nightlife districts later."),
    ],
    foodShopping: [
      card("Produce-forward vendors", "Food", "Ingredients that end up on Bostandyk plates with markup."),
      card("Household bazaars", "Shopping", "Low-ticket proof that domestic tourism volume matters."),
      card("Commuter snack bars", "Food", "Morning protein for workers—underconsidered service design lab."),
    ],
    movementInsight:
      "Jetysu’s movement is utilitarian: tight morning peaks, flatter afternoons, early finishes. Visitors who arrive without guidance can feel invisible—there is no single icon, only rhythm. That rhythm is data-rich for mobility researchers even if it is under-marketed.",
    innovationOpportunity:
      "Pair community interpreters with dynamic pricing for market tours so vendors earn more per visitor without crowding aisles—use booking caps tied to vendor rest cycles.",
  },

  Nauryzbai: {
    name: "Nauryzbai",
    tag: "Eco recreation",
    description:
      "Nauryzbai balances new housing with edge-of-city green buffers. Wildlife-adjacent trails and quiet picnic culture attract residents seeking contrast to Medeu’s crowds. Tourism here is nascent—more about future capacity than today’s arrivals.",
    tourismIntensity: 61,
    movementStory: "Main visitor flow: residential clusters → hillside trails → return via ring roads (car-first today).",
    topAttractions: [
      card("Emerging eco trails", "Nature", "Low-impact walks where signage still catching up to foot traffic."),
      card("Neighbourhood orchards", "Agri", "Seasonal fruit tourism potential with heritage storytelling."),
      card("Lookout ridges", "View", "Quiet alternatives to Kok-Tobe for photographers willing to trek."),
      card("Residential eco-pilot homes", "Innovation", "Solar demos that attract sustainability tours."),
    ],
    events: [
      {
        title: "Eco Trail Day",
        category: "Nature",
        blurb: "Volunteer stewardship + citizen science checkpoints—small but loyal attendance.",
        visitors: "~950 / outing",
      },
      {
        title: "Mountain Edge Picnic",
        category: "Community",
        blurb: "Family blankets and live acoustic—strong word-of-mouth within Almaty Facebook groups.",
        visitors: "~1.2k fair-weather",
      },
      {
        title: "Weekend Nature Route",
        category: "Guided",
        blurb: "Moderate-difficulty hikes with botanists; builds repeat domestic loyalty.",
        visitors: "~400 / cohort",
      },
    ],
    entertainment: [
      card("Grassland yoga pop-ups", "Wellness", "Sunrise cohorts aligning with quieter roads."),
      card("Eco film nights", "Culture", "Projector events emphasising Kazakh nature cinema."),
      card("Birding meetups", "Wildlife", "Niche tourism with high educational value."),
    ],
    foodShopping: [
      card("Farm gate sales", "Food", "Preserves and honey sold straight from hillside plots."),
      card("Neighbourhood bakeries", "Food", "Carb-loading before hikes—potential partnership with outfitters."),
      card("Eco retail pop-ups", "Shopping", "Reusable bottles and Kazakhstan-made gear testing demand."),
    ],
    movementInsight:
      "Traffic is intentionally light: arrivals spread across weekends rather than concentrating in one avenue. Success looks like dispersion—many small trails rather than a single bottleneck—fitting the district’s ecology story but challenging revenue capture.",
    innovationOpportunity:
      "Fund micro-shuttles timed to trailheads with carbon offsets baked into ticket prices, then reinvest in native plant restoration—makes ‘eco’ measurable on the balance sheet, not only in brochures.",
  },
};
