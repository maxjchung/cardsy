var s;
var counter = 1;

var log = function(msg) { console.log(msg) };

var Cardsy = {

  settings : {

    'animationSpeed' : 150,
    'cardCharLimit' : 110
  
  },

  init: function() {

    s = this.settings;

    Cardsy.initCanvas();

    Cardsy.initDummySaveState();

    if (Cardsy.hasSaveState()) 
      Cardsy.loadState();

    else
      Cardsy.showIntro();

  },

  initDummySaveState: function() {

    localStorage.setItem('hasSaveState', 'true');
  
  },

  hasSaveState: function() {

    if (!Modernizr.localstorage) 
      return false;

    if (localStorage['hasSaveState'] != 'true')
      return false;

    return true;

  },

  loadState: function() {

    var keys = Object.keys(localStorage).filter(function(k) { return k.indexOf('cardsy.1') > -1 });

    for (var i = 0; i < keys.length; i++) {
      var card = JSON.parse(localStorage.getItem(keys[i]));
      Cardsy.addCard(card.x, card.y, card.text);
    }

  },

  initCanvas: function() {

    $('#canvas').click(function(e) {

      if (this != e.target)
        return;

      Cardsy.addCard(e.clientX, e.clientY);

      
    });

  },

  showIntro: function() {

    var introText = 'Add new cards by clicking the canvas.';

    setTimeout(function () { Cardsy.addCard(20, 60, introText) }, 710);

  },

  addCard: function(x, y, text) {

    var card = createCard(text);
    addToCanvas(card);

    function addToCanvas(card) {

      card.hide();
      card.find('.delete').hide();

      $('#canvas').append(card);

      card.fadeIn(s.animationSpeed);

      if (undefined == text)
        card.find('textarea').focus();

      makeDraggable(card);

      Cardsy.saveCard(Cardsy.jQueryCardToObj(card));

      log('added card #' + card.attr('id') + ' at (x,y): (' + x + ', ' + y + ')')

    }

    function makeDraggable(card) {

      card.draggable({

        scroll: false,
        containment: 'document',

        start: function() {

          card.find('textarea').blur();
          card.find('.delete').hide();

        },

        drag: function() { card.find('.delete').hide(); },

        stop: function() {
          card.find('.delete').show();
    
          Cardsy.saveCard(Cardsy.jQueryCardToObj(card));

          log('moved card #' + card.attr('id') + ' to (x,y): (' + card.css('left') + ', ' + card.css('top') + ')');
   
        }

      });
    
    }

    function createCard(text) {

      var newCard = $('<div />')
        .attr('id', counter++)
        .addClass('card')
        .css('left', x + 'px')
        .css('top', y + 'px')
        .hover(
          function(e) { Cardsy.showDeleteButton(e) },
          function(e) { Cardsy.hideDeleteButton(e) }
        );

      textArea = createTextArea();

      if (undefined != text)
        textArea.html(text);

      deleteButton = createDeleteButton();

      return newCard.append(textArea).append(deleteButton);

    }

    function createTextArea() {

      var textArea = $('<textarea />');
      
      textArea.hover(
        function(e) { $(this).addClass('hover') },
        function(e) { $(this).removeClass('hover') }
      );

      textArea.attr('maxlength', s.cardCharLimit);

      // Auto adjust text area height.
      textArea.keyup(function() {
        $(this).height(0);
        $(this).height(this.scrollHeight );
      });

      textArea.bind('textchange', function() {
        log('textarea value: ' + $(this).val());
      });

      return textArea;

    }

    function createDeleteButton() {

      var deleteButton = $('<div />')
        .addClass('delete')
        .html('&#10006;')
        .click(function(e) { Cardsy.deleteCard(e) });

      deleteButton.hover(
        function(e) { $(this).addClass('hover') },
        function(e) { $(this).removeClass('hover') }
      );

      return deleteButton;

    }

  },


  deleteCard: function(e) {

    var $card = $(e.target.parentElement);

    $card.hide('highlight', null, s.animationSpeed, function(e) { this.remove(); });

    Cardsy.removeCardFromStorage($card);

    log('deleted card #' + $card.attr('id'));

  },

  saveCard: function(card) {

    localStorage.setItem('cardsy.1.' + card.id, JSON.stringify(card));
    log('saved card #' + card.id);

  },

  removeCardFromStorage: function($card) {

    var key = 'cardsy.1.' + $card.attr('id');

    localStorage.removeItem(key);
  },

  showDeleteButton: function(e) { $(e.target).find('.delete').show(); },
  hideDeleteButton: function(e) { $(e.target).find('.delete').hide(); },

  jQueryCardToObj: function ($card) {

    return {
      id: $card.attr('id'),
      x: getNumberFromPositionString($card.css('left')),
      y: getNumberFromPositionString($card.css('top')),
      text: $card.find('textarea').val()
    };

    function getNumberFromPositionString(position) {
      return position.slice(0, position.length - 2);
    }

  }

};
