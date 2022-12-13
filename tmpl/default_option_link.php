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
 * @var stdClass $option
 * @var stdClass $module - модуль
 * @var Joomla\Registry\Registry $params - Параметры модуля
 *
 */

/**
 * @var int $indexfltrs_by_search_engines Будут ли индексироваться поисковыми системами ссылки фильтра.(Используется nofollow)
 */
$indexfltrs_by_search_engines = $params->get('indexfltrs_by_search_engines', 0);

//echo'<pre>';print_r( $option_url );echo'</pre>'.__FILE__.' '.__LINE__;
//die(__FILE__ .' '. __LINE__ );

if (empty($option_url)) {
    $option_url = \JRoute::_( $urlHandler->getURL($filter, $option->id, $option->type ));
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


JLoader::register('seoTools_uri' , JPATH_ROOT .'/components/com_customfilters/include/seoTools_uri.php');
$relNofollow = \seoTools_uri::checkUrlNoIndex( $option->option_sef_url->sef_url );
$relNofollowAttr = ' rel="index, follow" '  ;




if ( $relNofollow || $option->option_sef_url->no_index || !$indexfltrs_by_search_engines )
{
	$relNofollowAttr =    'rel="noindex, nofollow"' ;
}#END IF


?>
<!-- @START default_option_link  -->
<span class="cf_link">
    <a href="<?= $option->option_sef_url->sef_url ?>"
       id="<?php echo $element_id, '_a' ?>"
       class="cf_option <?= $class_no_ajax ?> <?= $option->selected ? 'cf_sel_opt' : '', ' ', $opt_class ?>"
       data-module-id="<?php echo $module->id ?>"
        <?= $relNofollowAttr ?>
    >
        <?php
        preg_match_all("/{(.*?)}/", $option->label,$out, PREG_PATTERN_ORDER);
        $i = 0;
        foreach ($out[0] as $value) {

            $option->label = str_replace($value, JText::_($out[1][$i]), $option->label);
            $i++;
        }
        ?>
        <?php echo $option->label ?>
        


    </a>
</span>
<!-- @END default_option_link  -->
<?php

if ($_SERVER['REMOTE_ADDR'] ==  DEV_IP )
{
//    echo'<pre>';print_r( $option->counter );echo'</pre>'.__FILE__.' '.__LINE__;
//    echo'<pre>';print_r( $filter->getCounter() );echo'</pre>'.__FILE__.' '.__LINE__;
//$app = \Joomla\CMS\Factory::getApplication();
//echo'<pre>';print_r( $option->counter );echo'</pre>'.__FILE__.' '.__LINE__;
//die(__FILE__ .' '. __LINE__ );


}

if($filter->getCounter() && isset($option->counter)):?>
    <span class="cf_flt_counter">(<?php echo $option->counter?>)</span>
<?php endif;?>
