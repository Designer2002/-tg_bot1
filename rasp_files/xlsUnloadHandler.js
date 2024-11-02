/**
 * Created by mutkin on 3/20/15.
 */

function xlsUnLoadHandler(options) {

    // options
    var that        = this;
    var waitTime    = 5000;     // Как часто проверяем загружен ли файл
    var stopButton  = 'stopXLS';// Иконка/кнопка-крестик, для стопа загрузки
    var mode        = (options.mode != undefined ? options.mode : ''); // Флаг mode
    var showCont    = (options.container!= undefined ? options.container : 'loadComplite'); // Контейнер, для отображения файлов
    var separator   = (options.separator == true ? '<span style="color: lightgray; margin: 0 10px">|&nbsp;</span>' : '');
    var formData    = (options.formData != undefined ? true : false);

    var XLSActions={
        'gen': [options.link +'/generate/' + mode],
        'red': [options.link +'/ready/' + mode],
        'stp': [options.link +'/stop/' + mode],
        'get': [options.link +'/get/' + mode]
    };

    var result = mode.match( /customSql/i );
    if (result){
        XLSActions['get']=[options.link +'/get/'];
    }

    // let's go
    this.ini = function () {
        that.generate();
        that.ready();
        that.stop();
    };

    this.generate = function() {
        $(document).on('click', '.'+options.clickButton, (function () {
            if($('.'+options.clickButton).hasClass('disabled')) {
               return false; 
            }
            $('.'+options.clickButton).addClass('disabled').html("Подождите...");
            if ($('.'+ showCont + ' img').length) {
                return false;
            }
            var postData = {};
            if(formData) {
                postData = $('form').serialize();
            }
            
            $.post(XLSActions['gen'], postData, function (data) {
                if (data) {
                    that.ready();
                }
            });
        }));
    };

    this.stop = function () {
        $(document).on('click', '.'+ stopButton, function () {

            $.post(XLSActions['stp'], function (data) {
                if (data) {
                    $('.'+options.clickButton).css('color', '');
                    $('.xlsArrow').css('color', 'gray');
                    $('.'+showCont).html('');
                }
            });
        });
    };

    this.ready = function () {

        $.post(XLSActions['red'], function (data_ready) {

            var data = $.parseJSON(data_ready);

            switch (data['result']) {
                case 'ok':
                    that.readyForGet(data); // Выдаем ссылку на файл
                    break;
                case 'wait':
                    that.wait(); // Ждем файл
                    break;
                case 'false':
                    if (typeof data['error_msg'] !== "undefined" && data['error_msg'] != '') {
                        alert(data['error_msg']);
                    }
                    that.error(); // Ошибка
                    break;
            }
        });
    };

    this.wait = function () {

        if ($('.'+showCont + ' img').length == 0) {
            var link = separator;
            link    += '<img class="xls-img" src="img/loader3.gif"/>';
            link    += '<span class="'+ stopButton+'">&#x2718;</span>';

            $('.'+options.clickButton).css('color', 'gray');
            $('.xlsArrow').css('color', 'green');

            $('.'+showCont).html(link);
        }

        setTimeout(function() {
            that.ready()
        }, waitTime);
    };

    this.error = function () {

        $('.'+showCont).html("");
        $('.xlsArrow').css('color', 'red');

    };

    this.readyForGet = function(data) {
        var link = separator;
        link    += '<a href="'+XLSActions['get']+'" class="'+options.finalHrefClass+'">'+data['fileName']+'</a>';
        link    += '<span class="'+ stopButton+'">&#x2718;</span>';
        
        $('.'+options.clickButton).removeClass('disabled').html("Выгрузить отчет");
        $('.'+options.clickButton+' span').css('color', 'gray');
        $('.xlsArrow').css('color', 'gray');
        $('.'+showCont).html(link);
    };

    that.ini();

};