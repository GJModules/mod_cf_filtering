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
$profiler = \JProfiler::getInstance('PRO_Application - module');
$profiler->mark('Start Module');





//require_once dirname(__FILE__) . '/helper.php';



\VmConfig::loadConfig();
JText::script('MOD_CF_FILTERING_INVALID_CHARACTER');
JText::script('MOD_CF_FILTERING_PRICE_MIN_PRICE_CANNOT_EXCEED_MAX_PRICE');
JText::script('MOD_CF_FILTERING_MIN_CHARACTERS_LIMIT');

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
if ( $params->get( 'cache_on' , 1 ) &&  !$htmlData = $cache->get($cacheId) )
{

}


if ($_SERVER['REMOTE_ADDR'] ==  DEV_IP )
{
	$profiler->mark('Start module mod_cf_filtering');
}

try
{

	if ($_SERVER['REMOTE_ADDR'] ==  DEV_IP )
	{
		// TODO*** ???????????????? ??????????????????????
		//			$params->set( 'cache_on' , 0 ) ;
	}

/*
	// ?????????????????? ????????
	$options = array(
		'defaultgroup' => 'mod_cf_filtering_data',
		'browsercache' => false,
		'caching'      => 1,
	);
	// ???????? ???????? ????????????????
	$parts[] = \JUri::getInstance()->toString();
	$key = md5(serialize($parts));

	$Cache = \Joomla\CMS\Cache\Cache::getInstance('output', $options);
	$dataCache = $Cache->get( $key );

	if ( !$dataCache  )
	{
		// ???????????????? ?????? ?????????????? ?? ?????????????? ?????? ????????????
		$FilteringHelper = new ModCfFilteringHelper($params, $module);
		$filters          = $FilteringHelper->getFilters();
		$scriptVars = $FilteringHelper->getScriptVars();

		$dataCache = [
			'filters' => $filters ,
			'scriptVars' => $scriptVars ,
		];
		$Cache->store( $dataCache , $key );

	}
	else{
		$FilteringHelper = new ModCfFilteringHelper($params, $module);
		$filters = $dataCache['filters'];
		// ?????????????????????????? ???????????? ???? ????????
		$FilteringHelper->setScriptVars( $dataCache['scriptVars'] );


		if ($_SERVER['REMOTE_ADDR'] ==  DEV_IP )
		{
			$profiler->mark('GetDataCache');
			$__timeDev = $profiler->getBuffer();
			echo'<pre>';print_r( $__timeDev );echo'</pre>'.__FILE__.' '.__LINE__;
			echo'<pre style="color:green">';print_r( '???????????? ?????????? ???? Cache' );echo'</pre>';
		}

	}#END IF
#*/


	if (  !$htmlData = $cache->get($cacheId) )
	{
		// ???????????????? ?????? ?????????????? ?? ?????????????? ?????? ????????????
		$FilteringHelper = new ModCfFilteringHelper($params, $module);

		$filters          = $FilteringHelper->getFilters();
		$scriptVars = $FilteringHelper->getScriptVars();

		$selected_filters = $FilteringHelper->getSelectedFilters();
		$moduleclass_sfx  = htmlspecialchars($params->get('moduleclass_sfx'), ENT_COMPAT, 'UTF-8');
		$LayoutPath       = \JModuleHelper::getLayoutPath('mod_cf_filtering', $params->get('layout', 'default'));

		ob_start();

		require($LayoutPath);
		// ?????????????????? ???????????????? ?? ?????????????????? ?????????????????? ?? $somevariable
		$htmlData = ob_get_contents();
		ob_end_clean();
		if ( $params->get( 'cache_on' , 1 ) )
		{
			// ?????????????????? html ?? ????????
			$cache->store($htmlData, $cacheId);
		}#END IF


		if ($_SERVER['REMOTE_ADDR'] ==  DEV_IP )
		{
			$profiler->mark('Create - cache - store ');
			echo'<pre style="color:green">';print_r( '???????????? ?????????? ???? Cache' );echo'</pre>';
		}
	}
	else{
		if ($_SERVER['REMOTE_ADDR'] ==  DEV_IP )
		{
			$profiler->mark('GetDataCache');
			echo'<pre style="color:green">';print_r( 'HTML - ???????????? "mod_cf_filtering" - ???????????????? ???? Cache' );echo'</pre>';
		}
	}

	echo $htmlData;
	$profiler->mark('End module');

}
catch (\Error $e)
{
	// Executed only in PHP 5, will not be reached in PHP 7
	echo '?????????????????? ????????????????????: ',  $e->getMessage(), "\n";
	echo'<pre>';print_r( $e );echo'</pre>'.__FILE__.' '.__LINE__;
	die(__FILE__ .' '. __LINE__ );
}
catch ( Exception $e )
{
	echo '?????????????????? ????????????????????: ',  $e->getMessage(), "\n";
	echo'<pre>';print_r( $e );echo'</pre>'.__FILE__.' '.__LINE__;
	die(__FILE__ .' '. __LINE__ );
}

if ($_SERVER['REMOTE_ADDR'] ==  DEV_IP )
{
//	echo'<pre>';print_r( $params->get( 'cache_on' , 1 ) );echo'</pre>'.__FILE__.' '.__LINE__;

	$pageCreationTime = $profiler->getBuffer();
	echo'<pre>';print_r( $pageCreationTime );echo'</pre>'.__FILE__.' '.__LINE__;
//	die(__FILE__ .' '. __LINE__ );

}
