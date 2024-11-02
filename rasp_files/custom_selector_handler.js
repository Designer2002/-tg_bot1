(function( $ ) {
	var settings = {
		'selector'        : '.selector',
		'delayedDisapear' : 0,
		'update'		  : false
	};
	
	var methods = {
	init : function() {
		var items = this;
		var index = 300;
		items.addClass('preload');
		$.each(items, function(){
			var $this = $(this);
			if (methods.checkVisible($this)) {
				methods.setWidth($this);
			}
			else {
				$this.addClass('not-visible');
			}
			
			//is variable || privacy 
			methods.isVariable($this)
			
			//layout position
			$this.attr('style', 'z-index:'+index);
			index--;
		})
		
		return methods.afterInit();
	},
	
	checkVisible : function($this) {
		if ($this.is(':visible')) { 
			return true;
		}
		else {
			return false;
		}
	},
	
	setWidth : function($this) {
		var head  = $this.find('.selectHeader');
		var body  = $this.find('.selectorBody');
		var headW = head.innerWidth();
		var bodyW = body.innerWidth();

		if (0 < head.find('.button').length) {
			headW += 2;
			bodyW += 2;
		}
		$this.find('li:has(.count)').css('padding-right','30px');


		if ($this.hasClass('resizeHeader')) {
			if (headW > bodyW) {
				body.width(headW)
			}
			else {
				head.width(bodyW)
			}
		}
		if ($this.hasClass('hasColums')) {
			var ulsW = 15;
			$.each(body.find('ul'),function() {
				ulsW += $(this).innerWidth();
			});
			body.css('min-width', ulsW+'px');
		}

		var rLimit	= ($('div.content').offset().left+$('div.content').width())-30;
		var elemPos	= ($this.offset().left)+($this.width());
		if (elemPos > rLimit) {
			$this.addClass('showLeft');
		}

		methods.afterInitElement($this);
	}, 
	
	watch : function() {
		(function() {
			var items = $(settings.selector+".not-visible");
			var newItem = $(settings.selector+":not(.inited)");
			items = $.merge( items, newItem )
			if (0 < items.length) {
				items.addClass('preload');
				$.each(items, function() {
					if (methods.checkVisible($(this))) {
						methods.setWidth($(this))
						$(this).removeClass('not-visible');
						
						//is variable || privacy 
						methods.isVariable($(this))
					}
				})
				setTimeout(arguments.callee, 1000);
			}
		})();
	}, 
	
	afterInit : function() {
		$(settings.selector).on('selectorCompleted', function() {
			methods.watch();
		}) 
		methods.watch();
	},
	
	afterInitElement : function($this) {
		$this.removeClass('preload')
		methods.addEvent($this);
	},
	
	addEvent : function($this) {
		if (!$this.hasClass('inited')) {
			if (!settings.update) {
				// click
				$this.find(".selectHeader").on('click', function() {
					$('body').off('click');
					methods.toggle($this);
				});

				//hover
				$this.on("mouseenter", function() {
					$this.addClass('hover');
				});
				$this.on("mouseleave", function() {
					$this.removeClass('hover');
				});
				
				if ($this.parents(".dataTable").length != 0) {
					$this.on("mouseenter", function() {
						methods.hideAll();
						settings.delayedDisapear = 800;
						methods.toggle($this);
					});
					$this.on("mouseleave", function() {
						methods.toggle($this);
						settings.delayedDisapear = 0;
					});
				}
			
				//variable header
				if (methods.isVariable($this)) {
					methods.variableClick($this.find('ul li a'))
		
					//change event
					$this.on('selectorChangeStatus', function(e, varClick) {
						var li		 = varClick[0]
						var value	 = varClick[1]
						var lis		 = $this.find('ul li');
						
						lis.removeClass('itemHidden');
						li.addClass('itemHidden');
						$this.find('.gdTitle, .selCenter .link').html(value);
						
						if ($this.hasClass('privacy')) {
							checkWidth($this, value);
						}
					})
				}
				
				$this.find('.selectorBody li').on('click', function() {
					methods.toggle($this, true);
				})
			}
			
			settings.update = false;
			$this.addClass('inited');
		}
	},
	
	variableClick : function($this) {
		$this.on('click', function(event) {
			$this.trigger('selectorChangeStatus', [[$(this).closest('li'), $(this).html()]]);
			event.preventDefault();
		})
	},
	
	
	isVariable : function($this) {
		if ($this.hasClass('variable') || $this.hasClass('privacy')) {
			var lis = $this.find('ul li');
			var headTitle = $this.find('.gdTitle, .selCenter .link').html();
			
			//hide selected element
			lis.each(function(i, n) {
				if (headTitle == $(this).find('a').html()) {
					$this.find('.gdTitle, .selCenter .link').html(headTitle)
					$(this).addClass('itemHidden');
					if (0 == i) {lis.eq(1).addClass('firstItem')}
					else {lis.removeClass('firstItem')}
				}
			})
			return true
		}
		return false;
	}, 
	
	toggle : function($this, forcibly) { 
		var body = $this.find('.selectorBody');
		
		if (!$this.hasClass('open')) {
			methods.hideAll($this);
			body.show('fast', function() {
				$this.addClass('open');
				$('body').on('click',function() {
					methods.hideAll();
				});
			});
		}
		else {
			setTimeout(function() {
				if ( methods.checkHover(body) || forcibly ) {
					body.hide('fast', function() {
						$this.removeClass('open');
					});
				}
			}, settings.delayedDisapear)
		}
	},
	
	hideAll : function(onElement) {
		$(settings.selector+' .selectorBody').each(function(i, item) {
			if ( !methods.checkHover(item)) { 
				$(item).hide('fast', function() {
					$(settings.selector).removeClass('open');
				});
			}
		})
	},
	
	checkHover : function(item) {
		if($(item).closest('.selector').hasClass('hover') ){
			return true;
		} else {
			return false;
		}
	},
	
	destroy : function() {
		this.remove();
	},
	
	ins : function(insertItem) { 
		var ul = this.find('ul');
		ul.append(insertItem);
		methods.variableClick(ul.find('li:last a'));
		methods.update($(this));
	},
	
	del : function(deleteItem) { 
		deleteItem.closest('li').remove();
		methods.update($(this));
	},
	
	reset : function(defItem) {
		var $this = this;
		var result; 
		if (typeof defItem == "undefined") {
			$this.find('ul li').removeClass('itemHidden');
			$this.find('ul li:first').addClass('itemHidden');
			result = $this.find('ul li:first a').html();
		}
		else {
			$this.find('ul li').removeClass('itemHidden');
			$.each($this.find('ul li'), function(i, li) {
				if (defItem == $(li).find('a').html()) {
					result = $(li).find('a').html();
					$(li).addClass('itemHidden');
				}
			})
		}
		$this.find('.gdTitle, .selCenter .link').html(result);
	},
	
	update : function($this) { 
		settings.update = true;
		$this.addClass('preload').removeClass('inited');
		$this.find('.selectHeader').attr('style', '');
		methods.watch($this);
	}
	
};

$.fn.dropdown = function( method ) {
	if ( methods[method] ) {
	  return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
	} else if ( typeof method === 'object' || ! method ) {
	  return methods.init.apply( this, arguments );
	} else {
	  $.error( 'Метод с именем ' +  method + ' не существует для jQuery.tooltip' );
	}    
};

})( jQuery );
