import ColorThief from "color-thief-ts";

const colorThief = new ColorThief();


export async function getThemeColor(imgUrl: string) {
  const dominantColor = await colorThief.getColorAsync(imgUrl);
  const palette = await colorThief.getPaletteAsync(imgUrl, 5);
  return {dominantColor,palette} as any
}
