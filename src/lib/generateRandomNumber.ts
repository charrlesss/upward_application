export default function generateRandomNumber(digits:number) {
  // Calculate the minimum and maximum values based on the number of digits
  var min = Math.pow(10, digits - 1);
  var max = Math.pow(10, digits) - 1;

  // Generate a random number within the specified range
  return Math.floor(min + Math.random() * (max - min + 1));
}
