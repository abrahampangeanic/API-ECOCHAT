const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

// Configurar el exportador de trazas
const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT, // Cambia la URL al colector que uses
});

// Configurar el exportador de métricas
const metricExporter = new OTLPMetricExporter({
  url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT, // Cambia la URL al colector que uses
});

// Crear un lector de métricas para exportar periódicamente
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 1000, // Exportar métricas cada segundo
});

// Crear un recurso con información del servicio
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'API-ECOChat', // Nombre del servicio
  [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.15', // Opcional: agrega la versión del servicio
});

// Configurar el SDK de OpenTelemetry
const sdk = new NodeSDK({
  traceExporter,
  metricReader, // Agregar el lector de métricas directamente al SDK
  spanProcessor: new SimpleSpanProcessor(traceExporter),
  resource, // Agregar el recurso con el nombre del servicio
});

try {
  // Iniciar el SDK
  sdk.start();
  console.log('OpenTelemetry SDK iniciado correctamente.');
} catch (error) {
  console.error('Error al iniciar el OpenTelemetry SDK:', error);
}
