document
  .getElementById("payWithWallyBtn")
  .addEventListener("click", function () {
    // Get destination and amount from the vendor's website
    var destination = "auth0|661ef04bfdf3cb5cbd844cbf"; // Replace with actual destination
    var amount = 0.0001; // Replace with actual amount

    // Redirect user to Wally website with confirmation data
    window.location.href =
      "http://localhost:3000/confirm-payment?destination=" +
      encodeURIComponent(destination) +
      "&amount=" +
      encodeURIComponent(amount);
  });
