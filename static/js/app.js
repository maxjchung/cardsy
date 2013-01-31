var s;

var CardsyApp = {

  settings : {
    'animationSpeed' : 150
  },

  addCard: function(x, y) {

    var card = createCard();
    addToCanvas(card);

    function addToCanvas(card) {

      card.hide();
      card.find('.delete').hide();

      $('#canvas').append(card);

      card.fadeIn(s.animationSpeed);
      card.find('textarea').focus();

      makeDraggable(card);

    }

    function makeDraggable(card) {
      card.draggable({

        scroll: false,
        containment: 'document',

        start: function() {
          card.find('textarea').blur();
          card.find('.delete').hide();
        },

        drag: function() {
          card.find('.delete').hide();
        },

        stop: function() {
          card.find('.delete').show();
        }

      });
    
      return;
    }

    function createCard() {

      var newCard = $('<div />')
        .addClass('card')
        .css('left', x + 'px')
        .css('top', y + 'px');

      newCard.hover(
        function(e) { CardsyApp.showDeleteButton(e) },
        function(e) { CardsyApp.hideDeleteButton(e) }
      );

      return newCard.append(createTextArea()).append(createDeleteButton());

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

        var deleteButton = $('<div />')
          .addClass('delete')
          .html('&#10006;')
          .click(function (e) { CardsyApp.deleteCard(e) });

        deleteButton.hover(
          function(e) { $(this).addClass('hover') },
          function(e) { $(this).removeClass('hover') }
        );

        return deleteButton;
      }

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
