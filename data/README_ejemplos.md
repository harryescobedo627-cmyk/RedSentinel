# Ejemplos de Datos Financieros para Demo

Este directorio contiene 4 archivos CSV con diferentes escenarios financieros que generan gráficas dinámicas y variadas.

## 📈 startup_crecimiento.csv
**Escenario: Startup Volátil con Crecimiento Acelerado**

- **Situación inicial**: Startup con $45K, pasa por cash negativo
- **Patrón**: Crecimiento exponencial CON volatilidad extrema
- **Características**:
  - Ingresos muy variables: $5K → $852K
  - Gastos altos que superan ingresos inicialmente
  - Cash flow negativo al principio, luego despega
  - Típico de startup tech con funding rounds
- **Gráficas esperadas**: Curvas con valles profundos y picos altos

## 🏢 empresa_estable.csv
**Escenario: Empresa con Ciclos Estacionales Marcados**

- **Situación inicial**: Empresa establecida con $180K
- **Patrón**: Fluctuaciones estacionales fuertes pero predecibles
- **Características**:
  - Ingresos oscilan entre $28K-$59K
  - Patrones de temporada alta/baja muy marcados
  - Crecimiento gradual año tras año
  - Típico de retail, turismo o agricultura
- **Gráficas esperadas**: Ondas pronunciadas con tendencia ascendente

## 📉 empresa_declive.csv
**Escenario: Empresa Grande en Reestructuración**

- **Situación inicial**: Empresa grande con $250K
- **Patrón**: Declive controlado con optimización agresiva
- **Características**:
  - Ingresos altos pero decrecientes: $85K → $30K
  - Reducción de gastos aún más agresiva
  - Cash flow positivo por eficiencia operacional
  - Típico de industria tradicional adaptándose
- **Gráficas esperadas**: Descenso controlado con cash creciente

## ⚡ empresa_volatil.csv
**Escenario: Negocio Extremadamente Volátil**

- **Situación inicial**: Empresa con $120K
- **Patrón**: Ingresos y gastos con variaciones extremas
- **Características**:
  - Ingresos saltan entre $15K y $185K sin patrón
  - Gastos siguen de cerca a los ingresos
  - Cash flow impredecible mes a mes
  - Típico de consultoría, eventos o proyectos
- **Gráficas esperadas**: Zigzag extremo, montaña rusa financiera

## 🎯 Cómo usar estos archivos

1. Ve a la página de **Upload** en tu aplicación
2. Prueba cada archivo CSV para ver patrones únicos:
   - **startup_crecimiento.csv**: Para ver recuperación dramática
   - **empresa_estable.csv**: Para ver patrones estacionales
   - **empresa_declive.csv**: Para ver optimización en declive
   - **empresa_volatil.csv**: Para ver caos controlado

## 📊 Datos técnicos

- **Período**: 24 meses (2024-2025)
- **Frecuencia**: Datos mensuales
- **Campos**: date, cash, income, expenses
- **Variabilidad**: Datos diseñados para generar gráficas NO lineales
- **Formato**: CSV estándar con headers