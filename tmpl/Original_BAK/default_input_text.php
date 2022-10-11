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

if(empty($key)) {
    $key = '';
}

$sliderExist = in_array(CfFilter::DISPLAY_RANGE_SLIDER, $filter->getDisplay());
$symbol_start = '';
$symbol_end = '';
$script = '';
$display_key = $key . '_' . $module->id;
$value_found = false;
$clear_url = JRoute::_($urlHandler->getURL($filter, '', 'clear'));
$vendor_currency = cftools::getVendorCurrency();
$virtuemart_currency_id = $jinput->get('virtuemart_currency_id', $vendor_currency['vendor_currency'], 'int');
$currency_id = JFactory::getApplication()->getUserStateFromRequest("virtuemart_currency_id", 'virtuemart_currency_id', $virtuemart_currency_id);
$currency_info = cftools::getCurrencyInfo($currency_id);

/*Price Filter - get some more data*/
if (!empty($currency_info) && $key == 'price') {
    if ($currency_info->currency_positive_style) {
        if (strpos($currency_info->currency_positive_style, '{symbol}') == 0) {
            $symbol_start = '&nbsp;' . $currency_info->currency_symbol;
        } else $symbol_end = '<span class="cf_currency">' . $currency_info->currency_symbol . '&nbsp;' . '</span>';
    } else {
        $symbol_start = '<span class="cf_currency">&nbsp;' . $currency_info->currency_symbol . '</span>';
        $symbol_end = '';
    }
}

$input_class = 'cf_wrapper_input_text_' . count($filter->getOptions()); ?>
<div class="cf_wrapper_input_text <?php echo $input_class ?>" id="cf_wrapper_input_text_<?php echo $display_key ?>">
    <div class="form-horizontal">
        <?php
        /**
         * @var CfFilter $filter
         * @var  $option
         */
        foreach ($filter->getOptions() as $index => $option) {
            $size = !empty($option->size) ? $option->size : 7;
            $maxlength = !empty($option->maxlength) ? $option->maxlength : 7;
            $label = !empty($option->label) ? $option->label : '';
            $placeholder = !empty($option->placeholder) ? $option->placeholder : '';
            $aria_label = !empty($option->aria_label) ? $option->aria_label : (!empty($option->placeholder) ? $option->placeholder : '');
            $value_found = $value_found == true || !empty($option->value) ? true : false;
            $inputType = $filter->getType() == 'string' ? 'search' : 'text';
            $inputMode = $filter->getType() == 'string' ? 'text' : 'numeric';
            $pattern = !empty($option->pattern) ? $option->pattern : '';
            ?>

            <?php if($label) {?>
                <label for="<?php echo $display_key, '_', $index ?>"><?php echo $label ?></label>
            <?php } ?>
            <?php echo $symbol_start; ?>
            <input name="<?php echo $option->name ?>"
                   type="<?php echo $inputType?>"
                   id="<?php echo $display_key, '_', $index ?>" <?php echo $script ?>
                   class="cf_search_input"
                    <?php  echo !empty($pattern)? 'pattern="'.$pattern.'"' : '';?>
                   value="<?php echo !empty($option->value) ? $option->value : ''?>"
                   aria-label="<?php echo $aria_label; ?>"
                   placeholder="<?php echo $placeholder; ?>" size="<?php echo $size ?>"
                   maxlength="<?php echo $maxlength ?>"
                   autocomplete="off"
                   inputmode="<?php echo $inputMode?>">
            <?php echo $symbol_end ?>
            <?php
        } ?>

        <button type="submit" class="cf_search_button btn" id="<?php echo $display_key?>_button" aria-label="<?php echo Text::_('MOD_CF_APPLY') ?>">
            <i class="cficon-search"></i>
        </button>

        <?php
        //if slider exists, it will display it's own "clear"
        if ($value_found && !$sliderExist) { ?>
            <br/><?php require ModuleHelper::getLayoutPath('mod_cf_filtering', 'default_option_clear');
        }
        ?>
    </div>
    <div class="cf_message" id="<?php echo $display_key ?>_message"></div>
    <input type="hidden" value="<?php echo $clear_url ?>" id="<?php echo $display_key ?>_url"/>
</div>

