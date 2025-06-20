function updateClock() {
  const now = new Date();
  document.querySelector('.sbb-clock__hours').textContent = String(now.getHours()).padStart(2, '0');
  document.querySelector('.sbb-clock__minutes').textContent = String(now.getMinutes()).padStart(2, '0');
  document.querySelector('.sbb-clock__seconds').textContent = String(now.getSeconds()).padStart(2, '0');
}

setInterval(updateClock, 1000);
updateClock();
