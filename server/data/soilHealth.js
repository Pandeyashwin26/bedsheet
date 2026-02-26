// Soil health data by state — based on ICAR Soil Health Card patterns
const soilHealthData = {
    "Maharashtra": { type: "Black Cotton (Vertisol)", type_hi: "काली कपास मिट्टी", ph: 7.8, organic_carbon: 0.55, nitrogen: 210, phosphorus: 18, potassium: 280, moisture: 35, rating: { nitrogen: "LOW", phosphorus: "MEDIUM", potassium: "HIGH", organic_carbon: "LOW" } },
    "Karnataka": { type: "Red Laterite (Alfisol)", type_hi: "लाल लैटेराइट मिट्टी", ph: 6.5, organic_carbon: 0.45, nitrogen: 190, phosphorus: 15, potassium: 220, moisture: 28, rating: { nitrogen: "LOW", phosphorus: "LOW", potassium: "MEDIUM", organic_carbon: "LOW" } },
    "Uttar Pradesh": { type: "Alluvial (Inceptisol)", type_hi: "जलोढ़ मिट्टी", ph: 7.2, organic_carbon: 0.60, nitrogen: 240, phosphorus: 22, potassium: 260, moisture: 40, rating: { nitrogen: "MEDIUM", phosphorus: "MEDIUM", potassium: "MEDIUM", organic_carbon: "MEDIUM" } },
    "Haryana": { type: "Alluvial Sandy Loam", type_hi: "जलोढ़ बलुई दोमट", ph: 7.5, organic_carbon: 0.50, nitrogen: 220, phosphorus: 20, potassium: 240, moisture: 32, rating: { nitrogen: "MEDIUM", phosphorus: "MEDIUM", potassium: "MEDIUM", organic_carbon: "LOW" } },
    "Madhya Pradesh": { type: "Black Cotton (Vertisol)", type_hi: "काली कपास मिट्टी", ph: 7.6, organic_carbon: 0.58, nitrogen: 230, phosphorus: 19, potassium: 300, moisture: 38, rating: { nitrogen: "MEDIUM", phosphorus: "MEDIUM", potassium: "HIGH", organic_carbon: "LOW" } },
    "Rajasthan": { type: "Desert Sandy (Aridisol)", type_hi: "रेगिस्तानी रेतीली मिट्टी", ph: 8.2, organic_carbon: 0.25, nitrogen: 140, phosphorus: 12, potassium: 200, moisture: 15, rating: { nitrogen: "LOW", phosphorus: "LOW", potassium: "LOW", organic_carbon: "VERY LOW" } },
    "Gujarat": { type: "Saline-Alkaline (Aridisol)", type_hi: "लवणीय-क्षारीय मिट्टी", ph: 8.0, organic_carbon: 0.35, nitrogen: 160, phosphorus: 14, potassium: 230, moisture: 20, rating: { nitrogen: "LOW", phosphorus: "LOW", potassium: "MEDIUM", organic_carbon: "LOW" } },
    "West Bengal": { type: "Alluvial Clay (Entisol)", type_hi: "जलोढ़ चिकनी मिट्टी", ph: 6.8, organic_carbon: 0.70, nitrogen: 260, phosphorus: 25, potassium: 270, moisture: 50, rating: { nitrogen: "MEDIUM", phosphorus: "HIGH", potassium: "MEDIUM", organic_carbon: "MEDIUM" } },
    "Odisha": { type: "Red & Yellow (Alfisol)", type_hi: "लाल और पीली मिट्टी", ph: 6.2, organic_carbon: 0.48, nitrogen: 200, phosphorus: 16, potassium: 210, moisture: 42, rating: { nitrogen: "LOW", phosphorus: "MEDIUM", potassium: "MEDIUM", organic_carbon: "LOW" } },
    "Andhra Pradesh": { type: "Red Sandy Loam (Alfisol)", type_hi: "लाल बलुई दोमट", ph: 6.8, organic_carbon: 0.42, nitrogen: 185, phosphorus: 14, potassium: 215, moisture: 25, rating: { nitrogen: "LOW", phosphorus: "LOW", potassium: "MEDIUM", organic_carbon: "LOW" } },
    "Punjab": { type: "Alluvial Loam (Inceptisol)", type_hi: "जलोढ़ दोमट मिट्टी", ph: 7.8, organic_carbon: 0.52, nitrogen: 235, phosphorus: 24, potassium: 250, moisture: 35, rating: { nitrogen: "MEDIUM", phosphorus: "HIGH", potassium: "MEDIUM", organic_carbon: "LOW" } },
    "Tamil Nadu": { type: "Red Loam (Alfisol)", type_hi: "लाल दोमट मिट्टी", ph: 7.0, organic_carbon: 0.40, nitrogen: 180, phosphorus: 16, potassium: 225, moisture: 22, rating: { nitrogen: "LOW", phosphorus: "MEDIUM", potassium: "MEDIUM", organic_carbon: "LOW" } }
};

export function getSoilHealth(state) {
    return soilHealthData[state] || soilHealthData["Maharashtra"];
}

export function getSoilMoistureRisk(state) {
    const soil = getSoilHealth(state);
    if (soil.moisture > 45) return { level: "HIGH", message: "Waterlogged risk" };
    if (soil.moisture > 30) return { level: "OK", message: "Adequate moisture" };
    if (soil.moisture > 15) return { level: "LOW", message: "Needs irrigation" };
    return { level: "CRITICAL", message: "Severe stress" };
}

export default soilHealthData;
