function deleteCard(e) {

  $(e.target.parentElement).remove();
  return;

}

function showDeleteButton(e) {

  $(e.target.children[0]).show();
  return;

}

function hideDeleteButton(e) {

  $(e.target.children[0]).hide();
  return;

}
