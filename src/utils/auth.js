export const requireAdmin = () => {
  // If already authenticated in this browser, allow immediately
  if (localStorage.getItem("universe_admin") === "true") {
    return true;
  }

  // Otherwise, prompt for the secret PIN
  const pin = prompt("This action is locked. Enter the secret PIN to edit the universe:");
  
  // If user hits cancel, pin is null
  if (pin === null) return false;

  if (pin === import.meta.env.VITE_SECRET_PIN) {
    localStorage.setItem("universe_admin", "true");
    alert("Access granted! You can now edit, add, and delete memories.");
    return true;
  } else {
    alert("Incorrect PIN. Access denied.");
    return false;
  }
};
