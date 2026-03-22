export abstract class ICameraService {
  abstract checkCameraOnline(cameraId: string): Promise<boolean>;
}
