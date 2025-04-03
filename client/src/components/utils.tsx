// calculate the average of two numbers
export const calculateAverage = (min: number, max: number) => {
  return Math.round((min + max) / 2);
};

// get today's weekday name
export const getDayOfWeek = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

// get the month name for a specific date
export const getMonthName = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "long" });
};

// format the date as 1st, 2nd, 3rd, 4th
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  let suffix = "th";
  if (day === 1 || day === 21 || day === 31) {
    suffix = "st";
  } else if (day === 2 || day === 22) {
    suffix = "nd";
  } else if (day === 3 || day === 23) {
    suffix = "rd";
  }
  return `${day}${suffix}`;
};

// format the date as mmth Mar 25
export const formatDateFull = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });   // short month name
  const year = date.getFullYear().toString().slice(-2);               // get last two digits of the year

  let suffix = "th";
  if (day === 1 || day === 21 || day === 31) {
    suffix = "st";
  } else if (day === 2 || day === 22) {
    suffix = "nd";
  } else if (day === 3 || day === 23) {
    suffix = "rd";
  }

  return `${day}${suffix} ${month} ${year}`;
};

// format temperature with °C suffix
export const formatTemp = (temp: number) => `${temp}°c`;