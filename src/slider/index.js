import $ from 'jquery';
import 'jquery-ui/ui/widgets/slider';
import 'jquery-ui/themes/base/base.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/slider.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';
import './styles.less';

class AlgorithmAbstract {
    constructor() {
        this.RADIX_BASE = 10;
        this.name = 'abstract';
    }

    getBounds(options) {
        const bounds = this._getBounds(options);
        bounds.max = bounds.min + bounds.step * options.invervals;

        return bounds;
    }

    _log(x) {
        return Math.log(x) / Math.log(this.RADIX_BASE);
    }
}


class AlgorithmBasic extends AlgorithmAbstract {
    constructor() {
        super();
        this.name = 'basic';
    }

    _getBounds(options) {
        return {
            min: options.min,
            step: (options.max - options.min) / options.invervals
        };
    }
}

class AlgorithmRounded extends AlgorithmAbstract {
    constructor() {
        super();
        this.name = 'rounded';
    }

    _getBounds(options) {

        let step = (options.max - options.min) / options.invervals;

        let min, max;

        let valid = false;
        while (!valid) {
            step = this._nextRound(step);

            const info = this._scientificNotation(step);
            const stepPower = Math.pow(this.RADIX_BASE, info.exp);

            min = Math.floor(options.min / stepPower) * stepPower;
            max = min + step * options.invervals;

            valid = (max >= options.max);
        }

        return {
            min: min,
            step: step
        };
    }

    _scientificNotation(number) {
        const exp = Math.floor(this._log(number));
        const power = Math.pow(this.RADIX_BASE, exp);
        const mantissa = number / power;

        return {
            mantissa: mantissa,
            exp: exp
        };
    }

    _nextRound(number) {
        const info = this._scientificNotation(number);

        let power = Math.pow(this.RADIX_BASE, info.exp);
        let mantissa = Math.floor(info.mantissa);

        mantissa++;
        if (mantissa > this.RADIX_BASE) {
            mantissa -= this.RADIX_BASE;
            power *= this.RADIX_BASE;
        }
        return mantissa * power;
    }
}

class AlgorithmAdvanced extends AlgorithmRounded {
    constructor() {
        super();
        this.name = 'advanced';
        this._extraMantisses = [1, 1.2, 1.5, 2, 2.5];
    }

    _nextRound(number) {
        const info = this._scientificNotation(number);

        let power = Math.pow(this.RADIX_BASE, info.exp);
        let mantissa = info.mantissa;

        let foundExtra = false;
        for (let i = 0; i < this._extraMantisses.length; i++) {
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
}

$(function() {
    const examples = [{
        name: 'Частота процессора',
        unit: 'МГц',
        min: 1000,
        max: 3200
    }, {
        name: 'Среднесуточная температура',
        unit: '°С',
        min: -40,
        max: +40
    }, {
        name: 'Аэродинамическое сопр.',
        unit: '',
        min: 0.10,
        max: 0.57
    }];

    function buildExamples() {

        const intervalsCount = 9;
        const labelsCount = intervalsCount + 1;

        $(examples).map(function(i, example) {
            if (example.min > example.max) {
                const t = example.min;
                example.min = example.max;
                example.max = t;
            }
        });

        function renderExamplesTabs(id, callback) {
            $('#'+id).empty().each(function() {
                const example3 = $(this);
                const ul = $('<ul class="nav nav-tabs" role="tablist" />');
                const tabs = $('<div class="tab-content" />');
                example3.append(ul);
                example3.append(tabs);
                $(examples).map((i, example) => {
                    const tabId = id + '-' + i;
                    const div = $('<div class="tab-pane fade" id="profile" role="tabpanel"></div>')
                        .attr('id', tabId)
                        .toggleClass('active show', i === 0);
                    tabs.append(div);

                    callback(div, example);

                    ul.append(
                        $('<li class="nav-item" role="presentation">').append(
                            $('<a class="nav-link" data-toggle="tab" role="tab" aria-controls="profile" aria-selected="false"></a>')
                                .text(example.name)
                                .attr('href', '#'+tabId)
                                .toggleClass('active', i === 0)
                        )
                    );
                });
            });
        }

        function renderAlgorithm(div, example, algorithm) {
            div.append(
                $('<p />').text(algorithm.name)
            ).append(
                '<div style="width:100%"><table style="width:100%" class="table"><tr></tr></table></div>'
            ).append(
                '<div class="slider" />'
            ).append(
                '<div class="label" />'
            );

            const tr = $('tr', div);

            const bounds = algorithm.getBounds({
                min: example.min,
                max: example.max,
                invervals: intervalsCount
            });

            const width = 100 / labelsCount;
            for (let j=0; j<labelsCount; j++) {
                const value = Math.round((bounds.min + bounds.step * j) * 100) / 100;
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
                slide: (event, ui) => {
                    $('div.label', div).text(ui.values[0] + ' — ' + ui.values[1] + ' ' + example.unit);
                }
            }).css({
                marginLeft: (width / 2) + '%',
                marginRight: (width / 2) + '%'
            });
            $('div.label', div).text(bounds.min + ' — ' + bounds.max + ' ' + example.unit).css({marginTop: '10px'});
        }

        function renderAlgorithmTabs(id, algorithm) {
            renderExamplesTabs(id, (div, example) => {
                renderAlgorithm(div, example, algorithm);
            });
        }

        renderExamplesTabs('example2', (div, example) => {
            div.append(
                $('<div />').slider({
                    range: true,
                    min: example.min,
                    max: example.max,
                    step: (example.max - example.min) / 100,
                    values: [example.min, example.max],
                    slide: (event, ui) => {
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

        renderExamplesTabs('example-summary', (div, example) => {
            const algorithms = [{
                algorithm: new AlgorithmBasic(),
                id: 'example-summary-basic'
            }, {
                algorithm: new AlgorithmRounded(),
                id: 'example-summary-rounded'
            }, {
                algorithm: new AlgorithmAdvanced(),
                id: 'example-summary-advanced'
            }];

            $.map(algorithms, (algorithm) => {

                const aDiv = $('<div />').attr('id', algorithm.id);
                div.append(aDiv);

                renderAlgorithm(aDiv, example, algorithm.algorithm);
            });
        });
    }

    buildExamples();

    $('#examples-values').each(function() {
        const container = $(this);

        $(examples).map((i, example) => {
            const label = $('<span></span>').text(example.name);
            const from = $('<label> от: <input type="text" /></label>');
            const to = $('<label> до: <input type="text" /></label>');

            $('input', from).on('change', function() {
                example.min = parseFloat($(this).val());
                buildExamples();
            }).val(example.min);

            $('input', to).on('change', function() {
                example.max = parseFloat($(this).val());
                buildExamples();
            }).val(example.max);

            container.append(
                $('<div></div>').append(label).append(from).append(to)
            );
        });

        $('input', container).attr('size', 4);

        container.append(
            $('<button class="btn btn-primary">применить</button>').click(function() {
                let rerender = false;
                $('div', container).each(function(i) {
                    const min = parseFloat($('input:first', this).val());
                    const max = parseFloat($('input:last', this).val());
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
