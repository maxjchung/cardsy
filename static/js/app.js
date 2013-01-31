var s;

var CardsyApp = {

  settings : {
    'animationSpeed' : 150
  },

  addCard: function(x, y) {

    var newCard = $('<div />', {
      'class' : 'card',
      'style' : 'left: ' + x + 'px; top: ' + y + 'px;' 
    });

    newCard.hover(
      function(e) { CardsyApp.showDeleteButton(e) },
      function(e) { CardsyApp.hideDeleteButton(e) }
    );

    textArea = createTextArea();


    delButton = createDeleteButton();

    newCard.append(textArea).append(delButton);
    newCard.hide();
    delButton.hide();

    $('#canvas').append(newCard);
    newCard.fadeIn(s.animationSpeed);
    textArea.focus();

    makeDraggable(newCard);


    function makeDraggable(newCard) {
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
    
      return;
    }

    function createTextArea() {
      var textArea = $('<textarea />');
      
      textArea.hover(
        function(e) { $(this).addClass('hover') },
        function(e) { $(this).removeClass('hover') }
      );

      textArea.attr('maxlength', '110');

      // Auto adjust text area height.
      textArea.keyup(function () {
        $(this).height(0);
        $(this).height(this.scrollHeight );
      });

      return textArea;
    }

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

    $(e.target.parentElement).hide('highlight', null, s.animationSpeed, function(e) {
      this.remove();
    });

    return;

  },

  showDeleteButton: function (e) {
    $(e.target).find('.delete').show();
  },

  hideDeleteButton: function (e) {
    $(e.target).find('.delete').hide();
  },

  initCanvas: function() {

    $('#canvas').click(function (e) {
      if (this != e.target)
        return;

      CardsyApp.addCard(e.clientX, e.clientY);
    });

  },

  init: function() {

    s = this.settings;
    CardsyApp.initCanvas();

  }

};
