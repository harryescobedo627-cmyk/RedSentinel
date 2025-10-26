# AI Financial Decision Assistant (SME) - Hackathon scaffold

Estructura principal:
- src/backend: servidor Express con controladores y servicios.
  - /controllers: endpoints REST (upload, diagnose, forecast, recommend, execute).
  - /services: lógica de negocio (diagnosis, forecast, recommend, execute) — actualmente docstrings.
- src/frontend: Next.js pages y componentes UI (Upload, Diagnosis, Forecast, What-if, Recommendations).
- data/sample.csv: CSV de ejemplo para pruebas.
- package.json: scripts para arrancar frontend/backend (placeholder).

Endpoints REST (backend):
- POST /upload       -> recibir CSV y almacenar temporalmente
- POST /diagnose     -> analizar datos y devolver alertas RAG
- POST /forecast     -> generar forecast (base/optimistic/pessimistic)
- POST /recommend    -> producir recomendaciones accionables
- POST /execute      -> ejecutar o simular la ejecución de una recomendación

Cómo usar (próximo paso):
1. npm install
2. npm run dev (script pendiente de implementación)
3. Abrir frontend en /src/frontend (Next.js pages)

Nota: Este scaffold no implementa la lógica de negocio; contiene stubs y docstrings donde agregarla.
