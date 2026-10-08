for (const button of document.querySelectorAll('[data-go-back]')) {
  button.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else location.assign('/');
  });
}
