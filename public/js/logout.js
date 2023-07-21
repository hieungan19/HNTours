const logout = () => {
  console.log('LOGOUT');
  fetch('http://localhost:3000/api/v1/users/logout', {
    method: 'GET',
  })
    .then((data) => {
      console.log('LOGOUT:' + data.status);
      if (data.status == 200) {
        location.reload(true);
      }
    })
    .catch((err) => {
      alert('Error when logging out. Please try again.');
    });
};
document.querySelector('.nav__el--logout').addEventListener('click', logout);
