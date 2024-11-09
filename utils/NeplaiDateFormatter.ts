export const convertDate = (dateString: string) => {
  // Parse the date string into a timestamp
  //   const timestamp = Date.parse(dateString);

  // Create a Date object from the timestamp
  const date = new Date(dateString);

  //   const utcTime = date.getTime();

  //   const nepaliOffset = (5 * 60 + 45) * 60 * 1000; // Convert hours and minutes to milliseconds
  //   const nepaliTime = new Date(utcTime + nepaliOffset);

  // Define options for formatting the date
  const options = {
    year: "numeric" as const,
    month: "short" as const, // Use 'short' for abbreviated month names (e.g., Oct)
    day: "2-digit" as const, // Ensures day is two digits (01, 02, ... 31)
    hour: "2-digit" as const, // Ensures hours are two digits (01, 02, ... 12)
    minute: "2-digit" as const, // Ensures minutes are two digits (00, 01, ... 59)
    hour12: true,
    // timeZone: "UTC",
  };

  const formattedDate = date.toLocaleString("en-US", options);

  const finalFormattedDate = formattedDate.replace(",", ""); // Remove the comma before the time
  return finalFormattedDate;

  // Constructing the final output by including year
  //   const [month, day, year, time] = formattedTime.split(/[\s,]+/);
  //   const formattedDate = `${month} ${day} ${year}, ${time}`; // "Oct 21 2024, 01:07 PM"
};

// Example usage
// console.log(convertDate("10/21/2024, 1:07:10 PM")); // Output: "Oct 21 01:07 PM"
