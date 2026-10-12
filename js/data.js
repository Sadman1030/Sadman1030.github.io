/* Edit this file to change links and content. Leave a link empty to hide it. */
window.SITE = {

  config: {
    email: "sadmanmubarrat1030@gmail.com",
    github: "https://github.com/Sadman1030",     // example: "https://github.com/your-username"
    linkedin: "https://www.linkedin.com/in/sadman-mubarrat-017b9a249",   // example: "https://www.linkedin.com/in/your-handle"
    scholar: "https://scholar.google.com/citations?hl=en&user=maGXbrkAAAAJ&view_op=list_works&gmla=AERr9JFIPCosrYRSJNRdLsu6ZH7s4GiSV39b8LHTNALiu9QgMmYfUDHaclxVbUalqSUnwHMUdWiPDEhpQUbxmPAB",    // example: "https://scholar.google.com/citations?user=XXXX"
    thesisRepo: ""  // link to the rainfall pipeline repository, if public
  },

  zones: [
    { name: "Industrial and eco-agricultural", code: "C0", color: "#6f84c9",
      cover: { built: 19.77, water: 26.81, veg: 40.40, barren: 13.03 },
      fact: "A third of the points of interest here are industrial (33.01 percent). It has the least built-up land, and the most water and vegetation.",
      places: "Mirerdanga, Maheswarpasha, Daulatpur, Khalishpur, Labonchora" },
    { name: "Residential", code: "C1", color: "#8fb84a",
      cover: { built: 49.92, water: 8.02, veg: 15.89, barren: 26.17 },
      fact: "92.72 percent of its points of interest are residential. It has the least vegetation of any zone and lacks essential services, health facilities most of all.",
      places: "Maheswarpasha, Khalishpur, Mujgonni, Sonadanga, Nirala, Munshipara" },
    { name: "Commercial and residential", code: "C2", color: "#d98a1f",
      cover: { built: 45.52, water: 10.25, veg: 23.08, barren: 21.15 },
      fact: "73.53 percent of its points of interest are residential and 12.35 percent are commercial: homes and shops in the same blocks.",
      places: "Daulatpur, Shibbari, New Market, Dakbangla, Moylapota, Sonadanga" },
    { name: "Mixed functional", code: "C3", color: "#4fb3a5",
      cover: { built: 41.40, water: 12.09, veg: 26.98, barren: 19.53 },
      fact: "It has the highest share of commercial points of interest (29.17 percent) and of educational ones (16.67 percent), and no industrial points at all.",
      places: "Mirerdanga, Khalishpur, Rayermohal, Shibbari" },
    { name: "Business and service", code: "C4", color: "#e9dc6b",
      cover: { built: 26.61, water: 16.97, veg: 35.78, barren: 20.64 },
      fact: "It has the highest share of public and government facilities (13.04 percent) and of health facilities (4.35 percent), and no commercial points of interest.",
      places: "Mirerdanga, Daulatpur, Boikali, New Market, Dakbangla, central Khulna" }
  ],

  steps: [
    { tab: "Merge", title: "Merge reanalysis and gauges",
      text: [
        "Daily ERA5 reanalysis (seven variables, 38,350 station-days) is joined to rain gauge records from five Bangladesh Meteorological Department stations: Chalna, Dumuria, Kapilmuni, Khulna and Paikgacha. The record runs from 1998 to 2018.",
        "About 12 percent of the gauge values are missing. Models train on 1998 to 2014, validate on 2015 and 2016, and are scored on 2017 and 2018."
      ],
      note: "Raw ERA5 against the gauges has a daily R squared of minus 0.383.",
      fig: { src: "assets/img/rain-study.webp", alt: "Map of coastal southwest Bangladesh showing the five gauge stations over annual rainfall bands", caption: "Study area and the five gauge stations" } },
    { tab: "Fill gaps", title: "Fill the gaps and build features",
      text: [
        "A Generative Adversarial Imputation Network (GAIN) fills the missing gauge values. A generator proposes values, a discriminator tries to spot them, and a reconstruction loss keeps the result close to what was observed.",
        "Features then add lagged rainfall, rolling statistics, seasonal terms, rainfall at neighbouring stations and a bias-corrected ERA5 series. The target is log transformed because daily rain is heavy tailed."
      ],
      note: "The full workflow from raw files to evaluation is drawn on the right.",
      fig: { src: "assets/img/rain-pipeline.webp", alt: "Overview diagram of the full workflow from data acquisition and imputation through feature engineering, spatiotemporal modelling, ensemble and evaluation", caption: "Full workflow, from the thesis" } },
    { tab: "Space and time", title: "Learn space and time",
      text: [
        "One branch is a spatiotemporal graph neural network. Stations are nodes on a graph weighted by distance with a Gaussian kernel, so nearby gauges share information. Graph convolutions handle space and recurrent layers handle time.",
        "The other branch is a Temporal Fusion Transformer, which uses attention over past days. A weighted ensemble combines the two."
      ],
      note: "The ensemble helped a little, but it did not close the gap to the final model. Training strategy mattered more than architecture.",
      fig: { src: "assets/img/rain-stgnn.webp", alt: "Architecture diagram of the spatiotemporal graph neural network with graph convolution, GRU layers, and separate classification and regression heads", caption: "Spatiotemporal graph network architecture" } },
    { tab: "Rain or amount", title: "Separate whether it rains from how much",
      text: [
        "Daily rainfall is mostly zeros with a few huge values. Trained together, the wet or dry decision and the amount pull the model in opposite directions.",
        "The phase-separated model trains in two stages. Phase one learns to classify wet and dry days. In phase two the classifier is frozen and a regressor learns the amount on wet days. The wet-day threshold is tuned on validation data."
      ],
      note: "In the ablation, this change raised monthly R squared from 0.739 to 0.940, a 27.2 percent relative gain.",
      fig: { src: "assets/img/rain-phase.webp", alt: "Diagram of two-stage phase-separated training with a wet or dry classifier followed by an amount regressor", caption: "Two stage training" } },
    { tab: "Calibrate", title: "Calibrate the uncertainty",
      text: [
        "Monte Carlo dropout gives a spread of forecasts for every day. On its own the spread is too narrow, so temperature scaling stretches it until the stated confidence matches what happens.",
        "A 90 percent prediction interval now covers 90.1 percent of observed days. Before calibration it covered 73.6 percent."
      ],
      note: "The intervals widen on hard days and tighten on calm ones, which is what a planner needs from a forecast.",
      fig: { src: "assets/img/rain-uncertainty.webp", alt: "Daily predictive uncertainty at the five gauge stations with 90 percent intervals", caption: "Daily prediction intervals at five stations" } }
  ],

  results: [
    { tab: "Which model", title: "Kling-Gupta efficiency on the 2017 and 2018 test years",
      sub: "Higher is better. It combines correlation, bias and variability, so it does not reward a model for simply repeating yesterday.",
      domain: [0, 0.7], fmt: "n3",
      bars: [
        { label: "Phase-separated", v: 0.615, hero: true },
        { label: "Temporal Fusion Transformer", v: 0.376 },
        { label: "Weighted ensemble", v: 0.324 },
        { label: "Graph network", v: 0.245 }
      ],
      take: "Combining the two architectures without a better training strategy left the main source of error untouched." },
    { tab: "Against raw ERA5", title: "From unusable reanalysis to a usable forecast",
      sub: "Both measured against the same five gauges.",
      groups: [
        { name: "Daily R squared", domain: [-0.5, 0.5], fmt: "n3",
          bars: [ { label: "Raw ERA5", v: -0.383 }, { label: "This framework", v: 0.361, hero: true } ] },
        { name: "Root mean square error, millimetres per day", domain: [0, 30], fmt: "n2",
          bars: [ { label: "Raw ERA5", v: 28.18 }, { label: "This framework", v: 18.30, hero: true } ] }
      ],
      take: "Error falls by 35.1 percent, and daily skill goes from worse than the average to positive." },
    { tab: "Uncertainty", title: "Does a 90 percent interval really cover 90 percent?",
      sub: "Share of observed days that fall inside the predicted interval.",
      domain: [0, 100], fmt: "pct", target: 90,
      bars: [ { label: "Before calibration", v: 73.6 }, { label: "After calibration", v: 90.1, hero: true } ],
      take: "Temperature scaling brings the stated confidence in line with how often the forecast is right." },
    { tab: "Training strategy", title: "Joint training against two stage training",
      sub: "Monthly R squared in the ablation study, same architecture in both cases.",
      domain: [0, 1], fmt: "n3",
      bars: [ { label: "Trained jointly", v: 0.739 }, { label: "Phase-separated", v: 0.940, hero: true } ],
      take: "A relative improvement of 27.2 percent from changing how the model is trained, not what it is made of." }
  ],

  gallery: {
    paper: [
      { src: "assets/img/gcnn-arch.webp", cap: "Graph clustering neural network: input graph, two graph convolution layers with a ReLU between them, output embedding and clusters. From the paper, CC BY 4.0." },
      { src: "assets/img/gcnn-lulc.webp", cap: "Land use and land cover of Khulna City Corporation, one of the model inputs. From the paper, CC BY 4.0." },
      { src: "assets/img/gcnn-validation.webp", cap: "Each functional zone compared with Maxar imagery, the MAP-WORLD basemap and the Khulna Development Authority plan. From the paper, CC BY 4.0." }
    ],
    thesis: [
      { src: "assets/img/rain-bias.webp", cap: "Raw ERA5 against gauge rainfall, overall and by season. Negative skill: the reanalysis misses the heavy days." },
      { src: "assets/img/rain-baseline.webp", cap: "Model against baselines on Kling-Gupta efficiency, daily R squared, monthly R squared, monsoon R squared and error." },
      { src: "assets/img/rain-phasevsjoint.webp", cap: "Phase-separated training against joint training on the same architecture." },
      { src: "assets/img/rain-ablation.webp", cap: "Ablation across nine model configurations, 2017 and 2018 test years." },
      { src: "assets/img/rain-uncertainty.webp", cap: "Daily predictive uncertainty with Monte Carlo dropout at the five gauge stations." },
      { src: "assets/img/rain-monthly.webp", cap: "Monthly observed and predicted rainfall at the five stations, 2017 test year." },
      { src: "assets/img/rain-failure.webp", cap: "Diagnosis of the 2018 failure: pressure shift, Cyclone Titli and the deficit of extreme rain days." },
      { src: "assets/img/rain-stgnn.webp", cap: "Architecture of the spatiotemporal graph network branch." },
      { src: "assets/img/rain-phase.webp", cap: "Two stage phase-separated training." },
      { src: "assets/img/rain-pipeline.webp", cap: "Full workflow from data acquisition to evaluation." }
    ],
    field: [
      { src: "assets/img/kda-layout.webp", cap: "Proposed paratransit stand at Dakbangla Mor, Khulna, from the study report submitted to the Khulna Development Authority." }
    ]
  },

  /* Projects. tags drive the filter. team is the group size from the report cover. */
  projects: [
    { id: "census-ml", title: "Predicting district GDP from census data with machine learning",
      meta: "Regional Planning Studio, November 2025. Team of 6.",
      tags: ["Machine learning", "Rural and regional"],
      result: "Ordinary least squares failed (test R squared minus 11.5). XGBoost reached 0.575.",
      body: [
        "The study models district level GDP in Bangladesh to understand regional economic gaps, starting with ordinary least squares and moving to ensemble machine learning.",
        "<ul><li>XGBoost: test R squared 0.575, RMSE 1.515, MAE 1.157. LightGBM: 0.552, 1.554, 1.093.</li><li>GDP is concentrated in Dhaka and its neighbours (USD 12.47 to 48.15 billion) while peripheral districts sit between USD 0.48 and 6.53 billion.</li><li>The strongest predictors were agricultural location quotient, internet access and household quality.</li></ul>",
        "The conclusion is that tree ensembles capture non-linear socioeconomic patterns that a linear model cannot, and that agriculture, digital access and housing are the policy levers to look at."
      ],
      tools: ["Python", "XGBoost", "LightGBM", "ArcGIS"],
      fig: { src: "assets/img/ml-gdp-map.webp", alt: "Choropleth map of Bangladesh districts by GDP in five classes from 0.48 to 48.15 billion US dollars, darkest around Dhaka", caption: "District GDP, 2022, from the report" } },

    { id: "senhati-gaps", title: "Service gaps across mouzas in Senhati Union, Khulna",
      meta: "Regional Planning Studio, 2025. Team of 6.",
      tags: ["Spatial analysis", "Rural and regional"],
      result: "Only 5 percent of Hazigram is served by the Union Health Complex, despite full coverage in Senhati.",
      body: [
        "Location quotients, buffer analysis and network analysis were used to compare school, health, growth centre, recreation and police coverage mouza by mouza.",
        "<ul><li>Senhati has more schools than it needs (three extra primary and high schools and two colleges, location quotient up to 2.33).</li><li>In Hazigram, 75 percent of the area has no primary school within reach and 66 percent has no high school.</li><li>The road network, not the number of facilities, is what turns coverage on paper into access.</li></ul>",
        "The report recommends new schools, colleges, health complexes and growth centres in neglected mouzas, and better roads linking Hazigram and northern Batibhita to the centre."
      ],
      tools: ["ArcGIS"],
      fig: { src: "assets/img/senhati-service-gaps.webp", alt: "Map of Senhati Union with primary schools, best routes and 500, 1000 and 1500 metre service buffers", caption: "Primary school coverage by walking buffer, from the report" } },

    { id: "senhati-market", title: "Market attractiveness and service coverage in Senhati Union",
      meta: "Regional Planning Studio, 2025. Team of 6.",
      tags: ["Spatial analysis", "Rural and regional"],
      result: "Pother Bazar captures about BDT 43.1 million in annual retail, against 30.4 million for Chandanimahal.",
      body: [
        "A mixed methods study of how households choose between two bazaars, using Reilly's gravity model, a composite Market Attractiveness Index, Relative Importance Index analysis and (multi)nomial logistic regression on a survey of 165 households and businesses in four mouzas.",
        "<ul><li>Market Attractiveness Index values are high, about 0.72 to 0.88.</li><li>Living in a bazaar's own mouza raises the odds of choosing it (odds ratio about 2.5). Each extra kilometre of distance raises the odds of going elsewhere (about 1.3).</li><li>Clothing and electronics anchor much more strongly to Chandanimahal.</li></ul>",
        "Spatial friction and administrative boundaries matter more than perceived quality, so the report points to access infrastructure and to strengthening both primary and secondary centres."
      ],
      tools: ["ArcGIS", "Excel", "Logistic regression"],
      fig: { src: "assets/img/senhati-markets.webp", alt: "Map of Senhati Union showing the service zones of Pother Bazar and Chandanimahal Bazar with settlements and roads", caption: "Service zones of the two bazaars, from the report" } },

    { id: "water-dpp", title: "Khulna Coastal Water Security Project, development project proposal",
      meta: "Project Planning Studio, 2026. Team of 8.",
      tags: ["Project planning", "Environment"],
      result: "20 year appraisal at 12 percent: benefit-cost ratio 3.85, internal rate of return 32.4 percent.",
      body: [
        "A full development project proposal in the format used for Local Government Engineering Department projects, for safe drinking water in a salinity affected coastal area.",
        "<ul><li>Ten solar powered reverse osmosis plants, and twenty community ponds upgraded with rainwater harvesting.</li><li>Total cost BDT 4,500 lakh (BDT 45 crore) over five years, serving about 16,000 households.</li><li>Economic appraisal over 20 years at a 12 percent discount rate: net present value BDT 2,856 million, benefit-cost ratio 3.85, payback 6.8 years, with a sensitivity analysis for cost overruns and lower benefits.</li></ul>"
      ],
      tools: ["Cost-benefit analysis"] },

    { id: "aquagrid", title: "Smart Aqua-Grid Bangladesh, concept note, technical and financial proposal",
      meta: "Project Planning Studio, 2026. Team of 4. Studio exercise.",
      tags: ["Project planning"],
      result: "Three proposal documents for an urban water, food and energy system, about USD 7.7 million over 48 months.",
      body: [
        "Written in response to a terms of reference for a study on an integrated urban water, food and energy nexus system, as a studio exercise in how consultants bid for development work.",
        "<ul><li>Concept note, technical proposal with comments on the terms of reference, and financial proposal.</li><li>Sites: Dhaka North, Gazipur City and the Narayanganj industrial zone.</li><li>Planned outputs include three treatment, biogas and aquaponic hubs, 10 km of sensor monitored water distribution and 500 trained urban farmers.</li></ul>"
      ],
      tools: [] },

    { id: "nbs", title: "Nature-based solutions for Wards 4, 5 and 6 of Khulna City",
      meta: "Environmental Planning and Management Studio, 2025. Team of 6.",
      tags: ["Environment", "Design"],
      result: "Three interventions, each tested with cost-benefit analysis. Covered drainage returned an IRR of 58.6 percent.",
      body: [
        "The report identifies environmental problems in three wards and proposes solutions with a feasibility test for each.",
        "<ul><li>Bioswales on Pratapaditto Road to relieve waterlogging, with a proposal that residents contribute 40 percent of the cost as labour.</li><li>Covering open drains in Ward 5, a public health and safety fix.</li><li>A fine-based rule against open dumping that pays for its own enforcement.</li></ul>",
        "Each intervention was appraised with net present value and internal rate of return, with a sample size set by Cochran's formula for the willingness to pay survey."
      ],
      tools: ["Cost-benefit analysis"] },

    { id: "env-profile", title: "Environmental profiling of Wards 4, 5 and 6 of Khulna City",
      meta: "Environmental Planning and Management Studio, 2025. Team of 6.",
      tags: ["Environment", "Spatial analysis"],
      result: "Ward by ward profile of air quality, heat, greenness, land cover, water and waste.",
      body: [
        "A profile of three wards from geospatial indicators: air quality, land surface temperature and urban heat island intensity, vegetation indices and tree cover, green space per head, land cover, waterbodies, rainfall and soil carbon, and waste management.",
        "The report shows spatial variation in vulnerability between the wards and ends by arguing for primary data collection and regular monitoring."
      ],
      tools: ["GIS", "Remote sensing"],
      fig: { src: "assets/img/env-wards.webp", alt: "Map of Wards 4, 5 and 6 of Khulna City Corporation", caption: "Study wards, from the report" } },

    { id: "gangarampur", title: "Development assessment of 3 No. Gangarampur Union, Batiaghata",
      meta: "Rural Planning Studio, December 2024. Team of 10.",
      tags: ["Rural and regional", "Environment"],
      result: "Waterlogging, thin health and education services and saline soils, with rice on 29.9 percent of the land.",
      body: [
        "An assessment of socioeconomic, environmental and infrastructure conditions in a rural union, using Copernicus satellite imagery and ArcGIS for land use change, a household questionnaire survey (sample size set with the n-hat method), and statistical tests including correlation and factor analysis.",
        "Recommendations: salt-tolerant crops, more health and education services, better drainage and water management, stronger disaster preparedness and participatory governance."
      ],
      tools: ["ArcGIS", "SPSS", "Google Earth"] },

    { id: "pra", title: "Participatory rural appraisal of Gaikur village, Dighalia",
      meta: "Participatory Planning Studio, June 2026. Team of 6.",
      tags: ["Community methods", "Rural and regional"],
      result: "Ten participatory tools used with residents, from social maps to problem trees.",
      body: [
        "The village was studied with the community drawing the maps: social, resource, mobility, and service and opportunity maps, and a transect walk.",
        "Institutions were mapped with a chapati (Venn) diagram, change over time was recorded with a historical timeline and trend analysis, and problems were broken down with a problem tree and a cause and effect diagram."
      ],
      tools: ["Participatory tools"],
      fig: { src: "assets/img/pra-chapati.webp", alt: "Institutional chapati diagram of Gaikur village showing circles for mosque, bazaar, union parishad, school, health centre and other institutions by size, distance and overlap", caption: "Institutional chapati diagram, Gaikur" } },

    { id: "road", title: "Road geometry and operating performance in Wards 9, 13, 14, 15 and 16",
      meta: "Transportation Planning Studio, 2024. Team of 5.",
      tags: ["Transport"],
      result: "Cross sections and traffic performance measured against the authority's guidelines.",
      body: [
        "Field surveys of speed, traffic volume and headway, plus an inventory of cross section elements, compared with the road authority's standards and split by peak and off-peak use.",
        "Recommendations include retiming traffic signals, structured parking around Boyra Mor and Khulna Government Mohila College, congestion pricing on heavy weekend roads such as Old Jessore Road, public transport investment, and repairing road surfaces and markings."
      ],
      tools: ["Field survey"] },

    { id: "landscape", title: "Landscape design of an urban park",
      meta: "Landscape Planning and Design Studio, 2023. Team of 6.",
      tags: ["Design"],
      result: "Site analysis, planting design and soundscape for a park in central Khulna.",
      body: [
        "A park site about 3 km from the Sonadanga business district was assessed for access and water features, then designed with a comparison of planting schemes and attention to soundscape.",
        "The site was marked in Google My Maps and Google Earth for the analysis."
      ],
      tools: ["Google My Maps", "Google Earth"] },

    { id: "surveying", title: "Surveying and cartography workshop",
      meta: "Surveying and Cartography Workshop, first year.",
      tags: ["Spatial analysis"],
      result: "Compiled lab report on drawing and scale.",
      body: [
        "A set of lab submissions on north signs and graphical scales, drawing a map of Bangladesh by grid, solving scale problems with the necessary drawings, and mapping a home district."
      ],
      tools: [] },

    { id: "water-transport", title: "Research proposal: water transport in Khulna City",
      meta: "Research Methodology Lab.",
      tags: ["Transport"],
      result: "A proposal to assess how well Khulna's river transport works, and why it is underused.",
      body: [
        "Khulna sits on the Rupsha and Bhairab rivers, yet water transport is underused because of weak infrastructure, little modernization and safety concerns. The proposal sets out the background, rationale and approach for assessing its effectiveness as an alternative to congested roads."
      ],
      tools: ["SPSS"] },

    { id: "uei", title: "Urban expansion intensity of Khulna, 1990 to 2025",
      meta: "In progress. Spatial analysis with a collaborator.",
      tags: ["Spatial analysis"],
      result: "Eight five-year intervals of expansion intensity linked to 12 driving factors.",
      body: [
        "Urban expansion intensity for eight five-year intervals, computed in ArcGIS Pro with ArcPy. The intensity uses actual land area as the denominator so coastal cells do not distort it.",
        "Twelve factors (seven static, five that change over time) are sampled by zonal statistics with a nearest-year fallback and written to tables ready for GeoDetector."
      ],
      tools: ["ArcGIS", "Python", "GeoDetector"] },

    { id: "gazipur", title: "Peri-urban growth and land degradation in Gazipur",
      meta: "In progress. Remote sensing study.",
      tags: ["Environment", "Spatial analysis"],
      result: "NDVI trends for 2015, 2020 and 2025 across core urban, exurban and rural zones.",
      body: [
        "Per-pixel NDVI trend slopes from least squares regression across three zones of expansion. For a degradation index, I argued for a composite of NDVI, NDBI, bare soil index and NDWI weighted by principal components, rather than a soil-line index, because Gazipur is humid subtropical and peri-urban."
      ],
      tools: ["Python", "Remote sensing"] }
  ],

  tools: [
    { name: "GIS and remote sensing", sub: "Mapping, spatial analysis and satellite data.",
      items: ["ArcGIS Pro", "ArcMap", "Google Earth Engine", "Google Earth Pro"],
      used: ["gangarampur", "senhati-gaps", "senhati-market", "census-ml", "uei", "env-profile"] },
    { name: "Modelling and code", sub: "Used in the thesis and the paper. The code for the thesis is organised as a 14 step pipeline.",
      items: ["Python", "PyTorch", "PyTorch Geometric", "pytorch-forecasting", "XGBoost", "LightGBM", "ArcPy", "NetworkX"],
      used: ["census-ml", "uei", "gazipur"] },
    { name: "Statistics and survey", sub: "Data collection and analysis in the field.",
      items: ["SPSS", "MS Excel", "Google Forms", "Google My Maps", "Focus group discussions"],
      used: ["gangarampur", "senhati-market", "landscape", "water-transport"] },
    { name: "Design and drafting", sub: "Drawings, plans and presentation.",
      items: ["AutoCAD", "Autodesk Civil 3D", "MS Project", "MS Word", "MS PowerPoint", "Canva"],
      used: [] }
  ],

  courses: [
    { group: "Planning theory and urban development", list: ["URP 1111 History and Evolution of Human Settlements", "URP 1113 Fundamentals of Planning Process", "URP 1211 Urban Planning Principles", "URP 2115 Urban Planning Techniques", "URP 3121 Rural Development Planning I", "URP 3223 Regional Development Planning", "URP 4171 Legal Basis of Planning", "URP 4223 Urban and Regional Economics", "URP 4273 Urban Governance", "URP 4275 Development Planning"] },
    { group: "Design, architecture and landscape", list: ["URP 1152 Basic Design in Architecture", "URP 1251 Introduction to Architectural History", "URP 2113 Site and Area Planning", "URP 2251 Landscape Planning and Design"] },
    { group: "GIS, survey and technical skills", list: ["URP 1281 Surveying and Cartography", "URP 2182 Social and Physical Surveys", "URP 2192 Programming Techniques for Planners", "URP 2281 GIS and Remote Sensing", "URP 2292 Computer Applications in Planning"] },
    { group: "Statistics, research and analytical methods", list: ["URP 2191 Statistics for Planners I", "URP 2291 Statistics for Planners II", "URP 3291 Operations Research and Systems Analysis", "URP 3294 Research Methodology"] },
    { group: "Environmental and disaster planning", list: ["Ch 1117 Environmental Chemistry", "CE 2241 Principles of Environmental Engineering", "URP 4141 Environmental Planning and Management", "URP 4217 Coastal and Special Zones Planning", "URP 4243 Hazards and Disaster Management"] },
    { group: "Transportation and infrastructure", list: ["CE 3151 Fundamentals of Transportation Engineering", "URP 3231 Transportation Planning", "URP 4111 Utility Services and Infrastructure Planning", "CE 3261 Water Resources Planning"] },
    { group: "Construction and engineering", list: ["CE 2107 Construction Technology and Materials", "CE 3107 Elements of Solid Mechanics", "CE 3207 Elements of Civil Engineering Structures"] },
    { group: "Housing, community and social planning", list: ["URP 3161 Housing and Real Estate Development", "URP 4175 Resettlement Planning", "Hum 2117 Sociology for Planners"] },
    { group: "Management, economics and finance", list: ["Hum 1217 Principles of Economics", "Hum 2217 Public and Local Government Finance", "Hum 3117 Accounting and Auditing for Planners", "URP 4161 Project Planning and Management"] },
    { group: "Communication, mathematics and foundations", list: ["Hum 1117 Functional English", "Math 1117 Mathematics I", "Math 1217 Mathematics II"] },
    { group: "Studios", list: ["URP 2214 Site and Area Planning Studio", "URP 2252 Landscape Planning and Design Studio", "URP 3112 Urban Planning Studio", "URP 3222 Rural Planning Studio", "URP 3232 Transportation Planning Studio", "URP 4124 Regional Planning Studio", "URP 4142 Environmental Planning and Management Studio", "URP 4262 Project Planning Studio", "URP 4272 Participatory Planning Studio", "URP 1254 Graphics for Planners", "URP 1292 Communication and Presentation Techniques Studio"] },
    { group: "Labs and workshops", list: ["URP 1282 Surveying and Cartography Workshop", "URP 3182 GIS and Remote Sensing Studio", "Ch 1118 Environmental Chemistry Lab", "CE 2108 Construction Materials Lab", "Hum 1118 English Skills Practices"] },
    { group: "Thesis and professional practice", list: ["URP 4000 Project and Thesis", "URP 4100 Internship"] }
  ]
};
