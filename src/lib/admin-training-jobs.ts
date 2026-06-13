import { formatTrainingTime } from '@/lib/utils/time';

export type JsonRecord = Record<string, any>;

export type TrainingJob = {
  id: string;
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  dataset_name?: string | null;
  filename?: string | null;
  dataset_info?: JsonRecord | null;
  status?: string | null;
  created_at?: string | null;
  completed_at?: string | null;
  pdf_path?: string | null;
  json_path?: string | null;
  results?: JsonRecord | null;
  config?: JsonRecord | null;
  training_time_formatted?: string | null;
  training_time_seconds?: number | string | null;
};

export type DatasetRow = {
  id: string;
  datasetName: string;
  user: string;
  samples: string;
  features: string;
  classes: string;
  targetColumn: string;
  status: string;
  uploadedAt: string | null;
  pdfPath: string | null;
  jsonPath: string | null;
  raw: TrainingJob;
};

export type ModelRow = {
  id: string;
  jobId: string;
  model: string;
  backend: string;
  dataset: string;
  user: string;
  accuracy: string;
  precision: string;
  recall: string;
  f1Score: string;
  trainingTime: string;
  status: string;
  createdAt: string | null;
  pdfPath: string | null;
  raw: TrainingJob;
};

function valueOrDash(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
}

function formatMetric(value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);

  const percent = numeric <= 1 ? numeric * 100 : numeric;
  return `${percent.toFixed(2)}%`;
}

function modelMetrics(results: JsonRecord | null | undefined): {
  accuracy: string;
  precision: string;
  recall: string;
  f1Score: string;
} {
  return {
    accuracy: formatMetric(results?.accuracy),
    precision: formatMetric(results?.precision),
    recall: formatMetric(results?.recall),
    f1Score: formatMetric(results?.f1_score ?? results?.f1Score),
  };
}

function getDatasetName(job: TrainingJob): string {
  return (
    job.dataset_name ||
    job.dataset_info?.dataset_name ||
    job.filename ||
    'Unknown Dataset'
  );
}

function getUserLabel(job: TrainingJob): string {
  return job.user_email || job.user_name || '-';
}

function getBackend(job: TrainingJob): string {
  return (
    job.config?.user_preferences?.qrnn_backend ||
    job.config?.backend ||
    '-'
  );
}

function getPath(source: JsonRecord | null | undefined, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as JsonRecord)[key];
  }, source);
}

function firstFormattedValue(results: JsonRecord | null | undefined, paths: string[]): string | null {
  for (const path of paths) {
    const value = getPath(results, path);
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return null;
}

function firstPositiveSeconds(results: JsonRecord | null | undefined, paths: string[]): number | null {
  for (const path of paths) {
    const numeric = Number(getPath(results, path));
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }

  return null;
}

export function extractModelTrainingTime(
  results: JsonRecord | null | undefined,
  modelType: string,
  variant?: string
): string {
  const normalizedModel = modelType.toLowerCase();
  const normalizedVariant = variant?.toLowerCase();
  let formattedPaths: string[] = [];
  let secondsPaths: string[] = [];

  if (normalizedModel === 'mlp' || normalizedModel === 'rnn') {
    formattedPaths = [
      'rnn.training_time_formatted',
      'training_times.rnn.training_time_formatted',
      'comparison.rnn_training_time_formatted',
    ];
    secondsPaths = [
      'rnn.training_time_seconds',
      'training_times.rnn.training_time_seconds',
      'comparison.rnn_training_time_seconds',
    ];
  } else if (normalizedModel === 'qnn' || normalizedModel === 'qrnn') {
    const variantKey = normalizedVariant ? `qrnn_${normalizedVariant}` : 'qrnn';
    const nestedPrefix = normalizedVariant ? `qrnn.${normalizedVariant}` : 'qrnn';

    formattedPaths = [
      `${nestedPrefix}.training_time_formatted`,
      `training_times.${variantKey}.training_time_formatted`,
      `comparison.${variantKey}_training_time_formatted`,
    ];
    secondsPaths = [
      `${nestedPrefix}.training_time_seconds`,
      `training_times.${variantKey}.training_time_seconds`,
      `comparison.${variantKey}_training_time_seconds`,
    ];
  }

  const formatted = firstFormattedValue(results, formattedPaths);
  if (formatted) return formatted;

  const seconds = firstPositiveSeconds(results, secondsPaths);
  if (seconds !== null) return formatTrainingTime(seconds);

  return '-';
}

function requestedModelNames(config: JsonRecord | null | undefined): string[] {
  const candidates = [
    config?.model_types,
    config?.models,
    config?.selected_models,
    config?.user_preferences?.model_types,
    config?.user_preferences?.models,
    config?.user_preferences?.selected_models,
  ];

  const labels = new Set<string>();

  candidates.forEach((candidate) => {
    const values = Array.isArray(candidate) ? candidate : candidate ? [candidate] : [];
    values.forEach((value) => {
      const normalized = String(value).toLowerCase();
      if (normalized.includes('mlp') || normalized.includes('rnn')) labels.add('MLP');
      if (normalized.includes('qnn') || normalized.includes('qrnn')) labels.add('QNN');
    });
  });

  return Array.from(labels);
}

export function mapDatasetRow(job: TrainingJob): DatasetRow {
  return {
    id: job.id,
    datasetName: getDatasetName(job),
    user: getUserLabel(job),
    samples: valueOrDash(job.dataset_info?.samples),
    features: valueOrDash(job.dataset_info?.features),
    classes: valueOrDash(job.dataset_info?.classes),
    targetColumn: valueOrDash(job.dataset_info?.target_column),
    status: job.status || 'queued',
    uploadedAt: job.created_at || null,
    pdfPath: job.pdf_path || null,
    jsonPath: job.json_path || null,
    raw: job,
  };
}

export function mapModelRows(job: TrainingJob): ModelRow[] {
  const rows: ModelRow[] = [];
  const results = job.results || {};
  const qrnn = results.qrnn;

  const pushRow = (model: string, metrics?: JsonRecord | null, modelType = model, variant?: string) => {
    rows.push({
      id: `${job.id}-${model.toLowerCase().replace(/\s+/g, '-')}`,
      jobId: job.id,
      model,
      backend: model === 'MLP' ? '-' : getBackend(job),
      dataset: getDatasetName(job),
      user: getUserLabel(job),
      ...modelMetrics(metrics),
      trainingTime: extractModelTrainingTime(results, modelType, variant),
      status: job.status || 'queued',
      createdAt: job.completed_at || job.created_at || null,
      pdfPath: job.pdf_path || null,
      raw: job,
    });
  };

  if (results.rnn) {
    pushRow('MLP', results.rnn, 'MLP');
  }

  if (qrnn?.clean || qrnn?.noisy || qrnn?.mitigated) {
    if (qrnn.clean) pushRow('QNN Clean', qrnn.clean, 'QNN', 'clean');
    if (qrnn.noisy) pushRow('QNN Noisy', qrnn.noisy, 'QNN', 'noisy');
    if (qrnn.mitigated) pushRow('QNN Mitigated', qrnn.mitigated, 'QNN', 'mitigated');
  } else if (qrnn) {
    pushRow('QNN', qrnn, 'QNN');
  }

  if (rows.length === 0) {
    const requested = requestedModelNames(job.config);
    const fallbackModels = requested.length > 0 ? requested : ['-'];
    fallbackModels.forEach((model) => pushRow(model, null));
  }

  return rows;
}
