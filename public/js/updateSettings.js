const updateData = async (data, type) => {
  const url =
    type === 'password'
      ? 'http://localhost:3000/api/v1/users/updatePassword'
      : 'http://localhost:3000/api/v1/users/updateData';

  const boundary = `multipart-form-boundary-${new Date().getTime()}`;

  const headers =
    type === 'password' ? { 'Content-Type': 'application/json' } : null;
  fetch(url, {
    method: 'PATCH',
    body: data,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.status === 'success') {
        alert(`${type.toUpperCase()} Updated successfully.`);
        window.setTimeout(() => {
          location.reload(true);
        }, 1500);
      } else {
        alert(`Something went wrong with error: ${data.message}`);
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

document.querySelector('.form-user-data').addEventListener('submit', (e) => {
  console.log('CLICKED SAVE!');
  e.preventDefault();
  const email = document.getElementById('email').value;
  const name = document.getElementById('name').value;
  const photo = document.getElementById('photo').files[0];

  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('photo', photo);

  updateData(formData, 'data');
});

document
  .querySelector('.form-user-settings')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const currentPassword = document.getElementById('password-current').value;

    const formData = new FormData();
    formData.append('newPassword', newPassword);
    formData.append('passwordConfirm', passwordConfirm);
    formData.append('currentPassword', currentPassword);

    await updateData(formData, 'password');
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    document.getElementById('password-current').value = '';
  });
