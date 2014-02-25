/**
 * @name		jQuery KnobKnob plugin
 * @author		Martin Angelov
 * @version 	1.0
 * @url			http://tutorialzine.com/2011/11/pretty-switches-css3-jquery/
 * @license		MIT License
 */

(function($){

    function KnobKnob(props, settings)
    {
        this.knob = null;
        this.knobTop = null;
        this.startDeg = -1;
        this.currentDeg = 0;
        this.rotation = 0;
        this.lastDeg = 0;
        this.doc = $(document);

        if (typeof props == 'object')
        {
            settings = props;
        }

        this.options = $.extend({}, $.fn.knobKnob.defaultSettings, settings || {});
    }

    KnobKnob.prototype =
    {
        generate: function(el)
        {
            var tpl = '<div class="knob">\
                           <div class="top"></div>\
                           <div class="base"></div>\
                       </div>';


            el.append(tpl);

            this.knob = $('.knob', el);
            this.knobTop = this.knob.find('.top');
            this.knob.addClass(this.options.className);

            this.rotate(this.options.value);
        },
        rotate: function(v)
        {
            if(v > 0 && v <= 359){
                this.rotation = this.lastDeg = this.currentDeg = v;
                this.knobTop.css('transform','rotate('+(v)+'deg)');
                this.options.turn(v/359);
            }
        },
        bind: function()
        {
            var _this = this;
            this.knob.on('mousedown touchstart', function(e)
            {
                e.preventDefault();

                var offset = _this.knob.offset();
                var center = {
                    y : offset.top + _this.knob.height()/2,
                    x: offset.left + _this.knob.width()/2
                };

                var a, b, deg, tmp,
                    rad2deg = 180/Math.PI;

                _this.knob.on('mousemove.rem touchmove.rem',function(e)
                {

                    e = (e.originalEvent.touches) ? e.originalEvent.touches[0] : e;

                    a = center.y - e.pageY;
                    b = center.x - e.pageX;
                    deg = Math.atan2(a,b)*rad2deg;

                    // we have to make sure that negative
                    // angles are turned into positive:
                    if(deg<0){
                        deg = 360 + deg;
                    }

                    // Save the starting position of the drag
                    if(_this.startDeg == -1){
                        _this.startDeg = deg;
                    }

                    // Calculating the current rotation
                    tmp = Math.floor((deg-_this.startDeg) + _this.rotation);

                    // Making sure the current rotation
                    // stays between 0 and 359
                    if(tmp < 0){
                        tmp = 360 + tmp;
                    }
                    else if(tmp > 359){
                        tmp = tmp % 360;
                    }

                    // Snapping in the off position:
                    if(_this.options.snap && tmp < _this.options.snap){
                        tmp = 0;
                    }

                    // This would suggest we are at an end position;
                    // we need to block further rotation.
                    if(Math.abs(tmp - _this.lastDeg) > 180){
                        return false;
                    }

                    _this.currentDeg = tmp;
                    _this.lastDeg = tmp;

                    _this.knobTop.css('transform','rotate('+(_this.currentDeg)+'deg)');
                    _this.options.turn(_this.currentDeg/360);
                });

                _this.doc.on('mouseup.rem  touchend.rem',function()
                {
                    _this.knob.off('.rem');
                    _this.doc.off('.rem');

                    // Saving the current rotation
                    _this.rotation = _this.currentDeg;

                    // Marking the starting degree as invalid
                    _this.startDeg = -1;
                });

            });
        }
    };
	
	$.fn.knobKnob = function(props, settings)
    {
		return this.each(function()
        {
            var knobKnob = new KnobKnob(props, settings);

            if (!this.el)
            {
                this.el = $(this);
                knobKnob.generate(this.el);
                knobKnob.bind();

                this.el.data('knob', knobKnob);
            }
		});
	};

    $.fn.knobKnob.defaultSettings =
    {
        min: 0,
        max: 0,
        className: "default",
        snap: 0,
        value: 0,
        turn: function(){}
    };
	
})(jQuery);