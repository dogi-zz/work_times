export interface Month {
  month: number;
  year: number;
}

export const getNextMonth = (): Month => {
  const date = new Date();
  date.setHours(0, 0, 0, 0)
  date.setDate(1);
  date.setMonth(date.getMonth() + 1);
  console.info(date.getMonth());
  return {
    month: date.getMonth(),
    year: date.getFullYear(),
  }
}
