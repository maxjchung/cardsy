var s;

var next_card_id = 1;

var next_canvas_id = 1;
var current_canvas_id = 1;
var canvas_ids = [];

var Cardsy = {

  /*************************/
  /*    Initializations    */
  /*************************/

  settings: {

    'animationSpeed' : 150,
    'cardCharLimit' : 110,
    'introText' : 'Add more cards by clicking the canvas.\n\nTry moving them, too.'
  
  },

  init: function() {

    s = this.settings;

    Cardsy.initActionPanel();
    Cardsy.initCanvas();

    if (Cardsy.hasSaveState()) 
      Cardsy.loadSavedState();

    else {
      Cardsy.loadFirstRun();
      Cardsy.markSavedStateFlag();
    } 

  },

  initActionPanel: function() {

    $('#new').click(function() {
      Cardsy.addCanvas();
    });

    $('#delete').click(function() {
      Cardsy.deleteCanvas();
    });

    $('#previous').click(function() {
      Cardsy.loadPreviousCanvas();
    });

    $('#next').click(function() {
      Cardsy.loadNextCanvas();
    });

  },

  initCanvas: function() {

    $('#canvas').click(function(e) {

      if (this != e.target)
        return;

      Cardsy.addCardWithIncrement(next_card_id, e.clientX, e.clientY);
    
    });

  },

  hasSaveState: function() {

    if (!Modernizr.localstorage) 
      return false;

    if (!Cardsy.hasSavedStateFlag())
      return false;

    return true;

  },

  loadSavedState: function() {

    current_canvas_id = Cardsy.loadCurrentCanvasId(); 
    next_canvas_id = Cardsy.loadNextCanvasId(); 
    next_card_id = Cardsy.loadNextCardId();
    canvas_ids = Cardsy.loadCanvasIds();

    Cardsy.loadCanvas(current_canvas_id);

  },

  loadFirstRun: function() {

    Cardsy.addCanvas();
    Cardsy.showIntro();

  },

  showIntro: function() {

    var x = Math.floor($('#canvas').width() / 2) - 100;
    var y = Math.floor($('#canvas').height() / 2) - 60;

    setTimeout(function () {
      Cardsy.addCardWithIncrement(next_card_id, x, y, s.introText);
    }, 710);

  },





  /*************************/
  /*    Card Operations    */
  /*************************/

  addCardWithIncrement: function(id, x, y, text) {

    Cardsy.addCard(id, x, y, text);
    Cardsy.incrementNextCardId();
    
  },

  addCard: function(id, x, y, text) {

    var card = createCard(id, text);

    addToCanvas(card);

    function addToCanvas(card) {

      card.hide();
      card.find('.delete').hide();

      $('#canvas').append(card);

      card.fadeIn(s.animationSpeed);

      if (undefined == text)
        card.find('textarea').focus();

      bindDragEvents(card);

      Cardsy.saveCard(Cardsy.jQueryCardToObj(card));

    }

    function bindDragEvents(card) {

      card.draggable({

        scroll: false,
        containment: 'parent',

        start: function() {
          card.find('textarea').blur();
          card.find('.delete').hide();
        },

        drag: function() {
          card.find('.delete').hide();
        },

        stop: function() {
          card.find('.delete').show();
          Cardsy.saveCard(Cardsy.jQueryCardToObj(card));
        }

      });
    
    }

    function createCard(id, text) {

      var newCard = $('<div />')
        .attr('id', id)
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
      textArea.attr('rows', 4);

      textArea.bind('textchange', function() {
        Cardsy.saveCard(Cardsy.jQueryCardToObj($(this.parentElement)))
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

  },

  saveCard: function(card) {

    var key = Cardsy.createCardKey(current_canvas_id, card.id);
    Storage.setCard(key, card);

  },





  /***************************/
  /*    Canvas Operations    */
  /***************************/

  addCanvas: function() {

    Cardsy.setCurrentCanvas(next_canvas_id);
    canvas_ids.push(next_canvas_id);
    Cardsy.saveCanvasIds();

    Cardsy.incrementNextCanvasId();

    Cardsy.clearCurrentCanvas();
    Cardsy.updateCanvasIndicator();
  },

  deleteCanvas: function() {

    var $cards = $('#canvas').find('.card');

    $cards.each(function(index) {
      var key = Cardsy.createCardKey(current_canvas_id, $(this).attr('id'));
      localStorage.removeItem(key);
    });

    $cards.remove();

    if(canvas_ids.length == 1) {
      canvas_ids = [];
      Cardsy.addCanvas();
    }

    else {

      var index = $.inArray(current_canvas_id, canvas_ids);
      var next_id;

      if(index == canvas_ids.length - 1) {
        next_id = canvas_ids[index - 1];
        canvas_ids.pop();
      }
   
      else {
        canvas_ids.splice(index, 1);
        next_id = canvas_ids[index];
      }

      Cardsy.saveCanvasIds();
      Cardsy.loadCanvas(next_id);

    }

  },

  loadPreviousCanvas: function() {

    var index = $.inArray(current_canvas_id, canvas_ids);
    var previous_canvas_id;
  
    if (index == 0)
      previous_canvas_id = canvas_ids[canvas_ids.length - 1];
    else
      previous_canvas_id = canvas_ids[index-1];

    Cardsy.loadCanvas(previous_canvas_id);

  },

  loadNextCanvas: function() {

    var index = $.inArray(current_canvas_id, canvas_ids);
    var next_canvas_id;
  
    if (index == canvas_ids.length - 1)
      next_canvas_id = canvas_ids[0];
    else
      next_canvas_id = canvas_ids[index+1];

    Cardsy.loadCanvas(next_canvas_id);

  },

  loadCanvas: function(id) {

    Cardsy.clearCurrentCanvas();
    Cardsy.setCurrentCanvas(id);

    var keys = Storage.getCardKeysByCanvasId(id); 
    var length = keys.length;

    for (var i = 0; i < length; i++) {
      var card = Storage.getCard(keys[i]);
      Cardsy.addCard(card.id, card.x, card.y, card.text);
    }

    Cardsy.updateCanvasIndicator();

  },

  setCurrentCanvas: function(id) {
  
    current_canvas_id = id;
    Storage.set('current_canvas_id', current_canvas_id); 

  },

  updateCanvasIndicator: function() {

    var currentCanvasIndex = $.inArray(current_canvas_id, canvas_ids);
    var numCanvases = canvas_ids.length;

    $('#canvas-indicator').html((currentCanvasIndex+1) + ' of ' + numCanvases);

  },

  showDeleteButton: function(e) { $(e.target).find('.delete').show(); },
  hideDeleteButton: function(e) { $(e.target).find('.delete').hide(); },





  /*********************************/
  /*    State Management Helpers   */
  /*********************************/

  markSavedStateFlag: function() {

    Storage.set('has_save_state', 'true'); 

  },

  hasSavedStateFlag: function() {

    return 'true' == Storage.get('has_save_state');

  },

  incrementNextCanvasId: function() {
    next_canvas_id++;
    Storage.set('next_canvas_id', next_canvas_id);
  },

  loadNextCanvasId: function() {

    return Storage.getInt('next_canvas_id');

  },

  saveCanvasIds: function() {
    Storage.set('canvas_ids', canvas_ids);
  },

  loadCanvasIds: function() {

    var canvas_ids_as_strings = Storage.get('canvas_ids').split(',');
    return $.map(canvas_ids_as_strings, function (e) { return parseInt(e); });

  },

  loadCurrentCanvasId: function() {

    return Storage.getInt('current_canvas_id');

  },

  loadNextCardId: function() {

    return Storage.getInt('next_card_id');

  },

  incrementNextCardId: function() {
    next_card_id++;
    Storage.set('next_card_id', next_card_id);
  },

  removeCardFromStorage: function($card) {

    var key = Cardsy.createCardKey(current_canvas_id, $($card).attr('id'));
    localStorage.removeItem(key);

  },





  /*************************/
  /*    Utility Methods    */
  /*************************/

  clearCurrentCanvas: function() {

    $('#canvas').find('.card').remove();

  },

  createCardKey: function(canvas_id, card_id) {

    var key = 'card.' + canvas_id + '.' + card_id;
    return key;

  },

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

var Storage = {

  get: function(key) {
    return localStorage.getItem(key);
  },

  set: function(key, value) {
    localStorage.setItem(key, value);
  },

  getInt: function(key) {
    return parseInt(localStorage.getItem(key));
  },

  getCard: function(key) {
    return JSON.parse(localStorage.getItem(key));
  },

  setCard: function(key, cardObj) {
    localStorage.setItem(key, JSON.stringify(cardObj));
  },

  getCardKeysByCanvasId: function(id) {

    return Object.keys(localStorage).filter(function(k) { return k.indexOf('card.' + id) > -1 });

  }

};



