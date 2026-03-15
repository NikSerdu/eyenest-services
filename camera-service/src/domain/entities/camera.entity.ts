export class LocationEntity {
  id: string;
  name: string;
  userId: string;
  cameras: CameraEntity[];
}
export class CameraEntity {
  id: string;
  name: string;
  cameraSettings: CameraSettingsEntity | null;
}

export class CameraSettingsEntity {
  id: string;
  aiStatus: Status;
}

export const Status = {
  ON: 'ON',
  OFF: 'OFF',
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export class CameraEntityWithLocation extends CameraEntity {
  location: Omit<LocationEntity, 'cameras'>;
}
