// Script de prueba para verificar el API del backend
const fs = require('fs');
const path = require('path');

// Simular datos del CSV de prueba
const testData = [
  { date: '2024-01-01', cash: 150000, income: 25000, expenses: 18000 },
  { date: '2024-01-08', cash: 157000, income: 22000, expenses: 15000 },
  { date: '2024-01-15', cash: 164000, income: 20000, expenses: 13000 },
  { date: '2024-01-22', cash: 171000, income: 24000, expenses: 17000 },
  { date: '2024-01-29', cash: 178000, income: 26000, expenses: 19000 }
];

// Probar diagnóstico
console.log('🧪 Probando diagnóstico...');
const diagnosisService = require('./src/backend/services/diagnosisService');
const diagnosis = diagnosisService.analyze(testData);
console.log('📊 Resultado del diagnóstico:');
console.log(JSON.stringify(diagnosis, null, 2));

// Probar pronóstico
console.log('\n🔮 Probando pronóstico...');
const forecastService = require('./src/backend/services/forecastService');
const forecast = forecastService.generateForecast(testData);
console.log('📈 Resultado del pronóstico:');
console.log(JSON.stringify(forecast, null, 2));

// Probar recomendaciones
console.log('\n💡 Probando recomendaciones...');
const recommendService = require('./src/backend/services/recommendService');
const recommendations = recommendService.generateRecommendations(diagnosis, forecast);
console.log('🎯 Resultado de las recomendaciones:');
console.log(JSON.stringify(recommendations, null, 2));