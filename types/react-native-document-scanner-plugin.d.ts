declare module 'react-native-document-scanner-plugin' {
  export interface ScanDocumentOptions {
    maxNumDocuments?: number;
    letUserAdjustCrop?: boolean;
    croppedImageQuality?: number;
  }

  export interface ScanDocumentResult {
    scannedImages: string[] | null;
    status?: string;
  }

  export interface DocumentScannerStatic {
    scanDocument(options?: ScanDocumentOptions): Promise<ScanDocumentResult>;
  }

  const DocumentScanner: DocumentScannerStatic;
  export default DocumentScanner;
}
