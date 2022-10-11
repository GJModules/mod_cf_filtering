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

//initialization of some vars
$display_key = $key . '_' . $module->id;
$clear_url = JRoute::_($urlHandler->getURL($filter, '', 'clear'));
?>
    <div class="cf_wrapper_input_text" id="cf_wrapper_input_text_<?php echo $display_key ?>">
        <?php
        /**
         * @var CfFilter $filter
         */
        foreach ($options = $filter->getOptions() as $index => $option) {

            /*
             * calendars accept only dates in format Y-m-d
             * The way of displaying it to the browser depends on the browser's locale settings.
             * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date
             */

            $class_key = $index == 0 ? 'from' : 'to';
            $label = $index == 0 ? Text::_('MOD_CF_FILTERING_RANGE_MIN_PLACEHOLDER') : Text::_('MOD_CF_FILTERING_RANGE_MAX_PLACEHOLDER');?>
            <input type="date"
                   aria-label="<?php echo $label ?>"
                   value="<?php echo $option->value?>"
                   name="<?php echo $key . '[' . $index . ']'?>"
                   id="<?php echo $display_key . '_' . $index?>"
                   class="cf_search_input_2"
            >
            <?php
        } ?>
        <button type="submit" class="cf_search_button btn" id="<?php echo $display_key ?>_button" aria-label="<?php echo JText::_('MOD_CF_APPLY') ?>">
            <i class="cficon-search"></i>
        </button>
        <div class="cf_message" id="<?php echo $display_key ?>_message"></div>
        <?php
        if (!empty($options[0]->value) || !empty($options[1]->value)) {?>
            <br>
            <?php
            //load the clear link from another layout
            require ModuleHelper::getLayoutPath('mod_cf_filtering', 'default_option_clear');
        } ?>
        <input type="hidden" value="<?php echo $clear_url ?>" id="<?php echo $display_key ?>_url"/>
    </div>
<?php




