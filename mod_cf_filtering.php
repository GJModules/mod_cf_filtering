<?php
/**
 * @package        customfilters
 * @subpackage    mod_cf_filtering
 * @copyright    Copyright (C) 2012-2021 breakdesigns.net . All rights reserved.
 * @license        GNU General Public License version 2 or later; see LICENSE.txt
 */

if (!defined('DEV_IP')) {
	define('DEV_IP',     '***.***.***.***');
}

// no direct access
use Joomla\CMS\Cache\Cache;
use Joomla\CMS\Factory;

JLoader::registerNamespace( 'GNZ11' , JPATH_LIBRARIES . '/GNZ11' , $reset = false , $prepend = false , $type = 'psr4' );
JLoader::register( 'seoTools' , JPATH_ROOT . '/components/com_customfilters/include/seoTools.php');
JLoader::register('seoTools_uri' , JPATH_ROOT .'/components/com_customfilters/include/seoTools_uri.php');
JFactory::getDocument()->addStyleDeclaration('
    body{
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif !important ; 
    }
     
');

if ($_SERVER['REMOTE_ADDR'] ==  DEV_IP )
{

	$config = \Joomla\CMS\Factory::getConfig();
	$config->set('error_reporting' , 'development' );
	$config->set('debug' , 1 );
}#END IF


defined('_JEXEC') or die();




JLoader::register( 'seoTools' , JPATH_ROOT . '/components/com_customfilters/include/seoTools.php');

/**
 * @var Joomla\Registry\Registry $params
 * @var stdClass $module
 * @var ModCfFilteringHelper  $modObj
 */
$doc = Factory::getDocument();
$profiler = \JProfiler::getInstance('PRO_Application - module');
$profiler->mark('Start Module');
//load dependencies
require_once dirname(__FILE__) . '/bootstrap.php';

\VmConfig::loadConfig();
JText::script('MOD_CF_FILTERING_INVALID_CHARACTER');
JText::script('MOD_CF_FILTERING_PRICE_MIN_PRICE_CANNOT_EXCEED_MAX_PRICE');
JText::script('MOD_CF_FILTERING_MIN_CHARACTERS_LIMIT');

$jlang = \JFactory::getLanguage();
$jlang->load('com_customfilters');
$jlang->load('com_virtuemart');
try
{
	$modObj = new \ModCfFilteringHelper($params, $module);
}
catch (\Exception $e)
{
    // Executed only in PHP 5, will not be reached in PHP 7
    echo 'Выброшено исключение: ',  $e->getMessage(), "\n";
    echo'<pre>';print_r( $e );echo'</pre>'.__FILE__.' '.__LINE__;
    die(__FILE__ .' '. __LINE__ );
}










require_once dirname(__FILE__) . '/helper.php';



//$doc->addScript(JURI::root().'modules/mod_cf_filtering/assets/general.js' , ['mime' => 'text/javascript'], ['defer' => true]);
$doc->addScript(JURI::root().'modules/mod_cf_filtering/assets/general-uncompressed.js' , ['mime' => 'text/javascript'], ['defer' => true]);

$doc->addScript(JURI::root().'components/com_virtuemart/assets/js/cvfind.js', ['mime' => 'text/javascript']);
$doc->addStyleSheet(JURI::root().'modules/mod_cf_filtering/assets/style.css');





try
{

	// TODO*** Отключил Кэширование
	$params->set( 'cache_on' , 0 ) ;




	// Code that may throw an Exception or Error.
	/*$cacheParams = new stdClass;
	$cacheParams->cachemode = 'safeuri';
	$cacheParams->class = 'ModCfFilteringHelper';
	$cacheParams->method = 'ModuleInit';
	$cacheParams->methodparams = $params;
	$cacheParams->modeparams = array(
		'id' => 'int'  ,
		//'module_type' => $module_type
	);
	$params->set('cache' , 1);// Устанавливаем принудительное включение CACHE
	echo \Joomla\CMS\Helper\ModuleHelper::moduleCache($module , $params , $cacheParams);
	return ;*/


	$filters          = $modObj->getFilters();
	$selected_filters = $modObj->getSelectedFilters();
	$moduleclass_sfx  = htmlspecialchars($params->get('moduleclass_sfx'), ENT_COMPAT, 'UTF-8');
	$LayoutPath       = \JModuleHelper::getLayoutPath('mod_cf_filtering', $params->get('layout', 'default'));

	$cacheId = ModCfFilteringHelper::getCacheId($params, $module);

	$cache = JFactory::getCache('mod_cf_filtering', '');



	if (   !$htmlData = $cache->get($cacheId))
	{
		ob_start();

		require($LayoutPath);
		// выполняем действия и сохраняем результат в $somevariable
		$htmlData = ob_get_contents();
		ob_end_clean();
		if ( $params->get( 'cache_on' , 1 ) )
		{
			// сохраняем html в кэше
			$cache->store($htmlData, $cacheId);
		}#END IF

	}
	echo $htmlData;
	$profiler->mark('End module');


//         throw new \Exception('Code Exception '.__FILE__.':'.__LINE__) ;
}
catch (\Error $e)
{
	// Executed only in PHP 5, will not be reached in PHP 7
	echo 'Выброшено исключение: ',  $e->getMessage(), "\n";
	echo'<pre>';print_r( $e );echo'</pre>'.__FILE__.' '.__LINE__;
	die(__FILE__ .' '. __LINE__ );
}

if ($_SERVER['REMOTE_ADDR'] ==  DEV_IP )
{
//	echo'<pre>';print_r( $params->get( 'cache_on' , 1 ) );echo'</pre>'.__FILE__.' '.__LINE__;

	$pageCreationTime = $profiler->getBuffer();
//	echo'<pre>';print_r( $pageCreationTime );echo'</pre>'.__FILE__.' '.__LINE__;
//	die(__FILE__ .' '. __LINE__ );

}
