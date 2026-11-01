/* thanks.js — показывает номер заявки, сохранённый формой перед переходом на эту страницу. */
(function () {
  'use strict';
  var ticket = document.getElementById('ticket');
  var id = null;
  try { id = sessionStorage.getItem('bb_last_request_id'); } catch (err) { id = null; }
  if (ticket && id) ticket.textContent = id;
  else if (ticket) ticket.textContent = 'номер появится после отправки формы';
})();
