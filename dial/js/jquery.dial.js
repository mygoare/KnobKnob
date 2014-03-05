/**
 * @name		jQuery Dial plugin
 * @author		Martin Angelov
 * @version 	1.0
 * @url			http://tutorialzine.com/2011/11/pretty-switches-css3-jquery/
 * @license		MIT License
 */

/*

    Modified by Mesheven, repo url: https://github.com/mygoare/KnobKnob

    Optimize the plugin based on: http://www.websanova.com/blog/jquery/10-coding-tips-to-write-superior-jquery-plugins#.UwsRSUKSxgs

    Some updates:
        1.  Make the plugin with OOP mode
        2.  Add two more themes
        3.  add `rotate` method to change the rotate value dynamic

 */

(function($){

    function Dial(props, settings)
    {
        this.dial = null;
        this.dialTop = null;
        this.startDeg = -1;
        this.currentDeg = 0;
        this.rotation = 0;
        this.lastDeg = 0;
        this.v = 0;
        this.doc = $(document);

        if (typeof props == 'object')
        {
            settings = props;
        }

        this.options = $.extend({}, $.fn.dial.defaultSettings, settings || {});
    }

    Dial.prototype =
    {
        generate: function(el)
        {
            var tpl = '<div class="dial">\
                           <div class="top"></div>\
                           <div class="base"></div>\
                       </div>';

            el.append(tpl);
            this.dial = $('.dial', el);
            this.dialTop = this.dial.find('.top');
            this.dial.addClass(this.options.className);

            this.init();
        },
        init: function()
        {
            // v calculate out d
            var v = this.v = this.options.value;
            var d = (v - this.options.min) / (this.options.max - this.options.min) * this.options.angleArc + this.options.angleOffset;

            this.rotation = this.lastDeg = this.currentDeg = d;
            this.rotate(d);
        },
        rotate: function(d)
        {
            if( d >= 0 && d <= this.options.angleArc + this.options.angleOffset )
            {
                this.dialTop.css('transform','rotate('+(d)+'deg)');
            }
            else
            {
                console.error("d is not a valid degree number. Maybe the wrong default value you have set!");
                return false;
            }
        },
        bind: function()
        {
            var _this = this;
            this.dial.on('mousedown touchstart', function(e)
            {
                e.preventDefault();

                var offset = _this.dial.offset();
                var center = {
                    y : offset.top + _this.dial.height()/2,
                    x: offset.left + _this.dial.width()/2
                };

                var a, b, deg, tmp,
                    rad2deg = 180/Math.PI;

                _this.dial.on('mousemove.rem touchmove.rem',function(e)
                {

                    e = (e.originalEvent.touches) ? e.originalEvent.touches[0] : e;

                    a = center.y - e.pageY;
                    b = center.x - e.pageX;
                    deg = Math.atan2(a,b)*rad2deg;  // -180 ~ 180 degree

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
                    // use for debug
                    // console.warn("当前"+deg, "上次起始"+_this.startDeg, "现在tmp值"+tmp, "上次tmp值"+_this.rotation);

                    // block further rotation
                    if (Math.abs(tmp - _this.startDeg) > 180)
                    {
                        return false;
                    }

                    if (deg < _this.options.angleOffset)
                    {
                        deg = tmp = _this.options.angleOffset;
                        _this.rotate(deg);
                    }
                    else if (deg > _this.options.angleOffset + _this.options.angleArc)
                    {
                        deg = tmp = _this.options.angleArc + _this.options.angleOffset;
                        _this.rotate(deg);
                    }

                    _this.currentDeg = tmp; // _this.currentDeg 作为传递纽带 给157行的 _this.rotation
                    _this.lastDeg = tmp;

                    // output degree
                    _this.rotate(_this.currentDeg);

                    // output value
                    _this.v = (_this.currentDeg - _this.options.angleOffset) / _this.options.angleArc * (_this.options.max - _this.options.min) + _this.options.min;
                    _this.v = Math.round(_this.v);
                    _this.options.turn(_this.v);
                });

                _this.doc.on('mouseup.rem  touchend.rem',function()
                {
                    _this.dial.off('.rem');
                    _this.doc.off('.rem');

                    // Saving the current rotation
                    _this.rotation = _this.currentDeg;

                    // Marking the starting degree as invalid
                    _this.startDeg = -1;

                    _this.options.change(_this.v);
                });

            });
        }
    };
	
	$.fn.dial = function(props, settings)
    {
		return this.each(function()
        {
            var dial = new Dial(props, settings);

            if (!this.el)
            {
                this.el = $(this);
                dial.generate(this.el);
                dial.bind();

                this.el.data('dial', dial);
            }
		});
	};

    $.fn.dial.defaultSettings =
    {
        min        : 0,
        max        : 100,
        angleOffset: 0,
        angleArc   : 360,
        className  : "default",
        value      : 0,
        turn       : function (currentDeg) {
        },
        change     : function (currentDeg) {
        }
    };
	
})(jQuery);
