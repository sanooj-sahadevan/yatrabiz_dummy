export const generateUniquePNR = (tickets = []) => {
  let uniquePNR = false;
  let generatedPNR;
  while (!uniquePNR) {
    const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    generatedPNR = "DMY";
    for (let i = 0; i < 3; i++) {
      generatedPNR += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length)
      );
    }
    const isNotUnique = tickets.some((ticket) => ticket.PNR === generatedPNR);
    if (!isNotUnique) {
      uniquePNR = true;
    }
  }
  return generatedPNR;
}; 