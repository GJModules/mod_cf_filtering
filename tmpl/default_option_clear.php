<?php
/**
 * @package     customfilters
 * @subpackage  mod_cf_filtering
 * @copyright   Copyright (C) 2012-2021 breakdesigns.net . All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC')or die;

use Joomla\CMS\Language\Text;

$clear_url = \JRoute::_($urlHandler->getURL($filter, '', 'clear'));

if(!isset($option->label) || $display == \CfFilter::DISPLAY_RANGE_DATES || $display == \CfFilter::DISPLAY_INPUT_TEXT || $display == \CfFilter::DISPLAY_RANGE_SLIDER) {
    $option->label = Text::_('MOD_CF_CLEAR');
}
$element_id = $display_key . '_elid0';

?>
<span class="cf_clear">
    <a href="<?php echo $clear_url; ?>" id="<?php echo $element_id,'_a'?>" class="cf_option cf_clear" data-module-id="<?php echo $module->id?>" rel="nofollow">
        <?php echo $option->label?>
    </a>
</span>
