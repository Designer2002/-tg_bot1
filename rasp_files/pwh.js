var PopupWindowHandler = function(){
	var containerId = 'popupContainer';
	var bgshadow	= "<div id=\"bgshadow\"><\/div>";
	var closeBtnId	= 'popupCloseBtn';
	var cancelBtnId	= 'popupCancelBtn';
	var escStr		= '#'+ containerId + ' input:text, #'+ containerId +  ' input:password, #'+containerId + ' textarea';
	var focusStr	= '#'+ containerId + ' input:text, #'+ containerId +  ' input:password, #'+containerId + ' textarea, #' +containerId + ' input:checkbox, #'  +containerId + ' input:radio, #' +containerId + ' select';
	var callType	= '';

	/**
	 * checks whether css selector was passed or not
	 * selector can not start with '<' character
	 */
	function isSelectorPassed(html) {
		return 'string' == typeof(html)
			&& 0 < html.length
			&& !(/^</.test(html))
			&& 0 < $(html).length;
	}

	/**
	 * checks whether url was passed
	 */
	function isUrlPassed(html) {
		return 'string' == typeof(html)
			&& 0 < html.length
			&& (/^https?:\/\//.test(html));
	}
	function isShortUrlPassed(html) {
		return 'string' == typeof(html)
			&& 0 < html.length
			&& (/^\//.test(html));
	}
	/**
	 * checks whether html code was passed
	 */
	function isHtmlPassed(html) {
		return 'string' == typeof(html)
			&& 0 < html.length;
	}

	var that = this;

	/**
	 * show popup window
	 * @param html mixed  (it can be: url, html content or css selector)
	 * @param options object. Allowed options:
	 *  - bool setFocus		- if true then set the focus to the first input in popup
	 *  - bool async		- if true then all requests are send asynchronous
	 *  - bool hideOnClick	- if true then hide popup on click on bgshadow
	 *  - function callback - some callback function to be executed
	 */
	this.show = function(html, options){
		// set default values for required options
		options = $.extend({
			setFocus		: true,
			async			: true,
			hideOnClick		: true,
			autoPosition	: true,
			flow			: true,
			ajaxData		: {},
			type			: 'GET'
		}, options || {});

		if (isUrlPassed(html)) {

			if (options.type=='video') {
				data='<div class="newPopup removeOnError" style="width:930px; display: block; position: absolute; z-index: 1200; top: 10px;"><div class="popupT"><div><div>&nbsp;</div></div></div><div class="popupBody" style="padding:0px 15px 0px 15px;"><a href="javascript:void(0)" class="close" id="popupCloseBtn"><label>Закрыть</label><img src="/img/spacer.gif" alt="" class="gdConfirmClose"></a><div class="clear"></div><div class="delimerHx" style="height: 30px;">&nbsp;</div><div class="popupCrop"><div class="cntPopup">'+
					'<video autoplay="autoplay" controls="controls" width="900"><source src="'+html+'"></video>' +
					'</div></div></div><div class="popupB"><div><div>&nbsp;</div></div></div></div>';
				that.show(data, options);
			}else {
				that.fullScreenLoaderShow(undefined, undefined, options);
				$.ajax({
					type: options.type,
					async: options.async,
					url: html,
					data: options.ajaxData,
					success: function (data) {
						if (undefined != data.redirect) {
							window.location = data.redirect;
							return;
						}
						that.fullScreenLoaderHide();
						if (undefined != data.error) {
							that.alert({'message': data.error.message});
							return;
						}
						that.show(data, options);
					}
				})
			};
			return;
		}else if (isShortUrlPassed(html)) {
			that.fullScreenLoaderShow(undefined, undefined, options);
			$.ajax({
				type	: options.type,
				async	: options.async,
				url		: html,
				data	: options.ajaxData,
				success	: function(data){
					if (undefined != data.redirect) {
						window.location = data.redirect;
						return;
					}
					that.fullScreenLoaderHide();
					if (undefined != data.error) {
						that.alert({'message' : data.error.message});
						return;
					}
					data = '<div class="newPopup removeOnError" style="width:930px; display: block; position: absolute; z-index: 1200; top: 10px;"><div class="popupT"><div><div>&nbsp;</div></div></div><div class="popupBody" style="padding:10px 15px 10px 15px;"><a href="javascript:void(0)" class="close" id="popupCloseBtn"><label>Закрыть</label><img src="/img/spacer.gif" alt="" class="gdConfirmClose"></a><div class="clear"></div><div class="delimerHx" style="height: 30px;">&nbsp;</div><div class="popupCrop"><div class="cntPopup">' +
						data +
						'</div></div></div><div class="popupB"><div><div>&nbsp;</div></div></div></div>';
					that.show(data, options);
				}
			});
			return;
		}
		else if (isSelectorPassed(html)) {
			html			= $(html)[0];
			that.callType	= 'selector';
		}
		else if (isHtmlPassed(html)) {
			that.callType	= 'html_code';
		}
		else {
			throw new Error('Parameter "html" must be url, valid selector or html code');
			return;
		}

		this.hide();
		if (!$('#popupContainer #bgshadow').length){
			$('#'+containerId).append(bgshadow);
		}
		$('#bgshadow').show();
		$('#'+containerId).append(html);

		var lastChildNum	= $('#'+containerId).children().length-1;
		var elem			= $($('#'+containerId).children().get(lastChildNum));
		elem.addClass(('selector' == that.callType) ? 'hideOnError' : 'removeOnError');
		setCss(elem);
		elem.show();

		// disable autoposition for mobile devices
		if (!isMobileDevice() && options.autoPosition && options.flow) {
			if (elem.height() <= $(window).height()) {
				$(window).resize(function(){
					setCssWithAutocompleterCheck(elem);
				});

				$(window).scroll(function(){
					setCssWithAutocompleterCheck(elem);
				});
			}
		}

		if (options.setFocus && $(focusStr).length) {
			try {
				$(focusStr)[0].focus();
			}
			catch(exc){
			}
		}

		eventButtons(containerId);
		// bind closing events
		$('#'+closeBtnId+', #'+cancelBtnId).bind('click', function(event){
			event.preventDefault();
			if ('function' == typeof options.closeBtnEvent) {								// some handler defined for closing popup
				options.closeBtnEvent(event);
			}
			else if (/^javascript:[\s]*void\(0\)/.test($('#'+closeBtnId).attr('href')) ){	// i.e. href == "javascript:void(0)"
				event.preventDefault();
				that.hide();
			}
			else {																			// tag 'a' has a link, so just redirect here
				event.preventDefault();
				window.location = $('#'+closeBtnId).attr('href');
			}
		});
		if (options.hideOnClick) {
			$('#bgshadow').bind('click', function(event){
				$('#'+closeBtnId).click();
			});
		}
		$(escStr).bind('keydown', function(event){
			if (27 == event.keyCode) {														// ESC button pressed
				$('#'+closeBtnId).click();
			}
		});
		$(window).bind('keydown', function(event){
			if (27 == event.keyCode) {														// ESC button pressed
				$('#'+closeBtnId).click();
			}
		});

		if (options.callback && 'function' == typeof options.callback){
			options.callback();
		}

		/*Fix problem z-index position for IE6*/
		if ("6" == $.browser.msie && $.browser.version.substr(0,1)){
			$('select').addClass('selectHidden');
		}

		initTabs();		/*Re init controls after popup is opened*/
		initControls();
		ieAddFileInit();
	};

	/**
	 * set css rules for popup window
	 * @param elem - element to be changed
	 */
	function setCss(elem)
	{
		$('.tooltipBox').remove();
		elem.removeClass('hidden');
		var heightElem	= elem.height();
		var widthElem	= elem.width();
		elem.css(
			{
				'display'	: 'block',
				'position'	: 'absolute',
				'z-index'	: '1200',
				'top'		: (heightElem > $(window).height()) ? ( $(window).scrollTop() + 10 + 'px') :  (($(window).height() - heightElem)/2 +  $(window).scrollTop() + 'px'),
				'left'		: (widthElem > $(window).width()) ? ( $(window).scrollLeft() + 10 + 'px') :  ((($(window).width() - widthElem)/2 )+ 'px')
			}
		);
	}

	/**
	 * Call function setCss() and set autocompleter below input text on invitation form when scrolling/resizing
	 * @param elem - element to be changed
	 */
	function setCssWithAutocompleterCheck(elem)
	{
		var oldTop	= parseFloat(elem.css('top'));
		var oldLeft	= parseFloat(elem.css('left'));
		setCss(elem);

		if ($('div.ac_results').length) {
			var offsetTop	= parseFloat(elem.css('top')) - oldTop;
			var offsetLeft	= parseFloat(elem.css('left')) - oldLeft;
			var acTop		= parseFloat($('div.ac_results').css('top')) + offsetTop;
			var acLeft		= parseFloat($('div.ac_results').css('left')) + offsetLeft;
			$('div.ac_results').css({
				'top'	: acTop + 'px',
				'left'	: acLeft + 'px'
			});
		}
	}

	/**
	 * hide popup window
	 *
	 * @param type - type of item that should be hidden. Allowed values:
	 *   'commonPopup'	- default value
	 *   'dialogPopup'
	 *   'fullScreenLoader'
	 *   'blockScreenLoader'
	 *   'filterLoader'
	 *   'all'
	 *  @param popupItemId int - popup id [optional]
	 *  @param callback function  - some callback function to be executed [optional]
	 */
	this.hide = function(type, popupItemId, callback){
		if ('undefined' == typeof(type)) {
			type = 'commonPopup';
		}

		var necessaryRedrawWindow = $('#bgshadow .bgshadow').length;

		switch (type) {
			case 'commonPopup':
				if ('selector' == that.callType) {
					$('#popupContainer').children().each(function(){$(this).hide();});
				}
				if ('html_code' == that.callType) {

					$('#popupContainer').html('')

					if ($.browser.msie) {
						if (0 < $('.userPanel').length) {
							$('.userPanel').after('<div id="popupContainer"></div>');
						}
						else if(0 < $('.adminPanel').length) {
							$('.adminPanel').before('<div id="popupContainer"></div>');
						}
					}
				}
				$(window).unbind('scroll');
				$(window).unbind('resize');

			break;

			case 'dialogPopup':
				$('#'+popupItemId+'Shadow').remove();

				// remove default alert
				if ('undefined' == typeof(popupItemId)) {
					popupItemId = alertId;
				}
				$('#'+popupItemId).remove();
			break;

			case 'fullScreenLoader':
				$('#bgshadow').remove();
				$('.loader').remove();
			break;

			case 'blockScreenLoader':
				if ($('.bgshadowajaxloader').length) {
					$('.bgshadowajaxloader').remove();
				}
				else {
					$('#bgshadow').remove();
				}
				$('.fsLoader').remove();
			break;

			case 'filterLoader':
				if ('undefined' == typeof(popupItemId)) {
					$('.bgshadowajaxloader').remove();
					$('.fsLoader').remove();
				}
				else {
					$('#fsLoader_'+popupItemId).remove();
					$('#bgshadow_'+popupItemId).remove();
				}
			break;

			case 'all':
				$('.removeOnError').remove();
				$('.hideOnError').hide();
				$('.hideOnError').removeClass('hideOnError');
				$('#bgshadow').remove();
				$('.bgshadowajaxloader').remove();
			break;
		}

		// redraw window for opera
		if ($.browser.opera && necessaryRedrawWindow) {
			redrawWindow();
		}

		if ('function' == typeof(callback)) {
			callback();
		}
	};

	function hideDialog(id, callback) {
		that.hide('dialogPopup', id, callback);
	}

	this.fullScreenLoaderHide = function(){
		this.hide('fullScreenLoader');
	};

	this.blockScreenLoaderHide = function(showShadow){
		this.hide('blockScreenLoader');
	};

	this.filterLoaderHide = function(elementId){
		this.hide('filterLoader', elementId);
	};

	this.fullScreenLoaderShow = function(header, body, options){
		options		= options || {};
		header		= header || 'Подождите...';
		body		= body || '';
		if (!options.notCloseOtherLoader) {
			this.fullScreenLoaderHide();
		}
		var loader	= template("<div id=\"bgshadow\" ><\/div><div class=\"loader fsLoader newPopup removeOnError\"><div class=\"popupT\"><div><div>&nbsp;<\/div><\/div><\/div><div class=\"popupBody\"><br\/><img src=\"https:\/\/lms.synergy.ru\/static\/ru\/img\/loader2.gif\" width=\"49\" height=\"50\" alt=\"Loader\" \/><br\/><br\/><div class=\"popupCrop\"><h1>{js_variable.header}<\/h1><p class=\"bigText\">{js_variable.body}<\/p><br\/><\/div><\/div><div class=\"popupB\"><div><div>&nbsp;<\/div><\/div><\/div><\/div>", {'header': header, 'body': body});

		$('body').prepend(loader);
		$('#bgshadow').show();
		if (body || header) {
			$('.fsLoader').show();
		}
		setCss($('.fsLoader').filter(":first"));
	};

	this.blockScreenLoaderShow = function(header, body, elementId, notPopup, showShadow, options){
		options = $.extend({
			showLoaderImg		: true,
			showLoaderTitle		: true,
			removeScreenLoader	: true,
			zIndex				: false
		}, options || {});

		header		= header || 'Подождите...';
		body		= body || '';
		showShadow	= showShadow || false;

		if (options.removeScreenLoader) {
			this.blockScreenLoaderHide(showShadow);
		}

		var loader = '';

		if (notPopup) {
			var loaderImg	= options.showLoaderImg ? '<img alt="Loader" src="'+staticUrl+'img/loader.gif">' : '';
			var loaderTitle	= options.showLoaderTitle ? '<span class="ajaxLoaderTitle">'+header+'</span>' : '';
			var loaderId	= 'ajaxloader' + $('.bgshadowajaxloader').length;

			loader = template("<div class=\"removeOnError\" id=\"{js_variable.loaderId}\"><div class=\"bgshadowajaxloader\" style=\"z-index:999;\"><\/div><div class=\"fsLoader\">{js_variable.loaderImg}{js_variable.loaderTitle}<\/div><\/div>", {
				'loaderId'		: loaderId,
				'loaderImg'		: loaderImg,
				'loaderTitle'	: loaderTitle
			});
		}
		else {
			loader = template("<div id=\"bgshadow\"><\/div><div class=\"loader fsLoader newPopup removeOnError\"><div class=\"popupT\"><div><div>&nbsp;<\/div><\/div><\/div><div class=\"popupBody\"><br\/><img src=\"https:\/\/lms.synergy.ru\/static\/ru\/img\/loader2.gif\" width=\"49\" height=\"50\" alt=\"Loader\" \/><br\/><br\/><div class=\"popupCrop\"><h1>{js_variable.header}<\/h1><p class=\"bigText\">{js_variable.body}<\/p><br\/><\/div><\/div><div class=\"popupB\"><div><div>&nbsp;<\/div><\/div><\/div><\/div>", {'header': header, 'body': body});
		}

		$('body').prepend(loader);
		$('.fsLoader').filter(":first").addClass('blockScreenLoader');

		if (body || header) {
			$('.fsLoader').show();
		}
		var elem		= $('#'+elementId);
		if (elem.offset()){
			var position	= elem.offset();
			var width		= elem.innerWidth()+2;
			var height		= elem.innerHeight()+2;

			if (notPopup) {
				$('#'+loaderId).find('.bgshadowajaxloader:first').prop('id','shadowAjaxId_'+elementId);
				$('#'+loaderId).find('.bgshadowajaxloader').show();
				$('#'+loaderId).find('.bgshadowajaxloader').width(width).height(height).css({top:(position.top-2)+'px',left:(position.left-2)+'px'}).css('position','absolute');
				$('#'+loaderId).find('.fsLoader').css('margin',(position.top+(height/2)-25)+'px 0 0 '+(position.left+(width/2)-50)+'px');

				//centering loader on browser window resize
				$(window).resize(function() {
					$('#'+loaderId).find('.fsLoader').css('margin',(elem.offset().top+((elem.innerHeight()+2)/2)-25)+'px 0 0 '+(elem.offset().left+((elem.innerWidth()+2)/2)-50)+'px');
				});

				if (options.zIndex) {
					$('#'+'shadowAjaxId_'+elementId).css('z-index', options.zIndex);
				}
				return loaderId;
			}
			else {
				$('#bgshadow').show();
				$('#bgshadow').width(width).height(height).css('margin',position.top+'px 0 0 '+position.left+'px').css('position','absolute');
				$('.fsLoader').css('margin',(position.top+(height/2)-100)+'px 0 0 '+(position.left+150)+'px');
				return null;
			}
		}
	};

	this.filterLoaderShow = function(header,elementId,hideLoader){
		// not hide if on page there is not one loader
		if ('undefined' == typeof(hideLoader)) {
			this.filterLoaderHide();
		}
		var loader = template("<div class=\"bgshadowajaxloader\"><\/div><div class=\"loader hidden fsLoader removeOnError\"><img src=\"https:\/\/lms.synergy.ru\/static\/ru\/img\/loader.gif\" alt=\"Loader\" \/><span class=\"ajaxLoaderTitle\">{js_variable.header}<\/span><\/div>", {'header': header});
		$('body').append(loader);
		$('.bgshadowajaxloader:last').prop('id','bgshadow_'+elementId).show();
		$('.fsLoader:last').prop('id','fsLoader_'+elementId).show();
		var elem		= $('#'+elementId);
		var position	= elem.offset();
		var width		= elem.width();
		var height		= elem.height();
		$('#bgshadow_'+elementId).width(width).height(height).css({top:position.top+'px',left:position.left+'px'}).css('position','absolute');
		$('#fsLoader_'+elementId).css({top:(position.top+(height/2)-40)+'px',left:(position.left)+'px',width:width+'px'});
	};

	var alertId = 'alertBlock';
	/**
	 * substitute for standard alert dialog
	 * @param options <object> object; allowable fields are:
	 *  - titleDialog <string> dialog title
	 *  - message <string> dialog message
	 *  - callback <function> some callback function to be executed after hiding the dialog box
	 *  - titleOk <string> title for 'ok' button
	 * @example pwh.alert();
	 * @example pwh.alert(
		{
			titleDialog:	'notification dialog',
			message:		'Some message',
			callback:		function(){console.log('alert callback message')},
			titleOk:		'OK!'
			flow:			true
		});
	 */

	this.alert = function(options){
		var localAlertId = options.alertId || alertId;
		hideDialog(localAlertId);
		options = $.extend({
			titleDialog	: '',
			message		: '',
			callback	: function(){},
			titleOk		: 'OK',
			flow		: true
		}, options || {});

		var title		= (0 == options.titleDialog.length) ? '' : '<h1>' + options.titleDialog + '</h1>';
		var alertHtml	= template("<div id=\"{js_variable.alertId}Shadow\" class=\"bgshadow\"><\/div><div class=\"loader newPopup removeOnError\" id=\"{js_variable.alertId}\"><div class=\"popupT\"><div><div>&nbsp;<\/div><\/div><\/div><div class=\"popupBody\"><a id=\"popupCloseBtn\" class=\"close\" href=\"javascript:void(0)\"><label>\u0417\u0430\u043a\u0440\u044b\u0442\u044c<\/label><img alt=\"\" src=\"https:\/\/lms.synergy.ru\/static\/ru\/img\/spacer.gif\" class=\"gdConfirmClose\" \/><\/a><div class=\"clear\"><\/div><br\/><br\/><div class=\"popupCrop\">{js_variable.title}<p class=\"bigText\">{js_variable.message}<\/p><br \/><br \/><br \/><div style=\"width:65px; margin: 0 auto;\">{js_variable.btnOk}<\/div><\/div><\/div><div class=\"popupB\"><div><div>&nbsp;<\/div><\/div><\/div><\/div>", {
			'alertId'	: localAlertId,
			'title'		: title,
			'message'	: options.message,
			'btnOk'		: getBtnHtml({id:"btnOk", title:options.titleOk, className:'bt1 stretching'})
		});
		$('body').prepend(alertHtml);
		eventButtons(localAlertId);
		setCss($('#'+localAlertId));
		$(window).resize(function(){
			setCss($('#'+localAlertId));
		});
		if (options.flow) {
			$(window).scroll(function(){
				setCss($('#'+localAlertId));
			});
		}
		$('#'+localAlertId+'Shadow').show();

		$('#'+localAlertId).show();

		// bind closing events
		$('#alertBlockShadow, #btnOk, #'+closeBtnId).bind('click', function(event){
			event.preventDefault();
			hideDialog(localAlertId, options.callback);
		});
		$('#btnOk').bind('keydown', function(event){
			if (27 == event.keyCode) {														// ESC button pressed
				hideDialog(localAlertId, options.callback);
			}
		});

		$('#btnOk').focus();
	};

	var confirmId = 'confirmBlock';
	/**
	 * substitute for standard confirm dialog
	 * @param options <object> object; allowable fields are:
	 *  - titleDialog <string> dialog title
	 *  - message <string> dialog message
	 *  - titleDialog <string> dialog title
	 *  - callbackYes <function> some callback function to be executed in Yes case
	 *  - callbackNo <function> some callback function to be executed in No case
	 *  - titleYes <string> title for 'yes' button
	 *  - titleNo <string> title for 'no' button
	 * @example pwh.confirm();
	 * @example pwh.confirm(
		{
			titleDialog:	'confirmation dialog',
			message:		'Are you sure?',
			callbackYes:	function(){
				pwh.alert({'titleDialog':'alert','message':'YES clicked','callback':function(){console.log('alert callback message');},'titleOk':'OK!'});
			},
			callbackNo:	function(){
				pwh.alert({'titleDialog':'alert','message':'NO clicked','callback':function(){console.log('alert callback message');},'titleOk':'OK!'})
			},
			titleYes:		'YES',
			titleNo:		'NO'
		});
	 */

	this.confirm = function(options){
		hideDialog(confirmId);

		options = $.extend({
			titleDialog		: '',
			message			: '',
			callbackYes		: function(){},
			callbackNo		: function(){},
			callbackClose	: null,
			titleYes		: 'Да',
			titleNo			: 'Нет',
			buttonYesHref	: 'javascript:void(0)',
			buttonNoHref	: 'javascript:void(0)'
		}, options || {});

		var confirmHtml = template("<div id='{js_variable.confirmId}Shadow' class=\"bgshadow\"><\/div><div class=\"loader newPopup removeOnError\" id=\"{js_variable.confirmId}\"><div class=\"popupT\"><div><div>&nbsp;<\/div><\/div><\/div><div class=\"popupBody\"><a id=\"popupCloseBtn\" class=\"close\" href=\"javascript:void(0)\"><label>\u0417\u0430\u043a\u0440\u044b\u0442\u044c<\/label><img alt=\"\" src=\"https:\/\/lms.synergy.ru\/static\/ru\/img\/spacer.gif\" class=\"gdConfirmClose\" \/><\/a><div class=\"clear\"><\/div><div class=\"popupCrop\"><br\/><h1>{js_variable.title}<\/h1><p class=\"bigText\">{js_variable.message}<\/p><br \/><br \/><br \/><div style=\"margin: 0 auto;\" class=\"cPos\">{js_variable.btnYes}&nbsp;{js_variable.btnNo}<\/div><div class=\"clear\"><\/div><\/div><\/div><div class=\"popupB\"><div><div>&nbsp;<\/div><\/div><\/div><\/div>", {
			'confirmId'	: confirmId,
			'title'		: options.titleDialog,
			'message'	: options.message,
			'btnYes'	: getBtnHtml({id:"btnYes", title:options.titleYes, className:'bt1 stretching', href:options.buttonYesHref}),
			'btnNo'		: getBtnHtml({id:"btnNo", title:options.titleNo, className:'bt1_Type2 stretching', href:options.buttonNoHref})
		});

		$('body').prepend(confirmHtml);
		eventButtons(confirmId);
		setCss($('#'+confirmId));
		$(window).resize(function(){
			setCss($('#'+confirmId));
		});
		$(window).scroll(function(){
			setCss($('#'+confirmId));
		});
		$('#'+confirmId+'Shadow').show();
		$('#'+confirmId).show();

		// bind closing events
		$('#'+closeBtnId).bind('click', function(event){
			event.preventDefault();
			if (options.callbackClose && 'function' == typeof(options.callbackClose)) {
				hideDialog(confirmId, options.callbackClose);
			}
			else {
				hideDialog(confirmId, options.callbackNo);
			}
		});
		if ('javascript:void(0)' == $('#btnYes').attr('href')) {
			$('#btnYes').bind('click', function(event){
				event.preventDefault();
				hideDialog(confirmId, options.callbackYes);
			});
		}
		if ('javascript:void(0)' == $('#btnNo').attr('href')) {
			$('#btnNo').bind('click', function(event){
				event.preventDefault();
				hideDialog(confirmId, options.callbackNo);
			});
		}

		$('#btnYes').bind('keydown', function(event){
			if (27 == event.keyCode) {														// ESC button pressed
				hideDialog(confirmId, options.callbackNo);
			}
		});
		$('#btnNo').bind('keydown', function(event){
			if (27 == event.keyCode) {														// ESC button pressed
				hideDialog(confirmId, options.callbackNo);
			}
		});

		$('#btnNo').focus();
	};


	/**
	 * Выводит диалоговое "окно" с запросом текста от пользователя.
	 * Текст передается в callback кнопки "да"
	 * @param options
	 */
	this.prompt = function(options){
		hideDialog(confirmId); //Оставляем тот же ID

		options = $.extend({
			titleDialog		: '',
			message			: '',
			prompt			: '',
			callbackYes		: function(){},
			callbackNo		: function(){},
			callbackClose	: null,
			titleYes		: 'Да',
			titleNo			: 'Нет',
			buttonYesHref	: 'javascript:void(0)',
			buttonNoHref	: 'javascript:void(0)',
			varname			: 'prompt',
			required		: true,
			requiredErrorMessage: 'Введите значение'
		}, options || {});

		var promptHtml = template("<div id='{js_variable.confirmId}Shadow' class=\"bgshadow\"><\/div>\r<div class=\"loader newPopup removeOnError\" id=\"{js_variable.confirmId}\">\r<div class=\"popupT\">\r<div><div>&nbsp;<\/div><\/div>\r<\/div>\r<div class=\"popupBody\">\r<a id=\"popupCloseBtn\" class=\"close\" href=\"javascript:void(0)\">\r<label>\u0417\u0430\u043a\u0440\u044b\u0442\u044c<\/label><img alt=\"\" src=\"https:\/\/lms.synergy.ru\/static\/ru\/img\/spacer.gif\" class=\"gdConfirmClose\" \/>\r<\/a>\r<div class=\"clear\"><\/div>\r<div class=\"popupCrop\" style=\"text-align: left;\">\r<br\/>\r<h1>{js_variable.title}<\/h1>\r<p class=\"bigText\" style=\"text-align: left;\">{js_variable.message}<\/p>\r<input type=\"text\" name =\"{js_variable.varname}\" value=\"{js_variable.prompt}\" style=\"width:80%\" \/>\r<div class=\"clear\"><\/div>\r<div style=\"margin: 24px auto;\" class=\"cPos\">{js_variable.btnYes}&nbsp;{js_variable.btnNo}<\/div>\r<div class=\"clear\"><\/div>\r<\/div>\r<\/div>\r<div class=\"popupB\"><div><div>&nbsp;<\/div><\/div><\/div>\r<\/div>", {
			'confirmId'	: confirmId,
			'title'		: options.titleDialog,
			'message'	: options.message,
			'prompt'	: options.prompt || '',
			'varname'	: options.varname || 'prompt',
			'btnYes'	: getBtnHtml({id:"btnYes", title:options.titleYes, className:'bt1 stretching', href:options.buttonYesHref}),
			'btnNo'		: getBtnHtml({id:"btnNo", title:options.titleNo, className:'bt1_Type2 stretching', href:options.buttonNoHref})
		});

		$('body').prepend(promptHtml);
		eventButtons(confirmId);
		setCss($('#'+confirmId));
		$(window).resize(function(){
			setCss($('#'+confirmId));
		});
		$(window).scroll(function(){
			setCss($('#'+confirmId));
		});
		$('#'+confirmId+'Shadow').show();
		$('#'+confirmId).show();

		// bind closing events
		$('#'+closeBtnId).bind('click', function(event){
			event.preventDefault();
			if (options.callbackClose && 'function' == typeof(options.callbackClose)) {
				hideDialog(confirmId, options.callbackClose);
			}
			else {
				hideDialog(confirmId, options.callbackNo);
			}
		});
		if ('javascript:void(0)' == $('#btnYes').attr('href')) {
			$('#btnYes').bind('click', function(event){
				event.preventDefault();
				let $input = $('input[name="'+options.varname+'"]');
				let text = $input.val();
				if (options.required && !text) {
					$input.fadeTo(100, 0.1, function() { $(this).fadeTo(500, 1.0); });
					if(options.requiredErrorMessage) {
						alert(options.requiredErrorMessage);
					}
				} else
					hideDialog(confirmId, function () {
						options.callbackYes.call(this, text)
					});
			});
		}
		if ('javascript:void(0)' == $('#btnNo').attr('href')) {
			$('#btnNo').bind('click', function(event){
				event.preventDefault();
				hideDialog(confirmId, options.callbackNo);
			});
		}

		$('#btnYes').bind('keydown', function(event){
			if (27 == event.keyCode) {														// ESC button pressed
				hideDialog(confirmId, options.callbackNo);
			}
		});
		$('#btnNo').bind('keydown', function(event){
			if (27 == event.keyCode) {														// ESC button pressed
				hideDialog(confirmId, options.callbackNo);
			}
		});

		$('input[name="'+options.prompt+'"]').focus();
	};



	/**
	 * get html code for buttons
	 */
	function getBtnHtml(options) {
		options = $.extend({
			id			: '',
			className	: 'bt1',
			title		: '',
			href		: 'javascript:void(0)'
		}, options || {});

		return template("<a href=\"{js_variable.href}\" id=\"{js_variable.id}\" class=\"css3pie bt {js_variable.className}\"><span>{js_variable.title}<\/span><\/a>", {
			'id'		: options.id,
			'className'	: options.className,
			'title'		: options.title,
			'href'		: options.href
		});
	}

	this.btnHtml = function(id, title, className){
		return getBtnHtml({id:id, title:title, className:className});
	}

	this.setPopupCss = function(elem){
		return setCss(elem);
	}

	/**
	 * clear page from popup windows
	 */
	this.clearPageFromPopup = function(){
		this.hide('all');
	}
};

var pwh = new PopupWindowHandler();
