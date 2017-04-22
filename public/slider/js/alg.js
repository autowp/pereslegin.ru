function Class() { }
Class.prototype.construct = function() {};
Class.extend = function(def) {
    var classDef = function() {
        if (arguments[0] !== Class) { this.construct.apply(this, arguments); }
    };
    
    var proto = new this(Class);
    var superClass = this.prototype;
    
    for (var n in def) {
        var item = def[n];                        
        if (item instanceof Function) item.$ = superClass;
        proto[n] = item;
    }

    classDef.prototype = proto;
    
    //Give this new class the same static extend method    
    classDef.extend = this.extend;        
    return classDef;
};


var AlgorithmAbstract = Class.extend({
    RADIX_BASE: 10,
    
    name:   'abstract',

    construct: function () {
    },
    
    getBounds: function(options) {
        var bounds = this._getBounds(options);
        bounds.max = bounds.min + bounds.step * options.invervals;
        
        return bounds;
    },
    
    _getBounds: function(options) {
    },
    
    _log: function(x) {
        return Math.log(x) / Math.log(this.RADIX_BASE);
    }
});

var AlgorithmBasic = AlgorithmAbstract.extend({
    name:   'basic',
    
    _getBounds: function(options) {
        return {
            min: options.min,
            step: (options.max - options.min) / options.invervals
        };
    }
});

var AlgorithmRounded = AlgorithmAbstract.extend({
    name:   'rounded',

    _getBounds: function(options) {

        var step = (options.max - options.min) / options.invervals;
    
        var min;
                
        var valid = false;
        while (!valid)  {
            step = this._nextRound(step);
            
            var info = this._scientificNotation(step);
            var stepPower = Math.pow(this.RADIX_BASE, info.exp);
            
            min = Math.floor(options.min / stepPower) * stepPower;
            max = min + step * options.invervals;
            
            valid = (max >= options.max);
        } 
    
        return {
            min: min,
            step: step
        };
    },
    
    _scientificNotation: function(number) {
        var exp = Math.floor(this._log(number));
        var power = Math.pow(this.RADIX_BASE, exp);
        var mantissa = number / power;
        
        return {
            mantissa: mantissa,
            exp: exp
        };
    },
    
    _nextRound: function(number) {
        var info = this._scientificNotation(number);
        
        var exp = info.exp;
        var power = Math.pow(this.RADIX_BASE, info.exp);
        var mantissa = Math.floor(info.mantissa);
        
        mantissa++;
        if (mantissa > this.RADIX_BASE) {
            mantissa -= this.RADIX_BASE;
            power *= this.RADIX_BASE;
        }
        return mantissa * power;
    }
});

var AlgorithmAdvanced = AlgorithmRounded.extend({
    name:   'advanced',

    _extraMantisses: [1, 1.2, 1.5, 2, 2.5],

    _nextRound: function(number) {
        var info = this._scientificNotation(number);
        
        var exp = info.exp;
        var power = Math.pow(this.RADIX_BASE, info.exp);
        var mantissa = info.mantissa;
        
        var foundExtra = false;
        for (var i=0; i<this._extraMantisses.length; i++) {
            if (mantissa <= this._extraMantisses[i]) {
                mantissa = this._extraMantisses[i];
                foundExtra = true;
                break;
            }
        }
        
        if (!foundExtra) {
            mantissa = Math.floor(mantissa);
            mantissa++;
        }
        
        if (mantissa > this.RADIX_BASE) {
            mantissa -= this.RADIX_BASE;
            power *= this.RADIX_BASE;
        }
        
        return mantissa * power;
    }
});