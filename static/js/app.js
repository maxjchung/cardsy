function deleteCard(e) {

  $(e.target.parentElement).remove();
  return;

}

function showDeleteButton(e) {

  $(e.target.children[0]).css('visibility', 'visible');
  return;

}
