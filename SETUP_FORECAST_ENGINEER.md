# Setup para Forecast Engineer (Rol 3)

Eres el **Forecast Engineer**. Tu responsabilidad: implementar el forecast de cash flow en 3 escenarios (base, optimistic, pessimistic), calcular riesgo de quiebra, y exponer el endpoint `/forecast`.

## CONTEXTO DEL PROYECTO

Estamos construyendo un asistente financiero AI para PYMEs:
- Usuario sube CSV → `/upload` (otro ingeniero)
- Sistema diagnostica → `/diagnose` (otro ingeniero - ya limpia datos y calcula métricas actuales)
- **Forecast cash → `/forecast` (TÚ lo implementas)**
- Genera 3 planes de recomendación → `/recommend` (otro ingeniero)
- Usuario ejecuta plan → `/execute` (otro ingeniero)

## TU ALCANCE (Endpoint que debes implementar)

### GET /api/forecast?job_id={job_id}&horizon={30|60|90}

**Query params:**
- `job_id`: string uuid (mismo que devolvió `/upload`)
- `horizon`: 30, 60 o 90 (días a proyectar)

**Response 200:**
```json
{
  "job_id": "uuid-string",
  "horizon_days": 90,
  "forecasts": {
    "base": [
      { "date": "2024-01-20", "cash": 12000.50 },
      { "date": "2024-02-20", "cash": 11500.25 },
      { "date": "2024-03-20", "cash": 10200.75 }
    ],
    "optimistic": [
      { "date": "2024-01-20", "cash": 12000.50 },
      { "date": "2024-02-20", "cash": 12500.00 },
      { "date": "2024-03-20", "cash": 13200.00 }
    ],
    "pessimistic": [
      { "date": "2024-01-20", "cash": 12000.50 },
      { "date": "2024-02-20", "cash": 10000.00 },
      { "date": "2024-03-20", "cash": 7500.00 }
    ]
  },
  "break_risk": {
    "probability_runout_within_horizon": 0.27,
    "expected_days_to_zero": 67
  },
  "assumptions": {
    "base_growth_rate_monthly": 0.01,
    "optimistic_delta": 0.05,
    "pessimistic_delta": -0.05,
    "confidence_interval": 0.8
  }
}
```

**Tu trabajo:**
1. Cargar datos limpios del job_id (el Diagnosis Engineer ya los limpió)
2. **Calcular 3 escenarios de forecast:**
   - **Base**: proyección con tendencia histórica promedio
   - **Optimistic**: +5% crecimiento mensual sobre base
   - **Pessimistic**: -5% sobre base
3. **Calcular break_risk:**
   - `probability_runout_within_horizon`: probabilidad de cash ≤ 0 en el horizonte
   - `expected_days_to_zero`: días estimados hasta cash = 0
4. Retornar series temporales listas para graficar en frontend

---

## FORMATO DE DATOS QUE RECIBES (del Diagnosis Engineer)

El job_id apunta a un CSV ya limpio con estas columnas:
```
date,revenue,cost_of_goods_sold,operating_expenses,payroll,marketing,other_expenses,accounts_receivable,accounts_payable,customers
```

También puedes llamar internamente a `/diagnose` para obtener métricas actuales:
```json
{
  "metrics": {
    "cash_balance": 12000.50,
    "avg_monthly_revenue": 10500.00,
    "avg_monthly_expenses": 9200.00,
    "burn_rate_months": 1.3
  }
}
```

---

## LÓGICA DE FORECAST SUGERIDA

### Escenario BASE:
1. Calcular tendencia histórica (regresión lineal simple o promedio móvil)
2. `monthly_net_cash_flow = avg_monthly_revenue - avg_monthly_expenses`
3. Proyectar: `cash(t+1) = cash(t) + monthly_net_cash_flow`
4. Repetir para cada mes hasta `horizon_days`

### Escenario OPTIMISTIC:
1. Tomar forecast base
2. Aplicar factor de crecimiento: `cash(t) * 1.05` mensualmente
3. Ajustar revenues +5%, mantener costos estables

### Escenario PESSIMISTIC:
1. Tomar forecast base
2. Aplicar factor de decrecimiento: revenues -5%, costos estables o +2%
3. Simular peor caso sin quebrar supuestos

### Break Risk:
1. En escenario base, encontrar primer `t` donde `cash(t) ≤ 0`
2. `expected_days_to_zero = t`
3. `probability_runout_within_horizon = (escenarios negativos / total simulaciones)`
   - Puedes hacer Monte Carlo simple con 100 iteraciones variando ±10% revenues/costs
   - O usar regla heurística: si pessimistic toca 0 antes de horizon → prob = 0.8

---

## ARCHIVOS QUE DEBES MODIFICAR

Ya están scaffoldeados en:
- `src/backend/controllers/forecastController.js` → implementar lógica del endpoint
- `src/backend/services/forecastService.js` → funciones de forecast y risk

**Estructura sugerida en forecastService.js:**
```javascript
// Función 1: calcular forecast base
exports.generateBaseForecast = (historicalData, horizon) => { /* ... */ };

// Función 2: generar escenario optimistic
exports.generateOptimisticForecast = (baseForecast) => { /* ... */ };

// Función 3: generar escenario pessimistic
exports.generatePessimisticForecast = (baseForecast) => { /* ... */ };

// Función 4: calcular break risk
exports.calculateBreakRisk = (baseForecast, pessimisticForecast, horizon) => { /* ... */ };

// Función principal
exports.generateForecast = (job_id, horizon) => {
  // 1. Cargar datos históricos
  // 2. generateBaseForecast()
  // 3. generateOptimisticForecast()
  // 4. generatePessimisticForecast()
  // 5. calculateBreakRisk()
  // 6. Retornar objeto JSON
};
```

---

## MOCKS DISPONIBLES

Para testear sin implementar todo:
- `src/backend/mocks/forecast.json` → ejemplo de respuesta esperada

Puedes cargar este mock temporalmente mientras implementas la lógica real.

---

## COORDINACIÓN CON OTROS ROLES

- **Diagnosis Engineer (Rol 2)**: te provee datos limpios y métricas. NO re-implementes limpieza.
- **Frontend (Rol 1)**: espera tu JSON exacto. NO cambies nombres de campos (`forecasts.base`, `break_risk`, etc.)
- **Decision Engine (Rol 4)**: usará tus forecasts para simular impacto de planes. Tu trabajo termina en generar las 3 series.

---

## FORMATO DE SERIES TEMPORALES

Cada serie debe ser un array de objetos:
```javascript
[
  { "date": "2024-01-20", "cash": 12000.50 },
  { "date": "2024-02-20", "cash": 11500.25 },
  // ...
]
```

**Importante:**
- `date` en formato ISO (YYYY-MM-DD)
- Una entrada por mes (o por día si horizon < 30)
- Ordenado cronológicamente
- Primera entrada = cash_balance actual (del diagnose)

---

## CHECKLIST DE ENTREGABLES

- [ ] GET /api/forecast?job_id=X&horizon=90 funcional
- [ ] Escenario base implementado (tendencia histórica)
- [ ] Escenario optimistic implementado (+5%)
- [ ] Escenario pessimistic implementado (-5%)
- [ ] Break risk calculado (probability + expected_days_to_zero)
- [ ] Series temporales en formato correcto (date, cash)
- [ ] Validación de horizons (solo 30/60/90 permitidos)
- [ ] Manejo de errores si job_id no existe

---

## CONSIDERACIONES TÉCNICAS

**Stack:**
- Node.js Express (ya scaffoldeado)
- Para regresión lineal: puedes usar librería `simple-statistics` o implementar manualmente
- Para Monte Carlo (opcional): simular 100 escenarios con variación ±10%

**Simplificaciones permitidas para hackathon:**
- Forecast lineal simple OK (no necesitas ARIMA/Prophet)
- Break risk puede ser heurístico (no necesitas full Monte Carlo si no da tiempo)
- Intervalo de confianza fijo (0.8) OK

**Performance:**
- Cache forecasts por job_id+horizon (no recalcular si ya existe)
- Timeout de cálculo: máx 5 segundos

---

## EJEMPLO DE FLUJO

1. Frontend llama: `GET /api/forecast?job_id=abc123&horizon=90`
2. Tu controller carga datos del job_id
3. forecastService.generateForecast() calcula 3 escenarios
4. Retornas JSON con `forecasts` + `break_risk`
5. Frontend grafica las 3 líneas en un chart

---

## TESTING

Usa el CSV de ejemplo en `/data/sample.csv`:
```csv
date,revenue,cost_of_goods_sold,operating_expenses,payroll,marketing,other_expenses,accounts_receivable,accounts_payable,customers
2024-01-01,1000,400,200,150,50,50,300,200,50
2024-02-01,1100,420,210,150,55,55,320,210,52
2024-03-01,1050,410,205,150,52,52,310,205,51
```

Forecast esperado (base, horizonte 30 días):
- Partiendo de cash_balance ≈ 0 (acumulado)
- Net flow mensual ≈ +100
- Proyección: cash crece ~100/mes

---

## PREGUNTAS FRECUENTES

**Q: ¿Qué hago si no hay suficientes datos históricos?**
A: Mínimo 2 meses de datos. Si menos, retorna error 400 "Insufficient data".

**Q: ¿El forecast debe incluir estacionalidad?**
A: No para MVP. Proyección lineal suficiente.

**Q: ¿Debo considerar cuentas por cobrar/pagar?**
A: Opcional. Si tienes tiempo, ajusta cash flow por AR/AP. Si no, usa solo revenue-expenses.

**Q: ¿Cómo coordino con Decision Engine (Rol 4)?**
A: Tu forecast es "as-is". Rol 4 llamará a tu endpoint y aplicará deltas de sus planes.

---

EMPIEZA IMPLEMENTANDO:
1. forecastController.js con mock response
2. forecastService.generateBaseForecast() con lógica simple
3. Prueba con Postman/curl
4. Luego agrega optimistic/pessimistic
5. Finalmente break_risk

¡Éxito! 🚀
