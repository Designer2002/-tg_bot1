var treeListSelected = {};

$(document).ready(function()
{
	initControls();
	setTimeout(function(){afterCreateElement()},2000)
	
	if($('.tree-list-wrap').length > 0) {
		initTreeListControl();
	}
})

function initControls()
{
	var formFieldArea = $('.formFieldArea');
	$.each(formFieldArea, function() {
		var field		= $(this).find('.formFieldBox');
		var tempW		= field.innerWidth();
		var resW		= 0;
		var leftElement	= $(this).find('.formFieldLeft');
		if ((0 != tempW) && (!field.hasClass('afterResize')) && $(this).is(":visible")) {
			if (leftElement.length > 0) {
				resW = tempW - $(this).find('.formFieldLeft').width()-10;
				field.width(resW);
				$(this).find('.formFieldTop').css('padding-left', leftElement.innerWidth()+7+'px')
				field.css('margin-left', '2px');
			}
			if ($(this).find('.formFieldRight').length > 0) {
				resW = tempW - $(this).find('.formFieldRight').width()-140;
				field.width(resW);
			}
			if (field.closest('.formFieldArea').hasClass('selectInput')) {
				if(0 < resW) {
					field.find('select').width(resW-2)
				}
				else {
					var topLabel = field.closest('.formFieldArea').find('.formFieldTop');
					if (topLabel.length > 0) {
						var selectW = topLabel.innerWidth() - Number(topLabel.css('padding-left').replace('px','')) - Number(topLabel.css('padding-right').replace('px',''))-2;
						field.find('select').css('min-width', selectW);
					}
				}
			}

			field.addClass('afterResize');
		}
	})
//	Fix width for hidden controlSelect.
//	selectStyle();
	formFieldGroup();
	initAction(); // init action for MC2 forms elemets
}

function formFieldGroup() {
	var clear = '<div class="clear">&nbsp;</div>'
	var formFieldAreaGroupArray = $('.formFieldAreaGroup');
	var countInGroup = 1;
	$.each(formFieldAreaGroupArray,function(i){
		var groupClass = formFieldAreaGroupArray.eq(i).find('.groupIndex').attr('title');
		if ((formFieldAreaGroupArray.eq(i+1).find('.groupIndex').attr('title') == groupClass)){
			countInGroup++;
		}
		else {
			var tmpWidthItem = $(this).find('.formFieldBox').width()/countInGroup;
			var tmpWidthItemLabel = 0;
			$.each($('.formFieldAreaGroup .groupIndex[title="'+groupClass+'"]'),function(){
				tmpWidthItemLabel = $(this).closest('.formFieldArea').find('.formFieldLeft').width() + $(this).closest('.formFieldArea').find('.formFieldRight').width()-83;
				$(this).closest('.formFieldArea').find('.formFieldBox')
						.width(tmpWidthItem-tmpWidthItemLabel)
						.parents('.formFieldAreaGroup')
						.css('float','left');
			})
			countInGroup = 1;
			$(this).after(clear);
		}
	})
}

function initAction()
{
	// cleanInput
	$('.cleanInput .cleanInputButton:not(.initialised), .autoCompleteInput .cleanInputButton:not(.initialised)').each(function(){
		$(this).addClass('initialised');
		$(this).bind('click',function(e){
			e.preventDefault();
			$(this).next().attr('value', '');
		})
	})
	
	// autocomplete control
	$('.autoCompleteInput input:not(.initialised)').each(function(index, element) {
		$(this).addClass('initialised');
		$(this).attr('autocomplete', 'off');
		if ($(this).hasClass('defaultValue')) {
			$(this).prop('rel', $(this).val());
		}
		$(this).focusin(function() {
			if ($(this).hasClass('defaultValue')) {
				$(this).val('');
				$(this).removeClass('defaultValue')
			}
		})
		$(this).focusout(function() {
			if ($(this).val() == '') {
				$(this).val($(this).prop('rel'));
				$(this).addClass('defaultValue')
			}
		})
		if ($(this).closest('.autoCompleteInput').hasClass('autoCompleteHasButton')) {
			var btn = $(this).closest('.autoCompleteInput').find('.bt');
			var inputContainer = $(this).closest('.autoCompleteInput').find('.formFieldBox');
			inputContainer.width(inputContainer.width()-btn.innerWidth()-10);
			btn.css({right:'-'+Number(btn.innerWidth()+10)+'px'});
		}
	});
	
	// date interval control
	$.each($('.mc2ControlsCalendar:not(.initialised)'), function(index, element){
		$(this).addClass('initialised');
		datepickerInit($(element).prop('rel'), $(element).prop('id'));
	});
	// date and time interval control
	if (0 < $('.intervalDateTime input[id^=intervalStartDate]:not(.initialised)').length) {
		// include additional scripts
		addJs(staticTplUrl+'js/lib/phpDateFormat.js', function() {
			addJs(staticTplUrl+'js/controls/interval_time.js')
		});
		// init calendar
		var now = $.datepicker.formatDate("dd.mm.yy", new Date());
		$('.intervalDateTime input[id^=intervalStartDate]:not(.initialised)').each(function(index, element) {
			$(this).addClass('initialised');
			datepickerInit($(element).prop('id'), $(element).prop('id'), {'minDate': now, 'onSelect': function() {$(element).change();}});
		});
	}
}


function selectStyle() 
{
	var select = $('.formFieldArea select');
	$.each(select,function(){
		parW = $(this).parent().width();
		$(this).width(parW)
	})
}

function afterCreateElement()
{
	$('.disableBt').each(function(i){
		disableBtn($(this).prop('id'));
	})
	
	$('.mceEditor').each(function(i){
		$(this).closest('.textareaInput').addClass('mceEditorArea');
		setTimeout(function() {
			$(document).trigger('textareaInputTrigger');
		}, 500)
	})
	$('.tagix').each(function(i){
		$(this).closest('.textInput').addClass('tagixArea');
	})
}

// Контрол управления tree-list
function initTreeListControl() {
	
	$('.tree-list-close').on('click', function() { treeListCancel(this) });
	$('.tree-list-open').on('click', function() { $(this).closest('.tree-list-wrap').find('.tree-list-select').show(); });
	$('.tree-list-content > ul > li ul').hide();
	$('.tree-list-content li:has(ul) > div > .tree-list-plusminus').addClass('plus').siblings('span').addClass('plus');
	$('.tree-list-content li:has(ul)').addClass('tree-list-group');
	$('.tree-list-plusminus.plus').on('click', function() {
		var self = $(this);
		self.closest('li').find('ul').first().show();
		self.closest('li').find('.tree-list-plusminus').first().removeClass('plus').addClass('minus'); 
	});
	$('.tree-list-plusminus.minus').on('click', function() {
		var self = $(this);
		self.closest('li').find('ul').first().hide();
		self.closest('li').find('.tree-list-plusminus').first().removeClass('minus').addClass('plus'); 
	});

	$('.tree-list-content span.plus').on('click', function() {
		var self = $(this);
		if($(this).closest('li').find('.tree-list-plusminus').first().hasClass('plus')) {
			self.closest('li').find('ul').first().show();
			self.closest('li').find('.tree-list-plusminus').first().removeClass('plus').addClass('minus'); 
		} else {
			self.closest('li').find('ul').first().hide();
			self.closest('li').find('.tree-list-plusminus').first().removeClass('minus').addClass('plus'); 
		}
	});
	
	$(".tree-list-select").each(function(idx) {
		var name = $('.tree-list-select:eq('+idx+')').closest('.tree-list-wrap').attr('name');
		var ids = [];
		$('.tree-list-wrap[name='+name+'] .tree-list-content input[type=checkbox]').each(function(idx) {
			var self = $('.tree-list-wrap[name='+name+'] .tree-list-content input[type=checkbox]:eq('+idx+')');
			if(self.prop('checked')) {
				ids.push(self.attr('id').replace(/id/, ''));
			}
		});
		treeListSelected[name] = ids;
	});
	
	// Удаление значения из списка 
	initDeleteActionButton();

	// Закрытие по клику вне области выбора
	$(document).mouseup(function (e) {
	    var container = $(".tree-list-select:visible");
	    if (!container.is(e.target) && container.has(e.target).length === 0)  {
	    	treeListCancel(container);
	    }
	});
}

function initDeleteActionButton() {
	$('.tree-list-values span a').on('click', function() {
		var name = $(this).closest('.tree-list-wrap').attr('name');
		var id = $(this).attr('rel');
		$('.tree-list-wrap[name='+name+'] .tree-list-content input#id'+id).prop('checked', false);
		$(this).parent().remove();
		for(var i in treeListSelected[name]) {
			if(treeListSelected[name][i] == id) {
				delete treeListSelected[name][i];
			}
		}
	});
}

function treeListSuccess(obj) {
	$(obj).closest('.tree-list-select').hide();
	var name = $(obj).closest('.tree-list-wrap').attr('name');
	var idField = $(obj).closest('.tree-list-wrap').attr('rel');
	var ids = [];
	var valuesText = [];
	$('.tree-list-wrap[name='+name+'] .tree-list-content input[type=checkbox]').each(function(idx) {
		var self = $('.tree-list-wrap[name='+name+'] .tree-list-content input[type=checkbox]:eq('+idx+')');
		if(self.prop('checked')) {
			var id = self.attr('id').replace(/id/, '');
			var html = '<span>'+self.parent().siblings('div:has(span)').find('span').html()+' <a class="cancelIco ico" rel="'+id+'" href="javascript:void(0);" title="Удалить">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a></span>';
			ids.push(id);
			valuesText.push(html);
		}
	});
	treeListSelected[name] = ids;
	$(obj).closest('.tree-list-wrap').find('.tree-list-values').html(valuesText.join(' '));
	initDeleteActionButton();
}

function treeListCancel(obj) {
	var name = $(obj).closest('.tree-list-wrap').attr('name');
	if($(obj).closest('.tree-list-select').is(':visible')) {
		$(obj).closest('.tree-list-select').hide();
		if(typeof(treeListSelected[name]) != 'undefined') {
			ids = ','+treeListSelected[name].join(',')+',';
			$('.tree-list-wrap[name='+name+'] .tree-list-content input[type=checkbox]').each(function(idx) {
				var self = $('.tree-list-wrap[name='+name+'] .tree-list-content input[type=checkbox]:eq('+idx+')');
				if (ids.indexOf(','+self.attr('value')+',')<0) {
					self.prop('checked', false);
				}
			});
		}
	}
}