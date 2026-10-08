for (const id of ['chapter-picker', 'verse-picker']) {
  document.getElementById(id)?.addEventListener('change', event => {
    location.assign(event.target.value);
  });
}
if (location.pathname.startsWith('/read/') && !location.hash) {
  document.getElementById('browse')?.scrollIntoView();
}
