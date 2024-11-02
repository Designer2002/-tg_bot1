/* Inits */
$(function() {
	initHandlers();
});



/* Functions */

function initHandlers($scope){
	// Templates
	var $tpl = {};

	$tpl.multipleDropSelectItem = function($drop_menu, title, val, that){
		var $item = $('[data-tpl="' + $drop_menu.data('use-tpl') + '"]').clone().removeAttr('data-tpl').removeClass('hidden');
		$(that).addClass('hidden');
		$('span.title', $item).text(title);
		$('input', $item).val(val);
		$drop_menu.after($item);
		initHandlers($item);
	}

	// Handlers
	$('[data-handler]', $scope).map(function(){
		var handlers = eval('[' + this.getAttribute('data-handler') + ']');

		for(var i in handlers) {
			var
				_obj = this,
				_event = handlers[i].event || 'click', // Если свойство event не указано, по молчанию - click
				_action = handlers[i].action,
				_target = handlers[i].target || this.hash || this // Если свойство target не указано, по молчанию - хэш ссылки (id элемента) или this
			;

			(function(_obj, _event, _action, _target){
				$(_obj).bind(_event, function(e){
					var $target = $(_target);

					switch (_action) {

						case 'show':
							//$target.show();
							$target.removeClass('hidden');
							break;


						case 'hide':
							//$target.hide();
							$target.addClass('hidden');
							break;


						case 'toggle':
							//$target.toggle();
							$target.toggleClass('hidden');
							break;


						case 'toggle-active':
							$target.toggleClass('active');
							break;


						case 'set-tab-active':
							$(this).parent()
								.siblings().removeClass('active').end()
								.addClass('active')
							;
							break;


						case 'toggle-drop-menu':
							if ($(this).is('.disabled')) return;
							
							$('div.drop-menu.dropped').not(this).trigger('mouseleave');
							$(this).toggleClass('dropped');

							$(this).on('mouseleave', function(){
									$(this).removeClass('dropped').off('mouseleave');
								})

							return;
							break;


						case 'set-value-drop-select':
							var that = e.target;

							if (!$(that).is('li') && e.type != 'load') break;

							var $drop_menu = $(that).closest('div.drop-menu');

							if(!$drop_menu[0].style.minWidth) $drop_menu[0].style.minWidth = $drop_menu.width() + 'px'; // Если min-width не указан, фиксируем текущую ширину контейнера

							if(!$target.is('input')) $target = $('input', $drop_menu); // Если target не указан (this), ищем дочерний input

							if($drop_menu.attr('data-multiple')!==undefined) { // Если указан множественный выбор, устанавливаем несколько значений
								var
									val = that.getAttribute('data-value') || '',
									title = $(that).text(),
									vals = $target.val(),
									arr = []
								;
								if(vals != '') arr = $.unique(vals.split(','));

								if (val && $.inArray(val, arr) == -1) {
									arr.push(val);
									vals = arr.join(',').replace(/^,+|,+$/g, '');

									$target.val(vals).trigger('change');

									$tpl.multipleDropSelectItem($drop_menu, title, val, that);
								}

								if (e.type == 'load' && arr.length) {
									for(var item in arr) {
										var $item = $('li[data-value="' + arr[item] + '"]', $drop_menu);
										title = $item.text();
										val = $item.data('value');
										$tpl.multipleDropSelectItem($drop_menu, title, val, $item[0]);
									}
								}

							}
							else { // Иначе устанавливаем единственное значение
								$('span.title', $drop_menu).text(that.innerHTML);
								$target.val(that.getAttribute('data-value') || that.innerHTML).attr('data-title', that.innerHTML).trigger('change');
							}
							break;


						case 'remove-value-drop-select':
							var
								$drop_menu = $target.closest('div.drop-menu'),
								$item = $(this).closest('div.drop-menu'),
								val = $('input', $item).val(),
								vals = $target.val(),
								arr = vals.split(',')
							;

							arr.splice($.inArray(val, arr), 1);
							vals = arr.join(',');

							$target.val(vals).trigger('change');
							$item.remove();

							$('li[data-value="' + val + '"]', $drop_menu).removeClass('hidden');

							break;


						case 'show-bubble':
							if (!$target.length) break;

							var
								$this = $(this),
								/*x = e.clientX,
								y = $(window).scrollTop() + e.clientY,*/
								x = $this.width() + $this.offset().left,
								y = $this.offset().top,
								delta = $target.outerHeight() - $this.outerHeight(),
								$bubble = $target.clone(true),
								bubble = $bubble[0]
							;

							if(delta > 0) {
								y -= delta/2;
							}
							else {
								y += $target.height()/2;
							}

							bubble.style.left = x + 'px';
							bubble.style.top = y + 'px';

							$target.remove();
							$('body').append($bubble);
							$('.bubble').addClass('hidden');
							$bubble.removeClass('hidden');
							return false;
							break;


						case 'hide-bubble':
 							$('.bubble').addClass('hidden');
							break;


						case 'toggle-checkbox':
							$target.prop('checked', this.checked);
							break;


						case 'toggle-disabled':
							var checked = this.checked;

							$target.toggleClass(function(){
								$('input, a', $target).prop('disabled', !checked);
								return('disabled');
							});
							break;

					}

					if($(e.target).is('a') || $(e.target).closest('a').length) { // Если ни один метод для ссылки или внутри неё не сработал, глушим клик
						e.preventDefault();
					}
				});

				if( /load/.test(_event) ) {
					$(_obj).trigger('load');
				}

			})(_obj, _event, _action, _target);
		}
	});

	$(document).on('click', function() {
		if($(this).is('[data-handler]') == false || $(this).closest('[data-handler]').length == 0) {
			$('.bubble:not(.bubble-fixed)').addClass('hidden');
		}
	});

}

// jQuery extends
(function($){
	var _old = $.unique;

	$.unique = function(arr){
		if (!!arr[0].nodeType){
			return _old.apply(this,arguments);
		} else {
			return $.grep(arr,function(v,k){
				return $.inArray(v,arr) === k;
			});
		}
	};
})(jQuery);
