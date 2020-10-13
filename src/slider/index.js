import $ from 'jquery';
import 'jquery-ui/ui/widgets/tabs';
import 'jquery-ui/ui/widgets/slider';
import 'jquery-ui/themes/base/base.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/slider.css';
import 'jquery-ui/themes/base/tabs.css';
import './styles.less';

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
        if (item instanceof Function) {
            item.$ = superClass;
        }
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
    
        var min, max;
                
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

$(function() {
    var examples = [{
        name:   'Частота процессора',
        unit:   'МГц',
        min:    1000,
        max:    3200
    }, {
        name:   'Среднесуточная температура',
        unit:   '°С',
        min:    -40,
        max:    +40
    }, {
        name:   'Аэродинамическое сопр.',
        unit:   '',
        min:    0.10,
        max:    0.57
    }];

    function buildExamples() {

        var invervalsCount = 9;
        var labelsCount = invervalsCount + 1;

        $(examples).map(function(i, example) {
            if (example.min > example.max) {
                var t = example.min;
                example.min = example.max;
                example.max = t;
            }
        });

        function renderExamplesTabs(id, callback) {
            $('#'+id).empty().each(function() {
                var example3 = $(this);
                var ul = $('<ul />');
                example3.append(ul);
                $(examples).map(function(i, example) {
                    var div = $('<div></div>').attr('id', id+'-'+i);
                    example3.append(div);

                    callback(div, example);

                    ul.append(
                        $('<li>').append(
                            $('<a />').text(example.name).attr('href', '#'+id+'-'+i)
                        )
                    );
                });
                example3.tabs();
            });
        }

        function renderAlgorithm(div, example, algorithm) {
            div.append(
                $('<p />').text(algorithm.name)
            ).append(
                '<div style="width:100%"><table style="width:100%" cellspacing="0" cellpadding="0"><tr></tr></table></div>'
            ).append(
                '<div class="slider" />'
            ).append(
                '<div class="label" />'
            );

            var tr = $('tr', div);

            var bounds = algorithm.getBounds({
                min: example.min,
                max: example.max,
                invervals: invervalsCount
            });

            var width = 100 / labelsCount;
            for (var j=0; j<labelsCount; j++) {
                var value = Math.round((bounds.min + bounds.step*j) * 100) / 100;
                tr.append(
                    $('<td />')
                        .text(value)
                        .css({
                            width: width+'%',
                            textAlign: 'center',
                            fontSize: '12px'
                        })
                );
            }

            $('div.slider', div).slider({
                range: true,
                min: bounds.min,
                max: bounds.max,
                step: bounds.step,
                values: [bounds.min, bounds.max],
                slide: function(event, ui) {
                    $('div.label', div).text(ui.values[0] + ' — ' + ui.values[1] + ' ' + example.unit);
                }
            }).css({
                marginLeft: (width / 2) + '%',
                marginRight: (width / 2) + '%'
            });
            $('div.label', div).text(bounds.min + ' — ' + bounds.max + ' ' + example.unit).css({marginTop: '10px'});
        }

        function renderAlgorithmTabs(id, algorithm) {
            renderExamplesTabs(id, function(div, example) {
                renderAlgorithm(div, example, algorithm);
            });
        }

        renderExamplesTabs('example2', function(div, example) {
            div.append(
                $('<div />').slider({
                    range: true,
                    min: example.min,
                    max: example.max,
                    step: (example.max - example.min) / 100,
                    values: [example.min, example.max],
                    slide: function(event, ui) {
                        $('div:last', div).text(ui.values[0] + ' — ' + ui.values[1] + ' ' + example.unit);
                    }
                })
            ).append(
                $('<div />')
                    .text(example.min + ' — ' + example.max + ' ' + example.unit)
                    .css({marginTop: '10px'})
            );
        });

        renderAlgorithmTabs('example3', new AlgorithmBasic());
        renderAlgorithmTabs('example5', new AlgorithmRounded());
        renderAlgorithmTabs('example6', new AlgorithmAdvanced());

        renderExamplesTabs('example-summary', function(div, example) {
            var algorithms = [{
                algorithm:  new AlgorithmBasic(),
                id:         'example-summary-basic'
            }, {
                algorithm:  new AlgorithmRounded(),
                id:         'example-summary-rounded'
            }, {
                algorithm:  new AlgorithmAdvanced(),
                id:         'example-summary-advanced'
            }];

            $.map(algorithms, function(algorithm) {

                var aDiv = $('<div />').attr('id', algorithm.id);
                div.append(aDiv);

                renderAlgorithm(aDiv, example, algorithm.algorithm);
            });
        });
    }

    buildExamples();

    $('#examples-values').each(function() {
        var container = $(this);

        $(examples).map(function(i, example) {
            var label = $('<span></span>').text(example.name);
            var from = $('<label> от: <input type="text" /></label>');
            var to = $('<label> до: <input type="text" /></label>');

            $('input', from).bind('change', function() {
                example.min = parseFloat($(this).val());
                buildExamples();
            }).val(example.min);

            $('input', to).bind('change', function() {
                example.max = parseFloat($(this).val());
                buildExamples();
            }).val(example.max);

            container.append(
                $('<div></div>').append(label).append(from).append(to)
            );
        });

        $('input', container).attr('size', 4);

        container.append(
            $('<button>применить</button>').click(function() {
                var rerender = false;
                $('div', container).each(function(i) {
                    var min = parseFloat($('input:first', this).val());
                    var max = parseFloat($('input:last', this).val());
                    if (min !== examples[i].min || max !== examples[i].max) {
                        rerender = true;
                    }  
                    examples[i].min = min;
                    examples[i].max = max;
                });
                if (rerender) {
                    buildExamples();
                }
            })
        );
    });
   
});
