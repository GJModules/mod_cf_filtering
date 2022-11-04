<?php
/**
 * @package     customfilters
 * @subpackage  mod_cf_filtering
 * @copyright   Copyright (C) 2012-2021 breakdesigns.net . All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

/**
 * @param string $direction
 * @param array $selected_filters
 * @param string $results_trigger
 * @param string $results_loading_mode
 * @param int $module_id
 * @param string $filter_key
 * @param bool $inputs
 * @param int $slider_min_value
 * @param int $slider_max_value
 * @return array
 */
function setSliderScripts($direction, $selected_filters, $results_trigger, $results_loading_mode, $module_id, $filter_key, $inputs = false, $slider_min_value = 0, $slider_max_value = 100)
{
    $display_key = $filter_key . '_' . $module_id;
    if (!empty($selected_filters['selected_flt'][$filter_key][0])) $setMin = $selected_filters['selected_flt'][$filter_key][0];
    if (!empty($selected_filters['selected_flt'][$filter_key][1])) $setMax = $selected_filters['selected_flt'][$filter_key][1];


    $js_process = "{$display_key}_sliderObj = new Cfslider('$display_key','$module_id', {
									start:" . $slider_min_value . ",
									end:" . $slider_max_value . ",
									offset:18,
									snap:false,
									direction:'".$direction."',
									onMouseMove:function(pos){
									if(pos.min_moved){
										document.id('" . $display_key . "_0').value=pos.minpos;
										if(typeof tipFrom$display_key != 'undefined') {
										    tipFrom$display_key.setValue(pos.minpos.toString());
										    tipFrom$display_key.positionX();
										}
									}
									if(pos.max_moved){
										document.id('" . $display_key . "_1').value=pos.maxpos;
	                                    if(typeof tipTo$display_key != 'undefined') {
	                                        tipTo$display_key.setValue(pos.maxpos.toString());
	                                        tipTo$display_key.positionX();
	                                    }
									}
									customFilters.validateRangeFlt($module_id,'$filter_key');
									}";

    if ($results_trigger == 'btn' || $results_loading_mode == 'ajax') {
        $js_process .= ",
									onComplete:function(e){
										customFilters.listen(e,this, $module_id);
									}";
    }
    $js_process .= "});";

    $scriptProcesses[] = $js_process;

    if (!empty($setMin) && empty($setMax)) {
        $scriptProcesses[] = " {$display_key}_sliderObj.setMin($setMin);";
        $scriptProcesses[] = " {$display_key}_sliderObj.setMax($slider_max_value);";
    } elseif (!empty($setMax) && empty($setMin)) {
        $scriptProcesses[] = " {$display_key}_sliderObj.setMin($slider_min_value);";
        $scriptProcesses[] = " {$display_key}_sliderObj.setMax($setMax);";
    } elseif (!empty($setMin) && !empty($setMax)) {
        $scriptProcesses[] = " {$display_key}_sliderObj.setMin($setMin);";
        $scriptProcesses[] = " {$display_key}_sliderObj.setMax($setMax);";
    }

    //tooltips only if the inputs are not displayed
    if (!$inputs) {
        $scriptProcesses[] = "
					tipFrom$display_key=new CfTooltip('#" . $display_key . "_knob_from', '" . $display_key . "_knob_from_tooltip');
					tipTo$display_key=new CfTooltip('#" . $display_key . "_knob_to' , '" . $display_key . "_knob_to_tooltip');";
    }

    return $scriptProcesses;
}
