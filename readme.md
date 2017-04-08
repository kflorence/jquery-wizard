# jQuery.wizard

    $( "form" ).wizard( [ options ] );

This plugin turns a standard HTML form into a wizard by breaking it into a
series of well-defined steps. The purpose of these steps is to better group
related inputs, preventing the user from becoming overwhelmed at the size or
complexity of a form and helping them to better understand the structure of
an unfamiliar form.

## Structure

The basic stucture of the wizard revolves around steps and branches, the
latter being optional. A simple, linear form may only require one branch that
contains all of the steps, whereas a complex form may require the use of
several branches, or even nested branches. The number of steps and branches in
a form is thus left entirely to the developer.

## Navigation

The wizard employs an asynchronous
[finite-state machine](http://en.wikipedia.org/wiki/Finite-state_machine) that
determines how to navigate through itself. This is accomplished by defining
states within the wizard, which are attached to steps, along with their
corresponding action. Steps without states attached will perform the default
action of going to the next step in the current branch.

### States

    <div class="step" data-state="state">

States are attached to steps via the state attribute, as defined by 
`options.stateAttribute`. States can refer to the name of a transition
function, the index of a step or the name of the branch.

### Transitions

    $( "form" ).wizard({
        transitions: {
            gender: function( state, action ) {
                return state.step.find( "[name=gender]" ).val();
            }
        }
    });

Transitions act as a bridge between one state and another. They can be used
to allow custom logic to determine where to go next and should ultimately 
return a step index or branch name in the wizard.

#### Arguments

Transitions are called with the wizard object as the context and these
arguments:

*   **state** _Object_  
    The current state of the wizard.

*   **action** _Function_  
    The action function should be used to pass the result back to the wizard
    in the case that your transition function is asynchronous.

## Options

Options is a map of key/value pairs that can be passed into the plugin as the
first argument upon initialization. The default values are shown below:

	options: {
		animations: {
			show: {
				options: {
					duration: 0
				},
				properties: {
					opacity: "show"
				}
			},
			hide: {
				options: {
					duration: 0
				},
				properties: {
					opacity: "hide"
				}
			}
		},
		backward: ".backward",
		branches: ".branch",
		disabled: false,
		enableSubmit: false,
		forward: ".forward",
		header: ":header:first",
		initialStep: 0,
		stateAttribute: "data-state",
		stepClasses: {
			current: "current",
			exclude: "exclude",
			stop: "stop",
			submit: "submit",
			unidirectional: "unidirectional"
		},
		steps: ".step",
		submit: ":submit",
		transitions: {},
		unidirectional: false,

		/* callbacks */
		afterBackward: null,
		afterDestroy: null,
		afterForward: null,
		afterSelect: null,
		beforeBackward: null,
		beforeDestroy: null,
		beforeForward: null,
		beforeSelect: null,
		create: null
	}

By default the wizard will start on the first step, show and hide steps
instantly, transition to the next step in the same branch as the current step
if no state attribute is present and allow movement forwards and backwards.

*   **animations** _Object_  
    Used to define custom transition animations on step changes. For more
    information, read up on jQuery's [.animate()](http://api.jquery.com/animate)
    function.

    *   **show** _Object_  
        The options and properties that will be used when showing a step.

    *   **hide** _Object_  
        The options and properties that will be used when hiding a step.

*   **backward** _String_  
    A selector string used to indicate which elements to bind the `backward()`
    method to. The method will be triggered on click.

*   **branches** _String_  
    A selector string used to indicate which elements are branches within the
    wizard.

*   **enableSubmit** _Boolean_  
    Whether or not to enable the submit button on all steps.

*   **forward** _String_  
    A selector string used to indicate which elements to bind the `forward()`
    method to. The method will be triggered on click.

*   **header** _String_  
    A selector string used to locate the header of the wizard.

*   **initialStep** _String_, _Number_, _Array_  
    Which step to display after the wizard initializes. Accepts a string
    representing a step or branch ID, a number representing a step index,
    a jQuery object or DOM element representing a step or branch, or an
    array of arguments to be passed to the `select()` method.

*   **stateAttribute** _String_  
    The attribute, applied to steps, that contains the name of a state.

*   **stepClasses** _Object_  
    A map of meaningful step classes. These classes will have an effect on step
    behavior such as enabling or disabling navigation or preventing the step
    from being included in overall progress.

    *   **current** _String_  
        The class to toggle on the currently selected step.

    *   **exclude** _String_  
        If this class is present on a step the step will not be included in the
        progress estimate. This is useful for steps that might contain
        explanitory or introductory text without any inputs.

    *   **stop** _String_  
        If this class is present on a step the forward button will be disabled.

    *   **submit** _String_  
        If this class is present on a step the submit button will be enabled.

    *   **unidirectional** _String_  
        If this class is present on a step the backward button will be
        disabled.

*   **steps** _String_  
    A selector string used to indicate which elements are steps within the
    wizard.

*   **transitions** _Object_  
    A map of keys representing states and their corresponding action methods.

    *   **default** _Function_  
        The default transition to use on steps that contain no state attribute.

*   **unidirectional** _Boolean_  
    Whether or not this wizard should be unidirectional; that is allowing only
    forward movement.

## Events

    $( "form" )
        // Bind on initialization
        .wizard({
            eventHandler: function( event, state ) { ... }
        })
        // Bind at any other time
        .bind( "wizardeventhandler", function( event, state ) { ... });

Event handlers may be passed in on intialization in the options object, or they
can be bound to the wizard at any time using the format _wizardeventname_
(note that it must be in all lowercase).

*   **afterBackward** or _wizardafterbackward_  
    Triggered after the wizard has completed going backwards.

*   **afterDestroy** or _wizardafterdestroy_  
    Triggered after the wizard has been destroyed.

*   **afterForward** or _wizardafterforward_  
    Triggered after the wizard has completed going forwards.

*   **afterSelect** or _wizardafterselect_  
    Triggered after the wizard has completed selecting a new step.

*   **beforeBackward** or _wizardbeforebackward_  
    Triggered before the wizard attempts to move backwards. Returning false
    inside of this method will prevent the move.

*   **beforeDestroy** or _wizardbeforedestroy_  
    Triggered before the wizard is destroyed. Returning false inside of this
    method will prevent the destruction of the wizard.

*   **beforeForward** or _wizardbeforeforward_  
    Triggered before the wizard attempts to move forward. Returning false inside
    of this method will prevent the move.

*   **beforeSelect** or _wizardbeforeselect_  
    Triggered before the wizard attempts to move in any direction. Returning
    false inside of this method will prevent the move.

#### Arguments

Events are called with the wizard element as the context and these arguments:

*   **event** _Object_  
    The [jQuery.Event](http://api.jquery.com/category/events/event-object/)
    object.

*   **state** _Object_  
    An object containing either the current state of the wizard (for _after_
    events) or the state the wizard will be updating to (for _before_ events).
    See the [state](readme.md#state) section for further information.

*   [ **update** ] _Function_
    This function is available on any of the **before** events to allow
    deferred cancellation of events if asynchronous processing is needed.

## Methods

    $( "form" ).wizard( "methodName" [, args ] );

The wizard comes with plenty of public methods to help you navigate and get at
any relevent information you may need.

*   **backward( [ event, howMany ] )** returns _jQuery_  
    Step backward through the wizard.

    *   **event** _Event_  
        The [jQuery.Event](http://api.jquery.com/category/events/event-object/)
        object. Used when the function is called via a trigger or event handler.

    *   **howMany** _Number_  
        How many steps to take backwards. Should be a positive integer greater
        than zero.

*   **branch( [ branch ] )** returns _jQuery_  
    Returns a branch from the wizard. If no arguments are provided, it will
    return the currently active branch.

    *   **branch** _String_  
        The ID of a branch in the wizard.

*   **branches( [ branch ] )** returns _jQuery_  
    Returns several branches in the wizard. If no arguments are provided, it
    will return all of the branches in the wizard.

    *   **branch** _String_  
        The ID of a branch in the wizard. If provided, all of the branches
        within the given branch are returned.

*   **branchesActivated()** returns _jQuery_  
    Returns all of the activated branches in the wizard. An activated branch
    is defined as any branch containing a step that has been visited.

*   **destroy()** returns _jQuery_  
    Completely remove the wizard functionality from the element it was attached
    to. This basically reverts the element to the state it was before the
    wizard was applied to it.

*   **form()** returns _jQuery_  
    Returns the form associated with the wizard.

*   **forward( [ event, howMany ] )** returns _jQuery_  
    Step forward through the wizard.

    *   **event** _Event_  
        The [jQuery.Event](http://api.jquery.com/category/events/event-object/)
        object. Used when the function is called via a trigger or event handler.

    *   **howMany** _Number_  
        How many steps to take forwards. Should be a positive integer greater
        than zero.

*   **isValidStep( step )** returns _Boolean_  
    Returns whether or not a step is valid, or contained within the wizard.

    *   **step** _String_, _Number_, _jQuery_, _Element_  
        The step to check for in the wizard. Can be an element ID, step index,
        jQuery object or DOM element.

*   **isValidStepIndex( stepIndex )** returns _Boolean_  
    Returns whether or not a step index is valid, or contained within the
    wizard.

    *   **stepIndex** _Number_  
        An integer representing the index of a step in the wizard.

*   **select( [ event, ] step [, branch, relative, history ] )** returns _jQuery_  
    Selects a step within the wizard.

    *   **event** _Event_  
        The [jQuery.Event](http://api.jquery.com/category/events/event-object/)
        object. Used when the function is called via a trigger or event handler.

    *   **step** _String_, _Number_, _jQuery_, _Element_  
        A step in the wizard. Can be an element ID, step index, jQuery object
        or DOM element.

    *   **branch** _String_  
        The ID of the branch that contains the step. Useful of searching for a
        step by step index relative to a branch. This parameter may be omitted
        even if further arguments are needed.

    *   **relative** _Boolean_  
        If true, the step argument becomes an integer representing the number
        of steps to move forwards or backwards relative to the current step.
        This parameter may be omitted even if further arguments are needed.

    *   **history** _Boolean_, _Array_  
        Whether or not to track the movements between the current step and the
        destination step. If set to false, the history will not be kept. This
        means that when hitting the back button on the selected step, the user
        will be taken directly back to the step they were on beforehand instead
        of visiting any steps in between. You can specify which steps will be
        included in the history yourself by passing an array of step indexes
        that will override whatever steps the plugin actually takes.

*   **state( [ step, branch, stepsTaken ] )** returns _Object_  
    Returns an object containing the state of the wizard at a certain step, or
    null if the step could not be found. If no arguments are provided, returns
    the current state of the wizard. See the [state](readme.md#state) section
    for further information.

    *   **step** _String_, _Number_, _jQuery_, _Element_  
        A step in the wizard. Can be an element ID, step index, jQuery object
        or DOM element.

    *   **branch** _String_  
        The ID of the branch that contains the step. Useful of searching for a
        step by step index relative to a branch. This parameter may be omitted
        even if further arguments are needed.

    *   **stepsTaken** _Array_  
        An array of step indexes that represent the path taken to get to the
        given step from the current step. This should be provided if tracking
        history for the generation of an accurate state.

*   **step( [ step, branch ] )** returns _jQuery_  
    Returns a step from the wizard. If no arguments are provided, it will
    return the currently selected step in the wizard.

    *   **step** _String_, _Number_, _jQuery_, _Element_  
        A step in the wizard. Can be an element ID, step index, jQuery object
        or DOM element.

    *   **branch** _String_  
        The ID of the branch that contains the step. Useful of searching for a
        step by step index relative to a branch. This parameter may be omitted
        even if further arguments are needed.

*   **stepCount()** returns _Number_  
    Returns the number of steps in the wizard.

*   **stepIndex( [ step, branch, relative ] )** returns _Number_  
    Returns the index of a step in the wizard, or -1 of the step could not be
    found. If no arguments are provided, it will return the index of the
    currently selected step in the wizard.

    *   **branch** _String_  
        The ID of the branch that contains the step. Useful of searching for a
        step by step index relative to a branch. This parameter may be omitted
        even if further arguments are needed.

    *   **relative** _Boolean_  
        If true, the index returned will be relative to its containing branch.

*   **steps( [ branch ] )** returns _jQuery_  
    Returns steps within the wizard. If no arguments are provided, it will
    return all of the steps in the wizard.

    *   **branch** _String_  
        An ID of a branch within the wizard. If this parameter is given, all
        of the steps within the branch will be returned.

*   **stepsActivated()** returns _jQuery_  
    Returns all of the activated steps in the wizard. An activated step is
    defined as one that the user has visited.

*   **submit()** returns _jQuery_  
    Submits the form attached to the wizard.

## State

    {
        branch: [ form#defaultBranch.ui-wizard-form ],
        branchLabel: "defaultBranch",
        branchStepCount: 3,
        branchesActivated: [ "defaultBranch" ],
        isFirstStep: true,
        isFirstStepInBranch: true,
        isLastStep: false,
        isLastStepInBranch: false,
        isMovingForward: false,
        percentComplete: 0,
        step: [ div.step ],
        stepIndex: 0,
        stepIndexInBranch: 0,
        stepsActivated: [ 0 ],
        stepsComplete: 0,
        stepsPossible: 2,
        stepsRemaining: 2
    }

The wizard keeps track of its current state using an object map of keys and
values. This map can be accessed at any time via the `state()` method. It is
also passed in as the second argument to event handlers. The keys and their
values are outlined below.

*   **branch** _jQuery_  
    The branch the wizard is currently on.

*   **branchLabel** _String_  
    The label, or ID, of the currently active branch.

*   **branchStepCount** _Number_  
    The total number of steps in the current branch.

*   **branchesActivated** _Array_  
    An array containing all of the currently activated branch labels.

*   **isFirstStep** _Boolean_  
    Whether or not the current step is the first step in the wizard.

*   **isFirstStepInBranch** _Boolean_  
    Whether or not the current step is the first step in its containing branch.

*   **isLastStep** _Boolean_  
    Whether or not the current step is the last step in the wizard.

*   **isLastStepInBranch** _Boolean_  
    Whether or not the current step is the last step in its containing branch.

*   **isMovingForward** _Boolean_  
    Whether or not the wizard is progressing forward, that is that the current
    step index is greater than the previous step index.

*   **percentComplete** _Number_  
    A number representing the _estimated_ percent of completion of the wizard.
    This is a numerical value between 0 and 100.

*   **step** _jQuery_  
    The step the wizard is currently on.

*   **stepIndex** _Number_  
    The index of the currently active step.

*   **stepIndexInBranch** _Number_  
    The index of the currently active step relative to its containing branch.

*   **stepsActivated** _Array_  
    An array containing all of the currently activated step indexes.

*   **stepsComplete** _Number_  
    The number of steps in the wizard that the user has completed. These steps
    will be contained in the _stepsActivated_ array, minus any steps the
    developer has decided to exclude.

*   **stepsPossible** _Number_  
    The _estimated_ number of steps the user could possibly activate. This is
    calculated by counting all of the steps in every branch the user has
    activated, minus any steps the developer has decided to exclude.

*   **stepsRemaining** _Number_  
    The _estimated_ difference between _stepsComplete_ and _stepsPossible_.
	
## Installation

The easiest way to install is via [NPM](http://npmjs.org):

    npm install @kflorence/jquery-wizard

Or [Bower](http://bower.io):

    bower install jquery-wizard

You can also [download releases](https://github.com/kflorence/jquery-wizard/releases)
directly from github. The latest uncompressed version is available here:

* [jquery.wizard.js](https://raw.githubusercontent.com/kflorence/jquery-wizard/master/src/jquery.wizard.js)

## Requirements

*   **[jQuery](http://jquery.com/)**  
    Versions 1.6.0 or higher.

*   **[jQuery UI](http://jqueryui.com/)**  
    Core and Widget, versions 1.9.0 or higher.

## Compabitility

Tested and verified to work on the following browsers:

*   **[Internet Explorer](http://windows.microsoft.com/en-US/internet-explorer/products/ie/home)**  
    Versions 6.0 and higher.

*   **[Mozilla Firefox](http://www.mozilla.com/en-US/firefox/new/)**  
    Versions 3.0 and higher.

*   **[Google Chrome](http://www.google.com/chrome/)**  
    Versions 7.0 and higher.

Found a bug? [Submit an issue](https://github.com/kflorence/jquery-wizard/issues).
Tested in another browser? [Send me a message](https://github.com/inbox/new/kflorence) or
fork this project and add the browser to this readme.

## Integration

This plugin has been designed to integrate well with the following plugins:

*   **[jQuery Form](https://github.com/malsup/form)**  
    AJAX form submission capabilities.

*   **[jQuery Validation](https://github.com/jzaefferer/jquery-validation)**  
    Form input validation which can prevent step changing or submission.

*   **[jQuery Autosave](https://github.com/nervetattoo/jquery-autosave)**  
    Automatic form submission based on user-defined criteria.

*   **[jQuery Masked Input](https://github.com/digitalBush/jquery.maskedinput)**  
    Ensures properly formatted form input data.

## License

Copyright (c) 2017 Kyle Florence  
Dual licensed under the MIT and GPLv2 licenses.
