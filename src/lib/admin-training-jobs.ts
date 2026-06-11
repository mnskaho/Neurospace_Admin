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

function getTrainingTime(job: TrainingJob): string {
  if (job.training_time_formatted) return job.training_time_formatted;
  if (job.training_time_seconds !== null && job.training_time_seconds !== undefined) {
    return `${job.training_time_seconds}s`;
  }
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

  const pushRow = (model: string, metrics?: JsonRecord | null) => {
    rows.push({
      id: `${job.id}-${model.toLowerCase().replace(/\s+/g, '-')}`,
      jobId: job.id,
      model,
      backend: model === 'MLP' ? '-' : getBackend(job),
      dataset: getDatasetName(job),
      user: getUserLabel(job),
      ...modelMetrics(metrics),
      trainingTime: getTrainingTime(job),
      status: job.status || 'queued',
      createdAt: job.completed_at || job.created_at || null,
      pdfPath: job.pdf_path || null,
      raw: job,
    });
  };

  if (results.rnn) {
    pushRow('MLP', results.rnn);
  }

  if (qrnn?.clean || qrnn?.noisy || qrnn?.mitigated) {
    if (qrnn.clean) pushRow('QNN Clean', qrnn.clean);
    if (qrnn.noisy) pushRow('QNN Noisy', qrnn.noisy);
    if (qrnn.mitigated) pushRow('QNN Mitigated', qrnn.mitigated);
  } else if (qrnn) {
    pushRow('QNN', qrnn);
  }

  if (rows.length === 0) {
    const requested = requestedModelNames(job.config);
    const fallbackModels = requested.length > 0 ? requested : ['-'];
    fallbackModels.forEach((model) => pushRow(model, null));
  }

  return rows;
}
