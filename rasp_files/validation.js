// validation object - start
var validator = {};

/**
 * constructor
 *
 */
validator.initValidator = function(forced)
{
	forced = forced || false;

	validator.settings = {
		'settingsUrl'			: 'validation/get_form_settings',
		'validateByRuleIdUrl'	: 'validation/validate_by_rule_id',
		'captchaUrl'			: 'validation/captcha',
		'checkAccessUrl'		: 'validation/check_access',
		'errorClasses'			: {
			'largeWithField'	: {
				'message' : 'largeWithFieldMessage',
				'control' : 'largeWithFieldControl'
			},
			'tooltipUnderField'	: {
				'message' : 'largeTooltipMessage'
			},
			'smallNoField' : {
				'message' : 'smallNoFieldMessage'
			},
			'smallNoFieldOne'	: {
				'message' : 'smallNoFieldMessage'
			},
			'noField'			: {
				'message' : 'commonError'
			},
			'noFieldMultiple'	: {
				'message' : 'commonError'
			},
			'beforeField'		: {
				'message' : 'commonError'
			}
		},
		'defaultLoaderId'		: 'ajaxload',
		'fadeBoxMessageTypes'	: {
			'ok'	: {
				'title'	: 'Изменения были успешно сохранены.',
				'body'	: ' '
			},
			'error'	: {
				'title'	: 'ОШИБКА!',
				'body'	: 'Во время сохранения изменений произошла ошибка. Попробуйте сохранить повторно.'
			}
		},
		'ignoreValidationClass'	: 'noValidate',		// class attribute for form element to prevent validation
		'requiredFieldMark'		: '<span class="requiredMark">*</span>',
		'controlConfirmTexts'	: {
			'title'	: 'Подтверждение отправки формы.',
			'body'	: 'Вы уверены, что хотите сохранить изменения?'
		}
	};

	if (forced || !validator.validationRules) {
		validator.validationRules = {};
	}

	validator.apiMode				= ('undefined' != typeof(apiMode) && apiMode);
	validator.initialValues			= {};
	validator.data					= {};
	validator.formSubmition			= false;
	validator.noticeFormIds			= [];
	validator.validationErrors		= {};
	validator.focus					= {};
	validator.closeWarningMessage	= "Данные, которые вы ввели будут потеряны.";
	validator.getValidationRules();
	validator.addSubmitEvents();
	validator.initControlDefaults();
	validator.createInitialFormState();
	validator.submitingForms		= [];
	validator.isDraft				= 0;
	// custom error code depending on validation error
	validator.errorCode				= '';
	// custom error message depending on validation error
	validator.customErrorMessage	= '';

	window.onbeforeunload = validator.closeWarning;
}

/**
 * Set submiting flag to 1
 * @param string formId
 */
validator.setSubmitingFlag = function(formId)
{
	validator.submitingForms[formId] = 1;
}

/**
 * Set submiting flag to 0
 * @param string formId
 */
validator.unsetSubmitingFlag = function(formId)
{
	if ('undefined' == typeof formId) {
		for (formId in validator.validationRules) {
			validator.unsetSubmitingFlag(formId);
		}
		return;
	}
	validator.submitingForms[formId] = 0;
}

/**
 * Check what form is submited
 * @param string formId
 */
validator.isSubmiting = function(formId)
{
	if ('undefined' == typeof(validator.submitingForms[formId]) || (0 == validator.submitingForms[formId])) {
		return false;
	}
	else if (1 == validator.submitingForms[formId]) {
		return true;
	}
}

/**
 * Get form fields validation rules w/cache support
 *
 */
validator.getValidationRules = function()
{
	if (window.rules != 'undefined') {
		for (var formId in window.rules.formRules) {
			validator.validationRules[formId] = window.rules.formRules[formId];
		}
	}

	// prevent ajax request for validationRules in api mode
	if (validator.apiMode) {
		return;
	}

        // hack
        var extData = {};

	// get id all forms in page
	var forms = new Array;
	$('form').each(function (index, form) {
		var formId = $(form).prop('id');
		if (formId
			&& !validator.validationRules[formId]
			&& !$(form).hasClass(validator.settings.ignoreValidationClass)
		) {
			forms.push(formId);
			extData[formId] = $(form).data();
		}
	});

	// ajax request
	if (forms.length) {
		var rules = {};
		$.ajax({
			async: false,
			type: 'POST',
			url: validator.settings['settingsUrl'],
			data: {'forms': $.toJSON(forms)},
			success: function (data, textStatus) {
				if (textStatus == 'success') {
					rules = data;
				}
			},
			dataType: 'json'
		});

		for (formId in rules['formRules']) {

			validator.validationRules[formId] = rules['formRules'][formId];

			if (   extData[formId]
			    && extData[formId].submitLoader
			    && validator.validationRules[formId].submit
			)
			{
			    validator.validationRules[formId].submit.loader = extData[formId].submitLoader;
			}
		}
	}
}

/**
 * set focus to first field with attribute autoFocus=1
 * @param string formId
 * @return bool - true, if exists field or form with attribute autoFocus=1, false - otherwise
 */
validator.focusInit = function(formId)
{
	var focus = {};
	$.each(validator.validationRules, function (formId, form) {
		if (typeof(focus.form) != 'undefined' || typeof(focus.field) != 'undefined') {
			return false;
		}
		if (1 == form.autoFocus) {
			focus = {'form': formId};
		}

		$.each(form.fields, function (fieldId, field) {
			if (1 == field.autoFocus) {
				if (typeof(field.subFields) != 'undefined') {
					focus = {'field': field.subFields.fields['0']['id']};
				}
				else if (typeof(field.type) != 'undefined' && field.type == 'radio') {
					focus = {'field': $("input[name='" + field.id + "']:first").prop('id')};
				}
				else {
					focus = {'field': fieldId};
				}
			}
		});
	});

	try {
		if (typeof(focus.form) != 'undefined' && typeof(focus.field) == 'undefined') {
			var selectStr =
				'#'+focus.form+' input:text, #'+focus.form+' input:password, #'+focus.form+' textarea, #'+
				focus.form+' input:checkbox, #'+focus.form+' input:radio, #'+focus.form+' select';

			if ($(selectStr).length) {
				$(selectStr)[0].focus();
				return true;
			}
		}
		else if (typeof(focus.field) != 'undefined') {
			$('#'+focus.field).focus();
			return true;
		}
		return false;
	}
	catch(exc) {
		return false;
	}
}

/**
 * get initial form values and set focus to field
 *
 */
validator.createInitialFormState = function()
{
	var focus = {'value': false};
	if (validator.validationRules) {
		$.each(validator.validationRules, function (formId) {
			validator.initialValues[formId] = validator.getXmlFormData(formId);

			if (!focus.value) {
				focus.value = validator.focusInit(formId);
			}
		});

		try {
			if (typeof(focus.form) != 'undefined' && typeof(focus.field) == 'undefined') {
				var selectStr =
					'#'+focus.form+' input:text, #'+focus.form+' input:password, #'+focus.form+' textarea, #'+
					focus.form+' input:checkbox, #'+focus.form+' input:radio, #'+focus.form+' select';

				if ($(selectStr).length) {
					$(selectStr)[0].focus();
				}
			}
			else if (typeof(focus.field) != 'undefined') {
				$('#'+focus.field).focus();
			}
		}
		catch(exc){
		}
	}
}

/**
 * add submit events for concrete form
 * @param formId
 * @param form
 */

validator.addSubmitEventForConcreteForm = function (formId, form) {
	if (!form) {
		// get validation rules if needed
		if (!validator.validationRules[formId]) {
			validator.getValidationRules();
		}
		form = validator.validationRules[formId];
	}

	// submit form by enter
	if (1 == form.onEnter && $('#'+formId+' input:submit').length == 0) {
		var position = form.onEnterContainer || formId;
		$('#'+position).append('<input type="submit" class="hiddenSubmit" />');
	}
	if ('normal' == form.submit.type) {
		$('#' + formId).bind('submit', function () {
			var isFormChanged = (0 == form.submit.noChangeNoSave || validator.checkFormChanges(formId));
			if (!isFormChanged) {
				fadeBoxShow('attention', 'Данные не были изменены.', false);
			}

			return validator.validateFormEvent(formId) && isFormChanged;
		});
	} else if ('click' == form.submit.type) {
		$('#' + form.submit.trigger).bind('click', function () {
			if (validator.validateFormEvent(formId)) {
				//remove controlDefault value
				$('#' + formId + ' .defaultValue:input').val('');
				$('#' + formId).trigger('submit');
			}
		});

		$('#' + formId).bind('submit', function (event) {
			var isFormChanged = (0 == form.submit.noChangeNoSave || validator.checkFormChanges(formId));
			if (!isFormChanged) {
				fadeBoxShow('attention', 'Данные не были изменены.', false);
			}

			return validator.validateFormEvent(formId) && isFormChanged;
		})
	} else if ('ajaxWithoutValidation' == form.submit.type) {
		$('#' + form.submit.trigger).bind('click', function (event) {
			event.preventDefault();
			if (validator.isSubmiting(formId)) {
				event.stopImmediatePropagation();
			}
			validator.setSubmitingFlag(formId);
		});
		$('#' + form.submit.trigger).ajaxSuccess(function () {
			validator.unsetSubmitingFlag(formId);
		});
		$('#' + form.submit.trigger).ajaxError(function (event, request, settings) {
			validator.unsetSubmitingFlag(formId);
		});
		$('#' + formId).bind('submit', function (event) {
			event.preventDefault();
			if (1 == form.submit.noChangeNoSave && !validator.checkFormChanges(formId)) {
				validator.unsetSubmitingFlag(formId);
				fadeBoxShow('attention', 'Данные не были изменены.', false);
				return false;
			}
			$('#' + form.submit.trigger).click();
		});
	} else if ('ajax' == form.submit.type) {
		var submitBtn = $('#' + form.submit.trigger);
		submitBtn.bindClickEvent(function (event) {
			if (form.submit.checkCookiesEnabled && !isCookiesEnabled()) {
				pwh.hide();
				pwh.alert({message: 'Для авторизации на сайте необходимо включить cookies'});
			} else {
				event.preventDefault();
				if (validator.isSubmiting(formId)) {
					return;
				}
				validator.setSubmitingFlag(formId);
				if (form.submit.prepareSubmitData && typeof window[form.submit.prepareSubmitData] == 'function') {
					result = window[form.submit.prepareSubmitData]();
				}
				if (validator.validateFormEvent(formId)) {
					if (0 == form.submit.noChangeNoSave || validator.checkFormChanges(formId)) {
						validator.formSubmition = true;
						var options = {
							cache: false,
							data: validator.data,
							success: function (data, statusText) {
								validator.unsetSubmitingFlag(formId);
								// hide loader
								if ('inlineBtn' == form.submit.loader) {
									if (form.submit.trigger != 'popupLoginBtn' || typeof data.errors != 'undefined') {
										ajaxBtnProcessEnd(startItem);
									}
								}
								if ('inline' == form.submit.loader) {
									loaderId = (form.submit.loaderId ? form.submit.loaderId : validator.settings.defaultLoaderId);
									hideLoader(loaderId);
								} else if ('fullScreen' == form.submit.loader) {
									pwh.fullScreenLoaderHide();
								}

								if ('string' == typeof (data)) {
									try {
										data = $.evalJSON(data);
									}
										// some syntax error may occur while eval()
									catch (exception) {
										if (form.submit.uploadErrorHandler && typeof window[form.submit.uploadErrorHandler] == 'function') {
											window[form.submit.uploadErrorHandler]();
										}
										return;
									}
								}

								// process json response
								if (data != null && data.errors) {
									// show errors
									errorFormId = data.formId ? data.formId : formId;
									errorForm = validator.validationRules[errorFormId];
									validator.showFormErrors(formId, data.errors);
									if (errorForm.submit.onSubmitError && typeof validator[errorForm.submit.onSubmitError] == 'function') {
										// error callack is the method of validator
										validator[errorForm.submit.onSubmitError](data);
									} else if (errorForm.submit.onSubmitError && typeof window[errorForm.submit.onSubmitError] == 'function') {
										// error callback is simple function
										window[errorForm.submit.onSubmitError](data);
									}
									return;
								} else if (data != null && data.popup) {
									pwh.show(data.popup);
								}

								// Reset form values after save new data
								validator.initialValues[formId] = validator.getXmlFormData(formId);

								if (form.submit.callback && typeof validator[form.submit.callback] == 'function') {
									// callack is the method of validator
									validator[form.submit.callback](data);
								} else if (form.submit.callback && typeof window[form.submit.callback] == 'function') {
									// callback is simple function
									window[form.submit.callback](data);
								} else if (data != null && data.redirect) {
									// redirect to specified url
									window.location = data.redirect;
								} else if (data != null && data.reload) {
									// reload current page
									window.location.reload();
								}

								if (data != null && data.message && data.message.type) {
									var title = data.message.title || validator.settings.fadeBoxMessageTypes[data.message.type].title;
									var body = data.message.body || validator.settings.fadeBoxMessageTypes[data.message.type].body;
									fadeBoxShow(data.message.type, title, false, body);
									validator.focusInit(formId);
								}
							},
							complete: function (xmlHttpRequest, textStatus) {
								validator.unsetSubmitingFlag(formId);
							}
						};
						// show loader
						if ('inlineBtn' == form.submit.loader) {
							var startItem;
							if (undefined == form.submit.customPlaceForInlineLoader) {
								startItem = ajaxBtnProcessStart(submitBtn, 'loader_btn_small_red.gif');
							} else {
								startItem = ajaxBtnProcessStart($('#' + form.submit.customPlaceForInlineLoader));
							}
						}

						if ('inline' == form.submit.loader) {
							loaderId = (form.submit.loaderId ? form.submit.loaderId : validator.settings.defaultLoaderId);
							showLoader(loaderId);
						} else if ('fullScreen' == form.submit.loader) {
							pwh.fullScreenLoaderShow();
						}
						// call the function before submit
						if (form.submit.beforeSubmit && typeof window[form.submit.beforeSubmit] == 'function') {
							var result = window[form.submit.beforeSubmit]();
							if (result && result.submitData && typeof result.submitData == 'object') {
								options.data = $.extend(options.data, result.submitData);
							} else if (false === result) {
								if ('undefined' != typeof loaderId) {
									hideLoader(loaderId);
								}
								validator.unsetSubmitingFlag(formId);
								return false;
							}
						}
						if (form.controlConfirm) {
							var isShowConfirm = true;
							if (form.controlConfirm.isShowConfirmCallback && 'function' === typeof window[form.controlConfirm.isShowConfirmCallback]) {
								isShowConfirm = window[form.controlConfirm.isShowConfirmCallback]();
							}
							var confirmBody = validator.settings.controlConfirmTexts.body;
							if (form.controlConfirm.getBodyFunction && 'function' === typeof window[form.controlConfirm.getBodyFunction]) {
								confirmBody = window[form.controlConfirm.getBodyFunction]();
							}
							if (isShowConfirm) {
								pwh.confirm({
									titleDialog: form.controlConfirm.withoutTitle ? '' : val(form.controlConfirm, 'title', validator.settings.controlConfirmTexts.title),
									message: val(form.controlConfirm, 'body', confirmBody),
									callbackYes: function () {
										validator.formSubmit(formId, options);
									},
									callbackNo: function () {
										validator.unsetSubmitingFlag(formId);
									}
								});
								return;
							}
						}
						validator.formSubmit(formId, options);
					} else {
						fadeBoxShow('attention', 'Данные не были изменены.', false);
						validator.unsetSubmitingFlag(formId);
					}
				} else {
					validator.unsetSubmitingFlag(formId);
				}
			}
		});
		$('#' + formId).bind('submit', function (event) {
			event.preventDefault();
			$(':focus').blur();
			$('#' + form.submit.trigger).click();
		});
	}
}

if (typeof form === 'undefined'){} else
	if (form['formChangedNotice'] == 1) {
		validator.noticeFormIds[formId] = 1;
	}


/**
 * Submit form with ajax
 *
 * @param formId
 * @param options
 */
validator.formSubmit = function(formId, options) {
	// submit not multipart form
	var currentForm = $('#'+formId);
	if (0 == currentForm.find('input:file').length) {
		var action = currentForm.attr('action').length == 0 ? window.location.href : currentForm.attr('action');
		options.async		= true;
		options.type		= currentForm.attr('method');
		options.url			= action;
		options.dataType	= 'json';
		$.ajax(options);
	}
	// submit multipart form with file inputs
	else {
		currentForm.ajaxFormSubmit(options);
	}
}

/**
 * add submit events for all forms, defined in validationRules
 *
 */
validator.addSubmitEvents = function()
{
	if(validator.validationRules)
		$.each(validator.validationRules, function (formId, form) {
			validator.addSubmitEventForConcreteForm(formId, form)
		});
}

/**
 * returns field value
 */
validator.getFieldValue = function(field, formContainer)
{
	if (field.type && ('radio' == field.type)) {
		if (formContainer) {
			return formContainer.find("input[name='" + field.id + "']:checked").val();
		}
		return $("input[name='" + field.id + "']:checked").val();
	}
	else if (field.type && ('checkbox' == field.type || 'checkboxArray' == field.type)) {
		var values = new Array();
		var elemSelector = 'checkbox' == field.type ?
			"input[name='" + field.id + "']:checked" : "input[name='" + field.id + "[]']:checked";
		var fields = $(elemSelector);
		if (formContainer) {
			fields = formContainer.find(elemSelector);
		}
		fields.each(function(index, input){
			values.push(input.value);
		});
		var separator = (field.separator) ? field.separator : ','
		return (values.length > 0) ? values.join(separator): '';
	}
	else if (field.type && ('tinymce' == field.type || 'tinymceOrTextarea' == field.type) && !(field.multiple && 1 == field.multiple)) {
		if (tinyMCE.get(field.id)) {
			return (tinyMCE.get(field.id) ? tinyMCE.get(field.id).getContent() : '');
		}
		else {
			if (formContainer) {
				return formContainer.find('[id$=' + field.id+']').val();
			}
			return (!field.controlDefault || $('#' + field.id).val() != field.controlDefault) ? $('#' + field.id).val() : '';
		}
	}
	else if (field.subFields) {
		var subFields = field.subFields.fields;
		var subValues = new Array();
		var nonEmptyValue = false;
		for (var i in subFields) {
			if ($('#' + subFields[i].id).length > 0) {
				var subValue = $('#' + subFields[i].id).val();
				subValues.push(subValue);
				if (!nonEmptyValue && subValue.length > 0) {
					nonEmptyValue = true;
				}
			}
		}
		return (nonEmptyValue ? subValues.join(field.subFields.concatenation) : '');
	}
	else if (field.multiple && 1 == field.multiple) {
		var fieldsValue = {};
		var elements = $('[name^="' + field.id + '["]');
		if (formContainer) {
			elements = formContainer.find('[name^="' + field.id + '["]');
		}
		$.each(elements, function (index, input) {
			var element_id = input['name'].replace(/^([^\[]+)\[([^\]]+)\]/, '$2');
			if (element_id != null) {
				var value = $(input).val();
				if (field.type && ('tinymce' == field.type || 'tinymceOrTextarea' == field.type)) {
					if (tinyMCE.get(input.id)) {
						value = (tinyMCE.get(input.id) ? tinyMCE.get(input.id).getContent() : '');
					}
				}
				// Set field value and id. Id will need to show error.
				fieldsValue[element_id] = {
				   'value'		: (value != input.controlDefault) ? value : '',
				   'fieldId'	: input.id
				};
			}
		});
		return fieldsValue;
	}
	else {
		if (formContainer) {
			return formContainer.find('[id$=' + field.id+']').val();
		}
		return (!field.controlDefault || !$('#' + field.id).hasClass('defaultValue')) ? $('#' + field.id).val() : '';
	}
}

/**
 * get data indicated in xml
 *
 */
validator.getXmlFormData = function(formId, formContainer)
{
	var formData = {};
	$.each(validator.validationRules[formId]['fields'], function (index, field) {
		formData[field.id] = validator.getFieldValue(field, formContainer);
	});
	return formData;
}

/**
 * get all form data
 *
 */
validator.getAllFormData = function(formId)
{
	var formData = {};
	$.each($('#'+formId).formToArray(), function (index, field) {
		var fieldName = field['name']. replace(/\[[^\]]*\]/, "");
		// Skips already defined data
		if (typeof(formData[fieldName]) != 'undefined' && !/.*\[\]$/.test(field['name'])){
			return true;
		}
		if (validator.validationRules[formId]['fields'][fieldName] != null) {
			formData[fieldName] = validator.getFieldValue(validator.validationRules[formId]['fields'][fieldName]);
		}
		else {
			if(/.*\[\]$/.test(field['name'])) {
				if(typeof formData[field['name']] == 'undefined') {
					formData[field['name']] = [];
				}
				formData[field['name']].push(field['value']);
			} else {	
				formData[field['name']] = field['value'];
			}
		}
	});
	
	$.each(validator.validationRules[formId]['fields'], function (index, field) {
		if (typeof(field.subFields) != 'undefined') {
			formData[field.id] = validator.getFieldValue(field);
		}
	});
	return formData;
}

/**
 * validate form event
 * @param int formId
 * @param jQuery object formContainer
 * @param bool showFormErrors
 */
validator.validateFormEvent = function(formId, formContainer, showFormErrors)
{
	validator.data = (formContainer) ?  validator.getXmlFormData(formId, formContainer): validator.getAllFormData(formId);
	var valid = validator.validateForm(formId);

	if (!valid && ('undefined' == typeof(showFormErrors) || showFormErrors)) {
		validator.showFormErrors(formId, validator.validationErrors, formContainer);
	}
	if (!valid) {
		validator.unsetSubmitingFlag();
	}
	return valid;
}

/**
 * validate value by ruleId
 * @param string formId
 * @param string fieldId
 * @param string ruleId
 * @param string value
 * @return bool
 */
validator.validateByRuleId = function(formId, fieldId, ruleId, value)
{
	var result = {'value': false};

	$.ajax({
		async: false,
		type: 'POST',
		url: validator.settings['validateByRuleIdUrl'],
		data: {'formId': formId, 'fieldId': fieldId, 'ruleId': ruleId, 'value': value, 'formData': $.toJSON(validator.data)},
		success: function (data, textStatus) {
			if ('success' == textStatus) {
				result = data;
			}
			else {
				result['value'] = false;
			}
		},
		dataType: 'json'
	});

	return result['value'];
}

/**
 * Checks user's access to particular permission object
 *
 */
validator.checkAccess = function(objectName)
{
	var result = {};

	$.ajax({
		async: false,
		type: 'GET',
		url: validator.settings['checkAccessUrl'] + '/' + objectName,
		success: function (data, textStatus) {
			if (textStatus == 'success') {
				result = data;
			}
			else {
				result['checkAccessResult'] = false;
			}
		},
		dataType: 'json'
	});

	return result['checkAccessResult'];
}

/**
 * set validator.focus.field value
 *
 */
validator.setFocusFieldId = function(formId, fieldId)
{
	if (typeof(validator.focus.field) != 'undefined') {
		return;
	}

	var validationRules = validator.validationRules[formId]['fields'][fieldId];

	if (validationRules && validationRules.onErrorFocusElementId) {
		validator.focus['field'] = validationRules.onErrorFocusElementId;
	}
	else if (validationRules && validationRules.subFields) {
		$.each(validationRules.subFields.fields, function(index, subField) {
			var value =  $.trim($('#'+subField.id).attr('value'));
			if (value.length == 0) {
				validator.focus['field'] = subField.id;
				return false;
			}
		});
	}
	else {
		validator.focus['field'] = fieldId;
	}
}

/**
 * validate form
 *
 */
validator.validateForm = function(formId)
{
	validator.validationErrors	= {};
	validator.focus				= {};

	for (var fieldId in validator.validationRules[formId]['fields']) {
		var field		= validator.validationRules[formId]['fields'][fieldId];
		var fieldData	= (validator.data[fieldId]) ? validator.data[fieldId] : '';

		// reset error message after previous checking
		if ('undefined' !== typeof(field['rules'][0])) {
			field['rules'][0].error.message = field['rules'][0].error.defaultMessage;
		}
		// skip if user do not has such object
		if (field.object && !validator.checkAccess(field.object)) {
			continue;
		}

		// if the child (dependent) field is not empty and parent field is empty, then error
		if (field.depend &&
			!validator.data[field.depend] &&
			validator.data[fieldId] &&
			!validator.validationErrors[field.depend])
		{
			validator.validationErrors[field.depend] =
				validator.validationRules[formId]['fields'][field.depend]['rules'][0]['error'];
		}

		// check validParent flag - skip validation if parent has error
		if (field.validParent && validator.validationErrors[field.validParent]) {
			continue;
		}

		// clear control default
//		if (fieldData && field.controlDefault && fieldData == field.controlDefault) {
		if ($('#' + field.id).hasClass('defaultValue')) {
			fieldData = '';
		}

		if (fieldData && 0 < fieldData.toString().length) {
			// check rules
			for (var ruleCount = 0; ruleCount < field.rules.length; ruleCount++) {
				var rule = field.rules[ruleCount];
				if (1 == rule.callByRuleId) {
					if (typeof(rule.id) == 'undefined') {
						throw("rule don't have id");
					}
					if (!validator.validateByRuleId(formId, fieldId, rule.id, fieldData)) {
						if (validator.isDraft) {
							fieldData = '';
						}
						else {
							validator.validationErrors[fieldId] = rule.error;
							validator.setFocusFieldId(formId, fieldId)
							if (rule.error.stopOnFail) {
								break;
							}
						}
					}
				}
				else {
					if (field.multiple && 1 == field.multiple) {
						var errors = {};
						$.each(fieldData, function (i, fieldData) {
							var obj = {str: fieldData['value']};
							validator.errorCode = '';
							validator.customErrorMessage = '';
							rule.error.message = rule.error.defaultMessage;
							if (!validator.validateField(rule.code, obj)) {
								if (validator.isDraft) {
									obj.str = '';
								}
								else {
									if (validator.errorCode.length > 0
										&& typeof(rule.error.detailedMessages) !== 'undefined'
										&& rule.error.detailedMessages !== null
										&& typeof(rule.error.detailedMessages[validator.errorCode]) !== 'undefined'
									) {
										rule.error.message = rule.error.detailedMessages[validator.errorCode];
									}
									if (validator.customErrorMessage.length > 0) {
										rule.error.message = validator.customErrorMessage;
									}
									errors[fieldData['fieldId']] = rule.error;
									validator.setFocusFieldId(formId, fieldData['fieldId'])
									if (rule.error.stopOnFail) {
										return false;
									}
								}
							}
							fieldData['value'] = obj.str;

							if (field['default'] && 0 == fieldData['value'].toString().length) {
								fieldData['value'] = field['default'];
							}
							if (0 == fieldData['value'].toString().length && field.required && 1 == field.required && 1 != validator.isDraft) {
								errors[fieldData['fieldId']] = field['rules'][0].error;
								validator.setFocusFieldId(formId, fieldData['fieldId'])
							}
						});
						if (0 != Object.size(errors) && !validator.isDraft) {
							validator.validationErrors[fieldId] = errors;
							if (rule.error.stopOnFail) {
								break;
							}
						}
					}
					else  {
						var obj = {str: fieldData};
						validator.errorCode = '';
						validator.customErrorMessage = '';
						rule.error.message = rule.error.defaultMessage;
						if (!validator.validateField(rule.code, obj)) {
							if (validator.isDraft) {
								obj.str = '';
							}
							else {
								if (validator.errorCode.length > 0
									&& typeof(rule.error.detailedMessages) !== 'undefined'
									&& rule.error.detailedMessages !== null
									&& typeof(rule.error.detailedMessages[validator.errorCode]) !== 'undefined'
								) {
									rule.error.message = rule.error.detailedMessages[validator.errorCode];
								}
								// check for error message specific to this validation error
								if (validator.customErrorMessage.length > 0) {
									rule.error.message = validator.customErrorMessage;
								}
								validator.validationErrors[fieldId] = rule.error;
								validator.setFocusFieldId(formId, fieldId)
								if (rule.error.stopOnFail) {
									break;
								}
							}
						}
						fieldData = obj.str;
					}
				}
			}
		}
		// there is no default for this field and it is required
		if ((!fieldData || 0 == fieldData.toString().length) && !field['default'] && field.required && 1 == field.required && 1 != validator.isDraft) {
			validator.validationErrors[fieldId] = field['rules'][0].error;
			validator.setFocusFieldId(formId, fieldId)
		}
		if (field.requiredFunction) {
			var userRequiredFunction = field.requiredFunction.replace(/:.+$/, '');
		}
		if ((!fieldData || 0 == fieldData.toString().length) && !field['default']
			&& userRequiredFunction
			&& typeof window[userRequiredFunction] == 'function'
			&& 'undefined' != typeof(field.requiredFunction)
		) {
			var values = field.requiredFunction.replace(/^.+:/, '');
			if (window[userRequiredFunction](values)) {
				validator.validationErrors[fieldId] = field['rules'][0].error;
				validator.setFocusFieldId(formId, fieldId)
			}
		}
		if ((!fieldData || 0 == fieldData.toString().length) && !field['default'] && field.required && 'visible' == field.required && 1 != validator.isDraft) {
			var elementId = (field.type && ('tinymce' == field.type) && tinyMCE.get(field.id)) ? tinyMCE.activeEditor.editorContainer.id : fieldId;
			if (!isHidden(elementId)) {
				validator.validationErrors[fieldId] = field['rules'][0].error;
				validator.setFocusFieldId(formId, fieldId)
			}
		}
		// Preparation of the data for sending
		if (field.multiple && 1 == field.multiple) {
			// Convert object to string
			validator.data[fieldId] = (fieldData != '') ? $.toJSON(fieldData) : '';
		}
		else {
			validator.data[fieldId] = fieldData;
		}
	}

	validator.removeErrors(formId);

	if (0 != Object.size(validator.validationErrors)) {
		validator.unsetSubmitingFlag();
	}

	return (0 == Object.size(validator.validationErrors));
}

/**
 * validate field
 *
 */
validator.validateField = function(codes, obj)
{
	for (codeCount = 0; codeCount < codes.length; codeCount++) {
		if (!validator.validate(codes[codeCount], obj)) {
			return false;
		}
	}
	return true;
}

/**
 * Validates obj with property str using rule
 *
 */
validator.validate = function(rule, obj)
{
	var separatorPos	= rule.indexOf(":");
	var ruleParts		= new Array();
	if (-1 == separatorPos) {
		ruleParts.push(rule);
	}
	else {
		ruleParts.push(rule.substring(0, separatorPos));
		ruleParts.push(rule.substring(separatorPos+1, rule.length));
	}

	if (1 == ruleParts.length) {
		// simple rules
		validator.errorCode = rule;
		validator.customErrorMessage = '';
		switch (rule) {
			case 'xssclean':
				obj.str = xssClean(obj.str);
				return true;
			break;

			case 'xsscleanhtml':
				obj.str = xssCleanHtml(obj.str);
				return true;
			break;

			case 'html_entity_decode':
				obj.str = convertHtmlChars(obj.str);
				return true;
			break;

			case 'encode_url':
				obj.str = encodeURIComponent(obj.str);
				return true;
			break;

			case 'trim':
				obj.str = $.trim(obj.str);
				return true;
			break;

			case 'nonEmptyHtml':
				var tempStr = $.trim(obj.str.replace(/\<p\>\&nbsp\;\<\/p>/g, ''));
				return (tempStr != '');
			break;

			case 'email':
				return validateEmail(obj.str);
			break;

			case 'email_batch':
				return validateMultiEmail(obj.str);
			break;

			case 'phone':
				return validatePhone(obj.str);
			break;

			case 'date':
			case 'dueDate':
				return validateDate(obj.str);
			break;

			case 'dateNoYear':
				return validateDateNoYear(obj.str);
			break;

			case 'datetime':
				return validateDateTime(obj.str);
			break;

			case 'price':
				return this.validatePrice(obj.str);
			break;

			case 'numeric':
				obj.str = obj.str.replace(',', '.');
				return (null != obj.str.match('^[\-]?[0-9]+([.,]{1}[0-9]*){0,1}$') && !isNaN(obj.str) && (obj.str != ''));
			break;

			case 'duration':
				return (!isNaN(obj.str) && (obj.str != 0));
			break;

			case 'int':
				return (obj.str.match('^[\-]?[0-9]+$') != null);
			break;

			case 'float':
				if (null != obj.str.match('^[\-]?[0-9]+([.,]{1}[0-9]*){0,1}$')) {
					obj.str = parseFloat(obj.str);
					return true;
				}
				return false;
			break;

			case 'captcha':
				return validator.captcha(obj.str);
			break;

			// Scorm Data Model Validation

			case 'longIdentifierType':
				return longIdentifierType(obj.str);
			break;

			case 'timeType':
				return timeType(obj.str);
			break;

			case 'timeIntervalCompability':
				var reg = /^(\d+):(\d+):(\d+)$/;
				var matches = obj.str.match(reg);
				if (matches != null) {
					str = 'PT';
					if (matches[1] != '00') {
						str += matches[1]+'H';
					}
					if (matches[2] != '00') {
						str += matches[2]+'M';
					}
					if (matches[3] != '00') {
						str += matches[3]+'S';
					}
					obj.str = 'PT' == str ? 'PT0S' : str;
				}
				return true;
			break;

			case 'timeIntervalType':
				return timeIntervalType(obj.str);
			break;

			case 'localizedStringType':
				return localizedStringType(obj.str);
			break;

			case 'strToFloat':
				obj.str = parseFloat(obj.str,10);
				return true;
			break;

			case 'positive':
				return (0 <= parseFloat(obj.str));
			break;

			case 'validUrl':
				// regexp from jquery.validate.js
				var	regExp = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
				return regExp.test(obj.str);
			break;

			case 'checkMaterialPrice':
			case 'checkAssessmentPrice':
				return checkMaterialPrice(priceToFloatFormat(moneyFormat(obj.str)));
			break;

			default:
				if ((typeof validator[rule]) == 'function') {
					return validator[rule](obj.str);
				}
				else {
					throw('Validation function = "'+rule+'" does not exist.');
				}
			break;
		}
	}
	else if (2 == ruleParts.length) {
		// rules with single : separator
		validator.errorCode = ruleParts[0];
		validator.customErrorMessage = '';
		switch (ruleParts[0]) {
			case 'regexp_js':
			case 'regexp':
				return (obj.str.match(eval(ruleParts[1])) != null);
			break;

			case 'regexp_php':
				return true;
			break;

			case 'range':
				ranges = ruleParts[1].split("..");
				if (ranges != null && ranges.length == 2) {
					return (parseFloat(obj.str) >= parseFloat(ranges[0]) && parseFloat(obj.str) <= parseFloat(ranges[1]));
				}
				else {
					throw('Invalid range syntax: "'+rule+'".');
				}
			break;

			case 'price_range':
				var str = priceToFloatFormat(obj.str)
				ranges = ruleParts[1].split("..");
				if (ranges != null && ranges.length == 2) {
					return (parseFloat(str) >= parseFloat(ranges[0]) && parseFloat(str) <= parseFloat(ranges[1]));
				}
				else {
					throw('Invalid range syntax: "'+rule+'".');
				}
			break;

			case 'gt':
				return (obj.str > parseFloat(ruleParts[1]));
			break;

			case 'gte':
				return (obj.str >= parseFloat(ruleParts[1]));
			break;

			case 'lt':
				return (obj.str < parseFloat(ruleParts[1]));
			break;

			case 'lte':
				return (obj.str <= parseFloat(ruleParts[1]));
			break;

			case 'minlength':
				return (obj.str.length >= ruleParts[1]);
			break;

			case 'maxlength':
				return (obj.str.length <= ruleParts[1]);
			break;

			case 'enum':
				return (jQuery.inArray(obj.str, ruleParts[1].split(',')) >= 0);
			break;

			case 'length':
				params = ruleParts[1].split("..");
				if (params != null && params.length == 1) {
					return (obj.str.length == Number(params[0]));
				}
				else if (params != null && params.length == 2) {
					return (Number(params[0]) <= obj.str.length  && obj.str.length <= Number(params[1]));
				}
				else {
					throw('Invalid length syntax: "'+rule+'". Allowed formats: length:3 OR length:2..4');
				}
			break;

			case 'exists_php':
				return true;
			break;

			case 'equals_field':
				return (obj.str == validator.data[ruleParts[1]]);
			break;

			case 'not_equals_field':
				return (obj.str != validator.data[ruleParts[1]]);
			break;

			case 'ordered_numeric':
				params = ruleParts[1].split(",");
				if (params && params.length == 2) {
					if (!validator.data[params[0]].length || !validator.data[params[1]].length) {
						return true;
					}
					var startValue	= parseFloat(validator.data[params[0]].replace(',', '.'));
					var endValue	= parseFloat(validator.data[params[1]].replace(',', '.'));
					return (startValue <= endValue);
				}
				else {
					throw('Invalid ordered_numeric syntax: "'+rule+'". Allowed format: ordered_nimeric:startTime,endTime');
				}
			break;

			case 'event_ordered_dates':
				params = ruleParts[1].split(",");
				if (params && params.length == 3) {
					if (!validator.data[params[0]].length || !validator.data[params[1]].length) {
						return false;
					}
					var startTime	= parseDateFromString(validator.data[params[0]]);
					var endTime		= parseDateFromString(validator.data[params[1]]);
					var isAllDay	= parseDateFromString(validator.data[params[2]]);

					if (1 == isAllDay) {
						return (startTime <= endTime);
					}
					return (startTime < endTime);
				}
				else {
					var error = 'Invalid event_ordered_dates syntax: "'+rule+'".'
						+ 'Allowed format: event_ordered_dates:startTime,endTime,isAllDay';
					throw(error);
				}
			break;

			case 'ordered_dates':
			case 'ordered_dates_equal':
				params = ruleParts[1].split(",");
				if (params && params.length == 2) {
					if (!validator.data[params[0]].length || !validator.data[params[1]].length) {
						return true;
					}
					var startTime	= parseDateFromString(validator.data[params[0]]);
					var endTime		= parseDateFromString(validator.data[params[1]]);

					if ('ordered_dates'== ruleParts[0]) {
						return (startTime < endTime);
					}
					else {
						return (startTime <= endTime);
					}
				}
				else {
					throw('Invalid ordered_dates syntax: "'+rule+'". Allowed format: ordered_dates:startTime,endTime');
				}
			break;

			case 'datetime_interval_length':
				params = ruleParts[1].split(",");
				if (params && params.length == 4) {
					var startTime			= parseDateFromString(validator.data[params[0]]).getTime();
					var endTime				= parseDateFromString(validator.data[params[1]]).getTime();
					var currentInterval		= endTime - startTime;
					var requiredInterval	= params[2];

					switch (params[3]) {
						case 'days':
							currentInterval /= (60*60*24*1000);
						break;

						case 'hours':
							currentInterval /= (60*60*1000);
						break;

						case 'minutes':
							currentInterval /= (60*1000);
						break;
					}
					return (currentInterval <= requiredInterval);
				}
				else {
					throw('Invalid datetime_interval_length syntax: "'+rule+'". Allowed format: datetime_interval_length:startTime,endTime,maxInterval,[days, hours, minutes]');
				}
			break;

			case 'tagmaxlength':
				return tagMaxLength(obj.str, ruleParts[1]);
			break;

			case 'htmlmaxlength':
				var parts				= ruleParts[1].split(',');
				var value				= parts[0];
				var showCustomMessage	= parts.length < 2 || 2 == parts.length && !parts[1];
				var textLength			= 0;
				if (showCustomMessage) {
					textLength = validateHtmlTextMaxLength(obj.str, value);
				}
				else {
					textLength = value < strip_tags(obj.str).length ? -1 : 0;
				}

				if (0 < textLength) {
					if (showCustomMessage) {
						validator.customErrorMessage = 'Текст превышает максимально допустимую длину (%s символов).'.replace('%s', textLength);
					}
					return false;
				}
				else if (0 > textLength) {
					if (showCustomMessage) {
						validator.customErrorMessage = 'Текст содержит слишком сложное форматирование. Пожалуйста, упростите форматирование или укоротите текст.';
					}
					return false;
				}
				return true;
			break;

			case 'htmlminlength':
				return validateHtmlTextMinLength(obj.str, ruleParts[1]);
			break;

			case 'localizedStringMaxlength':
				return localizedStringType(obj.str, ruleParts[1]);
			break;

			case 'checkbox':
				var result = true;
				$(obj.str.split(',')).each(function (i, e) {
					if (jQuery.inArray(e, ruleParts[1].split(',')) < 0) {
						result = false;
						return false;
					}
				});
				return result;
			break;

			case 'phone':
				return validatePhone(obj.str, ruleParts[1]);
			break;

			default:
				if ((typeof validator[ruleParts[0]]) == 'function') {
					return validator[ruleParts[0]](obj.str, ruleParts[1]);
				}
				else {
					throw('Validation function = "'+rule+'" does not exist.');
				}
			break;
		}
	}
	else {
		throw('There is no handle for the = "'+rule+'" rule.');
	}
}

/**
 * check captcha
 *
 */
validator.captcha = function(str)
{
	var result = false;

	$.ajax({
		async: false,
		type: 'POST',
		url: validator.settings['captchaUrl'],
		data: {'captcha': str},
		success: function (data, textStatus) {
			if(textStatus == 'success') {
				result = data.result;
			}
		},
		dataType: 'json'
	});

	return result;
}

/**
 * show message if user does not save his data
 *
 */
validator.closeWarning = function()
{
	if (!validator.formSubmition) {
		$.each(validator.validationRules, function (formId, form) {
			if ('function' == typeof form.beforeUnload){
				form.beforeUnload();
			}
		})
		var warning = {'message': null};
		$.each(validator.initialValues, function (formId, form) {
			if (!(formId in validator.noticeFormIds)) {
				return;
			}

			if (validator.checkFormChanges(formId, form)) {
				warning['message'] = validator.closeWarningMessage;
				return false;
			}
		});

		if (warning['message'] != null) {
			return warning['message'];
		}
	}
}

/**
 * hide error messages
 *
 * @param	string	formId
 * @return	void
 */
validator.removeErrors = function(formId)
{
	if (!validator.isDraft) {
		var f = $('#'+formId);
		$.each(validator.settings.errorClasses, function(i, e) {
			if (e.control && $('#' + formId + ' .' + e.control)) {
				$('#' + formId + ' .' + e.control).removeClass(e.control);
			}
			if (e.message && $('#' + formId + ' .' + e.message)) {
				$('#' + formId + ' .' + e.message).remove();
			}
			$('#' + formId + ' .mceLayout').removeClass('validationBorder');
			$('#' + formId + ' textarea').removeClass('validationBorder');
		});
	}
}

/**
 * hide single error message
 *
 * @param	string	elementId
 * @return	void
 */
validator.removeSingleError = function(elementId)
{
	$.each(validator.settings.errorClasses, function(i, e) {
		if (e.control && $('#' + elementId + ' .' + e.control)) {
			$('#' + elementId + ' .' + e.control).removeClass(e.control);
		}
		if (e.message && $('#' + elementId + ' .' + e.message)) {
			$('#' + elementId + ' .' + e.message).remove();
		}
		$('#' + elementId + ' .mceLayout').removeClass('validationBorder');
		$('#' + elementId + ' textarea').removeClass('validationBorder');
	});
}

/**
 * prepare error element before show
 *
 * @param	int		formId
 * @param	int		fieldId
 * @param	jQuery object elem
 */
validator.prepareErrorBeforeShow = function(formId, fieldId, elem)
{
	if (validator.currentErrorField && validator.currentErrorField.type) {
		var fieldType = validator.currentErrorField.type;
		if ((fieldType == "tinymce" || fieldType == "tinymceOrTextarea") &&
			tinyMCE.get(fieldId))
		{
			var bodyContainer = $('#'+fieldId).parents('div.textarea');
			bodyContainer.removeClass('largeWithFieldControl');
			bodyContainer.find('.mceLayout').addClass('validationBorder');
		}
		else if (fieldType == "textarea") {
			$('#'+fieldId).addClass('validationBorder');
		}
	}
}

/**
 * show single error message
 * @param fieldId string
 * @param errorType string
 * @param elementId string
 * @param message string
 */
validator.showSingleError = function(fieldId, errorType, elementId, message)
{
	var form	= $('#'+fieldId).parents('form')
	var formId	= 'someUndefinedForm'
	if (form.length != 0) {
		formId = form.prop('id')
	}

	validator.focus.field = fieldId;
	validator.showFormErrors(
		formId, {
			fieldId: {
				'type'		: errorType,
				'elementId'	: elementId,
				'message'	: message
			}
		}
	);
}

/**
 * show error messages
 * @param int formId
 * @param array errors
 * @param jQuery object formContainer
 */
validator.showFormErrors = function(formId, errors, formContainer)
{
	if (!errors) {
		return false;
	}

	validator.tooltipAlreadyShow = false;

	$.each(errors, function(fieldId, error) {
		validator.currentErrorField = null;

		if (typeof error == "string") {
			error = {message: error};
		}

		if (validator.validationRules[formId] && validator.validationRules[formId]['fields'][fieldId]) {
			validator.currentErrorField = validator.validationRules[formId]['fields'][fieldId]
		}

		if (validator.validationRules[formId] && (field = validator.validationRules[formId]['fields'][fieldId])
			&& field.multiple && 1 == field.multiple
		) {
			var errorContainer = (field.rules[0].error.elementId) ? field.rules[0].error.elementId : '';
			var temp;
			$.each(error, function(elementId, elementError) {
				temp = objClone(elementError);
				if (errorContainer != '') {
					temp.elementId = elementId + errorContainer;
				}
				validator.appendFormErrors(formId, elementId, temp, formContainer);
			});
		}
		else {
			validator.appendFormErrors(formId, fieldId, error, formContainer);
		}
	});

	validator.currentErrorField = null;

	// set focus to the first erroneous field
	if (typeof(validator.focus.field) != 'undefined') {
		if (!$('#'+validator.focus.field).prop('readonly')) {
			try {
				if ('undefined' != typeof(tinyMCE) && tinyMCE.get(validator.focus.field)) {
					$((!$.browser.safari?'html':'body')).animate({scrollTop: $('#'+validator.focus.field+'_parent').offset().top}, 200);
				}
				$('#'+validator.focus.field).focus();
			}
			catch(exc){
			}
		}
	}

	// to prevent form submit deadlock
	validator.unsetSubmitingFlag();

	// hide error tooltip only on blur event
	$('#'+validator.focus.field).bind('blur.errorTooltip', function(event) {
		tooltip.hide();
		$('#'+validator.focus.field).unbind('blur.errorTooltip');
	});

	return true;
}

/**
 * append error message html to field
 */
validator.appendFormErrors = function(formId, fieldId, error, formContainer)
{
	if ($('#' + validator.errorContainerId(formId, fieldId)).length == 0) {
		var errorType			= (error.type ? error.type : validator.validationRules[formId].errorType);
		var errorContainerId	= (error.elementId ? error.elementId : fieldId);
		var errorClasses		= validator.settings.errorClasses[errorType];

		switch (errorType) {
			case 'largeWithField':
				var margin  = '0px';

				// for field with type tinymceOrTextarea set errorContainerId its parent id
				if (validator.currentErrorField								&&
					validator.currentErrorField.type						&&
					('tinymceOrTextarea' == validator.currentErrorField.type ||
						'tinymce' == validator.currentErrorField.type)		&&
					tinyMCE.get(fieldId)						&&
					$('#'+fieldId).parent('.textarea').length)
				{
					errorContainerId = $('#'+fieldId).parent('.textarea').prop('id');
				}

				if (validator.currentErrorField								&&
					validator.currentErrorField.type						&&
					('tinymceOrTextarea' == validator.currentErrorField.type ||
						'tinymce' == validator.currentErrorField.type)		&&
					tinyMCE.get(fieldId)						&&
					$('#'+fieldId).closest('.formFieldArea').length)
				{
					$('#'+fieldId).closest('.formFieldBox').prop('id',fieldId+'Container');
					errorContainerId = fieldId+'Container';
				}

				var errorHolder = errorContainerId + "-error-holder";

				if ($("#" + errorHolder).size()) {
					errorContainerId = errorHolder;
				}

				var validateElement = (formContainer ? formContainer.find('[id$='+fieldId+']') : $('#'+errorContainerId));

				if (!validateElement.parents().hasClass('formFieldArea')){
				    if (validateElement.parent().prop('id')) {
					    margin = validateElement.parents('div.largeWithFieldControl').css('margin-bottom');
				    }
				    else {
					    margin = validateElement.css('margin-bottom');
				    }
				}

				var ie8Corner = '';
				if($.browser.msie && ($.browser.version.substr(0,1)=="8")){
					ie8Corner = '<div class="ie8CornerLeft ie8Corner">&nbsp;</div><div class="ie8CornerRight ie8Corner">&nbsp;</div>'
				}
				var elem = $('<div  style="margin-top:-'+margin+';" class="'+errorClasses.message+
					'" id="'+validator.errorContainerId(formId, errorContainerId)+'"><div class="msgBody"><span>'+error.message+'</span>'+ie8Corner+'</div></div>');

				if (!validateElement.parents().hasClass('formFieldArea')) {
					if (formContainer) {
						var errorContainer = formContainer.find('[id$='+errorContainerId+']');
						if (errorContainer.parents().hasClass('formFieldArea')) {
							errorContainer = errorContainer.parents('.formFieldArea').find('.formField');
						}
						elem.insertAfter(errorContainer);
						errorContainer.addClass(errorClasses.control);
						validator.prepareErrorBeforeShow(formId, fieldId, elem);
					}
					else {
						if ((errorContainerId == 'passwordConfirmContainer')||(errorContainerId == 'passwordContainer')) {
							elem.appendTo('#'+errorContainerId);
						}
						else {
							elem.insertAfter('#'+errorContainerId);
						}
						$('#'+errorContainerId).addClass(errorClasses.control);
						validator.prepareErrorBeforeShow(formId, fieldId, elem);
					}
				}
				else {
						var errorContainer = validateElement.parents('.formFieldArea').find('.formField');
						elem.insertAfter(errorContainer);
						errorContainer.addClass(errorClasses.control);
						validator.prepareErrorBeforeShow(formId, fieldId, elem);
				}

				// set width for error message
				validateElement = (formContainer ? formContainer.find('[id$='+fieldId+']') : $('#'+errorContainerId));

				$('#'+validator.errorContainerId(formId, errorContainerId)).addClass('noResize');
				widthValid	= $('#'+validator.errorContainerId(formId, errorContainerId)+' span').width()+20;
				sumWidth	= validateElement.innerWidth()+2;

				fixWidthValidationMsg(widthValid, sumWidth, validateElement, $('#'+validator.errorContainerId(formId, errorContainerId)),false)
				setTimeout(function(){
					fixWidthValidationMsg(false, false, false, false, $('.largeWithFieldMessage'));
				},200);


			break;

			case 'tooltipUnderField':
				// show only one tooltip on page
				if ('undefined' == typeof(validator.tooltipAlreadyShow) || !validator.tooltipAlreadyShow) {
					var tooltipOptions = [];
					tooltipOptions['title']			= '<span class="gdAttention" >&nbsp;</span>Ошибка';
					tooltipOptions['underElement']	= true;
					tooltipOptions['width']			= 'auto';
					tooltip.show(fieldId, error.message, tooltipOptions);
					validator.tooltipAlreadyShow = true;
				}
			break;

			case 'smallNoField':
				var elem = $('<div class="'+errorClasses.message+'">'+error.message+'</div>');
				if (formContainer) {
					var errorContainer = formContainer.find('[id$='+errorContainerId+']');
					elem.insertAfter(errorContainer);
				}
				else {
					elem.insertAfter('#'+errorContainerId);
				}

			break;

			case 'smallNoFieldOne':
				$('.'+errorClasses.message).remove();
				var elem = $('<div class="'+errorClasses.message+'">'+error.message+'</div>');
				if (formContainer) {
					var errorContainer = formContainer.find('[id$='+errorContainerId+']');
					elem.insertAfter(errorContainer);
				}
				else {
					elem.insertAfter('#'+errorContainerId);
				}

			break;

			case 'noField':
				var elem = $('<div class="'+errorClasses.message+'">'+error.message+'</div>');
				if ($('#'+fieldId).closest('.formFieldArea').length && undefined == errorContainerId) {
					$('#'+fieldId).closest('.formFieldBox').append(elem);
					return false;
				}

				if (formContainer) {
					var errorContainer = formContainer.find('[id$='+errorContainerId+']');
					errorContainer.prepend(elem);
				}
				else {
					$('#'+errorContainerId).prepend(elem);
				}
			break;

			case 'noFieldMultiple':
				var elem = $('<div class="'+errorClasses.message+'">'+error.message+'</div>');
				errorContainerId = errorContainerId.replace(fieldId, '');
				if (!$('div').hasClass(errorClasses.message)) {
					$('#'+errorContainerId).prepend(elem);
				}
			break;

			case 'alert':
				pwh.alert({message: error.message});
			break;

			case 'fadebox':
				fadeBoxShow('attention', error.message);
			break;

			case 'hidden':
				// do nothing
			break;

			case 'beforeField':
				var elem				= $('<div class="'+errorClasses.message+'">'+error.message+'</div>');
				var errorContainerId	= 'errorContainer_'+fieldId;
				var errorContainer		= '<div id="'+errorContainerId+'" class="validatorMsg"></div>';
				// add error container if needed
				if (0 == $('#'+errorContainerId).length) {
					$("[name='"+fieldId+"']:first").parent().before(errorContainer);
				}

				if (!$('div').hasClass(errorClasses.message)) {
					$('#'+errorContainerId).prepend(elem);
				}
			break;

			default:
				throw('Invalid error type "' + errorType + '"');
			break;
		}
	}
}

/**
 * generates error container id
 */
validator.errorContainerId = function(formId, fieldId)
{
	return ('error_container_' + formId + '_' + fieldId);
}

// control defaults methods
/**
 * inits all control defaults
 */
validator.initControlDefaults = function()
{
	$.each(validator.validationRules, function (formId) {
		validator.initControlDefaultForConcreteForm(formId);
	});
}

/**
 * init control default for concrete form
 */
validator.initControlDefaultForConcreteForm = function(formId)
{
	var formValidationRules = validator.validationRules[formId];
	var elem;
	$.each(formValidationRules['fields'], function(index, field) {
		elem = (field.multiple && 1 == field.multiple) ? $('[name^="' + field.id + '["]') : $('#' + field.id);

		// mark required fields
		if (formValidationRules['markRequiredFields']
			&& field.required
			&& !field.hideRequiredFieldMark
			&& elem.prop('type') != 'hidden'
		) {
			if (elem.parents('.formFieldArea').find('.formFieldTop').length > 0) {
				var topLabel = elem.parents('.formFieldArea').find('.formFieldTop');
				if (topLabel.length > 0) {
					topLabel.html(topLabel.html() + validator.settings.requiredFieldMark);
				}
				else {
					elem.parents('.formFieldArea').find('.formField').before(validator.settings.requiredFieldMark);
				}
			}
			else {
				elem.before(validator.settings.requiredFieldMark);
			}
		}
		elem.each(function(index, e){
			if (field.controlDefault && field.controlDefault.length > 0) {
				var typeField = e.tagName.toLowerCase();
				if (typeField == 'textarea' || (typeField == 'input' && (e.type.toLowerCase() == 'text' || e.type.toLowerCase() == 'password'))) {
					if (0 == e.value.length || (field.controlDefault == e.value && e.name != 'maxScore')) {
						$(e).attr('value', field.controlDefault);
						$(e).addClass('defaultValue');
					}
					$(e).bind('focus', function(e) {validator.controlDefaultOnFocus(e, field.controlDefault)});
					$(e).bind('blur', function(e) {validator.controlDefaultOnBlur(e, field.controlDefault)});
				}
			}

			// Not work for multiply field
			if (field.controlTooltip) {
				if (field.type && 'radio' == field.type) {
					$('input[name=' + e.id + ']').unbind('focus.tooltip');
					$('input[name=' + e.id + ']').unbind('blur.tooltip');
					$('input[name=' + e.id + ']').bind('focus.tooltip', validator.controlTooltipOnFocus);
					$('input[name=' + e.id + ']').bind('blur.tooltip', validator.controlTooltipOnBlur);
				}
				else {
					$(e).unbind('focus.tooltip');
					$(e).unbind('blur.tooltip');
					$(e).bind('focus.tooltip', validator.controlTooltipOnFocus);
					$(e).bind('blur.tooltip', validator.controlTooltipOnBlur);
				}
			}

			$.each(field['rules'], function(index2, rule) {
				if ('undefined' == typeof(rule['code'])) {
					return true;
				}
				var maxLength = {};

				$.each(rule['code'], function(index3, rule) {
					var ruleParts = rule.split(':');
					if ('maxlength' == ruleParts[0]) {
						maxLength = {'value': ruleParts[1]};
						return false;
					}
				});

				if (0 != Object.size(maxLength)) {
					var fieldType = e.type;
					if (!e.maxlength && (fieldType == 'text' || fieldType == 'password')) {
						$(e).attr('maxlength', maxLength.value);
					}
					return false;
				}
			});
		});
	});
}

/**
 * show tooltip by fieldId
 */
validator.tooltipShow = function(inputId)
{
	var field	= $('#' + inputId),
		formId	= field.closest('form').prop('id'),
		controlTooltip = null,
		controlTooltipBody = null,
		fieldId = inputId;

	if (field.prop('type') == 'radio') {
		controlTooltip = validator.validationRules[formId]['fields'][field.attr('name')]['controlTooltip'][field.attr('value')];
		fieldId = field.nextAll('label:first').prop('id');
	}
	else {
		controlTooltip = validator.validationRules[formId]['fields'][inputId]['controlTooltip'];
	}
	if (controlTooltip.prepareTooltip && typeof window[controlTooltip.prepareTooltip] == 'function') {
		controlTooltipBody = window[controlTooltip.prepareTooltip](controlTooltip['body']);
	}
	else {
		controlTooltipBody = controlTooltip['body'];
	}
	tooltip.show(fieldId, controlTooltipBody, {'title': controlTooltip['title']});
}

/**
 * control on focus method - show field tooltip
 */
validator.controlTooltipOnFocus = function(event)
{
	validator.tooltipShow($(event.target).prop('id'));
}

/**
 * control on focus method - hide field tooltip
 */
validator.controlTooltipOnBlur = function(event)
{
	tooltip.hide();
}

/**
 * show/hide tooltip for tinyMCE fields
 */
validator.tinymceTooltip = function(ed) {
	var realId = ed.id;
	var formId = $('#'+realId).parents('form').prop('id');
	var field = validator.validationRules[formId]['fields'][realId];
	if (field['controlTooltip'] && field['controlTooltip']['body']) {
		tinymce.dom.Event.add(ed.getWin(), 'focus', function() {
			var tinyId = realId + '_container';
			if ($(realId + '_parent').length) {
				tinyId = realId + '_parent';
			}
			tooltip.show(tinyId, validator.validationRules[formId]['fields'][realId]['controlTooltip']['body']);
		});
		tinymce.dom.Event.add(ed.getWin(), 'blur', function() {
			tooltip.hide();
		});
	}
}

/**
 * control on focus method - clears default value
 */
validator.controlDefaultOnFocus = function(event, controlDefault)
{
	var fieldId = $(event.target).prop('id');
	var e = $('#' + fieldId);
//	var formId = e.closest('form').prop('id');
//	var field = validator.validationRules[formId]['fields'][fieldId];
	if (e.hasClass('defaultValue')) {
		var typeField = e[0].tagName.toLowerCase();
		if (typeField == 'textarea' || (typeField == 'input' && (e.prop('type').toLowerCase() == 'text' || e.prop('type').toLowerCase() == 'password'))) {
			e.attr('value', '');
			e.removeClass('defaultValue');
		}
	}
}

/**
 * control on blur method - restores default value for empty field
 */
validator.controlDefaultOnBlur = function(event, controlDefault)
{
	var fieldId	= $(event.target).prop('id');
	var e		= $('#' + fieldId);
//	var formId = e.closest('form').prop('id');
//	var field = validator.validationRules[formId]['fields'][fieldId];
	if (0 == e.attr('value').length) {
		var typeField = e[0].tagName.toLowerCase();
		if (typeField == 'textarea'
			|| (typeField == 'input'
				&& (e.prop('type').toLowerCase() == 'text'
					|| e.prop('type').toLowerCase() == 'password'))
		) {
			e.attr('value', controlDefault);
			e.addClass('defaultValue');
		}
	}
}
// control defaults methods - end

// validation object - end


// metods - start
/**
 *  Strip HTML and PHP tags from a string
 *
 */
function strip_tags(str)
{
	return str.replace(/<\/?[^>]+>/gi, '');
}

/**
 * Strip HTML and PHP tags from a string
 * @param str string
 * The input string.
 * @param allowed_tags string[optional]
 * You can use the optional second parameter to specify tags which should
 * not be stripped.
 * @return string the stripped string.
 */
function strip_tags_html (str, allowed_tags) {

    var key = '', allowed = false;
    var matches = [];
    var allowed_array = [];
    var allowed_tag = '';
    var i = 0;
    var k = '';
    var html = '';

    var replacer = function (search, replace, str) {
        return str.split(search).join(replace);
    };
    // Build allowes tags associative array
    if (allowed_tags) {
        allowed_array = allowed_tags.match(/([a-zA-Z0-9]+)/gi);
    }
    str += '';
    // Match tags
    matches = str.match(/(<\/?[\S][^>]*>)/gi);
    // Go through all HTML tags
    for (key in matches) {
        if (isNaN(key)) {
            // IE7 Hack
            continue;
        }
        // Save HTML tag
        html = matches[key].toString();
        // Is tag not in allowed list? Remove from str!
        allowed = false;
        // Go through all allowed tags
        for (k in allowed_array) {
            // Init
            allowed_tag = allowed_array[k];
            i = -1;
            if (i != 0) {i = html.toLowerCase().indexOf('<'+allowed_tag+'>');}
            if (i != 0) {i = html.toLowerCase().indexOf('<'+allowed_tag+' ');}
            if (i != 0) {i = html.toLowerCase().indexOf('</'+allowed_tag)   ;}

            // Determine
            if (i == 0) {
                allowed = true;
                break;
            }
        }
        if (!allowed) {
            str = replacer(html, "", str); // Custom replace. No regexing
        }
    }
    return str;
}


/**
 * Un-quote string quoted with addslashes()
 *
 */
function stripslashes(str)
{
	return str.replace('/\0/g', '0').replace('/\(.)/g', '$1');
}

/**
 *  Convert all applicable characters to HTML entities
 *
 */
function htmlentities(str)
{
	var div  = document.createElement('div');
	var text = document.createTextNode(str);
	div.appendChild(text);
	return div.innerHTML;
}

/**
 * Validate a Gregorian date
 *
 */
function checkdate(month, day, year)
{
	var myDate = new Date(year, month-1, day);
	return ((myDate.getMonth()+1) == month && day<32);
}


/**
 * Check time value
 *
 */
function checktime(hours, minutes)
{
	return hours < 24 && minutes<60;
}

/**
 * Convert special characters to HTML entities
 *
 */
function convertHtmlChars(str)
{
	str = htmlspecialchars(str);
	str = str.replace("\"", "&quot;", 'g');
	return str;
}

/**
 * Clean up for Cross Site Scripting (XSS)
 *
 */
function xssClean(str)
{
	str = strip_tags(str);
	str = stripslashes(str);
	str = htmlentities(str);
	return str;
}

/**
 * Clean up for Cross Site Scripting (XSS)
 *
 */
function xssCleanHtml(str)
{
	str = strip_tags_html(str, '<p><span><ol><li><i><em><strong><b><strike><u><ul><br><address><pre><h1><h2><h3><h4><h5><h6><hr><a><img><blockquote><table><thead><tbody><tfoot><th><tr><td><caption><sub><sup>');
	str = stripslashes(str);
	return str;
}

/**
 * Validate date
 *
 */
function validateDate(str)
{
	reg = /^(\d{1,2})(\-|\/|\.)(\d{1,2})\2(\d{2,4})$/;
	var matches = str.match(reg);
	if (matches != null && matches.length == 5) {
		if ('1' == '0') {
			return checkdate(matches[1], matches[3], matches[4]);
		}
		else {
			return checkdate(matches[3], matches[1], matches[4]);
		}
	}
	return false;
}

/**
 * Validate date
 *
 */
function validateDateNoYear(str)
{
	reg = /^(\d{1,2})(\-|\/|\.)(\d{1,2})\2?(\d{2,4})?$/;
	var matches = str.match(reg);

	if (matches != null && matches.length > 3) {
		var year = (matches[4]) ? matches[4] : '1000';
		return checkdate(matches[3], matches[1], year);
	}
	return false;
}


/**
 * Parse date in formats: 'D/M/Y HH:MM', 'Y-m-d H:i'
 */
function parseDateFromString(str)
{
	var dateParts = {};
	var part1;
	var part2;
	// format 'Y-m-d H:i'
	var format = /^(\d{4})-(\d{1,2})-(\d{1,2})\s(\d{1,2}):(\d{1,2})$/;
	if (format.test(str)) {
		dateParts = str.match(format);
		return new Date(
			parseInt(dateParts[1], 10),
			parseInt(dateParts[2], 10) - 1,
			parseInt(dateParts[3], 10),
			parseInt(dateParts[4], 10),
			parseInt(dateParts[5], 10)
		);
	}
	// format 'D/M/Y HH:MM'
	format = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s(\d{1,2}):(\d{1,2})$/;
	if (format.test(str)) {
		dateParts = str.match(format);
		if ('1' == '0') {
			part1	= parseInt(dateParts[2], 10) - 1;
			part2	= parseInt(dateParts[1], 10);
		}
		else {
			part1	= parseInt(dateParts[1], 10);
			part2	= parseInt(dateParts[2], 10) - 1;
		}
		return new Date(
			parseInt(dateParts[3], 10),
			part2,
			part1,
			parseInt(dateParts[4], 10),
			parseInt(dateParts[5], 10)
		);
	}
	// format 'D/M/Y'
	format = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/;
	if (format.test(str)) {
		dateParts = str.match(format);
		if ('1' == '0') {
			part1	= parseInt(dateParts[2], 10) - 1;
			part2	= parseInt(dateParts[1], 10);
		}
		else {
			part1	= parseInt(dateParts[1], 10);
			part2	= parseInt(dateParts[2], 10) - 1;
		}
		return new Date(
			parseInt(dateParts[3], 10),
			part2,
			part1
		);
	}
	return new Date(undefined);
}

/**
 * Validate date
 *
 */
function validateDateTime(str)
{
	reg = /^(\d{1,2})(\-|\/|\.)(\d{1,2})\2(\d{2,4})\s(\d{1,2})(\:\-\.)(\d{1,2})$/;
	var matches = str.match(reg);
	if (matches != null && matches.length == 8) {
		return checkdate(matches[3], matches[1], matches[4]) && checktime(matches[5], matches[7]);
	}
	return true;
}

/**
 * Validate email
 *
 */
function validateEmail(str)
{
	var emailMinLength	= '5';
	var emailMaxLength	= '100';
	var emailLength		= str.length;
	if (emailLength > emailMaxLength || emailLength < emailMinLength) {
		validator.errorCode += 'Length';
		return false;
	}
	reg = /^[a-z0-9_%+-]+([\.a-z0-9_%+-]+)*@([a-z0-9]+[a-z0-9-]*\.)+[a-z]{2,6}$/i;
	validator.errorCode += 'Incorrect';
	return (str.match(reg) != null);
}

/**
 * Validate multi email
 * allowed separator: ';', ' ', ','
 *
 */
function validateMultiEmail(str)
{
	var emailMinLength	= '5';
	var emailMaxLength	= '100';
	var emails			= str.split(/[\s,;]\s*/);
	for(var i in emails) {
		var emailLength = emails[i].length;
		if (emailLength > emailMaxLength || emailLength < emailMinLength) {
			validator.errorCode += 'Length';
			return false;
		}
	}
	reg = /^[a-z0-9_%+-]+([\.a-z0-9_%+-]+)*@([a-z0-9]+[a-z0-9-]*\.)+[a-z]{2,6}(((,\s)|(;\s)|[\s,;])[a-z0-9_%+-]+([\.a-z0-9_%+-]+)*@([a-z0-9]+[a-z0-9-]*\.)+[a-z]{2,6})*$/i;
	validator.errorCode += 'Incorrect';
	return (str.match(reg) != null);
}

/**
 *Phone validation.
 *A phone number should contain at least 5 digits.
 */
function validatePhone(str, isMobile)
{
	isMobile = isMobile || 0;
	var digitsOnly	= str.replace(/[\D]+/g, '');
	var reg = isMobile ? '^[0-9]{10,13}$' : '^[0-9]{5,}$';
	reg = new RegExp(reg);
	return reg.test(digitsOnly);
}

/**
 * Validates price and removes spaces
 */
validator.validatePrice = function(str)
{
	str = priceToFloatFormat(str);
	return (!isNaN(str) && (str != ''));
}


/**
 * Checks max length tags
 */
function tagMaxLength(str, maxLength)
{
	var valid = true;
	$.each(str.split(','), function(i, tag){
		if(tag.length > maxLength) {
			valid = false;
		}
	});
	return valid;
}

/**
 * Checks max length for html text.
 *
 * @return	int 0, if html text length is OK (less than maxLength), or
 *  value > 0, if text should not exceed the returned number of symbols,
 *  value < 0, if html text has too many tags (rich formatting),
 *  and formatting (or text) should be changed to not exceed maxLength
 */
function validateHtmlTextMaxLength(str, maxLength)
{
	var htmlLength = str.length;

	if (htmlLength <= maxLength) {
		return 0;
	}

	// if html text length is greater than max available field size (maxLength)
	// then calculate how many text (without html tags) should be in the string
	// to fit the availaible field size:

	// get text without html tags
	var text		= strip_tags(str);
	var textLength	= text.length;

	// get html tags length
	var tagsLength			= htmlLength - textLength;
	var allowedTextLength	= maxLength - tagsLength;
	return allowedTextLength;
}

/**
 * Checks min length for html text.
 *
 * @return	bool true, if html text length is OK (more or equal than minLength), else - false
 */
function validateHtmlTextMinLength(str, minLength)
{
	// get text without html tags
	var text = strip_tags(str);
	var textLength = text.length;

	// return html tags length
	return textLength >= minLength;
}
// metods - end


$(document).ready(function () {
	validator.initValidator();
});

function fixWidthValidationMsg(widthValid, sumWidth, validateElement, target, arrItem){
	if (!arrItem) {
		if ((widthValid > sumWidth) && ('hidden' != validateElement.prop('type'))) {
			target.removeClass('noResize');
			target.width(sumWidth+'px');
		}
	}
	else {
		$.each(arrItem, function(){
			validateElement = $(this).prev();
			if (validateElement.hasClass('formFieldHidden')) validateElement = validateElement.prev();
			target = $(this);
			target.css('width','auto');
			target.addClass('noResize');
			if ((target.find('span').outerWidth(true)) > validateElement.outerWidth()) {

				target.removeClass('noResize');
				target.width(validateElement.outerWidth()+'px');
			}
		})
	}

}
/**
	* Returns true if checkbox is checked.
	*
	* @param	type $checkbox - field ID
	* @return	bool
	*/
function dependsOnCheckbox(checkbox){
	return 1 == validator.data[checkbox];
}

/**
* Check learning material's price
*
* @param	price	float
* @return			bool
*/
function checkMaterialPrice(price)
{
	if (undefined == price) {
		return false;
	}
	var minMaterialPrice	= priceToFloatFormat(moneyFormat('10'));
	var maxMaterialPrice	= priceToFloatFormat(moneyFormat('5000'));
	price					= parseFloat(price);
	if (0 == price || (price >= parseFloat(minMaterialPrice) && price <= parseFloat(maxMaterialPrice))) {
		return true;
	}
	return false;
}

/**
 * Returns true if form was changed
 *
 * @param	string formId
 * @param	object form
 * @return	bool
 */
validator.checkFormChanges = function(formId, form) {
	if (typeof(form) === 'undefined') {
		form = this.initialValues[formId];
	}
	var newData	= validator.getXmlFormData(formId);
	var result	= false;
	if ($.toJSON(form) != $.toJSON(newData)) {
		result = true;
	}
	return result;
}

/**
 * Checking max mark only on server
 */
validator.checkMaxMark = function(mark) {
	return true;
}

/**
 * Checking weight only on server
 */
validator.checkObjectWeightValue = function(weight) {
	return true;
}

/**
 * Checking weight only on server
 */
validator.checkGroupPeriodInterval = function(date) {
	return true;
}

/**
 * Checking weight only on server
 */
validator.checkGroupPeriodIntervalEnd = function(date) {
	return true;
}

/**
 * Checking questions count
 */
validator.checkOverloadedQuestionsCount = function(str)
{
	if ("undefined" != typeof(validator.check)) {
		if (Number(validator.check.maxQuestionCount) < Number(str)) {
			validator.validationRules.newOverridedAssessmentGroup.fields.questionsCount.rules[1].error.message =
				template(validator.validationRules.newOverridedAssessmentGroup.fields.questionsCount.rules[1].error.defaultMessage, {maxQuestions:validator.check.maxQuestionCount}, '');
			return false;
		}
	}
	return true;
}


validator.courseHighSchoolValidation = function(str)
{
	if (validator.data['courseHighSchoolId'].length == 0 && str.length > 0) {
		return false;
	}
	return true;
}