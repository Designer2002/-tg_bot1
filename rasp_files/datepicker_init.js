/*
 * Initialize jQuery datepicker on page.
 *
 * @access	global
 * @param	string	inputFieldId
 * @param	string	triggerId
 * @param	object	options - jQuery UI datepicker settings
 * @return	void
 */
function datepickerInit(inputFieldId, triggerId, options) {
	var defaultSettings = {
		// Default settings.
		autoOpen: false,
		constrainInput	: true,
		showButtonPanel	: true,
		currentText		: 'Сегодня',
		closeText		: 'Готово',
		prevText		: '',
		nextText		: '',
		showAnim		: 'fade',
		changeYear		: true,
		changeMonth		: true,
		firstDay		: parseInt('1'),
		dateFormat		: "dd.mm.yy",
		monthNamesShort	: [
			"январь",
			"февраль",
			"март",
			"апрель",
			"май",
			"июнь",
			"июль",
			"август",
			"сентябрь",
			"октябрь",
			"ноябрь",
			"декабрь"
		],
		dayNames		: [
			"воскресенье",
			"понедельник",
			"вторник",
			"среда",
			"четверг",
			"пятница",
			"суббота",
			"воскресенье"
		],
		dayNamesMin		: [
			"вск",
			"пон",
			"втр",
			"срд",
			"чет",
			"пят",
			"суб",
			"вск"
		],
		// Set container for using multiple jQuery UI themes.
		beforeShow		: function(input, inst) {
			$(inst.dpDiv).addClass('calendar');
		},
		onClose			: function(dateText, inst) {
			$(inst.dpDiv).removeClass('calendar');
		}
	};

	// Merge defaultSettings with options.
	var settingsObj = $.extend(defaultSettings, options);

	// Create new calendar.
	$("#"+inputFieldId).datepicker(settingsObj);
	// Add trigger event.
	if (triggerId !='') {
		$('#'+triggerId).on('click', function(e) {
			e.preventDefault();
			$("#"+inputFieldId).datepicker("show");
		});
	}
}