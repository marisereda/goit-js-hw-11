export function formatNumber(number) {
  if (number >= 1000 && number < 1000000) {
    number = `${(number / 1000).toFixed(1)} k`;
  } else if (number >= 1000000) {
    number = `${(number / 1000000).toFixed(1)} M`;
  }
  return number;
}
