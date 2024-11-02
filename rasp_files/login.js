$(document).ready(function () {
	$('#loginUsername').prop('disabled', false);
	$('#loginPasswordDefault').prop('disabled', false);

	$('#loginBtn').bind('click', function(event){
		event.preventDefault();
		if (!isCookiesEnabled()) {
			pwh.alert({message:'Для авторизации на сайте необходимо включить cookies'});
		}
		else {
			var options = {
				beforeSubmit: showLoader('ajaxload'),
				success: function(response, statusText) {
					hideLoader('ajaxload');
	
					// redirect to specified url
					if (response.redirect) {
						window.location = response.redirect;
					}
					// show popup message
					else if (typeof(response.html) != 'undefined') {
						pwh.show(response.html);
						$('#currentUrl').attr('value', location.href);
	
						validator.getValidationRules();
						validator.addSubmitEventForConcreteForm('popupLogin');
						validator.initControlDefaultForConcreteForm('popupLogin');
						if (response.serverErrors) {
							validator.showFormErrors('popupLogin', response.serverErrors);
						}
						else {
							validator.data = validator.getAllFormData('popupLogin');
							if (!validator.validateForm('popupLogin')) {
								validator.showFormErrors('popupLogin', validator.validationErrors);
							}
						}
						forgotPasswordEvent();
					}
					else {
						throw('undefined error');
					}
				}
			};
			$('#login').ajaxFormSubmit(options);
		}
	});

	if (!isCookiesEnabled()) {
		$('div.AuthType a, .btOpenId').bind('click', function(e) {
			e.preventDefault();
			pwh.alert({message:'Для авторизации на сайте необходимо включить cookies'});
		});
	}
	else {
		$('.btOpenId').live('click', function(event){
			pwh.hide();
			pwh.show(baseUrl + 'user/show_open_id_popup', {async: false});
			$('#currentUrl').attr('value', location.href);
			validator.getValidationRules();
			validator.addSubmitEventForConcreteForm('openIdLogin');
			$('#openId').focus();
		});
	}
	
	$('#login').bind('submit', function(event) {
		event.preventDefault();
		$('#loginBtn').click();
	});

	$('.openIdService').live('click', function(){
		var newService	= $(this).prop('id');
		var openIdUrl	= oih.getOpenIdUrl($('#openIdServiceLogin').val(), newService);
		oih.setCurrentService(newService, openIdUrl);
	});

	$('#openIdServiceLogin').live('keyup change', function(){
		$('#openId').val(oih.getOpenIdUrl($(this).val()));
	});

	switchPasswordControl([['loginPassword', 'loginPasswordDefault']]);
	
	// reactivate link
	$('#reactivateLink').live('click', function() {
		// Use second selector(#myProfileUsername) to page my_profile
		var data = {'username': $('#popupUsername, #myProfileUsername').val()};
		pwh.hide();
		pwh.fullScreenLoaderShow();
		$.ajax({
			type: 'POST',
			url: baseUrl + 'registration/activation',
			data: data,
			success: function(data){
				pwh.fullScreenLoaderHide();
				pwh.show(data.sendSuccessful);
			},
			dataType: 'json'
		});
		return false;
	});
	
	$('#changeEmailAndActivate').live('click', function(){
		// Use second selector(#myProfileUsername) to page my_profile
		var url = $('#popupUsername, #myProfileUsername').val();
		pwh.hide();
		pwh.fullScreenLoaderShow();
		$.ajax({
			type: 'POST',
			url: baseUrl + 'registration/change_email_and_activate_popup/'+url,
			success: function(data){
				pwh.fullScreenLoaderHide();
				pwh.show(data.html);
				validator.getValidationRules();
				validator.addSubmitEventForConcreteForm('popupChangeEmailAndActivate');
				validator.initControlDefaultForConcreteForm('popupChangeEmailAndActivate');
			},
			dataType: 'json'
		});
		return false;
	});
	
	$('#changeEmailCancel').live('click', function(){
		$('#loginBtn').trigger('click');
		return false;
	});

	// need only for appraiser
	$('#appraiserId').keypress(function(event) {
		validator.removeErrors('appraiserLogin');
		if (13 == event.which) {
			$('#login').click();
		}
	});

	if ('undefined' != typeof php && php.serverTime) {
		//convert unix timestamp to moskow time
		php.serverTime += 3600;

		//convert time to milliseconds
		php.serverTime *= 1000;

		setTime();
		setInterval(setTime, 1000);
	}
});

setTime = function()
{
	php.serverTime += 1000;
	serverDate = new Date(php.serverTime);
	$('#serverTime,#serverTimePopup').html(serverDate.format('d/m/y | H:i'));
}

forgotPasswordEvent = function()
{
	$('#forgotPasswordLink').bind('click', function(){
		$.ajax({
			type: 'POST',
			url: 'user/forgot_password',
			success: function (data, textStatus){
				if ('success' == textStatus) {
					pwh.show(data.html, {'setFocus': false});
					validator.getValidationRules();
					validator.addSubmitEventForConcreteForm('forgotPassword', validator.validationRules.forgotPassword);
				}
			},
			dataType: 'json'
		});
		return false;
	});
};

forgotPasswordCompleted = function(data)
{
	if (data.mailSent) {
		$('#forgotPasswordBody').html(data.messages);
		$('#forgotPasswordBtn').remove();
		$('#forgotPasswordEmail').prop('readonly', 'readonly');
	}
};

// change email and activate callback function
emailChangedAndActivated = function(html)
{
	pwh.show(html.html);
};