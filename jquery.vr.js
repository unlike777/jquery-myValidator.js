/*!
 * jQuery Validate Plugin v0.2
 *
 * Copyright 2013 UNLIKE | MAHOGANY GROUP
 * Released under the MIT license
 * 
 * css classes for validation
 * .vr-required - поле обязательно для заполнения
 * .vr-email - проверка на эл. почту
 * .vr-url - проверка на ссылку
 * .vr-not-clean - не очещать поле после отправки формы
 * 
 * attributes for validation
 * vr-name - имя поля, необходимо для уведомлений
 * vr-min-length - минимально допустимая длинна
 * vr-max-length - максимально допустимая длинна
 * 
 * css classes generated by plugin
 * .vr-error - поле не валидное
 * .vr-correct - поле прошло проверку
 * .vr-touched - поле было изменено, поэтому можно начать проверку
 * 
 * additional fields
 * .vr-notice-{input name} - контейнер для отображения ошибки конкретного поля
 */

(function( $ ) {
	$.fn.myValidator = function(options) {

		//дефолтные настройки
		var settings = $.extend( {
			//скорость проверки формы
			speed: 200,
			//уведомление об ошибки в поле, $this - указывает на поле
			notice: function($this, text) {
				$this.focus(); 
				alert(text);
			},
			//$this - указывает на форму, clean - функция очистки формы
			onSubmit: function($this, clean) {
				//clean(); //если форма отправляется ajax'ом можно ее очистить
			},
			//$this - указывает на форму
			beforeSubmit: function($this) {
				
			},
			//$this - указывает на форму
			afterSubmit: function($this) {
				
			},
			reEmail: /^([a-z0-9\.\-\_])+\@(([a-zA-Z0-9\-\_])+\.)+([a-zA-Z0-9]{2,4})+$/i,
			reUrl: /(([a-z0-9\-\.]+)?[a-z0-9\-]+(!?\.[a-z]{2,4}))/i
		}, options);
		
		//Нужно поменять макросы в тексте на значения в массиве
		function parse(keys, text) {
			$.each(keys, function(key, val) {
				text = text.replace('{'+key+'}', val);
			});
			return text;
		}
		
		//Проверить конкретное поле и вернуть текст ошибки, если поле не прошло проверку, или true если все ок
		function check($inp) {
			var val = $.trim($inp.val()),
				name = (($inp.attr('vr-name') !== undefined) && ($inp.attr('vr-name') != '')) ? $inp.attr('vr-name') : $inp.attr('name');
			
			if ($inp.hasClass('vr-required')) {
				if (val == '') {
					return parse({name: name}, 'Поле "{name}" обязательно для заполнения');
				}
			}

			var min_len = $inp.attr('vr-min-length');
			if (min_len > 0) {
				if (val.length < min_len) {
					return parse({name: name, min_len: min_len}, 'Количество символов для поля "{name}" не должно быть меньше {min_len}');
				}
			}

			var max_len = $inp.attr('vr-max-length');
			if (min_len > 0) {
				if (val.length < max_len) {
					return parse({name: name, max_len: max_len}, 'Количество символов для поля "{name}" не должно быть больше {max_len}');
				}
			}

			
			if ($inp.hasClass('vr-email')) {
				if (!settings.reEmail.test(val)) {
					return parse({name: name}, 'Для поля "{name}" эл. почта указана в неправильном формате');
				}
			}

			if ($inp.hasClass('vr-url')) {
				if (!settings.reUrl.test(val)) {
					return parse({name: name}, 'Для поля "{name}" ссылка указана в неправильном формате');
				}
			}
			
			return true;
		}
		
		//финальная проверка, в момент отправления формы
		function final($form) {
			var $check = true;

			$form.find('input, textarea').not('input[type="submit"]').each(function() {
				var $inp = $(this),
					error_text = check($inp);
				
				if (error_text !== true) {
					$check = false;
					settings.notice($inp, error_text);
					return false;
				}
			});
			
			return $check;
		}

		//Провеяем форму в реальном времени
		function validate($form) {
			$form.find('input, textarea').not('input[type="submit"]').each(function() {
				var $inp = $(this),
					$inp_name = $inp.attr('name'),
					$notice_class = '.vr-notice-'+$inp_name;
				
				//если поле уже было тронуто
				if ($inp.hasClass('vr-touched')) {
					var old_val = $inp.attr('vr-data-old'),
						cur_val = $inp.val();
					
					//если поле изменилось
					if (old_val != cur_val) {
						var error_text = check($inp);
						
						$inp.attr('vr-data-old', cur_val);
						
						if (error_text !== true) {
							$inp.removeClass('vr-correct').addClass('vr-error');
							if ($inp_name != '') {
								$form.find($notice_class).html(error_text);
							}
						} else {
							$inp.removeClass('vr-error').addClass('vr-correct');
							if ($inp_name != '') {
								$form.find($notice_class).html('');
							}
						}
					}
				}
			});
		}
		
		function clean($form) {
			var $inps = $form.find('input, textarea').not('.vr-not-clean').not('input[type="submit"]');
			$inps.removeClass('vr-touched').removeClass('vr-correct').removeClass('vr-error');
			$inps.each(function() {
				var $this = $(this);
				if ($this.attr('vr-data-old') !== undefined) {
					$this.attr('vr-data-old', '');
				}
			});
			$inps.val('');
		}
		
		return this.each(function() {
			
			var $form = $(this);

			/****************************************************/
			//нужно отделить уже измененные поля от еще не тронутых
			$form.find('input, textarea').not('input[type="submit"]').on('blur', function() {
				$(this).addClass('vr-touched');
			});

			//также смотрим на уже заполненные поля
			$form.find('input, textarea').not('input[type="submit"]').each(function() {
				var $inp = $(this);
				if ($.trim($inp.val()) != '') {
					$inp.addClass('vr-touched');
				}
			});
			/****************************************************/
			
			$form.on('submit', function() {

				if (settings.beforeSubmit($form) === false ||
					final($form) === false ||
					settings.onSubmit($form, function() {clean($form);}) === false ||
					settings.afterSubmit($form) === false)
						return false;
				
			});
			
			setInterval(function() {validate($form);}, settings.speed);
		
		});

	};
})(jQuery);