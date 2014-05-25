// Input state
var isMouseDown = false;
var mouseDownStartedOnCard;
var mouseDownStartedOnCanvas;

// Convenient references
var $currentTextArea;
var $practicePreArea = $('#practice');


function log(s) {
  console.log(s);
}

function htmlEncode(value){
  return $('<div/>').text(value).html();
}

function consumeEvent(event)
{
  event.stopPropagation();
  event.preventDefault();
}

function setTarget(e) {

  console.log('class of mousedown: ' + $(e.target).attr('class'));

  if ($(e.target).hasClass("sticky")) {
      mouseDownStartedOnCard = true;
      mouseDownStartedOnCanvas = false;
  }
  else {
      mouseDownStartedOnCard = false;
      mouseDownStartedOnCanvas = true;
  }

}

var Cardsy = {

  /*************************/
  /*    Private Methods    */
  /*************************/

  initSpaceConstrainedStickies : function() {


    $('.sticky')
      .bind('keydown', Cardsy.handleTyping)
      .bind('keyup', Cardsy.handleKeyUp)
      .bind('paste', Cardsy.handlePaste);

  },

  handleTyping: function(event) {

    $currentTextArea = $(event.target);

    if(event.keyCode == 9) //prevent tab key
    {
      consumeEvent(event);
      return;
    }

    else if (event.keyCode == 13) {
      consumeEvent(event);
      return;
    }

    else if((event.keyCode >= 37 && event.keyCode <= 40) || event.metaKey)
      return; //an arrow key or meta key. Note, we leave the event alone
    
    var temp = Cardsy.getWouldBeText(event);
    temp = htmlEncode(temp); 

    //If the text ends with a <br>, the pdiv will not expand by a line 
    //as it should. It requires a character afterwards to do so.
    if(temp && temp.substring(temp.length-4) == "<br>")
      temp +=".";

    $practicePreArea.html(temp);
    
    // Prevent input if it'd grow the practice element's height
    if($practicePreArea.outerHeight() > $currentTextArea.outerHeight()) {
      return false;
    }

    return true;
  },

  handleKeyUp: function() {
    $practicePreArea.html($currentTextArea.val());
  },

  handlePaste: function() {
    return false;
  },

  getWouldBeText: function(e) {

    var kbEvent = e.originalEvent;
    
    var theText = $currentTextArea.val();
    var keyCode = kbEvent.keyCode;
    var newChar = String.fromCharCode(keyCode);
    var selectedText = window.getSelection().toString();

    if(theText.charCodeAt(theText.length-1) == 10)
      theText = theText.substring(0, theText.length-1);

    if(selectedText) //if text is selected
    {   
      if(keyCode == 8) //delete key, replace w/nothing
        newChar = ""; 
      
      theText = theText.replace(selectedText, newChar);
    }
    else if(keyCode == 8) //delete key
      theText = theText.substring(0, theText.length-1);
    else
      theText = theText + newChar;

    return theText;

  },


  /*************************/
  /*    Initializations    */
  /*************************/

  settings: {

    'animationSpeed' : 150,
    'cardCharLimit' : 110,
    'textAreaRows' : 4,
    'introText' : 'Add more cards by clicking the canvas.\n\nTry moving them, too.'
  
  },

  init: function() {
    Cardsy.bindMouseEventHandlers();
    Cardsy.initSpaceConstrainedStickies();
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


  bindMouseEventHandlers: function() {

    $('body').bind('clickStart', Cardsy.onClickStart);
    $('body').bind('clickDrag', Cardsy.onClickDrag);
    $('body').bind('clickEnd', Cardsy.onClickEnd);

    // TODO distinguish drag targets (card vs canvas)
    $('body').on('mousedown', function(e) {


      setTarget(e);
      $(this).trigger('clickStart');
    });

    $('body').on('mousemove', function(e) {
      if(isMouseDown) {
        $(this).trigger('clickDrag');
      }
    });

    $('body').on('mouseup', function(e) {
      $(this).trigger('clickEnd');
    });

  },

  onClickStart: function(e) {
    isMouseDown = true;
    log('onClickStart');
  },

  onClickDrag: function(e) {

    if(mouseDownStartedOnCard) {
      log('TODO: drag card');
    }
    else if(mouseDownStartedOnCanvas) {
      log('TODO: draw selection square');      
    }

  },

  onClickEnd: function(e) {
    isMouseDown = false;
    log('onClickEnd');
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

    var $card = createCard(id, text);
    addToCanvas($card);

    function addToCanvas($card) {

      $card.hide();
      $card.find('.delete').hide();

      $('#canvas').append($card);

      $card.fadeIn(s.animationSpeed);

      if (undefined == text)
        $card.find('textarea').focus();

      bindDragEvents($card);

      Cardsy.saveCard(Cardsy.jQueryCardToObj($card));

    }

    function bindDragEvents($card) {

      $card.draggable({

        scroll: false,
        containment: 'parent',

        start: function() {
          $card.find('textarea').blur();
          $card.find('.delete').hide();
        },

        drag: function() {
          $card.find('.delete').hide();
        },

        stop: function() {
          $card.find('.delete').show();
          Cardsy.saveCard(Cardsy.jQueryCardToObj($card));
        }

      });
    
    }

    function createCard(id, text) {

      var $newCard = $('<div />')
        .attr('id', id)
        .addClass('card')
        .css('left', x + 'px')
        .css('top', y + 'px')
        .hover(
          function(e) { Cardsy.showDeleteButton(e) },
          function(e) { Cardsy.hideDeleteButton(e) }
        );

      var $textArea = createTextArea();

      if (undefined != text)
        $textArea.html(text);

      $deleteButton = createDeleteButton();

      return $newCard.append($textArea).append($deleteButton);

    }

    function createTextArea() {

      var $textArea = $('<textarea />');
      
      $textArea.hover(
        function(e) { $(this).addClass('hover') },
        function(e) { $(this).removeClass('hover') }
      );

      $textArea.bind('textchange', function() {
        Cardsy.saveCard(Cardsy.jQueryCardToObj($(this.parentElement)))
      });

      return $textArea;

    }

    function createDeleteButton() {

      var $deleteButton = $('<div />')
        .addClass('delete')
        .html('&#10006;')
        .click(function(e) { Cardsy.deleteCard(e) });

      $deleteButton.hover(
        function(e) { $(this).addClass('hover') },
        function(e) { $(this).removeClass('hover') }
      );

      return $deleteButton;

    }

  },

  deleteCard: function(e) {

    var $card = $(e.target.parentElement);

    $card.hide('highlight', null, s.animationSpeed, function(e) { this.remove(); });
    Cardsy.removeCardFromStorage($card);

  },

  saveCard: function(card) {

    var key = Storage.createCardKey(current_canvas_id, card.id);
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
      var key = Storage.createCardKey(current_canvas_id, $(this).attr('id'));
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

    var key = Storage.createCardKey(current_canvas_id, $($card).attr('id'));
    localStorage.removeItem(key);

  },





  /*************************/
  /*    Utility Methods    */
  /*************************/

  clearCurrentCanvas: function() {

    $('#canvas').find('.card').remove();

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
    return parseInt(Storage.get(key));
  },

  getCard: function(key) {
    return JSON.parse(Storage.get(key));
  },

  setCard: function(key, cardObj) {
    Storage.set(key, JSON.stringify(cardObj));
  },

  createCardKey: function(canvas_id, card_id) {
    return 'card.' + canvas_id + '.' + card_id;
  },

  getCardKeysByCanvasId: function(id) {

    return Object.keys(localStorage).filter(function(k) { return k.indexOf('card.' + id) > -1 });

  }

};



