# jQuery.ui.wizard

    $( "form" ).wizard( [ options ] );

This plugin turns a standard HTML form into a wizard by breaking it into a
series of well-defined steps. The purpose of these steps is to better group
related inputs, preventing the user from becoming overwhelmed at the size or
complexity of a form and helping them to better understand the structure of
an unfamiliar form.

### Structure

The basic stucture of the wizard revolves around steps and branches, the
latter being optional. A simple, linear form may only require one branch that
contains all of the steps, whereas a complex form may require the use of
several branches, or even nested branches. The number of steps and branches in
a form is thus left entirely to the developer.

### Navigation

The wizard employs an asynchronous
[finite-state machine](http://en.wikipedia.org/wiki/Finite-state_machine) that
determines how to navigate through itself. This is accomplished by defining
states within the wizard, which are attached to steps, along with their
corresponding actions, which are user-defined functions that should return the
name of a state, the index of a step or the name of a branch. Steps without any
state attached to them will perform the default action, which is to go to the
next step in the current branch, by default.


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
        transitions: {
            default: function( step ) {
                return this.stepIndex( step.nextAll( selector.step ) );
            }
        },
        unidirectional: false
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

*   **initialStep** _String_, _Number_  
    Which step to display after the wizard initializes.

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

*   **afterForward** or _wizardafterforward_  
    Triggered after the wizard has completed going forwards.

*   **afterSelect** or _wizardafterselect_  
    Triggered after the wizard has completed selecting a new step.

*   **beforeBackward** or _wizardbeforebackward_  
    Triggered before the wizard attempts to move backwards. Returning false
    inside of this method will prevent the move.

*   **beforeForward** or _wizardbeforeforward_  
    Triggered before the wizard attempts to move forward. Returning false inside
    of this method will prevent the move.

*   **beforeSelect** or _wizardbeforeselect_  
    Triggered before the wizard attempts to move in any direction. Returning
    false inside of this method will prevent the move.

### Arguments

Every event is called with the same two arguments:

*   **event** _Object_  
    The [jQuery.Event](http://api.jquery.com/category/events/event-object/)
    object.

*   **state** _Object_  
    An object containing either the current state of the wizard (for _after_
    events) or the state the wizard will be updating to (for _before_ events).


## Methods



## Requirements

*   **[jQuery](http://jquery.com/)**  
    Versions 1.3.2 or higher.

*   **[jQuery UI](http://jqueryui.com/)**  
    Core and Widget, versions 1.7.3 or higher.

## Compabitility

Testing is still underway.

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

Copyright (c) 2011 Kyle Florence  
Dual licensed under the MIT and GPLv2 licenses.
