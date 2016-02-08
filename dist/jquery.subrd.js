/**
 * Simple-Unobtrusive-Bootstrap-Remote-Dialog - A simple and lightweight library to provide a Booststrap based modal with remotely loaded content
 * @version v1.0.0
 * @link https://github.com/amura11/Simple-Unobtrusive-Bootstrap-Remote-Dialog
 * @license MIT
 */
(function($) {
    $.fn.serializeFormJSON = function() {

        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
})(jQuery);

(function(RemoteDialog, $, undefined) {
    var modalId = '#remote-dialog-modal';

    RemoteDialog.handlers = {
        load: defaultLoadHandler,
        loadSuccess: defaultLoadSuccessHandler,
        loadError: defaultLoadErrorHandler,
        submit: defaultSubmitHandler,
        submitSuccess: defaultSubmitSuccessHandler,
        submitError: defaultSubmitErrorHandler
    };

    RemoteDialog.defaults = {
        identifier: null,
        url: null
    };

    RemoteDialog.Show = showDialog;
    RemoteDialog.Hide = hideDialog;

    // jshint multistr:true
    RemoteDialog.modalTemplate = '\
        <div id="remote-dialog-modal" class="modal fade"> \
            <div class="modal-dialog"> \
                <div class="modal-content"> \
                </div> \
            </div> \
		</div> ';

    // jshint multistr:true
    RemoteDialog.confirmMessageTemplate = '\
    <div id="confirmation-container"> \
        	<div class="alert alert-warning" role="alert"> \
        		<p id="confirmation-message"></p> \
            </div> \
        </div> ';

    // jshint multistr:true
    RemoteDialog.confirmButtonsTemplate = '\
    <div id="confirmation-buttons"> \
    	<button type="button" class="btn" data-confirm-accept="true"></button> \
        <button type="button" class="btn btn-danger" data-confirm-cancel="true"></button> \
    </div> ';

    function init() {
        var dialog = $(modalId);

        //Create the message box if it doesn't exist
        if (dialog.length === 0) {
            dialog = $(RemoteDialog.modalTemplate).appendTo(document.body);
        }

        dialog.modal({
            backdrop: 'static',
            keyboard: false,
            show: false
        });
    }

    function eventHandlers() {
        $('body').on('click', '[data-toggle="remote-dialog"]', function(event) {
            var element = $(event.target);

            RemoteDialog.Show({
                identifier: element.attr('data-identifier'),
                url: element.attr('data-url')
            });
        });

        $('body').on('click', modalId + ' .modal-footer button', handleButtonClickEvent);

        //Show/Hide events
        $('body').on('shown.bs.modal', modalId, triggerDialogEvent.bind(null, 'shown'));
        $('body').on('hidden.bs.modal', modalId, triggerDialogEvent.bind(null, 'hidden'));
    }

    function showDialog(options) {
        var modal = $(modalId);
        var content = modal.find('.modal-content');
        var settings = $.extend(RemoteDialog.defaults, options);

        if (!settings.url || !settings.identifier) {
            throw "Url and Identifier must be specified";
        }

        //Set the identifier
        modal.attr('data-identifier', settings.identifier);
        content.attr('id', settings.identifier);

        //Load the conent
        RemoteDialog.handlers.load(settings.url);
    }

    function hideDialog() {
        var modal = $(modalId);
        var content = modal.find('.modal-content');

        content.empty();
        content.removeAttr('id');

        modal.modal('hide');
    }

    function handleButtonClickEvent(event) {
        var modal = $(modalId);
        var buttonOptions = parseButtonAttributes($(event.target));

        if (buttonOptions.confirm) {
            showConfirmation(buttonOptions, modal);
        } else if (buttonOptions.confirmAccept) {
            confirmAcceptClickEvent(buttonOptions, modal);
        } else if (buttonOptions.confirmCancel) {
            confirmCancelClickEvent(buttonOptions, modal);
        } else if (buttonOptions.submit){
            submitDialogClickEvent(buttonOptions, modal);
        } else if (buttonOptions.reload){
            reloadDialogClickEvent(buttonOptions, modal);
        }
    }

    function confirmCancelClickEvent(buttonOptions, modal) {
        triggerDialogEvent('confirm-cancel');
        hideConfirmation(buttonOptions, modal);
    }

    function confirmAcceptClickEvent(buttonOptions, modal) {
        triggerDialogEvent('confirm-accept');

        if (!buttonOptions.autoDismiss)
            hideConfirmation(buttonOptions, modal);

        if (buttonOptions.submit) {
            submitDialog(buttonOptions, modal);
        } else {
            if (buttonOptions.autoDismiss)
                hideDialog();
        }
    }

    function submitDialogClickEvent(buttonOptions, modal){
        submitDialog(buttonOptions, modal);
    }

    function reloadDialogClickEvent(buttonOptions, modal){
        RemoteDialog.handlers.load(options.reloadUrl);
    }

    function hideConfirmation(buttonOptions, modal) {
        var body = modal.find('.modal-body');
        var footer = modal.find('.modal-footer');

        body.find('#confirmation-container').remove();
        footer.find('#confirmation-buttons').remove();
        body.find('*').show();
        footer.find('*').show();
    }

    function showConfirmation(buttonOptions, modal) {
        var body = modal.find('.modal-body');
        var footer = modal.find('.modal-footer');
        var bodyHeight = body.innerHeight();

        var confirmationContainer = body.find('#confirmation-message');
        var confirmationButtons = footer.find('#confirmation-buttons');

        //If the container isn't on the page, add it (so we don't add it more than once)
        if (confirmationContainer.length === 0) {
            body.find('*').hide();
            confirmationContainer = $(RemoteDialog.confirmMessageTemplate).prependTo(body);
            body.css({
                'min-height': bodyHeight + "px"
            });
        }

        //If the buttons aren't on the page, add it (so we don't add it more than once)
        if (confirmationButtons.length === 0) {
            footer.find('*').hide();
            confirmationButtons = $(RemoteDialog.confirmButtonsTemplate).appendTo(footer);
        }

        //Set the message and buttons
        confirmationContainer.find('#confirmation-message').html(buttonOptions.confirmMessage);
        confirmationButtons.find('button[data-confirm-cancel]').html(buttonOptions.confirmCancelText);
        confirmationButtons.find('button[data-confirm-accept]').html(buttonOptions.confirmAcceptText);

        //If the original button had a reload or submit add them to the accept button
        if (buttonOptions.submit || buttonOptions.reload) {
            confirmationButtons
                .find('button[data-confirm-accept]')
                .data('submitUrl', buttonOptions.submitUrl)
                .data('reloadUrl', buttonOptions.reloadUrl);
        }

        //Add the auto dismiss to the accept button
        confirmationButtons
            .find('button[data-confirm-accept]')
            .data('autoDismiss', buttonOptions.autoDismiss);
    }

    function submitDialog(buttonOptions, modal) {
        var form = modal.find('.modal-body form');

        var formData = form.length > 0 ? form.serializeFormJSON() : undefined;

        RemoteDialog.handlers.submit(formData, buttonOptions);
    }

    function parseButtonAttributes(button) {
        var options = button.data();

        //Set the boolean values to true or false
        options.confirm = (options.confirm === undefined ? true : options.confirm) && options.confirmMessage !== undefined;
        options.reload = (options.reload === undefined ? true : options.reload) && options.reloadUrl !== undefined;
        options.submit = (options.submit === undefined ? true : options.submit) && options.submitUrl !== undefined;
        options.autoDismiss = (options.autoDismiss === undefined ? false : options.autoDismiss);

        return options;
    }

    function defaultLoadHandler(url) {
        $.ajax({
            type: 'GET',
            url: url,
            success: RemoteDialog.handlers.loadSuccess,
            error: RemoteDialog.handlers.loadError
        });
    }

    function defaultLoadSuccessHandler(data) {
        var modal = $(modalId);
        var content = modal.find('.modal-content');

        content.html(data);
        triggerDialogEvent('loaded');
        $(modalId).modal('show');
    }

    function defaultLoadErrorHandler(jqXHR, textStatus, errorThrown) {
        triggerDialogEvent('load-error', [xhr, ajaxOptions, thrownError]);
    }

    function defaultSubmitHandler(formData, buttonOptions) {
        $.ajax({
            url: buttonOptions.submitUrl,
            data: formData,
            method: 'POST',
            success: RemoteDialog.handlers.submitSuccess,
            error: RemoteDialog.handlers.submitError,
            reload: buttonOptions.reload,
            reloadUrl: buttonOptions.reloadUrl,
            autoDismiss: buttonOptions.autoDismiss
        });
    }

    function defaultSubmitSuccessHandler(data) {
        var modal = $(modalId);
        var options = this;
        triggerDialogEvent('submit');

        if (options.reload) {
            RemoteDialog.handlers.load(options.reloadUrl);
        } else if (options.autoDismiss) {
            modal.modal('hide');
        }
    }

    function defaultSubmitErrorHandler(jqXHR, textStatus, errorThrown) {
        triggerDialogEvent('submit_error', [xhr, ajaxOptions, thrownError]);
    }

    function triggerDialogEvent(eventName, parameters) {
        var modal = $(modalId);
        var target = modal.find('.modal-content');
        var identifier = modal.attr('data-identifier');

        target.trigger(eventName + '.dialog');
    }

    $(function() {
        init();
        eventHandlers();
    });

})(window.RemoteDialog = window.RemoteDialog || {}, jQuery);
