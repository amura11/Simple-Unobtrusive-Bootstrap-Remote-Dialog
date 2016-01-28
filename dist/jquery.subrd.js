/**
 * Simple-Unobtrusive-Bootstrap-Remote-Dialog - A simple and lightweight library to provide a Booststrap based modal with remotely loaded content
 * @version v0.1.0
 * @link https://github.com/amura11/Simple-Unobtrusive-Bootstrap-Remote-Dialog
 * @license MIT
 */
(function(RemoteDialog, $, undefined) {
    var modalId = '#remote-dialog-modal';

    defaults = {
        identifier: null,
        url: null,
        parser: defaultParser
    };

    // jshint multistr:true
    RemoteDialog.template = '\
        <div id="remote-dialog-modal" class="modal fade"> \
            <div class="modal-dialog"> \
                <div class="modal-content"> \
                </div> \
            </div> \
		</div> ';

    function init() {
        var dialog = $(modalId);

        //Create the message box if it doesn't exist
        if (dialog.length === 0) {
            dialog = $(RemoteDialog.template).appendTo(document.body);
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

        //Show/Hide events
        $('body').on('shown.bs.modal', modalId, triggerDialogEvent.bind(null, 'shown'));
        $('body').on('hidden.bs.modal', modalId, triggerDialogEvent.bind(null, 'hidden'));

        //Button events
        $('body').on('click', modalId + ' button', function(event) {
            triggerDialogEvent($(event.target).attr('id'));
        });
    }

    RemoteDialog.Show = function(options) {
        var modal = $(modalId);
        var content = modal.find('.modal-content');

        var settings = $.extend(defaults, options);

        if (!settings.url || !settings.identifier) {
            throw "Message and Identifier must be specified";
        }

        //Set the identifier
        modal.attr('data-identifier', settings.identifier);

        //Load the conent
        $.ajax({
            type: 'POST',
            url: settings.url,
            data: {
                html: blah
            },
            success: function(result) {
                content.html(settings.parser(result));
                modal.modal('show');
            },
            error: function(xhr, ajaxOptions, thrownError) {
                triggerDialogEvent('error', [xhr, ajaxOptions, thrownError]);
            }
        });
    };

    function defaultParser(data) {
        return data;
    }

    function triggerDialogEvent(eventName, parameters) {
        var modal = $(modalId);
        var identifier = modal.attr('data-identifier');

        modal.trigger(eventName + '.dialog.' + identifier, parameters);
    }

    $(function() {
        init();
        eventHandlers();
    });

})(window.RemoteDialog = window.RemoteDialog || {}, jQuery);
