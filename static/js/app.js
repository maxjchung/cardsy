function addCard(e) {

  $('#canvas').append("<div class='card' style='top: " + e.clientY + "px; left: " + e.clientX + "px;'><textarea></textarea><div class='delete'>&#10006;</div></div>");

}

function deleteCard(e) {

  $(e.target.parentElement).remove();
  return;

}

function showDeleteButton(e) {
  $(e.target).find('.delete').show();
}

function hideDeleteButton(e) {
  $(e.target).find('.delete').hide();
}
