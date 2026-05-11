document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.buttons div');
  const progressBtn = document.getElementById('progressBtn');
  const progressFill = document.getElementById('progressFill');

  let clickedButtons = JSON.parse(localStorage.getItem('clickedButtons')) || [];

  function updateProgress() {
    const progress = (clickedButtons.length / buttons.length) * 100;
    progressFill.style.width = progress + '%';

    progressBtn.disabled = clickedButtons.length !== buttons.length;
  }

  buttons.forEach(button => {
    const id = button.getAttribute('data-id');
    if (clickedButtons.includes(id)) {
      button.classList.add('clicked');
    }

    button.addEventListener('click', () => {
      if (!clickedButtons.includes(id)) {
        clickedButtons.push(id);
        localStorage.setItem('clickedButtons', JSON.stringify(clickedButtons));
        button.classList.add('clicked');
      }

      updateProgress();
    });
  });

  updateProgress();

  progressBtn.addEventListener('click', () => {

    clickedButtons = [];
    localStorage.removeItem('clickedButtons');

    buttons.forEach(button => button.classList.remove('clicked'));

    progressFill.style.width = '0%';

    progressBtn.disabled = true;

    location.href = 'last.html';
  });
});