<?php
/**
 * @package     customfilters
 * @subpackage  mod_cf_filtering
 * @copyright   Copyright (C) 2012-2020 breakdesigns.net . All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC')or die;

$clearUrl = $urlHandler->getURL( $filter , '', 'clear') ;
$clear_url = \JRoute::_( $urlHandler->getURL($filter, '', 'clear') );


$seoTools = new seoTools();
$sefUrlObj  = $seoTools->getSefUrl( $clear_url );




$class_no_ajax = null ;
if ( stripos( $clear_url , 'catalog/' ) ) $class_no_ajax = 'cf_no_ajax' ;

if(!isset($option->label) || $display == \CfFilter::DISPLAY_RANGE_DATES || $display == \CfFilter::DISPLAY_INPUT_TEXT || $display == \CfFilter::DISPLAY_RANGE_SLIDER) {
    $option->label = \JText::_('MOD_CF_CLEAR');
}
$element_id = $display_key . '_elid0';
// https://www.new.marketprofil.ru/catalog/metalocherepitsa/
// https://www.new.marketprofil.ru/catalog/metallocherepitsa/
?>
<span class="cf_clear">
    <a href="<?= $sefUrlObj->sef_url; ?>" id="<?php echo $element_id,'_a'?>"
       class="cf_option cf_clear <?= $class_no_ajax ?>"
       data-module-id="<?php echo $module->id?>" rel="nofollow">
        <?php echo $option->label?>
    </a>
</span>

