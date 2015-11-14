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

Grid.prototype.find = function(params) {
    var solution = null;

    for(var i in this.entryCoins) {
        var possibleSolution = new Solution();
        var coin = this.entryCoins[i];
        this.tryAddCoin(this.coins.clone().remove(coin), possibleSolution.try(coin), params);
    }

    return CURRENT_MAX_SOLUTION;
}

var CURRENT_MAX_SOLUTION = new Solution();
Grid.prototype.tryAddCoin = function(available_coins, current_solution, params) {
    if(current_solution.satisfyPrimaryCondition(params)) {
        var score = current_solution.score(params);

        if( score> CURRENT_MAX_SOLUTION.score(params))
            CURRENT_MAX_SOLUTION = current_solution;

        return; // Nothing else to do here.
    }
    var MAX_LENGTH = Math.max(5, params.coinCount) // TO-DO: Fix 2nd condition. It's just so it doesn't compute too big sequences...
    if(current_solution.length == MAX_LENGTH) {
        return; // Let's not go further.
    }

    for(var i in available_coins) {
        var coin = available_coins[i];
        var possible_solution = current_solution.try(coin)
        this.tryAddCoin(available_coins.clone().remove(coin), possible_solution, params);
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

Solution.prototype.works = function(config) {
    var total = 0;

    if(this.coins.length <= 0)
        return false;

    for(var i = 0; i < this.coins.length - 1; i++) {
        total += this.coins[i].value;
        if((total % config.coreNumber) == 0)
            return false; // Multiple has been obtained too soon! 
    }
    total += this.coins[this.coins.length - 1].value;

    return (total % config.coreNumber) == 0;
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

Solution.prototype.satisfyCoinCountEcho = function(config) {
    return this.length == config.coinCount;
}

Solution.prototype.satisfyMultiplierEcho = function(config) {
    return config.multiplierEcho == (this.total() / config.coreNumber);
}

Solution.prototype.satisfyPrimaryCondition = function(config) {
    if(config.priority == 'coin_count')
        return this.satisfyCoinCountEcho(config);
    else
        return this.satisfyMultiplierEcho(config);
}
Solution.prototype.satisfySecondaryCondition = function(config) {
    if(config.priority == 'coin_count')
        return this.satisfyMultiplierEcho(config);
    else
        return this.satisfyCoinCountEcho(config);
}



Solution.prototype.score = function(config) {
    if(!this.works(config)) {
        return -1;
    }

    var score = 0;

    if(config.maximizeBorder) {
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
    if(this.satisfySecondaryCondition(config))
        bonus = 1000; // This wins.

    if(config.maximizeNines)
        bonus += 5.1 * this.getNumberOf(9); // Some advantages to 9s being played. But not much compared to everything else.

    if(quotaBonus != 0)
        return (score * quotaBonus) + bonus; // Even make a 0 score solution win over everything else
    else
        return score + bonus; // Even make a 0 score solution win over everything else
}

function createCurrentGrid() {
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

function find() {
    $(".echo-results .result").removeClass("success");
    $(".echo-results .result").removeClass("error");

    CURRENT_MAX_SOLUTION = new Solution();
    var grid = createCurrentGrid();
    var params = {
        coreNumber: parseInt($("#core_number").val()),
        coinCount: parseInt($("#coin_count").val()),
        multiplierEcho: parseInt($("#multiplier_echo").val()),
        priority: $("[name=priority]:checked").val(),
        maximizeBorder: $('#maximize_border').is(":checked"),
        maximizeNines: $('#maximize_nines').is(":checked") 
    }

    if(!(params.coreNumber >= 1 && params.coreNumber <= 9))
        return; // Nothing to do here!

    console.log(grid)
    console.log(params)
    console.log(grid.find(params))

    pos = 0;
    $("#solution .coin").val("");
    for(var i in CURRENT_MAX_SOLUTION.coins) {
        pos += 1;
        $("#solution").find("#"+CURRENT_MAX_SOLUTION.coins[i].elem.attr('id')).val( pos )
    }
    $("#score").html(CURRENT_MAX_SOLUTION.score(params));
    $(".echo-results .coin_count .result").addClass(CURRENT_MAX_SOLUTION.satisfyCoinCountEcho(params)? "success" : "error");
    $(".echo-results .multiplier .result").addClass(CURRENT_MAX_SOLUTION.satisfyMultiplierEcho(params)? "success" : "error");
}

var INCREMENTING = false;
function incr() {
    INCREMENTING = true;
    $("#main_grid .coin:not(.entry)").each(function(){
        var newVal = parseInt($(this).val())+1;
        if(newVal <= 9)
            $(this).val(newVal)
        else
            $(this).val("")
    });
    INCREMENTING = false;
    find(); // Refresh.
}

/* Input */
$('#main_grid .coin, #main_grid #core_number, .echo.box .value').on("click", function () {
   $(this).select();
});

$('#main_grid .coin, #main_grid #core_number, .echo.box .value').each(function (e) {
    $(this).data('previous-value', $(this).val());
});
$('#main_grid .coin, #main_grid #core_number, .echo.box .value').on("keyup", function (e) {
    if((e.keyCode || e.which) === 9)  { 
        // Just landed here with a `tab`
        $(this).select();
        return;
    }

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


$("input").change(function(){
    if(!INCREMENTING)
        find();
});

/* Tooltips */
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

$("button").click(function(){
    $(this).blur();
});