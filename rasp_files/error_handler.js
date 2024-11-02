/**
 * Error handler
 * @param msg - message explaining why the error occurred
 * @param url - url of the page with the error script
 * @param lineNumber - line number where the error occurred
 */
function errorHandler(msg, url, lineNumber)
{
	/**
	 * т.к. env'ы не передаются js - закоментированно
	 */
	return true;


	/*

	// убираем проблему с ResizeObserver loop limit exceeded
	if (msg == 'ResizeObserver loop limit exceeded')
		return true;

	// do not log and do not show errors from other domains
	if (- 1 == url.indexOf(baseUrl)) {
		return true;
	}

	// add to msg userAgent info
	if (navigator && navigator.userAgent) {
		msg += ". userAgent = "+navigator.userAgent;
	}
	if (environment == 'production') {
		return true;
	}else{
		$.ajax({
			type	: 'POST',
			async	: true,
			url		: baseUrl + 'ajax/js_error_logger',
			data	: {msg: msg, url: url, lineNumber: lineNumber},
			success	: function (data, textStatus, jqXHR) {
				// do nothing
			},
			error	: function (jqXHR, textStatus, errorThrown) {
				// do nothing
			}
		});
		fadeBoxShow('errorMessage', '' , 0, msg);
		return false;
	}*/
}

/**
 * Logs the error message
 * @param msg - message explaining why the error occurred
 */
function logUploadError(msg)
{
	// add to msg userAgent info
	if (navigator && navigator.userAgent) {
		msg += ", userAgent = " + navigator.userAgent;
	}
	
	$.ajax({
		type	: 'POST',
		async	: true,
		url		: baseUrl + 'ajax/upload_error_logger',
		data	: {msg: msg, url: window.location.href},
		success	: function (data, textStatus, jqXHR) {
			// do nothing
		},
		error	: function (jqXHR, textStatus, errorThrown) {
			// do nothing
		}
	});
}


/**
 * need for pwh.confirm()
 */
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

// window.onerror = errorHandler;
