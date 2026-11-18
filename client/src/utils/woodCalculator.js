/**
 * Wood & Timber CFT (Cubic Feet) Calculator Utility for Shashwat Group
 * 
 * Standard Formula:
 *   CFT per piece = (Length in ft × Width in in × Thickness in in) / 144
 *   Total CFT = CFT per piece × Number of Pieces
 */

export function calculateCft(lengthFt, widthInches, thicknessInches) {
  const l = parseFloat(lengthFt) || 0;
  const w = parseFloat(widthInches) || 0;
  const t = parseFloat(thicknessInches) || 0;
  if (l <= 0 || w <= 0 || t <= 0) return 0;
  const cft = (l * w * t) / 144;
  return parseFloat(cft.toFixed(3));
}

export function calculateTotalCft(cftPerPiece, pieces) {
  const cft = parseFloat(cftPerPiece) || 0;
  const pcs = parseFloat(pieces) || 0;
  return parseFloat((cft * pcs).toFixed(3));
}

export function formatDimensions(length, width, thickness) {
  if (!length && !width && !thickness) return 'N/A';
  return `${length || 0}L (ft) × ${width || 0}W (in) × ${thickness || 0}T (in)`;
}

export function parseSpecsFromDescription(desc) {
  if (!desc) return null;
  const match = desc.match(/\[Specs:\s*([\d.]+)L\s*×\s*([\d.]+)W\s*×\s*([\d.]+)T\s*\|\s*([\d.]+)\s*CFT\]/i);
  if (match) {
    return {
      length: parseFloat(match[1]),
      width: parseFloat(match[2]),
      thickness: parseFloat(match[3]),
      cft: parseFloat(match[4])
    };
  }
  return null;
}
