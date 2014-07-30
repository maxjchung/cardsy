// Card and Canvas ids
var next_card_id = 1;

var next_canvas_id = 1;
var current_canvas_id = 1;
var canvas_ids = [];

// Input state
var isMouseDown = false;
var mouseDownStartedOnCard;
var mouseDownStartedOnCanvas;

var clickStartX;
var clickStartY;

var clickEndX;
var clickEndY;

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

  if ($(e.target).hasClass("sticky")) {
      mouseDownStartedOnCard = true;
      mouseDownStartedOnCanvas = false;
  }
  else {
      mouseDownStartedOnCard = false;
      mouseDownStartedOnCanvas = true;
  }

}

function updateSelectionSet(e) {

    $('.sticky').each(function () {
        var $aElem = $(".ghost-select");
        var $bElem = $(this);
        var result = doObjectsCollide($aElem, $bElem);

        if (result == true) {
          $bElem.addClass('selected');
        }
        else {
          $bElem.removeClass('selected');
        }

    });

}

function doObjectsCollide($square, $card) {
    var squareTop = $square.offset().top;
    var squareLeft = $square.offset().left;
    var cardTop = $card.offset().top;
    var cardLeft = $card.offset().left;

    return !(

        ((squareTop + parseFloat($square.css("height"))) < (cardTop)) ||
        (squareTop > (cardTop + parseFloat($card.css("height")))) ||

        ((squareLeft + parseFloat($square.css("width"))) < cardLeft) ||
        (squareLeft > (cardLeft + parseFloat($card.css("width"))))

    );
}  

function isMouseInTrashRegion(mouseY) {
  var topTrashRegion = $('#canvas').outerHeight() - 50;
  return (mouseY > topTrashRegion); 
}

var Cardsy = {

  /*************************/
  /*    Private Methods    */
  /*************************/

  initSpaceConstrainedStickies : function() {

    $('#canvas').on('keydown', '.sticky', Cardsy.handleTyping);
    $('#canvas').on('keyup', '.sticky', Cardsy.handleKeyUp);
    $('#canvas').on('paste', '.sticky', Cardsy.suppressPaste);

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

  handleKeyUp: function(e) {
    Cardsy.saveCard(Cardsy.jQueryCardToObj($(e.target)));    
  },

  suppressPaste: function() {
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

    s = this.settings;

    if (Cardsy.hasSaveState()) {
      Cardsy.loadSavedState();
    }

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

  bindMouseEventHandlers: function() {
    Cardsy.bindCardEvents();
    Cardsy.bindCanvasEvents();
  },

  bindCardEvents: function() {

    // TODO: calculate these inside mousedown to account for viewport resizes.
    var minLeft = 0,
        minTop = 0,
        maxLeft = $('#canvas').outerWidth() - 200,
        maxTop = $('#canvas').outerHeight() - 125;

    $('#canvas').on('mousedown', '.sticky', function(e) {

      var mouseDownX = e.originalEvent.clientX;
      var mouseDownY = e.originalEvent.clientY;
      var $targetCard = $(e.originalEvent.target);

      if($(this).hasClass('selected')) {
        e.preventDefault();  // prevent textarea focus in case user attempts to drag card(s)
      }
      else {
        Cardsy.clearSelections();
        $(this).addClass('selected');
      }

      var $cards = $('.selected');

      $targetCard.on('mouseup', function(e) {

        var $selected = $('.selected');

        if(mouseDownX == e.originalEvent.clientX && mouseDownY == e.originalEvent.clientY) {

          if($(this).hasClass('selected')) {
            Cardsy.clearSelections();
            $(this).addClass('selected');
            $(this).focus();
          }
        }
        else {

          if (isMouseInTrashRegion(e.originalEvent.clientY)) {
            $selected.each(function() {
              $(this).removeClass('notransition');

              $(this).bind('transitionend webkitTransitionEnd', function() {
                Cardsy.removeCardFromStorage($(this));
                $(this).remove();
              })

              $(this).addClass('trashed').addClass('shrunk');
            })
          }
          else {
            $selected.each(function(e) {

              var $this = $(this);

              var transformString = $(this).css('-moz-transform') || $(this).css('-webkit-transform');
              var translateX = parseFloat(transformString.match(/[-]?\d+/g)[4]);
              var translateY = parseFloat(transformString.match(/[-]?\d+/g)[5]);

              var newLeft = parseFloat($this.css('left')) + translateX;
              var newTop = parseFloat($this.css('top')) + translateY;

              // Cancel drag just for this card if any edge exceeds #canvas.
              if(newLeft < minLeft || newLeft > maxLeft || newTop < minTop || newTop > maxTop) {
                $this.removeClass('notransition');
                
                $this.css('-webkit-transform', 'initial');
                $this.css('-moz-transform', 'initial');
                $this.css('-o-transform', 'initial');
                $this.css('transform', 'initial');
              }
              else {
                $this.css('left', newLeft);
                $this.css('top', newTop);
                Cardsy.saveCard(Cardsy.jQueryCardToObj($this));

                $this.css('-webkit-transform', 'translate3d(0,0,0)');
                $this.css('-moz-transform', 'translate3d(0,0,0)');
                $this.css('-o-transform', 'translate3d(0,0,0)');
                $this.css('transform', 'translate3d(0,0,0)');
              }
            });
          }
        }
      });


      $cards.each(function(e) {

        var $card = $(this);
        $card.addClass('notransition');

        var z_idx = $card.css('z-index'),
        drg_h = $card.outerHeight(),
        drg_w = $card.outerWidth(),
        pos_y = $card.offset().top + drg_h - mouseDownY,
        pos_x = $card.offset().left + drg_w - mouseDownX;



        $card.css('z-index', 1000).parents().on("mousemove", function(e) {

          var mouseX = e.originalEvent.clientX;
          var mouseY = e.originalEvent.clientY;

          var deltaX = mouseX - mouseDownX;
          var deltaY = mouseY - mouseDownY;

          var translateString = 'translate3d(' 
            + deltaX + 'px,'
            + deltaY + 'px,'
            + '0)';

          $card.css('-webkit-transform', translateString);
          $card.css('-moz-transform', translateString);
          $card.css('-o-transform', translateString);
          $card.css('transform', translateString);

        });  // $cards.each(function(e) { ... }

        $card.on("mouseup", function(e) {

          $(this).css('z-index', z_idx);
          $(this).parents().unbind('mousemove');
          $(this).unbind('mouseup');

        });


      });
    });  // $('#canvas').on('mousedown', '.sticky', function(e) {

  },

  bindCanvasEvents: function() {

    $('#canvas').bind('clickStart', Cardsy.onClickStart);

    $('#canvas').on('mousedown', function(e) {


      setTarget(e);

      // if(mouseDownStartedOnCard) {
      //   cardDragTimeout = setTimeout(function(e) {
      //     $('.trash').addClass('reveal');
      //   }, 500);
      // }

      $(this).trigger('clickStart', { originalEvent: e});

        $(document).bind('clickDrag', Cardsy.onClickDrag);
        $(document).bind('clickEnd', Cardsy.onClickEnd);
    });

    $(document).on('mousemove', function(e) {
      if(isMouseDown) {
        $(this).trigger('clickDrag', { originalEvent: e});
      }
    });

    $(document).on('mouseup', function(e) {
      $(this).trigger('clickEnd', { originalEvent: e});

      $(document).unbind('clickDrag');
      $(document).unbind('clickEnd');
    });

  },

  onClickStart: function(e, data) {
    isMouseDown = true;

    var originalEvent = data.originalEvent;

    clickStartX = originalEvent.clientX;
    clickStartY = originalEvent.clientY;

    if(mouseDownStartedOnCanvas) {
      Cardsy.clearSelections();
    }

    $(".ghost-select").addClass("ghost-active");
    $(".ghost-select").css({
        'left': clickStartX,
        'top': clickStartY
    });
  },

  onClickDrag: function(e, data) {

    if(mouseDownStartedOnCanvas) {
      $('.ghost-select').addClass('selecting');
      Cardsy.drawSelectionSquare(e, data);      
    }

    else if (mouseDownStartedOnCard) {
      if(isMouseInTrashRegion(data.originalEvent.clientY)) {
        $('.trash').addClass('hover');
      }
      else {
        $('.trash').removeClass('hover');
      }

    }

  },

  onClickEnd: function(e, data) {
    isMouseDown = false;

    clickEndX = data.originalEvent.clientX;
    clickEndY = data.originalEvent.clientY;

    if(mouseDownStartedOnCard) {
      $('.trash').removeClass('hover');
      // clearTimeout(cardDragTimeout);
      // $('.trash').removeClass('reveal').removeClass('hover');
    }
    else if(mouseDownStartedOnCanvas) {

      $('.ghost-select').removeClass('selecting');
      $('.ghost-select').width(0).height(0);      

      if(clickStartX == clickEndX && clickStartY == clickEndY) {
        Cardsy.addStickyWithIncrement(clickStartX, clickStartY, next_card_id);
      }
    }
  },

  addStickyWithIncrement: function(x, y, id, text) {
    Cardsy.addSticky(x, y, id, text);
    Cardsy.incrementNextCardId();
  },

  addSticky: function(x, y, id, text) {
    var $newSticky = Cardsy.createStickyElement(x, y, id, text);

    $newSticky.addClass('shrunk')
              .addClass('selected')
              .appendTo('#canvas');

    setTimeout(function() { 
      $newSticky.removeClass('shrunk');
      $newSticky.focus();
    }, 30);

    $newSticky.focus();

    Cardsy.saveCard(Cardsy.jQueryCardToObj($newSticky));
  },

  loadSticky: function(x, y, id, text) {
    var $loadedSticky = Cardsy.createStickyElement(x, y, id, text);
    $loadedSticky.appendTo('#canvas');
  },

  createStickyElement: function(x, y, id, text) {
    return $("<textarea class='sticky'></textarea>")
            .attr('id', id)
            .css('left', x + 'px')
            .css('top', y + 'px')
            .attr('spellcheck', false)
            .html(text);
  },

  drawSelectionSquare: function(e, data) {

    var mouseX = data.originalEvent.clientX;
    var mouseY = data.originalEvent.clientY;

    var w = Math.abs(clickStartX - mouseX);
    var h = Math.abs(clickStartY - mouseY);


    $('.ghost-select').css({
        'width': w,
        'height': h
    });
    if (mouseX <= clickStartX && mouseY >= clickStartY) {
        $('.ghost-select').css({
            'left': mouseX
        });
    } else if (mouseY <= clickStartY && mouseX >= clickStartX) {
        $('.ghost-select').css({
            'top': mouseY
        });
    } else if (mouseY < clickStartY && mouseX < clickStartX) {
        $('.ghost-select').css({
            'left': mouseX,
            "top": mouseY
        });
    }

    updateSelectionSet(e);
  },

  clearSelections: function() {
    $('.selected').each(function() {
      $(this).removeClass('notransition');
      $(this).removeClass('selected');
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
    // next_canvas_id = Cardsy.loadNextCanvasId(); 
    next_card_id = Cardsy.loadNextCardId();
    //canvas_ids = Cardsy.loadCanvasIds();

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
      Cardsy.addStickyWithIncrement(30, 80, next_card_id, "Welcome to Cardsy, a free app for brainstorming and organizing your ideas.");

      Cardsy.addStickyWithIncrement(330, 80, next_card_id, "ADD CARDS by clicking on the board.");      
      Cardsy.addStickyWithIncrement(330, 230, next_card_id, "SELECT MULTIPLE CARDS by dragging a square around them.");      
      Cardsy.addStickyWithIncrement(330, 380, next_card_id, "DELETE CARDS by dragging them to the trash can.");      

      Cardsy.addStickyWithIncrement(630, 80, next_card_id, "Everything's saved in your browser, as long as you keep your cache.");      
    }, 500);

  },





  /*************************/
  /*    Card Operations    */
  /*************************/

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
    // Cardsy.updateCanvasIndicator();
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
      Cardsy.loadSticky(card.x, card.y, card.id, card.text);
    }

  },

  setCurrentCanvas: function(id) {
  
    current_canvas_id = id;
    Storage.set('current_canvas_id', current_canvas_id); 

  },

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
    $('.sticky').remove();
  },

  jQueryCardToObj: function ($card) {

    return {
      id: $card.attr('id'),
      x: getNumberFromPositionString($card.css('left')),
      y: getNumberFromPositionString($card.css('top')),
      text: $card.val()
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



