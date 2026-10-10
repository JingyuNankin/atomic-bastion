import catalog from '../../../docs/design/operatives.json';

export type OperativeId = string;
export type OperativeModel = 'civilian' | 'soldier-1970';

export type DossierField = {
  label: string;
  value: string;
  redacted?: boolean;
};

export type ServiceEntry = {
  years: string;
  post: string;
  redacted?: boolean;
};

export type AptitudeAxis = {
  id: string;
  label: string;
  value: number;
};

export type OperativeDef = {
  id: OperativeId;
  name: string;
  nameEn: string;
  code: string;
  codeEn: string;
  role: string;
  model: OperativeModel;
  blurb: string;
  fileNo: string;
  aptitudeProvisional: boolean;
  fields: DossierField[];
  service: ServiceEntry[];
  note: string;
  aptitude: AptitudeAxis[];
};

const operatives = catalog.operatives as OperativeDef[];
const operativesById = new Map(operatives.map((operative) => [operative.id, operative]));

export function listOperatives(): OperativeDef[] {
  return operatives;
}

export function getOperative(id: OperativeId): OperativeDef {
  const operative = operativesById.get(id);

  if (!operative) {
    throw new Error(`Unknown operative: ${id}`);
  }

  return operative;
}

export function getDefaultOperative(): OperativeDef {
  return getOperative(catalog.defaultId);
}
