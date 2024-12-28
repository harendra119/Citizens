import {scale, mScale, vScale} from './size';

export const tStyle = (
  weight = '400',
  size = 12,
  lineHeight = 16,
  color = '#000',
) => ({
  fontWeight: weight,
  fontSize: mScale(size),
  lineHeight: mScale(lineHeight),
  color,
});
