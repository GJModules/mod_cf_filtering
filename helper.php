<?php
/**
 * @package customfilters
 * @subpackage mod_cf_filtering
 * @copyright Copyright (C) 2012-2021 breakdesigns.net . All rights reserved.
 * @license GNU General Public License version 2 or later; see LICENSE.txt
 */

// no direct access
defined('_JEXEC') or die();
 
use Joomla\Registry\Registry;
use Joomla\CMS\Router\Route;
use Joomla\CMS\Uri\Uri;
use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;



/**
 * The module helper class which contains the basic module's logic
 *
 * @package customfilters
 * @author Sakis Terz
 * @since 1.0
 *
 */
class ModCfFilteringHelper
{
	/**
	 * @var ModCfFilteringHelper
	 * @since version
	 */
	protected static $instance;

	/**
	 * выбранные критерии будут храниться в этом ассоциированном массиве /
     * the selected criteria will be stored in this assoc array
     *
     * @var array
	 * @since 3.9
     */
    public $selected_flt = [];

    /**
     * хранит выборки, которые использует каждый фильтр в зависимости сверху вниз /
     * stores the selections that each filter uses in dependency top-bottom
     *
     * @var array
     * @since 3.9
     */
    public $selected_fl_per_flt = [];

    /**
     * удалить неактивное из этого массива
     * remove the inactive from this array
     * @var array
     * @since 3.9
     */
    public $selected_flt_modif = [];

    /**
     * @var CfFilter[]
     * @since 3.9
     */
    protected $filters = [];

    /**
     * @var array
     * @since 3.9
     */
    protected $display = [];

    /**
     * @var OptionsHelper
     * @since    1.0.0
     */
    public $optionsHelper;

    /**
     * @var Registry
     * @since 3.9
     */
    public $moduleparams;

    /**
     * it holds info about the current currency
     *
     * @var stdClass
     */
    public $currency_info;
    /**
     * @var string
     */
    public $stylesDeclaration = '';

    /**
     * contains any variable which will be passed to the script
     *
     * @var array
     */
    public $scriptVars =[];

    /**
     * contains the functions/operations which will be executed in a domready event
     *
     * @var array
     */
    public $scriptProcesses = [];

    /**
     * contains the suffixes of the filters
     *
     * @var array
     */
    protected $fltSuffix = array(
        'q' => 'keyword_flt',
        'virtuemart_category_id' => 'category_flt',
        'virtuemart_manufacturer_id' => 'manuf_flt',
        'price' => 'price_flt',
        'stock'=>'stock_flt',
        'custom_f' => 'custom_flt'
    );

    /**
     * reset tool active/inactive (bool)
     *
     * @var bool
     */
    public $reset = false;

    /**
     * text direction
     *
     * @var string
     */
    public $direction = 'ltr';

    /**
     * the current module object
     *
     * @var stdClass
     */
    public $module;

    /**
     * mode (on click or with btn)
     *
     * @var mixed
     */
    public $results_trigger;

    /**
     * reults loading mode (http or ajax)
     *
     * @var string
     */
    public $results_loading_mode;

    /**
     * The current active trees
     *
     * @var array
     */
    public $active_tree = [];

    /**
     * array that contains the ranges
     *
     * @var array
     */
    public $rangeVars = [];

    /**
     * @var Registry
     */
    protected $component_params;

    /**
     * @var Registry
     */
    protected $menu_params;

    /**
     * @var \Joomla\CMS\Profiler\Profiler
     */
    protected $profiler;

	/**
	 * @var UrlHandler
	 * @since version
	 */
	protected $urlHandler;

	/**
     * ModCfFilteringHelper constructor.
     *
     * @param Registry    $params
     * @param   stdClass  $module
     *
     * @throws Exception
     * @since 1.0
     */
    public function __construct(Registry $params, stdClass $module )
    {

        $this->moduleparams = $params;
        $this->module = $module;
        $this->component_params = \cftools::getComponentparams();
        $this->menu_params = \cftools::getMenuparams();
        $doc = Factory::getDocument();
        $Itemid = $this->menu_params->get('cf_itemid', '');
        $this->results_trigger = $params->get('results_trigger', 'sel');
        $this->results_loading_mode = $params->get('results_loading_mode', 'ajax');
        $this->direction = $doc->getDirection();
        $this->scriptVars['base_url'] = Uri::base();
        $this->scriptVars['Itemid'] = $Itemid;
        $this->scriptVars['component_base_url'] = Route::_( Uri::base().'index.php?option=com_customfilters&view=products&Itemid=' . $Itemid);
        $this->scriptProcesses[] = 'customFilters.keyword_search_clear_filters_on_new_search=' . $this->component_params->get('keyword_search_clear_filters_on_new_search', true) . '; ';
        $this->scriptVars['cf_direction'] = $this->direction;
        $this->scriptVars['results_trigger'] = $params->get('results_trigger', 'sel');
        $this->scriptVars['results_wrapper'] = $params->get('results_wrapper', 'bd_results');
        $this->optionsHelper = \OptionsHelper::getInstance($params, $module);




        // profiler to get performance metrics
        $profilerParam = $this->moduleparams->get('cf_profiler', 0);

        if ($profilerParam) {
            $this->profiler = \JProfiler::getInstance('application');
        }
    }

	/**
	 * @param stdClass  $options
	 *
	 * @return ModCfFilteringHelper
	 *
	 * @throws Exception
	 * @since version
	 */
	/*public static function instance( $options = array() ): ModCfFilteringHelper
	{
		if ( self::$instance === null ){
			self::$instance = new self($options);
		}
		return self::$instance;
	}#END FN*/
	
	/*public static  function ModuleInit( $params  )
	{
		$module = JModuleHelper::getModule( 'mod_cf_filtering'  );


		$layout = $params->get('layout', 'default') ;
		// $LayoutPath == /templates/marketprofil/html/mod_cf_filtering/default.php
		$LayoutPath = JModuleHelper::getLayoutPath('mod_cf_filtering', $layout) ;


		ob_start();

		echo '<div id="mod_menu_categories_shop-Data"></div>';
//		echo '<template id="mod_menu_categories_shop-Template">';
		require(  $LayoutPath );
//		echo '</template>';
		$htmlData = ob_get_contents();
		ob_end_clean();


		return $htmlData ;
	}*/

	/**
	 * Получить идентификатор Cache
	 *
	 * @throws Exception
	 * @since version
	 */
	public static function getCacheId(   $moduleparams , $module  ){
		$input   = \JFactory::getApplication()->input;
		$uri     = $input->getArray();
		$safeuri = new stdClass() ;
		$noHtmlFilter = \JFilterInput::getInstance();

		$uri = \Joomla\CMS\Uri\Uri::getInstance();
		$link = $uri->toString(array('path', 'query', 'fragment'));




		/*foreach ($cacheparams->modeparams as $key => $value)
		{
			// Use int filter for id/catid to clean out spamy slugs
			if (isset($uri[$key])   )
			{
				$safeuri->$key = $noHtmlFilter->clean($uri[$key], $value);
			}
		}*/



		return   md5(serialize( array( $link,   $moduleparams , $module->id ) ) );
	}


	/**
     * Точка входа для генерации фильтров
     * The entry point for the filters generation
     *
     * @return CfFilter[]
     * @throws Exception
     * @since 1.0
     */
    public function getFilters()
    {
        if ($this->results_loading_mode == 'ajax' || $this->results_trigger == 'btn') {
            $loadAjaxModule = true;
        }
        else {
            $loadAjaxModule = false;
        }


        $this->scriptVars['loadModule'] = $loadAjaxModule;
        $dependency_dir = $this->moduleparams->get('dependency_direction', 'all');

        // profiler to get performance metrics
        // профилировщик для получения показателей производительности
        $profilerParam = $this->moduleparams->get('cf_profiler', 0);

        // the selected filters' options array;
        // массив опций выбранных фильтров;
        $selected_flt = \CfInput::getInputs();



        // selected filters after encoding the output
        // выбранные фильтры после кодирования вывода
        $this->selected_flt = \CfOutput::getOutput($selected_flt, true);

        // holds the selections which should be used for each filter,
        // when the dependency is from-top to bottom
        if (count($this->selected_flt) > 0 && $dependency_dir == 't-b') {
            $this->selected_fl_per_flt = \CfOutput::getOutput( CfInput::getInputsPerFilter($this->module), true, true);
        }

        // check if reset is active
        $this->reset = Factory::getApplication()->input->get('reset', 0, 'int');

        $displayManager = new \DisplayManager($this->moduleparams, $this->selected_flt);

        // define the filters order
        $filters_order = json_decode(str_replace("'", '"', $this->moduleparams->get('filterlist', '')));
        $filters_order = (array) $filters_order;

        if (empty($filters_order) || ! in_array('stock', $filters_order) || count($filters_order) != count($this->fltSuffix)){
            $filters_order = array('q', 'virtuemart_category_id', 'virtuemart_manufacturer_id', 'price', 'stock', 'custom_f');
        }

        foreach ($filters_order as $filter_key) {

            switch ($filter_key) {

                // --keywords search--
                case 'q':
                    if ($displayManager->getDisplayControl('keyword_flt')) {
                        $keyword_flt = new CfFilter();
                        $keyword_flt->setVarName('q');
                        $keyword_flt->setDisplay(CfFilter::DISPLAY_INPUT_TEXT);
                        if($this->moduleparams->get('keyword_flt_display_header', false)) {
                            $keyword_flt->setHeader(Text::_('MOD_CF_KEYWORD'));
                        }
                        $keyword_flt->setType('string');
                        $clearType = $this->component_params->get('keyword_search_clear_filters_on_new_search', true) ? 'all' : 'this';
                        $keyword_flt->setClearType($clearType);
                        $keyword_flt->setExpanded($this->moduleparams->get('keyword_flt_expanded', '1'));
                        $options = array();

                        /*
                         * If no header, add a placeholder
                         */
                        if (! $this->moduleparams->get('keyword_flt_display_header', 0)) {
                            $options[0]['placeholder'] = Text::_('MOD_CF_KEYWORD_SEARCH_PLACEHOLDER');
                        }
                        else {
                            $keyword_flt->setHeader(Text::_('MOD_CF_KEYWORD'));
                        }

                        $options[0]['name'] = 'q';
                        $options[0]['value'] = ! empty($this->selected_flt[$filter_key]) ? $this->selected_flt[$filter_key] : '';
                        $options[0]['size'] = 30;
                        $options[0]['maxlength'] = 40;
                        $options[0]['aria_label'] = Text::_('MOD_CF_KEYWORD');
                        $keyword_flt->setOptions($options);
                        $this->filters[$filter_key] = $keyword_flt;

                        // profiler
                        if ($profilerParam) {
                            $this->profiler->mark('keyword');
                        }
                    }
                    break;

                // --Categories--
                case 'virtuemart_category_id':
                    if ( $displayManager->getDisplayControl('category_flt') ) {

                        $key = $filter_key;
                        $display_key = $key . '_' . $this->module->id; // used as key to the html code

                        // the categories display type
                        $vm_cat_disp_type = $this->moduleparams->get('category_flt_disp_type');

                        // set the header
                        $vmcat_header = Text::_('MOD_CF_CATEGORIES');
                        if ($vm_cat_disp_type != 3) {
                            $vmcat_header = Text::_('MOD_CF_CATEGORY');
                        }

                        // create the filter object
                        $this->display[$key] = $this->moduleparams->get('category_flt_disp_type');
                        $filter = $this->getFilter($key, $vmcat_header, false);


//						echo'<pre>';print_r( $filter );echo'</pre>'.__FILE__.' '.__LINE__ .'<br>';
//						die( __FILE__ .' ' . __LINE__);

                        if(!$filter) {
                            continue 2;
                        }
                        $filter->setHeader($vmcat_header);
                        $filter->setDisplay($this->moduleparams->get('category_flt_disp_type'));
                        $filter->setClearType('this');
                        if ($vm_cat_disp_type != 1) {
                            $filter->setSmartSearch($this->moduleparams->get('category_flt_smart_search', '0'));
                        }
                        $filter->setExpanded($this->moduleparams->get('category_flt_expanded', '1'));
                        $this->filters[$key] = $filter;

                        // display headers and some styles only in displays other than select drop down
                        if (isset($this->filters[$key]) && $vm_cat_disp_type != 1) {

                            // set some styles for the category tree
                            if (! $this->moduleparams->get('category_flt_tree_mode', 0)) {
                                $category_flt_collapsed_icon = $this->moduleparams->get('category_flt_collapsed_icon', '');
                                $category_flt_expanded_icon = $this->moduleparams->get('category_flt_expanded_icon', '');
                                $category_flt_icon_position = $this->moduleparams->get('category_flt_icon_position', 'left');

                                if ($category_flt_collapsed_icon) {

                                    // get the width of the image
                                    $img_size = getimagesize($category_flt_collapsed_icon);
                                    if (is_array($img_size)) {
                                        $img_width = $img_size[0] + 2;
                                    }
                                    else {
                                        $img_width = 16;
                                    }
                                    $style = '';
                                    if ($category_flt_icon_position == 'left') {
                                        $style .= "padding-left:" . $img_width . "px !important;";
                                    } else {
                                        if ($this->direction == 'rtl') {
                                            $style .= "padding-right:" . $img_width . "px !important;";
                                        }
                                        $parent_decl = '#cf_flt_wrapper_virtuemart_category_id_' . $this->module->id . ' .cf_parentOpt{display:block; width:90%;}';
                                    }

                                    // unexpand
                                    $style .= 'background-image:url(' . Uri::base() . $category_flt_collapsed_icon . ') !important;';
                                    $style .= 'background-position:' . $category_flt_icon_position . ' center !important;';
                                    $style .= 'background-repeat:no-repeat !important;';
                                    $this->stylesDeclaration .= '#cf_flt_wrapper_virtuemart_category_id_' . $this->module->id . ' .cf_unexpand{' . $style . '} #cf_flt_wrapper_virtuemart_category_id_' . $this->module->id . ' .cf_unexpand:hover{' . $style . '}';
                                }
                                if ($category_flt_expanded_icon) {

                                    // get the width of the image
                                    $img_size = getimagesize($category_flt_expanded_icon);
                                    if (is_array($img_size)) {
                                        $img_width = $img_size[0] + 2;
                                    }
                                    else {
                                        $img_width = 16;
                                    }
                                    $style = '';
                                    if ($category_flt_icon_position == 'left') {
                                        $style .= "padding-left:" . $img_width . "px !important;";
                                    } else {
                                        if ($this->direction == 'rtl') {
                                            $style .= "padding-right:" . $img_width . "px !important;";
                                        }
                                        if (empty($parent_decl)) {
                                            $parent_decl = '#cf_flt_wrapper_virtuemart_category_id_' . $this->module->id . ' .cf_parentOpt{display:block; width:90%;}';
                                        }
                                    }

                                    // expand
                                    $style .= 'background-image:url(' . Uri::base() . $category_flt_expanded_icon . ') !important;';
                                    $style .= 'background-position:' . $category_flt_icon_position . ' center !important;';
                                    $style .= 'background-repeat:no-repeat !important;';
                                    $this->stylesDeclaration .= '#cf_flt_wrapper_virtuemart_category_id_' . $this->module->id . ' .cf_expand{' . $style . '} #cf_flt_wrapper_virtuemart_category_id_' . $this->module->id . ' .cf_expand:hover{' . $style . '}';
                                }

                                // styling for all the states
                                if (! empty($parent_decl)) {
                                    $this->stylesDeclaration .= $parent_decl;
                                }
                            }
                            // store some params
                            $maxHeight = $this->moduleparams->get('category_flt_scrollbar_after', '');
                            if ($maxHeight) {
                                $this->stylesDeclaration .= " #cf_list_$display_key { max-height:$maxHeight; overflow:auto; height:auto;}";
                            }
                        }

                        // profiler
                        if ($profilerParam) {
                            $this->profiler->mark('vm_categories');
                        }
                    }
                    break;

                // --Manufacturers--
                case 'virtuemart_manufacturer_id':
                    if ($displayManager->getDisplayControl('manuf_flt')) {
                        $key = $filter_key;
                        $display_key = $key . '_' . $this->module->id; // used as key to the html code

                        // -params-
                        $vm_manuf_disp_type = $this->moduleparams->get('manuf_flt_disp_type');

                        // set the header
                        if ($vm_manuf_disp_type != 3) {
                            $mnf_header = Text::_('MOD_CF_MANUFACTURER');
                        }
                        else {
                            $mnf_header = Text::_('MOD_CF_MANUFACTURERS');
                        }

                        // create the filter object
                        $this->display[$key] = $vm_manuf_disp_type;
                        $filter = $this->getFilter($key, $mnf_header, false);
                        if(!$filter) {
                            continue 2;
                        }
                        $filter->setHeader($mnf_header);
                        $filter->setDisplay($vm_manuf_disp_type);
                        $filter->setClearType('this');
                        $filter->setExpanded($this->moduleparams->get('manuf_flt_expanded', '1'));
                        if ($vm_manuf_disp_type != 1) {
                            $filter->setSmartSearch($this->moduleparams->get('manuf_flt_smart_search', '0'));
                        }
                        $this->filters[$key] = $filter;

                        if ($vm_manuf_disp_type != 1) {
                            $maxHeight = $this->moduleparams->get('manuf_flt_scrollbar_after', '');
                            if ($maxHeight) {
                            	$this->stylesDeclaration .= " #cf_list_$display_key { max-height:$maxHeight; overflow:auto; height:auto;}";
                            }
                        }

                        // profiler
                        if ($profilerParam) {
                            $this->profiler->mark('vm_manufs');
                        }
                    }
                    break;

                // --Price--
                case 'price':
                    if ($displayManager->getDisplayControl('price_flt')) {

                        $display_price_inputs = $this->moduleparams->get('price_flt_disp_text_inputs', '1');
                        $display_price_slider = $this->moduleparams->get('price_flt_disp_slider', '1');
                        $display_key = $filter_key . '_' . $this->module->id;

                        if ($display_price_inputs || $display_price_slider) {

                            if ($display_price_inputs) {
                                $this->scriptProcesses[] = "customFilters.addEventsRangeInputs('$filter_key', {$this->module->id});";
                            }

                            $joomla_conf = Factory::getConfig();
                            $joomla_sef = $joomla_conf->get('sef');
                            $this->scriptVars['cfjoomla_sef'] = $joomla_sef;
                            $this->scriptVars[$display_key . '_display_price_slider'] = $display_price_slider;
                            $this->scriptVars[$display_key . '_display_price_inputs'] = $display_price_inputs;

                            $vendor_currency = cftools::getVendorCurrency();
                            $virtuemart_currency_id = Factory::getApplication()->input->get('virtuemart_currency_id', $vendor_currency['vendor_currency'], 'int');
                            $currency_id = Factory::getApplication()->getUserStateFromRequest("virtuemart_currency_id", 'virtuemart_currency_id', $virtuemart_currency_id);
                            $this->currency_info = cftools::getCurrencyInfo($currency_id);
                            if (! empty($this->currency_info)) {
                                $this->scriptVars['currency_decimal_symbol'] = $this->currency_info->currency_decimal_symbol;
                            }
                                /*
                             * we are generating the vars that generates the setFilter function.
                             * This way we can use the renderFilters function later to render the price filter
                             */

                            if ($display_price_inputs && ! $display_price_slider) {
                                $price_flt_disp_type = 5; // range input
                            }
                            else
                                if ($display_price_inputs && $display_price_slider) {
                                    $price_flt_disp_type = CfFilter::DISPLAY_INPUT_TEXT.','.CfFilter::DISPLAY_RANGE_SLIDER;
                                } else {
                                	$price_flt_disp_type = CfFilter::DISPLAY_RANGE_SLIDER;
                                }

                            $min_range = $this->moduleparams->get('price_flt_slider_min_value', '0');
                            $max_range = $this->moduleparams->get('price_flt_slider_max_value', '300');
                            /*
                             * find the dynamic price ranges of the displayed products
                             */
                            if ($display_price_slider && $this->moduleparams->get('price_flt_dynamic_ranges', 0)) {
                                if (empty($selected_flt) || (count($selected_flt) == 1 && ! empty($selected_flt['price'])));
                                else {
                                    $ranges = $this->optionsHelper->getRelativePriceRanges();
                                }
                                if (! empty($ranges->min_value)) {
                                    $min_range = $ranges->min_value;
                                }
                                if (! empty($ranges->max_value)) {
                                    $max_range = $ranges->max_value;
                                }
                                if ($min_range == $max_range) {
                                    $min_range = 0;
                                }
                            }

                            $cf_price_size = 6;
                            $cf_price_maxlength = 13;
                            $price_flt = new CfFilter();
                            $price_flt->setVarName('price');
                            $price_flt->setDisplay($price_flt_disp_type);
                            $price_flt->setHeader(Text::_('MOD_CF_PRICE'));
                            $price_flt->setExpanded($this->moduleparams->get('price_flt_expanded', '1'));
                            $price_flt->setType('float'); // then we will add a validation rule according to the type
                            $price_flt->setClearType('this');
                            $options = [];

                            // from
                            $options[0]['name'] = 'price[0]';
                            $options[0]['id'] = 0;
                            $options[0]['value'] = ! empty($this->selected_flt[$filter_key][0]) ? $this->selected_flt[$filter_key][0] : '';
                            $options[0]['pattern'] = '[\d.,]*';
                            $options[0]['aria_label'] = Text::_('MOD_CF_FILTERING_RANGE_MIN_PLACEHOLDER');
                            $options[0]['size'] = $cf_price_size;
                            $options[0]['maxlength'] = $cf_price_maxlength;
                            $options[0]['slider_min_value'] = $min_range;

                            // to
                            $options[1]['name'] = 'price[1]';
                            $options[1]['id'] = 1;
                            $options[1]['value'] = ! empty($this->selected_flt[$filter_key][1]) ? $this->selected_flt[$filter_key][1] : '';
                            $options[1]['label'] = Text::_('MOD_CF_RANGE_TO');
                            $options[1]['pattern'] = '[\d.,]*';
                            $options[1]['aria_label'] = Text::_('MOD_CF_FILTERING_RANGE_MAX_PLACEHOLDER');
                            $options[1]['size'] = $cf_price_size;
                            $options[1]['maxlength'] = $cf_price_maxlength;
                            $options[1]['slider_max_value'] = $max_range;
                            $price_flt->setOptions($options);
                            $this->filters[$filter_key] = $price_flt;
                        }

                        // profiler
                        if ($profilerParam) {
                            $this->profiler->mark('price_flt');
                        }
                    }
                    break;

                //stock filter
                case 'stock':
                    if ($displayManager->getDisplayControl('stock_flt')) {
                        $this->display[$filter_key] = $this->moduleparams->get('stock_flt_disp_type', 4);
                        $stock_flt = $this->getFilter($filter_key, Text::_('MOD_CF_STOCK'), false);
                        if(!$stock_flt) {
                            continue 2;
                        }
                        $stock_flt->setVarName('stock');
                        $stock_flt->setDisplay($this->moduleparams->get('stock_flt_disp_type', CfFilter::DISPLAY_LINK));
                        $stock_flt->setHeader(Text::_('MOD_CF_STOCK'));
                        $stock_flt->setExpanded($this->moduleparams->get('stock_flt_expanded', '1'));
                        $stock_flt->setClearType('this');
                        $this->filters[$filter_key] = $stock_flt;

                        // profiler
                        if ($profilerParam) {
                            $this->profiler->mark('stock_flt');
                        }
                    }
                    break;

                // --Custom filters--
                case 'custom_f':

                    if ($displayManager->getDisplayControl('custom_flt')) {

                        $custom_flt = cftools::getCustomFilters($this->moduleparams);

                        $cf_range_size = 6;
                        $cf_range_maxlength = 5;

                        // get the options
                        foreach ($custom_flt as $cf) {
                            /*
                             * check if it should be displayed based on the filter's settings
                             * проверьте, должно ли оно отображаться на основе настроек фильтра
                             */
                            if (! $displayManager->displayCustomFilter($cf)) {
                                continue;
                            }


                            $var_name = "custom_f_$cf->custom_id";
                            $key = $var_name;
                            // etc: custom_f_33_127
							$display_key = $key . '_' . $this->module->id; // used as key to the html code


                            // load the params of that cf
                            $cfparams = new Registry();
                            $cfparams->loadString($cf->params, 'JSON');

                            // no smart search and scrollbar to drop-downs
                            // нет умного поиска и полосы прокрутки для выпадающих списков
                            if ($cf->disp_type != 1) {
                                $maxHeight = $cfparams->get('scrollbar_after', '');
                                if ($maxHeight) {
                                    $this->stylesDeclaration .= " #cf_list_$display_key { max-height:$maxHeight; overflow:auto; height:auto;}";
                                }
                            }



                            // selectable types
                            if ( strpos($cf->disp_type, CfFilter::DISPLAY_INPUT_TEXT) === false
	                            && strpos($cf->disp_type, CfFilter::DISPLAY_RANGE_SLIDER) === false
	                            && strpos($cf->disp_type, CfFilter::DISPLAY_RANGE_DATES) === false)
                            {
                                $this->display[$key] = $cf->disp_type;

                                // Создаем Поля - со значениями getFilter
                                $filter = $this->getFilter($var_name, Text::_($cf->custom_title), true);
	                            if(!isset($filter)) continue;



	                            // Set the description
	                            $filter->setDescription(isset($cf->tooltip) ? $cf->tooltip : '');



                                // Display smart search in displays other than "color_btn"
                                if ($cf->disp_type != CfFilter::DISPLAY_COLOR_BUTTON && $cf->disp_type != CfFilter::DISPLAY_COLOR_BUTTON_MULTI) {
                                    $filter->setSmartSearch($cfparams->get('smart_search', '0'));
                                }
                            }

                            // range
                            else {

                                if (strpos($cf->disp_type, CfFilter::DISPLAY_INPUT_TEXT) !== false) {
                                    $this->scriptProcesses[] = "customFilters.addEventsRangeInputs('$key', {$this->module->id});";
                                }

                                // general vars
                                $filter = new CfFilter();
                                $filter->setVarName($var_name);
                                $filter->setType('int');
                                $filter->setDescription(isset($cf->tooltip) ? $cf->tooltip : '');
                                $options = [];

                                // from
                                $options[0]['size'] = $cf_range_size;
                                $options[0]['id'] = 0;
                                $options[0]['name'] = $var_name . '[0]';
                                $options[0]['value'] = ! empty($this->selected_flt[$var_name][0]) ? $this->selected_flt[$var_name][0] : '';
                                $options[0]['maxlength'] = $cf_range_maxlength;
                                $options[0]['placeholder'] = Text::_('MOD_CF_FILTERING_RANGE_MIN_PLACEHOLDER');
                                $options[0]['pattern'] = '[\d.,]*';
                                $options[0]['slider_min_value'] = $cfparams->get('slider_min_value', 0);

                                // to
                                $options[1]['size'] = $cf_range_size;
                                $options[1]['id'] = 1;
                                $options[1]['name'] = $var_name . '[1]';
                                $options[1]['value'] = ! empty($this->selected_flt[$var_name][1]) ? $this->selected_flt[$var_name][1] : '';
                                $options[1]['maxlength'] = $cf_range_maxlength;
                                $options[1]['placeholder'] = Text::_('MOD_CF_FILTERING_RANGE_MAX_PLACEHOLDER');
                                $options[1]['pattern'] = '[\d.,]*';
                                $options[1]['slider_max_value'] = $cfparams->get('slider_max_value', 300);

                                $filter->setOptions($options);
                            }



                            // Set the filter, only if it has values
                            if ( !empty($filter->getOptions())) {

								$filter->setClearType('this');
                                $filter->setDisplay($cf->disp_type);
                                $filter->setExpanded($cfparams->get('expanded', '1'));
                                $filter->setHeader(Text::_($cf->custom_title));
                                $this->filters[$key] = $filter;

                            }





                            // profiler
                            if ($profilerParam) {
                                $this->profiler->mark($var_name);
                            }
                        }
                    }
                    break;
            } // switch
        } // foreach

        // profiler print metrics
        if ($profilerParam)  \cftools::printProfiler($this->profiler);


        if (count($this->filters) > 0) {
            $this->scriptVars['parent_link'] = $this->moduleparams->get('category_flt_parent_link', 0);

            // set ajax spinners
            if ($this->moduleparams->get('use_ajax_spinner', '')) {
                $spinnerstyle = 'background-image:url(' . Uri::base() . $this->moduleparams->get('use_ajax_spinner', '') . ') !important;';
                $spinnerstyle .= 'background-position:center center;';
                $spinnerstyle .= 'background-repeat:no-repeat !important;';
                $this->stylesDeclaration .= '.cf_ajax_loader{' . $spinnerstyle . '}';
                $ajax_module_spinner = 1;
            } else {
                $ajax_module_spinner = 0;
            }

            if ($this->moduleparams->get('use_results_ajax_spinner', '')) {
                $spinnerstyle = 'background-image:url(' . Uri::base() . $this->moduleparams->get('use_results_ajax_spinner', '') . ') !important;';
                $spinnerstyle .= 'background-repeat:no-repeat !important;';
                $this->stylesDeclaration .= '#cf_res_ajax_loader{' . $spinnerstyle . '}';
                $ajax_results_spinner = 1;
            } else {
                $ajax_results_spinner = 0;
            }

            $this->scriptVars['mod_type'] = 'filtering';
            $this->scriptVars['use_ajax_spinner'] = $ajax_module_spinner;
            $this->scriptVars['use_results_ajax_spinner'] = $ajax_results_spinner;
            $this->scriptVars['results_loading_mode'] = $this->moduleparams->get('results_loading_mode', 'http');
            $this->scriptVars['category_flt_parent_link'] = $this->moduleparams->get('category_flt_parent_link', 0);
            $this->scriptVars['category_flt_onchange_reset'] = $this->moduleparams->get('category_flt_onchange_reset', 'filters');

            if ($dependency_dir != 't-b') {
                $this->selected_flt_modif = $this->removeInactiveOpt();
            }
        }

	    /**
	     * -----------------------------------------------------------------
	     */

	    /**
	     * @var array $selected_filters - Выбранные фильтры
	     */
	    $selected_filters = $this->getSelectedFilters();
	    $this->urlHandler = new UrlHandler( $this->module, $selected_filters);
        $seoTools = new seoTools();

		$optionsFilterArr = [];
		// Loop Filters
	    foreach ( $this->filters as $key => &$filter)
	    {

		    $Options = $filter->getOptions() ;



			// Loop Option
            foreach ( $Options as &$option)
		    {
				// создаем URL /filtr/metallocherepitsa/?custom_f_22[0]......
			    $option->option_url = \JRoute::_( $this->urlHandler->getURL($filter, $option->id, $option->type ));



                // Добавить obj. SEF Link
				$option->option_sef_url =   $seoTools->createSefUrl( $filter , $option  );

                $var_name = $filter->getVarName();
                if ( $var_name == 'virtuemart_category_id' )
                {
                    $option->option_sef_url->sef_url = $option->option_url ;
                }#END IF

			    $optionsFilterArr[] = $option ;
			}#END FOREACH $Options


		    // Устанавливаем Опции фильтра
		    $filter->setOptions( $Options );

		}#END FOREACH


	    $seoTools->updateSeoTable( $optionsFilterArr );
	    

        return $this->filters;
    }

    /**
     * Создает фильтр со всеми основными свойствами, включая его параметры.
     *
     * Creates a filter with all the basic properties including it's options
     *
     *
     * @param   string The name of the variable which will be used in the filtering form
     * @param   string The header of the filter
     * @param   boolean Indicates if a filter contains strings. In this case they should be encoded
     * @return  CfFilter
     * @throws Exception
     * @author  Sakis Terz
     * @since   1.0
     */
    public function getFilter($var_name , $header = '', $encoded_var = false)
    {

        $activeOptions = [];
        $on_category_reset_others = false;
        $getActive = false;
        $is_customfield = strpos($var_name, 'custom_f_');
        $activeArray = [];
        $has_active_opt = false;
        $selected_array = [];
        $maxLevel = 0;

        // add the counter settings
        if ($is_customfield !== false) {
            $field_key = 'custom_f';
        }
        else {
            $field_key = $var_name;
        }




        $suffix = $this->fltSuffix[$field_key];
        $dependency_direction = $this->moduleparams->get('dependency_direction', 'all');
        $displayCounter = $this->moduleparams->get($suffix . '_display_counter_results', '1');
        $display_empty_opt = $this->moduleparams->get($suffix . '_disable_empty_filters', '1');
        $reset_type = $this->component_params->get('reset_results', 0);
        $selected_flt = $this->selected_flt;


        if ($dependency_direction == 't-b') {
            if (isset($this->selected_fl_per_flt[$var_name])) {
                $selected_flt = $this->selected_fl_per_flt[$var_name];
            }
            else {
                $selected_flt = [];
            }
        }

        if ($var_name == 'virtuemart_category_id') {
            // Параметр модуля [Категории -> Отображать счетчик возле каждой опции]
            $on_category_reset_others = $this->moduleparams->get('category_flt_onchange_reset', 'filters');
        }





//        echo'<pre>';print_r( $selected_flt );echo'</pre>'.__FILE__.' '.__LINE__ .'<br>';
//        echo'<pre>';print_r( $this->selected_flt );echo'</pre>'.__FILE__.' '.__LINE__ .'<br>';

	    /*
	     * Получите параметры этого фильтра из соответствующей функции, которая не учитывает выбор в других фильтрах.
	     *
	     * если нет выбора
         * или единственный выбор - текущий фильтр
         * или тип отображения "показать как включенный"
         * или зависимость сверху вниз и это первый фильтр сверху
         * или сбросить фильтры при изменении категории - для фильтра категорий
	     *
		 * Get the options of that filter from the relevant function that does not get into account the selections in other filters
		 *
		 * in case there is no selection
		 * or the only selection is the current filter
		 * or the display type is "show as enabled"
		 * or the dependency is top-to-bottom and its the 1st filter from top
		 * or reset filters on category change - for the categories filter
		 */
	    if (empty($selected_flt) ||
		    (!empty($selected_flt) && isset($selected_flt[$var_name]) && count($selected_flt) == 1) ||
		    $display_empty_opt == '2' ||
		    $on_category_reset_others == 'filters_keywords' ||
		    ($on_category_reset_others == 'filters' && empty($selected_flt['q'])))
	    {


//            echo'<pre>';print_r( $var_name );echo'</pre>'.__FILE__.' '.__LINE__ .'<br>';
//            die( __FILE__ .' ' . __LINE__);


		    $results = $this->optionsHelper->getOptions($var_name);


		    $options_ar = $results;

		    if ($var_name == 'virtuemart_category_id')
		    {
			    $options_ar = $results['options'];
			    $maxLevel   = $results['maxLevel'];
		    }

		    /*
			 * In case of display type=(2) "all as enabled" and the displayCounter is true
			 * We should run the getActiveOptions to get the counter relative to the selected filters
			 * This should happen only if there are selections in other filters.
			 * Also when the categories are affected by other selections, should get into that logic.
			 */
		    if ($display_empty_opt == '2'
			    && $options_ar
			    && (
				    !empty($selected_flt)
				    && ((!empty($selected_flt[$var_name])
						    && count($selected_flt) > 1) || empty($selected_flt[$var_name])
				    )
			    )
			    && $displayCounter
			    && (
				    $on_category_reset_others == '0'
				    || ($on_category_reset_others == 'filters' && !empty($selected_flt['q']))
			    ))
		    {

			    $activeOptions = $this->optionsHelper->getActiveOptions($var_name);
			    $getActive     = true;
		    }
	    } // hide disabled


	    elseif ($display_empty_opt == '0')
	    {

		    // Получить Активные опции
		    $options_ar = $this->optionsHelper->getActiveOptions($var_name, $joinFieldData = true);


		    // this fixes an anomaly in optionsHelper. It always return an option for the stock, even with 0 counter
		    if ($var_name == 'stock' && count($options_ar) == 1 && reset($options_ar)->counter == 0)
		    {
			    $options_ar = [];
		    }
		    // when we have category tree we should get all the categories as all the parents should be active when they have sub-categories
		    if ($var_name == 'virtuemart_category_id' && $this->moduleparams->get('categories_disp_order', 'tree') == 'tree')
		    {
			    $results  = $this->optionsHelper->getOptions($var_name);
			    $maxLevel = $results['maxLevel'];
			    if ($maxLevel > 0)
			    {
				    $categories = $results['options'];
				    $options_ar = $this->createTree($categories, $options_ar, $maxLevel);
			    }
		    }
	    }

	    // display empty as disabled
	    elseif ($display_empty_opt == '1')
	    {
		    $results    = $this->optionsHelper->getOptions($var_name);
		    $options_ar = $results;
		    if ($var_name == 'virtuemart_category_id')
		    {
			    $options_ar = $results['options'];
			    $maxLevel   = $results['maxLevel'];
		    }
		    if ($options_ar)
		    {
			    $activeOptions = $this->optionsHelper->getActiveOptions($var_name);
			    $getActive     = true;
		    }
	    }




        // придать каждому варианту необходимые свойства
	    // give to each option the necessary properties
        if (is_array($options_ar) && !empty($options_ar)) {
            $disp_type = isset($this->display[$var_name]) ? $this->display[$var_name] : 4;
            $displaySelectedOnTop = false;

            // display on top only for checkboxes , when they exceed a certain nr and the filter is not category
            if ($var_name != 'virtuemart_category_id' && $disp_type == 3 && count($options_ar) > 10) {
                $displaySelectedOnTop = $this->moduleparams->get('disp_selected_ontop', '1');
            }

            $custom_flt_disp_empty = $this->moduleparams->get('custom_flt_disp_empty', '0');
            $disp_clear_tool = $this->moduleparams->get('disp_clear', '1');

            // get the active option of the filter
            // if the param is show as disabled
            // in every other case the $options_ar will contain the options that should be displayed
            // if($display_empty_opt=='1' && $thereIsSelection)$activeOptions=$this->optHelper->getActiveOptions($var_name);

            // when it returns true all are active
            if ($activeOptions === true) {
                $activeOptions = [];
            }

			// Начало создания фильтра
            $filter = new CfFilter();
            $filter->setVarName($var_name);
            $filter->setDisplay($disp_type);
            $filter->setHeader($header);
            $filter->setCounter($displayCounter);



//            echo'<pre>';print_r( $options_ar );echo'</pre>'.__FILE__.' '.__LINE__;
//            echo'<pre>';print_r( $filter );echo'</pre>'.__FILE__.' '.__LINE__;
//            die(__FILE__ .' '. __LINE__ );



			$options = [];

            // store the inactive selected too
            $innactive_selected = array();
            $i = 1;


            foreach ($options_ar as $key => $opt) {
                $options[$key] = array();
                $options[$key]['id'] = $opt->id;
                $options[$key]['label'] = $opt->name;
                $options[$key]['description'] = isset($opt->description) ? trim((string)$opt->description) : '';
                $options[$key]['selected'] = 0;
                $options[$key]['type'] = 'option';

                // set media/images
                if (! empty($opt->media_id)) {
                	$options[$key]['media_id'] = $opt->media_id;
                }

                    // in case of category tree we need some more properties for the tree
                if ($var_name == 'virtuemart_category_id' && $this->moduleparams->get('categories_disp_order', 'tree') == 'tree' && $disp_type != 1 && $maxLevel > 0) {
                    if (isset($opt->level)) {
                        $options[$key]['level'] = $opt->level;
                    }
                    if (isset($opt->cat_tree)) {
                        $options[$key]['cat_tree'] = $opt->cat_tree;
                    }
                    if (isset($opt->isparent)) {
                        $isparent = $opt->isparent;
                    }
                    else {
                        $isparent = false;
                    }
                    $options[$key]['isparent'] = $isparent;
                    $options[$key]['parent_id'] = $opt->category_parent_id;
                }

                $select_opt = false;

                // check if selected
                if (isset($selected_flt[$var_name])) {
                    $opt_id = $opt->id;
                    if (in_array($opt_id, $selected_flt[$var_name])) {
                        $select_opt = true;
                    }
                }




                // when there are active options , get the counter from the getActiveOptions function
                // this happens only when the display empty type is:"display as disabled" or "display as enabled" and there is a selection in another filter
	            if ($getActive)
	            {
		            if (isset($activeOptions[$opt->id]) || !empty($opt->isparent))
		            {
			            if ($filter->getCounter() && isset($activeOptions[$opt->id]->counter))
			            {
				            $options[$key]['counter'] = $activeOptions[$opt->id]->counter;
			            }
			            $options[$key]['active'] = true;
			            if ((isset($options[$key]['counter']) && $options[$key]['counter'] == 0) && empty($opt->isparent))
			            {
				            $options[$key]['active'] = false;
			            }
			            $has_active_opt = true;
			            $activeArray[]  = $opt->id;
		            }
		            else
		            {
			            if ($filter->getCounter())
			            {
				            $options[$key]['counter'] = 0;
			            }
			            $options[$key]['active'] = false;
			            if ($select_opt)
			            {
				            $innactive_selected[] = $opt->id;
			            }

			            // when all are enabled
			            if ($display_empty_opt == '2')
			            {
				            $options[$key]['active'] = true;
				            if (isset($opt->counter) && $opt->counter > 0)
				            {
					            $has_active_opt = true;
				            }
				            $activeArray[] = $opt->id;
			            }
		            }
	            }
	            else
	            {
		            if ($filter->getCounter() && isset($opt->counter))
		            {
			            $options[$key]['counter'] = $opt->counter;
			            if ((isset($opt->counter) && $opt->counter > 0) || $display_empty_opt == '2')
			            {
				            $options[$key]['active'] = true;
				            $activeArray[]           = $opt->id;
				            if (isset($opt->counter) && $opt->counter > 0)
				            {
					            $has_active_opt = true;
				            }
			            }
			            else
			            {
				            if (!empty($opt->isparent))
				            {
					            $options[$key]['active'] = true;
					            unset($options[$key]['counter']);
				            }
				            else
				            {
					            $options[$key]['active'] = false;
				            }
				            if ($select_opt)
				            {
					            $innactive_selected[] = $opt->id;
				            }
			            }
		            }

		            // when there is no counter and there is no selection - all are inactive
		            else
		            {
			            if (!empty($opt->emptyParent) && $disp_type == 1)
			            {
				            $options[$key]['active'] = false;
			            }
			            else
			            {
				            $options[$key]['active'] = true;
				            $activeArray[]           = $opt->id;
				            $has_active_opt          = true;
			            }
		            }

	            }

                //unset inactive options
                if($options[$key]['active'] == 0 && $display_empty_opt == 0) {
                    unset($options[$key]);
                    continue;
                }

                if ($select_opt) {
                    $options[$key]['selected'] = 1;
                    $opt = $options[$key];

                    if (isset($opt['cat_tree'])) {
                        $opt_tree = $opt['cat_tree'] . '-' . $opt['id'];
                        if (! in_array($opt_tree, $this->active_tree)) {

                            // used by the tree (categories), to indicate the selected category's tree
                            $this->active_tree[] = $opt_tree;
                        }
                    }

                    // if set selected on top unset it now and put later at the top
                    if ($displaySelectedOnTop) {
                        $selected_array[$opt['id']] = $opt;
                        unset($options[$key]);
                    }
                }
                $i ++;
            }



            /**
             * Generate the 1st null/clear option
             * If options exist and there is a selection ($selected_array)
             * if all are selected, all options are unset.
             * Hence we need to check either if there are options or are selected.
             * But null/clear should always display for drop-down lists/select.
             */
            if ((!empty($options) || !empty($selected_array))
	            && (
                    in_array($disp_type, [
                    CfFilter::DISPLAY_RADIO,
                    CfFilter::DISPLAY_LINK,
                    CfFilter::DISPLAY_IMAGE_LINK,
                    CfFilter::DISPLAY_CHECKBOX,
                    CfFilter::DISPLAY_COLOR_BUTTON,
                    CfFilter::DISPLAY_COLOR_BUTTON_MULTI,
                    CfFilter::DISPLAY_BUTTON,
                    CfFilter::DISPLAY_BUTTON_MULTI
                ])
                    && $disp_clear_tool == 1
                    && isset($selected_flt[$var_name])
                ) || $disp_type == CfFilter::DISPLAY_SELECT) {
                $nullOption = [];
                $nullOption['id'] = '';
                $nullOption['active'] = true;

                /*
                 * If the "reset all" returns no products and is the only filter to be reset, then display the none as 1st option's label
                 * Otherwise display the Any as 1st option's label
                 */
                if ($disp_type != 3 && $disp_type != 10 && $disp_type != 12 && $var_name != 'stock') {
                    if ($reset_type == 0 && (empty($selected_flt) || (count($selected_flt) == 1 && ! empty($selected_flt[$var_name])))) {
                        $nullOption['label'] = Text::sprintf('MOD_CF_NONE', $header);
                    } else {
                        $nullOption['label'] = Text::sprintf('MOD_CF_ANY_HEADER', $header);
                    }
                } else {
                    $nullOption['label'] = Text::_('MOD_CF_CLEAR');
                }
                $type = "clear";

                // if no selection set as default
                $nullOption['type'] = $type;
                $nullOption['selected'] = !isset($selected_flt[$var_name]) || count($selected_flt[$var_name]) == 0 ? true : false;

                //if display selected on top, put in the array that is added upon the list
                if($displaySelectedOnTop) {
                    array_unshift($selected_array, $nullOption);
                }
                else {
                    array_unshift($options, $nullOption);
                }
            }

            $filter->setOptions($options);
            // set the active tree for that filter
            $filter->setActiveTree($this->active_tree);




            /*
             * if there are active subtrees, can be autoexpanded
             * But can happen only:
             * in categories
             * When the there are active options
             * When there is no category selected
             * When the setting for auto-expand is active
             * When the categories reset other filters. i.e. can be affected by the search
             * When there is search
             */
            if ($var_name == 'virtuemart_category_id' &&
                ! empty($activeArray) && empty($this->active_tree) &&
                $this->moduleparams->get('categories_disp_order', 'tree') == 'tree' &&
                $this->moduleparams->get('category_flt_auto_expand_subtrees', '1') &&
                $this->moduleparams->get('category_flt_onchange_reset', 'filters') == 'filters' && ! empty($selected_flt['q'])) {
                $filter->setActiveTree($this->getActiveSubtrees($activeArray, $options));
            }

            // there is a param for custom filters-to hide them if all are inactive
            if ($is_customfield !== false && !$custom_flt_disp_empty && (empty($activeArray) || !$has_active_opt)) {}
            else {
                // put selected on top
                if (! empty($selected_array)) {
                    $options = $selected_array + $options;
                    $filter->setOptions($options);
                }

                // check for inactive selected
                if (! empty($activeArray) && ! empty($selected_flt[$var_name])) {
                    $innactive_selected = array_diff($selected_flt[$var_name], $activeArray);
                }
                if (!empty($innactive_selected)) {
                    $filter->setInactiveSelectedOptions($innactive_selected);
                }
            }

	        if ( $_SERVER['REMOTE_ADDR'] == '80.187.99.133' )
	        {
//		        echo'<pre>';print_r( $filter );echo'</pre>'.__FILE__.' '.__LINE__;
//		        die(__FILE__ .' '. __LINE__ );
	        }

            return $filter;
        }
    }

    /**
     * Get active subtrees
     *
     * @param array $activeArray active options
     * @param array $options the options
     * @since 2.2.1
     * @return array
     */
    function getActiveSubtrees($activeArray, $options)
    {
        // all are active
        if (count($activeArray) == count($options) - 1) {
            return [];
        }
        foreach ($options as $opt) {

            // if is active and not parent enable that subtree
            if ($opt['active'] && empty($opt['isparent'])) {
                if (isset($opt['cat_tree'])) {
                    $opt_tree = $opt['cat_tree'] . '-' . $opt['id'];
                    if (! in_array($opt_tree, $this->active_tree)) {

                        // used by the tree (categories), to indicate the selected category's tree
                        $this->active_tree[] = $opt_tree;
                    }
                }
            }
        }
        return $this->active_tree;
    }

    /**
     * It creates a tree (e.g.
     * Categories), enabling also the parents of the active options
     * This way the user can reach the active options in the tree depth
     *
     * @param array $options All the options
     * @param array $activeOptions
     * @param int $maxLevel The higher level
     * @return array
     * @since 1.6.0
     */
    function createTree($options, $activeOptions, $maxLevel)
    {
        // if all are active it will be true
        if (! is_array($activeOptions)) {
            $activeOptions = array();
        }
        $parent_categories = array();
        $parent_categories2 = array();
        $activeKeys = array_keys($activeOptions);

        // find the parents of the active
        foreach ($activeOptions as $aOpt) {
            if ($aOpt->category_parent_id > 0) {
                $parent_id = $aOpt->category_parent_id;
                $parent = $options[$parent_id];
                while ($parent_id > 0) {
                    if (! in_array($aOpt->category_parent_id, $activeKeys)) {
                    	$parent_categories[] = $parent_id;
                    } // stores the parents which are active
                    $parent_categories2[] = $parent_id; // stores the parents of the active children
                    $parent_id = $parent->category_parent_id;
                    if ($parent_id > 0) {
                    	$parent = $options[$parent_id];
                    }
                }
            }
        }

        foreach ($options as $key => &$opt) {

            // unset those which are inactive or non parents of the active
            if (! in_array($opt->id, $activeKeys) && ! in_array($opt->id, $parent_categories)) {
                unset($options[$key]);
            } else {
                if (isset($activeOptions[$key]) && isset($activeOptions[$key]->counter)) {
                	$opt->counter = $activeOptions[$key]->counter;
                }

                    // indicates that it is displayed only because its parent and is not included in the active options
                if (in_array($opt->id, $parent_categories) && ! in_array($opt->id, $activeKeys)) {
                	$opt->emptyParent = true;
                }

                    // find if a parent has any child
                if (! in_array($opt->id, $parent_categories2)) {
                	unset($opt->isparent);
                }
            }
        }
        unset($opt);
        return $options;
    }

    /**
     * Удалить любую неактивную опцию из выбранных опций
     * Этот массив позже используется функцией getURI, которая не должна использовать inactive для генерации URI опции.
     *
     * Remove any inactive option from the selected options
     * This array is used later by the getURI func which should not use the inactive to generate the option's URI
     *
     * @return array
     * @since 1.0
     */
    public function removeInactiveOpt(): array
    {
        if (empty($this->selected_flt)) {
            return $this->selected_flt;
        }
        $myselection = $this->selected_flt;
        foreach ($myselection as $key => &$array) {
            if (! is_array($array) || !isset($this->filters[$key])) {
                continue;
            }
            foreach ($array as $key2 => $sel) {
                $innactiveSelected = $this->filters[$key]->getInactiveSelectedOptions();
                if (isset($innactiveSelected) && in_array($sel, $innactiveSelected)) {
                	unset($array[$key2]);
                }
            }
        }
        return $myselection;
    }

    /**
     * @return array
     * @since 1.50
     */
    public function getSelectedFilters(): array
    {
	    return [
	        'selected_flt' => $this->selected_flt,
	        'selected_flt_modif' => $this->selected_flt_modif,
	        'selected_fl_per_flt' => $this->selected_fl_per_flt
	    ];
    }

    /**
     * @return array
     * @since 2.5.0
     */
    public function getScriptVars()
    {
        return $this->scriptVars;
    }

    /**
     * @return array
     * @since 2.5.0
     */
    public function getScriptProcesses()
    {
        return $this->scriptProcesses;
    }

    /**
     * @return string
     * @since 2.5.0
     */
    public function getStyles()
    {
        return $this->stylesDeclaration;
    }
}
