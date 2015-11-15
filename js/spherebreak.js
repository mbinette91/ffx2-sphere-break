// Algorithm could be improved vastly by finding numbers instead of coins. 9 possible values (MAX) instead of 16 different coins. Less permutations. And then determine which coins to pick if solution works.
// This solution starts lagging at 16 coins and 6+ sequences.
function Grid() {
  this.coins = [];
  this.entryCoins = [];
  this.borderCoins = [];
}

Grid.prototype.addCoin = function(coin) {
  this.coins.push(coin);

  if(coin.isEntry)
    this.entryCoins.push(coin);
  else
    this.borderCoins.push(coin);
}

Grid.prototype.find = function(context) {
  var solution = null;

  for(var i in this.entryCoins) {
    var possibleSolution = new Solution();
    var coin = this.entryCoins[i];
    this.tryAddCoin(this.coins.clone().remove(coin), possibleSolution.try(coin), context);
  }

  return context.maxSolution;
}

Grid.prototype.tryAddCoin = function(available_coins, current_solution, context) {
  if(current_solution.satisfyPrimaryCondition(context)) {
    var score = current_solution.score(context);

    if(score > context.maxSolution.score(context))
      context.maxSolution = current_solution;

    return; // Nothing else to do here.
  }
  var MAX_LENGTH = Math.max(5, context.coinCount) // TO-DO: Fix 2nd condition. It's just so it doesn't compute too big sequences...
  if(current_solution.length == MAX_LENGTH) {
    return; // Let's not go further.
  }

  for(var i in available_coins) {
    var coin = available_coins[i];
    var possible_solution = current_solution.try(coin)
    this.tryAddCoin(available_coins.clone().remove(coin), possible_solution, context);
  }

  return false;
}

function Coin(elem, value, isEntry, bonus) {
  this.elem = elem;
  this.value = value;
  this.isEntry = isEntry;
  this.bonus = bonus;
}

function Solution(coins) {
  if(coins)
    this.coins = coins
  else
    this.coins = []

  this.length = this.coins.length;
}

Solution.prototype.try = function(coin) {
  return new Solution(this.coins.concat([coin]));
}

Solution.prototype.works = function(context) {
  var total = 0;

  if(this.coins.length <= 0)
    return false;

  for(var i = 0; i < this.coins.length - 1; i++) {
    total += this.coins[i].value;
    if((total % context.coreNumber) == 0)
      return false; // Multiple has been obtained too soon! 
  }
  total += this.coins[this.coins.length - 1].value;

  return (total % context.coreNumber) == 0;
}

Solution.prototype.total = function() {
  var total = 0;

  for(var i = 0; i < this.coins.length; i++) {
    total += this.coins[i].value;
  }

  return total;
}

Solution.prototype.getNumberOf = function(n) {
  var total = 0;

  for(var i = 0; i < this.coins.length; i++) {
    if(this.coins[i].value == n)
      total += 1;
  }

  return total;
}

Solution.prototype.toString = function() {
  var values = [];

  for(var i in this.coins) {
    values.push(this.coins[i].value);
  }

  return values.toString();
}

Solution.prototype.satisfyCoinCountEcho = function(context) {
  return this.length == context.coinCount;
}

Solution.prototype.satisfyMultiplierEcho = function(context) {
  return context.multiplierEcho == (this.total() / context.coreNumber);
}

Solution.prototype.satisfyPrimaryCondition = function(context) {
  if(context.priority == 'coin_count')
    return this.satisfyCoinCountEcho(context);
  else
    return this.satisfyMultiplierEcho(context);
}
Solution.prototype.satisfySecondaryCondition = function(context) {
  if(context.priority == 'coin_count')
    return this.satisfyMultiplierEcho(context);
  else
    return this.satisfyCoinCountEcho(context);
}

Solution.prototype.score = function(context) {
  if(!this.works(context)) {
    return -1;
  }

  var score = 0;

  if(context.maximizeBorder) {
    for(var i in this.coins) {
      if(!this.coins[i].isEntry)
        score += 1;
    }
  }
  else {
    for(var i in this.coins) {
      if(this.coins[i].isEntry)
        score += 1;
    }
  }
  quotaBonus = this.coins[0].bonus; // Only for first coin played

  var bonus = 1;
  if(this.satisfySecondaryCondition(context))
    bonus = 1000; // This wins.

  if(context.maximizeNines)
    bonus += 5.1 * this.getNumberOf(9); // Some advantages to 9s being played. But not much compared to everything else.

  if(quotaBonus != 0)
    return (score * quotaBonus) + bonus; // Even make a 0 score solution win over everything else
  else
    return score + bonus; // Even make a 0 score solution win over everything else
}

function SphereBreakController() {
  this._advancingTurn = false;
}

SphereBreakController.prototype.getCurrentGrid = function() {
  var grid = new Grid();

  $("#main_grid .coin").each(function() {
    var value = parseInt($(this).val());
    var parts = $(this).val().split('*');
    var bonus = 0;
    if(parts.length > 1)
      bonus = parseInt(parts[1]);
    if(value >= 1 && value <= 9) {
      var coin = new Coin($(this), value, $(this).hasClass('entry'), bonus);
      grid.addCoin(coin);
    }
  });

  return grid;
}

SphereBreakController.prototype.getCurrentContext = function() {
  return {
    maxSolution: new Solution(),
    coreNumber: parseInt($("#core_number").val()),
    coinCount: parseInt($("#coin_count").val()),
    multiplierEcho: parseInt($("#multiplier_echo").val()),
    priority: $("[name=priority]:checked").val(),
    maximizeBorder: $('#maximize_border').is(":checked"),
    maximizeNines: $('#maximize_nines').is(":checked") 
  }
}

SphereBreakController.prototype.findCurrentSolution = function() {
  $(".echo-results .result").removeClass("success");
  $(".echo-results .result").removeClass("error");

  if(this._advancingTurn)
    return; // Do nothing.

  var context = this.getCurrentContext();

  if(!(context.coreNumber >= 1 && context.coreNumber <= 9))
    return; // Nothing to do here!

  var grid = this.getCurrentGrid();

  var solution = grid.find(context);

  var pos = 0;
  $("#solution .coin").val("");
  for(var i in solution.coins) {
    pos += 1;
    $("#solution").find("#" + solution.coins[i].elem.attr('id')).val( pos )
  }
  $("#score").html(solution.score(context));
  $(".echo-results .coin_count .result").addClass(solution.satisfyCoinCountEcho(context)? "success" : "error");
  $(".echo-results .multiplier .result").addClass(solution.satisfyMultiplierEcho(context)? "success" : "error");
}

SphereBreakController.prototype.advanceTurn = function() {
  this._advancingTurn = true;
  $("#main_grid .coin:not(.entry)").each(function(){
    var newVal = parseInt($(this).val())+1;
    if(newVal <= 9)
      $(this).val(newVal)
    else
      $(this).val("")
  });
  this._advancingTurn = false;
}