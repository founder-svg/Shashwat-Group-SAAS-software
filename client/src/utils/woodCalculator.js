/**
 * Wood, Timber & Plywood Calculator Utility for Shashwat Group
 * 
 * Timber / Wood CFT Formula:
 *   CFT per piece = (Length in ft × Width in in × Thickness in in) / 144
 *   Total CFT = CFT per piece × Number of Pieces
 * 
 * Plywood / Sheet Formula:
 *   Sq.Ft per sheet = Length in ft × Width in ft (e.g. 8ft × 4ft = 32 Sq.Ft)
 *   Total Sq.Ft = Sq.Ft per sheet × Number of Sheets
 *   Sheet Price = Rate per Sq.Ft × Sq.Ft per sheet
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

export function calculatePlywoodSqFt(lengthFt, widthFt) {
  const l = parseFloat(lengthFt) || 0;
  const w = parseFloat(widthFt) || 0;
  if (l <= 0 || w <= 0) return 0;
  return parseFloat((l * w).toFixed(2));
}

export function calculatePlywoodTotalSqFt(lengthFt, widthFt, sheets) {
  const sqft = calculatePlywoodSqFt(lengthFt, widthFt);
  const s = parseFloat(sheets) || 0;
  return parseFloat((sqft * s).toFixed(2));
}

export function calculatePlywoodSheetPrice(ratePerSqFt, sqFtPerSheet) {
  const rate = parseFloat(ratePerSqFt) || 0;
  const sqft = parseFloat(sqFtPerSheet) || 0;
  return parseFloat((rate * sqft).toFixed(2));
}

export function formatDimensions(length, width, thickness) {
  if (!length && !width && !thickness) return 'N/A';
  return `${length || 0}ft × ${width || 0}" × ${thickness || 0}"`;
}

export function formatPlywoodDimensions(length, width, thicknessMm) {
  if (!length && !width && !thicknessMm) return 'N/A';
  const sqft = (parseFloat(length) || 0) * (parseFloat(width) || 0);
  return `${length || 0}ft × ${width || 0}ft × ${thicknessMm || 0}mm (${sqft.toFixed(0)} Sq.Ft)`;
}

export function isPlywoodItem(item) {
  if (!item) return false;
  const cat = (item.category || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  const unit = (item.unit || '').toLowerCase();
  return (
    cat.includes('plywood') ||
    cat.includes('board') ||
    cat.includes('door') ||
    cat.includes('laminate') ||
    cat.includes('sheet') ||
    name.includes('plywood') ||
    name.includes('flush door') ||
    name.includes('blockboard') ||
    unit === 'sheet' ||
    unit === 'sheets' ||
    unit === 'sqft'
  );
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
