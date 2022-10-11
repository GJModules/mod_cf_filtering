<?php
/**
 * @package     customfilters
 * @subpackage  mod_cf_filtering
 * @copyright   Copyright (C) 2012-2020 breakdesigns.net . All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

/**
 * Создание ссылки для пункта фильтра
 */

/**
 * @var CfFilter $filter
 * @var UrlHandler $urlHandler
 * @var string $option_url
 */





if (empty($option_url)) {
    $option_url = \JRoute::_( $urlHandler->getURL($filter, $option->id, $option->type ));
}

if ($_SERVER['REMOTE_ADDR'] ==  DEV_IP )
{
//    echo'<pre>';print_r( $option );echo'</pre>'.__FILE__.' '.__LINE__;
//    die(__FILE__ .' '. __LINE__ );

}



///** @var seoTools $sefUrlObj */
//$sefUrlObj = $option->option_sef_url->sef_url ;

$class_no_ajax = null ;
if ( stripos( $option->option_sef_url->sef_url , 'catalog/' ) ) $class_no_ajax = 'cf_no_ajax' ;



if(empty($key)) {
    $key = '';
};


$opt_class = !empty($opt_class) ? $opt_class : '';
$display_key = $key.'_'.$module->id;
$element_id = $display_key . '_elid' . $option->id;
?>
<span class="cf_link">
    <a href="<?= $option->option_sef_url->sef_url ?>"
       id="<?php echo $element_id, '_a' ?>"
       class="cf_option <?= $class_no_ajax ?> <?= $option->selected ? 'cf_sel_opt' : '', ' ', $opt_class ?>"
       data-module-id="<?php echo $module->id ?>"
        <?= $params->get('indexfltrs_by_search_engines', 0) == false ? 'rel="nofollow"' : '' ?>>
        <?php echo $option->label ?>
    </a>
</span>
<?php
if($filter->getCounter() && isset($option->counter)):?>
    <span class="cf_flt_counter">(<?php echo $option->counter?>)</span>
<?php endif;?>
