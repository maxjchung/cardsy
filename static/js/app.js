var ANIMATION_SPEED = 150;


var CardsyApp = {


  addCard: function(e) {

    var newCard = $('<div />', {
      'class' : 'card',
      'style' : 'left: ' + e.clientX + 'px; top: ' + e.clientY + 'px;' 
    });

    newCard.hover(
      function(e) { CardsyApp.showDeleteButton(e) },
      function(e) { CardsyApp.hideDeleteButton(e) }
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

    delButton = createDeleteButton();

    newCard.append(textArea).append(delButton);
    newCard.hide();
    delButton.hide();

    $('#canvas').append(newCard);
    newCard.fadeIn(ANIMATION_SPEED);
    textArea.focus();

    // Enable draggable last, otherwise affects clientX/Y values.
    newCard.draggable({

      scroll: false,
      containment: 'document',

      start: function() {
        newCard.find('textarea').blur();
        newCard.find('.delete').hide();
      },

      drag: function() {
        newCard.find('.delete').hide();
      },

      stop: function() {
        newCard.find('.delete').show();
      }

    });

    function createDeleteButton() {

      var deleteButton = $('<div />', {
        'class' : 'delete',
        'html' : '&#10006;'
      }).click(function (e) {
        CardsyApp.deleteCard(e) 
      });

      deleteButton.hover(
        function(e) { $(this).addClass('hover') },
        function(e) { $(this).removeClass('hover') }
      );

      return deleteButton;
    }

  },


  deleteCard: function (e) {

    $(e.target.parentElement).hide('highlight', null, ANIMATION_SPEED, function(e) {
      this.remove();
    });

    return;

  },

  showDeleteButton: function (e) {
    $(e.target).find('.delete').show();
  },

  hideDeleteButton: function (e) {
    $(e.target).find('.delete').hide();
  }

};
