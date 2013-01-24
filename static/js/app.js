function addCard(e) {

  var newCard = $('<div />', {
    'class' : 'card paper-lined',
    'style' : 'left: ' + e.clientX + 'px; top: ' + e.clientY + 'px;' 
  });

  var textArea = $('<textarea />');
  
  var deleteButton = $('<div />', {
    'class' : 'delete',
    'html' : '&#10006;'
  });

  newCard.append(textArea).append(deleteButton);

  $('#canvas').append(newCard);

  // Enable draggable last, otherwise affects clientX/Y values.
  newCard.draggable({containment: 'document'});

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
