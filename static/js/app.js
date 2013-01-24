function addCard(e) {

  var newCard = $('<div />', {
    'class' : 'card paper-lined',
    'style' : 'left: ' + e.clientX + 'px; top: ' + e.clientY + 'px;' 
  });

  newCard.hover(
    function(e) { showDeleteButton(e) },
    function(e) { hideDeleteButton(e) }
  );

  var textArea = $('<textarea />');
  
  textArea.hover(
    function(e) { $(this).addClass('hover') },
    function(e) { $(this).removeClass('hover') }
  );

  textArea.attr('maxlength', '110');

  // Auto adjust text area height.
  newCard.on( 'keyup', 'textarea', function (){
      $(this).height( 0 );
      $(this).height( this.scrollHeight );
  });
  newCard.find('textarea').keyup();

  var deleteButton = $('<div />', {
    'class' : 'delete',
    'html' : '&#10006;'
  }).click(function (e) {
    deleteCard(e) 
  });

  deleteButton.hover(
    function(e) { $(this).addClass('hover') },
    function(e) { $(this).removeClass('hover') }
  );

  newCard.append(textArea).append(deleteButton);

  deleteButton.hide();
  $('#canvas').append(newCard);
  textArea.focus();

  // Enable draggable last, otherwise affects clientX/Y values.
  newCard.draggable({containment: 'document'});

}

function deleteCard(e) {

  $(e.target.parentElement).hide('highlight', null, 250, function(e) {
    this.remove();
  });

  return;

}

function showDeleteButton(e) {
  $(e.target).find('.delete').show();
}

function hideDeleteButton(e) {
  $(e.target).find('.delete').hide();
}
