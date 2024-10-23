export interface Month {
  month: number;
  year: number;
}

export const getActualMonth = (): Month => {
  const date = new Date();
  date.setHours(0, 0, 0, 0)
  date.setDate(1);
  date.setMonth(date.getMonth());
  return {
    month: date.getMonth(),
    year: date.getFullYear(),
  }
}

export const getNextMonth = (): Month => {
  const date = new Date();
  date.setHours(0, 0, 0, 0)
  date.setDate(1);
  date.setMonth(date.getMonth() + 1);
  return {
    month: date.getMonth(),
    year: date.getFullYear(),
  }
}

export const addMonth = (month: Month, amount: number): Month => {
  const date = new Date(month.year, month.month, 1, 12);
  date.setMonth(date.getMonth() + amount);
  return {
    month: date.getMonth(),
    year: date.getFullYear(),
  }
}

export const getDaysOfMonth = (month: Month): number[] => {
  const result :  number[] = [];
  const date = new Date(month.year, month.month, 1, 12);
  while (date.getMonth() === month.month){
    result.push(date.getDate())
    date.setDate(date.getDate() + 1);
  }
  return result;
}

export const getDayDate = (day: number, month: Month): Date => {
  return new Date(month.year, month.month, day, 12);
}
