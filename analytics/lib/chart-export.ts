import html2canvas from 'html2canvas';

export type ExportBackground = 'white' | 'transparent';

function buildFilename(title: string) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const date = new Date().toISOString().slice(0, 10);
  return `${slug}-${date}.png`;
}

async function captureElement(element: HTMLElement, background: ExportBackground) {
  return html2canvas(element, {
    scale: 2,
    backgroundColor: background === 'transparent' ? null : '#ffffff',
    useCORS: true,
    logging: false,
  });
}

export async function downloadChartImage(
  title: string,
  element: HTMLElement,
  background: ExportBackground,
) {
  const canvas = await captureElement(element, background);
  const link = document.createElement('a');

  link.href = canvas.toDataURL('image/png');
  link.download = buildFilename(title);
  link.click();
}

export async function copyChartImage(
  element: HTMLElement,
  background: ExportBackground,
) {
  const canvas = await captureElement(element, background);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));

  if (!blob || typeof ClipboardItem === 'undefined') {
    throw new Error('Clipboard image copy is not supported in this browser.');
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob,
    }),
  ]);
}
