<?php
/**
 * @package        customfilters
 * @subpackage    mod_cf_filtering
 * @copyright    Copyright (C) 2012-2021 breakdesigns.net . All rights reserved.
 * @license        GNU General Public License version 2 or later; see LICENSE.txt
 */

use Joomla\CMS\Cache\Cache;
use Joomla\CMS\Factory;

defined('_JEXEC') or die(); // no direct access
if (!defined('DEV_IP'))  define('DEV_IP',     '***.***.***.***');

//load dependencies
require_once dirname(__FILE__) . '/bootstrap.php';

$__v = ModCfFilteringHelper::getModuleVersion();

JLoader::registerNamespace( 'GNZ11' , JPATH_LIBRARIES . '/GNZ11' , $reset = false , $prepend = false , $type = 'psr4' );
JLoader::register( 'seoTools' , JPATH_ROOT . '/components/com_customfilters/include/seoTools.php');
JLoader::register('seoTools_uri' , JPATH_ROOT .'/components/com_customfilters/include/seoTools_uri.php');

$paramsComponent = JComponentHelper::getParams('com_customfilters');

$debug_on = $paramsComponent->get('debug_on' , 0 ) ;
if (!defined('CF_FLT_DEBUG')) {
	define('CF_FLT_DEBUG',     $debug_on );
	if ( CF_FLT_DEBUG )
	{
		JLoader::register('seoTools_logger' , JPATH_ROOT .'/components/com_customfilters/include/seoTools_logger.php');
		seoTools_logger::instance();
	}#END IF
}



JFactory::getDocument()->addStyleDeclaration('
    body{
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important ; 
    }
');



/**
 * @var Joomla\Registry\Registry $params
 * @var stdClass                 $module
 * @var ModCfFilteringHelper     $FilteringHelper
 */
$doc = Factory::getDocument();

if ( $_SERVER['REMOTE_ADDR'] ==  DEV_IP ) $profiler = \JProfiler::getInstance('PRO_Application - module');
if ( $_SERVER['REMOTE_ADDR'] ==  DEV_IP ) $profiler->mark('Start module mod_cf_filtering');

//require_once dirname(__FILE__) . '/helper.php';




JText::script('MOD_CF_FILTERING_INVALID_CHARACTER');
JText::script('MOD_CF_FILTERING_PRICE_MIN_PRICE_CANNOT_EXCEED_MAX_PRICE');
JText::script('MOD_CF_FILTERING_MIN_CHARACTERS_LIMIT');

\VmConfig::loadConfig();
$jlang = \JFactory::getLanguage();
$jlang->load('com_customfilters');
$jlang->load('com_virtuemart');

//$doc->addScript(JURI::root().'modules/mod_cf_filtering/assets/general.js' , ['mime' => 'text/javascript'], ['defer' => true]);
$urlGeneralUncompressed = JURI::root().'modules/mod_cf_filtering/assets/general-uncompressed.js' . '?i=' . $__v  ;
$doc->addScript( $urlGeneralUncompressed , ['mime' => 'text/javascript'], ['defer' => true]);
$doc->addScript(JURI::root().'components/com_virtuemart/assets/js/cvfind.js' . '?i=' . $__v , ['mime' => 'text/javascript']);
$doc->addStyleSheet(JURI::root().'modules/mod_cf_filtering/assets/style.css' . '?i=' . $__v );



$cacheId = ModCfFilteringHelper::getCacheId($params, $module);
$cache = JFactory::getCache('mod_cf_filtering', '');

try
{

	$app = \Joomla\CMS\Factory::getApplication();
	$juri = \Joomla\CMS\Uri\Uri::getInstance();
	$filterUrl = $juri->getPath();
	$view = $app->input->get('view' , false , 'STRING ') ;
	$app->input->set('filter-url' , md5( $filterUrl ) );

	$cacheparams = new stdClass;
	$cacheparams->cachemode = 'safeuri';
	$cacheparams->class = 'ModCfFilteringHelper';
	$cacheparams->method = 'getHtmlFilterCache';
	$cacheparams->methodparams = [ $module , $params ];


	$cacheparams->modeparams = [
		'Itemid' => 'INT',
		'module_id' => 'INT',
		'virtuemart_category_id' => 'ARRAY',
		'virtuemart_manufacturer_id' => 'ARRAY',
		'filter-url' => 'STRING',
	];

	// Отключить Cache - для Developer
	if ($_SERVER['REMOTE_ADDR'] ==  DEV_IP )
	{
		$params->set('owncache' , 0 );
	}

	if ($_SERVER['REMOTE_ADDR'] ==  DEV_IP )
	{
//	    echo'<pre>';print_r( $view );echo'</pre>'.__FILE__.' '.__LINE__;
//	    die(__FILE__ .' '. __LINE__ );

	}
	if ( $view != 'productdetails' )
	{
		$htmlData = \Joomla\CMS\Helper\ModuleHelper::moduleCache($module, $params, $cacheparams);
		echo $htmlData ;
	}#END IF


}
catch ( Exception $e )
{
	echo 'Выброшено исключение: ',  $e->getMessage(), "\n";
	echo'<pre>';print_r( $e );echo'</pre>'.__FILE__.' '.__LINE__;
	die(__FILE__ .' '. __LINE__ );
}



