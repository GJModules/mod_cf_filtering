<?php
/**
 * @package      customfilters
 * @subpackage   mod_cf_filtering
 * @copyright    Copyright (C) 2012-2021 breakdesigns.net . All rights reserved.
 * @license      GNU General Public License version 2 or later; see LICENSE.txt
 */

// no direct access
defined('_JEXEC') or die;


class CfFilter
{
    const DISPLAY_SELECT = '1';

    const DISPLAY_RADIO = '2';

    const DISPLAY_CHECKBOX = '3';

    const DISPLAY_LINK = '4';

    const DISPLAY_INPUT_TEXT = '5';

    const DISPLAY_RANGE_SLIDER = '6';

    const DISPLAY_IMAGE_LINK = '7';

    const DISPLAY_RANGE_DATES = '8';

    const DISPLAY_COLOR_BUTTON = '9';

    const DISPLAY_COLOR_BUTTON_MULTI = '10';

    const DISPLAY_BUTTON = '11';

    const DISPLAY_BUTTON_MULTI = '12';

    /**
     * The displays in array
     * Those keys are used as a reference to the sublayout file names
     *
     * @since 2.8.0
     * @var array
     */
    public $displays = [
        'select' => self::DISPLAY_SELECT,
        'radio' => self::DISPLAY_RADIO,
        'checkbox' => self::DISPLAY_CHECKBOX,
        'link' => self::DISPLAY_LINK,
        'input_text' => self::DISPLAY_INPUT_TEXT,
        'range_slider' => self::DISPLAY_RANGE_SLIDER,
        'image_link' => self::DISPLAY_IMAGE_LINK,
        'range_dates' => self::DISPLAY_RANGE_DATES,
        'color_button' => self::DISPLAY_COLOR_BUTTON,
        'color_button_multi' => self::DISPLAY_COLOR_BUTTON_MULTI,
        'button' => self::DISPLAY_BUTTON,
        'button_multi' => self::DISPLAY_BUTTON_MULTI
    ];

    /**
     * @since 2.8.0
     * @var string
     */
    protected $var_name;

    /**
     * @since 2.8.0
     * @var array
     */
    protected $display = [self::DISPLAY_SELECT];

    /**
     * @since 2.8.0
     * @var string
     */
    protected $header = '';

    /**
     * @since 2.9.2
     * @var string
     */
    protected $description = '';

    /**
     * @since 2.8.0
     * @var string
     */
    protected $type = 'string';

    /**
     * @since 2.8.0
     * @var string
     */
    protected $clearType = 'all';

    /**
     * @since 2.8.0
     * @var bool
     */
    protected $expanded = true;

    /**
     * @since 2.8.0
     * @var bool
     */
    protected $smartSearch = false;

    /**
     * @since 2.8.0
     * @var bool
     */
    protected $counter = true;

    /**
     * @since 2.8.0
     * @var array
     */
    protected $options = [];

    /**
     * @since 2.8.0
     * @var array
     */
    protected $activeTree;

    /**
     * Store the values which are selected but disabled
     *
     * @since 2.8.0
     * @var array
     */
    protected $inactive_select_opt;

    /**
     * Get the name of the filter
     *
     * @return string
     * @since 2.8.0
     */
    public function getVarName()
    {
        if (empty($this->var_name)) {
            throw new \RuntimeException('No name is defined for the filter');
        }
        return $this->var_name;
    }

    /**
     * @param $var_name
     * @return CfFilter
     * @since 2.8.0
     */
    public function setVarName($var_name)
    {
        $this->var_name = (string)$var_name;
        return $this;
    }

    /**
     * Get the name of the filter
     *
     * @return string
     * @since 2.8.0
     */
    public function getDisplay()
    {
        return $this->display;
    }

    /**
     * Set the display type of the filter
     *
     * @param int $display
     * @return $this
     * @since 2.8.0
     */
    public function setDisplay($display)
    {
        if (!is_array($display)) {
            $display = explode(',', $display);
        }
        $display = array_map('intval', $display);
        $this->display = $display;
        return $this;
    }

    /**
     * @return string
     * @since 2.8.0
     */
    public function getHeader()
    {
        return $this->header;
    }

    /**
     * @param $header
     * @return $this
     * @since 2.8.0
     */
    public function setHeader($header)
    {
        $this->header = $header;
        return $this;
    }

    /**
     * Get a description for the filter
     *
     * @return string
     * @since 2.9.2
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * Set a description for the filter
     *
     * @param $description
     * @return $this
     * @since 2.9.2
     */
    public function setDescription($description)
    {
        $this->description = $description;
        return $this;
    }

    /**
     * @return string
     * @since 2.8.0
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param $type
     * @return $this
     * @since 2.8.0
     */
    public function setType($type)
    {
        $this->type = (string)$type;
        return $this;
    }

    /**
     * @return string
     * @since 2.8.0
     */
    public function getClearType()
    {
        return $this->clearType;
    }

    /**
     * @param $clearType
     * @return $this
     * @since 2.8.0
     */
    public function setClearType($clearType)
    {
        $this->clearType = (string)$clearType;
        return $this;
    }

    /**
     * @return bool
     * @since 2.8.0
     */
    public function getExpanded()
    {
        return $this->expanded;
    }

    /**
     * @param bool $expanded
     * @return $this
     * @since 2.8.0
     */
    public function setExpanded($expanded)
    {
        $this->expanded = (bool)$expanded;
        return $this;
    }

    /**
     * @return array
     * @since 2.8.0
     */
    public function getOptions()
    {
        return $this->options;
    }

    /**
     * Set the options in an associative array by their ids
     * In many cases we access the array by the option's id
     *
     * @param array $options
     * @return $this
     * @since 2.8.0
     */
    public function setOptions(array $options)
    {
        // reset it in case it had previous options set
        $this->options = [];
        /*
         * convert to object
         * @todo create a class for Option and define them properly in the 1st place
         */
        foreach ($options as $key => $option) {
            $option = (object)$option;
            $index = !empty($option->id) ? $option->id : $key;
            $this->options[$index] = $option;
        }
        return $this;
    }

    /**
     * @return array
     * @since 2.8.0
     */
    public function getActiveTree()
    {
        return $this->activeTree;
    }

    /**
     * @param array $activeTree
     * @return $this
     * @since 2.8.0
     */
    public function setActiveTree(array $activeTree)
    {
        $this->activeTree = $activeTree;
        return $this;
    }

    /**
     * @param array $inactive_select_opt
     * @return $this
     * @since 2.8.0
     */
    public function setInactiveSelectedOptions(array $inactive_select_opt)
    {
        $this->inactive_select_opt = $inactive_select_opt;
        return $this;
    }

    /**
     * @return array
     * @since 2.8.0
     */
    public function getInactiveSelectedOptions()
    {
        return $this->inactive_select_opt;
    }

    /**
     * @return bool
     * @since 2.8.0
     */
    public function getSmartSearch()
    {
        return $this->smartSearch;
    }

    /**
     * @param bool $smartSearch
     * @return $this
     * @since 2.8.0
     */
    public function setSmartSearch($smartSearch)
    {
        $this->smartSearch = (bool)$smartSearch;
        return $this;
    }

    /**
     * @return bool
     * @since 2.8.0
     */
    public function getCounter()
    {
        return $this->counter;
    }

    /**
     * @param $counter
     * @return $this
     * @since 2.8.0
     */
    public function setCounter($counter)
    {
        $this->counter = (bool)$counter;
        return $this;
    }
}
