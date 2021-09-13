//LEGACY CODE. HAS BEEN SUPERCEDED BY demoClass.js

//thanks to http://stackoverflow.com/questions/11101364/javascript-detect-shift-key-down-within-another-function
var shiftDown = false;
var setShiftDown = function(event){
	if(event.keyCode === 16 || event.charCode === 16){ //for future reference, alt key is 18
		shiftDown = true;
	}
};

var setShiftUp = function(event){
	if(event.keyCode === 16 || event.charCode === 16){
		shiftDown = false;
	}
};

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

$(document).on("keydown", function(e){
	setShiftDown(e);
});

$(document).on("keyup", function(e){
	setShiftUp(e);
});

$(document).ready(function(){

	if (typeof(ui) !== "undefined"){
		UI('#ui-container', ui);		
	}

	$(document).trigger({
		type: "uiLoaded"
	});

});

var UI = function(element_id = '#ui-container', ui) {
	for (var prop in ui){

		(function(prop){

			propContainerSelector = '#'+prop+'-interface'; 

			if (ui[prop].className){
				className = ui[prop].className + " ";
			} else {
				className = '';
			}
			if (ui[prop].parent) element_id = ui[prop].parent;
			$(element_id).append("<div class='interface mb-3 " +className+"' id='"+prop+"-interface'></div>");

			//buttons don't need <label> tags because their "label" is determined like so: <button>Label</button>
			if (ui[prop].type != "button"){
				$(propContainerSelector).append("<label >"+ui[prop].title+"</label>");
			}

			  if (isNumber(ui[prop].value) && (!$.isArray(ui[prop].values))){ 
				  if (ui[prop].units){
					  sliderInputBoxHTML = "<div class='input-group'><input class='form-control with-units' type='number' value='"+ui[prop].value+"'><span class='input-group-text'>"+ui[prop].units+"</span></div>";
				  } else if (ui[prop].input === 'readonly'){
					  sliderInputBoxHTML = "<input value='"+ui[prop].value+"' readonly>";
				  } else if (ui[prop].input === 'hidden') {
					  sliderInputBoxHTML = "<input class='form-control' value='"+ui[prop].value+"' type='hidden'>";
				  } else {
					  sliderInputBoxHTML = "<input class='form-control' type='number' value='"+ui[prop].value+"'>";
				  }
 
				$(propContainerSelector).append(sliderInputBoxHTML);

				if (ui[prop].range) {
					$(propContainerSelector).append('<div id="'+prop+'-slider" class="mt-3 mb-5"></div>');
					
					var slider = $('#'+prop+'-slider')[0];
					noUiSlider.create(slider, {
						range: {min: ui[prop].range[0], max: ui[prop].range[1]},
						start: ui[prop].value,
						handles: 1,
						connect: "lower",
						pips: {
							mode: 'count',
							values: 3,
							density: 4
						},
						step: (ui[prop].step) ? ui[prop].step : undefined
					}).on("slide", function(){
						var v = parseFloat(this.get());
						ui[prop].value = v;
						$('#'+prop+'-interface input').val(v);
						update(prop);
					});
					//set color
					if (ui[prop].color){
						$('#'+prop+'-interface .noUi-connect').css("background-color", ui[prop].color);
					}
				}

				$('#'+prop+'-interface input').change(function(e){
					var v = parseFloat(e.target.value);
					if (v && !isNaN(v)) {
						if (ui[prop].range) slider.noUiSlider.set([v]);
						ui[prop].value = v;
						update(prop);
					}
				});

			} else if (ui[prop].value === true || ui[prop].value === false) {

				$('#'+prop+'-interface label').attr("for", prop+'-checkbox');

				initialCheckboxSetting = ui[prop].value === true ? "checked" : "";

				$(propContainerSelector).append("<div class='checkbox form-check'><input class='form-check-input' type='checkbox' value='None' id='"+prop+"-checkbox' name='check' "+initialCheckboxSetting+" /><label class='form-check-label' for='"+prop+"-checkbox'></label></div>");

				$('#'+prop+'-interface input').change(function(){
					if ($(this).prop('checked')){
						ui[prop].value = true;
						eventLabel = 'checkbox: switch on'
					} else {
						ui[prop].value = false;
						eventLabel = 'checkbox: switch on'
					}
					//ga('send', 'event', ui[prop].title, eventLabel, window.location.pathname);
					update(prop);
				});
			} else if ($.isArray(ui[prop].values)){
				//Dropdown Menus
				$(propContainerSelector).append("<select class='form-select'></select>");

				for (var i  = 0 ; i < ui[prop].values.length ; i++){
					var text, val;
					if (ui[prop].values[i].length) {
						text = ui[prop].values[i][0];
						val = ui[prop].values[i][1];
					} else {
						val = ui[prop].values[i];
						text = val;
					}
					$('#'+prop+'-interface select').append("<option value='"+val+"'>"+text+"</option>");
				}

				$('#'+prop+'-interface select option[value="'+ui[prop].value+'"]').prop('selected', true);

				$('#'+prop+'-interface select').change(function(e){
					ui[prop].value = $(this).val();
					//ga('send', 'event', ui[prop].title, 'Dropdown change: ' + ui[prop].value, window.location.pathname);
					$('#'+prop+'-interface select option')
						.prop('selected', false)
						.filter('[value="'+ui[prop].value+'"]').prop('selected', true);
					update(prop);
					//console.log('select ', prop, ':', ui[prop].value);
				});

			} else if (ui[prop].type == "button"){
				$(propContainerSelector).append("<button class='btn btn-primary'>"+ui[prop].title+"</button>").click(function(){
					update(prop);
				});
			} else {
				$(propContainerSelector).append("<input value='"+ui[prop].value+"' readonly>");
			}
		})(prop);

	}
}