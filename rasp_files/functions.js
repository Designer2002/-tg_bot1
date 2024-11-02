// fixPNG(); http://www.tigir.com/js/fixpng.js (author Tigirlas Igor)
function fixPNG(element) {
	if (/MSIE (5\.5|6).+Win/.test(navigator.userAgent))	{
		var src;
		if ('IMG' == element.tagName) {
			if (/\.png$/.test(element.src)) {
				src = element.src;
				element.src = staticUrl+"img/blank.gif";
			}
		}
		else {
			src = element.currentStyle.backgroundImage.match(/url\("(.+\.png)"\)/i);
			if (src) {
				src = src[1];
				element.runtimeStyle.backgroundImage="none";
			}
		}
		if (src) element.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "',sizingMethod='scale')";
	}
}

Object.size = function(obj) {
	var size = 0, key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

//Course filter checked
function categoryClick(elem)
{
	var timer;
	clearFilter();
	var offset = elem.offset();
	var topMargin = 7;
	if ($.browser.msie && ("6" == $.browser.version.substr(0,1) || "7" == $.browser.version.substr(0,1))) {
		topMargin = 6;
	}


	elem.before('<a href="javascript:void(0)" class="itemFilterUnchecked">&nbsp;</a>');
	$('.itemFilterUnchecked').live('click',function(){clearFilter()});

	elem.parents('table.topicCol').addClass('itemFilterChecked');
	elem.parents('table.topicCol').prev().addClass('itemFilterCheckedLine');
	elem.parents('table.topicCol').next().addClass('itemFilterCheckedLine');
}

function itemFilterChecked()
{
	$('.itemFilterCheckedBox').find('table.topicCol a').bind('click',function(){
		categoryClick($(this));
	});
}
function clearFilter()
{
	$('table.topicCol').removeClass('itemFilterChecked');
	$('.itemFilterCheckedLine').removeClass('itemFilterCheckedLine');
	$('.itemFilterUnchecked').remove();
}

function writerRegLink(link)
{
	// to editor from author
	if ($("div.writerRegLinkBox").hasClass('editor')) {
		pwh.confirm({
			message: 'Став редактором, Вы сможете создавать, публиковать и редактировать учебные курсы и программы, размещать на портале необходимые учебные материалы для студентов, самостоятельно определять стоимость своих курсов, а так же помогать с публикацией другим авторам. Ваш текущий профиль (сообщения, блоги, друзья, подписка на курсы и др.) останется неизменным. Продолжить?',
			callbackYes: function(){
				upgrateUser('editor');
			}
		});
	}
	// to author/editor from user
	else if ('1' == userLogged) {
		if ('1' == '0') {
			upgrateUser('author', link);
		}
		else {
			pwh.show(site_url('user/ajax/popup_upgrate_user'), {'callback': function(){
				$('.beeditor, .beauthor').live('click',function(){
					tabs = $('.upgrateuser');
					var n = $(this).prop('id').replace('navTab_', '');
						tabs.find('div.tabs-box div#tab_'+n).addClass('tabs-item-open');

				});
				$('#ok').bind('click',function(){
					if ($('.beauthor').hasClass('tabs-selected')) {
						pwh.hide();
						if (link) {
							upgrateUser('author', link);
						}
						else {
							upgrateUser('author');
						}
					}
					if ($('.beeditor').hasClass('tabs-selected')) {
						pwh.hide();
						upgrateUser('editor');
					}
				});
				$('#cancel').bind('click',function(){
					pwh.hide();
				});
			}});
		}
	}
	// for unlogged user

	// comment for US-system - now redirect to registration for unlogged users
//		if (userLogged != '1') {
//			$.ajax({
//				type: 'POST',
//				url: 'courses/ajax/change_user_role/author',
//				data: {'currentUrl': window.location.href},
//				success: function(data, textStatus) {serverResponseProcessing(data, textStatus);}
//			});
//			return;
//		}
		if ('1' != userLogged) {
			window.location = site_url('registration');
		}
}

function upgrateUser(userType, link)
{
	pwh.show(site_url('ajax/page/'+userType+'/with_cancel'), {'callback': function(){
		$('#acceptTos').bind('click', function(){
			$.ajax({
				type: 'POST',
				url: 'courses/ajax/change_user_role/'+userType,
				data: {'link': link},
				success: function(data, textStatus) {serverResponseProcessing(data, textStatus);}
			});
		});
		$('#cancelTos').bind('click', function(){
			pwh.hide('commonPopup');
		});
	}});
}


var startWidthEdge  = 0;

$(document).ready(function() {

	// server pinger (needed to keep php session)
	var serverPingerInterval = parseInt('1440');
	if (serverPingerInterval) {
		setInterval(serverPinger, serverPingerInterval*1000);
	}

	function serverPinger()
	{
		$.ajax({
			type	: 'POST',
			async	: true,
			url		: site_url("auxiliary/pinger"),
			success	: function (data, textStatus, jqXHR) {
				if(data.blacklist == true){
					document.location.href = "/?blacklist";
				}
			},
			error	: function (jqXHR, textStatus, errorThrown) {
				// do nothing
			}
		});
	}

	if ('undefined' != typeof(php)										// front-end only
		&& 'undefined' != typeof(php.draftAccess)						// if defined save drafts
		&& php.draftAccess
	) {
		// autosave draft
		var autoSaveInterval = parseInt('5');
		if (autoSaveInterval) {
			setInterval(autoSave, autoSaveInterval*1000);
		}
	}

	//event:hover for link with icon
	$('.iconBox').live('mouseover',function(){$(this).addClass('hovered');});
	$('.iconBox').live('mouseout',function(){$(this).removeClass('hovered');});

	//set search category (top menu)
	setSearchCategory();
	function setSearchCategory()
	{
		$('.setSearchCategory').hover(
			function(){
				$(this).removeClass('transparent');
			},
			function(){
				if (!$(this).find('.selectorBody').hasClass('open')) {
					$(this).addClass('transparent');
				}
			}
		)
	}

	startWidthEdge  = ($(window).width()-$('.wrap').width())/2;

	//resize windows
	$(window).resize(function() {
		fixDisabledLayer();
		setSizeScormPlayer();

		// tooltip not defined at API
		try {
			tooltip.hide();
		}
		catch(e) {
		}
	});

	//bootStrap
	$('.selector').dropdown();
	userPanelModify();
	decorCount();
	eventButtons();
	decorListItem();
	initTabs();
	initAddFile();

	function userPanelModify()
	{
		var w = $('.userPanel .action .userAccount').width();
		$('.userPanel .action').width(w+115);
		if (0 == $('.userPanel .addCourse').length) {
			$('.userPanel .logined').css('width','auto');
		}
	}

	if (0 < $('.itemFilterCheckedBox').length) {
		itemFilterChecked();
	}
	if (0 < $('div.sectionMenu').length) {
		topMenu();
	}
	if (0 < $('div.switch').length) {
		switchFix();
	}

	//animated writer registration link
	if ($('div.writerRegLinkBox').length>0) {
		$("div.writerRegLinkBox").bind('click', function(){
			writerRegLink();
		});
	}

	//Change user status
	changeStatusClick();

	//Fade block
	function viewFadeBox(index) {
		$('#'+index).fadeIn('slow');
	}

	function topMenu() {
		$('div.sectionMenu').each(function() {
			var first = $(this).find('div.left:first');
			var last = $(this).find('div.right:last');
			first.addClass('first');
			last.addClass('last');
		});
	};

	//Function Switch fix for IE
    function switchFix() {
		$('div.switch').each(function(){
			var first = $(this).find('div.left:first');
			var last = $(this).find('div.right:last');
			first.addClass('first');
			last.addClass('last');
		});
    };

	//hover itemAvatar
	if (0 < $('div.itemAvatar').length) {
		hoverItemAvatar();
	}
	function hoverItemAvatar()
	{
		$('div.itemAvatar').live('mouseover',	function(){
				$(this).find('.itemAvatarImg').addClass('hoverItemAvatar');
			}
		);
		$('div.itemAvatar').live('mouseout',function(){
				$(this).find('.itemAvatarImg').removeClass('hoverItemAvatar');
			}
		);
	}

	//catalogCoursesSlider
	if (0 < $('div.itemFilterCheckedBox').length) {
		catalogCoursesSlider();
	}

	// default error callback function
	$.ajaxSetup({
		error: function(XMLHttpRequest, textStatus, errorThrown){
			defaultXhrErrorHandler(XMLHttpRequest, textStatus, errorThrown);
		}
	});

	// prevent onbeforeunload notice for IE
	if ($.browser.msie) {
		windowOnbeforeunloadHandler = null;
		$(document).ajaxStart(function(){
			if (!windowOnbeforeunloadHandler) {
				windowOnbeforeunloadHandler = window.onbeforeunload;
			}
			window.onbeforeunload = null;
		});

		$(document).ajaxStop(function(){
			window.onbeforeunload = windowOnbeforeunloadHandler;
		});
	}

	if (0 < $('.filter').length) {
		$('.sortLink').bind('click', function(event) {
			filter = $.evalJSON($(this).parents('.dataTable').nextAll().find('*').andSelf().filter('.filter').html());
			if (filter == null)
				filter = $.evalJSON($('#filter').html());
			var sortValue = $(this).prop('id').replace(/sort_/,'');
			applySort(sortValue, $(this).hasClass('forGetRequest'));
		});
		$('.filterSelect').bind('change', function(event) {
			if ($(this).hasClass('forGetRequest')) {
				modifyUrlForGetRequest($(this).attr('name'), $(this).attr('value'));
			}
			else {
				modifyUrl($('input',this).attr('name'), $('input',this).attr('value'));
			}
			window.location = thisUrl;
		});
		$('.filterDate').bind('change', function(event) {
			var date = $(this).attr('value');
			if ($(this).hasClass('forGetRequest')) {
				modifyUrlForGetRequest($(this).attr('name'), date, true);
			}
			else {
				modifyUrl($(this).attr('name'), date, true);
			}
			window.location = thisUrl;
		});
	}

/*	// Submit footer search query
	$("#searchTypeSelectorFooter .selectorBody li").click(function() {
		$('#searchTypeSelectorFooter li span').removeClass('s-selectMarkerActive').addClass('s-selectMarker');
		$(this).children('span').addClass('s-selectMarkerActive');
		var searchType = $(this).children('a').prop('id').replace('search_type_', '');
		$('#ft').val(searchType);
		$('#searchFormFooter').attr('action', site_url('search/'));
		if (0 !== validator.getAllFormData('searchFormFooter').fq.length) {
			$('#search').click();
		}
		else {
			$('#fq').focus();
		}
	});
*/
	// Submit home page search query
	$("#searchTypeSelectorMain .selectorBody li").click(function() {
		$('#searchTypeSelectorMain li span').removeClass('s-selectMarkerActive').addClass('s-selectMarker');
		$(this).children('span').addClass('s-selectMarkerActive');
		var searchType = $(this).children('a').prop('id').replace('search_main_type_', '');
		$('#mt').val(searchType);
		var searchTitle = $('#searchTitle').val();
		if (0 < searchTitle.length && 'Поиск по курсам' != searchTitle) {
			$('#searchAll').click();
		}
		else {
			$('#searchTitle').focus();
		}
	});

	// view fadeBox if exists
	if ('undefined' != typeof(php)) {
		if (!undef(php)) {
			if ('' !== val(php, 'fadeBoxTitle')) {
				fadeBoxShow(php.fadeBoxType, php.fadeBoxTitle, php.fadeBoxPermanent, php.fadeBoxBody);
			}
			else if (!undef(php.passwordNotityFadebox)) {
				fadeBoxShow(php.passwordNotityFadebox.fadeBoxType,
					php.passwordNotityFadebox.fadeBoxTitle,
					php.passwordNotityFadebox.fadeBoxPermanent,
					php.passwordNotityFadebox.fadeBoxBody
				);
			}
		}
	}

	//slide for info Panel
	$('.infoPanel .infoPanelArrow').click(function(){
		if (!$('.infoPanel').hasClass('animate')) {
			$('.infoPanel .infoPanelButton').animate({left:'-=545'},300);
			$('.infoPanel').addClass('animate');
		}
		else {
			$('.infoPanel .infoPanelButton').animate({left:'+=545'},300);
			$('.infoPanel').removeClass('animate');
		}
	});

	//cousesBox click tab
	$('.cousesBox .cousesBoxTabs a:not(.disabledTab)').click(function(){
		$('.cousesBox .cousesBoxTabs a').removeClass('open');
		$(this).addClass('open');
	});

	if (0 < $('#aboutMC2').length) {
		$('#aboutMC2').mediaPlayer(
			static_url('img/video/aboutmc2.mp4', false),
			'video',
			{
				'image':	static_url('img/video/aboutmc2.jpg', false),
				'width':	'345',
				'height':	'215'
			}
		);
	}

	if (0 < $('#mainPageVideoBox').length) {
		$('#mainPageVideoBox').mediaPlayer(
			static_url('img/video/megatour.mp4', false),
			'video',
			{
				'image':		static_url('img/video/megatour_ru.jpg', false),
				'width':		'535',
				'height':		'410',
				'autostart':	true
			}
		);
	}

	if (0 < $('.breadcrumbs').length) {
	    if (0 < $('.writerRegLinkBox').length) {
			$('.breadcrumbsContainer').width(920 - $('.writerRegLinkBox').innerWidth());
	    }
	    var parentW = $('.breadcrumbs').parent('.breadcrumbsContainer').width();
	    var tempW = 0;
	    var resW = 0;
	    $('.breadcrumbs span span').each(function(){
			tempW = $(this).width();
			resW += tempW;
			if (resW > parentW) {
				resW -= tempW;
				$('.breadcrumbs').width(resW+15);
				return false;
			}
	    });
	}

	/*$('.liveChatBt').click(function(e){
		e.preventDefault();
		pwh.alert({message: 'Просим прощения за причинённые неудобства. Мы работаем над данной проблемой. Пока мы ищем решение, пожалуйста, воспользуйтесь другими средствами, чтобы связаться с нами. <a href=&#quot;http://www.megacampus.us/contact-us&#quot;>Контакты</a>'});
	});*/


	if ($('div.sectionMenu').hasClass('submenuWith')) {
		$('.sectionMenu .sectionMenuInner > ul > li')
			.mouseover(function() {
				if (0 != $(this).find('ul').length) {
					$(this).addClass('hoverItem');
					$('.sectionMenu .sub-menu').addClass('hidden');
					$(this).find('.sub-menu').removeClass('hidden').delay(2000);
				}
			}).mouseout(function() {
				$(this).removeClass('hoverItem');
				$('.sectionMenu .sub-menu').addClass('hidden').delay(2000);
			})
	}
	if ($('.topMenu').hasClass('submenuWith')) {
		$('.topMenu li.topLevel').hover (
			function() {
				if (0 != $(this).find('ul').length) {
					$(this).addClass('hoverItem');
					$('.topMenu .sub-menu').addClass('hidden');
					$(this).find('.sub-menu').removeClass('hidden').delay(2000);
				}
			},
			function() {
				$(this).removeClass('hoverItem');
				$('.topMenu .sub-menu').delay(2000).addClass('hidden');
			});
	}
	if (!isCookiesEnabled()) {
		$('div.userPanelReg a.bt3').bind('click', function(e) {
			e.preventDefault();
			pwh.alert({message:'Для регистрации на сайте необходимо включить cookies'});
		});
	}
	$('li.disabled a').live('click', function(e) {
		e.preventDefault();
	});

	if ($('#specialty').length) {
		$('.specialty .selector div.selectorBody .entityTypeSelect').click(function(){
			var newUserData = $(this).prop('id').split('_');
			$.ajax({
				async: true,
				type: 'GET',
				url: site_url('user/ajax/change_specialty/'+newUserData[0]+'/'+newUserData[1]),
				dataType:'json',
				success: function(data){
					if ('ok' == data.result) {
						window.location.reload();
					}
				}
			});
		});
	}
	lineBlock();

	$('#introjsHelper').live('click', function(e) {
		e.preventDefault();
		introJs().start();
	});

	if ('undefined' != typeof(php) && php.oldDesktopUnavailable) {
		fadeBoxShow('attention', 'По техническим причинам не удалось получить доступ к Вашему старому личному кабинету. Обратитесь в службу технической поддержки или попробуйте позже.');
	}

	$('.synergyUserUrl a').live('click', function(e) {
		e.preventDefault();
		pwh.fullScreenLoaderShow();
		setTimeout(function() {window.location = $('.synergyUserUrl a').attr('rel');}, 500);
	});

	// Set in session selected by author/tutor learningMode for course entities pages
	$('#learningModeFilter').change(function(e) {
		e.preventDefault();
		if ('undefined' != typeof(php) && php.courseVersionId) {
			var selectedLearningModeId = $('#learningModeFilter').val();
			$.ajax({
				type	: 'GET',
				url		: site_url('learning/ajax/setInSessionLearningMode/'+php.courseVersionId+'/'+selectedLearningModeId),
				success	: function(data, textStatus) {
					window.location.reload();
				}
			});
		}
	});

	// Show clear-all button for multi autocomplete controls
	$('.multi-ac-values').each(function(e) {
		if($(this).html() != '') {
			$(this).parents('.multi-ac').find('.multi-ac-clear-all').show();
		}
	});
        
    $('.item.-contact').tooltip({html:true, placement:'bottom'});

});

function lineBlock() {
	if (1 == $('.lineBlock > div').length) {
		$('.lineBlock').addClass('oneCell');
	}

	$.each($('.lineBlock'), function() {
		var block = $(this);
		var div = block.children();
		block.addClass('clearfix');
		if ((0 < div.length) && div.last().hasClass('rPos')) {
			div.last().addClass('last-child');
		}
	});
}

/**
 * Bind click event to file input.
 *
 * @access	public
 * @return	void
 */
function initAddFile()
{
	if (!ieAddFileInit()) {
		$('.addFiles .button').live('click', function(e) {
			e.preventDefault();
			$(this).parents('.addFiles').find('input[type="file"]').click();
		});
	}
}

/**
 * Bind click event to file input for IE.
 *
 * @access	public
 * @return	bool - true if browser is IE
 */
function ieAddFileInit()
{
	var isIE = $.browser.msie;
	if (isIE) {
		setTimeout(function() {
			$('.addFiles .bt').each(function() {
				var target	= $(this).addClass('ieStyle');
				var parent	= target.closest('.addFiles');
				var obj		= parent.find('.file').addClass('ieStyle');
				obj.clone(true).appendTo(target);
				obj.remove();
			});
			$('#chooseFileBtn').each(function() {
				var target	= $(this).addClass('ieStyle');
				var obj		= $('#fileInputContainer').addClass('ieStyle');
				obj.clone(true).appendTo(target);
				obj.remove();
			});
		}, 0);
	}
	return isIE;
}

//TABS
function initTabs() {
	$('div.tabs').each(function(n){
		var tabsId = ($(this).prop('id')) ? $(this).prop('id') : 'tabsId_'+n;
		$(this).prop('id', tabsId);

		$('div.tabs .tabs-nav li').liveClickEvent(function(event){
			event.preventDefault();
			$(this).selectTab(tabsId);
		});

		$("#"+tabsId).find('.tabs-nav li').each(function(z) {
			if (!$(this).prop('id')) {
				$(this).prop('id',tabsId+'_navTab_'+z);
			}
		});

		$("#"+tabsId).find('div.tabs-box div.tabs-item').each(function(z) {
			if (!$(this).prop('id')){
				$(this).prop('id',tabsId+'_tab_'+z);
			}
		});

		//if width tabs > width content
		var nav			= $("#"+tabsId).find('.tabs-nav');
		var ln			= 5;
		var navWidth	= 0;
		$.each(nav.find('li'), function() {
			ln += $(this).outerWidth(true);
		});
		if (nav.is(':visible')) {
			navWidth = nav.width();
		}
		else {
			var navClone = nav.clone().css({
				visibility: 'hidden'
			}).appendTo('body');
			navWidth = navClone.width();
			navClone.remove();
		}

		if ((navWidth < ln) && (navWidth != (ln-5))){
			$("#"+tabsId).addClass('roller');
			$("#"+tabsId)
				.find('.tabs-nav')
				.wrap('<div class="tabs-nav-wrap" />');
			var wrap = $("#"+tabsId).find('.tabs-nav-wrap');
			var stepShift = 40;
			nav.width(ln);
			wrap
				.before('<span class="prev-tab disable">&nbsp;</span>')
				.after('<span class="next-tab">&nbsp;</span>');

			if (nav) {
				var shift = 0;
			// var shift    = Number(nav.css('margin-left').replace('px',''));
			} else {
				var shift = 0;
			}
			var maxShift = (-1)*(ln - wrap.width());
			nav.mousewheel(function(event, delta) {
				shift    = Number(nav.css('margin-left').replace('px',''));
				if (0 > delta) {
					if( maxShift > (shift-stepShift) ) {
						nav.css('margin-left', maxShift+'px');
						$("#"+tabsId).find('.next-tab').addClass('disable');
					}
					else {
						nav.css({marginLeft : '-='+stepShift});
					}
					$("#"+tabsId).find('.prev-tab').removeClass('disable');
				}
				else {
					if( 0 < (shift+20) ) {
						nav.css('margin-left', '0px');
						$("#"+tabsId).find('.prev-tab').addClass('disable');
					}
					else {
						nav.css({marginLeft : '+='+stepShift});
					}
					$("#"+tabsId).find('.next-tab').removeClass('disable');
				}
				event.preventDefault();
			});


			$('.tabs .prev-tab, .tabs .next-tab').live('click', function() {
				shift    = Number(nav.css('margin-left').replace('px',''));
				if( $(this).hasClass('next-tab') ) {
					if( maxShift > (shift-stepShift) ) {
						nav.css('margin-left', maxShift+'px');
						$("#"+tabsId).find('.next-tab').addClass('disable');
					}
					else {
						nav.css({marginLeft : '-='+stepShift});
					}
					$("#"+tabsId).find('.prev-tab').removeClass('disable');
				}
				else {
					if( 0 < (shift+20) ) {
						nav.css('margin-left', '0px');
						$("#"+tabsId).find('.prev-tab').addClass('disable');
					}
					else {
						nav.css({marginLeft : '+='+stepShift});
					}
					$("#"+tabsId).find('.next-tab').removeClass('disable');
				}
			});
		}

	});

	$.fn.selectTab = function(tabsId)
	{
		var liTarget	= $(this);
		var parentCont	= liTarget.closest('.tabs');

		if (0 != liTarget.length && 0 != parentCont.length) {
			parentCont.find('.tabs-nav li').removeClass('tabs-selected')
			liTarget.addClass('tabs-selected');

			if (!parentCont.hasClass('notSwitching')) {
				parentCont.find('div.tabs-box div.tabs-item-open').removeClass('tabs-item-open');
				parentCont.find('div.tabs-box div#'+liTarget.prop('id').replace('navTab','tab')).addClass('tabs-item-open');
			}
		}
	}
}


//Set parametr for learning popup
function setSizeScormPlayer()
{
	var obj = $('.courseEducationWindow');
	var winWidth = $(window).width();
	var winHeight = $(window).height();
	var popupBodyHeight = winHeight-70;
	obj.width(winWidth-30).css({top:'15px',left:'15px'});
	obj.find('.popupBody').height(popupBodyHeight);
	obj.find('#learningFrame').height(popupBodyHeight-120);

	// set parametr for assasments player easyXDM iframes at API
	if ($('#dataFrame iframe[id*="easyXDM_"]').length) {
		obj	= $('#educationDiv');
		obj.width(winWidth-30).css({top:'15px',left:'15px'});
		obj.find('#dataFrame iframe[id*="easyXDM_"]').height(popupBodyHeight-80);
	}

	// set parametr for assasments player package iframes at API
	if ($('#packageFrame').length && 'function' == typeof(resizePackageFrame)) {
		resizePackageFrame();
	}
}


	// default error callback handler
	function defaultXhrErrorHandler(XMLHttpRequest, textStatus, errorThrown) {
		switch(XMLHttpRequest.status) {
			// Interrupted ajax request is not error
			case 0:
			break;

			// Authorization Required
			case 401:
				ajaxReLogin(1);
			break;

			case 502:
			break;

			default:
				pwh.clearPageFromPopup();
				if (XMLHttpRequest.responseText) {
					var options = {
						'setFocus'	: true,
						'async'		: true
					};
					pwh.show(XMLHttpRequest.responseText, options);
				}
				else {
					throw new Error('An unknown error occurred during the Ajax request in jQuery');
				}
			break;
		}
	}

	var popupBackup = null;
	/**
	 * Ajax user login and resubmit form data
	 */
	function ajaxReLogin(autoReSubmitForm) {
		if (0 < $('#popupContainer').size()) {
			popupBackup = $('#popupContainer').children().not('#bgshadow').clone(true);
		}
		pwh.clearPageFromPopup();
		pwh.show(site_url('user/ajax/get_user_login_popup/' + parseInt(autoReSubmitForm)), {'async':false});
		validator.addSubmitEventForConcreteForm('ajaxPopupLogin', validator.validationRules.ajaxPopupLogin);
	}

	// Resubmit Post data after success authorization
	function ajaxReLoginCallback(response) {
		pwh.clearPageFromPopup();
		if (null != popupBackup && 1 == $(popupBackup).size()) {
			pwh.show(popupBackup);
			$('img.hideOnError').hide();
			if ('undefined' != response.autoReSubmitForm && 1 == response.autoReSubmitForm) {
				var formId = popupBackup.find('form').prop('id');
				var trigger = validator.validationRules[formId].submit.trigger;
				$('#' + trigger).click();
				popupBackup = null;
				return;
			}
		}
		else {
			fadeBoxShow('ok', 'Пожалуйста, повторите Ваше действие еще раз.');
		}
	}

	function catalogCoursesSlider()
	{
		$('div.itemFilterCheckedBox').each(function(){
			var obj = $(this);
			var countPage = Math.ceil(obj.find('div.topicCol').length/4);
			if (2 > countPage) {
				return;
			}
			obj.append('<input type="hidden" class="countPage" value="'+countPage+'"/>');
			obj.append('<input type="hidden" class="setPage" value="0"/>');
			//add paginator
			var page = '';
			// 60 - points correct displays on screen
			if (countPage < Number('60')) {
				page = '<li class="paginActive pageIndex"><a href="javascript:void(0)"><img height="6" width="6" alt="" src="'+staticUrl+'img/spacer.gif"/></a></li>';
				for (i = 1; i < parseInt($(this).find('input.countPage').val()); i++ ) {
					page = page + '<li class="pageIndex"><a href="javascript:void(0)"><img height="6" width="6" alt="" src="'+staticUrl+'img/spacer.gif"/></a></li>';
				}
			}
			var paginator = '<ul><li  class="prev '+(countPage >= Number('60') ? 'lFloat' : '')+'"><a href="javascript:void(0)">&nbsp;</a></li>'+page+
				'<li  class="next '+(countPage >= Number('60') ? 'rFloat' : '')+'"><a href="javascript:void(0)">&nbsp;</a></li></ul><div class="clear"></div>';
			obj.find('div.paginatorBox div.paginatorPoint').append(paginator);
			if (countPage >= Number('60')) {
				obj.find('div.paginatorBox div.paginatorPoint').addClass('displayBlock');
			}
			litePaginatorArrow(obj);
			//click next page
			obj.find('div.paginatorBox div.paginatorPoint li.next a').bind('click', function(){
				if (parseInt(obj.find('input.setPage').val()) <  parseInt(obj.find('input.countPage').val())-1) {
					obj.find('input.setPage').val(parseInt(obj.find('input.setPage').val())+1);
					fadingPage(obj,'right');
					litePaginatorArrow(obj);
				}
			});
			//click prev page
			obj.find('div.paginatorBox div.paginatorPoint li.prev a').bind('click', function(){
				if (0 < parseInt(obj.find('input.setPage').val())) {
					obj.find('input.setPage').val(parseInt(obj.find('input.setPage').val())-1);
					fadingPage(obj,'left');
					litePaginatorArrow(obj);
				}
			});
			//click page marker
			obj.find('div.paginatorBox div.paginatorPoint li.pageIndex').bind('click',function(){
				var oldPage = obj.find('input.setPage').val();
				obj.find('input.setPage').val($(this).index()-1);
				fadingPage(obj,'point',oldPage);
				litePaginatorArrow(obj);
			});

			obj.find('span.gradient').bind('click',function(){
				$(this).parents('td').find('a').click();
			});
		});

		//liting paginator arrow
		function litePaginatorArrow(obj)
		{
			var countPage = parseInt(obj.find('.countPage').val());
			var setPage = parseInt(obj.find('.setPage').val());
			obj.find('div.paginatorPoint li').removeClass('active');
			if (0 == setPage && 4 < obj.find('div.topicCol').length) {
				obj.find('div.paginatorPoint li.next').addClass('active');
			}
			if (0 < setPage && setPage < (countPage-1)) {
				obj.find('div.paginatorPoint li.prev').addClass('active');
				obj.find('div.paginatorPoint li.next').addClass('active');
			}
			if (1 < countPage && setPage == (countPage-1)) {
				obj.find('div.paginatorPoint li.prev').addClass('active');
			}
		}

		function fadingPage(obj, type, oldPage) {
			var widthPage = obj.width();
			var setPage = parseInt(obj.find('input.setPage').val());
			var displacement  = 0;
			displacement =  widthPage+20;
			if ('point' == type) {
				type = (setPage > oldPage) ? 'right' : 'left';
				displacement = displacement * Math.abs(setPage - oldPage);
			}
			displacement = ('left' == type) ? "+="+displacement+"px" : "-="+displacement+"px";

			obj.find('div.topicColBox').animate({marginLeft: displacement},200, function(){
				obj.find('div.paginatorPoint li').removeClass('paginActive').eq(setPage+1).addClass('paginActive');
			});
		}
	}

//decoration for count
function decorListItem()
{
	if (0 < $('div.listingItem').length) {
		tab_l = '<div class="iePNG infoLinkLeft">&nbsp;</div><div class="infoLinkCenter">';
		tab_r = '</div><div class="iePNG infoLinkRight">&nbsp;</div>';
		$('div.listingItem .itemAvatar div.infoBox div.info').each(function(){
			$(this).html(tab_l+$(this).html()+tab_r);
		});
	}
}

//Emulation :active event at Button
function eventButtons()
{
	$('.bt').mousedown(function(){
		$(this).addClass('hoveredBt');
	});
	$('.bt').mouseup(function(){
		$(this).removeClass('hoveredBt');
	});
	$('.bt').mouseout(function(){
		$('.bt').mouseup();
	});
}

function disableBtn(elementId, addClickHandler, parentElementCss)
{
	var elem = $('#'+elementId);
	if (0 == elem.length) {
		return;
	}

	var parentElement  = elem.parent();
	if (undefined != parentElementCss) {
		parentElement.css('position', parentElementCss);
	}
	else if (('absolute' != parentElement.css('position')) && ('relative' != parentElement.css('position'))) {
		parentElement.css('position', 'relative');
	}

	// bind click handler if needed
	if (addClickHandler) {
		$('#'+elementId).bind('click', function(event){
			event.preventDefault();
			event.stopPropagation();
			return;
		});
	}

	elem.addClass('disableBt');
	if (0 == elem.width()) {
		// Very strange solution, need correctness check
		//setTimeout(function(parentElementCss) {disableBtn(elementId, false, parentElementCss)}, 100);
	}
	else {
		var position = elem.position();
		if ($('#disableBtLayer_'+elementId).length == 0 ) {
			var width = elem.innerWidth();
			elem.after('<div id="disableBtLayer_'+elementId+'" class="disableBtLayer"><img src="'+staticUrl+'img/spacer.gif" width="'+width+'" height="'+elem.innerHeight ()+'" alt="" /></div>');
			$('#disableBtLayer_'+elementId).css({top:position.top+'px',left:position.left,width:width});
		}
	}
}

function enableBtn(elementId, removeClickHandler)
{
	var elem = $('#'+elementId);
	elem.removeClass('disableBt');
	$('#disableBtLayer_'+elementId).remove();

	// unbind click handler if needed
	if (removeClickHandler) {
		$('#'+elementId).unbind('click');
	}
}


function fixDisabledLayer()
{
	$('.bt').each(function(n){
		if ($(this).hasClass('disableBt')) {
			var position = $(this).offset();
			var width = $(this).width()+9;
			$('#disableBtLayer_'+n).css({top:position.top+'px',left:position.left,width:width});
		}
	});

	/*setTimeout(function()
	{
	    var widthEdge = ((($(window).width()-$('.wrap').width())/2) > 0 ) ?  ($(window).width()-$('.wrap').width())/2 : 0;
	    $('.bgshadowajaxloader').each(function(){
		var obj = $(this);
		var leftShift = widthEdge;
		var leftOffset = obj.offset().left;
		if (startWidthEdge < widthEdge) {
		    leftShift = leftOffset+(widthEdge-startWidthEdge);
		}
		else {
		    leftShift = leftOffset-(startWidthEdge-widthEdge);
		}

		obj.css({left:leftShift+'px'})
		var wElem  = obj.width();
		var fsLoader = obj.next();
		if (fsLoader.hasClass('.fsLoader')){
		    fsLoader.css({marginLeft:Number(leftShift-50+wElem/2)+'px'})
		}

	    })
	    startWidthEdge = widthEdge;
	},10);*/

	setTimeout(function()
	{
        $('.bgshadowajaxloader').each(function(){
		var obj = $(this);
		if (obj.offset() && $('#'+parentId).offset()) {
			var leftShift = obj.offset().left;
			var parentId = obj.prop('id').replace('shadowAjaxId_','');
			leftShift = $('#'+parentId).offset().left;
			obj.css({left:leftShift+'px'});
			var wElem  = obj.width();
			var fsLoader = obj.next();
			if (fsLoader.hasClass('.fsLoader')) {
				fsLoader.css({marginLeft:Number(leftShift-50+wElem/2)+'px'});
			}
		}

	    });

	},10);
}

function hideBtn(elementId)
{
	var elem = $('#'+elementId);
	elem.addClass('hiddenBt');
}

function showBtn(elementId)
{
	var elem = $('#'+elementId);
	elem.removeClass('hidden');
	elem.removeClass('hiddenBt');
}

function ajaxBtnProcessStart(item, file)
{
	if ( 0 < item.length ) {
		item.closest('#popupLogin').find('.js-update-data').removeClass('hidden');

		var obj = $(item).eq(0);
		var title = (obj.attr('data-title') !== undefined) ? obj.attr('data-title') : 'Подождите...';
		obj.addClass('inProgress');
		obj.attr('data-text', obj.text());
		obj.attr("disabled","disabled", obj.text());
		obj.width(obj.width());
		file = undefined == file ? 'blank.gif' : file;
		obj.html('<img src="'+staticUrl+'img/'+file+'" alt="" class="ajaxProcess" /> ' + title);
		return obj;
	}
	return false;
}

function ajaxBtnProcessEnd(item)
{
	if ( 0 < item.length ) {
		item.closest('#popupLogin').find('.js-update-data').addClass('hidden');

		var obj = $(item).eq(0);
		var title = (obj.attr('data-text') !== undefined) ? obj.attr('data-text') : 'Подождите...';
		obj.removeClass('inProgress');
		obj.find('.ajaxProcess').remove();
		obj.html('<i class="icon icon-login"><i></i></i> ' + title);
		obj.removeAttr('data-text').removeAttr('disabled');
		obj.width(obj.width());
		return true;
	}
	return false;
}

/**
 function ajaxBtnProcessEnd(item) {
	if ( 0 < item.length ) {
		var obj = $(item).eq(0);
		obj.removeAttr('data-text')
		return true;
	}
	return false;
}
 */
//Funtions  COUNT
 function decorCount() {
//	$("div.count").each(function(){
//		if (!$(this.firstChild).hasClass('count_first')) {
//			$(this).html('<span class="count_first">&nbsp;</span><span class="count_center">'+$(this).html()+'</span><span class="count_end">&nbsp;</span>');
//		}
//	});
}

/**
 * Show Ajax Loader function
 *
 * disable all controls on page :TODO:
 *
 * @param loaderId
 */
function showLoader(loaderId)
{
	$('#'+loaderId).addClass('hideOnError');
	$('#'+loaderId).show();
}

/**
 * Hide Ajax Loader function
 *
 * enable all controls on page :TODO:
 *
 * @param loaderId
 */
function hideLoader(loaderId)
{
	$('#'+loaderId).removeClass('hideOnError');
	$('#'+loaderId).hide();
}

fadeboxTimeoutId = null;
/**
 * insert fadeBox div into DOM model
 * @param string type. Allowed values:
 *  - ok
 *  - error
 *  - attention
 * @param string title
 * @param bool permanent [optional]
 * @param string body [optional]
 * @param object options [optional]. Allowed options:
 *  - object data
 *  - object callbacks:
 *			- onHide(data)
 * @return object
 */
function fadeBoxShow(type, title, permanent, body, options)
{
	options = $.extend({
		data		: {},
		callbacks	: {						// callback functions
			onHide	: function(data){}
		}
	}, options || {});


	$("div.fadeBox").remove();

	removePreviousFadeBoxHandler();

	var fadeBoxClass = (typeof(type) != 'undefined') ? type + ' css3pie' : 'ok css3pie';
	body			 = (typeof(body) != 'undefined') ? '<p>'+body+'</p>' : body = '';

	var fadeBox = template("<div class=\"fadeBox instantMessage {js_variable.fadeBoxClass}\"><h3 class=\"{js_variable.fadeBoxClass} uppercase\">{js_variable.title}<\/h3>{js_variable.body}<\/div>", {
		'fadeBoxClass': fadeBoxClass,
		'title': title,
		'body': body
	});

	$('body').prepend(fadeBox);
	var heightFB = $("div.fadeBox").height()+35;
	$("div.fadeBox").css('margin-top','-'+heightFB+'px');
	$("div.fadeBox").animate({top:'+='+heightFB}, 500);

	if (!permanent) {
		// delete fade box message
		fadeBoxHide(options);
	}
	else {
		$("div.fadeBox").live('click', function() {
			options.callbacks.onHide(options.data);
			$("div.fadeBox").animate({top:'-='+heightFB}, 500,function(){$(this).remove();});
		});
	}
}


/**
 * Delete fade box
 * @param object options [optional]. Allowed options:
 *  - object data
 *  - object callbacks:
 *			- onHide(data)
 */
function fadeBoxHide(options)
{
	options = $.extend({
		callbacks:	{
			onHide: function() {}
		},
		data : {}
	}, options || {});

	removePreviousFadeBoxHandler();
	var heightFB = $("div.fadeBox").height()+35;
	$("div.fadeBox").live('click', function() {
		options.callbacks.onHide(options.data);
		$("div.fadeBox").animate({top:'-='+heightFB}, 500,function(){$(this).remove();});
	});

	// delete fade box message
	fadeboxTimeoutId = setTimeout(
		function()
		{
			options.callbacks.onHide(options.data);
			$("div.fadeBox").animate({top:'-='+heightFB}, 500,function(){$(this).remove();});
		},
		Number('10')*1000
	);
}

/**
 * remove previous fadeBoxHide handler
 */
function removePreviousFadeBoxHandler()
{
	if (fadeboxTimeoutId) {
		clearTimeout(fadeboxTimeoutId);
		fadeboxTimeoutId = null;
	}
}

/**
 * add focus and blur events to fields (it needed if you want show the word "password"
 * in password field)
 * @param array fields. Format:
 *  [
 *      [text_input_id_1, password_input_id_1],
 *      [text_input_id_2, password_input_id_2],
 *      ...
 *  ]
 */
function switchPasswordControl(fields)
{
	if (!$('#'+fields[0][0]).parents().hasClass('formFieldArea')) {
		for (var i = 0; i < fields.length; i++) {
			$('#' + fields[i][1]).focus(function (event) {
				$(this).addClass('hidden');
				var p = $(this).prev('input');
				p.removeClass('hidden');
				p.focus();
			});
			$('#' + fields[i][0]).blur(function (event) {
				if (0 == $(this).attr('value').length) {
					$(this).addClass('hidden');
					var pd = $(this).next('input');
					pd.removeClass('hidden');
				}
			});
		}
	}
	else {
		for (var i = 0; i < fields.length; i++) {
			$('#' + fields[i][1]).focus(function (event) {
				$(this).parents('.formFieldArea').addClass('formFieldHidden');
				var p = $(this).parents('.formFieldArea').prev('.formFieldArea');
				p.removeClass('formFieldHidden');
				p.find('input').focus();
			});
			$('#' + fields[i][0]).blur(function (event) {
				if (0 == $(this).attr('value').length) {
					$(this).parents('.formFieldArea').addClass('formFieldHidden');
					var pd = $(this).parents('.formFieldArea').next('.formFieldArea');
					pd.removeClass('formFieldHidden');
				}
			});
		}
	}
}

// Paging, sorting, filtering functions + AJAX analogs
var thisUrl	= window.location.href;
var filter	= new Object;

function resetPaging()
{
	var pagingTemplate	= ('undefined' != typeof(php) && php.pagingTemplate ? php.pagingTemplate : ['page']);
	for (var i = 0; i < pagingTemplate.length; i++) {
		var re	= new RegExp(pagingTemplate[i] + '[\/=][0-9]+');
		// for post request
		if (-1 != thisUrl.indexOf(pagingTemplate[i] + '/')) {
			thisUrl = thisUrl.replace(re, pagingTemplate[i] + '/1');
		}
		// for get request
		if (-1 != thisUrl.indexOf(pagingTemplate[i] + '=')) {
			thisUrl = thisUrl.replace(re, pagingTemplate[i] + '=1');
		}
	}
}

function modifyUrl(name, val, useEncodeComponent)
{
	resetPaging();
	val = (useEncodeComponent) ? encodeURIComponent(val) : escape(val);
	var re = new RegExp('/'+name+'/[а-яА-Яa-zA-Z0-9%_\.]+');
	if ('' == val) {
		thisUrl = thisUrl.replace(re, '');
        if (thisUrl.substr(thisUrl.length-1,1)!='/') {
			thisUrl += '/';
		}
	}
	else {
		thisUrl = thisUrl.replace(re, '/'+name+'/'+val);
		if (-1 == thisUrl.indexOf(name+'/')) {
	        if ('/' == thisUrl.substr(thisUrl.length-1,1)) {
				thisUrl += name+'/' + val;
			}
			else {
				thisUrl += '/'+name+'/' + val;
			}
		}
	}
}

/**
 * add new variable in current url
 */
function modifyUrlForGetRequest(name, val, useEncodeComponent)
{
	resetPaging();
	val = (useEncodeComponent) ? encodeURIComponent(val) : escape(val);
	var urlParts		= thisUrl.split('?');
	var urlVariables	= {};
	if (urlParts[1]) {
		urlVariables = parseUrlVariables(urlParts[1]);
	}
	urlVariables[name] = val;
	var tmpArr = [];
	for (var key in urlVariables) {
		tmpArr.push(key+'='+urlVariables[key].toString());
	}
	thisUrl = urlParts[0]+'?'+tmpArr.join('&');
}

/**
 * Parses the string into variables
 */
function parseUrlVariables(url)
{
	var glue1 = '=';
	var glue2 = '&';

	var array2 = url.split(glue2);
	var array3 = {};
	for (var x=0; x<array2.length; x++) {
		var tmp = array2[x].split(glue1);
		array3[tmp[0]] = tmp[1];
	}

	return array3;
}

function applySort(field, isGetRequest)
{
	var orderType = 1;
	if (undefined != filter.order) {
		var matchPos = (filter.order).search(field);
		if (-1 != matchPos && filter.order == field+'_1') {
			orderType = 0;
		}
	}
	if (isGetRequest) {
		modifyUrlForGetRequest('order', field+'_'+orderType);
	}
	else {
		modifyUrl('order', field+'_'+orderType);
	}
	if (undefined != filter.anchor) {
		var re = new RegExp('#' + filter.anchor);
		thisUrl = thisUrl.replace(re, '');
		thisUrl += '#' + filter.anchor;
	}
	window.location = thisUrl;
}

function submitAjaxFilter(header, body, elementId, formId)
{
	if (elementId == 'undefined')
	{
		pwh.fullScreenLoaderShow(header, body);
	}
	else {
		pwh.filterLoaderShow(header,elementId,true);
	}
	$('#'+formId).ajaxFormSubmit({success: ajaxFilterCallback});
}

function sortLinkClick(formId, changeOrder)
{
	var header		= 'Загружаются курсы';
	var filterForm	= '#coursesFilterForm input[name=featured]';
	if ('meetingsFilterForm' == formId) {
		header		= 'Загружаются вебинары';
		filterForm	= '#meetingsFilterForm input[name=featured]';
	}
	$('.ajaxSortLink').live('click', function(event){
		sortValue = $(this).prop('id').replace(/sort_/,'');
		var orderType = 1;
		if (changeOrder) {
			var matchPos = ($('#'+formId+' input[name=order]').val()).search(sortValue);
			if (-1 != matchPos && $('#'+formId+' input[name=order]').val() == sortValue+'_1') {
				orderType = 0;
			}
		}
		$('#'+formId+' input[name=order]').attr('value', sortValue+'_'+orderType);
		$('#'+formId+' input[name=page]').attr('value', '1');
		$(filterForm).attr('value', '');
		if (updateCategories) {
			updateAuditoryCategories();
			updateCategories = false;
		}
		submitAjaxFilter(header,'','listingResults',formId);
	});
	$('.ajaxFilterSelect').live('change', function(event){
		$('#'+formId+' input[name='+$(this).attr('name')+']').val($(this).attr('value'));
		$('#'+formId+' input[name=page]').attr('value', '1');
		submitAjaxFilter(header,'','listingResults',formId);
	});
	$('.pagingItem').live('click', function(event){
		$('#'+formId+' input[name=page]').attr('value', $(this).prop('rel'));
		submitAjaxFilter(header,'','listingResults',formId);
	});
}

/**
 * replaces url by link
 * @param string str
 * @return string
 */
function replaceUrlByLink(str)
{
	var reg = /(((ftp|http(s)?):\/\/)|(www\.))(.*)/;
	var matches  = str.match(reg);

	if (matches == null) {
		return 'http://'+str;
	}
	else if (typeof(matches[5]) != 'undefined' && matches[5]=='www.') {
		return 'http://'+matches[5]+matches[6];
	}
	return str;
}

/**
 * Converts a number to money format : '1 299,00' or '1,299.0'
 */
function moneyFormat(price)
{
	price += '';
	if ('' != price) {
		price = priceToFloatFormat(price);
		if (!isNaN(Number(price))) {
			var decimalMark = ',';
			var thousandsSeparator = ' ';
			price = Number(price).toFixed(2);
			price += '';
			var splitStr = price.split('.');
			var splitLeft = splitStr[0];
			var splitRight = decimalMark + splitStr[1];
			var regx = /(\d+)(\d{3})/;
			while (regx.test(splitLeft)) {
				splitLeft = splitLeft.replace(regx, '$1' + thousandsSeparator + '$2');
			}
			price = splitLeft + splitRight;
		}
	}
	return price;
}

/**
 * Converts a money to number format : '1299.00'
 */

function priceToFloatFormat(price) {
	price += '';
	if ('' != price) {
		var decimalMark = ',';
		var thousandsSeparator = ' ';
		var regexDecimalMark = new RegExp('\\' + decimalMark, 'g');
		var regexThousandsSeparator = new RegExp('\\' + thousandsSeparator, 'g');
		price = price.replace(/\s/g,'').replace(regexThousandsSeparator, '').replace(regexDecimalMark, ".");
	}
	else {
		price = '0.00';
	}
	return price;
}

/**
 * updates status in user panel
 */

function html_entity_decode(str)
{
	return $('<textarea>').html(str + '').text();
}

function updateUserStatus(data)
{
	// hide changeStatus form
	$('.changeStatus a.decline').click();

	if (null != data) {
		$('td.myStatus div.right').html(data.userStatus).ready(function(){
			changeStatusClick();
		});

		// Change status in user profile.
		$('div.profilePhotoView div.imageBottomBlock').html(data.userStatusProfile);
	}

}

/**
 * updates status counter in form for it change in user panel
 */
function updateStatusCounter()
{
	var statusCounter = $('#statusTitle').val().length;
	$('#charCounter').html(statusCounter);
	if (statusCounter > parseInt('140')) {
		$('#charCounter').addClass('red');
	}
	else {
		$('#charCounter').removeClass('red');
	}

}


function changeStatusClick()
{
	$('a#changeStatus').click(function(){
		userSaveStatus = false;
		$.ajax({
			type: 'POST',
			url: site_url('user/change_status'),
			success: function(data){
				if ('' != data) {
					$('td.myStatus div.right').after(data);
					updateStatusCounter();
					$('div.changeStatus').show();
					$('textarea#statusTitle').focus();
					$('.changeStatus').attr('title', 'Shift + Enter');
					$('a.decline').attr('title', 'Escape');
					// adds event for close form change user status
					$('.changeStatus a.decline').click(function(){
						$('div.changeStatus').hide();
						$('div.changeStatus').remove();
					});
					// adds shortcut for save status and close status form
					$('.changeStatus').keypress(function(event){
						switch(event.keyCode) {
							case 27:
								$('.changeStatus a.decline').click();
							break;
							case 13:
								if (event.shiftKey) {
									$('#saveStatus').click();
									return false;
								}
							break;
							default:
							break;
						}
					});
					validator.addSubmitEventForConcreteForm('changeUserStatus');

					$('#statusTitle').bind('keyup change keypress', function() {
						updateStatusCounter();
					});
				}
			}
		});
	});
}

/**
 * Convert special characters to HTML entities
 */
function htmlspecialchars(string, quote_style, charset, double_encode)
{
    var optTemp = 0, i = 0, noquotes= false;
    if ('undefined' === typeof quote_style || null === quote_style) {
		quote_style = 2;
    }
    string = string.toString();
    if (false !== double_encode) { // Put this first to avoid double-encoding
        string = string.replace(/&/g, '&amp;');
	}
    string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    var OPTS = {
        'ENT_NOQUOTES': 0,        'ENT_HTML_QUOTE_SINGLE' : 1,
        'ENT_HTML_QUOTE_DOUBLE' : 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE' : 4};
    if (0 === quote_style) {
        noquotes = true;
    }
    if ('number' !== typeof quote_style) { // Allow for a single string or an array of string flags        quote_style = [].concat(quote_style);
        for (i=0; i < quote_style.length; i++) {
            // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
            if (0 === OPTS[quote_style[i]]) {
                noquotes = true;
			}
            else if (OPTS[quote_style[i]]) {
                optTemp = optTemp | OPTS[quote_style[i]];
            }
        }
        quote_style = optTemp;
    }
    if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
        string = string.replace(/'/g, '&#039;');
    }
    if (!noquotes) {
        string = string.replace(/"/g, '&quot;');
    }

    return string;
}

/**
 * Declines string according number
 * @param str - comma separated list with different word declensions ('секунда', 'секунды', 'секунд')
 * @param number
 * @param languageId - 0|1
 * @return string - string in valid declension
 * @example declensionByNumber('секунда,секунды,секунд', 1, 1) returns 'секунда'
 * @example declensionByNumber('секунда,секунды,секунд', 3, 1) returns 'секунды'
 * @example declensionByNumber('секунда,секунды,секунд', 5, 1) returns 'секунд'
 * @example declensionByNumber('секунду,секунды,секунд', 21, 1) returns 'секунду'
 */
function declensionByNumber(str, number, languageId)
{
	var result = '';
	var declensions;
	var number;
	if (1 == languageId) {		// ru
		declensions = str.split(',');
		if (3 == declensions.length) {
			number = Math.abs(number) % 100;
			if (number >= 5 && number <= 20) {
				result = declensions[2];
			}
			else {
				number = number % 10;
				if (2 <= number && 4 >= number) {
					result = declensions[1];
				}
				else if (1 == number) {
					result = declensions[0];
				}
				else {
					result = declensions[2];
				}
			}
		}
	}
	else if (2 == languageId) {			// en
		declensions = str.split(',');
		if (2 <= declensions.length) {
			if (1 == number) {
				result = declensions[0];
			}
			else {
				result = declensions[1];
			}
		}
	}
	else {
		result = '';
	}
	return result;
}

/**
 * Process the standard responses from the server. These include:
 *  - 'reload'
 *  - 'redirect'
 *  - 'message'
 *  - 'popup'
 * @param mixed data
 * @param string textStatus
 * @param object options. Allowed options:
 *  - string dataConvert
 *  - bool setFocusToPopup
 *  - bool initValidator
 * @return object
 */
function serverResponseProcessing(data, textStatus, options)
{
	if ('success' != textStatus) {
		return null;
	}

	options = $.extend({
		setFocus		:	true,
		initValidator	:	true
	}, options || {});

	if ('undefined' != typeof(data.reload)) {
		window.location = window.location;
	}
	else if ('undefined' != typeof(data.redirect)) {
		window.location = data.redirect;
	}
	else if ('undefined' != typeof(data.message)) {
		pwh.fullScreenLoaderHide();
		pwh.alert({'message': data.message});
	}
	else if ('undefined' != typeof(data.popup)) {
		pwh.fullScreenLoaderHide();
		pwh.show(data.popup, options);
		if (data.initForm) {
			validator.addSubmitEventForConcreteForm(data.initForm);
		}
		else if (options.initValidator) {
			validator.initValidator();
		}
	}
	else if (data.fadebox) {
		pwh.fullScreenLoaderHide();
		var title = data.fadebox.title || 'Изменения были успешно сохранены.';
		var body  = data.fadebox.body  || ' ';
		var type  = data.fadebox.type  || 'ok';
		fadeBoxShow(type, title, false, body);
	}
	return data;
}

/**
 * Delete bookmarks
 * @param type. Allowed type: 'blog', 'post', 'course', 'user'
 * @param entityId
 */
function bookmarkDelete(type, entityId)
{
	$('.bookmarkDelete').bind('click', function (event){
		event.preventDefault();
		var link = $(this);
		link.unbind('click');
		$.ajax({
			type: 'POST',
			url: site_url('user/ajax/bookmark_action/delete/'+type+'/'+entityId),
			success: function(data, textStatus){
				data = serverResponseProcessing(data, textStatus);
				if ('deleted' == data.result) {
					var tooltipMessage = 'Удалено из'+' <a href="'+site_url('user/bookmarks')+'">'+'закладок'+'</a>.';
					if ('user' == type) {
						$('a.deleteBookmark').unbind('click').html('Добавить в закладки');
						$('a.deleteBookmark').removeClass('deleteBookmark').addClass('addBookmark');
						addBookmark();
					}
					link.removeClass('deleteBookmarkIco').addClass('addBookmarkIco');
					if (link.find('span').length) {
						link.html('<span class="bookmarkAdd ico_new" id="bookmarkAdd"></span>Добавить в закладки');
					}
					link.removeClass('bookmarkDelete').addClass('bookmarkAdd');
					link.attr('title', 'Добавить в закладки');
					var tooltipElement;
					if (link.find('span').length) {
						link.parents('.selector').prop('id', 'bookmarkSelector');
						tooltipElement = 'bookmarkSelector';
					}
					else {
						if (link.prop('id').length != 0) {
							tooltipElement = link.prop('id');
						}
						else {
							tooltipElement = 'bookmarkAction';
						}
					}
					tooltip.show(tooltipElement, tooltipMessage, {'close': true, 'width': 'auto', 'timer': '5'});
					link.parents('.selector').prop('id', '');
					bookmarkAdd(type, entityId);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown){
				bookmarkDelete(type, entityId);
				defaultXhrErrorHandler(XMLHttpRequest, textStatus, errorThrown);
			}

		});
	});
}

/**
 * Add bookmarks
 * @param type. Allowed type: 'blog', 'post', 'course', 'user'
 * @param entityId
 */
function bookmarkAdd(type, entityId)
{
	$('.bookmarkAdd').bind('click', function (event){
		event.preventDefault();
		var link = $(this);
		link.unbind('click');
		$.ajax({
			type: 'POST',
			url: site_url('user/ajax/bookmark_action/add/'+type+'/'+entityId),
			success: function(data, textStatus){
				data = serverResponseProcessing(data, textStatus);
				if ('added' == data.result || 'exists' == data.result) {
					var tooltipMessage = ('added' == data.result) ?
						'Добавлено в'+' <a href="'+site_url('user/bookmarks')+'">'+'закладки'+'</a>.' :
						'Уже в'+' <a href="'+site_url('user/bookmarks')+'">'+'закладках'+'</a>.';
					if ('user' == type) {
						$('a.addBookmark').unbind('click').html('Удалить из закладок');
						$('a.addBookmark').removeClass('addBookmark').addClass('deleteBookmark');
						deleteBookmark();
					}
					link.removeClass('addBookmarkIco').addClass('deleteBookmarkIco');
					if (link.find('span').length) {
						link.html('<span class="bookmarkDelete ico_new" id="bookmarkDelete"></span>Удалить из закладок');
					}
					link.removeClass('bookmarkAdd').addClass('bookmarkDelete');
					link.attr('title', 'Удалить из закладок');
					var tooltipElement;
					if (link.find('span').length) {
						link.parents('.selector').prop('id', 'bookmarkSelector');
						tooltipElement = 'bookmarkSelector';
					}
					else {
						if (link.prop('id').length != 0) {
							tooltipElement = link.prop('id');
						}
						else {
							tooltipElement = 'bookmarkAction';
						}
					}
					tooltip.show(tooltipElement, tooltipMessage, {'close': true, 'width': 'auto', 'timer': '5'});
					link.parents('.selector').prop('id', '');
					bookmarkDelete(type, entityId);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown){
				bookmarkAdd(type, entityId);
				defaultXhrErrorHandler(XMLHttpRequest, textStatus, errorThrown);
			}
		});
	});
}

/**
 * return parent DOM element id for 'elem' without 'rowIdPrefix'
 * @param jQuery obj elem
 * @param string rowIdPrefix
 * @return string
 */
function getParentId(elem, rowIdPrefix)
{
	return elem.parents("[id^='"+rowIdPrefix+"']").prop('id').replace(rowIdPrefix, '');
}


// functions for sorting tables - START
/**
 * change positions two rows in table
 * @param row1 jQuery obj
 * @param row2 jQuery obj
 * @param actionUrl string
 * @param tableId string
 */
function changeTableRows(row1, row2, actionUrl, tableId)
{
	var rowNumber1	= (row1.length) ? row1.prop('id').replace(/^.*_/, '') : -1;
	var rowNumber2	= (row2.length) ? row2.prop('id').replace(/^.*_/, '') : -1;

	var postData	= {
		'rowId1': rowNumber1,
		'rowId2': rowNumber2
	};

	// change table rows
	if (-1 != rowNumber1 && -1 != rowNumber2) {
		var rowHtml1 = row1.html();
		var rowHtml2 = row2.html();
		var rowChecked1 = row1.find('td.checkbox_short input[type=checkbox]').prop('checked');
		var rowChecked2 = row2.find('td.checkbox_short input[type=checkbox]').prop('checked');
		var rowId1	 = row1.prop('id');
		var rowId2	 = row2.prop('id');
		row1.html(rowHtml2);
		row2.html(rowHtml1);
		row1.find('td.checkbox_short input[type=checkbox]').prop('checked', rowChecked2);
		row2.find('td.checkbox_short input[type=checkbox]').prop('checked', rowChecked1);
		row1.prop('id', rowId2);
		row2.prop('id', rowId1);
		prepareSortingRows(tableId);
	}
	else {
		postData.filter = $('.filter').html();
	}

	$.ajax({
		type: 'POST',
		url: actionUrl,
		data: postData,
		success: function (data, textStatus) {
			// row content located to other page
			if ('success' == textStatus && data.tableRow) {
				var oldRow = (rowNumber2 == -1) ? row1 : row2;
				var newRow = $(data.tableRow);
				oldRow.html(newRow.html());
				oldRow.prop('id', newRow.prop('id'));
				prepareSortingRows(tableId);
				checkTableFlag();
			}
		},
		error: function(XMLHttpRequest, textStatus, errorThrown){
			defaultXhrErrorHandler(XMLHttpRequest, textStatus, errorThrown);
			// change table rows back
			if (-1 != rowNumber1 && -1 != rowNumber2) {
				var rowHtml1 = row1.html();
				var rowHtml2 = row2.html();
				var rowId1	 = row1.prop('id');
				var rowId2	 = row2.prop('id');
				row1.html(rowHtml2);
				row2.html(rowHtml1);
				row1.prop('id', rowId2);
				row2.prop('id', rowId1);
				prepareSortingRows(tableId);
			}
		},
		dataType: 'json'
	});
}

/**
 * updates order numbers in table and hides or shows elements manipulated by sorting (arrowUpMaterial and arrowDownMaterial)
 */
function prepareSortingRows(tableId)
{
	if (!tableId || 0 == $('.row td:not(.notResult)').parent().length) {
		return;
	}

	var pageOffset = Number($('#pageOffset').html());
	$('#'+tableId+' td.firstCell').each(function(index){
		$(this).html(pageOffset+index+1);
	});

	$('.arrowUpMaterial, .arrowDownMaterial').show();
	if (0 == $('.paginator .pred').length) {
		$('.arrowUpMaterial').first().hide();
	}
	if (0 == $('.paginator .next').length) {
		$('.arrowDownMaterial').last().hide();
	}
	$('.arrowDownMaterial').parents('div .selectorUL').parent().css('height','');
	$('.hovered').removeClass('hovered');

}
// functions for sorting tables - END


/**
 * MD5 hash algorithm function
 */
md5 = function (string) {

	function RotateLeft(lValue, iShiftBits) {
		return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
	}

	function AddUnsigned(lX,lY) {
		var lX4,lY4,lX8,lY8,lResult;
		lX8 = (lX & 0x80000000);
		lY8 = (lY & 0x80000000);
		lX4 = (lX & 0x40000000);
		lY4 = (lY & 0x40000000);
		lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
		if (lX4 & lY4) {
			return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
		}
		if (lX4 | lY4) {
			if (lResult & 0x40000000) {
				return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
			} else {
				return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
			}
		} else {
			return (lResult ^ lX8 ^ lY8);
		}
 	}

 	function F(x,y,z) {return (x & y) | ((~x) & z);}
 	function G(x,y,z) {return (x & z) | (y & (~z));}
 	function H(x,y,z) {return (x ^ y ^ z);}
	function I(x,y,z) {return (y ^ (x | (~z)));}

	function FF(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};

	function GG(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};

	function HH(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};

	function II(a,b,c,d,x,s,ac) {
		a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
		return AddUnsigned(RotateLeft(a, s), b);
	};

	function ConvertToWordArray(string) {
		var lWordCount;
		var lMessageLength = string.length;
		var lNumberOfWords_temp1=lMessageLength + 8;
		var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
		var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
		var lWordArray=Array(lNumberOfWords-1);
		var lBytePosition = 0;
		var lByteCount = 0;
		while ( lByteCount < lMessageLength ) {
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
			lByteCount++;
		}
		lWordCount = (lByteCount-(lByteCount % 4))/4;
		lBytePosition = (lByteCount % 4)*8;
		lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
		lWordArray[lNumberOfWords-2] = lMessageLength<<3;
		lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
		return lWordArray;
	};

	function WordToHex(lValue) {
		var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
		for (lCount = 0;lCount<=3;lCount++) {
			lByte = (lValue>>>(lCount*8)) & 255;
			WordToHexValue_temp = "0" + lByte.toString(16);
			WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
		}
		return WordToHexValue;
	};

	function Utf8Encode(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	};

	var x=Array();
	var k,AA,BB,CC,DD,a,b,c,d;
	var S11=7, S12=12, S13=17, S14=22;
	var S21=5, S22=9 , S23=14, S24=20;
	var S31=4, S32=11, S33=16, S34=23;
	var S41=6, S42=10, S43=15, S44=21;

	string = Utf8Encode(string);

	x = ConvertToWordArray(string);

	a = 0x67452301;b = 0xEFCDAB89;c = 0x98BADCFE;d = 0x10325476;

	for (k=0;k<x.length;k+=16) {
		AA=a;BB=b;CC=c;DD=d;
		a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
		d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
		c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
		b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
		a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
		d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
		c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
		b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
		a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
		d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
		c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
		b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
		a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
		d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
		c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
		b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
		a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
		d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
		c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
		b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
		a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
		d=GG(d,a,b,c,x[k+10],S22,0x2441453);
		c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
		b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
		a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
		d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
		c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
		b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
		a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
		d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
		c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
		b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
		a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
		d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
		c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
		b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
		a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
		d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
		c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
		b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
		a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
		d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
		c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
		b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
		a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
		d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
		c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
		b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
		a=II(a,b,c,d,x[k+0], S41,0xF4292244);
		d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
		c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
		b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
		a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
		d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
		c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
		b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
		a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
		d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
		c=II(c,d,a,b,x[k+6], S43,0xA3014314);
		b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
		a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
		d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
		c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
		b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
		a=AddUnsigned(a,AA);
		b=AddUnsigned(b,BB);
		c=AddUnsigned(c,CC);
		d=AddUnsigned(d,DD);
	}

	var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

	return temp.toLowerCase();
}


// jquery extensions - START
/**
 * Makes an input autocompleteable.
 *
 * @access	global
 * @param	string	url		URL to server-side script
 * @param	object	data	A set of key/value pairs that used as additional request parameters [optional]
 * @param	object	options	A set of key/value pairs that configure the autocomplete [optional]:
 *		disabled	: false,
 *		appendTo	: 'body',
 *		autoFocus	: false,
 *		delay		: Number('250'),
 *		minLength	: Number('2'),
 *		maxLength	: Number('1024'),
 *		position	: {my: "left top", at: "left bottom", collision: "none"}
 *		create		: function(event, ui) {...} - This event is triggered when autocomplete is created.
 *		search		: function(event, ui) {...} - Before a request (source-option) is started, after minLength and delay are met. Can be canceled (return false), then no request will be started and no items suggested.
 *		open		: function(event, ui) {...} - Triggered when the suggestion menu is opened.
 *		focus		: function(event, ui) {...} - Before focus is moved to an item (not selecting), ui.item refers to the focused item. The default action of focus is to replace the text field's value with the value of the focused item, though only if the focus event was triggered by a keyboard interaction. Canceling this event prevents the value from being updated, but does not prevent the menu item from being focused.
 *		select		: function(event, ui) {...} - Triggered when an item is selected from the menu; ui.item refers to the selected item. The default action of select is to replace the text field's value with the value of the selected item. Canceling this event prevents the value from being updated, but does not prevent the menu from closing.
 *		close		: function(event, ui) {...} - When the list is hidden - doesn't have to occur together with a change.
 *		change		: function(event, ui) {...} - Triggered when the field is blurred, if the value has changed; ui.item refers to the selected item.
 *		empty		: function() {...} - Triggered when the autocomplete result is empty.
 */
$.fn.mcAutocompleteInit = function(url, data, options) {
	if ('object' != typeof(this) || 0 == this.length) {
		return false;
	}
	url		= url || '';
	data	= data || {};
	options	= $.extend({
		disabled	: false,
		appendTo	: ($(this).parent().hasClass('formField') || $(this).parent().hasClass('textPut')) ? $(this).parent() : 'body',
		autoFocus	: false,
		delay		: Number('250'),
		minLength	: Number('2'),
		maxLength	: Number('1024'),
		position	: {my: "left top", at: "left bottom", collision: "none"}
	}, options || {});
	// improve select handler to detect empty result
	if (options.select && 'function' == typeof(options.select)) {
		var selectHandler = options.select;
		options.select = function(event, ui) {
			return ui.item.empty ? false : selectHandler(event, ui);
		};
	}
	// fix autocomplete width
	var openHandler = options.open || null;
	options.open = function(event, ui) {
		var input	= $(this);
		var widget	= $("ul.ui-autocomplete");
		$(widget).outerWidth($(input).outerWidth()+2);
		if (openHandler && 'function' == typeof(openHandler)) {
			 return openHandler(event, ui);
		}
	};
	if (0 < url.length && !options.source) {
		options.source = function(request, response) {
			var emptyHandler = function(message) {
				message = message || 'Ничего не найдено';
				response([{
					label	: '<span class="emptyResult">' + message + '</span>',
					value	: '',
					empty	: true
				}]);
				// call empty result handler
				if (options.empty && 'function' == typeof(options.empty)) {
					options.empty();
				}
			};
			var errorHandler = function(message) {
				message = message || 'Приносим свои извинения, произошла неизвестная ошибка';
				response([{
					label	: '<span class="errorResult">' + message + '</span>',
					value	: '',
					empty	: true
				}]);
			};
			// check term for max length
			if (request.term && options.maxLength < request.term.length) {
				return errorHandler('Превышено ограничение на длину запроса');
			}

			$.ajax({
				url			: url,
				type		: 'GET',
				dataType	: 'json',
				data		: $.extend(
					{term: request.term},
					this.element.data("extra") || {},
					options.onSendChangeData ? options.onSendChangeData.call(this, data) : data
				),
				success		: function(data) {
					if (0 < data.items.length) {
						response($.map(data.items, function(item) {
							// convert html entities to characters, e.g. &quot; to "
							var value = $('<div/>').html(item.value).text();
							return {
								label	: item.label,
								value	: value,
								data	: item.data
							};
						}));
					}
					else {
						emptyHandler();
					}
				},
				error		: function(XMLHttpRequest, textStatus, errorThrown) {
					errorHandler();
				}
			});
		};
	}
	// init ui autocomplete
	this.autocomplete(options);
	// convert html entities into html code while displaying results
	this.data('autocomplete')._renderItem = function(ul, item) {
		return $('<li></li>')
			.data('item.autocomplete', item)
			.append('<a href="javascript:void(0)">'+item.label+'</a>')
			.appendTo(ul);
	};
	// return element as result
	return this;
};

/**
 * Bind an event handler to the "change" on an file input
 */
$.fn.fileOnChange = function(onChangeFunction, bindLive) {
	bindLive = bindLive || false;
	// emulation file input change event for IE
	if ($.browser.msie) {
		var fileInputId = $(this).prop('id');
		window[fileInputId+'initValue']			= $(this).val();
		window[fileInputId+'setTimeoutHandle']	= undefined;
		if (bindLive) {
			$(this).live('click', function(){
				if ('undefined' != window[fileInputId+'setTimeoutHandle']) {
					clearTimeout(window[fileInputId+'setTimeoutHandle']);
				}
				fileInputChangeDetector($(this));
			});
		}
		else {
			$(this).click(function(){
				if ('undefined' != window[fileInputId+'setTimeoutHandle']) {
					clearTimeout(window[fileInputId+'setTimeoutHandle']);
				}
				fileInputChangeDetector($(this));
			});
		}
	}
	else {
		if (bindLive) {
			$(this).live('change', onChangeFunction);
		}
		else {
			$(this).bind('change', onChangeFunction);
		}
	}

	function fileInputChangeDetector(fileInput)
	{
		var fileInputId = fileInput.prop('id');
		if (window[fileInputId+'initValue'] == fileInput.val()) {
			window[fileInputId+'setTimeoutHandle'] = setTimeout(
			function(){fileInputChangeDetector(fileInput);}, 500);
		}
		else {
			window[fileInputId+'initValue'] = fileInput.val();
			onChangeFunction();
		}
	}
};

/**
 * Unbind an event handler to the "change" on an file input
 */
$.fn.unbindFileOnChange = function() {
	if ($.browser.msie) {
		$(this).unbind('click');
	}
	else {
		$(this).unbind('change');
	}
};

/**
 * provides a mechanism for immediately submitting an HTML form using AJAX.
 */
$.fn.ajaxFormSubmit = function(options) {
	// make sure options exists
	options = $.extend({
		data:  {}
	}, options || {});

	// submit special flag to server in case ajax file upload
	if ($('input:file', this).length) {
		options.data['ajaxFileUploading'] = true;
	}

	return this.ajaxSubmit(options);
};

/**
 * Return true if element not visible or not visible parents nodes
 * @param elementId string
 * @return bool
 */
function isHidden(elementId)
{
    var p = document.getElementById(elementId);
    var b = document.body;
    var temp = $(p).css("display") == "none" || $(p).hasClass('removedEntity');
    while(p && p != b && !temp) {
        p = p.parentNode;
		temp = $(p).css("display") == "none" || $(p).hasClass('removedEntity');
    }
    return !!temp && p!=b;
}

/**
 * Show media player
 *
 * @param	file	string	the file url
 * @param	fileType	string	avaliable values: 'video', 'audio'
 * @param	options	array	e.g. options = {
 *		'width':		width,
 *		'height':		height,
 *		'duration':		duration,
 *		'image':		image_path,
 *		'autostart':	true/false
 * }
 */
$.fn.mediaPlayer = function(file, fileType, options) {
	var videoContainer = $(this).prop('id') || 'videoContainer';
	var playerSize	= '640x480'.split('x');
	if ('audio' == fileType) {
		options = $.extend({
			'flashplayer':		staticUrl+'flash/jwplayer/player.swf',
			'file':				file,
			'width':			Number(playerSize[0]),
			'height':	 		24,
			'http.startparam':	'start',
			'controlbar': 		'bottom',
			'provider':			'sound'
		}, options || {});
	}
	else if ('image' == fileType) {
		options = $.extend({
			'flashplayer':		staticUrl+'flash/jwplayer/player.swf',
			'file':				file,
			'controlbar':		'bottom',
			'width':			Number(playerSize[0]),
			'height':			Number(playerSize[1])
		}, options || {});
	}
	else {
		options = $.extend({
			'flashplayer':		staticUrl+'flash/jwplayer/player.swf',
			'file':				file,
			'width':			Number(playerSize[0]),
			'height':	 		24 + Number(playerSize[1]),
			'http.startparam':	'start',
			'controlbar': 		'bottom',
			'provider':			'http',
			'dock': 			'true',
			'stretching': 		'exactfit',
			'plugins': {
				'backstroke-1':	{}
			}
		}, options || {});
		if (options.soundTrack) {
			// initialise Audio Description plugin
			options.plugins['audiodescription-2'] = {
				'file':		options.soundTrack,
				'state':	false,
				'volume':	100,
				'dock':		true,
				'ducking':	false
			};
			delete options.soundTrack;
		}
	}
	options['wmode'] = 'opaque';

	jwplayer(videoContainer).setup(options);

	if ($('.headerSimple div.videoBox').length > 0) {
		var marginVideoTop = options['height']/2;
		var marginVideoLeft = options['width']/2;
		$('.headerSimple div.videoBox').css('margin-top','-'+marginVideoTop+'px');
		$('.headerSimple div.videoBox').css('margin-left','-'+marginVideoLeft+'px');
	}
};

/**
 * Bind an 'click' event handler to the element
 */
$.fn.bindClickEvent = function(clickFunction) {
	$(this).click(function(event){
		// element is disabled or ajax progress or has self handler?
		if (!$(this).hasClass('disableBt') && !$(this).hasClass('inProgress') && !$(this).hasClass('hasHandler')) {
			// run click callback
			clickFunction.call(this, event)
		}
	});
};

/**
 * Live an 'click' event handler to the element
 */
$.fn.liveClickEvent = function(clickFunction) {
	$(this).live('click', function(event){
		// element is disabled?
		if (!$(this).hasClass('disableBt')) {
			// run click callback
			clickFunction.call(this, event)
		}
	});
};
// jquery extensions - END

/**
 * Processes template content and tries to replace all matched codes with actual content.
 * @param content string - templates content
 * @param values obj - obj with actual values
 * @param prefix string - variables prefix
 */
function template(content, values, prefix)
{
	if ('undefined' == typeof(prefix)) {
		prefix = 'js_variable.';
	}

	$.each(values, function(name, variable){
		content = content.replace(eval('/{'+prefix+name+'}/g'), variable);
	});
	return content;
}

/**
 * wrap in tag strong first found term in value
 * @param value string
 * @param terms array
 * @return string
 */
function highlightFirstTerm(value, terms)
{
	var regExpObj = {'exp': ''};
	$.each(terms.values, function(index, term) {
		regExpObj.exp = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi");
		if (value.match(regExpObj.exp)) {
			return false;
		}
	});

	return value.replace(regExpObj.exp, "<strong>$1</strong>");
}

/**
 * return copy of object
 */
function objClone(obj) {
	if (!obj || "object" !== typeof obj) {
		return obj;
	}
	var copy = "function" === typeof obj.pop ? [] : {};
	var property, temp;
	for (property in obj) {
		if (obj.hasOwnProperty(property)) {
			temp			= obj[property];
			copy[property]	= (temp && "object" === typeof(temp)) ? objClone(temp) : temp;
		}
	}
	return copy;
}

/**
 * return true if browser support flash
 */
function flashIsSupported()
{
	// Major version of Flash required
	var majorVer	= 9;
	// Minor version of Flash required
	var minorVer	= 0;
	// Release version of Flash required
	var releaseVer	= 0;
	// Check flash Version
	if ('function' != typeof(DetectFlashVer)) {
		return false;
	}
	else {
		return DetectFlashVer(majorVer, minorVer, releaseVer);
	}
}

/**
 * initialize swf uploader
 *
 * @param uploadUrl string
 * @param options object
 */
function swfUploaderInit(uploadUrl, options)
{
	options = $.extend({
		// Backend Settings
		file_post_name			: 'file',
		post_params				: {},

		// File Upload Settings
		file_size_limit			: "0", //604857600",
		file_types				: '*.*',
		file_types_description	: "All Files",
		file_upload_limit		: "0",
		file_queue_limit		: "1",

		flash_url				: staticUrl + "flash/swfupload/swfupload.swf",

		// Event Handler Settings
		swfupload_loaded_handler		: function() {return true;},
		file_dialog_start_handler		: function() {
			hideLoader('uploadLoader');
			this.cancelUpload();
		},
		file_queued_handler				: function(file) {
			try {
				document.getElementById("fileName").value = file.name;
			}
			catch (ex) {
			}
		},
		file_dialog_complete_handler	: function() {},
		upload_start_handler			: function(file) {
			try {
				file.id = "singlefile";	// This makes it so FileProgress only makes a single UI element, instead of one for each file
				var progress = new FileProgress(file, this.customSettings.progress_target);
				$('#startUploadLabel').text('Загрузка...');
				progress.setProgress(0);
				progress.toggleCancel(false);
			}
			catch (ex) {
			}
		},
		upload_progress_handler		: function (file, bytesLoaded, bytesTotal) {
			try {
				var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);
				file.id = "singlefile";	// This makes it so FileProgress only makes a single UI element, instead of one for each file
				var progress = new FileProgress(file, this.customSettings.progress_target);
				progress.setProgress(percent);
				$('#startUploadLabel').text('Загрузка...');
			}
			catch (ex) {
			}
		},
		upload_error_handler		: function (file, errorCode, message){
			hideLoader('uploadLoader');
			uploadError(file, errorCode, message);
		},
		upload_success_handler		: function() {},
		file_queue_error_handler	: function() {},

		// Button Settings
		button_placeholder_id		: "spanButtonPlaceholder",
		button_window_mode			: SWFUpload.WINDOW_MODE.OPAQUE,
		button_cursor				: SWFUpload.CURSOR.HAND
	}, options || {});

	swfu = new SWFUpload({
		// Backend Settings
		upload_url						: uploadUrl,
		file_post_name					: options.file_post_name,
		post_params						: options.post_params,

		// File Upload Settings
		file_size_limit					: options.file_size_limit,
		file_types						: options.file_types,
		file_types_description			: options.file_types_description,
		file_upload_limit				: options.file_upload_limit,
		file_queue_limit				: options.file_queue_limit,

		// Event Handler Settings
		swfupload_loaded_handler		: options.swfupload_loaded_handler,
		file_dialog_start_handler		: options.file_dialog_start_handler,
		file_queued_handler				: options.file_queued_handler,
		file_queue_error_handler		: options.file_queue_error_handler,
		file_dialog_complete_handler	: options.file_dialog_complete_handler,

		upload_start_handler			: options.upload_start_handler,
		upload_progress_handler			: options.upload_progress_handler,
		upload_error_handler			: options.upload_error_handler,
		upload_success_handler			: options.upload_success_handler,

		// Button Settings
		button_action					: SWFUpload.BUTTON_ACTION.SELECT_FILE,
		button_image_url				: staticUrl+"img/bt/upload.png",
		button_text						: "<span class='swfLoadBt'>Обзор</span>",
		button_text_style				: ".swfLoadBt { color:#ffffff;display:block;font-size:12px;font-family:Arial;text-align:center;text-transform:uppercase;}",
		button_text_top_padding			: 4,
		button_placeholder_id			: options.button_placeholder_id,
		button_width					: 69,
		button_height					: 27,
		button_window_mode				: options.button_window_mode,
		button_cursor					: options.button_cursor,

		// Flash Settings
		flash_url						: options.flash_url,

		custom_settings : {
			progress_target		: "fsUploadProgress",
			upload_successful	: false,
			cancelButtonId		: "cancel"
		},

		// Debug Settings
		debug: false
	});
}

// this variable needed to prevent show change notice message
window.isRedirect = false;

/**
 * redirect to url
 */
function redirect(url)
{
	window.isRedirect = true;
	window.location = url;
}


/**
 * lock some area in page by id
 */
function lockAreaById(areaId, removeOldLockers)
{
	removeOldLockers = removeOldLockers ? true : false;

	return pwh.blockScreenLoaderShow(
		'Загружается', '', areaId, true, false,
		{'showLoaderImg' : false, 'showLoaderTitle' : false, 'removeScreenLoader': removeOldLockers}
	);
}


/**
 * force the browser redraw the window
 */
function redrawWindow()
{
	var currentBg = $(document.body).css("background-color");
	$(document.body).css("background-color", "#f4f4f4");
	setTimeout(function(){
		$(document.body).css("background-color", currentBg);
	}, 10);
}

/**
 * custom select control
 */
$.fn.multiSelect = function(options)
{
	var el = this;
	// set default values for required options
	options = $.extend({
		hiddenInputId :	el.next().prop('id'),				// hidden input for selected ids
		maxSelected : 0,									// maximum number of selected items
		maxTitleLength : 45,								// max length for item title
		selectedItemsContainerId : el.parent().prop('id'),	// container id for selected items
		callbacks: {										// callback functions
			onCheck: function(entityId){},
			onUnCheck: function(entityId){}
		}
	}, options || {});

	var hiddenInput = $('#' + options.hiddenInputId);
	var container = $('#' + options.selectedItemsContainerId);

	function init() {
		var cntData = countDataOptions();
		if (1 < cntData && el.find('option').length == cntData+1) {
			addAllOption();
		}
		container.find('a.cancelIco').live('click', function(event) {
			event.preventDefault();
			var entityId = $(this).attr('href');
			var parentSpan =  $(this).parent('span');
			var title = parentSpan.attr('title');

			var entities = hiddenInput.val().split(',');
			entities.splice($.inArray(entityId, entities), 1);
			hiddenInput.val(entities.join(","));
			parentSpan.remove();

			el.append('<option value="'+entityId+'">' + title + '</option>');

			var cntData = countDataOptions();
			if (1 < cntData && el.find('option').length == cntData+1) {
				addAllOption();
			}

			if ((!options.maxSelected || entities.length < options.maxSelected) && true == el.prop('disabled')) {
				el.prop('disabled', false);
			}
			options.callbacks.onUnCheck(entityId);
		});
		if (1 == el.find('option').length) {
			el.prop('disabled', 'disabled');
		}
	}

	function doSelectOption(entityId) {
		var selected = el.find('option[value = '+entityId+']');
		var title = selected.html();
		selected.remove();

		var entityIds = hiddenInput.val();
		hiddenInput.val((entityIds == '') ? entityId : entityIds+','+entityId);

		if (options.maxSelected && hiddenInput.val().split(',').length >= options.maxSelected
			|| 1 == el.find('option').length
		) {
			el.prop('disabled', true);
		}

		container.append(
			'<span title="'+title+'" style="display:none;" class="null">'+
			(options.maxTitleLength && title.length > options.maxTitleLength ? title.substr(0, options.maxTitleLength) + '...' : title)+
			'<a title="Удалить" href="'+entityId+'" class="cancelIco ico">&nbsp;</a></span>');
		container.find('a[href='+entityId+']').parent().fadeIn('slow');
		var cntData = countDataOptions();
		if (1 >= cntData) {
			deleteAllOption();
		}
		else if (el.find('option').length == cntData+1) {
			addAllOption();
		}
		options.callbacks.onCheck(entityId);
	}

	function addAllOption() {
		$('<option value="all">Все</option>').insertAfter(el.find('option')[0]);
	}

	function deleteAllOption() {
		el.find('option').each(function(ind, element){
			if ('all' == element.value) {
				$(element).remove();
			}
		});
	}

	el.bind('change', function() {
		validator.removeErrors(el.closest('form').prop('id'));
		var entityId = el.val();
		if (entityId != '') {
			if ('all' != entityId) {
				doSelectOption(entityId);
			}
			else {
				el.find('option').each(function(ind, element){
					if ('' != element.value && 'all' != element.value) {
						doSelectOption(element.value);
					}
				});
			}
		}
	});

	function countDataOptions() {
		var result = 0;
		el.find('option').each(function(ind, element){
			if ('' != element.value && 'all' != element.value) {
				result++;
			}
		});
		return result;
	}

	init();
};

/**
 * show tos popup for quick registration
 */
function showTosPopup(formName)
{
	formName = formName ? formName : 'popupQuickRegistration';
	$('#termsLink').bind('click', function(event){
		event.preventDefault();
		var termsAgree	= $('#termsAgree').prop('checked');
		var username	= $('#username').val();
		var password	= $('#password').val();
		var redirectUrl	= $('#redirectUrl').val();
		var email		= $('#email').val();

		$('.quickRegistration').wrap('<div class="container" />');
		var quickRegistrationPopup = $('div.container').html();
		pwh.hide();
		pwh.show(site_url('ajax/page/tos/only_accept'),
			{'closeBtnEvent': function(){
				pwh.show(quickRegistrationPopup, {'setFocus': false});
				$('#termsAgree').prop('checked', termsAgree);
				$('#username').val(username);
				$('#password').val(password);
				$('#redirectUrl').val(redirectUrl);
				$('#email').val(email);
				validator.addSubmitEventForConcreteForm(formName);
				validator.initControlDefaultForConcreteForm(formName);
				switchPasswordControl([['password', 'passwordDefault']]);
				showTosPopup(formName);
			},
			'async': false
			});
		$('#acceptTos').bind('click', function(){
			$('#popupCloseBtn').click();
			$('#termsAgree').prop('checked', 'checked').parents('td.termsAgree').find('.smallNoFieldMessage').remove();
		});
	});
}

/**
 * Checking user agent clientside
 *
 * @return boolean TRUE if client user agent is mobile device
 */
function isMobileDevice()
{
	if (navigator.userAgent.match(/Android/i)
		|| navigator.userAgent.match(/BlackBerry/i)
		|| navigator.userAgent.match(/Windows CE/i)
		|| navigator.userAgent.match(/Windows Phone OS/i)
		|| navigator.userAgent.match(/SonyEricsson/i)
		|| navigator.userAgent.match(/Opera Mini/i)
		|| navigator.userAgent.match(/Nokia/i)
		|| navigator.userAgent.match(/Kindle/i)
		|| navigator.userAgent.match(/webOS/i)
		|| navigator.userAgent.match(/iPhone/i)
		|| navigator.userAgent.match(/iPod/i)
		|| navigator.userAgent.match(/iPad/i)
		|| navigator.userAgent.match(/SymbianOS/i)) {
		return true;
	}
	return false;
}

/**
 * TinyMCE initialization
 */
function initTinyMCE(tinyObject)
{
	if (!isMobileDevice()) {
		tinyMCE.init(tinyObject);
	}
}

/**
 * sets client time zone into element with given id
 * string elementId - element id
 */
function set_client_time_zone(elementId)
{
	if (0 == $('#'+elementId).length) {
		throw('Element with id '+elementId+' does not exist in DOM.');
	}
	$.ajax({
		async: true,
		type: 'GET',
		url: 'user/ajax/get_client_time_zone',
		dataType:'json',
		success: function(data){
			$('#'+elementId).val(data.timeZoneName);
			// do not worry user about changing inputs
			if (validator.initialValues[$('#'+elementId).parents('form').prop('id')]) {
				validator.initialValues[$('#'+elementId).parents('form').prop('id')].timeZoneName = data.timeZoneName;
			}
		}
	})
}


/**
 * Increases or decreases user's rating when user mentioned entity OR deleted entity mention on other social communities (FB:LIKE)
 */
function mentionManagement(entityType, entityId, mentioned)
{
	if (undefined == mentioned) {
		mentioned = true;
	}
	switch (entityType) {
		case 'course':
			$.ajax({
				type: 'POST',
				url: 'user/ajax/mention_management',
				data: {
					entityType: entityType,
					entityId:	entityId,
					mentioned:	(mentioned ? 1 : 0)
				}
			});
			break;
		default:
			throw ('Undefined entity type: '+entityType);
		break;
	}
}

/**
 * logout current uesr
 */
function logout()
{
	$.ajax({
		type: 'GET',
		url: site_url('user/logout')
	});
}


/**
 * Perferms simple checking that url links to video player
 *
 * @param string url
 * @return boolean
 */
function isVideo(url)
{
	return /\/video_player\//.test(url);
}

/**
 * recalculate table zebra
 */
function recalcTableZebra(tableId)
{
	$('#'+ tableId + ' tr.row').each(function(i, elem) {
		$(this).find('td.number').html(i+1);
		$(elem).removeClass('grayTr');
		if (1 == i%2) {
			$(elem).addClass('grayTr');
		}
	});
}

/**
 * recalculate table rows
 */
function recalculateTableRows(tableId)
{
	$('#' + tableId + ' td.number').each(function(i, elem){
		$(this).html(i + 1);
	});
}

/**
 * Reload iFrame for restore browser cache
 * @param string iFrameId
 */
function reloadIFrame(iFrameId)
{
	var iFrame = document.getElementById(iFrameId);
	var iFrameDocument = null;
	if (iFrame.contentDocument) {
		iFrameDocument = iFrame.contentDocument;
	} else if (iFrame.contentWindow) {
		// for IE 5.5, 6 and 7:
		iFrameDocument = iFrame.contentWindow.document;
	}
	if (!!iFrameDocument) {
		iFrameDocument.location.reload(true);
	}
}

function deleteTableRow(actionClass, recalcTableId, confirmMessage, fadeBoxMessage, callback)
{
	$('.'+actionClass).bind('click', function(e){
		e.preventDefault();
		var deleteObj = $(this);
		pwh.confirm({
			message:	confirmMessage ? confirmMessage : 'Вы действительно хотите удалить данную запись?',
			callbackYes:	function(){
				pwh.fullScreenLoaderShow();
				$.ajax({
					type:	'GET',
					url:	deleteObj.attr('href'),
					async:	false,
					success: function (data, textStatus){
						deleteObj.parents('tr:first').fadeOut('normal', function() {
							$(this).remove();
						}).next().fadeOut('normal', function() {
							$(this).remove();
							if (undefined != recalcTableId) {
								recalcTableZebra(recalcTableId);
							}
						});
						if (undefined != callback) {
							callback.call();
						}
						pwh.fullScreenLoaderHide();
						if (fadeBoxMessage) {
							fadeBoxShow('ok', fadeBoxMessage);
						}
					}
				});
			}
		});
	});
}

/**
 * change width in privacy selectors at change value
 * @param obj - object
 * @param value
 */
function checkWidth(obj, value) {
	value = value.replace('&#039;', '\'');
	var baseWidth = 24;
	$('label.tmpBox').text(value);
	baseWidth = baseWidth + $('label.tmpBox').width();
	$('label.tmpBox').text('&nbsp;');
	obj.find('.selectHeader').width(baseWidth+15);
}

/**
 * Checks if the given popup window is blocked,
 * and call the specified function if so.
 * For Opera,IE9: window.outerHeight is checked.
 * For IE8,Chrome: window.document.body.clientHeight is checked.
 * Usage:
 *	var notifyPopupBlockedFunction = function() {
 *		fadeBoxShow('attention', 'Warning about blocked popup window', true);
 *	};
 *	wnd = window.open(...);
 *	checkPopupBlocked(wnd, notifyPopupBlockedFunction);
 *
 * @param object poppedWindow popup window, result of window.open() call
 * @param object notifyPopupBlockedFunction function to be called
 **/
function checkPopupBlocked(poppedWindow, notifyPopupBlockedFunction)
{
	var mac	= (navigator.userAgent.toLowerCase().indexOf("mac") != -1) ? true : false;
	if (!poppedWindow || 'undefined' === typeof(poppedWindow) ||
		poppedWindow.closed || 'undefined' === typeof(poppedWindow.closed))
	{
		notifyPopupBlockedFunction();
	}
	else if (poppedWindow) {

		// Property poppedWindow.outerHeight is not supported in IE8 (and below),
		// that's why poppedWindow.document.body.clientHeight is used.
		//
		// Opera: poppedWindow.document.body is not defined,
		// so it can't be used for checks,
		// that's why it's checked before poppedWindow.outerHeight

		if (!$.browser.msie && !mac) {
			if ('undefined' !== typeof(poppedWindow.document.body) &&
				'undefined' !== typeof(poppedWindow.document.body.clientHeight))
			{
				if ('undefined' !== typeof(poppedWindow.outerHeight)) { // Chrome
					poppedWindow.onload = function() {
						// Chrome: outerHeight is 0 for blocked popup
						if (0 == poppedWindow.outerHeight) {
							notifyPopupBlockedFunction();
						}
					};
				}
				else { // IE
					if (0 == poppedWindow.document.body.clientHeight) {
						// IE: clientHeight is 0 for blocked popup
						notifyPopupBlockedFunction();
					}
				}
			}
			else if ('undefined' === typeof(poppedWindow.outerHeight)) {
				// Opera: outerHeight is undefined for blocked popup
				notifyPopupBlockedFunction();
			}

		}
	}
}

/**
 * Replace search value in subject
 *
 * @param srting search
 * @param srting replace
 * @param srting subject
 *
 * @return srting
 */
function strReplace(search, replace, subject)
{
	return subject.split(search).join(replace);
}

/**
 * Initializing inline edit elements
 *
 *
 * @param	initObject - object = {
 *	selector		: selector of element for action,
 *	getFormUrl		: url to take form,
 * }
 * @return	void
 */
function bindInlineEdit(initObject)
{
	var identifier = initObject.identifier ? initObject.identifier : '';
	$(initObject.selector + ', .inlineEditValue[data="' + identifier + '"]').one('click', {'count': 1}, function(e) {
		e.preventDefault();
		// function - addInlineEditEvents must be loaded once
		if ('function' != typeof(addInlineEditEvents)) {
			var sender = $(this);
			$.getScript(staticUrl+'js/inline_edit.js', function(data, textStatus){
				addInlineEditEvents(initObject);
				sender.click();
			});
			e.data['count'] = 0;
		}
		else if (e.data['count']) {
			addInlineEditEvents(initObject);
			e.data['count'] = 0;
		}
	});
}

/**
 * Add new course category in glossary if select "Other.."
 *
 * @param	categorySelector
 * @param	options
 */
function addNewCategoryPopup(categorySelector, options)
{
	options = options || {};
	if ('other' == categorySelector.options[categorySelector.selectedIndex].value) {
		pwh.show(site_url('ajax/add_course_category_popup'), {
			'async':			false,
			'closeBtnEvent':	function() {
				$('#categoryId').val('');
				$('#courseCategoryId').val('');
				$('#auditoryId').val('');
				pwh.hide();
			},
			'callback':			function() {
				validator.getValidationRules();
				validator.initControlDefaultForConcreteForm('addCustomCategory');
				validator.addSubmitEventForConcreteForm('addCustomCategory', validator.validationRules.addCustomCategory);
				setTimeout(function() {validator.removeErrors('addCustomCategory');}, 1);
			},
			'notCloseOtherLoader': options.notCloseOtherLoader
		});
	}
}

/**
 * Bind mark info tooltip
 *
 * @param	tooltipSelector
 * @return	void
 */
function bindMarkInfoTooltip(tooltipSelector)
{
	var intervalId;
	tooltipSelector = tooltipSelector ? tooltipSelector : '.markInfoTooltip';
	$(tooltipSelector).live('click', function(e){e.preventDefault();})
		.live('mouseenter', function() {
			var that = this;
			intervalId = setTimeout(function(){
				tooltipBox.show(that, that.href, {width : 100});
				$(".tooltipBoxData").css("z-index", 1200);
			},300);
		})
		.live('mouseleave', function() {
			if (intervalId) {
				clearInterval(intervalId);
			}
			tooltipBox.hide();
		}
	);
}

/**
 * Show/hide pay menu in course view
 *
 * @access	global
 * @param	buttonId
 * @return	void
 */
function toggleButton(buttonId, isEnable) {
	var button = $(buttonId).attr('class').match('bt[0-9]');
	if (null == button) {
		return;
	}
	if (isEnable) {
		$(buttonId).removeClass(button[0]).addClass(button[0]+'_Type2');
	}
	else {
		$(buttonId).removeClass(button[0]+'_Type2').addClass(button[0]);
	}
}

/**
 * Toggle description on course master, teach and connect pages
 *
 * @access	global
 * @param	that	- link object
 * @param	element	- toggle element
 * @param	options
 * @return	void
 */
function toggleDescription(that, element, options)
{
	options = $.extend({
		hideLabel		: 'Спрятать',
		readMoreLabel	: 'Подробнее...'
	}, options || {});

	if ($(that).hasClass('active')) {
		$(that).removeClass('active');
		$(that).html(options.readMoreLabel);
		$(that).attr('title', options.readMoreLabel);
	}
	else {
		$(that).addClass('active');
		$(that).html(options.hideLabel);
		$(that).attr('title', options.hideLabel);
	}
	var parentBox   = $(element).parent();
	var pLeft	    = parentBox.css('padding-left');
	var pRight	    = parentBox.css('padding-right');
	var padding     = Number(pLeft.replace('px','')) + Number(pRight.replace('px',''));
	var parentWidth = parentBox.width()-padding;
	setTimeout(function(){
		$(element).width(parentWidth).animate({'height' : 'toggle'});
	},100);
}

/**
 * Show not approved category description
 *
 * @param	item
 * @return	void
 */
function showNewCategoryTooltip(item)
{
	var element = $('#'+item);
	if (0 == element.length) {
		element = $('.'+item);
	}
	element.live('click', function(e){e.preventDefault();})
	.live('mouseenter', function() {
		if ('admin' == $(this).prop('rel')) {
			var categoryName = $(this).parent().text();
			tooltip.show(
				this.id,
				template(
					'Данная категория ещё не утверждена. Утвердить или отклонить её вы можете <a href="{js_variable.link}" target="_blank" title="">здесь</a>.',
					{'link' : site_url('admin/categories?searchValue=' + encodeURI($.trim(categoryName)))}
				),
				{'delayedOccurrence': 500}
			);
		}
		else {
			tooltip.show(this.id, 'Данная категория ещё не утверждена.', {'delayedOccurrence': 500});
		}
	})
	.live('mouseleave', function() {
		if ('admin' == $(this).prop('rel')) {
			setTimeout('tooltip.hide()', 3000);
		}
		else {
			tooltip.hide();
		}
	});
}

// avatar recommended size tooltip
function avatarRecommendedSizeTooltip(item)
{
	var element = $('#'+item);
	if (0 == element.length) {
		element = $('.'+item);
	}
	element.live('click', function(e){e.preventDefault();})
	.bind('mouseenter', function() {
		tooltip.show(this.id, '<p>Рекомендуемое соотношение сторон аватара: 3:2</p><p>Рекомендуемое разрешение аватара: не менее 600x400</p>', {'delayedOccurrence': 500});
		$(".tooltipBox").css("z-index", 1001);
	})
	.bind('mouseleave', function() {
		tooltip.hide();
	});
}

/**
 * Bind login as another user.
 * Binding element must have class 'loginAs'
 *
 * @return	void
 */
function bindLoginAsAnotherUser()
{
	$('.loginAs').live('click', function(e) {
		e.preventDefault();
		pwh.fullScreenLoaderShow();
		var that = $(this);

		$.ajax({
			type	: 'GET',
			url		: that.attr('href'),
			success	: function(data, textStatus) {
				pwh.fullScreenLoaderHide();
				if (data.error) {
					fadeBoxShow('attention', 'Вы уже вошли в систему от имени другого пользователя.');
				}
				serverResponseProcessing(data, textStatus);
			}
		});
	});
}


/**
 * Change the role to avatar
 *
 * @return	void
 */
function bindCuratorLoginAsAnotherUser($roleId)
{
	$.ajax({
		type	: 'GET',
		url		: '/misc/accset/common/'+$roleId,
		success	: function(data, textStatus) {

		}
	});
}

/**
 * Shortcut for PHP method empty()
 *
 * @param	value
 * @return	bool
 */
function empty(value)
{
	return (undefined === value || null === value || "" === value || "0" === value
		|| 0 === value || false === value || ('object' == typeof(value) && (value instanceof Array) && 0 == value.length));
}


/**
 * Shortcut for 'undefinded' != typeof(value)
 *
 * @param	value
 * @return	bool
 */
function undef(value)
{
	return 'undefined' === typeof(value);
}

/**
 * Shortcut for ('undefined' != typeof(data[key]) && null !== data[key] ? data[key] : defaultValue)
 *
 * @param	data
 * @param	key
 * @param	defaultValue
 * @return	mixed
 */
function val(data, key, defaultValue)
{
	if ('undefined' !== typeof(data) && 'undefined' !== typeof(data[key]) && null !== data[key] && '' !== data[key]) {
		return data[key];
	}
	return 'undefined' != typeof(defaultValue) ? defaultValue : '';
}

/**
 * Format location for autocompleter result
 *
 * @access	global
 * @param	row
 * @return	string
 */
function locationFormat(row)
{
	return templateLocation(row, '{location.cityName}, {location.countryName}, {location.stateName}');
}

/**
 * Format value in location input after autocomplete
 *
 * @access	global
 * @param	inputId
 * @param	locationInfo
 * @return	void
 */
function formatLocationInput(inputId, locationInfo)
{
	$('#'+inputId).val(templateLocation(locationInfo, '{location.cityName}, {location.countryName}'));
}


/**
 *  Substitute the values into location template
 *
 *  @access	global
 *  @param	locationInfo
 *  @param  templateStr
 *  @return	string
 */
function templateLocation(locationInfo, templateStr)
{
	var location;
	var fields;
	if (undefined === locationInfo['cityName']) {
		location	= locationInfo[0].toString().split(', ');
		fields		= {
			'cityName'			: location[0],
			'countryName'		: location[1],
			'stateName'			: locationInfo[1],
			'stateShortname'	: locationInfo[4]
		};
	}
	else {
		fields		= {
			'cityName'			: locationInfo['cityName'],
			'countryName'		: locationInfo['countryName'],
			'stateName'			: locationInfo['stateName'],
			'stateShortname'	: locationInfo['stateShortName']
		};
	}
	//Delete empty entities
	var entities = new Array();
	preg_match_all('\{location\.([^\}]+)\}', templateStr, entities);
	var counter = entities.length;
	for (var entity in entities) {
		var entityName = entities[entity];
		if (fields[entityName]) {
			counter--;
			continue;
		}
		// remove first or middle entity
		if (1 < counter) {
			templateStr = templateStr.replace("/\{location\."+entityName+"\}[,\s]*/", "");
		}
		// remove last entity
		else {
			templateStr = templateStr.replace("/[,\s]*\{location\."+entityName+"\}/", "");
		}
		counter--;
	}
	return template(templateStr, fields, 'location.');
}
/**
 * Set cookie
 *
 * @access	global
 * @param	string	name
 * @param	string	value
 * @param	date	expires
 * @param	string	path
 * @param	string	domain
 * @param	bool	secure
 */
function setCookie(name, value, expires, path, domain, secure)
{
	if (!name || value === undefined) {
		return false;
	}
	var str = name + '=' + encodeURIComponent(value);
	if (expires) {
		str += '; expires=' + expires.toGMTString();
	}
	if (path) {
		str += '; path=' + path;
	}
	if (domain) {
		str += '; domain=' + domain;
	}
	if (secure) {
		str += '; secure';
	}

	document.cookie = str;
	return true;
}

/**
 * Get cookie
 *
 * @access	global
 * @param	string	name
 * @return	string	- cookie value
 *			undefined - if it not exists
 */
function getCookie(name)
{
	var pattern = "(?:; )?" + name + "=([^;]*);?";
	var regexp  = new RegExp(pattern);
	if (regexp.test(document.cookie)) {
		return decodeURIComponent(RegExp["$1"]);
	}

	return undefined;
}

function acceptTos()
{
	$('#acceptTos').bind('click', function(){
		$('#termsAgree').attr('checked', 'checked')
		.parents('td.termsAgree').find('.smallNoFieldMessage').remove();
		pwh.hide();
	});
}

/**
 * Checks is cookies enabled in browser.
 * @access	global
 * @return	Boolean
 */
function isCookiesEnabled()
{
	//if navigator,cookieEnabled supported
	if (undefined != navigator.cookieEnabled) {
		return navigator.cookieEnabled;
	}

	if (undefined == document.cookie)  {
		return false;
	}
	document.cookie = 'testcookie';
	return document.cookie.indexOf('testcookie') > -1;
}

/**
 * Transform field value to moneyFormat after editing.
 */
$.fn.moneyField = function() {
	var field = $(this);

	field.attr('value', moneyFormat(field.attr('value')));
	field.live('blur change', function() {
		field.attr('value', moneyFormat(field.attr('value')));
	});
};

/**
 * Add or remove the value into/from input values, separated by comma
 *
 * @access	global
 * @param	input	object		DOM element or jQuery object
 * @param	value	string		value to add or remove
 * @param	remove	bool		true => remove value, false => add value
 * @return	bool	if new value added or existed value removed, false otherwise
 */
function modifyInputValues(input, value, remove)
{
	remove = remove || false;
	var result = false;
	var values = $.trim($(input).val());
	values = ('' == values) ? [] : values.split(',');
	var index = $.inArray(value, values);
	if (remove && 0 <= index) {
		result = true;
		values.splice($.inArray(value, values), 1);
	}
	else if (!remove && 0 > index) {
		result = true;
		values.push(value);
	}
	$(input).val(values.join(','));
	return result;
}

/**
 * Simple analog of PHP function preg_match_all
 *
 * @access	global
 * @param	string	pattern	The pattern to search for, as a string.
 * @param	string	subject	The input string.
 * @param	array	matches	Array of all matches
 * @return	int	count of matches
 */
function preg_match_all(pattern, subject, matches)
{
	matches = matches || new Array();
	var globalRegex = new RegExp(pattern, 'g');
	var globalMatch = subject.match(globalRegex);
	for (var i in globalMatch) {
		var nonGlobalRegex = new RegExp(pattern);
		var nonGlobalMatch = globalMatch[i].match(nonGlobalRegex);
		matches.push(nonGlobalMatch[1]);
	}
	return matches.length;
}

/**
 * Get correct percent value betwen 0 and 99
 *
 * @access	global
 * @param	string	value
 * @return	Number
 */
function getCorrectPercentValue(value)
{
	value = Number(value);
	if (0 > value || isNaN(value)) {
		value = 0;
	}
	if (100 <= value) {
		value = 99;
	}
	return value;
}

/**
 * Fill price fields in form
 *
 * @access	global
 * @param	object		percent 			- The percent object to from which to consider the price.
 * @param	bool		isCalcOverallPrice	- true if calculate from price to overallPrice and otherwice
 */
function fillPriceFields(percent, isCalcOverallPrice)
{
	if (isCalcOverallPrice) {
		var prices = calculatePrice(priceToFloatFormat($('#price').val()), percent, isCalcOverallPrice);
		$('#overallPrice').val(moneyFormat(String(prices.price)));
	}
	else {
		var prices = calculatePrice(priceToFloatFormat($('#overallPrice').val()), percent, isCalcOverallPrice);
		$('#price').val(moneyFormat(String(prices.price)));
	}
	$('#priceOfService').html(moneyFormat(String(prices.fee.mc2)));
	$('#priceOfEditor').html(moneyFormat(String(prices.fee.editor)));
}

/**
 * Calculate price2overallPrice or overallPrice2price, mc2Fee, editorFee
 *
 * @access	global
 * @param	string		price
 * @param	mixed		percent				- is Object if calculate Cource price or string
 * @param	bool		isCalcOverallPrice	- true if calculate from price to overallPrice and otherwice
 * @return	object
 */
function calculatePrice(price, percent, isCalcOverallPrice)
{
	price = Number(priceToFloatFormat(price));
	var mc2Percent;
	var editorPercent;
	if ($.isPlainObject(percent)) {
		mc2Percent		= Number(percent.mc2);
		editorPercent	= Number(percent.editor);
	}
	else {
		mc2Percent		= Number(percent);
		editorPercent	= Number('0');
	}

	if (99 < (mc2Percent + editorPercent)) {
		return {
			price:0,
			fee:{
				mc2:0,
				editor:0
			}
		};
	}
	if (isNaN(price) || 0 == price) {
		return {
			price:0,
			fee: {
				mc2:0,
				editor:0
			}
		};
	}
	mc2Percent 		= getCorrectPercentValue(mc2Percent);
	editorPercent 	= getCorrectPercentValue(editorPercent);
	price			= Number(price);
	if (isCalcOverallPrice) {
		price			= price / (1 - (mc2Percent + editorPercent) / 100);
		var mc2Fee		= price * (mc2Percent/100);
		var editorFee	= price * (editorPercent/100);
	}
	else {
		var mc2Fee		= price * (mc2Percent / 100);
		var editorFee	= price * (editorPercent / 100);
		price			= price - mc2Fee - editorFee;
	}
	return {
		price:price,
		fee: {
			mc2:mc2Fee,
			editor:editorFee
		}
	};
}

/**
 * Update learning entities counts after delete or move/copy
 *
 * @access	global
 * @return	void
 */
function updateLearningEntitiesCounter()
{
	$.ajax({
		url		: 'learning/ajax/updateLearningEntitiesCounter/' + php.courseVersionId + '/' + php.folder,
		type	: 'POST',
		success	: function(data) {
			if (data.result) {
				$('.switch').replaceWith(data.html);
				if (!empty(data.learningModes)) {
					$('#learningModeFilter option').each(function() {
						var lmId = $(this).val();
						if ('' != lmId && !data.learningModes[lmId]) {
							$(this).remove();
						}
					});
				}
				else {
					$('.learningModeContainer').remove();
				}
			}
		}
	});
}


/**
 * Generate random alfa-numeric hash 11 chars length
 *
 * @access	global
 * @return	string
 */
function generateRandomHash()
{
	return Math.random().toString(36).substring(7);
}

/**
 * Add hash to given url. If hash already set in url, it will be replaced
 *
 * @access	global
 * @param	string	url
 * @param	string	hash
 * @return	string
 */
function addHash(url, hash)
{
	var indexOfSharp = url.indexOf('#');
	if (indexOfSharp > -1) {
		url = url.substring(0, indexOfSharp);
	}
	return url+'#'+hash;
}

// Add missing String.trim() method for IE
if(typeof String.prototype.trim !== 'function') {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, '');
	};
}

/**
 * Callback function before showing  'price' and 'overallPrice' tooltip
 *
 * @param	body
 * @return	string	- calculated tooltip body
 */
function preparePriceTooltip(body)
{
	var percent = php.paymentFee;
	if ('undefined' == typeof(percent)) {
		percent = php.mc2Percent;
	}
	var price			= 1000,
		overallPrice	= (price/(100-parseFloat(percent))*100).toFixed(2),
		priceOfService	= (overallPrice - price).toFixed(2),
		templateData	= {
			'overallPrice'	: overallPrice,
			'priceOfService': priceOfService,
			'paymentFee'	: percent
		};

	return template(body, templateData, '');
}

/**
 * Add ajax tooltip events to element
 *
 * @param	element
 * @return	void
 */
function addAjaxToolTip(element)
{
	$(element).live('click', function(e){
		e.preventDefault();
		})
		.live('mouseenter', function() {
			var url		= $(this).attr('href');
			var elem	= $(this);
			$.ajax({
			type	: 'POST',
			url		: url,
			success	: function(data) {
				pwh.fullScreenLoaderHide();
				if (data.result) {
					tooltipBox.show(elem, data.html);
				}
			}
		});
		})
		.live('mouseleave', function() {
			tooltipBox.hide();
		}
	);
}

/**
 * Append to url the GET parameter with learning mode
 *
 * @param	url
 * @param	courseVersionId
 * @param	learningModeId
 * @returns	string
 */
function appendLearningMode(url, courseVersionId, learningModeId)
{
	if (url && courseVersionId && learningModeId) {
		return url + '?lm[' + courseVersionId + ']=' + learningModeId;
	}
	return '';
}

/**
 * Append js file
 *
 * @param	url
 * @return	void
 */
function addJs(url, callback)
{
	var script	= document.createElement("script");
	script.type	= "text/javascript";
	script.src	= url;

	if ("undefined" != typeof callback) {
		script.onreadystatechange = callback;
		script.onload = callback;
	}
	document.head.appendChild(script);
}

/**
 * Click handler for language selector
 *
 * @param	id
 * @return	void
 */
function flags(id){
	var flags = document.getElementById('flags').style;
	if (flags.display == 'none'){
		flags.display = 'block';}
	else{flags.display = 'none';}
}

/**
 * add simple tooltip to elements
 *
 * @param	string	selector
 * @param	string	message
 * @return	void
 */
function initTooltip(selector, message)
{
	$(selector).unbind('click.tooltip')
		.unbind('mouseover.tooltip')
		.unbind('mouseout.tooltip');

	$(selector).bind('click.tooltip', function(e) {
		e.preventDefault();
	}).bind('mouseover.tooltip', function(e) {
		tooltip.show($(this).prop('id'), message);
	}).bind('mouseout.tooltip', function(e) {
		tooltip.hide(true);
	});
}

/**
 * Wrap code into div with introjs attributes
 *
 * @access	public
 * @param	element		string	Id of element that must be wrapped
 * @param	intro		string	Hint's message
 * @param	step		int		Hint's sequencing number
 * @param	position	string	[optional] Hint's position(top, bottom, left, right)
 * @return	string
 */
 function introjsHelper(element, intro, step, position)
{
	position = position || 'bottom';
	$('#'+element).attr({
	  'data-intro'		: intro,
	  'data-step'		: step,
	  'data-position'	: position
	});
}

/**
 * Set timer before redirect in popup
 *
 * @param	int		time
 * @param	array	options
 * @return	void
 */
function redirectTimer(time, options)
{
	options = $.extend({
		timerId			: '#timerRedirect',
		timerSecondsId	: '#timerRedirectSecond',
		redirectUrl		: php.redirectUrl
	}, options || {});
	if (time > 0) {
		--time;
		$(options['timerId']).text(time);
		$(options['timerSecondsId']).text(' ' + declensionByNumber('секунду,секунды,секунд', time, languageId));
		setTimeout(function() {redirectTimer(time);}, 1000);
	}
	else {
		window.location = options['redirectUrl'];
	}
}

/**
 * Add query parts from array to url
 *
 * @param	string url
 * @param	array data
 * @returns	string
 */
function addQueryPart(url, data)
{
	var ret = [];
	for (var d in data) {
		ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
	}

	if (url.indexOf('?') > 1) {
		return url + '&' + ret.join('&');
	}
	else {
		return url + '?' + ret.join('&');
	}
}

/**
 * Site URL
 * Create full URL based on URI
 *
 * @param	string	uri
 * @return	string	URL
 */
function site_url(uri)
{
	uri = uri || '';
	return baseUrl + $.trim(uri);
}

/**
 * Create URL based on static file path
 *
 * @param	string	path	path to file
 * @param	bool	isTpl	if true, file will be processed as template
 * @return	string	URL
 */
function static_url(path, isTpl)
{
	path	= path || '';
	isTpl	= isTpl || true;
	return (isTpl ? staticTplUrl : staticUrl) + $.trim(path);
}

/**
 * Verify max mark for current learning mode
 *
 * @returns	void
 */
function verifyMaxMark()
{
	$('#learningModeId').live('change', function(){
		$.ajax({
			url: '/courses/ajax/max_mark/'+php.courseVersionId+'/'+$(this).val()
		}).done(function(data){
				var block = $('.maxMark_');
				block.html(block.html().replace(/\d+/, data.maxMark));
				if (data.maxMark == php.courseMaxMark) {
					block.addClass('red');
				}
				else {
					block.removeClass('red');
				}
			});
	});
	validator.removeSingleError('maxMark');
}

/**
 * Ajax request
 *
 * @returns	void
 */
function simpleAjaxPopup(e)
{
	e.preventDefault();
	pwh.hide('all');
	pwh.fullScreenLoaderShow();
	$.ajax({
		url: $(e.currentTarget).attr('href'),
		type: 'get',
		success: function(data,status) {
			serverResponseProcessing(data,status,$(e.target).data("popupOptions"));
			initHandlers('#popupContainer .popupBody');
			if(e.data) {
				if('function'==typeof(e.data.success)) {
					e.data.success();
				}
			}
		}
	});
}

function simpleAjaxPopupEditor(e) {
	e.preventDefault();
	pwh.fullScreenLoaderShow();

	var eData={},mceData=false;
	if(e.data!==undefined && e.data!==null) {
		eData=e.data;
		mceData=(eData.mceData===undefined) ? eData : eData.mceData;
	}

	$.ajax({
		url: $(e.currentTarget).attr('href'),
		type: 'get',
		success: function(data,status) {
			serverResponseProcessing(data,status, {
				flow			: false,
				closeBtnEvent	: function (eventClose) {
					$('#popupContainer textarea').each(function(i, e) {
						tinyMCE.execCommand('mceRemoveControl', false, tinyMCE.get($(e).attr('id')));
					});
					$('#popupContainer').children().remove();
					if('function'==typeof(eData.closePopup)) {
						eData.closePopup();
					}
				}
			});
			initHandlers('#popupContainer .popupBody');
			if(mceData) {
				initTinyMCE(mceData);
			}
		}
	});
}

/* Multi autocomplete */
function addFilterItem(event, id, label, data) {
	var filterName = $(event.target).attr('id');
	if (data.studentId) {
            $('#'+filterName+'_input').append('<span>'+label+' <input type="hidden" name="'+filterName+'[]" value="'+data.studentId+'" /> <a class="cancelIco ico" rel="'+data.studentId+'" href="javascript:void(0);" title="Удалить">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a></span>');
            $('.multi-ac-'+filterName+' .multi-ac-clear-all').show();
	} else if(!$('#'+filterName+'_input a[rel='+id+']').length) {
            $('#'+filterName+'_input').append('<span>'+label+' <input type="hidden" name="'+filterName+'[]" value="'+id+'" /> <a class="cancelIco ico" rel="'+id+'" href="javascript:void(0);" title="Удалить">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a></span>');
            $('.multi-ac-'+filterName+' .multi-ac-clear-all').show();
	}
	$('#'+filterName+'_input').trigger('appendInput');
	$(event.target).val('');
}

/* Single text field autocomplete */
function replaceFilterItem(event, id, label) {
	var filterName = $(event.target).attr('id');

	if(!$('#'+filterName+'_input a[rel='+id+']').length) {
		$('#'+filterName+'_input').html('');
		$('#'+filterName+'_input').append('<span>'+label+' <input type="hidden" name="'+filterName+'" value="'+id+'" /> <a class="cancelIco ico" rel="'+id+'" href="javascript:void(0);" title="Удалить">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a></span>');
		$('.multi-ac-'+filterName+' .multi-ac-clear-all').show();
	}
	$(event.target).val('');
}

$('.multi-ac-values span > a').live('click', function() {
	var p = $(this).parents('.multi-ac');
	$(this).parent().remove();

	if(p.find('.multi-ac-values').html() == '') {
		p.find('.multi-ac-clear-all').hide();
	}

});

$('.multi-ac-clear-all').live('click', function() {
	if(confirm('Удалить выбранные значения?')) {
		$(this).hide().parents('div.multi-ac').find('.multi-ac-values').html('');
	}
});

function initTableOptions(options) {
	$('.table-options thead th:last').prepend('<div><i><div class="mnu-layout"></div></i></div>').find('i').css({'margin-left': ($('.table-options thead th:last').width() - $('.table-options thead th:last > div > i').width())+'px'});
	for(var i in options) {
		var icon = typeof(options[i].icon) == 'undefined' ? '' : options[i].icon;
		$('.table-options .mnu-layout').append('<a href="'+options[i].link+'"><i class="icon '+icon+'"><i></i></i>'+options[i].title+'</a>');
	}
}

/**
 * Проброс студента
 */
function forwardStudent(studentId) {

	$('.js-forward-ico').hide();
	$('.js-forward-spin').show();

	$.ajax({
		dataType: "JSON",
		url: site_url('superdean/student/forwardstudent/' + studentId),
		type:'GET',

		success: function(data) {

			if (data.result) {
				var message = 'Не удалось пробросить студента!';
				if (data.result == 'ok') {
					message = 'Проброс студента успешно запущен!';
				} else if (data.result == 'notfound') {
					message = 'Данные текущего студента не найдены!';
				}

				pwh.alert({titleDialog: 'Проброс студента', message: message});
			}

			$('.js-forward-ico').show();
			$('.js-forward-spin').hide();
		}
	});
	return false;
}

/**
 * Проброс учебного плана
 */
function forwardUp(upId) {

	$('.js-forward-ico-c').hide();
	$('.js-forward-spin-c').show();

	$.ajax({
		dataType: "JSON",
		url: site_url('superdean/student/forwardup/' + upId),
		type:'GET',

		success: function(data) {

			if (data.result) {
				var message = 'Не удалось пробросить учебный план!';
				if (data.result == 'ok') {
					message = 'Проброс учебного плана успешно запущен!';
				} else if (data.result == 'notfound') {
					message = 'Данные текущего учебного плана не найдены!';
				}

				pwh.alert({titleDialog: 'Проброс учебного плана', message: message});
			}

			$('.js-forward-ico-c').show();
			$('.js-forward-spin-c').hide();
		}
	});
	return false;
}

/**
 * Проброс группы
 */
function getUpByGroup(studentId) {

	$('.js-forward-ico-b').hide();
	$('.js-forward-spin-b').show();

	$.ajax({
		dataType: "JSON",
		url: site_url('superdean/student/getupbygroup/' + studentId),
		type:'GET',

		success: function(data) {

			if (data.result) {
				var message = 'Не удалось пробросить группу!';
				if (data.result == 'ok') {
					message = 'Проброс группы успешно запущен!';
				} else if (data.result == 'notfound') {
					message = 'Данные текущей группы не найдены!';
				}

				pwh.alert({titleDialog: 'Проброс группы', message: message});
			}

			$('.js-forward-ico-b').show();
			$('.js-forward-spin-b').hide();
		}
	});
	return false;
}

/*
* Перезагрузка оценок
* */
function forwardMarks(studentId) {

	$('.js-forward-ico-g').hide();
	$('.js-forward-spin-g').show();

	$.ajax({
		dataType: "JSON",
		url: site_url('superdean/student/forwardmarks/' + studentId),
		type:'GET',

		success: function(data) {

			if (data.result) {
				var message = 'Не удалось перезагрузить оценки!';
				if (data.result == 'ok') {
					message = 'Оценки проброшены!';
				} else if (data.result == 'notfound') {
					message = 'Оценки не найдены!';
				}

				pwh.alert({titleDialog: 'Проброс оценок', message: message});
			}

			$('.js-forward-ico-g').show();
			$('.js-forward-spin-g').hide();
		}
	});
	return false;
}

/*
* Перезагрузка финбаланса
* */
function rewriteFinbalance(studentId) {

	$('.js-forward-ico-d').hide();
	$('.js-forward-spin-d').show();

	$.ajax({
		dataType: "JSON",
		url: site_url('superdean/student/rewritefinbalance/' + studentId),
		type:'GET',

		success: function(data) {

			if (data.result.code) {
				var message = 'Не удалось перезагрузить финбаланс!';
				if (data.result.code == 200) {
					message = 'Финбаланс проброшен!';
				} else if (data.result.code != 200) {
					message = 'Финбаланс не найден!';
				}

				pwh.alert({titleDialog: 'Проброс финбаланса', message: message});
			}

			$('.js-forward-ico-d').show();
			$('.js-forward-spin-d').hide();
		}
	});
	return false;
}


function generate_user_greeting() {
    var now = new Date();
    var hours = now.getHours();
    var greeting_text = '';
    var lang = $('#user-lang .drop-menu-label span.title').text().trim();
    
    if (hours >= 3 && hours < 12) {
		greeting_text = 'Доброе утро';
    }
    if (hours >= 12 && hours < 18) {
		greeting_text = 'Добрый день';
   }
    if (hours >= 18 && hours < 24) {
		greeting_text = 'Добрый вечер';
    }
    if (hours >= 0 && hours < 3) {
		greeting_text = 'Доброй ночи';
    }
    $('#user-greeting-text').text(greeting_text);
    $('#user-greeting').show();
}