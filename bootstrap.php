<?php
/**
 * @package        customfilters
 * @subpackage    mod_cf_filtering
 * @copyright    Copyright (C) 2012-2021 breakdesigns.net . All rights reserved.
 * @license        GNU General Public License version 2 or later; see LICENSE.txt
 */

jimport('joomla.language.helper');

if(!defined('JPATH_VM_ADMIN')) {
    define('JPATH_VM_ADMIN',JPATH_ROOT.DIRECTORY_SEPARATOR.'administrator'.DIRECTORY_SEPARATOR.'components'.DIRECTORY_SEPARATOR.'com_virtuemart');
}

//needs to load the VM products model which we extend in our model
if (! class_exists('\vmConfig')) {
    require_once (JPATH_ADMINISTRATOR . DIRECTORY_SEPARATOR . 'components' . DIRECTORY_SEPARATOR . 'com_virtuemart' . DIRECTORY_SEPARATOR . 'helpers' . DIRECTORY_SEPARATOR . 'config.php');
    \vmConfig::loadConfig($force = false, $fresh = false, $lang = true, $exeTrig = false);
}

// Include the syndicate functions only once
require_once JPATH_ROOT . DIRECTORY_SEPARATOR . 'components' . DIRECTORY_SEPARATOR . 'com_customfilters' . DIRECTORY_SEPARATOR . 'include' . DIRECTORY_SEPARATOR . 'tools.php';
require_once JPATH_ROOT . DIRECTORY_SEPARATOR . 'components' . DIRECTORY_SEPARATOR . 'com_customfilters' . DIRECTORY_SEPARATOR . 'include' . DIRECTORY_SEPARATOR . 'Config.php';
require_once JPATH_ROOT . DIRECTORY_SEPARATOR . 'components' . DIRECTORY_SEPARATOR . 'com_customfilters' . DIRECTORY_SEPARATOR . 'include' . DIRECTORY_SEPARATOR . 'input.php';
require_once JPATH_ROOT . DIRECTORY_SEPARATOR . 'components' . DIRECTORY_SEPARATOR . 'com_customfilters' . DIRECTORY_SEPARATOR . 'include' . DIRECTORY_SEPARATOR . 'output.php';
require_once JPATH_ROOT . DIRECTORY_SEPARATOR . 'components' . DIRECTORY_SEPARATOR . 'com_customfilters' . DIRECTORY_SEPARATOR . 'models' . DIRECTORY_SEPARATOR . 'products.php';

// load the dependent classes
require_once dirname(__FILE__) . '/CfFilter.php';
require_once dirname(__FILE__) . '/helper.php';
require_once dirname(__FILE__) . '/DisplayManager.php';
require_once dirname(__FILE__) . '/optionsHelper.php';
require_once dirname(__FILE__) . '/UrlHandler.php';

// load the Virtuemart configuration
require_once JPATH_ROOT . DIRECTORY_SEPARATOR . 'administrator' . DIRECTORY_SEPARATOR . 'components' . DIRECTORY_SEPARATOR . 'com_virtuemart' . DIRECTORY_SEPARATOR . 'helpers' . DIRECTORY_SEPARATOR . 'config.php';

/*Define Constants*/

// Set the current language code
if (!defined('VMLANG')) {
    $jlang = JFactory::getLanguage();
    $siteLang = $jlang->getTag();
    $siteLang = strtolower(strtr($siteLang, '-', '_'));
} else {
    $siteLang = VMLANG;
}

if (!defined('JLANGPRFX')) {
    define('JLANGPRFX', $siteLang);
}

// Set the shop's default language
$shop_default_lang = VmConfig::$defaultLang;
if (!defined('VM_SHOP_LANG_PRFX')) {
    define('VM_SHOP_LANG_PRFX', $shop_default_lang);
}
