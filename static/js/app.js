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
