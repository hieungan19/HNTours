const bookTour = async (tourId) => {
  //get checkout session from api
  await fetch(
    'http://localhost:3000/api/v1/bookings/checkout-session/5c88fa8cf4afda39709c2951'
  )
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      const targetUrl = data.session.url;
      window.location.href = targetUrl;
    });
};
document.getElementById('book-tour').addEventListener('click', async (e) => {
  e.target.textContent = 'Processing...';
  const { tourId } = e.target.dataset.tourId;
  await bookTour(tourId);
});
