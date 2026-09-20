import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker to use CDN or local fallback
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export interface ExtractedPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Render all pages of a PDF File into Base64 PNG images
 */
export async function renderPdfPagesToImages(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractedPage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist/cmaps/',
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pages: ExtractedPage[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    
    // Scale 1.5 to 2 for sharp OCR resolution
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      } as any).promise;

      const dataUrl = canvas.toDataURL('image/png', 0.92);
      pages.push({
        pageNumber: pageNum,
        dataUrl,
        width: viewport.width,
        height: viewport.height,
      });
    }

    if (onProgress) {
      onProgress(pageNum, numPages);
    }
  }

  return pages;
}
