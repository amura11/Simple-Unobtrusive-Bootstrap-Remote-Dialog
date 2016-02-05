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

    RemoteDialog.Show = function(options) {
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
    };

    function handleButtonClickEvent(event) {
        var modal = $(modalId);
        var buttonOptions = parseButtonAttributes($(event.target));

        if(buttonOptions.confirm){
        	showConfirmation(buttonOptions, modal);
        } else if(buttonOptions.confirmAccept){
        	hideConfirmation(buttonOptions, modal);
        } else if(buttonOptions.confirmCancel){
        	hideConfirmation(buttonOptions, modal);
        }
    }

	function hideConfirmation(buttonOptions, modal){
    	var body = modal.find('.modal-body');
        var footer = modal.find('.modal-footer');

        body.find('#confirmation-container').remove();
        footer.find('#confirmation-buttons').remove();
        body.find('*').show();
        footer.find('*').show();
    }

	function showConfirmation(buttonOptions, modal){
    	var body = modal.find('.modal-body');
        var footer = modal.find('.modal-footer');

		var confirmationContainer = body.find('#confirmation-message');
        var confirmationButtons = footer.find('#confirmation-buttons');

        if(confirmationContainer.length ===0){
        	body.find('*').hide();
            confirmationContainer = $(RemoteDialog.confirmMessageTemplate).prependTo(body);
        }

        if(confirmationButtons.length ===0){
        	footer.find('*').hide();
        	confirmationButtons = $(RemoteDialog.confirmButtonsTemplate).appendTo(footer);
        }

        confirmationContainer.find('#confirmation-message').html(buttonOptions.confirmMessage);
        confirmationButtons.find('button[data-confirm-cancel]').html(buttonOptions.confirmCancelText);
        confirmationButtons.find('button[data-confirm-accept]').html(buttonOptions.confirmAcceptText);

        //If the original button had a reload or submit add them to the accept button
        if(buttonOptions.submit || buttonOptions.reload){
        	confirmationButtons
            .find('button[data-confirm-accept]')
            .attr('data-submit-url', buttonOptions.submitUrl)
            .attr('data-reload-url', buttonOptions.reloadUrl)
        }
    }

    function parseButtonAttributes(button) {
        var options = {
            confirm: button.attr('data-confirm'),
            confirmMessage: button.attr('data-confirm-message'),
            confirmAccept: button.attr('data-confirm-accept'),
            confirmAcceptText: button.attr('data-confirm-accept-text'),
            confirmCancel: button.attr('data-confirm-cancel'),
            confirmCancelText: button.attr('data-confirm-cancel-text'),
            reload: button.attr('data-reload'),
            reloadUrl: button.attr('data-reload-url'),
            submit: button.attr('data-submit'),
            submitUrl: button.attr('data-submit-url')
        };

        options.confirm = (options.confirm === undefined ? true : options.confirm) && options.confirmMessage !== undefined;
        options.reload = (options.reload === undefined ? true : options.reload) && options.confirmMessage !== undefined;
        options.submit = (options.submit === undefined ? true : options.submit) && options.confirmMessage !== undefined;

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
        triggerDialogEvent('load');
        $(modalId).modal('show');
    }

    function defaultLoadErrorHandler(jqXHR, textStatus, errorThrown) {
        triggerDialogEvent('load-error', [xhr, ajaxOptions, thrownError]);
    }

    function defaultSubmitHandler(formData, url) {
        $.ajax({
            url: url,
            data: formData,
            method: 'POST',
            success: RemoteDialog.handlers.submitSuccess,
            error: RemoteDialog.handlers.submitError
        });
    }

    function defaultSubmitSuccessHandler(data) {
        var modal = $(modalId);

        triggerDialogEvent('submit');
        modal.modal('hide');
    }

    function defaultSubmitErrorHandler(jqXHR, textStatus, errorThrown) {
        triggerDialogEvent('submit-error', [xhr, ajaxOptions, thrownError]);
    }

    function triggerDialogEvent(eventName, parameters) {
        var modal = $(modalId);
        var target = modal.find('.modal-content');
        var identifier = modal.attr('data-identifier');

        target.trigger(eventName + '.dialog', parameters);
        target.trigger(eventName + '.' + identifier, parameters);
    }

    $(function() {
        init();
        eventHandlers();
    });

})(window.RemoteDialog = window.RemoteDialog || {}, jQuery);
