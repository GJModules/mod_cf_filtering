<?php
/**
 * @package     customfilters
 * @subpackage  mod_cf_filtering
 * @copyright   Copyright (C) 2012-2021 breakdesigns.net . All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

use Joomla\CMS\Language\Text;
use Joomla\CMS\Helper\ModuleHelper;

if (count($filter->getOptions()) == 0) {
    return false;
}

if (empty($key)) {
    $key = '';
}

$inputTextExist = in_array(CfFilter::DISPLAY_INPUT_TEXT, $filter->getDisplay());
$symbol_start = '';
$symbol_end = '';
$script = '';
$display_key = $key . '_' . $module->id;
$value_found = false;
$clear_url = JRoute::_($urlHandler->getURL($filter, '', 'clear'));
$options = $filter->getOptions();
?>

    <div class="cf_filtering_slide_container" id="<?php echo $display_key ?>_slider">
        <div class="cf_filtering_slider_gutter" id="<?php echo $display_key ?>_slider_gutter">
            <div class="cf_filtering_slider_gutter_item cf_slider_gutter_m" id="<?php echo $display_key ?>_slider_gutter_m">
                <div id="<?php echo $display_key ?>_slider_bkg_img" class="slider_bkg_img" tabindex="-1"></div>
                <div class="knob_wrapper">

                    <?php if (isset($options[0])) {
                        // print slider knob 1 (Min)
                        $option_from = $options[0];
                        $display_key_element = $display_key.'_knob_from';
                        $currentValue = !empty($option_from->value) ? $option_from->value : $option_from->slider_min_value; ?>
                        <div class="cf_filtering_knob cf_filtering_knob_from"
                             id="<?php echo $display_key_element?>"
                             rel="<?php echo $option_from->value ?>"
                             role="slider"
                             aria-valuemin="<?php echo $option_from->slider_min_value?>"
                             aria-valuemax="<?php echo !empty($options[1]) ? $options[1]->slider_max_value : '300'?>"
                             aria-valuenow="<?php echo $currentValue?>"
                             data-tooltip="<?php echo $currentValue?>"
                             aria-label="<?php echo Text::_('MOD_CF_FILTERING_RANGE_MIN_PLACEHOLDER');?>"
                             tabindex="0"
                        >
                        </div>
                        <?php
                        if (!$inputTextExist) {
                            // Add Tooltip
                            $tooltipContent = $currentValue;
                            require JModuleHelper::getLayoutPath('mod_cf_filtering', 'default_tooltip');
                            ?>
                            <input  name="<?php echo $key ?>[0]"
                                    value="<?php echo $option_from->value ?>"
                                    type="hidden"
                                    id="<?php echo $display_key ?>_0">
                            <?php
                        }
                    } ?>

                    <?php if (isset($options[1])) {
                        // print slider knob 2 (Max)
                        $option_to = $options[1];
                        $display_key_element = $display_key.'_knob_to';
                        $currentValue = !empty($option_to->value) ? $option_to->value : $option_to->slider_max_value; ?>
                        <div class="cf_filtering_knob cf_filtering_knob_to"
                             id="<?php echo $display_key_element ?>"
                             rel="<?php echo $option_to->value ?>"
                             role="slider"
                             aria-valuemin="<?php echo !empty($options[0]) ? $options[0]->slider_min_value : '0'?>"
                             aria-valuemax="<?php echo $option_to->slider_max_value?>"
                             aria-valuenow="<?php echo $currentValue?>"
                             data-tooltip="<?php echo $currentValue?>"
                             aria-label="<?php echo Text::_('MOD_CF_FILTERING_RANGE_MAX_PLACEHOLDER');?>"
                             tabindex="0"
                        >
                        </div>
                        <?php
                        if (!$inputTextExist) {
                            $tooltipContent = $currentValue;
                            // Add Tooltip
                            require JModuleHelper::getLayoutPath('mod_cf_filtering', 'default_tooltip');
                            ?>
                            <input  name="<?php echo $key ?>[1]"
                                    value="<?php echo $option_to->value ?>"
                                    type="hidden"
                                    id="<?php echo $display_key ?>_1">
                            <?php
                        }
                    }?>
                </div>
            </div>
        </div>
        <?php if (!$inputTextExist) { ?>
            <div class="cf_message" id="<?php echo $display_key ?>_message" tabindex="-1"></div>
            <input type="hidden" value="<?php echo $clear_url ?>" id="<?php echo $display_key ?>_url"/>

            <?php
            if ($results_trigger != 'btn' && $results_loading_mode != 'ajax') {
                ?>

                <button type="submit" class="cf_search_button btn" id="<?php echo $display_key ?>_button'.'"
                        title="<?php echo JText::_('MOD_CF_APPLY'); ?>">
                    <i class="cficon-search"></i>
                </button>
                <?php
            }
        }
        ?>
        <div style="clear:both"></div>
    </div>

<?php
if (($option_from->value || $option_to->value)) { //generate the clear link
    ?>
    <?php require ModuleHelper::getLayoutPath('mod_cf_filtering', 'default_option_clear');
} ?>


<?php
$scriptFiles[]=JURI::root().'modules/mod_cf_filtering/assets/slider.js';
$scriptFiles[]=JURI::root().'modules/mod_cf_filtering/assets/drag_refactor.js';
$javascript = setSliderScripts($direction, $selected_filters, $results_trigger, $results_loading_mode, $module->id, $key, $inputTextExist, $option_from->slider_min_value, $option_to->slider_max_value);
$scriptProcesses = array_merge($scriptProcesses, $javascript);
$scriptVars['slider_min_value'] = $option_from->slider_min_value;
$scriptVars['slider_max_value'] = $option_to->slider_max_value;


