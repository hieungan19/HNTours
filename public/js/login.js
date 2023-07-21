const login = async (email, password) => {
  fetch('http://localhost:3000/api/v1/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.status === 'success') {
        alert('Logged in successfully.');
        window.setTimeout(() => {
          location.assign('/');
        }, 1500);
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.log(error);
    });
};
document.querySelector('.form--login').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
