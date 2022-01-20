export type Size = {
  width: number,
  height: number,
  rotation?: number,
};

export type Range = {
  max: number,
  min: number,
};

export function isInRange(value: number, max: number, min: number): boolean => {
  return min <= value && value <= max;
};

export const getAspectRatio = (size: Size): number => {
  return size.width / size.height;
};

export const translateRangeX = (
  scale: number,
  imageSize: Size,
  cropAreaSize: Size,
  minZoom: number,
): Range => {
  const cropAspectRatio = getAspectRatio(cropAreaSize);
  const imageAspectRatio = getAspectRatio(imageSize);
  const initialFit = cropAspectRatio > imageAspectRatio ? 'width' : 'height';

  if (initialFit === 'width') {
    const imageOutsideBoxSize =
      (cropAreaSize.width * scale) / minZoom - cropAreaSize.width;
    return {max: imageOutsideBoxSize / 2, min: -imageOutsideBoxSize / 2};
  } else {
    const imageOutsideBoxSize = cropAreaSize.width * scale - cropAreaSize.width;
    return {max: imageOutsideBoxSize / 2, min: -imageOutsideBoxSize / 2};
  }
};

export const translateRangeY = (
  scale: number,
  imageSize: Size,
  cropAreaSize: Size,
  minZoom: number,
): Range => {
  const cropAspectRatio = getAspectRatio(cropAreaSize);
  const imageAspectRatio = getAspectRatio(imageSize);
  const initialFit = cropAspectRatio < imageAspectRatio ? 'height' : 'width';

  if (initialFit === 'height') {
    const imageOutsideBoxSize =
      (cropAreaSize.height * scale) / minZoom - cropAreaSize.height;
    return {max: imageOutsideBoxSize / 2, min: -imageOutsideBoxSize / 2};
  } else {
    const imageOutsideBoxSize =
      cropAreaSize.height * scale - cropAreaSize.height;
    return {max: imageOutsideBoxSize / 2, min: -imageOutsideBoxSize / 2};
  }
};

export const computeTranslation = (
  current: number,
  last: number,
  max: number,
  min: number,
): number => {
  const next = current + last;
  if (isInRange(next, max, min)) {
    return next;
  }
  if (next > max) {
    return max;
  }
  return min;
};

export const computeScaledWidth = (
  scale: number,
  imageSize: Size,
  cropAreaSize: Size,
  minZoom: number,
): number => {
  const {max: maxTranslateX} = translateRangeX(
    minZoom,
    imageSize,
    cropAreaSize,
    minZoom,
  );
  return maxTranslateX > 0
    ? cropAreaSize.width * scale
    : (cropAreaSize.width * scale) / minZoom;
};

export const computeScaledHeight = (
  scale: number,
  imageSize: Size,
  cropAreaSize: Size,
  minZoom: number,
): number => {
  const {max: maxTranslateY} = translateRangeY(
    minZoom,
    imageSize,
    cropAreaSize,
    minZoom,
  );
  return maxTranslateY > 0
    ? cropAreaSize.height * scale
    : (cropAreaSize.height * scale) / minZoom;
};

export const computeScaledMultiplier = (
  imageSize: Size,
  width: number,
): number => {
  return imageSize.width / width;
};

export const computeTranslate = (
  imageSize: Size,
  x: number,
  y: number,
): {x: number, y: number} => {
  if (imageSize.rotation === 90) {
    return {x: -x, y: y};
  }
  if (imageSize.rotation === 180) {
    return {x: -x, y: -y};
  }
  if (imageSize.rotation === 270) {
    return {x: x, y: -y};
  }
  return {x, y};
};

export const computeOffset = (
  scaledSize: Size,
  imageSize: Size,
  translate: {x: number, y: number},
  maxTranslateX: number,
  maxTranslateY: number,
  scaledMultiplier: number,
): {x: number, y: number} => {
  const initialOffsetX = scaledSize.width - maxTranslateX;
  const initialOffsetY = scaledSize.height - maxTranslateY;
  const finalOffsetX =
    imageSize.width - (initialOffsetX + translate.x) * scaledMultiplier;
  const finalOffsetY =
    imageSize.height - (initialOffsetY + translate.y) * scaledMultiplier;
  const offset = {
    x: parseFloat(finalOffsetX.toFixed(3)),
    y: parseFloat(finalOffsetY.toFixed(3)),
  };
  if (imageSize.rotation === 90 || imageSize.rotation === 270) {
    return {x: offset.y, y: offset.x};
  }
  return offset;
};

export const computeSize = (size: Size, multiplier: number): Size => {
  return {
    width: parseFloat((size.width * multiplier).toFixed(3)),
    height: parseFloat((size.height * multiplier).toFixed(3)),
  };
};
