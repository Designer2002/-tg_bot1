var tooltipHandler = function(){
	var timeout			= {};			// timer link
	var that			= this;
	var fadeOutDelay	= 5000;
	var delayedOccurrenceTimeOut;

	/**
	 * Show tooltip
	 * 
	 * @param	fieldId string	- field id which show tooltip
	 * @param	body string		- tooltip message
	 * @param	options			- object. Allowed options:
	 *  - title	string		- title of message
	 *  - close bool		- if true then tooltip with close button
	 *  - underElement bool - if true then tooltip locate under element
	 *  - timer int			- dissapear timeout (seconds)
	 *  - width mixed		- tooltip width. Allowed values:
	 *		- 'auto' - width text
	 *		- int	 - width in pixels
	 */
	this.show = function(fieldId, body, options)
	{
		options = $.extend({
			title				: '',
			close				: false,
			underElement		: false,
			timer				: 0,
			delayedOccurrence	: 0,
			width				: false
		}, options || {});

		if (0 < options.delayedOccurrence) {
			delayedOccurrenceTimeOut = setTimeout(function () {
				that._show(fieldId, body, options);
			}, options.delayedOccurrence);
		}
		else {
			that._show(fieldId, body, options);
		}
		
	}

	this._show = function(fieldId, body, options)
	{
		that.hide(true);

		// tooltip HTML
		var closeBt		= options.close ? "<a class=\"closeBt\" href=\"javascript:void(0)\" onclick=\"$(this).parents('.tooltipBox').remove();return false;\"><span class=\"cancelIco ico\">&nbsp;<\/span><\/a>" : '';
		var titleHtml	= options.title ? '<h2>'+options.title+'</h2>' : ''
		var tooltip		= template("<div class=\"tooltipBox\"><div class=\"tooltipArrow\">&nbsp;<\/div><div class=\"errorMsg\" id=\"controlTooltip\"><div class=\"bg-box\">{js_variable.titleHtml}{js_variable.closeBt}<div class=\"text\"><p>{js_variable.body}<\/p><\/div><\/div><\/div><\/div>", {
			'titleHtml'	: titleHtml,
			'closeBt'	: closeBt,
			'body'		: body
		});

		var elem		 = $('#'+fieldId);
		var offset		 = elem.offset();
		var pLeft		 = elem.css('padding-left');
		var pRight		 = elem.css('padding-right');
		var pTop		 = elem.css('padding-top');
		var pBottom		 = elem.css('padding-bottom');
		var padding		 = 0;
		var defaultWidth = 266;
		var maxWidth	 = 500;
		var tooltipWidth = 1;
		var top			 = 0;
		var left		 = 0;

		//add to DOM
		$('body').append(tooltip);

		//set width CSS params
		if (!options.width) {
			tooltipWidth = defaultWidth + 'px';
		}
		else if (options.width == 'auto') {
			tooltipWidth = $('#controlTooltip div.text').width() + 32;
		}
		else if (options.width > 0 && options.width < maxWidth) {
			tooltipWidth = options.width + 'px';
		}
		else {
			tooltipWidth = maxWidth + 'px';
		}

		//set position CSS params
		if (options.underElement) {
			padding	= Number(pTop.substr(0, pTop.length - 2)) + Number(pBottom.substr(0, pBottom.length - 2));
			left	= offset.left;
			top		= offset.top + elem.height() + padding+10;
			$('#controlTooltip').parent('div.tooltipBox')
				.css({top: top+'px', left: left+'px', width: tooltipWidth})
				.addClass('underElement');
		}
		else {
			padding	= Number(pLeft.substr(0, pLeft.length - 2)) + Number(pRight.substr(0, pRight.length - 2));
			left	= offset.left + elem.width() + padding + 20;
			top		= offset.top - 9;
			$('#controlTooltip').parent('div.tooltipBox').css({top: top+'px', left: left+'px', width: tooltipWidth});

			//check content outside
			var rLimit	= ($('div.content').offset().left + $('div.content').width()) - 30;
			var elemPos	= ($('.tooltipBox').offset().left) + ($('.tooltipBox').width());
			if (elemPos > rLimit) {
				var resultShift = $('.tooltipBox').width() + elem.width() + 40;
				$('.tooltipBox').css('margin-left','-'+resultShift+'px');

				if (!$('.tooltipBox').hasClass('tooltipOutside')) {
					$('.tooltipBox').addClass('tooltipOutside');
				}
			}
		}

		var closeBtMargin = $('#controlTooltip').width() - 32;
		$('#controlTooltip').find('a.closeBt').css({margin: '-8px 0 0 ' + closeBtMargin + 'px'});

		// set timer to hide
		if (options.timer) {
			timeout = setTimeout(function() {that.hide()}, parseInt(options.timer)*1000);
		}
		
		$('#controlTooltip').bind('mousedown.tooltip', function(event) {
			var $target = $(event.target);
			if ($target.is("a")) {
				return false;
			}
			that.hide(true);
			$('#controlTooltip').unbind('mousedown.tooltip');
		});
	}

	/**
	 * Hide tooltip
	 * 
	 * @param withoutDelay bool - if true then tooltip hide without delay
	 */
	this.hide = function(withoutDelay){
		clearTimeout(delayedOccurrenceTimeOut);
		var tooltip = $('#controlTooltip').parent('div.tooltipBox');
		if ($.browser.msie){
			tooltip.css('background','#ffffff');
		}
		if (withoutDelay) {
			tooltip.remove();
		}
		else {
			tooltip.fadeOut(fadeOutDelay, function(){
				tooltip.remove();
			});
		}
	};
};

var tooltip = new tooltipHandler();