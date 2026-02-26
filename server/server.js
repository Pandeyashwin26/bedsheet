import express from 'express';
import cors from 'cors';
import { getMandiPrices, getDistanceKm, getAllCrops, getPriceTrend } from './data/mandiPrices.js';
import { getWeather, getRainfallRisk, getAvgTemperature, getAvgHumidity } from './data/weatherPatterns.js';
import { getSoilHealth, getSoilMoistureRisk } from './data/soilHealth.js';
import { getCropProfile, getAllCropsList } from './data/cropProfiles.js';

const app = express();
app.use(cors());
app.use(express.json());

// ========================
// AI ENGINE: Harvest Timing
// ========================
function computeHarvestRecommendation(crop, state) {
    const profile = getCropProfile(crop);
    const weather = getWeather(state);
    const rainfall = getRainfallRisk(state, 7);
    const soil = getSoilHealth(state);
    const soilMoisture = getSoilMoistureRisk(state);
    const mandis = getMandiPrices(crop);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const isHarvestMonth = profile.harvest_months.includes(currentMonth);

    // Score weather window (0–30 points)
    let weatherScore = 30;
    if (rainfall.risk === 'HIGH') weatherScore -= 20;
    else if (rainfall.risk === 'MEDIUM') weatherScore -= 10;
    if (weather.current.temperature > profile.optimal_temp.max + 10) weatherScore -= 10;
    if (weather.current.humidity > profile.optimal_humidity.max + 20) weatherScore -= 5;

    // Score price outlook (0–30 points)
    let priceScore = 15;
    let overallPriceTrend = 'STABLE';
    if (mandis.length > 0) {
        const trends = mandis.map(m => getPriceTrend(crop, m.mandi));
        const avgChange = trends.reduce((s, t) => s + (t.changePercent || 0), 0) / trends.length;
        if (avgChange > 5) { priceScore = 30; overallPriceTrend = 'RISING'; }
        else if (avgChange > 0) { priceScore = 22; overallPriceTrend = 'RISING'; }
        else if (avgChange > -5) { priceScore = 15; overallPriceTrend = 'STABLE'; }
        else { priceScore = 5; overallPriceTrend = 'FALLING'; }
    }

    // Score soil readiness (0–20 points)
    let soilScore = 15;
    if (soilMoisture.level === 'HIGH') soilScore = 8;
    else if (soilMoisture.level === 'CRITICAL') soilScore = 5;
    else if (soilMoisture.level === 'OK') soilScore = 20;

    // Season bonus (0–20 points)
    let seasonScore = isHarvestMonth ? 20 : 5;

    const totalScore = weatherScore + priceScore + soilScore + seasonScore;
    const confidence = Math.min(95, Math.max(35, totalScore));

    // Determine recommended window
    const dryDays = weather.forecast.filter(d => d.rainfall_mm === 0);
    let windowStart, windowEnd;
    if (dryDays.length >= 3 && isHarvestMonth) {
        windowStart = `${dryDays[0].day} days from now`;
        windowEnd = `${dryDays[Math.min(dryDays.length - 1, 4)].day} days from now`;
    } else if (isHarvestMonth) {
        windowStart = '3 days from now';
        windowEnd = '7 days from now';
    } else {
        const nextMonth = profile.harvest_months.find(m => m > currentMonth) || profile.harvest_months[0];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        windowStart = monthNames[nextMonth - 1];
        windowEnd = monthNames[Math.min(nextMonth, 11)];
    }

    const reasons = [
        { icon: rainfall.risk === 'LOW' ? '☀️' : '🌧️', title: `Weather: ${rainfall.risk} rainfall risk`, description: `${rainfall.totalRainfall}mm expected in 7 days. ${rainfall.rainyDays} rainy days forecast. ${rainfall.risk === 'LOW' ? 'Good conditions for harvest.' : 'Consider waiting for dry window.'}` },
        { icon: overallPriceTrend === 'RISING' ? '📈' : overallPriceTrend === 'FALLING' ? '📉' : '➡️', title: `Prices: ${overallPriceTrend}`, description: `Market prices across mandis are ${overallPriceTrend.toLowerCase()}. ${overallPriceTrend === 'RISING' ? 'Favorable time to sell.' : overallPriceTrend === 'FALLING' ? 'Consider holding if storage is available.' : 'Prices are steady.'}` },
        { icon: '🌱', title: `Soil: ${soil.type}`, description: `pH ${soil.ph}, moisture ${soil.moisture}%. ${soilMoisture.message}. ${soil.rating.nitrogen} nitrogen level.` },
        { icon: isHarvestMonth ? '✅' : '⏳', title: `Season: ${isHarvestMonth ? 'Harvest season active' : 'Not primary harvest season'}`, description: isHarvestMonth ? `Current month is within the optimal harvest window for ${profile.name}.` : `Primary harvest months are ${profile.harvest_months.map(m => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]).join(', ')}.` }
    ];

    return {
        recommended_window: `${windowStart} — ${windowEnd}`,
        confidence,
        weather_risk: rainfall.risk,
        price_outlook: overallPriceTrend,
        soil_status: soilMoisture.level,
        reasons
    };
}

// ========================
// AI ENGINE: Market Matching
// ========================
function computeMarketRecommendation(crop, state) {
    const mandis = getMandiPrices(crop);
    if (!mandis.length) return { ranked_mandis: [], reasons: [{ icon: '❌', title: 'No market data', description: 'No mandi data available for this crop.' }] };

    const ranked = mandis.map(m => {
        const latestPrice = m.prices[0];
        const trend = getPriceTrend(crop, m.mandi);
        const distance = getDistanceKm(state, m.mandi);
        const transportCost = Math.round(distance * 3.5); // ₹3.5/km/quintal
        const netRevenue = latestPrice.price - transportCost;

        // Score: price (40%) + trend (25%) + proximity (20%) + low arrivals bonus (15%)
        let score = 0;
        score += (latestPrice.price / 100) * 0.4;
        score += (trend.changePercent > 0 ? trend.changePercent * 2.5 : trend.changePercent * 1.5);
        score += Math.max(0, (2000 - distance) / 100) * 0.2;
        score += Math.max(0, (1000 - latestPrice.arrival) / 100) * 0.15;

        return {
            mandi: m.mandi,
            state: m.state,
            price: latestPrice.price,
            trend: latestPrice.trend,
            distance_km: distance,
            transport_cost: transportCost,
            net_revenue: netRevenue,
            arrival: latestPrice.arrival,
            score
        };
    }).sort((a, b) => b.score - a.score);

    const top = ranked[0];
    const reasons = [
        { icon: '💰', title: `Best price at ${top.mandi}`, description: `₹${top.price}/quintal — highest effective price after transport costs among ${ranked.length} mandis analyzed.` },
        { icon: '🚛', title: `Transport: ${top.distance_km} km`, description: `Estimated transport cost ₹${top.transport_cost}/quintal. Net revenue: ₹${top.net_revenue}/quintal.` },
        { icon: '📊', title: `Supply: ${top.arrival} tonnes arriving`, description: `${top.arrival < 500 ? 'Low supply — good for sellers, likely to get better price.' : top.arrival < 1000 ? 'Moderate supply at this mandi.' : 'High supply — consider alternative mandis if possible.'}` },
        { icon: top.trend === 'rising' ? '📈' : '📉', title: `Price trend: ${top.trend}`, description: `Prices at ${top.mandi} are ${top.trend}. ${top.trend === 'rising' ? 'Good momentum for sellers.' : top.trend === 'falling' ? 'Be cautious, prices may drop further.' : 'Stable market conditions.'}` }
    ];

    return {
        ranked_mandis: ranked.slice(0, 5),
        best_net_revenue: top.net_revenue,
        reasons
    };
}

// ========================
// AI ENGINE: Spoilage Risk
// ========================
function computeSpoilageRisk(crop, state) {
    const profile = getCropProfile(crop);
    const weather = getWeather(state);
    const avgTemp = getAvgTemperature(state);
    const avgHumidity = getAvgHumidity(state);

    // Base spoilage from crop perishability
    let baseRisk = { 'VERY HIGH': 70, 'HIGH': 50, 'MEDIUM': 30, 'LOW': 15, 'VERY LOW': 5 }[profile.perishability] || 30;

    // Temperature penalty
    const tempDiff = Math.max(0, avgTemp - profile.optimal_temp.max);
    baseRisk += tempDiff * 2;

    // Humidity penalty
    const humidityDiff = Math.max(0, avgHumidity - profile.optimal_humidity.max);
    baseRisk += humidityDiff * 0.5;

    // Clamp
    const riskPercent = Math.min(95, Math.max(5, Math.round(baseRisk)));

    const riskCategory = riskPercent >= 70 ? 'CRITICAL' : riskPercent >= 50 ? 'HIGH' : riskPercent >= 25 ? 'MEDIUM' : 'LOW';
    const expectedLossKg = Math.round((riskPercent / 100) * 100); // per quintal
    const timeToCritical = profile.perishability === 'VERY HIGH' ? '2-3 days' : profile.perishability === 'HIGH' ? '5-7 days' : profile.perishability === 'LOW' ? '3-4 weeks' : '2+ months';

    const reasons = [
        { icon: '🍎', title: `Crop: ${profile.perishability} perishability`, description: `${profile.name} has a natural shelf life of ${profile.shelf_life_days} days and loses ~${profile.spoilage_rate_per_day}% quality per day without cold storage.` },
        { icon: '🌡️', title: `Temperature: ${avgTemp}°C average`, description: `Optimal storage for ${profile.name} is ${profile.optimal_temp.min}–${profile.optimal_temp.max}°C. ${avgTemp > profile.optimal_temp.max ? 'Current temperature accelerates spoilage.' : 'Temperature is within safe range.'}` },
        { icon: '💧', title: `Humidity: ${avgHumidity}%`, description: `${avgHumidity > profile.optimal_humidity.max ? 'High humidity increases fungal growth risk.' : avgHumidity < profile.optimal_humidity.min ? 'Low humidity may cause dehydration.' : 'Humidity is in acceptable range.'}` },
        { icon: '⏱️', title: `Time factor`, description: `Without intervention, quality will degrade to critical in ~${timeToCritical}. ${profile.cold_storage_extension > 30 ? `Cold storage can extend life by ${profile.cold_storage_extension} days.` : 'Quick market access is essential.'}` }
    ];

    return { spoilage_risk_percent: riskPercent, expected_loss_kg: expectedLossKg, risk_category: riskCategory, time_to_critical: timeToCritical, reasons };
}

// ========================
// AI ENGINE: Preservation
// ========================
function computePreservationActions(crop, state) {
    const profile = getCropProfile(crop);
    const spoilage = computeSpoilageRisk(crop, state);

    const allMethods = [
        { method: "Cold Storage (कोल्ड स्टोरेज)", cost_category: "HIGH", effectiveness_percent: 90, shelf_life_extension_days: profile.cold_storage_extension, availability: "District towns", instructions: "Store at recommended temperature. Check availability at nearest cold storage facility.", applicable: ['vegetable', 'fruit', 'grain', 'oilseed'] },
        { method: "Solar Drying (सौर सुखाना)", cost_category: "LOW", effectiveness_percent: 70, shelf_life_extension_days: Math.round(profile.shelf_life_days * 3), availability: "Anywhere with sunlight", instructions: "Spread produce on clean surface in direct sunlight for 2-3 days. Turn regularly.", applicable: ['grain', 'oilseed', 'vegetable'] },
        { method: "Neem Leaf Treatment (नीम पत्ती उपचार)", cost_category: "LOW", effectiveness_percent: 55, shelf_life_extension_days: 15, availability: "Rural areas", instructions: "Layer dried neem leaves between stored produce. Repels insects naturally.", applicable: ['grain', 'oilseed'] },
        { method: "Hermetic Storage Bags (हर्मेटिक बैग)", cost_category: "MEDIUM", effectiveness_percent: 80, shelf_life_extension_days: 60, availability: "Agri-input shops", instructions: "Store dried grain in airtight PICS bags. Kills insects without chemicals.", applicable: ['grain', 'oilseed'] },
        { method: "Sand Layering (रेत परत)", cost_category: "LOW", effectiveness_percent: 50, shelf_life_extension_days: 20, availability: "Everywhere", instructions: "Layer root vegetables with dry sand in cool, dark space. Maintains moisture balance.", applicable: ['vegetable'] },
        { method: "Evaporative Cooling (जीरो एनर्जी चैम्बर)", cost_category: "LOW", effectiveness_percent: 65, shelf_life_extension_days: 10, availability: "Can be built at home", instructions: "Build a brick chamber, fill gap with wet sand. Places produce inside. Reduces temp by 10-15°C.", applicable: ['vegetable', 'fruit'] },
        { method: "Waxing / Coating (मोम लेपन)", cost_category: "MEDIUM", effectiveness_percent: 60, shelf_life_extension_days: 14, availability: "Agri-input shops", instructions: "Apply food-grade wax coating to fruits. Reduces moisture loss and microbial growth.", applicable: ['fruit'] },
        { method: "Controlled Atmosphere (नियंत्रित वातावरण)", cost_category: "HIGH", effectiveness_percent: 85, shelf_life_extension_days: 30, availability: "Large mandis/warehouses", instructions: "Store in sealed chambers with reduced oxygen. Best for large quantities.", applicable: ['fruit'] },
        { method: "Proper Ventilation (हवादार भंडारण)", cost_category: "LOW", effectiveness_percent: 45, shelf_life_extension_days: 7, availability: "Everywhere", instructions: "Store in raised jute bags with gaps for airflow. Avoid direct floor contact.", applicable: ['grain', 'oilseed', 'fiber'] },
        { method: "Chemical Fumigation (रासायनिक धूमन)", cost_category: "MEDIUM", effectiveness_percent: 75, shelf_life_extension_days: 90, availability: "Agri-input shops", instructions: "Use approved fumigants like aluminium phosphide tablets. Follow safety protocols strictly.", applicable: ['grain'] }
    ];

    // Filter by crop category and sort by cost-effectiveness ratio
    const applicable = allMethods
        .filter(m => m.applicable.includes(profile.category))
        .sort((a, b) => {
            const ratioA = a.effectiveness_percent / ({ LOW: 1, MEDIUM: 2, HIGH: 3 }[a.cost_category]);
            const ratioB = b.effectiveness_percent / ({ LOW: 1, MEDIUM: 2, HIGH: 3 }[b.cost_category]);
            return ratioB - ratioA;
        })
        .slice(0, 5);

    const reasons = [
        { icon: '📋', title: `${applicable.length} methods ranked`, description: `Actions are sorted by cost-effectiveness ratio — best value methods appear first. Low-cost rural options are prioritized.` },
        { icon: '🌡️', title: `Based on ${profile.name} storage needs`, description: `${profile.name} needs ${profile.optimal_temp.min}–${profile.optimal_temp.max}°C and ${profile.optimal_humidity.min}–${profile.optimal_humidity.max}% humidity for optimal storage.` },
        { icon: spoilage.risk_category === 'LOW' ? '🟢' : '🟠', title: `Current risk: ${spoilage.risk_category}`, description: `With ${spoilage.spoilage_risk_percent}% spoilage risk, ${spoilage.risk_category === 'LOW' || spoilage.risk_category === 'MEDIUM' ? 'basic preservation is sufficient.' : 'immediate action is recommended.'}` }
    ];

    return { actions: applicable, reasons };
}

// ========================
// API ROUTES
// ========================
app.get('/api/crops', (req, res) => {
    res.json(getAllCropsList());
});

app.get('/api/regions', (req, res) => {
    const states = ['Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Haryana', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'West Bengal', 'Odisha', 'Andhra Pradesh', 'Punjab', 'Tamil Nadu'];
    res.json(states);
});

app.post('/api/recommend', (req, res) => {
    try {
        const { crop, state } = req.body;
        if (!crop || !state) return res.status(400).json({ error: 'crop and state are required' });

        const profile = getCropProfile(crop);
        if (!profile) return res.status(404).json({ error: 'Unknown crop' });

        const harvest = computeHarvestRecommendation(crop, state);
        const market = computeMarketRecommendation(crop, state);
        const spoilage = computeSpoilageRisk(crop, state);
        const preservation = computePreservationActions(crop, state);

        res.json({ crop: profile.name, state, harvest, market, spoilage, preservation });
    } catch (err) {
        console.error('Recommendation error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/mandi-prices/:crop', (req, res) => {
    const data = getMandiPrices(req.params.crop);
    if (!data.length) return res.status(404).json({ error: 'No price data for this crop' });
    res.json(data);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🌾 KisanMitra API running on http://localhost:${PORT}`);
});
