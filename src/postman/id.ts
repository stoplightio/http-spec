export function generateId() {
  return (
    '_gen_' +
    Math.round(Math.pow(8, 6) * Math.random())
      .toString(16)
      .padStart(6, '0')
  );
}
