/* Input */
$(function () {
  // Initialize input
  $('#main_grid .coin, #main_grid #core_number, .echo.box .value').each(function (e) {
    $(this).data('previous-value', $(this).val());
  })
});

$('#main_grid .coin, #main_grid #core_number, .echo.box .value').on("click", function () {
   $(this).select();
});

$('#main_grid .coin, #main_grid #core_number, .echo.box .value').on("keyup", function (e) {
  if((e.keyCode || e.which) === 9)  { 
    // Just landed here with a `tab`
    $(this).select();
    return;
  }

  if($(this).val() == '' && $(this).is(".coin, #core_number"))
    return; // Let them delete numbers in coins only

  var old_val = $(this).data('previous-value');
  var value = parseInt($(this).val()); 
  var max = $(this).attr('max') || 9;
  if(value >= 1 && value <= max) {
    $(this).val(value);
    $(this).change();
    $(this).data('previous-value', value);
    if($(this).is('.coin')) {
      var $elem = $("#main_grid :input:eq(" + ($(":input").index(this) + 1) + ")");
      $elem.focus();
      $elem.select();
      return;
    }
  }
  else
    $(this).val(old_val);

  if(!$(this).is('#multiplier_echo'))
    $(this).select();
});

/* Controller */
$(function () {
  // Initialize controller and main functions
  var controller = new SphereBreakController();

  var isAutoUpdateSolutionOn = function() {
    return $("#find-solution-toggle").prop('checked');
  }

  var staleSolution = false;
  $("#main-section input").on('change', function() {
    if($(this).is($("#find-solution-toggle")))
      return; // We have a different handler for this below.

    if (isAutoUpdateSolutionOn()) {
      controller.findCurrentSolution();
      staleSolution = false;
    }
    else {
      staleSolution = true;
    }
  });

  // "Advance turn" actions
  $("#action-advance-turn").on('click', function(){
    controller.advanceTurn();
    controller.findCurrentSolution(); // Refresh.
    staleSolution = false;
  });

  $("#action-advance-turn-with-solution").on('click', function(){
    controller.advanceTurnWithCurrentSolution();
    controller.findCurrentSolution(); // Refresh.
    staleSolution = false;
  });

  // FindSolution button & toggle
  $("#action-find-solution").on('click', function() {
    controller.findCurrentSolution();
    staleSolution = false;
  });

  $("#find-solution-toggle").change(function(){
    $("#action-find-solution").prop('disabled', isAutoUpdateSolutionOn());
    if (isAutoUpdateSolutionOn() && staleSolution) {
      controller.findCurrentSolution();
      staleSolution = false;
    }
  });

  $("#action-find-solution").prop('disabled', isAutoUpdateSolutionOn());
})

/* Tooltips */
$(function () {
  // Initialize tooltips
  $('[data-toggle="tooltip"]').tooltip();
})

$("#main-section button").click(function() {
  // Bug with tooltip: Click on first button, then hover the second one.
  $(this).blur();
});
